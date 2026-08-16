import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { getServiceSupabase } from '@/lib/supabase';
import { paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

const PAID_STATES = new Set(['paid', 'settled']);
const FAILED_STATES = new Set(['canceled', 'expired', 'unpaid']);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { notification?: unknown };
    const token = typeof body.notification === 'string' ? body.notification : '';
    if (!token) return NextResponse.json({ success: false, error: 'EFI_NOTIFICATION_TOKEN_REQUIRED' }, { status: 400 });

    const events = await paymentService.getNotification(token);
    if (!events.length) return NextResponse.json({ success: true, processed: false });
    const service = getServiceSupabase();
    const latest = events[events.length - 1];
    const chargeId = latest.identifiers?.charge_id;
    const customId = latest.custom_id ?? undefined;
    if (!chargeId && !customId) return NextResponse.json({ success: false, error: 'EFI_STUDIO_PAYMENT_IDENTITY_MISSING' }, { status: 422 });

    const eventId = `efi:studio:${token}:${latest.id}`;
    const payloadHash = createHash('sha256').update(JSON.stringify(latest)).digest('hex');
    const existing = await service.from('horus_webhook_events').select('id,status').eq('provider', 'efi').eq('event_id', eventId).maybeSingle();
    if (existing.data) return NextResponse.json({ success: true, processed: false, duplicate: true });

    const inserted = await service.from('horus_webhook_events').insert({
      provider: 'efi',
      event_id: eventId,
      payload_hash: payloadHash,
      status: 'RECEIVED',
      received_at: new Date().toISOString(),
    });
    if (inserted.error) throw new Error(`EFI_WEBHOOK_EVENT_INSERT_FAILED:${inserted.error.message}`);

    let query = service.from('studio_project_payments').select('id, project_id, charge_id, custom_id, status').limit(1);
    query = chargeId ? query.eq('charge_id', String(chargeId)) : query.eq('custom_id', customId as string);
    const { data: payment, error: paymentError } = await query.maybeSingle();
    if (paymentError) throw new Error(`STUDIO_PAYMENT_LOOKUP_FAILED:${paymentError.message}`);
    if (!payment) {
      await service.from('horus_webhook_events').update({ status: 'REJECTED', processed_at: new Date().toISOString() }).eq('provider', 'efi').eq('event_id', eventId);
      return NextResponse.json({ success: false, error: 'EFI_STUDIO_CHARGE_UNKNOWN' }, { status: 422 });
    }
    if (customId && payment.custom_id !== customId) {
      await service.from('horus_webhook_events').update({ status: 'REJECTED', processed_at: new Date().toISOString() }).eq('provider', 'efi').eq('event_id', eventId);
      return NextResponse.json({ success: false, error: 'EFI_STUDIO_CUSTOM_ID_MISMATCH' }, { status: 422 });
    }
    if (chargeId && String(payment.charge_id) !== String(chargeId)) {
      await service.from('horus_webhook_events').update({ status: 'REJECTED', processed_at: new Date().toISOString() }).eq('provider', 'efi').eq('event_id', eventId);
      return NextResponse.json({ success: false, error: 'EFI_STUDIO_CHARGE_ID_MISMATCH' }, { status: 422 });
    }

    const current = latest.status?.current ?? '';
    const nextStatus = PAID_STATES.has(current) ? 'PAID' : FAILED_STATES.has(current) ? 'FAILED' : 'AWAITING_PAYMENT';
    if (payment.status !== 'PAID' || nextStatus === 'PAID') {
      const update: Record<string, unknown> = {
        status: nextStatus,
        efi_status: current || 'link',
        updated_at: new Date().toISOString(),
        ...(nextStatus === 'PAID' ? { paid_at: new Date().toISOString() } : {}),
      };
      const updated = await service.from('studio_project_payments').update(update).eq('id', payment.id);
      if (updated.error) throw new Error(`STUDIO_PAYMENT_UPDATE_FAILED:${updated.error.message}`);
      if (nextStatus === 'PAID') {
        const projectUpdated = await service.from('studio_projects').update({ status: 'PAID', updated_at: new Date().toISOString() }).eq('id', payment.project_id);
        if (projectUpdated.error) throw new Error(`STUDIO_PROJECT_PAYMENT_STATE_FAILED:${projectUpdated.error.message}`);
      }
    }

    const completed = await service.from('horus_webhook_events').update({ status: 'PROCESSED', processed_at: new Date().toISOString() }).eq('provider', 'efi').eq('event_id', eventId);
    if (completed.error) throw new Error(`EFI_WEBHOOK_EVENT_FINALIZE_FAILED:${completed.error.message}`);
    return NextResponse.json({ success: true, processed: true, status: nextStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'EFI_STUDIO_WEBHOOK_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
