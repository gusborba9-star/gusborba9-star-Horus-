import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase';
import { resolveNexusPlan, buildNexusExecutionMetadata } from '@/lib/nexus/core';
import { getLiveOpenRouterCatalog } from '@/lib/providers/openrouter-catalog';
import { getTextInferenceProvider } from '@/lib/providers/inference';
import { PERSONAL_TIERS, isPersonalPersonaId, type PersonalPersonaId, type PersonalTier } from '@/lib/personal/catalog';
import { hashRequest } from '@/lib/collaborators/nexus';

export type PersonalContext = {
  profile: { user_id: string; persona_id: PersonalPersonaId; status: string };
  subscription: { id: string; tier: PersonalTier; status: string; economic_profile: string | null };
  persona: { id: string; display_name: string; locale: string; voice_profile: Record<string, unknown>; personality_profile: Record<string, unknown>; communication_profile: Record<string, unknown>; behavior_profile: Record<string, unknown> };
};

export async function loadPersonalContext(service: SupabaseClient, userId: string): Promise<PersonalContext> {
  const { data: profile, error: profileError } = await service.from('personal_profiles').select('user_id,persona_id,status').eq('user_id', userId).eq('status', 'ACTIVE').maybeSingle();
  if (profileError) throw new Error(`PERSONAL_PROFILE_LOOKUP_FAILED:${profileError.message}`);
  if (!profile || !isPersonalPersonaId(profile.persona_id)) throw new Error('PERSONAL_NOT_ACTIVATED');

  const { data: subscription, error: subscriptionError } = await service.from('personal_subscriptions').select('id,tier,status,economic_profile').eq('user_id', userId).eq('status', 'ACTIVE').maybeSingle();
  if (subscriptionError) throw new Error(`PERSONAL_SUBSCRIPTION_LOOKUP_FAILED:${subscriptionError.message}`);
  if (!subscription || !PERSONAL_TIERS[subscription.tier as PersonalTier]) throw new Error('PERSONAL_SUBSCRIPTION_REQUIRED');

  const { data: persona, error: personaError } = await service.from('personal_personas').select('id,display_name,locale,voice_profile,personality_profile,communication_profile,behavior_profile').eq('id', profile.persona_id).eq('enabled', true).single();
  if (personaError || !persona) throw new Error(`PERSONA_LOOKUP_FAILED:${personaError?.message ?? 'NOT_FOUND'}`);
  return { profile, subscription: subscription as PersonalContext['subscription'], persona };
}

export async function assertActiveDevice(service: SupabaseClient, userId: string, deviceId: string | null) {
  if (!deviceId) return null;
  const { data, error } = await service.from('personal_devices').select('id,platform,status').eq('id', deviceId).eq('user_id', userId).eq('status', 'ACTIVE').maybeSingle();
  if (error) throw new Error(`PERSONAL_DEVICE_LOOKUP_FAILED:${error.message}`);
  if (!data) throw new Error('PERSONAL_DEVICE_NOT_ACTIVE');
  return data;
}

async function getMemory(service: SupabaseClient, userId: string) {
  const { data, error } = await service.from('memory_graph_nodes').select('id,content,owner_scope,metadata').eq('owner_scope', 'USER').eq('user_id', userId).eq('lifecycle_state', 'ACTIVE').order('importance', { ascending: false }).order('last_accessed_at', { ascending: false, nullsFirst: false }).limit(8);
  if (error) throw new Error(`PERSONAL_MEMORY_LOOKUP_FAILED:${error.message}`);
  return (data ?? []).map((item) => ({ ...item, content: item.content.slice(0, 1200) }));
}

