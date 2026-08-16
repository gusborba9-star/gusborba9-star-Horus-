import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { buildOptimizedSpec, revisionRisk } from '@/lib/studio/engine';
import type { ProjectState } from '@/lib/studio/types';
import { resolveNexusPlan } from '@/lib/nexus/core';
import { getLiveOpenRouterCatalog } from '@/lib/providers/openrouter-catalog';

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

    const conversationContext = Array.isArray(body.context) ? body.context.filter((item: unknown): item is string => typeof item === 'string').slice(-8) : [];
    const spec = buildOptimizedSpec({ prompt, project: state, requirements: body.requirements, conversationContext });
    const capability = spec.capabilities[0];
    const liveCatalog = await getLiveOpenRouterCatalog();
    const maxCostBrl = Number(project.intelligence_snapshot?.economicConstraints?.maxCostBrl);
    const nexusPlan = await resolveNexusPlan(client, {
      intent: [project.objective, prompt, ...conversationContext].filter(Boolean).join('\n'),
      context: [JSON.stringify(project.context ?? {}), JSON.stringify(project.requirements ?? []), ...conversationContext],
      budgetBrl: Number.isFinite(maxCostBrl) && maxCostBrl > 0 ? maxCostBrl : Number.MAX_SAFE_INTEGER,
      capability,
      liveCatalog,
    });

    const risk = revisionRisk(spec.changeClass);
    const { data: previous } = await client.from('studio_project_revisions').select('id,version').eq('project_id', projectId).order('version', { ascending: false }).limit(1).maybeSingle();
    const version = (previous?.version ?? 0) + 1;
    const approvalState = body.approval_required || spec.changeClass === 'MAJOR' || spec.changeClass === 'REBUILD' ? 'PENDING' : 'NOT_REQUIRED';

    const { data: revision, error } = await client.from('studio_project_revisions').insert({
      project_id: projectId,
      version,
      parent_revision_id: previous?.id ?? null,
      state: { requestedChange: prompt, risk },
      diff: { intent: prompt, changeClass: spec.changeClass, capability },
      estimated_cost_brl: typeof body.estimated_cost_brl === 'number' ? body.estimated_cost_brl : null,
      tests: { required: true, status: 'NOT_RUN' },
      preview: { status: 'NOT_CREATED' },
      deployment: { status: 'NOT_DEPLOYED' },
      audit: { createdVia: 'nexus', userId: user.id },
      created_by: user.id,
      change_class: spec.changeClass,
      optimized_spec: { ...spec, nexusPlan },
      approval_state: approvalState,
    }).select('*').single();
    if (error) throw new Error(error.message);

    const { error: updateError } = await client.from('studio_projects').update({ status: 'PLANNING', capabilities: spec.capabilities, intelligence_snapshot: { ...spec, nexusPlan } }).eq('id', projectId);
    if (updateError) throw new Error(updateError.message);
    return NextResponse.json({ success: true, revision, spec, nexusPlan, risk }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'REVISION_CREATION_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
