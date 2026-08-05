import type { CostEstimate, CostPolicy, ModelRecord } from './types';

const MONEY_SCALE = 100_000_000;

function assertFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`INVALID_COST_INPUT:${name}`);
}

function assertFinitePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`INVALID_COST_INPUT:${name}`);
}

function assertRate(name: string, value: number): void {
  assertFiniteNonNegative(name, value);
  if (value >= 1 && (name.includes('Margin') || name.includes('margin'))) throw new Error(`INVALID_COST_INPUT:${name}`);
}

function validateModelPricing(model: ModelRecord): void {
  for (const [name, value] of Object.entries({
    inputPricePerMillion: model.inputPricePerMillion,
    outputPricePerMillion: model.outputPricePerMillion,
    requestPrice: model.requestPrice,
    imagePrice: model.imagePrice,
    reasoningPricePerMillion: model.reasoningPricePerMillion,
    cachedInputPricePerMillion: model.cachedInputPricePerMillion,
    cacheWritePricePerMillion: model.cacheWritePricePerMillion,
  })) assertFiniteNonNegative(`model.${name}`, value);
}

function roundMoneyUp(value: number): number {
  return Math.ceil((value - Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function roundMoneyDown(value: number): number {
  return Math.floor((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function nativeTextCost(model: ModelRecord, inputTokens: number, outputTokens: number, reasoningTokens: number): number {
  return (
    (inputTokens / 1_000_000) * model.inputPricePerMillion +
    (outputTokens / 1_000_000) * model.outputPricePerMillion +
    (reasoningTokens / 1_000_000) * model.reasoningPricePerMillion +
    model.requestPrice
  );
}

function toBrl(model: ModelRecord, nativeCost: number, policy: CostPolicy): number {
  return nativeCost * (model.currency === 'USD' ? policy.fxRateUsdToBrl : 1);
}

function applyEconomicBuffers(providerCostBrl: number, policy: CostPolicy): CostEstimate['buffersBrl'] {
  const exchangeBuffer = providerCostBrl * policy.exchangeBufferRate;
  const safetyBuffer = (providerCostBrl + exchangeBuffer) * policy.safetyBufferRate;
  const providerFee = providerCostBrl * policy.providerFeeRate;
  const fx = providerCostBrl * policy.fxBufferRate;
  const pricingDrift = providerCostBrl * policy.pricingDriftBufferRate;
  const usageUncertainty = providerCostBrl * policy.usageUncertaintyRate;
  const retryReserve = providerCostBrl * policy.retryReserveRate;
  const failureReserve = providerCostBrl * policy.failureReserveRate;
  const riskReserves = providerFee + fx + pricingDrift + usageUncertainty + retryReserve + failureReserve;
  const infrastructure = (providerCostBrl + exchangeBuffer + safetyBuffer + riskReserves) * policy.infrastructureRate;

  return { exchangeBuffer, safetyBuffer, providerFee, fx, pricingDrift, usageUncertainty, retryReserve, failureReserve, infrastructure };
}

export function minimumRevenueForCost(maximumTotalCostBrl: number, minimumMarginRate: number): number {
  assertFiniteNonNegative('maximumTotalCostBrl', maximumTotalCostBrl);
  assertRate('minimumMarginRate', minimumMarginRate);
  if (minimumMarginRate >= 1) throw new Error('INVALID_MINIMUM_MARGIN');
  return roundMoneyUp(maximumTotalCostBrl / (1 - minimumMarginRate));
}

export function maximumAuthorizedCostFromRevenue(revenueAllocatedBrl: number, minimumMarginRate: number): number {
  assertFiniteNonNegative('revenueAllocatedBrl', revenueAllocatedBrl);
  assertRate('minimumMarginRate', minimumMarginRate);
  if (minimumMarginRate >= 1) throw new Error('INVALID_MINIMUM_MARGIN');
  return roundMoneyDown(revenueAllocatedBrl * (1 - minimumMarginRate));
}

export function estimateTextCost(
  model: ModelRecord,
  inputTokens: number,
  estimatedOutputTokens: number,
  policy: CostPolicy,
  limits: { maxOutputTokens?: number; maxReasoningTokens?: number; maxAttempts?: number } = {},
): CostEstimate {
  if (model.capability !== 'TEXT_GENERATION') throw new Error('MODEL_CAPABILITY_MISMATCH');
  validateModelPricing(model);
  for (const [name, value] of Object.entries({
    inputTokens, estimatedOutputTokens,
    exchangeBufferRate: policy.exchangeBufferRate, safetyBufferRate: policy.safetyBufferRate,
    infrastructureRate: policy.infrastructureRate, providerFeeRate: policy.providerFeeRate,
    fxBufferRate: policy.fxBufferRate, pricingDriftBufferRate: policy.pricingDriftBufferRate,
    usageUncertaintyRate: policy.usageUncertaintyRate, retryReserveRate: policy.retryReserveRate,
    failureReserveRate: policy.failureReserveRate, targetGrossMarginRate: policy.targetGrossMarginRate,
    minimumGrossMarginRate: policy.minimumGrossMarginRate,
  })) assertFiniteNonNegative(name, value);
  assertFinitePositive('fxRateUsdToBrl', policy.fxRateUsdToBrl);
  assertFinitePositive('creditBrlValue', policy.creditBrlValue);

  if (!policy.globalExecutionEnabled) throw new Error('ECONOMIC_EXECUTION_DISABLED');
  if (policy.minimumGrossMarginRate >= 1 || policy.targetGrossMarginRate >= 1) throw new Error('INVALID_MARGIN_POLICY');
  if (policy.targetGrossMarginRate < policy.minimumGrossMarginRate) throw new Error('INVALID_MARGIN_POLICY_ORDER');
  if (!Number.isSafeInteger(inputTokens) || inputTokens < 0 || !Number.isSafeInteger(estimatedOutputTokens) || estimatedOutputTokens < 0) throw new Error('INVALID_TOKEN_COUNT');

  const maxOutputTokens = limits.maxOutputTokens ?? Math.max(estimatedOutputTokens, model.maxCompletionTokens ?? estimatedOutputTokens);
  const maxReasoningTokens = limits.maxReasoningTokens ?? 0;
  const maxAttempts = Math.max(1, Math.floor(limits.maxAttempts ?? 1));
  if (!Number.isSafeInteger(maxOutputTokens) || maxOutputTokens < 0) throw new Error('INVALID_MAX_OUTPUT_TOKENS');
  if (!Number.isSafeInteger(maxReasoningTokens) || maxReasoningTokens < 0) throw new Error('INVALID_MAX_REASONING_TOKENS');

  const estimatedProviderCostBrl = toBrl(model, nativeTextCost(model, inputTokens, estimatedOutputTokens, 0), policy);
  const maximumSingleAttemptProviderCostBrl = toBrl(model, nativeTextCost(model, inputTokens, maxOutputTokens, maxReasoningTokens), policy);
  const maximumProviderCostBrl = roundMoneyUp(maximumSingleAttemptProviderCostBrl * maxAttempts);
  const buffersBrl = applyEconomicBuffers(maximumProviderCostBrl, policy);
  const maximumTotalCostBrl = roundMoneyUp(
    maximumProviderCostBrl + buffersBrl.exchangeBuffer + buffersBrl.safetyBuffer + buffersBrl.providerFee +
    buffersBrl.fx + buffersBrl.pricingDrift + buffersBrl.usageUncertainty + buffersBrl.retryReserve +
    buffersBrl.failureReserve + buffersBrl.infrastructure,
  );
  const minimumRevenueBrl = minimumRevenueForCost(maximumTotalCostBrl, policy.minimumGrossMarginRate);
  const requiredCredits = Math.ceil(minimumRevenueBrl / policy.creditBrlValue);

  return {
    providerId: model.providerId, modelId: model.id, capability: model.capability,
    inputTokens, estimatedOutputTokens, estimatedProviderCostBrl,
    maximumProviderCostBrl, maximumTotalCostBrl,
    fxRate: model.currency === 'USD' ? policy.fxRateUsdToBrl : 1,
    buffersBrl, minimumRevenueBrl, requiredCredits, currency: 'BRL',
  };
}

export function calculateActualTextCost(
  model: ModelRecord, inputTokens: number, outputTokens: number, fxRate: number, reasoningTokens = 0, requestUnits = 0,
): number {
  validateModelPricing(model);
  assertFinitePositive('fxRate', fxRate);
  assertFiniteNonNegative('inputTokens', inputTokens);
  assertFiniteNonNegative('outputTokens', outputTokens);
  assertFiniteNonNegative('reasoningTokens', reasoningTokens);
  assertFiniteNonNegative('requestUnits', requestUnits);
  const native = nativeTextCost(model, inputTokens, outputTokens, reasoningTokens) + requestUnits * model.requestPrice;
  return native * (model.currency === 'USD' ? fxRate : 1);
}
