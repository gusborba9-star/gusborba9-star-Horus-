import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';

const TEST_BUDGET_BRL = 0.01;
const ENVIRONMENTS = ['PREVIEW', 'STAGING', 'PRODUCTION'] as const;
type Environment = (typeof ENVIRONMENTS)[number];
const PERMISSIONS: Record<Environment, string> = { PREVIEW: 'DEPLOY_PREVIEW', STAGING: 'DEPLOY_STAGING', PRODUCTION: 'DEPLOY_PRODUCTION' };
const ROLLBACK_PERMISSION = 'ROLLBACK_PRODUCTION';

type Operation = 'DEPLOY' | 'ROLLBACK';

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
async function createExecutionLog(service: ReturnType<typeof getServiceSupabase>, executionId: string, status: string, action: string, errorMessage?: string) {
  const { data, error } = await service.from('horus_execution_logs').insert({ request_id: executionId, event_type: 'STUDIO_REVISION_EXECUTION', source: 'studio', action, status, confidence: 1, requires_human_review: false, memory_matches: 0, error_message: errorMessage ?? null, metadata: { executionId, action } }).select('id').single();
  if (error || !data) throw new Error(`EXECUTION_LOG_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data.id as string;
}
async function updateExecutionLog(service: ReturnType<typeof getServiceSupabase>, logId: string, status: 'COMPLETED' | 'ERROR', errorMessage?: string) {
  const { error } = await service.from('horus_execution_logs').update({ status, error_message: errorMessage ?? null, completed_at: new Date().toISOString() }).eq('id', logId);
  if (error) throw new Error(`EXECUTION_LOG_UPDATE_FAILED:${error.message}`);
}
async function createBudget(service: ReturnType<typeof getServiceSupabase>, userId: string, operationId: string) {
  const { data: policy, error: policyError } = await service.from('economic_policy').select('version,minimum_gross_margin_rate').eq('id', true).single();
  if (policyError || !policy) throw new Error('ECONOMIC_POLICY_UNAVAILABLE');
  const { data: pricing, error: pricingError } = await service.from('pricing_snapshots').select('id').order('created_at', { ascending: false }).limit(1).single();
  if (pricingError || !pricing) throw new Error('PRICING_SNAPSHOT_UNAVAILABLE');
  const { data: fx, error: fxError } = await service.from('fx_snapshots').select('id').order('observed_at', { ascending: false }).limit(1).single();
  if (fxError || !fx) throw new Error('FX_SNAPSHOT_UNAVAILABLE');
  const { data, error } = await service.from('execution_budgets').insert({ user_id: userId, organization_id: null, operation_id: operationId, economic_policy_version: policy.version, pricing_snapshot_id: pricing.id, fx_snapshot_id: fx.id, authorized_credits: 1, revenue_allocated_brl: TEST_BUDGET_BRL, minimum_margin_rate: Number(policy.minimum_gross_margin_rate), maximum_provider_cost_brl: TEST_BUDGET_BRL, maximum_total_cost_brl: TEST_BUDGET_BRL, max_attempts: 1, max_input_tokens: 0, max_output_tokens: 0, max_reasoning_tokens: 0, max_steps: 1, max_tool_calls: 0, max_execution_seconds: 300, remaining_cost_brl: TEST_BUDGET_BRL, remaining_attempts: 1, remaining_input_tokens: 0, remaining_output_tokens: 0, remaining_reasoning_tokens: 0, status: 'AUTHORIZED', net_revenue_brl: TEST_BUDGET_BRL, gross_revenue_brl: TEST_BUDGET_BRL, revenue_deductions_brl: 0, pricing_freshness: 'FRESH', pricing_age_seconds: 0, maximum_tree_cost_brl: TEST_BUDGET_BRL * (1 - Number(policy.minimum_gross_margin_rate)) }).select('id').single();
  if (error || !data) throw new Error(`ECONOMIC_BUDGET_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data.id as string;
}
async function createAttempt(service: ReturnType<typeof getServiceSupabase>, budgetId: string, environment: Environment, operation: Operation) {
  const model = operation === 'ROLLBACK' ? 'vercel/production-rollback' : `vercel/${environment.toLowerCase()}-deployment`;
  const endpoint = operation === 'ROLLBACK' ? 'vercel.rollback.production' : `vercel.deployments.${environment.toLowerCase()}`;
  const { data, error } = await service.rpc('authorize_horus_execution_attempt', { p_budget_id: budgetId, p_attempt_number: 1, p_provider_id: 'vercel', p_model_id: model, p_capability: 'DEV', p_maximum_cost_brl: 0, p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_endpoint_id: endpoint, p_fallback_from_attempt_id: null });
  if (error || !data) throw new Error(`ECONOMIC_AUTHORIZATION_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data as { id: string };
}
async function deployVercel(secret: string, projectName: string, repoId: number, ref: string, environment: Environment) {
  const target = environment === 'PRODUCTION' ? 'production' : environment === 'STAGING' ? 'staging' : 'preview';
  const response = await fetch('https://api.vercel.com/v13/deployments?forceNew=1', { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: projectName, gitSource: { type: 'github', repoId, ref }, target }), cache: 'no-store' });
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
async function resolveConnector(client: Awaited<ReturnType<typeof requireStudioUser>>['client'], projectId: string, userId: string, environment: Environment) {
  const permission = PERMISSIONS[environment];
  const columns = 'id,provider,permissions,status,secret_ref,metadata,expires_at,revoked_at,owner_user_id,project_id,created_at';
  const { data: projectConnector, error: projectError } = await client.from('studio_connectors').select(columns).eq('project_id', projectId).eq('owner_user_id', userId).eq('provider', 'vercel').eq('status', 'CONNECTED').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (projectError) throw new Error(`VERCEL_CONNECTOR_LOOKUP_FAILED:${projectError.message}`);
  if (projectConnector) return { connector: projectConnector, permission };
  const { data: globalConnector, error: globalError } = await client.from('studio_connectors').select(columns).is('project_id', null).eq('owner_user_id', userId).eq('provider', 'vercel').eq('status', 'CONNECTED').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (globalError) throw new Error(`VERCEL_CONNECTOR_LOOKUP_FAILED:${globalError.message}`);
  if (!globalConnector) throw new Error('VERCEL_CONNECTOR_REQUIRED');
  return { connector: globalConnector, permission };
}
async function resolveRollbackTarget(secret: string, projectId: string, currentDeploymentId?: string) {
  const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
  if (!projectResponse.ok) throw new Error(`VERCEL_PROJECT_READ_FAILED:${projectResponse.status}`);
  const projectPayload = await projectResponse.json() as { targets?: { production?: { id?: string } } };
  const currentId = currentDeploymentId ?? projectPayload.targets?.production?.id;
  if (!currentId) throw new Error('VERCEL_CURRENT_PRODUCTION_REQUIRED');
  const deploymentsResponse = await fetch(`https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(projectId)}&target=production&state=READY&limit=20`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
  if (!deploymentsResponse.ok) throw new Error(`VERCEL_DEPLOYMENTS_READ_FAILED:${deploymentsResponse.status}`);
  const deploymentsPayload = await deploymentsResponse.json() as { deployments?: Array<{ uid?: string; id?: string; created?: number; readyState?: string }> };
  const candidates = (deploymentsPayload.deployments ?? []).filter((deployment) => (deployment.uid ?? deployment.id) && (deployment.uid ?? deployment.id) !== currentId).sort((a, b) => Number(b.created ?? 0) - Number(a.created ?? 0));
  if (!candidates.length) throw new Error('VERCEL_ROLLBACK_TARGET_REQUIRED');
  for (const candidate of candidates) {
    const deploymentId = candidate.uid ?? candidate.id;
    if (!deploymentId) continue;
    const aliasesResponse = await fetch(`https://api.vercel.com/v2/deployments/${encodeURIComponent(deploymentId)}/aliases`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
    if (!aliasesResponse.ok) continue;
    const aliasesPayload = await aliasesResponse.json().catch(() => ({})) as { aliases?: unknown[] };
    if (Array.isArray(aliasesPayload.aliases) && aliasesPayload.aliases.length > 0) return { currentDeploymentId: currentId, targetDeploymentId: deploymentId };
  }
  throw new Error('VERCEL_ROLLBACK_TARGET_REQUIRED');
}
async function rollbackVercel(secret: string, projectId: string, targetDeploymentId: string) {
  const response = await fetch(`https://api.vercel.com/v1/projects/${encodeURIComponent(projectId)}/rollback/${encodeURIComponent(targetDeploymentId)}`, { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`VERCEL_ROLLBACK_FAILED:${payload?.error?.code ?? response.status}`);
  return payload as Record<string, unknown>;
}
async function waitForVercelRollback(secret: string, projectId: string, targetDeploymentId: string) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const response = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
    if (!response.ok) throw new Error(`VERCEL_PROJECT_READ_FAILED:${response.status}`);
    const payload = await response.json() as { targets?: { production?: { id?: string } } };
    if (payload.targets?.production?.id === targetDeploymentId) return payload.targets.production;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error('VERCEL_ROLLBACK_TIMEOUT');
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string; revisionId: string }> }) {
  let executionId = '';
  let executionLogId = '';
  let attemptId = '';
  let environment: Environment = 'PREVIEW';
  let operation: Operation = 'DEPLOY';
  const service = getServiceSupabase();
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId, revisionId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const requestedEnvironment = typeof body.environment === 'string' ? body.environment.toUpperCase() : 'PREVIEW';
    operation = body.operation === 'ROLLBACK' ? 'ROLLBACK' : 'DEPLOY';
    if (!ENVIRONMENTS.includes(requestedEnvironment as Environment)) throw new Error('INVALID_EXECUTION_ENVIRONMENT');
    environment = requestedEnvironment as Environment;
    if (operation === 'ROLLBACK' && environment !== 'PRODUCTION') throw new Error('INVALID_ROLLBACK_ENVIRONMENT');
    const { data: project, error: projectError } = await client.from('studio_projects').select('id,owner_user_id,name,environment').eq('id', projectId).single();
    if (projectError || !project || project.owner_user_id !== user.id) throw new Error('PROJECT_NOT_FOUND');
    const { data: revision, error: revisionError } = await client.from('studio_project_revisions').select('id,project_id,version,change_class,approval_state,optimized_spec,preview,deployment').eq('id', revisionId).eq('project_id', projectId).single();
    if (revisionError || !revision) throw new Error('REVISION_NOT_FOUND');
    if (!revision.optimized_spec || typeof revision.optimized_spec !== 'object') throw new Error('OPTIMIZED_SPEC_REQUIRED');
    const previewState = (revision.preview as Record<string, unknown> | null) ?? {};
    const deploymentState = (revision.deployment as Record<string, unknown> | null) ?? {};
    const stagingState = (deploymentState.staging as Record<string, unknown> | undefined) ?? {};
    const productionApproval = (deploymentState.productionApproval as Record<string, unknown> | undefined) ?? {};
    if (operation === 'DEPLOY') {
      if (environment === 'PREVIEW' && previewState.status === 'READY') throw new Error('PREVIEW_ALREADY_READY');
      if (environment === 'STAGING' && (revision.approval_state !== 'APPROVED' || stagingState.status === 'READY' || previewState.status !== 'READY' || previewState.verified !== true)) throw new Error('STAGING_GATE_REQUIRED');
      if (environment === 'PRODUCTION' && (revision.approval_state !== 'APPROVED' || productionApproval.status !== 'APPROVED' || stagingState.status !== 'READY' || stagingState.verified !== true)) throw new Error('PRODUCTION_GATE_REQUIRED');
    } else if (revision.approval_state !== 'APPROVED') {
      throw new Error('ROLLBACK_APPROVAL_REQUIRED');
    }
    let connector: Awaited<ReturnType<typeof resolveConnector>>['connector'];
    let permission = operation === 'ROLLBACK' ? ROLLBACK_PERMISSION : PERMISSIONS[environment];
    let secret: string;
    let vercelProject: string;
    let repoId: number | null = null;
    let ref = 'main';
    let rollbackTarget: { currentDeploymentId: string; targetDeploymentId: string } | null = null;
    const { connector: resolvedConnector, permission: resolvedPermission } = await resolveConnector(client, projectId, user.id, environment);
    connector = resolvedConnector;
    if (operation === 'DEPLOY') permission = resolvedPermission;
    if (!Array.isArray(connector.permissions) || !connector.permissions.includes(permission)) throw new Error(`VERCEL_${permission}_REQUIRED`);
    if (!connector.secret_ref) throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    if (connector.revoked_at || (connector.expires_at && new Date(connector.expires_at).getTime() <= Date.now())) throw new Error('CONNECTOR_CREDENTIAL_EXPIRED_OR_REVOKED');
    const { data: secretData, error: secretError } = await service.rpc('studio_read_connector_secret', { p_secret_ref: connector.secret_ref });
    if (secretError || typeof secretData !== 'string') throw new Error('CONNECTOR_SECRET_UNAVAILABLE');
    secret = secretData;
    const metadata = connector.metadata ?? {};
    vercelProject = metadataString(metadata, 'vercelProjectId');
    repoId = metadataNumber(metadata, 'repoId');
    ref = metadataString(metadata, 'ref') || 'main';
    if (!vercelProject || repoId === null) throw new Error('VERCEL_CONNECTOR_METADATA_REQUIRED');
    if (operation === 'ROLLBACK') rollbackTarget = await resolveRollbackTarget(secret, vercelProject, (deploymentState.production as Record<string, unknown> | undefined)?.deploymentId as string | undefined);
    const idempotencyKey = operation === 'ROLLBACK' && rollbackTarget ? `studio-rollback:${revisionId}:${rollbackTarget.targetDeploymentId}` : `studio-${environment.toLowerCase()}:${revisionId}`;
    const { data: existing } = await service.from('studio_executions').select('*').eq('project_id', projectId).eq('revision_id', revisionId).eq('environment', environment).eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing?.status === 'SUCCEEDED') return NextResponse.json({ success: true, execution: existing, idempotent: true });
    if (existing?.status === 'RUNNING') throw new Error('EXECUTION_ALREADY_RUNNING');
    if (existing?.id) { executionId = existing.id; executionLogId = existing.execution_log_id ?? ''; }
    else {
      const operationId = crypto.randomUUID();
      executionLogId = await createExecutionLog(service, operationId, 'RUNNING', `${operation === 'ROLLBACK' ? 'ROLLBACK' : environment + '_EXECUTION'}`);
      const { data: execution, error: executionError } = await service.from('studio_executions').insert({ project_id: projectId, revision_id: revisionId, owner_user_id: user.id, capability: 'DEV', status: 'RUNNING', economic_authorized: false, approval_required: operation === 'ROLLBACK' || environment !== 'PREVIEW', approval_granted: operation === 'ROLLBACK' ? revision.approval_state === 'APPROVED' : environment === 'PREVIEW' || revision.approval_state === 'APPROVED', estimated_cost_brl: TEST_BUDGET_BRL, actual_cost_brl: null, request: { environment, revisionId, operation, rollbackTargetDeploymentId: rollbackTarget?.targetDeploymentId ?? null }, result: {}, operation_id: operationId, execution_log_id: executionLogId, complexity: revision.change_class === 'MAJOR' ? 'HIGH' : 'MEDIUM', environment, idempotency_key: idempotencyKey, risk: revision.change_class === 'MAJOR' ? 'HIGH' : 'LOW', optimized_spec: revision.optimized_spec, preview: { status: environment === 'PREVIEW' ? 'PENDING' : 'LOCKED' }, staging: { status: environment === 'STAGING' ? 'PENDING' : 'LOCKED' }, delivery: { status: 'NOT_DELIVERED' } }).select('*').single();
      if (executionError || !execution) throw new Error(`EXECUTION_CREATE_FAILED:${executionError?.message ?? 'UNKNOWN'}`);
      executionId = execution.id;
    }
    const budgetId = await createBudget(service, user.id, executionId);
    const attempt = await createAttempt(service, budgetId, environment, operation);
    attemptId = attempt.id;
    const { error: executionAuthorizationError } = await service.from('studio_executions').update({ budget_id: budgetId, attempt_id: attemptId, connector_id: connector.id, economic_authorized: true }).eq('id', executionId);
    if (executionAuthorizationError) throw new Error('EXECUTION_AUTHORIZATION_UPDATE_FAILED');
    const startedAt = Date.now();
    let providerResult: Record<string, unknown>;
    let result: { deploymentId: string; url: string; readyState: string; environment: Environment; rollbackFrom?: string };
    if (operation === 'ROLLBACK' && rollbackTarget) {
      await rollbackVercel(secret, vercelProject, rollbackTarget.targetDeploymentId);
      await waitForVercelRollback(secret, vercelProject, rollbackTarget.targetDeploymentId);
      providerResult = { targetDeploymentId: rollbackTarget.targetDeploymentId, previousDeploymentId: rollbackTarget.currentDeploymentId };
      const deploymentResponse = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(rollbackTarget.targetDeploymentId)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
      const deploymentPayload = deploymentResponse.ok ? await deploymentResponse.json().catch(() => ({})) as { url?: string; readyState?: string } : {};
      const deploymentUrl = deploymentPayload.url;
      if (!deploymentUrl) throw new Error('VERCEL_DEPLOYMENT_URL_MISSING');
      result = { deploymentId: rollbackTarget.targetDeploymentId, url: deploymentUrl, readyState: deploymentPayload.readyState ?? 'READY', environment, rollbackFrom: rollbackTarget.currentDeploymentId };
    } else {
      const deployment = await deployVercel(secret, vercelProject, repoId, ref, environment);
      const deploymentId = deployment.id ?? deployment.uid;
      if (!deploymentId) throw new Error('VERCEL_DEPLOYMENT_ID_MISSING');
      const ready = await waitForVercelReady(secret, deploymentId);
      const deploymentUrl = ready.url ?? deployment.url;
      if (!deploymentUrl) throw new Error('VERCEL_DEPLOYMENT_URL_MISSING');
      providerResult = { deploymentId, readyState: ready.readyState, environment };
      result = { deploymentId, url: deploymentUrl, readyState: ready.readyState ?? 'READY', environment };
    }
    const actualCost = 0;
    const { error: reconciliationError } = await service.rpc('reconcile_horus_execution_attempt', { p_attempt_id: attemptId, p_actual_cost_brl: actualCost, p_status: 'SUCCEEDED', p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_cached_input_tokens: 0, p_request_units: 1, p_image_units: 0, p_provider_request_id: result.deploymentId, p_actual_provider: 'vercel', p_actual_model: operation === 'ROLLBACK' ? 'production-rollback' : `${environment.toLowerCase()}-deployment`, p_latency_ms: Date.now() - startedAt, p_raw_usage: providerResult });
    if (reconciliationError) throw new Error(`ECONOMIC_RECONCILIATION_FAILED:${reconciliationError.message}`);
    const executionPatch = operation === 'ROLLBACK' ? { production: { status: 'ROLLED_BACK', deploymentId: result.deploymentId, url: result.url, verified: false, rolledBackFrom: result.rollbackFrom }, delivery: { status: 'ROLLED_BACK', deploymentId: result.deploymentId, url: result.url } } : environment === 'PREVIEW' ? { preview: { status: 'READY', deploymentId: result.deploymentId, url: result.url, verified: false } } : environment === 'STAGING' ? { staging: { status: 'READY', deploymentId: result.deploymentId, url: result.url, verified: false } } : { production: { status: 'READY', deploymentId: result.deploymentId, url: result.url, verified: false }, delivery: { status: 'READY', deploymentId: result.deploymentId, url: result.url } };
    const { data: updatedExecution, error: updateExecutionError } = await service.from('studio_executions').update({ status: 'SUCCEEDED', actual_cost_brl: actualCost, provider_id: 'vercel', model_id: operation === 'ROLLBACK' ? 'vercel/production-rollback' : `vercel/${environment.toLowerCase()}-deployment`, result, ...(operation === 'ROLLBACK' ? { production: executionPatch.production, delivery: executionPatch.delivery } : executionPatch) }).eq('id', executionId).select('*').single();
    if (updateExecutionError || !updatedExecution) throw new Error('EXECUTION_FINALIZE_FAILED');
    const { data: currentRevision, error: currentRevisionError } = await client.from('studio_project_revisions').select('preview,deployment,audit').eq('id', revisionId).single();
    if (currentRevisionError || !currentRevision) throw new Error('REVISION_NOT_FOUND');
    const currentPreview = (currentRevision.preview as Record<string, unknown> | null) ?? {};
    const currentDeployment = (currentRevision.deployment as Record<string, unknown> | null) ?? {};
    const nextPreview = environment === 'PREVIEW' && operation === 'DEPLOY' ? { ...currentPreview, ...executionPatch.preview } : currentPreview;
    const nextDeployment = operation === 'ROLLBACK' ? { ...currentDeployment, production: executionPatch.production, delivery: executionPatch.delivery, rollback: { status: 'ROLLED_BACK', deploymentId: result.deploymentId, fromDeploymentId: result.rollbackFrom, verified: false } } : { ...currentDeployment, ...(environment === 'STAGING' ? { staging: executionPatch.staging } : {}), ...(environment === 'PRODUCTION' ? { production: executionPatch.production, delivery: executionPatch.delivery } : {}), ...(environment === 'PREVIEW' ? { preview: executionPatch.preview } : {}) };
    const audit = { ...(currentRevision.audit ?? {}), lastExecutionId: executionId, lastExecutionAt: new Date().toISOString(), lastExecutionEnvironment: environment, lastExecutionOperation: operation };
    const { error: revisionUpdateError } = await client.from('studio_project_revisions').update({ preview: nextPreview, deployment: nextDeployment, audit }).eq('id', revisionId);
    if (revisionUpdateError) throw new Error('REVISION_LIFECYCLE_UPDATE_FAILED');
    if (executionLogId) await updateExecutionLog(service, executionLogId, 'COMPLETED');
    return NextResponse.json({ success: true, execution: updatedExecution, revisionId, environment, operation, deployment: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'STUDIO_EXECUTION_FAILED';
    if (executionId) await service.from('studio_executions').update({ status: 'FAILED', result: { error: message } }).eq('id', executionId).neq('status', 'SUCCEEDED');
    if (executionLogId) await updateExecutionLog(service, executionLogId, 'ERROR', message).catch(() => undefined);
    if (attemptId) await service.rpc('reconcile_horus_execution_attempt', { p_attempt_id: attemptId, p_actual_cost_brl: 0, p_status: 'FAILED', p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_cached_input_tokens: 0, p_request_units: 0, p_image_units: 0, p_provider_request_id: null, p_actual_provider: null, p_actual_model: null, p_latency_ms: null, p_raw_usage: { error: message, environment, operation } });
    return errorResponse(error);
  }
}
