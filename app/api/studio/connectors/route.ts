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

    const permissions: ConnectorPermission[] = Array.isArray(body.permissions)
      ? body.permissions.filter(isConnectorPermission)
      : [];
    const submittedPermissions = Array.isArray(body.permissions) ? body.permissions : [];
    if (permissions.length !== submittedPermissions.length) throw new Error('INVALID_CONNECTOR_PERMISSION');
    if (!permissions.length) throw new Error('CONNECTOR_PERMISSION_REQUIRED');
    if (provider === 'github' && !permissions.some((p) => p === 'READ_REPOSITORY' || p === 'READ_FILES')) throw new Error('GITHUB_READ_PERMISSION_REQUIRED');

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

    const { data, error } = await client.from('studio_connectors').insert({
      owner_user_id: user.id,
      organization_id: typeof body.organization_id === 'string' ? body.organization_id : null,
      project_id: projectId,
      provider,
      permissions,
      status: 'CONNECTED',
      secret_ref: secretRef,
      metadata: { label: typeof body.label === 'string' ? body.label.slice(0, 120) : provider },
    }).select('id,owner_user_id,organization_id,project_id,provider,permissions,status,metadata,expires_at,revoked_at,last_used_at,created_at,updated_at').single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, connector: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CONNECTOR_CREATION_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
