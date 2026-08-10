import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

function metadataString(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return '';
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

async function verifyDeployment(secret: string, deploymentId: string) {
  const response = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(deploymentId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`VERCEL_DEPLOYMENT_READ_FAILED:${response.status}`);
  return payload as { id?: string; readyState?: string; url?: string };
}

async function resolveVercelConnector(client: ReturnType<typeof getServiceSupabase>, projectId: string, userId: string) {
  const columns = 'id,permissions,status,secret_ref,metadata,project_id,owner_user_id,created_at';
  const { data: projectConnector, error: projectError } = await client
    .from('studio_connectors')
    .select(columns)
    .eq('project_id', projectId)
    .eq('owner_user_id', userId)
    .eq('provider', 'vercel')
    .eq('status', 'CONNECTED')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (projectError) throw new Error(`VERCEL_CONNECTOR_LOOKUP_FAILED:${projectError.message}`);
  if (projectConnector) return projectConnector;

  const { data: globalConnector, error: globalError } = await client
    .from('studio_connectors')
    .select(columns)
    .is('project_id', null)
    .eq('owner_user_id', userId)
    .eq('provider', 'vercel')
    .eq('status', 'CONNECTED')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (globalError) throw new Error(`VERCEL_CONNECTOR_LOOKUP_FAILED:${globalError.message}`);
  if (!globalConnector) throw new Error('VERCEL_CONNECTOR_REQUIRED');
  return globalConnector;
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string; revisionId: string }> }) {
  const service = getServiceSupabase();
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId, revisionId } = await context.params;
    const { data: project } = await client.from('studio_projects').select('id,owner_user_id').eq('id', projectId).single();
    if (!project || project.owner_user_id !== user.id) throw new Error('PROJECT_NOT_FOUND');
    const { data: revision } = await client.from('studio_project_revisions').select('id,project_id,preview,deployment,audit').eq('id', revisionId).eq('project_id', projectId).single();
    if (!revision) throw new Error('REVISION_NOT_FOUND');
    const preview = (revision.preview ?? {}) as { status?: string; deploymentId?: string; url?: string | null; verified?: boolean };
    if (!preview.deploymentId || preview.status !== 'READY') throw new Error('PREVIEW_NOT_READY');

    const connector = await resolveVercelConnector(client, projectId, user.id);
    if (!Array.isArray(connector.permissions) || !connector.permissions.includes('DEPLOY_PREVIEW')) throw new Error('VERCEL_DEPLOY_PREVIEW_PERMISSION_REQUIRED');
    if (!connector.secret_ref) throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    if (metadataString(connector.metadata, 'vercelProjectId') === '') throw new Error('VERCEL_CONNECTOR_METADATA_REQUIRED');

    const { data: secret, error: secretError } = await service.rpc('studio_read_connector_secret', { p_secret_ref: connector.secret_ref });
    if (secretError || typeof secret !== 'string') throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    const deployment = await verifyDeployment(secret, preview.deploymentId);
    if (deployment.readyState !== 'READY') throw new Error(`PREVIEW_NOT_READY:${deployment.readyState ?? 'UNKNOWN'}`);

    const verifiedPreview = { ...preview, status: 'READY', verified: true, verifiedAt: new Date().toISOString(), verificationStatus: 'VERIFIED', url: deployment.url ?? preview.url };
    const deploymentState = { ...((revision.deployment ?? {}) as Record<string, unknown>), preview: { deploymentId: preview.deploymentId, url: verifiedPreview.url, status: 'READY', verified: true } };
    const audit = { ...((revision.audit ?? {}) as Record<string, unknown>), verifiedBy: user.id, verifiedAt: verifiedPreview.verifiedAt, deploymentId: preview.deploymentId };
    const { error: updateError } = await client.from('studio_project_revisions').update({ preview: verifiedPreview, deployment: deploymentState, audit }).eq('id', revisionId);
    if (updateError) throw new Error('PREVIEW_VERIFICATION_UPDATE_FAILED');

    const { data: execution } = await service.from('studio_executions').select('id,preview').eq('revision_id', revisionId).eq('environment', 'PREVIEW').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (execution) await service.from('studio_executions').update({ preview: { ...(execution.preview ?? {}), ...verifiedPreview } }).eq('id', execution.id);

    return NextResponse.json({ success: true, preview: verifiedPreview, deployment: deploymentState, executionId: execution?.id ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PREVIEW_VERIFICATION_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
