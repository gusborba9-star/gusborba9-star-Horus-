import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

function constantTimeTokenMatch(expected: string, supplied: string): boolean {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const suppliedBuffer = Buffer.from(supplied, 'utf8');
  if (expectedBuffer.length !== suppliedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, suppliedBuffer);
}

/**
 * Public payment-provider webhook ingress.
 * Authentication is provider-specific and fails closed in production.
 * The route is intentionally side-effect free until a verified billing mutation contract exists.
 */
export async function POST(req: NextRequest) {
  const expectedToken = process.env.TOKEN_WEBHOOK_EFI;
  if (!expectedToken) {
    console.error('[Webhook/Efí] webhook credential is not configured.');
    return NextResponse.json({ success: false, error: 'WEBHOOK_AUTH_NOT_CONFIGURED' }, { status: 503 });
  }

  const suppliedToken = req.headers.get('x-webhook-token');
  if (!suppliedToken || !constantTimeTokenMatch(expectedToken, suppliedToken)) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED_WEBHOOK' }, { status: 401 });
  }

  const eventId = req.headers.get('x-webhook-event-id')?.trim();
  if (!eventId || eventId.length > 256) {
    return NextResponse.json({ success: false, error: 'WEBHOOK_EVENT_ID_REQUIRED' }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    if (!rawBody || rawBody.length > 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'INVALID_WEBHOOK_PAYLOAD' }, { status: 400 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'INVALID_WEBHOOK_PAYLOAD' }, { status: 400 });
    }

    const payloadHash = createHash('sha256').update(rawBody).digest('hex');
    const supabase = getServiceSupabase();
    const { data: existing, error: existingError } = await supabase
      .from('horus_webhook_events')
      .select('id,payload_hash,status')
      .eq('provider', 'EFI')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingError) {
      console.error('[Webhook/Efí] event lookup failed:', existingError.message);
      return NextResponse.json({ success: false, error: 'WEBHOOK_EVENT_LOOKUP_FAILED' }, { status: 500 });
    }

    if (existing) {
      if (existing.payload_hash !== payloadHash) {
        return NextResponse.json({ success: false, error: 'WEBHOOK_EVENT_ID_REUSE' }, { status: 409 });
      }
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    const { error: insertError } = await supabase.from('horus_webhook_events').insert({
      provider: 'EFI',
      event_id: eventId,
      payload_hash: payloadHash,
      status: 'RECEIVED',
    });

    if (insertError) {
      if (insertError.code === '23505') return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
      console.error('[Webhook/Efí] event persistence failed:', insertError.message);
      return NextResponse.json({ success: false, error: 'WEBHOOK_EVENT_PERSISTENCE_FAILED' }, { status: 500 });
    }

    console.log('[Webhook/Efí] verified provider event received:', {
      event_id: eventId,
      hasPix: Array.isArray((payload as { pix?: unknown[] } | null)?.pix),
      hasCharge: Boolean((payload as { charge?: unknown } | null)?.charge),
    });

    return NextResponse.json({ received: true, duplicate: false }, { status: 200 });
  } catch (error) {
    console.error('[Webhook/Efí] processing error:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ success: false, error: 'WEBHOOK_PROCESSING_FAILED' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405, headers: { Allow: 'POST' } });
}
