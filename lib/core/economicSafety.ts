export type EconomicSafetyInput = {
  enabled: boolean;
  pricingFresh: boolean;
  estimatedTotalCostBrl: number;
  remainingCostBrl: number;
  maximumTotalCostBrl: number;
  revenueAllocatedBrl: number;
  minimumMarginRate: number;
  maximumTreeCostBrl: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  remainingInputTokens: number;
  remainingOutputTokens: number;
  remainingReasoningTokens: number;
  maxAttempts: number;
  remainingAttempts: number;
};

export function evaluateEconomicSafety(input: EconomicSafetyInput): { allowed: boolean; reason?: string } {
  if (!input.enabled) return { allowed: false, reason: 'kill_switch' };
  if (!input.pricingFresh) return { allowed: false, reason: 'pricing_stale' };
  if (!Number.isFinite(input.estimatedTotalCostBrl) || input.estimatedTotalCostBrl < 0) return { allowed: false, reason: 'invalid_cost' };
  if (input.estimatedTotalCostBrl > input.remainingCostBrl) return { allowed: false, reason: 'budget_exhausted' };
  if (input.estimatedTotalCostBrl > input.maximumTotalCostBrl) return { allowed: false, reason: 'maximum_total_cost' };
  if (input.estimatedTotalCostBrl > input.maximumTreeCostBrl) return { allowed: false, reason: 'execution_tree_cost' };
  if (!Number.isFinite(input.minimumMarginRate) || input.minimumMarginRate < 0 || input.minimumMarginRate >= 1) return { allowed: false, reason: 'invalid_margin' };
  const maximumByMargin = input.revenueAllocatedBrl * (1 - input.minimumMarginRate);
  if (input.estimatedTotalCostBrl > maximumByMargin + 1e-8) return { allowed: false, reason: 'minimum_margin' };
  if (!Number.isSafeInteger(input.inputTokens) || input.inputTokens < 0 || input.inputTokens > input.remainingInputTokens) return { allowed: false, reason: 'input_token_budget' };
  if (!Number.isSafeInteger(input.outputTokens) || input.outputTokens < 0 || input.outputTokens > input.remainingOutputTokens) return { allowed: false, reason: 'output_token_budget' };
  if (!Number.isSafeInteger(input.reasoningTokens) || input.reasoningTokens < 0 || input.reasoningTokens > input.remainingReasoningTokens) return { allowed: false, reason: 'reasoning_token_budget' };
  if (!Number.isSafeInteger(input.maxAttempts) || input.maxAttempts <= 0 || input.remainingAttempts <= 0) return { allowed: false, reason: 'attempt_budget' };
  return { allowed: true };
}

export function isPricingFresh(priceVerifiedAt: string | null, expirationDate: string | null, now = Date.now()): boolean {
  if (!priceVerifiedAt) return false;
  const verifiedAt = new Date(priceVerifiedAt).getTime();
  if (!Number.isFinite(verifiedAt) || verifiedAt > now) return false;
  if (expirationDate) {
    const expiration = new Date(expirationDate).getTime();
    if (!Number.isFinite(expiration) || expiration <= now) return false;
  }
  return true;
}
