import type { EconomicTier, ModelRecord, ProviderRecord } from './types';

export interface ExecutionCostNode {
  id: string;
  maximumCostBrl: number;
  children?: ExecutionCostNode[];
}

export interface MarginDecision {
  allowed: boolean;
  maximumAllowedCostBrl: number;
  requiredRevenueBrl: number;
  reason?: string;
}

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

function marginRate(value: number): void {
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('INVALID_MARGIN_RATE');
}

export function calculateMaximumExecutionTreeCost(root: ExecutionCostNode): number {
  const visit = (node: ExecutionCostNode): number => {
    finiteNonNegative(node.id, node.maximumCostBrl);
    return node.maximumCostBrl + (node.children ?? []).reduce((sum, child) => sum + visit(child), 0);
  };
  return visit(root);
}

export function maximumCostAllowedByRevenue(netRevenueBrl: number, minimumMarginRate: number): number {
  finiteNonNegative('netRevenueBrl', netRevenueBrl);
  marginRate(minimumMarginRate);
  return netRevenueBrl * (1 - minimumMarginRate);
}

export function minimumRevenueForMaximumCost(maximumCostBrl: number, minimumMarginRate: number): number {
  finiteNonNegative('maximumCostBrl', maximumCostBrl);
  marginRate(minimumMarginRate);
  return maximumCostBrl / (1 - minimumMarginRate);
}

export function evaluateMargin(maximumCostBrl: number, netRevenueBrl: number, minimumMarginRate: number): MarginDecision {
  finiteNonNegative('maximumCostBrl', maximumCostBrl);
  finiteNonNegative('netRevenueBrl', netRevenueBrl);
  marginRate(minimumMarginRate);
  const maximumAllowedCostBrl = maximumCostAllowedByRevenue(netRevenueBrl, minimumMarginRate);
  return {
    allowed: maximumCostBrl <= maximumAllowedCostBrl,
    maximumAllowedCostBrl,
    requiredRevenueBrl: minimumRevenueForMaximumCost(maximumCostBrl, minimumMarginRate),
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
  const quality = Math.max(0, candidate.model.qualityScore);
  const reliability = Math.max(0, candidate.model.reliabilityScore);
  const latency = Math.max(0, candidate.model.latencyScore);
  const margin = Math.max(0, Math.min(1, candidate.marginRate));
  const freshness = candidate.pricingFresh ? 1 : 0.5;
  const risk = Math.max(0, Math.min(1, candidate.riskScore));
  return (quality * 0.40 + reliability * 0.25 + latency * 0.15 + margin * 0.20) * tierWeight * freshness * (1 - risk);
}

export function selectEconomicallySafeCandidate(
  candidates: EconomicCandidate[],
  netRevenueBrl: number,
  minimumMarginRate: number,
  tier: EconomicTier,
): EconomicCandidate {
  const safe = paretoFrontier(candidates).filter((candidate) => {
    if (!candidate.provider || candidate.provider.status === 'DISABLED') return false;
    if (!candidate.model.enabled) return false;
    return evaluateMargin(candidate.maximumCostBrl, netRevenueBrl, minimumMarginRate).allowed;
  });
  if (!safe.length) throw new Error('NO_ECONOMICALLY_SAFE_ROUTE');
  return safe.sort((a, b) => economicUtility(b, tier) - economicUtility(a, tier))[0];
}

export function assertActualCostWithinAuthorization(actualTotalCostBrl: number, authorizedExecutionCostBrl: number): void {
  finiteNonNegative('actualTotalCostBrl', actualTotalCostBrl);
  finiteNonNegative('authorizedExecutionCostBrl', authorizedExecutionCostBrl);
  if (actualTotalCostBrl > authorizedExecutionCostBrl) throw new Error('ECONOMIC_SECURITY_INCIDENT_ACTUAL_COST_EXCEEDS_AUTHORIZATION');
}
