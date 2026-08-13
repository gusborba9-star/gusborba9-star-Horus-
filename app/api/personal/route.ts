import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { isPersonalPersonaId } from '@/lib/personal/catalog';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'PERSONAL_REQUEST_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'PERSONAL_SUBSCRIPTION_REQUIRED' ? 403 : message === 'PERSONA_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();
    const [{ data: profile, error: profileError }, { data: subscription, error: subscriptionError }, { data: personas, error: personaError }] = await Promise.all([
      service.from('personal_profiles').select('user_id,persona_id,status,activated_at,created_at,updated_at').eq('user_id', user.id).maybeSingle(),
      service.from('personal_subscriptions').select('id,tier,status,economic_profile,current_period_start,current_period_end,created_at,updated_at').eq('user_id', user.id).in('status', ['PENDING','ACTIVE','PAST_DUE','PAUSED']).maybeSingle(),
      service.from('personal_personas').select('id,display_name,locale,voice_profile,personality_profile,communication_profile,behavior_profile').eq('enabled', true).order('display_name'),
    ]);
    if (profileError) throw new Error(`PERSONAL_PROFILE_LOOKUP_FAILED:${profileError.message}`);
    if (subscriptionError) throw new Error(`PERSONAL_SUBSCRIPTION_LOOKUP_FAILED:${subscriptionError.message}`);
    if (personaError) throw new Error(`PERSONA_LOOKUP_FAILED:${personaError.message}`);
    return NextResponse.json({ success: true, profile: profile ?? null, subscription: subscription ?? null, personas: personas ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const personaId = typeof body.persona_id === 'string' ? body.persona_id.trim().toLowerCase() : '';
    if (!isPersonalPersonaId(personaId)) throw new Error('PERSONA_NOT_FOUND');

    const service = getServiceSupabase();
    const { data: subscription, error: subscriptionError } = await service
      .from('personal_subscriptions')
      .select('id,status,tier,economic_profile')
      .eq('user_id', user.id)
      .in('status', ['ACTIVE','PAST_DUE','PAUSED'])
      .maybeSingle();
    if (subscriptionError) throw new Error(`PERSONAL_SUBSCRIPTION_LOOKUP_FAILED:${subscriptionError.message}`);
    if (!subscription) throw new Error('PERSONAL_SUBSCRIPTION_REQUIRED');

    const { data: persona, error: personaError } = await service.from('personal_personas').select('id').eq('id', personaId).eq('enabled', true).maybeSingle();
    if (personaError) throw new Error(`PERSONA_LOOKUP_FAILED:${personaError.message}`);
    if (!persona) throw new Error('PERSONA_NOT_FOUND');

    const { data: profile, error } = await service.from('personal_profiles').upsert({
      user_id: user.id,
      persona_id: personaId,
      status: 'ACTIVE',
      activated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).select('user_id,persona_id,status,activated_at,created_at,updated_at').single();
    if (error || !profile) throw new Error(`PERSONAL_PROFILE_UPSERT_FAILED:${error?.message ?? 'UNKNOWN'}`);
    return NextResponse.json({ success: true, profile, tier: subscription.tier, economic_profile: subscription.economic_profile });
  } catch (error) {
    return errorResponse(error);
  }
}
