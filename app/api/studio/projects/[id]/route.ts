import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/server';
import { persistHorusExecutionError, persistHorusExecutionLog } from '@/lib/core/executionLog';
import { runHorusCore } from '@/lib/core/horusGraph';
import { createRevision, updateProject } from '@/lib/studio/repository';
import { buildPlan } from '@/lib/studio/capabilities';
import type { StudioEnvironment } from '@/lib/studio/types';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { user } = await requirePermission('workspace.write');
    const { id } = await params;
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ success: false, error: 'INVALID_REQUEST_BODY' }, { status: 400 });
    const objective = typeof body.objective === 'string' ? body.objective.trim() : undefined;
    const environment: StudioEnvironment | undefined = ['PREVIEW','STAGING','PRODUCTION'].includes(body.environment) ? body.environment : undefined;
    const patch = { ...body, ...(objective ? { objective, architecture: buildPlan(objective, environment ?? 'PREVIEW') } : {}), ...(environment ? { environment } : {}) };
    delete patch.id;
    const project = await updateProject(id, patch);
    await createRevision(id, user.id, { project, reason: 'manual_update' });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ success: false, error: message === 'AUTHENTICATION_REQUIRED' ? message : 'FORBIDDEN' }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 403 });
  }
}

export async function POST(req: Request, { params }: Params) {
  const startedAt = new Date();
  let requestId = crypto.randomUUID();
  try {
    const { user } = await requirePermission('ai.execute');
    const { id } = await params;
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ success: false, error: 'INVALID_REQUEST_BODY' }, { status: 400 });
    if (typeof body.request_id === 'string' && body.request_id.trim()) requestId = body.request_id.trim();
    const objective = typeof body.objective === 'string' ? body.objective.trim() : '';
    if (!objective) return NextResponse.json({ success: false, error: 'OBJECTIVE_REQUIRED' }, { status: 400 });
    const environment = body.environment === 'PRODUCTION' ? 'PRODUCTION' : body.environment === 'STAGING' ? 'STAGING' : 'PREVIEW';
    const plan = buildPlan(objective, environment);
    const result = await runHorusCore({
      event_type: 'studio.project.execute',
      source: 'studio',
      payload: {
        project_id: id,
        request_id: requestId,
        objective,
        execution_graph: plan.execution_graph,
        capabilities: plan.capabilities,
        integrations: plan.integrations,
        environment,
      },
    });
    const ownerScope = user.organizationId ? `org:${user.organizationId}` : `user:${user.id}`;
    const executionLogId = await persistHorusExecutionLog({
      requestId,
      eventType: 'studio.project.execute',
      source: 'studio',
      startedAt,
      state: result,
      ownership: { ownerScope, userId: user.id, organizationId: user.organizationId },
      metadata: { project_id: id, capabilities: plan.capabilities, integrations: plan.integrations, environment },
    });
    await updateProject(id, { status: result.error ? 'REVIEW' : 'REVIEW', architecture: plan });
    await createRevision(id, user.id, { plan, result: { error: result.error ?? null, action: result.action } });
    return NextResponse.json({ success: !result.error, data: { request_id: requestId, execution_log_id: executionLogId, plan, result } }, { status: result.error ? 400 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'FORBIDDEN' ? 403 : 500;
    if (status === 500) {
      try { await persistHorusExecutionError({ requestId, eventType: 'studio.project.execute', source: 'studio', startedAt, error, ownership: { ownerScope: null, userId: null, organizationId: null } }); } catch { /* preserve public error contract */ }
    }
    return NextResponse.json({ success: false, error: status === 401 ? 'AUTHENTICATION_REQUIRED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR' }, { status });
  }
}
