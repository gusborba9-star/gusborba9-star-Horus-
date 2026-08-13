import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { PERSONAL_TIERS, isPersonalTier } from '@/lib/personal/catalog';
import { paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const tier = typeof body.tier === 'string' ? body.tier : '';
    if (!isPersonalTier(tier)) return NextResponse.json({ success: false, error: 'PERSONAL_TIER_INVALID' }, { status: 400 });

    const service = getServiceSupabase();
    const plan = PERSONAL_TIERS[tier];
    let { data: subscription, error } = await service
      .from('personal_subscriptions')
      .select('id,tier,status,economic_profile,external_subscription_id')
      .eq('user_id', user.id)
      .in('status', ['PENDING', 'PAST_DUE', 'PAUSED'])
      .maybeSingle();
    if (error) throw new Error(`PERSONAL_SUBSCRIPTION_LOOKUP_FAILED:${error.message}`);

    if (!subscription) {
      const created = await service
        .from('personal_subscriptions')
        .insert({ user_id: user.id, tier: plan.id, status: 'PENDING', economic_profile: plan.economicProfile })
        .select('id,tier,status,economic_profile,external_subscription_id')
        .single();
      if (created.error || !created.data) throw new Error(`PERSONAL_SUBSCRIPTION_CREATE_FAILED:${created.error?.message ?? 'UNKNOWN'}`);
      subscription = created.data;
    }

    const origin = new URL(request.url).origin;
    const checkout = await paymentService.createSubscriptionLink({
      tier: plan.id,
      amountCents: Math.round(Number(plan.price) * 100),
      customId: `horus_personal:${subscription.id}`,
      notificationUrl: `${origin}/api/personal/billing/webhook`,
      email: user.email ?? undefined,
    });

    const updated = await service
      .from('personal_subscriptions')
      .update({ external_subscription_id: checkout.subscriptionId, updated_at: new Date().toISOString() })
      .eq('id', subscription.id)
      .eq('user_id', user.id)
      .select('id,tier,status,economic_profile,external_subscription_id')
      .single();
    if (updated.error || !updated.data) throw new Error(`PERSONAL_SUBSCRIPTION_EXTERNAL_LINK_FAILED:${updated.error?.message ?? 'UNKNOWN'}`);

    return NextResponse.json({ success: true, subscription: updated.data, checkout: { payment_url: checkout.paymentUrl, status: checkout.status, charge_id: checkout.chargeId } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PERSONAL_BILLING_CHECKOUT_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
