import type { EconomicTier, ExecutionBudget, ModelRecord, ProviderRecord, RoutingRequest } from './types';
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

export interface ExecutionCostNode { id: string; maximumCostBrl: number; children?: ExecutionCostNode[]; }
export interface EconomicCandidate {
  provider: ProviderRecord;
  model: ModelRecord;
  maximumCostBrl: number;
  estimatedCostBrl: number;
  marginRate: number;
  pricingFresh: boolean;
  riskScore: number;
}

function finiteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`INVALID_ECONOMIC_INPUT:${name}`);
}

function validMargin(value: number): void {
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('INVALID_MARGIN_RATE');
}

export function calculateMaximumExecutionTreeCost(root: ExecutionCostNode): number {
  const visit = (node: ExecutionCostNode): number => {
    finiteNonNegative(node.id, node.maximumCostBrl);
    return node.maximumCostBrl + (node.children ?? []).reduce((sum, child) => sum + visit(child), 0);
  };
  return visit(root);
}

export function evaluateMargin(maximumCostBrl: number, netRevenueBrl: number, minimumMarginRate: number) {
  finiteNonNegative('maximumCostBrl', maximumCostBrl);
  finiteNonNegative('netRevenueBrl', netRevenueBrl);
  validMargin(minimumMarginRate);
  const maximumAllowedCostBrl = maximumAuthorizedCostFromRevenue(netRevenueBrl, minimumMarginRate);
  return {
    allowed: maximumCostBrl <= maximumAllowedCostBrl,
    maximumAllowedCostBrl,
    requiredRevenueBrl: minimumRevenueForCost(maximumCostBrl, minimumMarginRate),
    reason: maximumCostBrl <= maximumAllowedCostBrl ? undefined : 'MAXIMUM_COST_EXCEEDS_PROTECTED_MARGIN',
  };
}

export function paretoFrontier(candidates: EconomicCandidate[]): EconomicCandidate[] {
  return candidates.filter((candidate, index) => !candidates.some((other, otherIndex) => {
    if (index === otherIndex) return false;
    const noWorse = other.model.qualityScore >= candidate.model.qualityScore
      && other.model.reliabilityScore >= candidate.model.reliabilityScore
      && other.model.latencyScore >= candidate.model.latencyScore
      && other.maximumCostBrl <= candidate.maximumCostBrl;
    const strictlyBetter = other.model.qualityScore > candidate.model.qualityScore
      || other.model.reliabilityScore > candidate.model.reliabilityScore
      || other.model.latencyScore > candidate.model.latencyScore
      || other.maximumCostBrl < candidate.maximumCostBrl;
    return noWorse && strictlyBetter;
  }));
}

export function economicUtility(candidate: EconomicCandidate, tier: EconomicTier): number {
  const tierWeight = tier === 'PREMIUM' ? 1.1 : tier === 'ECONOMIC' ? 0.9 : 1;
  const freshness = candidate.pricingFresh ? 1 : 0.5;
  const risk = Math.max(0, Math.min(1, candidate.riskScore));
  return (candidate.model.qualityScore * 0.40 + candidate.model.reliabilityScore * 0.25 + candidate.model.latencyScore * 0.15 + Math.max(0, Math.min(1, candidate.marginRate)) * 0.20) * tierWeight * freshness * (1 - risk);
}

export function selectEconomicallySafeCandidate(candidates: EconomicCandidate[], netRevenueBrl: number, minimumMarginRate: number, tier: EconomicTier): EconomicCandidate {
  const safe = paretoFrontier(candidates).filter((candidate) => candidate.provider.status !== 'DISABLED' && candidate.model.enabled && evaluateMargin(candidate.maximumCostBrl, netRevenueBrl, minimumMarginRate).allowed);
  if (!safe.length) throw new Error('NO_ECONOMICALLY_SAFE_ROUTE');
  return safe.sort((a, b) => economicUtility(b, tier) - economicUtility(a, tier))[0];
}

export function assertActualCostWithinAuthorization(actualTotalCostBrl: number, authorizedExecutionCostBrl: number): void {
  finiteNonNegative('actualTotalCostBrl', actualTotalCostBrl);
  finiteNonNegative('authorizedExecutionCostBrl', authorizedExecutionCostBrl);
  if (actualTotalCostBrl > authorizedExecutionCostBrl) throw new Error('ECONOMIC_SECURITY_INCIDENT_ACTUAL_COST_EXCEEDS_AUTHORIZATION');
}

