import { NextRequest, NextResponse } from 'next/server';

/**
 * Public payment-provider webhook.
 * This route is deliberately excluded from user-session middleware.
 * Authentication is provider-specific and must fail closed in production.
 */
export async function POST(req: NextRequest) {
  const expectedToken = process.env.TOKEN_WEBHOOK_EFI;
  if (!expectedToken) {
    console.error('[Webhook/Efí] TOKEN_WEBHOOK_EFI is not configured.');
    return NextResponse.json({ error: 'Webhook authentication is not configured.' }, { status: 503 });
  }

  const suppliedToken = req.headers.get('x-webhook-token') || req.nextUrl.searchParams.get('token');
  if (!suppliedToken || suppliedToken !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized webhook.' }, { status: 401 });
  }

  try {
    const payload = await req.json();

    // TODO(next economic milestone): persist a provider event id and process it idempotently.
    // Do not credit an account from this route until signature/replay verification and
    // transactional billing reconciliation are connected.
    console.log('[Webhook/Efí] Provider event received:', {
      hasPix: Array.isArray(payload?.pix),
      hasCharge: Boolean(payload?.charge),
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Webhook/Efí] Invalid webhook payload:', error);
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint is active.' }, { status: 200 });
}
