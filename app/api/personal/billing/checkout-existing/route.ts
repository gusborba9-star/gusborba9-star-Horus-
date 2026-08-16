import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { EfiApiError, paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

type PersistedCheckout = {
  external_subscription_id: string | null;
  external_charge_id: string | null;
  payment_url: string | null;
};

function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9]+$/.test(value);
}

export async function GET(request: Request) {
  const correlationId = request.headers.get('x-correlation-id') ?? crypto.randomUUID();

  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();

    const { data: subscription, error } = await service
      .from('personal_subscriptions')
      .select('id,tier,status,economic_profile,external_subscription_id,external_charge_id,payment_url')
      .eq('user_id', user.id)
      .eq('status', 'PENDING')
      .not('external_subscription_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(`PERSONAL_EXISTING_CHECKOUT_LOOKUP_FAILED:${error.message}`);
    if (!subscription) {
      return NextResponse.json({ success: false, error: 'EFI_EXISTING_CHECKOUT_NOT_FOUND', correlation_id: correlationId }, { status: 404 });
    }

    const persisted: PersistedCheckout = {
      external_subscription_id: subscription.external_subscription_id == null ? null : String(subscription.external_subscription_id),
      external_charge_id: subscription.external_charge_id == null ? null : String(subscription.external_charge_id),
      payment_url: typeof subscription.payment_url === 'string' && subscription.payment_url.length > 0 ? subscription.payment_url : null,
    };

    if (!validId(persisted.external_subscription_id)) {
      return NextResponse.json({ success: false, error: 'EFI_EXISTING_CHECKOUT_IDENTITY_INCOMPLETE', correlation_id: correlationId }, { status: 409 });
    }
    if (!validId(persisted.external_charge_id) || !persisted.payment_url) {
      return NextResponse.json({
        success: false,
        error: 'EFI_EXISTING_CHECKOUT_NOT_PERSISTED',
        reason: !validId(persisted.external_charge_id) ? 'EXTERNAL_CHARGE_ID_MISSING' : 'PAYMENT_URL_MISSING',
        subscription: {
          external_subscription_id: persisted.external_subscription_id,
          external_charge_id: persisted.external_charge_id,
          payment_url_present: Boolean(persisted.payment_url),
        },
        correlation_id: correlationId,
      }, { status: 409 });
    }

    // Read-only provider validation. The persisted creation response remains the
    // source of the checkout URL and charge identity; these GETs never create or mutate.
    const efiSubscription = await paymentService.getSubscription(persisted.external_subscription_id, correlationId);
    if (String(efiSubscription.subscription_id) !== persisted.external_subscription_id) {
      throw new Error('EFI_EXISTING_SUBSCRIPTION_ID_MISMATCH');
    }

    const history = Array.isArray(efiSubscription.history) ? efiSubscription.history : [];
    const linkedHistory = history.find((entry) => String(entry?.charge_id ?? '') === persisted.external_charge_id);
    if (!linkedHistory) {
      return NextResponse.json({
        success: false,
        error: 'EFI_EXISTING_CHARGE_NOT_ASSOCIATED',
        requested_subscription_id: persisted.external_subscription_id,
        persisted_charge_id: persisted.external_charge_id,
        correlation_id: correlationId,
      }, { status: 409 });
    }
    if (String(linkedHistory.status ?? '').toLowerCase() !== 'link') {
      return NextResponse.json({
        success: false,
        error: 'EFI_EXISTING_CHARGE_STATUS_INVALID',
        charge_id: persisted.external_charge_id,
        status: linkedHistory.status ?? null,
        correlation_id: correlationId,
      }, { status: 409 });
    }

    const charge = await paymentService.getCharge(persisted.external_charge_id, correlationId);
    if (String(charge.charge_id) !== persisted.external_charge_id) {
      throw new Error('EFI_EXISTING_CHARGE_ID_MISMATCH');
    }
    if (String(charge.status ?? '').toLowerCase() !== 'link') {
      return NextResponse.json({
        success: false,
        error: 'EFI_EXISTING_CHARGE_STATUS_INVALID',
        charge_id: persisted.external_charge_id,
        status: charge.status ?? null,
        correlation_id: correlationId,
      }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        economic_profile: subscription.economic_profile,
        external_subscription_id: persisted.external_subscription_id,
        external_charge_id: persisted.external_charge_id,
        payment_url: persisted.payment_url,
      },
      checkout: {
        payment_url: persisted.payment_url,
        charge_id: persisted.external_charge_id,
        status: String(charge.status ?? 'link'),
      },
      correlation_id: correlationId,
    });
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
