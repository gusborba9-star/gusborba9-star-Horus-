import { requirePermission } from '@/lib/auth/server';
import { flagCreditOverage, reconcileCredits, reserveCredits } from './credit-guard';
import { calculateActualTextCost, estimateTextCost } from './cost-engine';
import { EconomicRouter } from './router';
import { SupabaseModelRegistry, SupabaseProviderRegistry } from './supabase-registry';
import { getEconomicPolicy } from './supabase-policy';
import { OpenRouterTextAdapter } from './adapters/openrouter-text';
import { GoogleTextAdapter } from './adapters/google-text';
import { ProviderAdapterRegistry } from './adapter-registry';
import type { ProviderTextResponse } from './types';

const router = new EconomicRouter(new SupabaseProviderRegistry(), new SupabaseModelRegistry());
const adapters = new ProviderAdapterRegistry([new OpenRouterTextAdapter(), new GoogleTextAdapter()]);

export interface TextExecutionRequest { input: string; estimatedOutputTokens: number; maxOutputTokens: number; idempotencyKey: string; qualityRequired?: number; temperature?: number; }
export interface TextExecutionResult { text: string; providerId: string; modelId: string; usage: ProviderTextResponse['usage']; reservedCredits: number; actualCredits: number; }

export async function executePaidText(request: TextExecutionRequest): Promise<TextExecutionResult> {
  await requirePermission('ai.execute');
  if (!request.input.trim()) throw new Error('EMPTY_INPUT');
  if (!Number.isSafeInteger(request.maxOutputTokens) || request.maxOutputTokens <= 0) throw new Error('INVALID_MAX_OUTPUT_TOKENS');
  if (!Number.isSafeInteger(request.estimatedOutputTokens) || request.estimatedOutputTokens <= 0 || request.estimatedOutputTokens > request.maxOutputTokens) throw new Error('INVALID_OUTPUT_ESTIMATE');
  if (!/^[A-Za-z0-9:_-]{16,128}$/.test(request.idempotencyKey)) throw new Error('INVALID_IDEMPOTENCY_KEY');

  const policy = await getEconomicPolicy();
  const route = await router.route({ capability: 'TEXT_GENERATION', qualityRequired: request.qualityRequired });
  const estimate = estimateTextCost(route.model, Math.ceil(request.input.length / 4), request.maxOutputTokens, policy);
  const hold = await reserveCredits(crypto.randomUUID(), request.idempotencyKey, estimate.creditCost);

  try {
    const response = await adapters.get(route.provider.id).generateText({ model: route.model.id, input: request.input, temperature: request.temperature, maxOutputTokens: request.maxOutputTokens });
    const actualCredits = Math.ceil(calculateActualTextCost(route.model, response.usage.inputTokens, response.usage.outputTokens, policy.fxRateUsdToBrl) / policy.creditBrlValue);
    if (actualCredits > hold.reserved_credits) {
      await flagCreditOverage(hold.id, actualCredits);
      throw new Error('ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD');
    }
    await reconcileCredits(hold.id, actualCredits, 'SETTLED');
    return { text: response.text, providerId: route.provider.id, modelId: route.model.id, usage: response.usage, reservedCredits: hold.reserved_credits, actualCredits };
  } catch (error) {
    if (error instanceof Error && error.message === 'ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD') throw error;
    try { await reconcileCredits(hold.id, 0, 'FAILED'); } catch (reconciliationError) { console.error('[EconomicCore] Failed-job reconciliation failed:', reconciliationError); }
    throw error;
  }
}
