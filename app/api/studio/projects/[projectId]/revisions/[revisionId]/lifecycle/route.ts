import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { POST as executeRevision } from '../execute/route';

const ACTIONS = [
  'PREVIEW_READY',
  'STAGING_READY',
  'PRODUCTION_APPROVED',
  'DELIVERED',
  'ROLLBACK_REQUESTED',
  'VERIFY_PREVIEW',
  'EXECUTE_STAGING',
  'APPROVE_PRODUCTION',
  'EXECUTE_PRODUCTION',
] as const;
type LifecycleAction = (typeof ACTIONS)[number];

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'STUDIO_LIFECYCLE_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'REVISION_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

async function executeEnvironment(request: Request, projectId: string, revisionId: string, environment: 'STAGING' | 'PRODUCTION', operation: 'DEPLOY' | 'ROLLBACK' = 'DEPLOY') {
  const headers = new Headers(request.headers);
  headers.delete('content-length');
  const internalRequest = new Request(request.url, { method: 'POST', headers, body: JSON.stringify({ environment, operation }) });
  return executeRevision(internalRequest, { params: Promise.resolve({ projectId, revisionId }) });
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string; revisionId: string }> }) {
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId, revisionId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const action = body.action as LifecycleAction;
    if (!ACTIONS.includes(action)) throw new Error('INVALID_LIFECYCLE_ACTION');

    const canonicalAction = action === 'PREVIEW_READY' ? 'VERIFY_PREVIEW'
      : action === 'STAGING_READY' ? 'EXECUTE_STAGING'
      : action === 'PRODUCTION_APPROVED' ? 'APPROVE_PRODUCTION'
      : action === 'DELIVERED' ? 'EXECUTE_PRODUCTION'
      : action;

    const { data: revision, error: revisionError } = await client.from('studio_project_revisions')
      .select('id,project_id,version,change_class,approval_state,preview,deployment,audit')
      .eq('id', revisionId).eq('project_id', projectId).single();
    if (revisionError || !revision) throw new Error('REVISION_NOT_FOUND');

    const preview = (revision.preview as Record<string, unknown> | null) ?? {};
    const deployment = (revision.deployment as Record<string, unknown> | null) ?? {};
    const audit = { ...(revision.audit ?? {}), lastLifecycleAction: action, lastLifecycleCanonicalAction: canonicalAction, lastLifecycleActor: user.id, lastLifecycleAt: new Date().toISOString() };

    if (canonicalAction === 'VERIFY_PREVIEW') {
      if (preview.status !== 'READY' || typeof preview.url !== 'string' || !preview.url) throw new Error('PREVIEW_NOT_READY');
      const response = await fetch(preview.url, { method: 'GET', redirect: 'manual', cache: 'no-store' });
      if (![200, 301, 302, 307, 308].includes(response.status)) throw new Error(`PREVIEW_VERIFICATION_FAILED:${response.status}`);
      const nextPreview = { ...preview, verified: true, verifiedAt: new Date().toISOString(), verificationStatus: 'VERIFIED' };
      const { data, error } = await client.from('studio_project_revisions').update({ preview: nextPreview, audit }).eq('id', revisionId).select('*').single();
      if (error || !data) throw new Error('STUDIO_LIFECYCLE_UPDATE_FAILED');
      return NextResponse.json({ success: true, action, revision: data });
    }

    if (canonicalAction === 'EXECUTE_STAGING') {
      if (revision.approval_state !== 'APPROVED') throw new Error('REVISION_APPROVAL_REQUIRED');
      if (preview.status !== 'READY' || preview.verified !== true) throw new Error('PREVIEW_VALIDATION_REQUIRED');
      return executeEnvironment(request, projectId, revisionId, 'STAGING');
    }

    if (canonicalAction === 'APPROVE_PRODUCTION') {
      if (revision.approval_state !== 'APPROVED') throw new Error('REVISION_APPROVAL_REQUIRED');
      const staging = (deployment.staging as Record<string, unknown> | undefined) ?? {};
      if (staging.status !== 'READY' || staging.verified !== true) throw new Error('STAGING_VALIDATION_REQUIRED');
      const nextDeployment = { ...deployment, productionApproval: { status: 'APPROVED', approvedBy: user.id, approvedAt: new Date().toISOString() } };
      const { data, error } = await client.from('studio_project_revisions').update({ deployment: nextDeployment, audit }).eq('id', revisionId).select('*').single();
      if (error || !data) throw new Error('PRODUCTION_APPROVAL_FAILED');
      return NextResponse.json({ success: true, action, revision: data });
    }

    if (canonicalAction === 'EXECUTE_PRODUCTION') {
      if (revision.approval_state !== 'APPROVED') throw new Error('REVISION_APPROVAL_REQUIRED');
      if ((deployment.productionApproval as Record<string, unknown> | undefined)?.status !== 'APPROVED') throw new Error('PRODUCTION_APPROVAL_REQUIRED');
      const staging = (deployment.staging as Record<string, unknown> | undefined) ?? {};
      if (staging.status !== 'READY' || staging.verified !== true) throw new Error('STAGING_VALIDATION_REQUIRED');
      return executeEnvironment(request, projectId, revisionId, 'PRODUCTION');
    }

    if (canonicalAction === 'ROLLBACK_REQUESTED') {
      if (revision.approval_state !== 'APPROVED') throw new Error('REVISION_APPROVAL_REQUIRED');
      const production = (deployment.production as Record<string, unknown> | undefined) ?? {};
      if (production.status !== 'READY' && production.status !== 'ROLLED_BACK') throw new Error('PRODUCTION_NOT_READY');
      return executeEnvironment(request, projectId, revisionId, 'PRODUCTION', 'ROLLBACK');
    }

    throw new Error('INVALID_LIFECYCLE_ACTION');
  } catch (error) {
    return errorResponse(error);
  }
}
