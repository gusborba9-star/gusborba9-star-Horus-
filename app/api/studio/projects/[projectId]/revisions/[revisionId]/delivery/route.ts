import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request, context: { params: Promise<{ projectId: string; revisionId: string }> }) {
  const service = getServiceSupabase();
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId, revisionId } = await context.params;
    const { data: project } = await client.from('studio_projects').select('id,owner_user_id').eq('id', projectId).single();
    if (!project || project.owner_user_id !== user.id) throw new Error('PROJECT_NOT_FOUND');
    const { data: revision } = await client.from('studio_project_revisions').select('id,project_id,approval_state,deployment,audit').eq('id', revisionId).eq('project_id', projectId).single();
    if (!revision) throw new Error('REVISION_NOT_FOUND');
    const deployment = (revision.deployment ?? {}) as Record<string, unknown>;
    const production = (deployment.production ?? {}) as Record<string, unknown>;
    const deploymentId = typeof production.deploymentId === 'string' ? production.deploymentId : '';
    if (production.status !== 'READY' || production.verified !== true || !deploymentId) throw new Error('PRODUCTION_VERIFICATION_REQUIRED');
    const { data: connector } = await client.from('studio_connectors').select('id,secret_ref,status,permissions,metadata').eq('owner_user_id', user.id).eq('provider','vercel').eq('status','CONNECTED').is('project_id',null).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if (!connector) throw new Error('VERCEL_CONNECTOR_REQUIRED');
    if (!Array.isArray(connector.permissions) || !connector.permissions.includes('DEPLOY_PRODUCTION')) throw new Error('VERCEL_DEPLOY_PRODUCTION_PERMISSION_REQUIRED');
    if (!connector.secret_ref) throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    const { data: secret, error: secretError } = await service.rpc('studio_read_connector_secret', { p_secret_ref: connector.secret_ref });
    if (secretError || typeof secret !== 'string') throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    const vercelProject = typeof connector.metadata?.vercelProjectId === 'string' ? connector.metadata.vercelProjectId : '';
    if (!vercelProject) throw new Error('VERCEL_CONNECTOR_METADATA_REQUIRED');
    const response = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(deploymentId)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`VERCEL_DEPLOYMENT_READ_FAILED:${response.status}`);
    if (payload.readyState !== 'READY') throw new Error(`PRODUCTION_NOT_READY:${payload.readyState ?? 'UNKNOWN'}`);
    const deliveredAt = new Date().toISOString();
    const delivery = { status: 'DELIVERED', deploymentId, url: payload.url ?? production.url, deliveredAt, verified: true };
    const nextDeployment = { ...deployment, production: { ...production, status: 'READY', verified: true }, delivery };
    const audit = { ...((revision.audit ?? {}) as Record<string, unknown>), deliveredBy: user.id, deliveredAt, deliveredDeploymentId: deploymentId };
    const { error } = await client.from('studio_project_revisions').update({ deployment: nextDeployment, audit }).eq('id', revisionId);
    if (error) throw new Error('DELIVERY_UPDATE_FAILED');
    return NextResponse.json({ success: true, delivery, deployment: nextDeployment });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DELIVERY_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
