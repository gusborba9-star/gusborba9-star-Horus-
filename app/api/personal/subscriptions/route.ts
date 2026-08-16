import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { PERSONAL_TIERS, isPersonalTier } from '@/lib/personal/catalog';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'PERSONAL_SUBSCRIPTION_REQUEST_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'PERSONAL_TIER_INVALID' ? 400 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
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
  const meta = authMeta(request);
  console.info('[PERSONAL_AUTH_DIAGNOSTIC]', { route: '/api/personal/subscriptions', ...meta });
  try {
    const { user } = await requireStudioUser(request);
    console.info('[PERSONAL_AUTH_DIAGNOSTIC]', { route: '/api/personal/subscriptions', ...meta, require_studio_user: 'SUCCESS' });
    const service = getServiceSupabase();
    const { data, error } = await service.from('personal_subscriptions').select('id,tier,status,economic_profile,current_period_start,current_period_end,external_customer_id,external_subscription_id,created_at,updated_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    if (error) throw new Error(`PERSONAL_SUBSCRIPTION_LOOKUP_FAILED:${error.message}`);
    return NextResponse.json({ success: true, subscriptions: data ?? [] });
  } catch (error) {
    console.info('[PERSONAL_AUTH_DIAGNOSTIC]', { route: '/api/personal/subscriptions', ...meta, require_studio_user: 'FAIL', failure_reason: error instanceof Error ? error.message : 'UNKNOWN' });
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const tier = typeof body.tier === 'string' ? body.tier : '';
    if (!isPersonalTier(tier)) throw new Error('PERSONAL_TIER_INVALID');
    const service = getServiceSupabase();
    const { data: existing } = await service.from('personal_subscriptions').select('id,status,tier').eq('user_id', user.id).in('status', ['PENDING','ACTIVE','PAST_DUE','PAUSED']).maybeSingle();
    if (existing) return NextResponse.json({ success: true, subscription: existing, existing: true });
    const plan = PERSONAL_TIERS[tier];
    const { data: subscription, error } = await service.from('personal_subscriptions').insert({ user_id: user.id, tier: plan.id, status: 'PENDING', economic_profile: plan.economicProfile }).select('id,tier,status,economic_profile,created_at,updated_at').single();
    if (error || !subscription) throw new Error(`PERSONAL_SUBSCRIPTION_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
    return NextResponse.json({ success: true, subscription, activation: 'PENDING_BILLING_CONFIRMATION' }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
