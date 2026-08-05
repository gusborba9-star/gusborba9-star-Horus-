import { requirePermission } from '@/lib/auth/server';
import { calculateActualTextCost, estimateTextCost } from '@/lib/economic/cost-engine';
import { EconomicRouter } from '@/lib/economic/router';
import { ProviderAdapterRegistry } from '@/lib/economic/adapter-registry';
import { OpenRouterTextAdapter } from '@/lib/economic/adapters/openrouter-text';
import { GoogleTextAdapter } from '@/lib/economic/adapters/google-text';
import { SupabaseModelRegistry, SupabaseProviderRegistry } from '@/lib/economic/supabase-registry';
import { getEconomicPolicy } from '@/lib/economic/supabase-policy';
import { getServiceSupabase } from '@/lib/supabase';
import { authorizeHorusExecution } from './economicAuthorization';

const router = new EconomicRouter(new SupabaseProviderRegistry(), new SupabaseModelRegistry());
const adapters = new ProviderAdapterRegistry([
  new OpenRouterTextAdapter(),
  new GoogleTextAdapter(),
]);

export type HorusTextExecutionInput = {
  budgetId: string;
  input: string;
  maxOutputTokens: number;
  maxReasoningTokens?: number;
  qualityRequired?: number;
  temperature?: number;
  requestId: string;
};

export type HorusTextExecutionResult = {
  attemptId: string;
  providerId: string;
  modelId: string;
  text: string;
  actualCostBrl: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    cachedInputTokens: number;
    latencyMs: number;
    providerRequestId: string | null;
  };
};

export async function executeAuthorizedHorusText(
  input: HorusTextExecutionInput,
): Promise<HorusTextExecutionResult> {
  await requirePermission('ai.execute');

  if (!input.input.trim()) throw new Error('EMPTY_INPUT');
  if (!Number.isSafeInteger(input.maxOutputTokens) || input.maxOutputTokens <= 0) {
    throw new Error('INVALID_MAX_OUTPUT_TOKENS');
  }

  const policy = await getEconomicPolicy();
  const inputTokens = Math.max(1, Math.ceil(input.input.length / 4));
  const maxReasoningTokens = Math.max(0, Math.floor(input.maxReasoningTokens ?? 0));

  const route = await router.route({
    capability: 'TEXT_GENERATION',
    qualityRequired: input.qualityRequired,
    inputTokens,
    maxOutputTokens: input.maxOutputTokens,
    maxReasoningTokens,
    maxAttempts: 1,
    allowFallback: false,
  });

  const estimate = estimateTextCost(
    route.model,
    inputTokens,
    input.maxOutputTokens,
    policy,
    {
      maxOutputTokens: input.maxOutputTokens,
      maxReasoningTokens,
      maxAttempts: 1,
    },
  );

  const authorization = await authorizeHorusExecution({
    budgetId: input.budgetId,
    providerId: route.provider.id,
    modelId: route.model.id,
    capability: route.model.capability,
    maximumCostBrl: estimate.maximumProviderCostBrl,
    inputTokens,
    outputTokens: input.maxOutputTokens,
    reasoningTokens: maxReasoningTokens,
  });

  if (!authorization.authorized || !authorization.attemptId) {
    throw new Error(authorization.error ?? 'ECONOMIC_AUTHORIZATION_DENIED');
  }

  const adapter = adapters.get(route.provider.id);
  const startedAt = Date.now();

  try {
    const response = await adapter.generateText({
      model: route.model.id,
      input: input.input,
      temperature: input.temperature,
      maxOutputTokens: input.maxOutputTokens,
      maxReasoningTokens,
      includeUsage: true,
      sessionId: input.requestId,
    });

    const actualCostBrl = response.usage.requestCost !== null
      ? response.usage.requestCost * (route.model.currency === 'USD' ? policy.fxRateUsdToBrl : 1)
      : calculateActualTextCost(
          route.model,
          response.usage.inputTokens,
          response.usage.outputTokens,
          policy.fxRateUsdToBrl,
          response.usage.reasoningTokens,
        );

    const { error: reconciliationError } = await getServiceSupabase().rpc(
      'reconcile_horus_execution_attempt',
      {
        p_attempt_id: authorization.attemptId,
        p_actual_cost_brl: actualCostBrl,
        p_status: 'COMPLETED',
        p_input_tokens: response.usage.inputTokens,
        p_output_tokens: response.usage.outputTokens,
        p_reasoning_tokens: response.usage.reasoningTokens,
        p_cached_input_tokens: response.usage.cachedInputTokens,
        p_request_units: 0,
        p_image_units: 0,
        p_provider_request_id: response.providerRequestId,
        p_actual_provider: response.actualProvider,
        p_actual_model: response.actualModel,
        p_latency_ms: response.latencyMs || Date.now() - startedAt,
        p_raw_usage: response.raw ?? {},
      },
    );

    if (reconciliationError) {
      throw new Error(`RECONCILIATION_FAILED:${reconciliationError.message}`);
    }

    return {
      attemptId: authorization.attemptId,
      providerId: route.provider.id,
      modelId: route.model.id,
      text: response.text,
      actualCostBrl,
      usage: {
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        reasoningTokens: response.usage.reasoningTokens,
        cachedInputTokens: response.usage.cachedInputTokens,
        latencyMs: response.latencyMs,
        providerRequestId: response.providerRequestId,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PROVIDER_EXECUTION_FAILED';

    try {
      await getServiceSupabase().rpc('reconcile_horus_execution_attempt', {
        p_attempt_id: authorization.attemptId,
        p_actual_cost_brl: 0,
        p_status: 'FAILED',
        p_input_tokens: 0,
        p_output_tokens: 0,
        p_reasoning_tokens: 0,
        p_cached_input_tokens: 0,
        p_request_units: 0,
        p_image_units: 0,
        p_provider_request_id: null,
        p_actual_provider: route.provider.id,
        p_actual_model: route.model.id,
        p_latency_ms: Date.now() - startedAt,
        p_raw_usage: { error: message },
      });
    } catch (reconciliationError) {
      console.error('[Hórus Core] Falha ao reconciliar execução malsucedida:', reconciliationError);
    }

    throw error;
  }
}
