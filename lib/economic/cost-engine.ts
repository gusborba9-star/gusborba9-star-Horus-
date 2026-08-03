import type { CostEstimate, ModelRecord } from './types';
export interface CostPolicy { fxRateUsdToBrl: number; exchangeBufferRate: number; safetyBufferRate: number; infrastructureRate: number; creditBrlValue: number; }
export function estimateTextCost(model: ModelRecord, inputTokens: number, estimatedOutputTokens: number, policy: CostPolicy): CostEstimate {
  if (model.capability !== 'TEXT_GENERATION') throw new Error('MODEL_CAPABILITY_MISMATCH');
  for (const [name, value] of Object.entries({ inputTokens, estimatedOutputTokens, fxRateUsdToBrl: policy.fxRateUsdToBrl, exchangeBufferRate: policy.exchangeBufferRate, safetyBufferRate: policy.safetyBufferRate, infrastructureRate: policy.infrastructureRate, creditBrlValue: policy.creditBrlValue })) if (!Number.isFinite(value) || value < 0) throw new Error(`INVALID_COST_INPUT:${name}`);
  const native = (inputTokens / 1_000_000) * model.inputPricePerMillion + (estimatedOutputTokens / 1_000_000) * model.outputPricePerMillion;
  const fx = model.currency === 'USD' ? policy.fxRateUsdToBrl : 1;
  const providerCost = native * fx;
  const exchangeBuffer = providerCost * policy.exchangeBufferRate;
  const safetyBuffer = (providerCost + exchangeBuffer) * policy.safetyBufferRate;
  const platformCost = (providerCost + exchangeBuffer + safetyBuffer) * policy.infrastructureRate;
  const creditCost = Math.ceil((providerCost + exchangeBuffer + safetyBuffer + platformCost) / policy.creditBrlValue);
  return { providerId: model.providerId, modelId: model.id, capability: model.capability, inputTokens, estimatedOutputTokens, providerCost, fxRate: fx, exchangeBuffer, safetyBuffer, platformCost, creditCost, currency: 'BRL' };
}
export function calculateActualTextCost(model: ModelRecord, inputTokens: number, outputTokens: number, fxRate: number): number {
  const native = (inputTokens / 1_000_000) * model.inputPricePerMillion + (outputTokens / 1_000_000) * model.outputPricePerMillion;
  return native * (model.currency === 'USD' ? fxRate : 1);
}
