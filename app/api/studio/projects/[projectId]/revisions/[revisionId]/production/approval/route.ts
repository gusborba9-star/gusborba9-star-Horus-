import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';

export async function POST(request: Request, context: { params: Promise<{ projectId: string; revisionId: string }> }) {
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId, revisionId } = await context.params;
    const body = await request.json().catch(() => ({}));
    if (body.state !== 'APPROVED') throw new Error('INVALID_PRODUCTION_APPROVAL_STATE');
    const { data: revision, error: revisionError } = await client.from('studio_project_revisions').select('id,project_id,approval_state,preview,deployment,audit').eq('id', revisionId).eq('project_id', projectId).single();
    if (revisionError || !revision) throw new Error('REVISION_NOT_FOUND');
    if (revision.approval_state !== 'APPROVED') throw new Error('REVISION_APPROVAL_REQUIRED');
    const deployment = (revision.deployment ?? {}) as Record<string, unknown>;
    const staging = (deployment.staging ?? {}) as Record<string, unknown>;
    if (staging.status !== 'READY' || staging.verified !== true) throw new Error('STAGING_VALIDATION_REQUIRED');
    const productionApproval = { status: 'APPROVED', approvedBy: user.id, approvedAt: new Date().toISOString() };
    const nextDeployment = { ...deployment, productionApproval };
    const audit = { ...((revision.audit ?? {}) as Record<string, unknown>), productionApprovalBy: user.id, productionApprovalAt: productionApproval.approvedAt };
    const { data, error } = await client.from('studio_project_revisions').update({ deployment: nextDeployment, audit }).eq('id', revisionId).select('*').single();
    if (error || !data) throw new Error('PRODUCTION_APPROVAL_FAILED');
    return NextResponse.json({ success: true, revision: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PRODUCTION_APPROVAL_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
