import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { PERSONAL_TIERS, isPersonalTier } from '@/lib/personal/catalog';
import { EfiApiError, paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const correlationId = request.headers.get('x-correlation-id') ?? crypto.randomUUID();
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const tier = typeof body.tier === 'string' ? body.tier : '';
    if (!isPersonalTier(tier)) return NextResponse.json({ success: false, error: 'PERSONAL_TIER_INVALID', correlation_id: correlationId }, { status: 400 });

    const service = getServiceSupabase();
    const plan = PERSONAL_TIERS[tier];
    let { data: subscription, error } = await service
      .from('personal_subscriptions')
      .select('id,tier,status,economic_profile,external_subscription_id,external_charge_id,payment_url')
      .eq('user_id', user.id)
      .in('status', ['PENDING', 'PAST_DUE', 'PAUSED'])
      .maybeSingle();
    if (error) throw new Error(`PERSONAL_SUBSCRIPTION_LOOKUP_FAILED:${error.message}`);

    if (!subscription) {
      const created = await service
        .from('personal_subscriptions')
        .insert({ user_id: user.id, tier: plan.id, status: 'PENDING', economic_profile: plan.economicProfile })
        .select('id,tier,status,economic_profile,external_subscription_id,external_charge_id,payment_url')
        .single();
      if (created.error || !created.data) throw new Error(`PERSONAL_SUBSCRIPTION_CREATE_FAILED:${created.error?.message ?? 'UNKNOWN'}`);
      subscription = created.data;
    }

    const origin = new URL(request.url).origin;
    const checkout = await paymentService.createSubscriptionLink({
      tier: plan.id,
      amountCents: Math.round(plan.priceBrl * 100),
      customId: `horus_personal_${subscription.id}`,
      notificationUrl: `${origin}/api/personal/billing/webhook`,
      email: user.email ?? undefined,
      correlationId,
    });

    if (!checkout.subscriptionId || !checkout.chargeId || !checkout.paymentUrl) {
      throw new Error('PERSONAL_SUBSCRIPTION_EXTERNAL_LINK_INCOMPLETE');
    }

    const updated = await service
      .from('personal_subscriptions')
      .update({
        external_subscription_id: checkout.subscriptionId,
        external_charge_id: checkout.chargeId,
        payment_url: checkout.paymentUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)
      .eq('user_id', user.id)
      .select('id,tier,status,economic_profile,external_subscription_id,external_charge_id,payment_url')
      .single();
    if (updated.error || !updated.data) throw new Error(`PERSONAL_SUBSCRIPTION_EXTERNAL_LINK_FAILED:${updated.error?.message ?? 'UNKNOWN'}`);

    return NextResponse.json({
      success: true,
      subscription: updated.data,
      checkout: { payment_url: checkout.paymentUrl, status: checkout.status, charge_id: checkout.chargeId },
      correlation_id: correlationId,
    });
  } catch (error) {
    if (error instanceof EfiApiError) {
      console.error('[PERSONAL_CHECKOUT_EFI_FAILED]', error.details);
      return NextResponse.json({
        success: false,
        error: 'EFI_API_FAILED',
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

    const message = error instanceof Error ? error.message : 'PERSONAL_BILLING_CHECKOUT_FAILED';
    console.error('[PERSONAL_CHECKOUT_FAILED]', { message, correlation_id: correlationId });
    return NextResponse.json({ success: false, error: message, correlation_id: correlationId }, { status: 400 });
  }
}
