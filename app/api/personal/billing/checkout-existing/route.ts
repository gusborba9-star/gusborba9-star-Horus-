import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { EfiApiError, paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

type SafeCheckout = {
  payment_url: string | null;
  charge_id: string;
  subscription_id: string | null;
  plan_id: number | null;
  value: number | null;
  status: string | null;
  expire_at: string | null;
  periodicity: unknown;
  payment_methods: unknown;
};

function safePeriodicity(settings: Record<string, unknown> | undefined): unknown {
  if (!settings) return null;
  return settings.recurrence ?? settings.periodicity ?? settings.interval ?? null;
}

function safePaymentMethods(settings: Record<string, unknown> | undefined): unknown {
  if (!settings) return null;
  return settings.payment_method ?? settings.payment_methods ?? settings.payment_methods_allowed ?? null;
}

function sanitizeCharge(charge: Awaited<ReturnType<typeof paymentService.getCharge>>): SafeCheckout {
  return {
    payment_url: typeof charge.payment_url === 'string' ? charge.payment_url : null,
    charge_id: String(charge.id),
    subscription_id: charge.subscription_id == null ? null : String(charge.subscription_id),
    plan_id: charge.plan_id == null ? null : Number(charge.plan_id),
    value: charge.total == null ? null : Number(charge.total),
    status: typeof charge.status === 'string' ? charge.status : null,
    expire_at: typeof charge.expire_at === 'string' ? charge.expire_at : null,
    periodicity: safePeriodicity(charge.settings),
    payment_methods: safePaymentMethods(charge.settings),
  };
}

function extractChargeId(subscription: Awaited<ReturnType<typeof paymentService.getSubscription>>): string | null {
  const history = Array.isArray(subscription.history) ? subscription.history : [];
  const historyChargeId = history.length > 0 ? history[history.length - 1]?.charge_id : undefined;
  const candidate = subscription.charge?.id ?? subscription.charge?.charge_id ?? historyChargeId ?? (subscription as Record<string, unknown>).charge_id;
  if (typeof candidate === 'number' || typeof candidate === 'string') {
    const value = String(candidate);
    return /^[0-9]+$/.test(value) ? value : null;
  }
  return null;
}

function authMeta(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  return {
    authorization_present: Boolean(authorization),
    bearer_token_present: authorization.startsWith('Bearer ') && authorization.slice(7).trim().length > 0,
    auth_cookie_present: Boolean(request.headers.get('cookie')),
  };
}

export async function GET(request: Request) {
  const correlationId = request.headers.get('x-correlation-id') ?? crypto.randomUUID();
  const meta = authMeta(request);
  console.info('[PERSONAL_AUTH_DIAGNOSTIC]', { route: '/api/personal/billing/checkout-existing', correlation_id: correlationId, ...meta });
  try {
    const { user } = await requireStudioUser(request);
    console.info('[PERSONAL_AUTH_DIAGNOSTIC]', { route: '/api/personal/billing/checkout-existing', correlation_id: correlationId, ...meta, require_studio_user: 'SUCCESS' });
    const service = getServiceSupabase();

    const { data: subscriptions, error } = await service
      .from('personal_subscriptions')
      .select('id,tier,status,external_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'PENDING')
      .not('external_subscription_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw new Error(`PERSONAL_EXISTING_CHECKOUT_LOOKUP_FAILED:${error.message}`);
    const subscription = (subscriptions ?? []).find((item) => Boolean(item.external_subscription_id));
    if (!subscription?.external_subscription_id) {
      return NextResponse.json({ success: false, error: 'EFI_EXISTING_CHECKOUT_NOT_FOUND', correlation_id: correlationId }, { status: 404 });
    }

    const efiSubscription = await paymentService.getSubscription(subscription.external_subscription_id, correlationId);
    const chargeId = extractChargeId(efiSubscription);
    if (!chargeId) {
      return NextResponse.json({
        success: false,
        error: 'EFI_EXISTING_CHECKOUT_PAYMENT_URL_UNAVAILABLE',
        reason: 'EFI_SUBSCRIPTION_HAS_NO_READABLE_CHARGE_ID',
        subscription_id: String(efiSubscription.id),
        correlation_id: correlationId,
      }, { status: 200 });
    }

    const charge = await paymentService.getCharge(chargeId, correlationId);
    const safe = sanitizeCharge(charge);

    if (String(efiSubscription.id) !== String(subscription.external_subscription_id)) throw new Error('EFI_EXISTING_SUBSCRIPTION_ID_MISMATCH');
    if (safe.charge_id !== chargeId) throw new Error('EFI_EXISTING_CHARGE_ID_MISMATCH');
    if (safe.subscription_id && safe.subscription_id !== String(subscription.external_subscription_id)) throw new Error('EFI_EXISTING_CHARGE_SUBSCRIPTION_ID_MISMATCH');

    console.info('[PERSONAL_EXISTING_CHECKOUT_READ]', {
      correlation_id: correlationId,
      user_id: user.id,
      charge_id: safe.charge_id,
      subscription_id: safe.subscription_id,
      plan_id: safe.plan_id,
      payment_url_present: Boolean(safe.payment_url),
    });

    return NextResponse.json({ success: true, checkout: safe, correlation_id: correlationId });
  } catch (error) {
    if (error instanceof EfiApiError) {
      console.error('[PERSONAL_EXISTING_CHECKOUT_EFI_FAILED]', {
        status: error.details.status,
        provider: error.details.provider,
        code: error.details.code,
        error: error.details.error,
        error_description: error.details.error_description,
        message: error.details.message,
        request_id: error.details.request_id,
        correlation_id: error.details.correlation_id,
      });
      return NextResponse.json({
        success: false,
        error: 'EFI_EXISTING_CHECKOUT_READ_FAILED',
        provider: error.details.provider,
        status: error.details.status,
        code: error.details.code,
        error_code: error.details.error,
        error_description: error.details.error_description,
        message: error.details.message,
        request_id: error.details.request_id,
        correlation_id: correlationId,
      }, { status: 502 });
    }

    const message = error instanceof Error ? error.message : 'PERSONAL_EXISTING_CHECKOUT_READ_FAILED';
    console.error('[PERSONAL_EXISTING_CHECKOUT_FAILED]', { message, correlation_id: correlationId });
    return NextResponse.json({ success: false, error: message, correlation_id: correlationId }, { status: 400 });
  }
}
