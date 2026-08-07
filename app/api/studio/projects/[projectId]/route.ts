import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';

export async function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    await requireStudioUser(request);
    const { client } = await requireStudioUser(request);
    const { projectId } = await context.params;
    const { data, error } = await client.from('studio_projects').select('*').eq('id', projectId).single();
    if (error || !data) return NextResponse.json({ success: false, error: 'PROJECT_NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ success: true, project: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'STUDIO_REQUEST_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { client } = await requireStudioUser(request);
    const { projectId } = await context.params;
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    for (const key of ['name', 'objective', 'status', 'environment', 'context', 'requirements', 'architecture', 'capabilities', 'integrations', 'execution_graph', 'environment_state', 'delivery', 'intelligence_snapshot', 'metadata']) {
      if (key in body) patch[key] = body[key];
    }
    if ('environment' in patch && !['PREVIEW', 'STAGING', 'PRODUCTION'].includes(String(patch.environment))) {
      throw new Error('INVALID_ENVIRONMENT');
    }
    if ('status' in patch && !['DRAFT','PLANNING','READY','EXECUTING','REVIEW','STAGED','DELIVERED','ARCHIVED'].includes(String(patch.status))) {
      throw new Error('INVALID_PROJECT_STATUS');
    }
    const { data, error } = await client.from('studio_projects').update(patch).eq('id', projectId).select('*').single();
    if (error || !data) return NextResponse.json({ success: false, error: 'PROJECT_UPDATE_FORBIDDEN_OR_NOT_FOUND' }, { status: 403 });
    return NextResponse.json({ success: true, project: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'STUDIO_REQUEST_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
