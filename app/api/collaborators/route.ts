import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'COLLABORATOR_REQUEST_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'COLLABORATOR_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

async function assertOrganizationAccess(service: ReturnType<typeof getServiceSupabase>, userId: string, organizationId: string | null) {
  if (!organizationId) return;
  const { data, error } = await service.from('organization_memberships').select('organization_id').eq('organization_id', organizationId).eq('user_id', userId).maybeSingle();
  if (error) throw new Error(`ORGANIZATION_ACCESS_CHECK_FAILED:${error.message}`);
  if (!data) throw new Error('ORGANIZATION_ACCESS_DENIED');
}

export async function GET(request: Request) {
  try {
    const { client } = await requireStudioUser(request);
    const { data, error } = await client.from('horus_collaborators').select('*,horus_collaborator_capabilities(capability_id,enabled,policy)').order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, collaborators: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const role = typeof body.role === 'string' ? body.role.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const specialization = typeof body.specialization === 'string' ? body.specialization.trim() : '';
    const capabilities = Array.isArray(body.capabilities) ? body.capabilities.filter((item: unknown): item is string => typeof item === 'string') : ['TEXT_GENERATION'];
    const organizationId = typeof body.organization_id === 'string' ? body.organization_id : null;
    if (!name || !slug || !role) throw new Error('COLLABORATOR_NAME_SLUG_ROLE_REQUIRED');
    if (name.length > 160 || slug.length > 80 || role.length > 160 || description.length > 5000 || capabilities.length === 0) throw new Error('COLLABORATOR_INPUT_TOO_LARGE');

    const service = getServiceSupabase();
    await assertOrganizationAccess(service, user.id, organizationId);
    const { data: policy, error: policyError } = await service.from('economic_policy').select('version').eq('id', true).single();
    if (policyError || !policy) throw new Error('ECONOMIC_POLICY_UNAVAILABLE');
    const { data: validCapabilities, error: capabilityError } = await service.from('capabilities').select('id').in('id', capabilities).eq('enabled', true);
    if (capabilityError) throw new Error(`CAPABILITY_LOOKUP_FAILED:${capabilityError.message}`);
    const valid = (validCapabilities ?? []).map((item) => item.id as string);
    if (valid.length !== capabilities.length) throw new Error('CAPABILITY_NOT_FOUND');

    const collaboratorPayload = {
      owner_user_id: user.id,
      organization_id: organizationId,
      slug,
      name,
      description,
      role,
      specialization,
      personality: body.personality && typeof body.personality === 'object' ? body.personality : {},
      objectives: Array.isArray(body.objectives) ? body.objectives : [],
      instructions: typeof body.instructions === 'string' ? body.instructions.trim() : '',
      memory_scope: body.memory_scope && typeof body.memory_scope === 'object' ? body.memory_scope : undefined,
      knowledge_sources: Array.isArray(body.knowledge_sources) ? body.knowledge_sources : [],
      tool_policy: body.tool_policy && typeof body.tool_policy === 'object' ? body.tool_policy : undefined,
      connector_policy: body.connector_policy && typeof body.connector_policy === 'object' ? body.connector_policy : {},
      execution_policy: body.execution_policy && typeof body.execution_policy === 'object' ? body.execution_policy : undefined,
      economic_policy_version: policy.version,
      autonomy_level: ['READ','SUGGEST','PREPARE','EXECUTE','AUTONOMOUS'].includes(body.autonomy_level) ? body.autonomy_level : 'SUGGEST',
      preferred_provider_id: typeof body.preferred_provider_id === 'string' ? body.preferred_provider_id : null,
      preferred_model_id: typeof body.preferred_model_id === 'string' ? body.preferred_model_id : null,
      fallback_policy: body.fallback_policy && typeof body.fallback_policy === 'object' ? body.fallback_policy : undefined,
      status: 'ACTIVE',
    };

    const { data: collaborator, error } = await service.from('horus_collaborators').insert(collaboratorPayload).select('*').single();
    if (error || !collaborator) throw new Error(`COLLABORATOR_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
    const { error: bindingError } = await service.from('horus_collaborator_capabilities').insert(valid.map((capabilityId) => ({ collaborator_id: collaborator.id, capability_id: capabilityId, enabled: true })));
    if (bindingError) {
      await service.from('horus_collaborators').delete().eq('id', collaborator.id);
      throw new Error(`COLLABORATOR_CAPABILITY_BINDING_FAILED:${bindingError.message}`);
    }
    const { error: versionError } = await service.from('horus_collaborator_versions').insert({ collaborator_id: collaborator.id, version: 1, snapshot: collaborator, created_by: user.id });
    if (versionError) {
      await service.from('horus_collaborators').delete().eq('id', collaborator.id);
      throw new Error(`COLLABORATOR_VERSION_CREATE_FAILED:${versionError.message}`);
    }
    return NextResponse.json({ success: true, collaborator }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
