import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';

const APPROVAL_STATES = ['APPROVED', 'REJECTED'] as const;
type ApprovalState = (typeof APPROVAL_STATES)[number];

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'REVISION_APPROVAL_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'REVISION_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string; revisionId: string }> }) {
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId, revisionId } = await context.params;
    const body = await request.json();
    const state = body.state as ApprovalState;
    if (!APPROVAL_STATES.includes(state)) throw new Error('INVALID_APPROVAL_STATE');

    const { data: revision, error: revisionError } = await client
      .from('studio_project_revisions')
      .select('id,project_id,version,change_class,approval_state,preview')
      .eq('id', revisionId)
      .eq('project_id', projectId)
      .single();
    if (revisionError || !revision) throw new Error('REVISION_NOT_FOUND');

    if (state === 'REJECTED') {
      const { data, error } = await client.from('studio_project_revisions').update({ approval_state: 'REJECTED', approved_by: null, approved_at: null }).eq('id', revisionId).select('*').single();
      if (error || !data) throw new Error('REVISION_APPROVAL_FAILED');
      return NextResponse.json({ success: true, revision: data });
    }

    const preview = revision.preview as { status?: string; verified?: boolean } | null;
    if (preview?.status !== 'READY' || preview.verified !== true) throw new Error('PREVIEW_VALIDATION_REQUIRED');

    const { data, error } = await client
      .from('studio_project_revisions')
      .update({ approval_state: 'APPROVED', approved_by: user.id, approved_at: new Date().toISOString() })
      .eq('id', revisionId)
      .select('*')
      .single();
    if (error || !data) throw new Error('REVISION_APPROVAL_FAILED');
    return NextResponse.json({ success: true, revision: data });
  } catch (error) {
    return errorResponse(error);
  }
}
