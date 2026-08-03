import type { EconomicTier, ExecutionBudget, ModelRecord, RoutingRequest } from './types';
import { maximumAuthorizedCostFromRevenue, minimumRevenueForCost } from './cost-engine';

export interface EconomicTierPolicy {
  qualityFloor: number;
  maxAttempts: number;
  maxOutputTokens: number;
  maxReasoningTokens: number;
  maxSteps: number;
  maxToolCalls: number;
  maxExecutionSeconds: number;
  allowFallback: boolean;
}

export interface EconomicSafetyPolicy {
  tiers: Record<EconomicTier, EconomicTierPolicy>;
  minimumMarginRate: number;
  creditBrlValue: number;
}

export interface EconomicAuthorizationInput {
  authorizedCredits: number;
  model: ModelRecord;
  request: RoutingRequest;
  maximumTotalCostBrl: number;
  policy: EconomicSafetyPolicy;
}

export interface EconomicAuthorizationDecision {
  allowed: boolean;
  reason?: string;
  tier: EconomicTier;
  maximumAuthorizedCostBrl: number;
  minimumRevenueBrl: number;
  budget: ExecutionBudget | null;
}

export function createExecutionBudget(input: EconomicAuthorizationInput): EconomicAuthorizationDecision {
  const tier = input.request.economicTier ?? 'BALANCED';
  const tierPolicy = input.policy.tiers[tier];
  if (!tierPolicy) return { allowed: false, reason: 'ECONOMIC_TIER_UNAVAILABLE', tier, maximumAuthorizedCostBrl: 0, minimumRevenueBrl: 0, budget: null };

  if (!Number.isSafeInteger(input.authorizedCredits) || input.authorizedCredits <= 0) {
    return { allowed: false, reason: 'INVALID_AUTHORIZED_CREDITS', tier, maximumAuthorizedCostBrl: 0, minimumRevenueBrl: 0, budget: null };
  }

  if (!input.policy.creditBrlValue || input.policy.creditBrlValue <= 0) {
    return { allowed: false, reason: 'INVALID_CREDIT_VALUE', tier, maximumAuthorizedCostBrl: 0, minimumRevenueBrl: 0, budget: null };
  }

  if (input.policy.minimumMarginRate < 0 || input.policy.minimumMarginRate >= 1) {
    return { allowed: false, reason: 'INVALID_MINIMUM_MARGIN', tier, maximumAuthorizedCostBrl: 0, minimumRevenueBrl: 0, budget: null };
  }

  if (!input.model.enabled || input.model.expirationDate && Date.parse(input.model.expirationDate) <= Date.now()) {
    return { allowed: false, reason: 'MODEL_DISABLED_OR_EXPIRED', tier, maximumAuthorizedCostBrl: 0, minimumRevenueBrl: 0, budget: null };
  }

  if (input.model.qualityScore < tierPolicy.qualityFloor) {
    return { allowed: false, reason: 'QUALITY_FLOOR_NOT_MET', tier, maximumAuthorizedCostBrl: 0, minimumRevenueBrl: 0, budget: null };
  }

  const revenueAllocatedBrl = input.authorizedCredits * input.policy.creditBrlValue;
  const maximumAuthorizedCostBrl = maximumAuthorizedCostFromRevenue(revenueAllocatedBrl, input.policy.minimumMarginRate);
  const minimumRevenueBrl = minimumRevenueForCost(input.maximumTotalCostBrl, input.policy.minimumMarginRate);

  if (input.maximumTotalCostBrl > maximumAuthorizedCostBrl) {
    return { allowed: false, reason: 'MAXIMUM_COST_EXCEEDS_AUTHORIZED_ECONOMIC_CAP', tier, maximumAuthorizedCostBrl, minimumRevenueBrl, budget: null };
  }

  const requestedAttempts = Math.max(1, Math.floor(input.request.maxAttempts ?? (tierPolicy.allowFallback ? tierPolicy.maxAttempts : 1)));
  if (requestedAttempts > tierPolicy.maxAttempts || (!tierPolicy.allowFallback && requestedAttempts > 1)) {
    return { allowed: false, reason: 'ATTEMPT_POLICY_EXCEEDED', tier, maximumAuthorizedCostBrl, minimumRevenueBrl, budget: null };
  }

  const budget: ExecutionBudget = {
    operationId: crypto.randomUUID(),
    authorizedCredits: input.authorizedCredits,
    revenueAllocatedBrl,
    maximumProviderCostBrl: input.maximumTotalCostBrl,
    maximumTotalCostBrl: input.maximumTotalCostBrl,
    minimumMarginRate: input.policy.minimumMarginRate,
    maxAttempts: requestedAttempts,
    maxInputTokens: Math.max(0, input.request.inputTokens ?? input.model.contextWindow ?? 0),
    maxOutputTokens: Math.min(tierPolicy.maxOutputTokens, input.request.maxOutputTokens ?? tierPolicy.maxOutputTokens),
    maxReasoningTokens: Math.min(tierPolicy.maxReasoningTokens, input.request.maxReasoningTokens ?? tierPolicy.maxReasoningTokens),
    maxSteps: tierPolicy.maxSteps,
    maxToolCalls: tierPolicy.maxToolCalls,
    maxExecutionSeconds: tierPolicy.maxExecutionSeconds,
  };

  return { allowed: true, tier, maximumAuthorizedCostBrl, minimumRevenueBrl, budget };
}

export function canSpendFromExecutionBudget(budget: ExecutionBudget, proposedCostBrl: number): boolean {
  return Number.isFinite(proposedCostBrl) && proposedCostBrl >= 0 && proposedCostBrl <= budget.maximumTotalCostBrl;
}
