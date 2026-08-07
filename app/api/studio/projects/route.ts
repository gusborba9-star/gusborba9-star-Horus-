import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'STUDIO_REQUEST_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const { client } = await requireStudioUser(request);
    const { data, error } = await client
      .from('studio_projects')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, projects: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { client, user } = await requireStudioUser(request);
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const objective = typeof body.objective === 'string' ? body.objective.trim() : '';
    if (!name || !objective) throw new Error('PROJECT_NAME_AND_OBJECTIVE_REQUIRED');
    if (name.length > 160 || objective.length > 10000) throw new Error('PROJECT_INPUT_TOO_LARGE');

    const project = {
      owner_user_id: user.id,
      organization_id: typeof body.organization_id === 'string' ? body.organization_id : null,
      name,
      objective,
      status: 'DRAFT',
      environment: 'PREVIEW',
      context: typeof body.context === 'object' && body.context ? body.context : {},
      requirements: Array.isArray(body.requirements) ? body.requirements : [],
      architecture: {},
      capabilities: [],
      integrations: [],
      execution_graph: { nodes: [], edges: [] },
      environment_state: { preview: { status: 'NOT_CREATED' }, staging: { status: 'LOCKED' }, production: { status: 'LOCKED' } },
      delivery: { status: 'NOT_READY' },
      intelligence_snapshot: {},
      metadata: { created_via: 'studio' },
    };

    const { data, error } = await client.from('studio_projects').insert(project).select('*').single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, project: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
