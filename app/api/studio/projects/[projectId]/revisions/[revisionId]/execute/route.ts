import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

const IDEMPOTENCY_PREFIX = 'studio-preview:';
const TEST_BUDGET_BRL = 0.01;

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'STUDIO_EXECUTION_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'REVISION_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

function metadataString(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return '';
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

function metadataNumber(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

async function createExecutionLog(service: ReturnType<typeof getServiceSupabase>, executionId: string, status: string, errorMessage?: string) {
  const { data, error } = await service.from('horus_execution_logs').insert({
    request_id: executionId,
    event_type: 'STUDIO_REVISION_EXECUTION',
    source: 'studio',
    action: 'PREVIEW_EXECUTION',
    status,
    confidence: 1,
    requires_human_review: false,
    memory_matches: 0,
    error_message: errorMessage ?? null,
    metadata: { executionId },
  }).select('id').single();
  if (error || !data) throw new Error('EXECUTION_LOG_CREATE_FAILED');
  return data.id as string;
}

async function updateExecutionLog(service: ReturnType<typeof getServiceSupabase>, logId: string, status: 'COMPLETED' | 'ERROR', errorMessage?: string) {
  const { error } = await service.from('horus_execution_logs').update({
    status,
    error_message: errorMessage ?? null,
    completed_at: new Date().toISOString(),
  }).eq('id', logId);
  if (error) throw new Error('EXECUTION_LOG_UPDATE_FAILED');
}

async function createBudget(service: ReturnType<typeof getServiceSupabase>, userId: string, operationId: string) {
  const { data: policy, error: policyError } = await service.from('economic_policy').select('version,minimum_gross_margin_rate').eq('id', true).single();
  if (policyError || !policy) throw new Error('ECONOMIC_POLICY_UNAVAILABLE');
  const { data: pricing, error: pricingError } = await service.from('pricing_snapshots').select('id').order('created_at', { ascending: false }).limit(1).single();
  if (pricingError || !pricing) throw new Error('PRICING_SNAPSHOT_UNAVAILABLE');
  const { data: fx, error: fxError } = await service.from('fx_snapshots').select('id').order('observed_at', { ascending: false }).limit(1).single();
  if (fxError || !fx) throw new Error('FX_SNAPSHOT_UNAVAILABLE');
  const { data, error } = await service.from('execution_budgets').insert({
    user_id: userId, organization_id: null, operation_id: operationId, economic_policy_version: policy.version, pricing_snapshot_id: pricing.id, fx_snapshot_id: fx.id,
    authorized_credits: 1, revenue_allocated_brl: TEST_BUDGET_BRL, minimum_margin_rate: Number(policy.minimum_gross_margin_rate), maximum_provider_cost_brl: TEST_BUDGET_BRL,
    maximum_total_cost_brl: TEST_BUDGET_BRL, max_attempts: 1, max_input_tokens: 0, max_output_tokens: 0, max_reasoning_tokens: 0, max_steps: 1, max_tool_calls: 0,
    max_execution_seconds: 300, remaining_cost_brl: TEST_BUDGET_BRL, remaining_attempts: 1, remaining_input_tokens: 0, remaining_output_tokens: 0,
    remaining_reasoning_tokens: 0, status: 'AUTHORIZED', net_revenue_brl: TEST_BUDGET_BRL, gross_revenue_brl: TEST_BUDGET_BRL, revenue_deductions_brl: 0,
    pricing_freshness: 'FRESH', pricing_age_seconds: 0, maximum_tree_cost_brl: TEST_BUDGET_BRL * (1 - Number(policy.minimum_gross_margin_rate)),
  }).select('id').single();
  if (error || !data) throw new Error(`ECONOMIC_BUDGET_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data.id as string;
}

async function createAttempt(service: ReturnType<typeof getServiceSupabase>, budgetId: string) {
  const { data, error } = await service.rpc('authorize_horus_execution_attempt', {
    p_budget_id: budgetId, p_attempt_number: 1, p_provider_id: 'vercel', p_model_id: 'vercel/deployment', p_capability: 'DEV', p_maximum_cost_brl: 0,
    p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_endpoint_id: 'vercel.deployments', p_fallback_from_attempt_id: null,
  });
  if (error || !data) throw new Error(`ECONOMIC_AUTHORIZATION_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data as { id: string };
}

async function deployVercelPreview(secret: string, projectName: string, repoId: number, ref: string) {
  const response = await fetch('https://api.vercel.com/v13/deployments?forceNew=1', {
    method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: projectName, gitSource: { type: 'github', repoId, ref }, target: 'preview' }), cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`VERCEL_DEPLOYMENT_FAILED:${payload?.error?.code ?? response.status}`);
  return payload as { id?: string; uid?: string; url?: string; readyState?: string };
}

async function waitForVercelReady(secret: string, deploymentId: string) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const response = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(deploymentId)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
    if (!response.ok) throw new Error(`VERCEL_DEPLOYMENT_READ_FAILED:${response.status}`);
    const payload = await response.json() as { readyState?: string; url?: string };
    if (payload.readyState === 'READY') return payload;
    if (payload.readyState === 'ERROR' || payload.readyState === 'CANCELED') throw new Error(`VERCEL_DEPLOYMENT_${payload.readyState}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error('VERCEL_DEPLOYMENT_TIMEOUT');
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string; revisionId: string }> }) {
  let executionId = '';
  let executionLogId = '';
  let attemptId = '';
  const service = getServiceSupabase();
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId, revisionId } = await context.params;
    const body = await request.json().catch(() => ({}));
    if ((body.environment ?? 'PREVIEW') !== 'PREVIEW') throw new Error('ONLY_PREVIEW_EXECUTION_SUPPORTED');

    const { data: project, error: projectError } = await client.from('studio_projects').select('id,owner_user_id,name,environment').eq('id', projectId).single();
    if (projectError || !project || project.owner_user_id !== user.id) throw new Error('PROJECT_NOT_FOUND');
    const { data: revision, error: revisionError } = await client.from('studio_project_revisions').select('id,project_id,version,change_class,approval_state,optimized_spec,preview,deployment').eq('id', revisionId).eq('project_id', projectId).single();
    if (revisionError || !revision) throw new Error('REVISION_NOT_FOUND');
    if (!revision.optimized_spec || typeof revision.optimized_spec !== 'object') throw new Error('OPTIMIZED_SPEC_REQUIRED');
    if ((revision.preview as { status?: string } | null)?.status === 'READY') throw new Error('PREVIEW_ALREADY_READY');

    const idempotencyKey = `${IDEMPOTENCY_PREFIX}${revisionId}`;
    const { data: existing } = await service.from('studio_executions').select('*').eq('project_id', projectId).eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing?.status === 'SUCCEEDED') return NextResponse.json({ success: true, execution: existing, idempotent: true });
    if (existing?.status === 'RUNNING') throw new Error('EXECUTION_ALREADY_RUNNING');

    if (existing?.id) {
      executionId = existing.id;
      executionLogId = existing.execution_log_id ?? '';
    } else {
      executionLogId = await createExecutionLog(service, crypto.randomUUID(), 'RUNNING');
      const { data: execution, error: executionError } = await service.from('studio_executions').insert({
        project_id: projectId, revision_id: revisionId, owner_user_id: user.id, capability: 'DEV', status: 'RUNNING', economic_authorized: false,
        approval_required: revision.approval_state === 'PENDING', approval_granted: revision.approval_state === 'APPROVED', estimated_cost_brl: TEST_BUDGET_BRL, actual_cost_brl: null,
        request: { environment: 'PREVIEW', revisionId }, result: {}, operation_id: crypto.randomUUID(), execution_log_id: executionLogId, complexity: revision.change_class === 'MAJOR' ? 'HIGH' : 'MEDIUM',
        environment: 'PREVIEW', idempotency_key: idempotencyKey, risk: revision.change_class === 'MAJOR' ? 'HIGH' : 'LOW', optimized_spec: revision.optimized_spec,
        preview: { status: 'PENDING' }, staging: { status: 'LOCKED' }, delivery: { status: 'NOT_DELIVERED' },
      }).select('*').single();
      if (executionError || !execution) throw new Error(`EXECUTION_CREATE_FAILED:${executionError?.message ?? 'UNKNOWN'}`);
      executionId = execution.id;
    }

    const { data: projectConnector, error: projectConnectorError } = await client.from('studio_connectors')
      .select('id,provider,permissions,status,secret_ref,metadata,expires_at,revoked_at,owner_user_id,project_id,created_at')
      .eq('project_id', projectId).eq('provider', 'vercel').eq('status', 'CONNECTED')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (projectConnectorError) throw new Error(`VERCEL_CONNECTOR_LOOKUP_FAILED:${projectConnectorError.message}`);

    let connector = projectConnector;
    if (!connector) {
      const { data: globalConnector, error: globalConnectorError } = await client.from('studio_connectors')
        .select('id,provider,permissions,status,secret_ref,metadata,expires_at,revoked_at,owner_user_id,project_id,created_at')
        .is('project_id', null).eq('owner_user_id', user.id).eq('provider', 'vercel').eq('status', 'CONNECTED')
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (globalConnectorError) throw new Error(`VERCEL_CONNECTOR_LOOKUP_FAILED:${globalConnectorError.message}`);
      connector = globalConnector;
    }
    if (!connector || connector.owner_user_id !== user.id) throw new Error('VERCEL_CONNECTOR_REQUIRED');
    if (!Array.isArray(connector.permissions) || !connector.permissions.includes('DEPLOY_PREVIEW')) throw new Error('VERCEL_DEPLOY_PREVIEW_PERMISSION_REQUIRED');
    if (!connector.secret_ref) throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    if (connector.revoked_at || (connector.expires_at && new Date(connector.expires_at).getTime() <= Date.now())) throw new Error('CONNECTOR_CREDENTIAL_EXPIRED_OR_REVOKED');

    const budgetId = await createBudget(service, user.id, executionId);
    const attempt = await createAttempt(service, budgetId);
    attemptId = attempt.id;
    const { error: executionAuthorizationError } = await service.from('studio_executions').update({ budget_id: budgetId, attempt_id: attemptId, connector_id: connector.id, economic_authorized: true }).eq('id', executionId);
    if (executionAuthorizationError) throw new Error('EXECUTION_AUTHORIZATION_UPDATE_FAILED');

    const { data: secret, error: secretError } = await service.rpc('studio_read_connector_secret', { p_secret_ref: connector.secret_ref });
    if (secretError || typeof secret !== 'string') throw new Error('CONNECTOR_SECRET_UNAVAILABLE');

    const metadata = connector.metadata ?? {};
    const vercelProject = metadataString(metadata, 'vercelProjectId');
    const repoId = metadataNumber(metadata, 'repoId');
    const ref = metadataString(metadata, 'ref') || 'main';
    if (!vercelProject || repoId === null) throw new Error('VERCEL_CONNECTOR_METADATA_REQUIRED');

    const startedAt = Date.now();
    const deployment = await deployVercelPreview(secret, vercelProject, repoId, ref);
    const deploymentId = deployment.id ?? deployment.uid;
    if (!deploymentId) throw new Error('VERCEL_DEPLOYMENT_ID_MISSING');
    const ready = await waitForVercelReady(secret, deploymentId);
    const actualCost = 0;

    const { error: reconciliationError } = await service.rpc('reconcile_horus_execution_attempt', {
      p_attempt_id: attemptId, p_actual_cost_brl: actualCost, p_status: 'SUCCEEDED', p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_cached_input_tokens: 0,
      p_request_units: 1, p_image_units: 0, p_provider_request_id: deploymentId, p_actual_provider: 'vercel', p_actual_model: 'deployment', p_latency_ms: Date.now() - startedAt,
      p_raw_usage: { deploymentId, readyState: ready.readyState },
    });
    if (reconciliationError) throw new Error(`ECONOMIC_RECONCILIATION_FAILED:${reconciliationError.message}`);

    const result = { deploymentId, url: ready.url ?? deployment.url ?? null, readyState: ready.readyState };
    const { data: updatedExecution, error: updateExecutionError } = await service.from('studio_executions').update({ status: 'SUCCEEDED', actual_cost_brl: actualCost, provider_id: 'vercel', model_id: 'vercel/deployment', result, preview: { status: 'READY', deploymentId, url: result.url, verified: false } }).eq('id', executionId).select('*').single();
    if (updateExecutionError || !updatedExecution) throw new Error('EXECUTION_FINALIZE_FAILED');

    const { data: currentRevision, error: currentRevisionError } = await client.from('studio_project_revisions').select('preview,deployment,audit').eq('id', revisionId).single();
    if (currentRevisionError || !currentRevision) throw new Error('REVISION_NOT_FOUND');
    const preview = { ...(currentRevision.preview ?? {}), status: 'READY', deploymentId, url: result.url, verified: false };
    const deploymentState = { ...(currentRevision.deployment ?? {}), preview: { deploymentId, url: result.url, status: 'READY' } };
    const audit = { ...(currentRevision.audit ?? {}), lastExecutionId: executionId, lastExecutionAt: new Date().toISOString() };
    const { error: revisionUpdateError } = await client.from('studio_project_revisions').update({ preview, deployment: deploymentState, audit }).eq('id', revisionId);
    if (revisionUpdateError) throw new Error('REVISION_PREVIEW_UPDATE_FAILED');
    if (executionLogId) await updateExecutionLog(service, executionLogId, 'COMPLETED');
    return NextResponse.json({ success: true, execution: updatedExecution, revisionId, preview: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'STUDIO_EXECUTION_FAILED';
    if (executionId) await service.from('studio_executions').update({ status: 'FAILED', result: { error: message } }).eq('id', executionId).neq('status', 'SUCCEEDED');
    if (executionLogId) await updateExecutionLog(service, executionLogId, 'ERROR', message).catch(() => undefined);
    if (attemptId) await service.rpc('reconcile_horus_execution_attempt', {
      p_attempt_id: attemptId, p_actual_cost_brl: 0, p_status: 'FAILED', p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_cached_input_tokens: 0, p_request_units: 0,
      p_image_units: 0, p_provider_request_id: null, p_actual_provider: null, p_actual_model: null, p_latency_ms: null, p_raw_usage: { error: message },
    });
    return errorResponse(error);
  }
}
