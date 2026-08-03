import type { CostEstimate, ModelRecord } from './types';

export interface CostPolicy {
  fxRateUsdToBrl: number;
  exchangeBufferRate: number;
  safetyBufferRate: number;
  infrastructureRate: number;
  creditBrlValue: number;
}

function assertFinitePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`INVALID_COST_INPUT:${name}`);
}

export function estimateTextCost(
  model: ModelRecord,
  inputTokens: number,
  estimatedOutputTokens: number,
  policy: CostPolicy,
): CostEstimate {
  if (model.capability !== 'TEXT_GENERATION') throw new Error('MODEL_CAPABILITY_MISMATCH');
  assertFinitePositive('inputTokens', inputTokens);
  assertFinitePositive('estimatedOutputTokens', estimatedOutputTokens);
  assertFinitePositive('fxRateUsdToBrl', policy.fxRateUsdToBrl);
  assertFinitePositive('exchangeBufferRate', policy.exchangeBufferRate);
  assertFinitePositive('safetyBufferRate', policy.safetyBufferRate);
  assertFinitePositive('infrastructureRate', policy.infrastructureRate);
  assertFinitePositive('creditBrlValue', policy.creditBrlValue);

  const providerCostNative =
    (inputTokens / 1_000_000) * model.inputPricePerMillion +
    (estimatedOutputTokens / 1_000_000) * model.outputPricePerMillion;

  const fx = model.currency === 'USD' ? policy.fxRateUsdToBrl : 1;
  const providerCostBrl = providerCostNative * fx;
  const exchangeBuffer = providerCostBrl * policy.exchangeBufferRate;
  const safetyBuffer = (providerCostBrl + exchangeBuffer) * policy.safetyBufferRate;
  const platformCost = (providerCostBrl + exchangeBuffer + safetyBuffer) * policy.infrastructureRate;
  const totalBrl = providerCostBrl + exchangeBuffer + safetyBuffer + platformCost;
  const creditCost = Math.ceil(totalBrl / policy.creditBrlValue);

  return {
    providerId: model.providerId,
    modelId: model.id,
    capability: model.capability,
    inputTokens,
    estimatedOutputTokens,
    providerCost: providerCostBrl,
    fxRate: fx,
    exchangeBuffer,
    safetyBuffer,
    platformCost,
    creditCost,
    currency: 'BRL',
  };
}

export function calculateActualTextCost(model: ModelRecord, inputTokens: number, outputTokens: number, fxRate: number): number {
  const native =
    (inputTokens / 1_000_000) * model.inputPricePerMillion +
    (outputTokens / 1_000_000) * model.outputPricePerMillion;
  return native * (model.currency === 'USD' ? fxRate : 1);
}
