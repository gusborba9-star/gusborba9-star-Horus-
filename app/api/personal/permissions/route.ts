import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

const AUTONOMY = new Set(['READ', 'SUGGEST', 'PREPARE', 'EXECUTE', 'AUTONOMOUS']);

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'PERSONAL_PERMISSION_REQUEST_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'CAPABILITY_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();
    const { data, error } = await service.from('personal_capability_grants').select('id,capability_id,scope,autonomy,confirmation_required,status,granted_at,revoked_at,created_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false });
    if (error) throw new Error(`PERSONAL_PERMISSION_LOOKUP_FAILED:${error.message}`);
    return NextResponse.json({ success: true, permissions: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const capabilityId = typeof body.capability_id === 'string' ? body.capability_id.trim() : '';
    const autonomy = typeof body.autonomy === 'string' ? body.autonomy : 'SUGGEST';
    const confirmationRequired = body.confirmation_required !== false;
    const scope = body.scope && typeof body.scope === 'object' && !Array.isArray(body.scope) ? body.scope : {};
    if (!capabilityId) throw new Error('CAPABILITY_NOT_FOUND');
    if (!AUTONOMY.has(autonomy)) throw new Error('INVALID_AUTONOMY');

    const service = getServiceSupabase();
    const { data: capability, error: capabilityError } = await service.from('capabilities').select('id').eq('id', capabilityId).eq('enabled', true).maybeSingle();
    if (capabilityError) throw new Error(`CAPABILITY_LOOKUP_FAILED:${capabilityError.message}`);
    if (!capability) throw new Error('CAPABILITY_NOT_FOUND');

    const { data: grant, error } = await service.from('personal_capability_grants').upsert({
      user_id: user.id,
      capability_id: capabilityId,
      scope,
      autonomy,
      confirmation_required: confirmationRequired,
      status: 'GRANTED',
      granted_at: new Date().toISOString(),
      revoked_at: null,
    }, { onConflict: 'user_id,capability_id' }).select('id,capability_id,scope,autonomy,confirmation_required,status,granted_at,revoked_at,created_at,updated_at').single();
    if (error || !grant) throw new Error(`PERSONAL_PERMISSION_GRANT_FAILED:${error?.message ?? 'UNKNOWN'}`);

    const { error: auditError } = await service.from('personal_permission_audit').insert({ user_id: user.id, grant_id: grant.id, capability_id: capabilityId, action: 'GRANT', metadata: { autonomy, confirmation_required: confirmationRequired, scope } });
    if (auditError) throw new Error(`PERSONAL_PERMISSION_AUDIT_FAILED:${auditError.message}`);
    return NextResponse.json({ success: true, permission: grant }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
