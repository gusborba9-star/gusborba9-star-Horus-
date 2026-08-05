import { requirePermission } from '@/lib/auth/server';
import { calculateActualTextCost } from '@/lib/economic/cost-engine';
import { ProviderAdapterRegistry } from '@/lib/economic/adapter-registry';
import { OpenRouterTextAdapter } from '@/lib/economic/adapters/openrouter-text';
import { GoogleTextAdapter } from '@/lib/economic/adapters/google-text';
import { SupabaseModelRegistry } from '@/lib/economic/supabase-registry';
import { getEconomicPolicy } from '@/lib/economic/supabase-policy';
import { getServiceSupabase } from '@/lib/supabase';

const models = new SupabaseModelRegistry();
const adapters = new ProviderAdapterRegistry([
  new OpenRouterTextAdapter(),
  new GoogleTextAdapter(),
]);

export type HorusTextExecutionInput = {
  attemptId: string;
  providerId: string;
  modelId: string;
  input: string;
  maxOutputTokens: number;
  maxReasoningTokens?: number;
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

  const model = await models.get(input.modelId);
  if (!model || model.providerId !== input.providerId || model.capability !== 'TEXT_GENERATION') {
    throw new Error('EXECUTION_MODEL_NOT_AVAILABLE');
  }

  const policy = await getEconomicPolicy();
  const adapter = adapters.get(input.providerId);
  const startedAt = Date.now();

  try {
    const response = await adapter.generateText({
      model: model.id,
      input: input.input,
      temperature: input.temperature,
      maxOutputTokens: input.maxOutputTokens,
      maxReasoningTokens: Math.max(0, Math.floor(input.maxReasoningTokens ?? 0)),
      includeUsage: true,
      sessionId: input.requestId,
    });

    const actualCostBrl = response.usage.requestCost !== null
      ? response.usage.requestCost * (model.currency === 'USD' ? policy.fxRateUsdToBrl : 1)
      : calculateActualTextCost(
          model,
          response.usage.inputTokens,
          response.usage.outputTokens,
          policy.fxRateUsdToBrl,
          response.usage.reasoningTokens,
        );

    const { error: reconciliationError } = await getServiceSupabase().rpc(
      'reconcile_horus_execution_attempt',
      {
        p_attempt_id: input.attemptId,
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
      attemptId: input.attemptId,
      providerId: input.providerId,
      modelId: input.modelId,
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
        p_attempt_id: input.attemptId,
        p_actual_cost_brl: 0,
        p_status: 'FAILED',
        p_input_tokens: 0,
        p_output_tokens: 0,
        p_reasoning_tokens: 0,
        p_cached_input_tokens: 0,
        p_request_units: 0,
        p_image_units: 0,
        p_provider_request_id: null,
        p_actual_provider: input.providerId,
        p_actual_model: input.modelId,
        p_latency_ms: Date.now() - startedAt,
        p_raw_usage: { error: message },
      });
    } catch (reconciliationError) {
      console.error('[Hórus Core] Falha ao reconciliar execução malsucedida:', reconciliationError);
    }

    throw error;
  }
}
