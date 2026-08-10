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
    if (revision.approval_state !== 'APPROVED') throw new Error('REVISION_APPROVAL_REQUIRED');
    const deploymentState = (revision.deployment ?? {}) as Record<string, unknown>;
    const staging = (deploymentState.staging ?? {}) as Record<string, unknown>;
    const deploymentId = typeof staging.deploymentId === 'string' ? staging.deploymentId : '';
    if (staging.status !== 'READY' || !deploymentId) throw new Error('STAGING_NOT_READY');
    const { data: connector } = await client.from('studio_connectors').select('permissions,secret_ref,status,metadata').eq('owner_user_id', user.id).eq('provider','vercel').eq('status','CONNECTED').is('project_id', null).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if (!connector) throw new Error('VERCEL_CONNECTOR_REQUIRED');
    if (!Array.isArray(connector.permissions) || !connector.permissions.includes('DEPLOY_STAGING')) throw new Error('VERCEL_DEPLOY_STAGING_PERMISSION_REQUIRED');
    if (!connector.secret_ref) throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    const { data: secret, error: secretError } = await service.rpc('studio_read_connector_secret', { p_secret_ref: connector.secret_ref });
    if (secretError || typeof secret !== 'string') throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    const response = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(deploymentId)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`VERCEL_DEPLOYMENT_READ_FAILED:${response.status}`);
    if (payload.readyState !== 'READY') throw new Error(`STAGING_NOT_READY:${payload.readyState ?? 'UNKNOWN'}`);
    const verifiedAt = new Date().toISOString();
    const nextStaging = { ...staging, status: 'READY', verified: true, verificationStatus: 'VERIFIED', verifiedAt, url: payload.url ?? staging.url };
    const nextDeployment = { ...deploymentState, staging: nextStaging };
    const audit = { ...((revision.audit ?? {}) as Record<string, unknown>), stagingVerifiedBy: user.id, stagingVerifiedAt: verifiedAt, stagingDeploymentId: deploymentId };
    const { error } = await client.from('studio_project_revisions').update({ deployment: nextDeployment, audit }).eq('id', revisionId);
    if (error) throw new Error('STAGING_VERIFICATION_UPDATE_FAILED');
    return NextResponse.json({ success: true, staging: nextStaging, deployment: nextDeployment });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'STAGING_VERIFICATION_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
