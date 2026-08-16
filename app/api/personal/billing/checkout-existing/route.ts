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
    charge_id: String(charge.charge_id),
    subscription_id: charge.subscription_id == null ? null : String(charge.subscription_id),
    plan_id: charge.plan_id == null ? null : Number(charge.plan_id),
    value: charge.total == null ? null : Number(charge.total),
    status: typeof charge.status === 'string' ? charge.status : null,
    expire_at: typeof charge.expire_at === 'string' ? charge.expire_at : null,
    periodicity: safePeriodicity(charge.settings),
    payment_methods: safePaymentMethods(charge.settings),
  };
}

const PENDING_CHARGE_STATUS_PRIORITY: Record<string, number> = {
  link: 4,
  new: 3,
  waiting: 2,
  unpaid: 1,
};

function historyTimestamp(value: unknown): number {
  if (typeof value !== 'string' || !value) return Number.NEGATIVE_INFINITY;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function extractChargeId(subscription: Awaited<ReturnType<typeof paymentService.getSubscription>>): string | null {
  const history = Array.isArray(subscription.history) ? subscription.history : [];
  const candidates = history
    .map((entry, index) => {
      const chargeId = typeof entry?.charge_id === 'number' || typeof entry?.charge_id === 'string'
        ? String(entry.charge_id)
        : null;
      const status = typeof entry?.status === 'string' ? entry.status.toLowerCase() : '';
      return {
        chargeId: chargeId && /^[0-9]+$/.test(chargeId) ? chargeId : null,
        status,
        priority: PENDING_CHARGE_STATUS_PRIORITY[status] ?? 0,
        createdAt: historyTimestamp(entry?.created_at),
        index,
      };
    })
    .filter((entry) => entry.chargeId !== null && entry.priority > 0)
    .sort((a, b) =>
      b.priority - a.priority ||
      b.createdAt - a.createdAt ||
      Number(a.chargeId) - Number(b.chargeId) ||
      a.index - b.index,
    );

  return candidates[0]?.chargeId ?? null;
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

    const requestedSubscriptionId = String(subscription.external_subscription_id);
    const efiSubscription = await paymentService.getSubscription(requestedSubscriptionId, correlationId);
    if (String(efiSubscription.subscription_id) !== requestedSubscriptionId) {
      throw new Error('EFI_EXISTING_SUBSCRIPTION_ID_MISMATCH');
    }

    const chargeId = extractChargeId(efiSubscription);
    if (!chargeId) {
      return NextResponse.json({
        success: false,
        error: 'EFI_EXISTING_CHECKOUT_PAYMENT_URL_UNAVAILABLE',
        reason: 'EFI_SUBSCRIPTION_HAS_NO_PENDING_CHARGE_ID',
        subscription_id: requestedSubscriptionId,
        correlation_id: correlationId,
      }, { status: 200 });
    }

    const charge = await paymentService.getCharge(chargeId, correlationId);
    const safe = sanitizeCharge(charge);

    if (safe.charge_id !== chargeId) throw new Error('EFI_EXISTING_CHARGE_ID_MISMATCH');
    if (safe.subscription_id !== requestedSubscriptionId) throw new Error('EFI_EXISTING_CHARGE_SUBSCRIPTION_ID_MISMATCH');
    if (!safe.payment_url) {
      return NextResponse.json({
        success: false,
        error: 'EFI_EXISTING_CHECKOUT_PAYMENT_URL_UNAVAILABLE',
        reason: 'EFI_CHARGE_HAS_NO_PAYMENT_URL',
        subscription_id: requestedSubscriptionId,
        charge_id: chargeId,
        correlation_id: correlationId,
      }, { status: 200 });
    }

    console.info('[PERSONAL_EXISTING_CHECKOUT_READ]', {
      correlation_id: correlationId,
      user_id: user.id,
      charge_id: safe.charge_id,
      subscription_id: safe.subscription_id,
      plan_id: safe.plan_id,
      payment_url_present: true,
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
        correlation_id: correlationId,
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
