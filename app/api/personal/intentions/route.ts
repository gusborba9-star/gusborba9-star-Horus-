import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

function responseError(error: unknown) {
  const message = error instanceof Error ? error.message : 'PERSONAL_INTENTION_FAILED';
  return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
}

export async function GET(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();
    const { data, error } = await service.from('personal_intentions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw new Error(`PERSONAL_INTENTIONS_LOOKUP_FAILED:${error.message}`);
    return NextResponse.json({ success: true, intentions: data ?? [] });
  } catch (error) {
    return responseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const triggerType = typeof body.trigger_type === 'string' ? body.trigger_type : 'CONDITION';
    const triggerConfig = body.trigger_config && typeof body.trigger_config === 'object' && !Array.isArray(body.trigger_config) ? body.trigger_config : {};
    if (!description) throw new Error('PERSONAL_INTENTION_DESCRIPTION_REQUIRED');
    if (!['TIME', 'EVENT', 'LOCATION', 'CONDITION'].includes(triggerType)) throw new Error('PERSONAL_INTENTION_TRIGGER_INVALID');
    const service = getServiceSupabase();
    const { data: intention, error } = await service.from('personal_intentions').insert({ user_id: user.id, description, trigger_type: triggerType, trigger_config: triggerConfig, status: 'ACTIVE', next_evaluation_at: typeof body.next_evaluation_at === 'string' ? body.next_evaluation_at : null }).select('*').single();
    if (error || !intention) throw new Error(`PERSONAL_INTENTION_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
    return NextResponse.json({ success: true, intention }, { status: 201 });
  } catch (error) {
    return responseError(error);
  }
}
