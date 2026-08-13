import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

const AUTONOMY = new Set(['READ', 'SUGGEST', 'PREPARE', 'EXECUTE', 'AUTONOMOUS']);
const PERSONAL_CAPABILITIES = new Set(['PERSONAL_TEXT', 'PERSONAL_VOICE', 'REMINDERS_CREATE']);

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'PERSONAL_PERMISSION_REQUEST_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'CAPABILITY_NOT_FOUND' ? 404 : message === 'PERSONAL_SUBSCRIPTION_REQUIRED' ? 403 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();
    const [{ data: permissions, error: permissionError }, { data: capabilities, error: capabilityError }] = await Promise.all([
      service.from('personal_capability_grants').select('id,capability_id,scope,autonomy,confirmation_required,status,granted_at,revoked_at,created_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
      service.from('capabilities').select('id,display_name,category,enabled').in('id', [...PERSONAL_CAPABILITIES]).eq('enabled', true).order('display_name'),
    ]);
    if (permissionError) throw new Error(`PERSONAL_PERMISSION_LOOKUP_FAILED:${permissionError.message}`);
    if (capabilityError) throw new Error(`PERSONAL_CAPABILITY_LOOKUP_FAILED:${capabilityError.message}`);
    return NextResponse.json({ success: true, permissions: permissions ?? [], capabilities: capabilities ?? [] });
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
    if (!PERSONAL_CAPABILITIES.has(capabilityId)) throw new Error('CAPABILITY_NOT_FOUND');
    if (!AUTONOMY.has(autonomy)) throw new Error('INVALID_AUTONOMY');

    const service = getServiceSupabase();
    const { data: subscription, error: subscriptionError } = await service.from('personal_subscriptions').select('id').eq('user_id', user.id).in('status', ['ACTIVE','PAST_DUE','PAUSED']).maybeSingle();
    if (subscriptionError) throw new Error(`PERSONAL_SUBSCRIPTION_LOOKUP_FAILED:${subscriptionError.message}`);
    if (!subscription) throw new Error('PERSONAL_SUBSCRIPTION_REQUIRED');

    const { data: capability, error: capabilityError } = await service.from('capabilities').select('id').eq('id', capabilityId).eq('enabled', true).maybeSingle();
    if (capabilityError) throw new Error(`CAPABILITY_LOOKUP_FAILED:${capabilityError.message}`);
    if (!capability) throw new Error('CAPABILITY_NOT_FOUND');

    // The database intentionally keeps REVOKED rows as history and enforces
    // uniqueness only for the active GRANTED row via a partial unique index.
    // Therefore a generic ON CONFLICT(user_id, capability_id) is invalid here.
    const grantPayload = {
      scope,
      autonomy,
      confirmation_required: confirmationRequired,
      status: 'GRANTED',
      granted_at: new Date().toISOString(),
      revoked_at: null,
      updated_at: new Date().toISOString(),
    };

    const { data: activeGrant, error: activeLookupError } = await service
      .from('personal_capability_grants')
      .select('id')
      .eq('user_id', user.id)
      .eq('capability_id', capabilityId)
      .eq('status', 'GRANTED')
      .maybeSingle();
    if (activeLookupError) throw new Error(`PERSONAL_PERMISSION_LOOKUP_FAILED:${activeLookupError.message}`);

    let grant;
    if (activeGrant) {
      const { data, error } = await service
        .from('personal_capability_grants')
        .update(grantPayload)
        .eq('id', activeGrant.id)
        .eq('user_id', user.id)
        .eq('capability_id', capabilityId)
        .eq('status', 'GRANTED')
        .select('id,capability_id,scope,autonomy,confirmation_required,status,granted_at,revoked_at,created_at,updated_at')
        .single();
      if (error || !data) throw new Error(`PERSONAL_PERMISSION_GRANT_FAILED:${error?.message ?? 'UNKNOWN'}`);
      grant = data;
    } else {
      const { data, error } = await service
        .from('personal_capability_grants')
        .insert({ user_id: user.id, capability_id: capabilityId, ...grantPayload })
        .select('id,capability_id,scope,autonomy,confirmation_required,status,granted_at,revoked_at,created_at,updated_at')
        .single();
      if (error || !data) {
        // A concurrent grant may have won the partial unique index between the
        // lookup and insert. Re-read the active row and update it instead of
        // creating a duplicate or returning a false permanent failure.
        const { data: racedGrant, error: raceLookupError } = await service
          .from('personal_capability_grants')
          .select('id')
          .eq('user_id', user.id)
          .eq('capability_id', capabilityId)
          .eq('status', 'GRANTED')
          .maybeSingle();
        if (raceLookupError || !racedGrant) throw new Error(`PERSONAL_PERMISSION_GRANT_FAILED:${error?.message ?? 'UNKNOWN'}`);
        const { data: updated, error: updateError } = await service
          .from('personal_capability_grants')
          .update(grantPayload)
          .eq('id', racedGrant.id)
          .eq('user_id', user.id)
          .select('id,capability_id,scope,autonomy,confirmation_required,status,granted_at,revoked_at,created_at,updated_at')
          .single();
        if (updateError || !updated) throw new Error(`PERSONAL_PERMISSION_GRANT_FAILED:${updateError?.message ?? 'UNKNOWN'}`);
        grant = updated;
      } else {
        grant = data;
      }
    }

    const { error: auditError } = await service.from('personal_permission_audit').insert({ user_id: user.id, grant_id: grant.id, capability_id: capabilityId, action: 'GRANT', metadata: { autonomy, confirmation_required: confirmationRequired, scope } });
    if (auditError) throw new Error(`PERSONAL_PERMISSION_AUDIT_FAILED:${auditError.message}`);
    return NextResponse.json({ success: true, permission: grant }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const grantId = typeof body.grant_id === 'string' ? body.grant_id : '';
    if (!grantId) throw new Error('PERSONAL_PERMISSION_GRANT_ID_REQUIRED');

    const service = getServiceSupabase();
    const { data: grant, error: lookupError } = await service.from('personal_capability_grants').select('id,capability_id,status').eq('id', grantId).eq('user_id', user.id).maybeSingle();
    if (lookupError) throw new Error(`PERSONAL_PERMISSION_LOOKUP_FAILED:${lookupError.message}`);
    if (!grant) throw new Error('PERSONAL_PERMISSION_NOT_FOUND');
    const { data: revoked, error } = await service.from('personal_capability_grants').update({ status: 'REVOKED', revoked_at: new Date().toISOString() }).eq('id', grantId).eq('user_id', user.id).select('id,capability_id,status,revoked_at,updated_at').single();
    if (error || !revoked) throw new Error(`PERSONAL_PERMISSION_REVOKE_FAILED:${error?.message ?? 'UNKNOWN'}`);
    const { error: auditError } = await service.from('personal_permission_audit').insert({ user_id: user.id, grant_id: grantId, capability_id: grant.capability_id, action: 'REVOKE', metadata: {} });
    if (auditError) throw new Error(`PERSONAL_PERMISSION_AUDIT_FAILED:${auditError.message}`);
    return NextResponse.json({ success: true, permission: revoked });
  } catch (error) {
    return errorResponse(error);
  }
}
