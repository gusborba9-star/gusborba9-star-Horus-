import type { RoutedModel } from '@/lib/nexus/model-router';

export type StudioEconomicPolicy = {
  version: number;
  targetGrossMarginRate: number;
  minimumGrossMarginRate: number;
  providerFeeRate: number;
  infrastructureRate: number;
  exchangeBufferRate: number;
  safetyBufferRate: number;
  pricingDriftBufferRate: number;
  usageUncertaintyRate: number;
  retryReserveRate: number;
  failureReserveRate: number;
  fxBufferRate: number;
};

export type StudioPricing = {
  estimatedCostBrl: number;
  finalPriceBrl: number;
  providerCostBrl: number;
  inputTokens: number;
  outputTokens: number;
  policyVersion: number;
  modelId: string;
  providerId: string;
  marginRate: number;
  breakdown: Record<string, number | string>;
};

function round(value: number, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function complexityMultiplier(changeClass: string) {
  return changeClass === 'MICRO' ? 1 : changeClass === 'LOW' ? 1.35 : changeClass === 'MEDIUM' ? 2.1 : changeClass === 'MAJOR' ? 3.5 : 5.5;
}

export function estimateStudioPricing(input: {
  optimizedPrompt: string;
  changeClass: string;
  model: RoutedModel;
  policy: StudioEconomicPolicy;
}): StudioPricing {
  const inputTokens = Math.max(256, Math.ceil(input.optimizedPrompt.length / 4));
  const outputTokens = Math.ceil(900 * complexityMultiplier(input.changeClass));
  const providerCostBrl = (inputTokens / 1_000_000) * input.model.inputPricePerMillion
    + (outputTokens / 1_000_000) * input.model.outputPricePerMillion;

  const reserveRate = input.policy.infrastructureRate
    + input.policy.exchangeBufferRate
    + input.policy.safetyBufferRate
    + input.policy.pricingDriftBufferRate
    + input.policy.usageUncertaintyRate
    + input.policy.retryReserveRate
    + input.policy.failureReserveRate
    + input.policy.fxBufferRate;
  const providerFee = providerCostBrl * input.policy.providerFeeRate;
  const costWithReserves = (providerCostBrl + providerFee) * (1 + reserveRate);
  const marginRate = Math.max(input.policy.minimumGrossMarginRate, input.policy.targetGrossMarginRate);
  if (marginRate >= 1) throw new Error('STUDIO_PRICING_MARGIN_INVALID');
  const finalPriceBrl = Math.max(0.01, costWithReserves / (1 - marginRate));

  return {
    estimatedCostBrl: round(costWithReserves),
    finalPriceBrl: round(finalPriceBrl, 2),
    providerCostBrl: round(providerCostBrl),
    inputTokens,
    outputTokens,
    policyVersion: input.policy.version,
    modelId: input.model.modelId,
    providerId: input.model.providerId,
    marginRate,
    breakdown: {
      provider_cost_brl: round(providerCostBrl),
      provider_fee_brl: round(providerFee),
      reserve_rate: round(reserveRate, 6),
      margin_rate: marginRate,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    },
  };
}
