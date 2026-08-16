import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

const PAID_STATES = new Set(['paid', 'settled']);
const FAILED_STATES = new Set(['canceled', 'expired', 'unpaid']);

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { notification?: unknown };
    const token = typeof body.notification === 'string' ? body.notification : '';
    if (!token || token.length > 256) return NextResponse.json({ success: false, error: 'EFI_NOTIFICATION_TOKEN_REQUIRED' }, { status: 400 });

    const events = await paymentService.getNotification(token);
    if (!events.length) return NextResponse.json({ success: true, processed: false });

    const latest = events[events.length - 1];
    const chargeId = latest.identifiers?.charge_id;
    const customId = latest.custom_id ?? undefined;
    if (!chargeId && !customId) return NextResponse.json({ success: false, error: 'EFI_STUDIO_PAYMENT_IDENTITY_MISSING' }, { status: 422 });

    const eventId = `efi:studio:${token}:${latest.id}`;
    const payloadHash = createHash('sha256').update(JSON.stringify(latest)).digest('hex');
    const service = getServiceSupabase();

    const { data: existingEvent, error: existingEventError } = await service
      .from('horus_webhook_events')
      .select('id,status')
      .eq('provider', 'efi')
      .eq('event_id', eventId)
      .maybeSingle();
    if (existingEventError) throw new Error(`EFI_WEBHOOK_EVENT_LOOKUP_FAILED:${existingEventError.message}`);
    if (existingEvent) return NextResponse.json({ success: true, processed: false, duplicate: true });

    const { error: insertEventError } = await service.from('horus_webhook_events').insert({
      provider: 'efi',
      event_id: eventId,
      payload_hash: payloadHash,
      status: 'RECEIVED',
      received_at: new Date().toISOString(),
    });
    if (insertEventError) {
      const duplicate = await service.from('horus_webhook_events').select('id').eq('provider', 'efi').eq('event_id', eventId).maybeSingle();
      if (duplicate.data) return NextResponse.json({ success: true, processed: false, duplicate: true });
      throw new Error(`EFI_WEBHOOK_EVENT_INSERT_FAILED:${insertEventError.message}`);
    }

    let query = service
      .from('studio_project_payments')
      .select('id,project_id,revision_id,charge_id,custom_id,status,efi_status,paid_at')
      .limit(1);
    query = chargeId ? query.eq('charge_id', String(chargeId)) : query.eq('custom_id', customId as string);
    const { data: payment, error: paymentError } = await query.maybeSingle();
    if (paymentError) throw new Error(`STUDIO_PAYMENT_LOOKUP_FAILED:${paymentError.message}`);
    if (!payment) {
      await service.from('horus_webhook_events').update({ status: 'REJECTED', processed_at: new Date().toISOString() }).eq('provider', 'efi').eq('event_id', eventId);
      return NextResponse.json({ success: false, error: 'EFI_STUDIO_CHARGE_UNKNOWN' }, { status: 422 });
    }
    if (chargeId && String(payment.charge_id) !== String(chargeId)) {
      await service.from('horus_webhook_events').update({ status: 'REJECTED', processed_at: new Date().toISOString() }).eq('provider', 'efi').eq('event_id', eventId);
      return NextResponse.json({ success: false, error: 'EFI_STUDIO_CHARGE_ID_MISMATCH' }, { status: 422 });
    }
    if (customId && payment.custom_id !== customId) {
      await service.from('horus_webhook_events').update({ status: 'REJECTED', processed_at: new Date().toISOString() }).eq('provider', 'efi').eq('event_id', eventId);
      return NextResponse.json({ success: false, error: 'EFI_STUDIO_CUSTOM_ID_MISMATCH' }, { status: 422 });
    }

    const current = latest.status?.current ?? '';
    const nextStatus = PAID_STATES.has(current) ? 'PAID' : FAILED_STATES.has(current) ? 'FAILED' : 'AWAITING_PAYMENT';
    const update: Record<string, unknown> = { efi_status: current || payment.efi_status || 'link', updated_at: new Date().toISOString() };
    if (nextStatus === 'PAID' && payment.status !== 'PAID') { update.status = 'PAID'; update.paid_at = new Date().toISOString(); }
    else if (nextStatus === 'FAILED' && payment.status !== 'PAID') update.status = 'FAILED';
    else if (payment.status !== 'PAID') update.status = 'AWAITING_PAYMENT';

    const { error: paymentUpdateError } = await service.from('studio_project_payments').update(update).eq('id', payment.id);
    if (paymentUpdateError) throw new Error(`STUDIO_PAYMENT_UPDATE_FAILED:${paymentUpdateError.message}`);

    await service.from('horus_webhook_events').update({ status: 'PROCESSED', processed_at: new Date().toISOString() }).eq('provider', 'efi').eq('event_id', eventId);
    return NextResponse.json({ success: true, processed: true, status: nextStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'EFI_STUDIO_WEBHOOK_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
