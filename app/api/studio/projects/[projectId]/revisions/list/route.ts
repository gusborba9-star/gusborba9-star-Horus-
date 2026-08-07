import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';

export async function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { client } = await requireStudioUser(request);
    const { projectId } = await context.params;
    const { data, error } = await client.from('studio_project_revisions').select('id,project_id,version,change_class,approval_state,state,diff,optimized_spec,tests,preview,deployment,audit,created_by,created_at').eq('project_id', projectId).order('version', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, revisions: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'REVISION_LIST_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
