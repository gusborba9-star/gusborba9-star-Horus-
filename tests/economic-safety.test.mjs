import assert from 'node:assert/strict';
import test from 'node:test';
import { maximumAuthorizedCostFromRevenue, minimumRevenueForCost, estimateTextCost } from '../lib/economic/cost-engine.ts';
import { createExecutionBudget, canSpendFromExecutionBudget, calculateMaximumExecutionTreeCost, evaluateMargin, assertActualCostWithinAuthorization } from '../lib/economic/economic-safety.ts';

const model = {
  id: 'test/model', providerId: 'test-provider', capability: 'TEXT_GENERATION', inputPricePerMillion: 1,
  outputPricePerMillion: 4, requestPrice: 0, imagePrice: 0, reasoningPricePerMillion: 2,
  cachedInputPricePerMillion: 0.25, cacheWritePricePerMillion: 1, currency: 'USD',
  qualityScore: 0.9, latencyScore: 0.9, reliabilityScore: 0.99, contextWindow: 100000,
  maxCompletionTokens: 50000, supportedParameters: ['max_tokens', 'reasoning'], inputModalities: ['text'],
  outputModalities: ['text'], canonicalSlug: 'test/model', enabled: true,
  priceVerifiedAt: new Date().toISOString(), expirationDate: null,
};

const policy = {
  fxRateUsdToBrl: 5, exchangeBufferRate: 0.05, safetyBufferRate: 0.05, infrastructureRate: 0.05,
  creditBrlValue: 1, providerFeeRate: 0.055, fxBufferRate: 0.05, pricingDriftBufferRate: 0.10,
  usageUncertaintyRate: 0.05, retryReserveRate: 0, failureReserveRate: 0.02,
  targetGrossMarginRate: 0.70, minimumGrossMarginRate: 0.60, globalExecutionEnabled: true, version: 1,
};

const tierPolicies = {
  ECONOMIC: { qualityFloor: 0.5, maxAttempts: 1, maxOutputTokens: 1000, maxReasoningTokens: 0, maxSteps: 2, maxToolCalls: 0, maxExecutionSeconds: 30, allowFallback: false },
  BALANCED: { qualityFloor: 0.7, maxAttempts: 1, maxOutputTokens: 2000, maxReasoningTokens: 0, maxSteps: 4, maxToolCalls: 1, maxExecutionSeconds: 60, allowFallback: false },
  PREMIUM: { qualityFloor: 0.85, maxAttempts: 2, maxOutputTokens: 4000, maxReasoningTokens: 1000, maxSteps: 6, maxToolCalls: 2, maxExecutionSeconds: 120, allowFallback: true },
};

test('revenue cap is strictly below revenue after minimum margin', () => {
  assert.equal(maximumAuthorizedCostFromRevenue(1, 0.10), 0.9);
  assert.equal(minimumRevenueForCost(10, 0.70), 33.33333334);
});

test('maximum cost uses hard output/reasoning caps rather than estimated output', () => {
  const estimate = estimateTextCost(model, 1000, 100, policy, { maxOutputTokens: 50000, maxReasoningTokens: 20000, maxAttempts: 1 });
  assert.ok(estimate.maximumTotalCostBrl > estimate.estimatedProviderCostBrl);
  assert.ok(estimate.requiredCredits > 0);
});

test('negative margin is rejected even when estimate looks profitable', () => {
  assert.equal(evaluateMargin(9, 10, 0.5).allowed, false);
});

test('authorized 1 and maximum 0.90 passes at zero protected margin', () => {
  assert.equal(evaluateMargin(0.90, 1, 0).allowed, true);
});

test('authorized 1 and maximum 1.01 rejects', () => {
  assert.equal(evaluateMargin(1.01, 1, 0).allowed, false);
});

test('fallback tree is bounded before execution', () => {
  const total = calculateMaximumExecutionTreeCost({ id: 'primary', maximumCostBrl: 0.5, children: [
    { id: 'retry', maximumCostBrl: 1.0 },
    { id: 'fallback', maximumCostBrl: 3.0, children: [{ id: 'fallback-retry', maximumCostBrl: 3.0 }] },
  ]});
  assert.equal(total, 7.5);
  assert.equal(evaluateMargin(total, 5, 0).allowed, false);
});

test('execution tree of 8 cannot fit a budget of 5', () => {
  const total = calculateMaximumExecutionTreeCost({ id: 'primary', maximumCostBrl: 1, children: [
    { id: 'retry', maximumCostBrl: 1 },
    { id: 'fallback', maximumCostBrl: 3, children: [{ id: 'fallback-retry', maximumCostBrl: 3 }] },
  ]});
  assert.equal(total, 8);
  assert.equal(evaluateMargin(total, 5, 0).allowed, false);
});

test('actual cost above authorization is an economic security incident', () => {
  assert.throws(() => assertActualCostWithinAuthorization(1.01, 1), /ECONOMIC_SECURITY_INCIDENT/);
});

test('economic authorization rejects maximum cost above protected economic cap', () => {
  const decision = createExecutionBudget({
    authorizedCredits: 1, model, request: { capability: 'TEXT_GENERATION', economicTier: 'PREMIUM', maxAttempts: 1 }, maximumTotalCostBrl: 1.01,
    policy: { creditBrlValue: 1, minimumMarginRate: 0, tiers: tierPolicies },
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, 'MAXIMUM_COST_EXCEEDS_AUTHORIZED_ECONOMIC_CAP');
});

test('execution budget rejects a proposed spend above its hard cap', () => {
  const decision = createExecutionBudget({
    authorizedCredits: 10, model, request: { capability: 'TEXT_GENERATION', economicTier: 'BALANCED', maxAttempts: 1 }, maximumTotalCostBrl: 4,
    policy: { creditBrlValue: 1, minimumMarginRate: 0.5, tiers: tierPolicies },
  });
  assert.equal(decision.allowed, true);
  assert.ok(decision.budget);
  assert.equal(canSpendFromExecutionBudget(decision.budget, 4), true);
  assert.equal(canSpendFromExecutionBudget(decision.budget, 4.01), false);
});

test('fallback is rejected when the tier cannot authorize multiple attempts', () => {
  const decision = createExecutionBudget({
    authorizedCredits: 10, model, request: { capability: 'TEXT_GENERATION', economicTier: 'BALANCED', maxAttempts: 2 }, maximumTotalCostBrl: 2,
    policy: { creditBrlValue: 1, minimumMarginRate: 0.5, tiers: tierPolicies },
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, 'ATTEMPT_POLICY_EXCEEDED');
});
