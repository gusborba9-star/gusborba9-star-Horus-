import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { buildSystemPrompt, hashRequest, resolveCollaborator } from '@/lib/collaborators/nexus';

const MAX_INPUT_TOKENS = 2000;
const MAX_OUTPUT_TOKENS = 800;
const MAX_REASONING_TOKENS = 0;
const MAX_COST_BRL = 0.0039;
const REVENUE_BRL = 0.01;

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'COLLABORATOR_EXECUTION_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'COLLABORATOR_NOT_FOUND' || message === 'CAPABILITY_NOT_FOUND' || message === 'MODEL_NOT_FOUND' ? 404 : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

async function createBudget(service: ReturnType<typeof getServiceSupabase>, userId: string, operationId: string) {
  const { data: policy, error: policyError } = await service.from('economic_policy').select('version,minimum_gross_margin_rate').eq('id', true).single();
  if (policyError || !policy) throw new Error('ECONOMIC_POLICY_UNAVAILABLE');
  const { data: pricing, error: pricingError } = await service.from('pricing_snapshots').select('id').order('created_at', { ascending: false }).limit(1).single();
  if (pricingError || !pricing) throw new Error('PRICING_SNAPSHOT_UNAVAILABLE');
  const { data: fx, error: fxError } = await service.from('fx_snapshots').select('id').eq('base_currency', 'USD').eq('quote_currency', 'BRL').order('observed_at', { ascending: false }).limit(1).single();
  if (fxError || !fx) throw new Error('FX_SNAPSHOT_UNAVAILABLE');
  const minimumMargin = Number(policy.minimum_gross_margin_rate);
  const maximumTreeCost = REVENUE_BRL * (1 - minimumMargin);
  const { data, error } = await service.from('execution_budgets').insert({
    user_id: userId,
    organization_id: null,
    operation_id: operationId,
    economic_policy_version: policy.version,
    pricing_snapshot_id: pricing.id,
    fx_snapshot_id: fx.id,
    authorized_credits: 1,
    revenue_allocated_brl: REVENUE_BRL,
    minimum_margin_rate: minimumMargin,
    maximum_provider_cost_brl: MAX_COST_BRL,
    maximum_total_cost_brl: MAX_COST_BRL,
    max_attempts: 1,
    max_input_tokens: MAX_INPUT_TOKENS,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    max_reasoning_tokens: MAX_REASONING_TOKENS,
    max_steps: 3,
    max_tool_calls: 0,
    max_execution_seconds: 120,
    remaining_cost_brl: MAX_COST_BRL,
    remaining_attempts: 1,
    remaining_input_tokens: MAX_INPUT_TOKENS,
    remaining_output_tokens: MAX_OUTPUT_TOKENS,
    remaining_reasoning_tokens: MAX_REASONING_TOKENS,
    status: 'AUTHORIZED',
    net_revenue_brl: REVENUE_BRL,
    gross_revenue_brl: REVENUE_BRL,
    revenue_deductions_brl: 0,
    pricing_freshness: 'FRESH',
    pricing_age_seconds: 0,
    maximum_tree_cost_brl: maximumTreeCost,
  }).select('id').single();
  if (error || !data) throw new Error(`ECONOMIC_BUDGET_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return { budgetId: data.id as string, fxRate: Number(fx.rate) };
}

async function createLog(service: ReturnType<typeof getServiceSupabase>, executionId: string, action: string) {
  const { data, error } = await service.from('horus_execution_logs').insert({ request_id: executionId, event_type: 'COLLABORATOR_EXECUTION', source: 'nexus', action, status: 'RUNNING', confidence: 1, requires_human_review: false, memory_matches: 0, metadata: { executionId, action, surface: 'collaborators' } }).select('id').single();
  if (error || !data) throw new Error(`EXECUTION_LOG_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data.id as string;
}

async function updateLog(service: ReturnType<typeof getServiceSupabase>, logId: string, status: 'COMPLETED' | 'FAILED', patch: Record<string, unknown> = {}) {
  const { error } = await service.from('horus_execution_logs').update({ status, completed_at: new Date().toISOString(), ...patch }).eq('id', logId);
  if (error) throw new Error(`EXECUTION_LOG_UPDATE_FAILED:${error.message}`);
}

export async function POST(request: Request) {
  let executionId: string | null = null;
  let attemptId: string | null = null;
  let logId: string | null = null;
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const intent = typeof body.intent === 'string' ? body.intent.trim() : '';
    const idempotencyKey = request.headers.get('idempotency-key')?.trim() || (typeof body.idempotency_key === 'string' ? body.idempotency_key.trim() : '');
    const organizationId = typeof body.organization_id === 'string' ? body.organization_id : null;
    if (!intent) throw new Error('INTENT_REQUIRED');
    if (intent.length > 20000) throw new Error('INTENT_TOO_LARGE');
    if (!idempotencyKey || idempotencyKey.length > 160) throw new Error('IDEMPOTENCY_KEY_REQUIRED');

    const service = getServiceSupabase();
    const requestHash = hashRequest(intent, { organization_id: organizationId });
    const { data: existing } = await service.from('horus_collaborator_executions').select('*').eq('owner_user_id', user.id).eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing) {
      if (existing.request_hash !== requestHash) throw new Error('IDEMPOTENCY_KEY_REUSE_MISMATCH');
      return NextResponse.json({ success: true, replay: true, execution: existing });
    }

    const resolution = await resolveCollaborator(service, user.id, organizationId, intent);
    const policyDecision = {
      collaborator_id: resolution.collaborator.id,
      capability_id: resolution.capabilityId,
      provider_id: resolution.providerId,
      model_id: resolution.modelId,
      autonomy: resolution.collaborator.autonomy_level,
      economic_policy_version: resolution.collaborator.economic_policy_version,
      connector_required: false,
      approval_required: resolution.collaborator.autonomy_level === 'SUGGEST' || resolution.collaborator.autonomy_level === 'PREPARE',
      fallback_policy: resolution.collaborator.fallback_policy,
    };

    const { data: execution, error: executionError } = await service.from('horus_collaborator_executions').insert({
      collaborator_id: resolution.collaborator.id,
      owner_user_id: user.id,
      organization_id: organizationId,
      intent,
      capability_id: resolution.capabilityId,
      provider_id: resolution.providerId,
      model_id: resolution.modelId,
      status: 'QUEUED',
      policy_decision: policyDecision,
      memory_context: resolution.memory,
      idempotency_key: idempotencyKey,
      request_hash: requestHash,
    }).select('*').single();
    if (executionError || !execution) throw new Error(`COLLABORATOR_EXECUTION_CREATE_FAILED:${executionError?.message ?? 'UNKNOWN'}`);
    executionId = execution.id as string;

    logId = await createLog(service, executionId, 'NEXUS_RESOLUTION');
    const { budgetId, fxRate } = await createBudget(service, user.id, executionId);
    const { data: attempt, error: attemptError } = await service.rpc('authorize_horus_execution_attempt', {
      p_budget_id: budgetId,
      p_attempt_number: 1,
      p_provider_id: resolution.providerId,
      p_model_id: resolution.modelId,
      p_capability: resolution.capabilityId,
      p_maximum_cost_brl: MAX_COST_BRL,
      p_input_tokens: MAX_INPUT_TOKENS,
      p_output_tokens: MAX_OUTPUT_TOKENS,
      p_reasoning_tokens: MAX_REASONING_TOKENS,
      p_endpoint_id: 'openrouter.chat.completions',
      p_fallback_from_attempt_id: null,
    });
    if (attemptError || !attempt) throw new Error(`ECONOMIC_AUTHORIZATION_FAILED:${attemptError?.message ?? 'UNKNOWN'}`);
    attemptId = (attempt as { id: string }).id;

    await service.from('horus_collaborator_executions').update({ status: 'RUNNING', budget_id: budgetId, attempt_id: attemptId, execution_log_id: logId, started_at: new Date().toISOString() }).eq('id', executionId);
    const startedAt = Date.now();
    const providerStarted = Date.now();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ''}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: resolution.modelId,
        messages: [
          { role: 'system', content: buildSystemPrompt(resolution) },
          { role: 'user', content: intent },
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    const latencyMs = Date.now() - providerStarted;
    if (!response.ok) {
      const providerMessage = payload && typeof payload === 'object' && payload.error && typeof payload.error === 'object' && typeof payload.error.message === 'string' ? payload.error.message : `HTTP_${response.status}`;
      await service.rpc('reconcile_horus_execution_attempt', { p_attempt_id: attemptId, p_actual_cost_brl: 0, p_status: 'FAILED', p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_cached_input_tokens: 0, p_request_units: 1, p_image_units: 0, p_provider_request_id: response.headers.get('x-request-id'), p_actual_provider: resolution.providerId, p_actual_model: resolution.modelId, p_latency_ms: latencyMs, p_raw_usage: { http_status: response.status, error: providerMessage } });
      await updateLog(service, logId, 'FAILED', { error_message: providerMessage, metadata: { executionId, action: 'PROVIDER_ERROR', provider_status: response.status } });
      await service.from('horus_collaborator_executions').update({ status: 'FAILED', error_code: `PROVIDER_HTTP_${response.status}`, error_message: providerMessage, completed_at: new Date().toISOString() }).eq('id', executionId);
      throw new Error(`PROVIDER_EXECUTION_FAILED:${response.status}:${providerMessage}`);
    }

    const usage = payload?.usage ?? {};
    const inputTokens = Math.max(0, Number(usage.prompt_tokens ?? 0));
    const outputTokens = Math.max(0, Number(usage.completion_tokens ?? 0));
    const reasoningTokens = Math.max(0, Number(usage.reasoning_tokens ?? 0));
    const cachedInputTokens = Math.max(0, Number(usage.prompt_tokens_details?.cached_tokens ?? 0));
    const requestUnits = 1;
    const providerUsd = typeof usage.cost === 'number' ? usage.cost : (inputTokens * resolution.modelInputPrice + outputTokens * resolution.modelOutputPrice) / 1_000_000;
    const actualCostBrl = Math.min(MAX_COST_BRL, Math.max(0, providerUsd * fxRate));
    const providerRequestId = response.headers.get('x-request-id') ?? (typeof payload?.id === 'string' ? payload.id : null);
    const reconciled = await service.rpc('reconcile_horus_execution_attempt', {
      p_attempt_id: attemptId,
      p_actual_cost_brl: actualCostBrl,
      p_status: 'SUCCEEDED',
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_reasoning_tokens: reasoningTokens,
      p_cached_input_tokens: cachedInputTokens,
      p_request_units: requestUnits,
      p_image_units: 0,
      p_provider_request_id: providerRequestId,
      p_actual_provider: resolution.providerId,
      p_actual_model: resolution.modelId,
      p_latency_ms: latencyMs,
      p_raw_usage: usage,
    });
    if (reconciled.error || !reconciled.data) throw new Error(`ECONOMIC_RECONCILIATION_FAILED:${reconciled.error?.message ?? 'UNKNOWN'}`);

    const resultText = typeof payload?.choices?.[0]?.message?.content === 'string' ? payload.choices[0].message.content : '';
    if (!resultText) throw new Error('PROVIDER_EMPTY_RESULT');
    const completedAt = new Date().toISOString();
    await service.from('horus_collaborator_executions').update({ status: 'SUCCEEDED', result: { text: resultText, usage: { input_tokens: inputTokens, output_tokens: outputTokens, reasoning_tokens: reasoningTokens, cached_input_tokens: cachedInputTokens, actual_cost_brl: actualCostBrl }, provider_request_id: providerRequestId, latency_ms: latencyMs, runtime_ms: Date.now() - startedAt }, completed_at: completedAt }).eq('id', executionId);
    await updateLog(service, logId, 'COMPLETED', { memory_matches: resolution.memory.length, metadata: { executionId, action: 'COMPLETED', provider: resolution.providerId, model: resolution.modelId, capability: resolution.capabilityId, latency_ms: latencyMs, actual_cost_brl: actualCostBrl } });

    const { data: finalExecution } = await service.from('horus_collaborator_executions').select('*').eq('id', executionId).single();
    return NextResponse.json({ success: true, execution: finalExecution });
  } catch (error) {
    if (executionId && attemptId && logId) {
      const service = getServiceSupabase();
      const { data: current } = await service.from('horus_collaborator_executions').select('status').eq('id', executionId).maybeSingle();
      if (current?.status === 'RUNNING') {
        await service.rpc('reconcile_horus_execution_attempt', { p_attempt_id: attemptId, p_actual_cost_brl: 0, p_status: 'FAILED', p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_cached_input_tokens: 0, p_request_units: 0, p_image_units: 0, p_provider_request_id: null, p_actual_provider: null, p_actual_model: null, p_latency_ms: null, p_raw_usage: { failure: error instanceof Error ? error.message : 'UNKNOWN' } });
        await service.from('horus_collaborator_executions').update({ status: 'FAILED', error_code: 'COLLABORATOR_EXECUTION_FAILED', error_message: error instanceof Error ? error.message : 'UNKNOWN', completed_at: new Date().toISOString() }).eq('id', executionId);
        await updateLog(service, logId, 'FAILED', { error_message: error instanceof Error ? error.message : 'UNKNOWN' });
      }
    }
    return errorResponse(error);
  }
}
