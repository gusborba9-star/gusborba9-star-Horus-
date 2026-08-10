import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import {
  CONNECTOR_PERMISSIONS,
  CONNECTOR_PROVIDERS,
  type ConnectorPermission,
  type ConnectorProvider,
} from '@/lib/studio/types';

function isConnectorPermission(value: unknown): value is ConnectorPermission {
  return typeof value === 'string' && (CONNECTOR_PERMISSIONS as readonly string[]).includes(value);
}

function safeMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const metadata: Record<string, string | number> = {};
  for (const key of ['vercelProjectId', 'repoId', 'ref', 'label']) {
    const current = input[key];
    if (typeof current === 'string' && current.trim()) metadata[key] = current.trim().slice(0, 200);
    if (typeof current === 'number' && Number.isInteger(current)) metadata[key] = current;
  }
  return metadata;
}

export async function GET(request: Request) {
  try {
    const { client } = await requireStudioUser(request);
    const { data, error } = await client.from('studio_connectors').select('id,owner_user_id,organization_id,project_id,provider,permissions,status,metadata,expires_at,revoked_at,last_used_at,created_at,updated_at').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, connectors: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CONNECTOR_REQUEST_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { client, user } = await requireStudioUser(request);
    const body = await request.json();
    const provider = String(body.provider) as ConnectorProvider;
    if (!CONNECTOR_PROVIDERS.includes(provider)) throw new Error('UNSUPPORTED_CONNECTOR');

    const submittedPermissions: unknown[] = Array.isArray(body.permissions) ? body.permissions : [];
    const requestedPermissions: ConnectorPermission[] = submittedPermissions.filter(isConnectorPermission);
    if (requestedPermissions.length !== submittedPermissions.length) throw new Error('INVALID_CONNECTOR_PERMISSION');
    if (!requestedPermissions.length) throw new Error('CONNECTOR_PERMISSION_REQUIRED');
    if (provider === 'github' && !requestedPermissions.some((p) => p === 'READ_REPOSITORY' || p === 'READ_FILES')) throw new Error('GITHUB_READ_PERMISSION_REQUIRED');

    // A Vercel connector registered for Studio execution is the provider boundary for
    // the complete deployment lifecycle. The lifecycle executor already enforces each
    // capability independently; provisioning the connector with the complete set here
    // prevents a connector created during Preview setup from becoming unusable at
    // STAGING/PRODUCTION/ROLLBACK. This does not bypass the executor permission guard.
    const permissions: ConnectorPermission[] = provider === 'vercel'
      ? Array.from(new Set([
          ...requestedPermissions,
          'DEPLOY_PREVIEW',
          'DEPLOY_STAGING',
          'DEPLOY_PRODUCTION',
          'ROLLBACK_PRODUCTION',
        ]))
      : requestedPermissions;

    const projectId = typeof body.project_id === 'string' ? body.project_id : null;
    if (projectId) {
      const { data: project } = await client.from('studio_projects').select('id').eq('id', projectId).single();
      if (!project) throw new Error('PROJECT_NOT_FOUND');
    }

    const secret = typeof body.secret === 'string' ? body.secret.trim() : '';
    if (!secret) throw new Error('CONNECTOR_SECRET_REQUIRED');

    const service = getServiceSupabase();
    const secretName = `studio:${user.id}:${provider}:${crypto.randomUUID()}`;
    const { data: secretRef, error: secretError } = await service.rpc('studio_store_connector_secret', { p_secret: secret, p_name: secretName });
    if (secretError || !secretRef) throw new Error('CONNECTOR_SECRET_STORAGE_FAILED');

    const metadata = safeMetadata(body.metadata);
    metadata.label = typeof body.label === 'string' && body.label.trim() ? body.label.trim().slice(0, 120) : provider;

    const { data, error } = await client.from('studio_connectors').insert({
      owner_user_id: user.id,
      organization_id: typeof body.organization_id === 'string' ? body.organization_id : null,
      project_id: projectId,
      provider,
      permissions,
      status: 'CONNECTED',
      secret_ref: secretRef,
      metadata,
    }).select('id,owner_user_id,organization_id,project_id,provider,permissions,status,metadata,expires_at,revoked_at,last_used_at,created_at,updated_at').single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, connector: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CONNECTOR_CREATION_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
