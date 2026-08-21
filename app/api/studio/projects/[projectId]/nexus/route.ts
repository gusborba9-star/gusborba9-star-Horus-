import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { buildOptimizedSpec } from '@/lib/studio/engine';
import type { ProjectState } from '@/lib/studio/types';
import { resolveNexusPlan } from '@/lib/nexus/core';
import { getLiveOpenRouterCatalog } from '@/lib/providers/openrouter-catalog';
import { getInferenceProvider } from '@/lib/providers/inference';

function projectState(project: any): ProjectState {
  return { identity: { id: project.id, name: project.name, ownerUserId: project.owner_user_id }, objective: project.objective, context: project.context ?? {}, requirements: Array.isArray(project.requirements) ? project.requirements : [], architecture: project.architecture ?? {}, capabilities: Array.isArray(project.capabilities) ? project.capabilities : [], connectors: Array.isArray(project.integrations) ? project.integrations : [], executionGraph: project.execution_graph ?? {}, environment: project.environment, environmentState: project.environment_state ?? {}, delivery: project.delivery ?? {} };
}
function buildConversationContext(results: any[]) { return results.flatMap((result) => [typeof result.provider_metadata?.user_prompt === 'string' ? `Previous user intent: ${result.provider_metadata.user_prompt}` : '', typeof result.content_text === 'string' ? `Previous result text: ${result.content_text}` : '', typeof result.artifact_url === 'string' ? 'A previous artifact was generated.' : '']).filter(Boolean).slice(-8); }

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { client } = await requireStudioUser(request);
    const { projectId } = await context.params;
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) throw new Error('NEXUS_MESSAGE_REQUIRED');
    const { data: project, error: projectError } = await client.from('studio_projects').select('*').eq('id', projectId).single();
    if (projectError || !project) return NextResponse.json({ success: false, error: 'PROJECT_NOT_FOUND' }, { status: 404 });
    const { data: previousResults } = await client.from('studio_results').select('id,content_text,artifact_url,provider_metadata,created_at').eq('project_id', projectId).order('created_at', { ascending: false }).limit(8);
    const state = projectState(project);
    const conversationContext = buildConversationContext(previousResults ?? []);
    const spec = buildOptimizedSpec({ prompt: message, project: state, conversationContext });
    const requestedCapability = spec.requestedCapability;
    const liveCatalog = await getLiveOpenRouterCatalog();
    const budgetBrl = Number(project.intelligence_snapshot?.economicConstraints?.maxCostBrl);
    const plan = await resolveNexusPlan(client, { intent: [message, project.objective, ...conversationContext].filter(Boolean).join('\n'), context: [JSON.stringify(project.context ?? {}), JSON.stringify(project.requirements ?? []), ...conversationContext], budgetBrl: Number.isFinite(budgetBrl) && budgetBrl > 0 ? budgetBrl : Number.MAX_SAFE_INTEGER, capability: requestedCapability, liveCatalog });
    const { data: previousRevision } = await client.from('studio_project_revisions').select('id,version').eq('project_id', projectId).order('version', { ascending: false }).limit(1).maybeSingle();
    const version = (previousRevision?.version ?? 0) + 1;
    const deploymentCapability = ['WEBSITES', 'APPS', 'DEV'].includes(requestedCapability);
    const { data: revision, error: revisionError } = await client.from('studio_project_revisions').insert({ project_id: projectId, version, parent_revision_id: previousRevision?.id ?? null, state: { requestedChange: message, source: deploymentCapability ? 'NEXUS_LIFECYCLE_PLAN' : 'NEXUS_RESULT_PREVIEW' }, diff: { intent: message, workType: spec.workType, capability: requestedCapability }, estimated_cost_brl: null, tests: { required: true, status: 'NOT_RUN' }, preview: { status: deploymentCapability ? 'NOT_CREATED' : 'RESULT_PENDING' }, deployment: { status: 'NOT_DEPLOYED' }, audit: { createdVia: 'nexus', providerNeutral: true }, created_by: project.owner_user_id, change_class: spec.changeClass, optimized_spec: { ...spec, nexusPlan: plan }, approval_state: deploymentCapability ? 'NOT_REQUIRED' : 'PENDING' }).select('id,version,approval_state').single();
    if (revisionError || !revision) throw new Error(`NEXUS_REVISION_CREATE_FAILED:${revisionError?.message ?? 'UNKNOWN'}`);
    if (deploymentCapability) return NextResponse.json({ success: true, revision, executionMode: 'LIFECYCLE', nexus: { workType: spec.workType, capability: requestedCapability, providerId: plan.model.providerId, modelId: plan.model.modelId, source: plan.model.source } }, { status: 201 });
    const provider = getInferenceProvider(plan.model.providerId);
    const result = await provider.execute({ modelId: plan.model.modelId, systemPrompt: 'You are the Hórus Nexus execution provider. Follow the optimized task exactly and return the requested result.', userPrompt: plan.optimized.optimized, maxOutputTokens: 2048, capability: requestedCapability, executionContract: plan.model.executionContract });
    const sourceArtifactUrl = result.artifactUrl;
    const providerMetadata = { ...result.providerMetadata, user_prompt: message, work_type: spec.workType, optimized_prompt: plan.optimized.optimized, task_profile: plan.optimized.profile, execution_contract: plan.model.executionContract, usage: result.usage, request_id: result.requestId, latency_ms: result.latencyMs, ...(sourceArtifactUrl ? { source_artifact_url: sourceArtifactUrl } : {}) };
    const { data: storedResult, error: resultError } = await client.from('studio_results').insert({ project_id: projectId, revision_id: revision.id, capability: requestedCapability, provider_id: result.providerId, model_id: result.modelId, result_type: result.resultType, status: 'READY', content_text: result.text, artifact_url: null, storage_path: null, provider_metadata: providerMetadata }).select('*').single();
    if (resultError || !storedResult) throw new Error(`NEXUS_RESULT_PERSIST_FAILED:${resultError?.message ?? 'UNKNOWN'}`);
    const artifactUrl = sourceArtifactUrl ? `/api/studio/results/${storedResult.id}/artifact` : null;
    const { data: persistedResult, error: artifactUpdateError } = await client.from('studio_results').update({ artifact_url: artifactUrl }).eq('id', storedResult.id).select('*').single();
    if (artifactUpdateError || !persistedResult) throw new Error(`NEXUS_ARTIFACT_PERSIST_FAILED:${artifactUpdateError?.message ?? 'UNKNOWN'}`);
    const resultPreview = { status: 'READY', resultId: persistedResult.id, resultType: result.resultType, url: `/dashboard/studio/result/${persistedResult.id}` };
    await client.from('studio_project_revisions').update({ preview: resultPreview }).eq('id', revision.id);
    await client.from('studio_projects').update({ status: 'PLANNING', capabilities: spec.capabilities, intelligence_snapshot: { ...spec, nexusPlan: plan } }).eq('id', projectId);
    return NextResponse.json({ success: true, revision, result: persistedResult, preview: resultPreview, nexus: { workType: spec.workType, capability: requestedCapability, providerId: plan.model.providerId, modelId: plan.model.modelId, source: plan.model.source } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'NEXUS_RESULT_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
