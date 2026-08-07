import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';

const ACTIONS = ['PREVIEW_READY', 'STAGING_READY', 'PRODUCTION_APPROVED', 'DELIVERED', 'ROLLBACK_REQUESTED'] as const;
type LifecycleAction = (typeof ACTIONS)[number];

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'STUDIO_LIFECYCLE_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'REVISION_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string; revisionId: string }> }) {
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId, revisionId } = await context.params;
    const body = await request.json();
    const action = body.action as LifecycleAction;
    if (!ACTIONS.includes(action)) throw new Error('INVALID_LIFECYCLE_ACTION');

    const { data: revision, error: revisionError } = await client
      .from('studio_project_revisions')
      .select('id,project_id,version,change_class,approval_state,preview,deployment,audit')
      .eq('id', revisionId)
      .eq('project_id', projectId)
      .single();
    if (revisionError || !revision) throw new Error('REVISION_NOT_FOUND');

    const audit = { ...(revision.audit ?? {}), lastLifecycleAction: action, lastLifecycleActor: user.id, lastLifecycleAt: new Date().toISOString() };
    const preview = { ...(revision.preview ?? {}) };
    const deployment = { ...(revision.deployment ?? {}) };

    if (action === 'PREVIEW_READY') {
      preview.status = 'READY';
      preview.url = typeof body.url === 'string' ? body.url : preview.url ?? null;
      preview.verified = body.verified === true;
    }
    if (action === 'STAGING_READY') {
      if (revision.approval_state !== 'APPROVED') throw new Error('REVISION_APPROVAL_REQUIRED');
      if (preview.status !== 'READY' || preview.verified !== true) throw new Error('PREVIEW_VALIDATION_REQUIRED');
      deployment.staging = { status: 'READY', url: typeof body.url === 'string' ? body.url : null, verified: body.verified === true };
    }
    if (action === 'PRODUCTION_APPROVED') {
      if (revision.approval_state !== 'APPROVED') throw new Error('REVISION_APPROVAL_REQUIRED');
      if (deployment.staging?.status !== 'READY' || deployment.staging?.verified !== true) throw new Error('STAGING_VALIDATION_REQUIRED');
      deployment.productionApproval = { status: 'APPROVED', approvedBy: user.id, approvedAt: new Date().toISOString() };
    }
    if (action === 'DELIVERED') {
      if (deployment.productionApproval?.status !== 'APPROVED') throw new Error('PRODUCTION_APPROVAL_REQUIRED');
      deployment.delivery = { status: 'DELIVERED', deliveredAt: new Date().toISOString(), target: typeof body.target === 'string' ? body.target : null };
    }
    if (action === 'ROLLBACK_REQUESTED') {
      const targetVersion = Number(body.target_version);
      if (!Number.isInteger(targetVersion) || targetVersion < 1 || targetVersion >= revision.version) throw new Error('INVALID_ROLLBACK_TARGET');
      deployment.rollback = { status: 'REQUESTED', targetVersion, requestedBy: user.id, requestedAt: new Date().toISOString() };
    }

    const { data, error } = await client
      .from('studio_project_revisions')
      .update({ preview, deployment, audit })
      .eq('id', revisionId)
      .select('*')
      .single();
    if (error || !data) throw new Error('STUDIO_LIFECYCLE_UPDATE_FAILED');

    return NextResponse.json({ success: true, revision: data, action });
  } catch (error) {
    return errorResponse(error);
  }
}