export function createExecutionBudget(input: EconomicAuthorizationInput): EconomicAuthorizationDecision {
  const tier = input.request.economicTier ?? 'BALANCED';
  const tierPolicy = input.policy.tiers[tier];
  const reject = (reason: string): EconomicAuthorizationDecision => ({ allowed: false, reason, tier, maximumAuthorizedCostBrl: 0, minimumRevenueBrl: 0, budget: null });
  if (!tierPolicy) return reject('ECONOMIC_TIER_UNAVAILABLE');
  if (!Number.isSafeInteger(input.authorizedCredits) || input.authorizedCredits <= 0) return reject('INVALID_AUTHORIZED_CREDITS');
  if (!Number.isFinite(input.policy.creditBrlValue) || input.policy.creditBrlValue <= 0) return reject('INVALID_CREDIT_VALUE');
  if (!Number.isFinite(input.policy.minimumMarginRate) || input.policy.minimumMarginRate < 0 || input.policy.minimumMarginRate >= 1) return reject('INVALID_MINIMUM_MARGIN');
  if (!Number.isFinite(input.maximumTotalCostBrl) || input.maximumTotalCostBrl < 0) return reject('INVALID_MAXIMUM_COST');
  if (!input.model.enabled || (input.model.expirationDate && Date.parse(input.model.expirationDate) <= Date.now())) return reject('MODEL_DISABLED_OR_EXPIRED');
  if (input.model.qualityScore < tierPolicy.qualityFloor) return reject('QUALITY_FLOOR_NOT_MET');

  const revenueAllocatedBrl = input.authorizedCredits * input.policy.creditBrlValue;
  const maximumAuthorizedCostBrl = maximumAuthorizedCostFromRevenue(revenueAllocatedBrl, input.policy.minimumMarginRate);
  const minimumRevenueBrl = minimumRevenueForCost(input.maximumTotalCostBrl, input.policy.minimumMarginRate);
  if (input.maximumTotalCostBrl > maximumAuthorizedCostBrl) return { allowed: false, reason: 'MAXIMUM_COST_EXCEEDS_AUTHORIZED_ECONOMIC_CAP', tier, maximumAuthorizedCostBrl, minimumRevenueBrl, budget: null };

  const requestedAttempts = Math.max(1, Math.floor(input.request.maxAttempts ?? (tierPolicy.allowFallback ? tierPolicy.maxAttempts : 1)));
  if (requestedAttempts > tierPolicy.maxAttempts || (!tierPolicy.allowFallback && requestedAttempts > 1)) return { allowed: false, reason: 'ATTEMPT_POLICY_EXCEEDED', tier, maximumAuthorizedCostBrl, minimumRevenueBrl, budget: null };

  const budget: ExecutionBudget = {
    operationId: crypto.randomUUID(), authorizedCredits: input.authorizedCredits, revenueAllocatedBrl,
    maximumProviderCostBrl: input.maximumTotalCostBrl, maximumTotalCostBrl: input.maximumTotalCostBrl,
    minimumMarginRate: input.policy.minimumMarginRate, maxAttempts: requestedAttempts,
    maxInputTokens: Math.max(0, input.request.inputTokens ?? input.model.contextWindow ?? 0),
    maxOutputTokens: Math.min(tierPolicy.maxOutputTokens, input.request.maxOutputTokens ?? tierPolicy.maxOutputTokens),
    maxReasoningTokens: Math.min(tierPolicy.maxReasoningTokens, input.request.maxReasoningTokens ?? tierPolicy.maxReasoningTokens),
    maxSteps: tierPolicy.maxSteps, maxToolCalls: tierPolicy.maxToolCalls, maxExecutionSeconds: tierPolicy.maxExecutionSeconds,
  };
  return { allowed: true, tier, maximumAuthorizedCostBrl, minimumRevenueBrl, budget };
}

export function canSpendFromExecutionBudget(budget: ExecutionBudget, proposedCostBrl: number): boolean {
  return Number.isFinite(proposedCostBrl) && proposedCostBrl >= 0 && proposedCostBrl <= budget.maximumTotalCostBrl;
}