async function createBudget(service: SupabaseClient, userId: string, operationId: string, tier: PersonalTier) {
  const tierPolicy = PERSONAL_TIERS[tier];
  const { data: policy, error: policyError } = await service.from('economic_policy').select('version,minimum_gross_margin_rate').eq('id', true).single();
  if (policyError || !policy) throw new Error('ECONOMIC_POLICY_UNAVAILABLE');
  const { data: pricing, error: pricingError } = await service.from('pricing_snapshots').select('id').order('created_at', { ascending: false }).limit(1).single();
  if (pricingError || !pricing) throw new Error('PRICING_SNAPSHOT_UNAVAILABLE');
  const { data: fx, error: fxError } = await service.from('fx_snapshots').select('id,rate').eq('base_currency', 'USD').eq('quote_currency', 'BRL').order('observed_at', { ascending: false }).limit(1).single();
  if (fxError || !fx) throw new Error('FX_SNAPSHOT_UNAVAILABLE');
  const minimumMargin = Number(policy.minimum_gross_margin_rate);
  const revenue = tierPolicy.priceBrl;
  const maximumTreeCost = revenue * (1 - minimumMargin);
  const { data, error } = await service.from('execution_budgets').insert({ user_id: userId, organization_id: null, operation_id: operationId, economic_policy_version: policy.version, pricing_snapshot_id: pricing.id, fx_snapshot_id: fx.id, authorized_credits: 1, revenue_allocated_brl: revenue, minimum_margin_rate: minimumMargin, maximum_provider_cost_brl: tierPolicy.maxProviderCostBrl, maximum_total_cost_brl: tierPolicy.maxProviderCostBrl, max_attempts: 1, max_input_tokens: 4000, max_output_tokens: tierPolicy.maxOutputTokens, max_reasoning_tokens: 0, max_steps: 3, max_tool_calls: 1, max_execution_seconds: 120, remaining_cost_brl: tierPolicy.maxProviderCostBrl, remaining_attempts: 1, remaining_input_tokens: 4000, remaining_output_tokens: tierPolicy.maxOutputTokens, remaining_reasoning_tokens: 0, status: 'AUTHORIZED', net_revenue_brl: revenue, gross_revenue_brl: revenue, revenue_deductions_brl: 0, pricing_freshness: 'FRESH', pricing_age_seconds: 0, maximum_tree_cost_brl: maximumTreeCost }).select('id').single();
  if (error || !data) throw new Error(`PERSONAL_BUDGET_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return { budgetId: data.id as string, fxRate: Number(fx.rate), maxCostBrl: tierPolicy.maxProviderCostBrl, maxOutputTokens: tierPolicy.maxOutputTokens };
}

async function createLog(service: SupabaseClient, executionId: string, action: string) {
  const { data, error } = await service.from('horus_execution_logs').insert({ request_id: executionId, event_type: 'PERSONAL_EXECUTION', source: 'personal', action, status: 'RUNNING', confidence: 1, requires_human_review: false, memory_matches: 0, error_message: null, metadata: { executionId, action, surface: 'personal' } }).select('id').single();
  if (error || !data) throw new Error(`PERSONAL_EXECUTION_LOG_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data.id as string;
}

async function updateLog(service: SupabaseClient, logId: string, status: 'COMPLETED' | 'FAILED', patch: Record<string, unknown> = {}) {
  const { error } = await service.from('horus_execution_logs').update({ status, completed_at: new Date().toISOString(), ...patch }).eq('id', logId);
  if (error) throw new Error(`PERSONAL_EXECUTION_LOG_UPDATE_FAILED:${error.message}`);
}

function buildPersonaSystemPrompt(context: PersonalContext, memory: Array<{ content: string }>, optimizedPrompt: string) {
  const persona = context.persona;
  const memoryBlock = memory.length ? `\nRelevant user memory:\n${memory.map((item) => `- ${item.content}`).join('\n')}` : '';
  return [`Você é ${persona.display_name}, o Personal do usuário no Hórus Cognitive OS.`, `Idioma: ${persona.locale}.`, `Personalidade: ${JSON.stringify(persona.personality_profile)}.`, `Comunicação: ${JSON.stringify(persona.communication_profile)}.`, `Comportamento: ${JSON.stringify(persona.behavior_profile)}.`, 'Mantenha a identidade da persona estável; nunca substitua sua voz por outra persona.', 'Não alegue ações externas que não foram realmente executadas.', 'Respeite permissões, autonomia, políticas e limites econômicos.', memoryBlock, `Tarefa otimizada:\n${optimizedPrompt}`].filter(Boolean).join('\n');
}

async function persistOutcome(service: SupabaseClient, userId: string, personaId: string, executionId: string, result: string) {
  const content = `Personal ${personaId} outcome: ${result.slice(0, 1500)}`;
  const contentHash = createHash('sha256').update(content).digest('hex');
  await service.from('memory_graph_nodes').insert({ node_type: 'operational_event', content, importance: 0.35, metadata: { source: 'personal', persona_id: personaId, execution_id: executionId, content_hash: contentHash }, owner_scope: 'USER', user_id: userId, lifecycle_state: 'ACTIVE', content_hash: contentHash });
}

export async function executePersonalText(input: { userId: string; deviceId: string | null; intent: string; idempotencyKey: string }) {
  const service = getServiceSupabase();
  const context = await loadPersonalContext(service, input.userId);
  await assertActiveDevice(service, input.userId, input.deviceId);
  const requestHash = hashRequest(input.intent, { personal: true, persona_id: context.profile.persona_id, device_id: input.deviceId });
  const { data: existing } = await service.from('personal_executions').select('*').eq('user_id', input.userId).eq('idempotency_key', input.idempotencyKey).maybeSingle();
  if (existing) {
    if (existing.request_hash !== requestHash) throw new Error('IDEMPOTENCY_KEY_REUSE_MISMATCH');
    return { replay: true, execution: existing };
  }

  const memory = await getMemory(service, input.userId);
  const tier = context.subscription.tier;
  const budgetPreview = PERSONAL_TIERS[tier];
  const liveCatalog = await getLiveOpenRouterCatalog();
  const plan = await resolveNexusPlan(service, { intent: input.intent, context: memory.map((item) => item.content), budgetBrl: budgetPreview.maxProviderCostBrl, liveCatalog });
  const { optimized, model } = plan;
  const policyDecision = { persona_id: context.profile.persona_id, capability_id: 'PERSONAL_TEXT', autonomy: 'EXECUTE', economic_profile: context.subscription.economic_profile ?? budgetPreview.economicProfile, ...buildNexusExecutionMetadata(plan) };

  const { data: execution, error: executionError } = await service.from('personal_executions').insert({ user_id: input.userId, device_id: input.deviceId, persona_id: context.profile.persona_id, kind: 'CHAT', intent: input.intent, task_profile: optimized.profile, prompt_original: optimized.original, prompt_optimized: optimized.optimized, capability_id: 'PERSONAL_TEXT', autonomy: 'EXECUTE', policy_decision: policyDecision, memory_context: memory, provider_id: model.providerId, model_id: model.modelId, idempotency_key: input.idempotencyKey, request_hash: requestHash, status: 'QUEUED' }).select('*').single();
  if (executionError || !execution) throw new Error(`PERSONAL_EXECUTION_CREATE_FAILED:${executionError?.message ?? 'UNKNOWN'}`);

  const executionId = execution.id as string;
  const logId = await createLog(service, executionId, 'NEXUS_ROUTING');
  const budget = await createBudget(service, input.userId, executionId, tier);
  const { data: attempt, error: attemptError } = await service.rpc('authorize_horus_execution_attempt', { p_budget_id: budget.budgetId, p_attempt_number: 1, p_provider_id: model.providerId, p_model_id: model.modelId, p_capability: 'PERSONAL_TEXT', p_maximum_cost_brl: budget.maxCostBrl, p_input_tokens: 4000, p_output_tokens: budget.maxOutputTokens, p_reasoning_tokens: 0, p_endpoint_id: `${model.providerId}.text.generate`, p_fallback_from_attempt_id: null });
  if (attemptError || !attempt) throw new Error(`PERSONAL_ECONOMIC_AUTHORIZATION_FAILED:${attemptError?.message ?? 'UNKNOWN'}`);
  const attemptId = (attempt as { id: string }).id;
  await service.from('personal_executions').update({ status: 'RUNNING', budget_id: budget.budgetId, attempt_id: attemptId, execution_log_id: logId, started_at: new Date().toISOString() }).eq('id', executionId);

  try {
    const provider = getTextInferenceProvider(model.providerId);
    const result = await provider.execute({ modelId: model.modelId, systemPrompt: buildPersonaSystemPrompt(context, memory, optimized.optimized), userPrompt: input.intent, maxOutputTokens: budget.maxOutputTokens });
    const providerUsd = result.usage.providerCostUsd ?? ((result.usage.inputTokens * model.inputPricePerMillion + result.usage.outputTokens * model.outputPricePerMillion) / 1_000_000);
    const actualCostBrl = Math.max(0, providerUsd * budget.fxRate);
    const reconciled = await service.rpc('reconcile_horus_execution_attempt', { p_attempt_id: attemptId, p_actual_cost_brl: actualCostBrl, p_status: 'SUCCEEDED', p_input_tokens: result.usage.inputTokens, p_output_tokens: result.usage.outputTokens, p_reasoning_tokens: result.usage.reasoningTokens, p_cached_input_tokens: result.usage.cachedInputTokens, p_request_units: 1, p_image_units: 0, p_provider_request_id: result.requestId, p_actual_provider: result.providerId, p_actual_model: result.modelId, p_latency_ms: result.latencyMs, p_raw_usage: result.usage.raw });
    if (reconciled.error || !reconciled.data) throw new Error(`PERSONAL_RECONCILIATION_FAILED:${reconciled.error?.message ?? 'UNKNOWN'}`);
    await service.from('personal_executions').update({ status: 'SUCCEEDED', result: { text: result.text, usage: { input_tokens: result.usage.inputTokens, output_tokens: result.usage.outputTokens, reasoning_tokens: result.usage.reasoningTokens, cached_input_tokens: result.usage.cachedInputTokens, actual_cost_brl: actualCostBrl }, provider_request_id: result.requestId, latency_ms: result.latencyMs }, completed_at: new Date().toISOString() }).eq('id', executionId);
    await updateLog(service, logId, 'COMPLETED', { memory_matches: memory.length, metadata: { executionId, action: 'COMPLETED', provider: result.providerId, model: result.modelId, capability: 'PERSONAL_TEXT', latency_ms: result.latencyMs, actual_cost_brl: actualCostBrl } });
    await persistOutcome(service, input.userId, context.profile.persona_id, executionId, result.text);
    const { data: finalExecution } = await service.from('personal_executions').select('*').eq('id', executionId).single();
    return { replay: false, execution: finalExecution };
  } catch (error) {
    await service.rpc('reconcile_horus_execution_attempt', { p_attempt_id: attemptId, p_actual_cost_brl: 0, p_status: 'FAILED', p_input_tokens: 0, p_output_tokens: 0, p_reasoning_tokens: 0, p_cached_input_tokens: 0, p_request_units: 0, p_image_units: 0, p_provider_request_id: null, p_actual_provider: null, p_actual_model: null, p_latency_ms: null, p_raw_usage: { failure: error instanceof Error ? error.message : 'UNKNOWN' } });
    await service.from('personal_executions').update({ status: 'FAILED', error_code: 'PERSONAL_EXECUTION_FAILED', error_message: error instanceof Error ? error.message : 'UNKNOWN', completed_at: new Date().toISOString() }).eq('id', executionId);
    await updateLog(service, logId, 'FAILED', { error_message: error instanceof Error ? error.message : 'UNKNOWN' });
    throw error;
  }
}
