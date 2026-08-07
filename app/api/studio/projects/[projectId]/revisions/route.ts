import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { buildOptimizedSpec, revisionRisk } from '@/lib/studio/engine';
import type { ProjectState } from '@/lib/studio/types';

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId } = await context.params;
    const body = await request.json();
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) throw new Error('REVISION_PROMPT_REQUIRED');

    const { data: project, error: projectError } = await client.from('studio_projects').select('*').eq('id', projectId).single();
    if (projectError || !project) return NextResponse.json({ success: false, error: 'PROJECT_NOT_FOUND' }, { status: 404 });

    const state: ProjectState = {
      identity: { id: project.id, name: project.name, ownerUserId: project.owner_user_id },
      objective: project.objective,
      context: project.context ?? {},
      requirements: Array.isArray(project.requirements) ? project.requirements : [],
      architecture: project.architecture ?? {},
      capabilities: Array.isArray(project.capabilities) ? project.capabilities : [],
      connectors: Array.isArray(project.integrations) ? project.integrations : [],
      executionGraph: project.execution_graph ?? {},
      environment: project.environment,
      environmentState: project.environment_state ?? {},
      delivery: project.delivery ?? {},
    };

    const spec = buildOptimizedSpec({ prompt, project: state, requirements: body.requirements });
    const changeClass = spec.changeClass;
    const risk = revisionRisk(changeClass);
    const { data: previous } = await client
      .from('studio_project_revisions')
      .select('id, version')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    const version = (previous?.version ?? 0) + 1;
    const approvalState = body.approval_required || changeClass === 'MAJOR' || changeClass === 'REBUILD' ? 'PENDING' : 'NOT_REQUIRED';
    const { data: revision, error } = await client.from('studio_project_revisions').insert({
      project_id: projectId,
      version,
      parent_revision_id: previous?.id ?? null,
      state: { requestedChange: prompt, risk },
      diff: { intent: prompt, changeClass },
      estimated_cost_brl: typeof body.estimated_cost_brl === 'number' ? body.estimated_cost_brl : null,
      tests: { required: true, status: 'NOT_RUN' },
      preview: { status: 'NOT_CREATED' },
      deployment: { status: 'NOT_DEPLOYED' },
      audit: { createdVia: 'nexus', userId: user.id },
      created_by: user.id,
      change_class: changeClass,
      optimized_spec: spec,
      approval_state: approvalState,
    }).select('*').single();
    if (error) throw new Error(error.message);

    await client.from('studio_projects').update({
      status: 'PLANNING',
      capabilities: spec.capabilities,
      intelligence_snapshot: spec,
    }).eq('id', projectId);

    return NextResponse.json({ success: true, revision, spec, risk }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'REVISION_CREATION_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
