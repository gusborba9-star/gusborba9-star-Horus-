import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { CONNECTOR_PERMISSIONS, type ConnectorPermission } from '@/lib/studio/types';

function hasPermission(permissions: unknown, required: ConnectorPermission): boolean {
  return Array.isArray(permissions) && permissions.some((permission): permission is ConnectorPermission =>
    typeof permission === 'string' && (CONNECTOR_PERMISSIONS as readonly string[]).includes(permission) && permission === required,
  );
}

async function getSecret(secretRef: string) {
  const service = getServiceSupabase();
  const { data, error } = await service.rpc('studio_read_connector_secret', { p_secret_ref: secretRef });
  if (error || typeof data !== 'string') throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
  return data;
}

async function upstream(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  });
  const text = await response.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 4000) }; }
  if (!response.ok) throw new Error(`CONNECTOR_UPSTREAM_${response.status}`);
  return data;
}

export async function POST(request: Request, context: { params: Promise<{ connectorId: string }> }) {
  try {
    const { client } = await requireStudioUser(request);
    const { connectorId } = await context.params;
    const body = await request.json();
    const { data: connector, error } = await client
      .from('studio_connectors')
      .select('id,provider,permissions,status,secret_ref,metadata,expires_at,revoked_at')
      .eq('id', connectorId)
      .single();

    if (error || !connector || connector.status !== 'CONNECTED' || !connector.secret_ref) {
      return NextResponse.json({ success: false, error: 'CONNECTOR_NOT_AVAILABLE' }, { status: 404 });
    }
    if (connector.revoked_at || (connector.expires_at && new Date(connector.expires_at).getTime() <= Date.now())) {
      throw new Error('CONNECTOR_CREDENTIAL_EXPIRED_OR_REVOKED');
    }

    const operation = typeof body.operation === 'string' ? body.operation : '';
    let result: unknown;

    if (connector.provider === 'github') {
      if (!hasPermission(connector.permissions, 'READ_REPOSITORY')) throw new Error('CONNECTOR_PERMISSION_DENIED');
      if (operation !== 'repository') throw new Error('UNSUPPORTED_GITHUB_OPERATION');
      const repo = typeof body.repository === 'string' ? body.repository : '';
      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('INVALID_GITHUB_REPOSITORY');
      result = await upstream(`https://api.github.com/repos/${repo}`, await getSecret(connector.secret_ref));
    } else if (connector.provider === 'vercel') {
      if (!hasPermission(connector.permissions, 'READ_PROJECT')) throw new Error('CONNECTOR_PERMISSION_DENIED');
      if (operation !== 'project') throw new Error('UNSUPPORTED_VERCEL_OPERATION');
      const project = typeof body.project === 'string' ? body.project : '';
      if (!project) throw new Error('INVALID_VERCEL_PROJECT');
      result = await upstream(`https://api.vercel.com/v9/projects/${encodeURIComponent(project)}`, await getSecret(connector.secret_ref));
    } else if (connector.provider === 'supabase') {
      if (!hasPermission(connector.permissions, 'DATABASE_READ')) throw new Error('CONNECTOR_PERMISSION_DENIED');
      if (operation !== 'project') throw new Error('UNSUPPORTED_SUPABASE_OPERATION');
      const projectRef = typeof body.project_ref === 'string' ? body.project_ref : '';
      if (!/^[a-z0-9]{10,30}$/.test(projectRef)) throw new Error('INVALID_SUPABASE_PROJECT_REF');
      result = await upstream(`https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}`, await getSecret(connector.secret_ref));
    } else {
      throw new Error('EXTERNAL_API_REQUIRES_EXPLICIT_ADAPTER');
    }

    const { error: usageError } = await client.from('studio_connectors').update({ last_used_at: new Date().toISOString() }).eq('id', connectorId);
    if (usageError) throw new Error('CONNECTOR_USAGE_UPDATE_FAILED');

    return NextResponse.json({ success: true, operation, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CONNECTOR_EXECUTION_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
