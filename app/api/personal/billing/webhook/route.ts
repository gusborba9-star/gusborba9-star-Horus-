import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { getServiceSupabase } from '@/lib/supabase';
import { paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { notification?: unknown };
    const token = typeof body.notification === 'string' ? body.notification : '';
    if (!token) return NextResponse.json({ success: false, error: 'EFI_NOTIFICATION_TOKEN_REQUIRED' }, { status: 400 });

    const events = await paymentService.getNotification(token);
    if (!events.length) return NextResponse.json({ success: true, processed: false });

    const latestBySubscription = new Map<string, (typeof events)[number]>();
    for (const event of events) {
      const subscriptionId = event.identifiers?.subscription_id;
      if (subscriptionId) latestBySubscription.set(String(subscriptionId), event);
    }

    const service = getServiceSupabase();
    let processed = 0;
    for (const event of latestBySubscription.values()) {
      const subscriptionId = event.identifiers?.subscription_id;
      if (!subscriptionId) continue;
      const eventId = `efi:${token}:${event.id}`;
      const payloadHash = createHash('sha256').update(JSON.stringify(event)).digest('hex');

      const existing = await service.from('horus_webhook_events').select('id,status').eq('provider', 'efi').eq('event_id', eventId).maybeSingle();
      if (existing.data) continue;

      const inserted = await service.from('horus_webhook_events').insert({
        provider: 'efi',
        event_id: eventId,
        payload_hash: payloadHash,
        status: 'RECEIVED',
        received_at: new Date().toISOString(),
      });
      if (inserted.error) throw new Error(`EFI_WEBHOOK_EVENT_INSERT_FAILED:${inserted.error.message}`);

      const current = event.status?.current;
      const nextStatus = current === 'active'
        ? 'ACTIVE'
        : current === 'canceled'
          ? 'CANCELED'
          : current === 'expired'
            ? 'EXPIRED'
            : current === 'unpaid'
              ? 'PAST_DUE'
              : null;
      if (!nextStatus) continue;

      const updated = await service
        .from('personal_subscriptions')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('external_subscription_id', String(subscriptionId));
      if (updated.error) throw new Error(`PERSONAL_BILLING_RECONCILIATION_FAILED:${updated.error.message}`);

      const completed = await service
        .from('horus_webhook_events')
        .update({ status: 'PROCESSED', processed_at: new Date().toISOString() })
        .eq('provider', 'efi')
        .eq('event_id', eventId);
      if (completed.error) throw new Error(`EFI_WEBHOOK_EVENT_FINALIZE_FAILED:${completed.error.message}`);
      processed += 1;
    }

    return NextResponse.json({ success: true, processed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'EFI_WEBHOOK_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
