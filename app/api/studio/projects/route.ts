import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/server';
import { buildPlan } from '@/lib/studio/capabilities';
import { createProject, listProjects } from '@/lib/studio/repository';
import type { StudioEnvironment } from '@/lib/studio/types';

const environments: StudioEnvironment[] = ['PREVIEW','STAGING','PRODUCTION'];

export async function GET() {
  try {
    await requirePermission('workspace.read');
    return NextResponse.json({ success: true, data: await listProjects() });
  } catch (error) {
    const code = error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED' ? 'AUTHENTICATION_REQUIRED' : 'FORBIDDEN';
    return NextResponse.json({ success: false, error: code }, { status: code === 'AUTHENTICATION_REQUIRED' ? 401 : 403 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requirePermission('workspace.write');
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ success: false, error: 'INVALID_REQUEST_BODY' }, { status: 400 });
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const objective = typeof body.objective === 'string' ? body.objective.trim() : '';
    const environment = environments.includes(body.environment) ? body.environment as StudioEnvironment : 'PREVIEW';
    if (!name || !objective) return NextResponse.json({ success: false, error: 'NAME_AND_OBJECTIVE_REQUIRED' }, { status: 400 });
    const plan = buildPlan(objective, environment);
    const project = await createProject({
      owner_user_id: user.id,
      organization_id: user.organizationId,
      name,
      objective,
      environment,
      capabilities: plan.capabilities,
      integrations: plan.integrations,
      architecture: plan,
    });
    return NextResponse.json({ success: true, data: { project, plan } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : 403;
    return NextResponse.json({ success: false, error: status === 401 ? 'AUTHENTICATION_REQUIRED' : 'FORBIDDEN' }, { status });
  }
}
