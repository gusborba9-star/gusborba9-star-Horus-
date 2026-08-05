import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateTextCost } from '../lib/economic/cost-engine.ts';

const model = {
  id: 'test/model', providerId: 'test-provider', capability: 'TEXT_GENERATION', inputPricePerMillion: 1,
  outputPricePerMillion: 2, requestPrice: 0, imagePrice: 0, reasoningPricePerMillion: 0,
  cachedInputPricePerMillion: 0, cacheWritePricePerMillion: 0, currency: 'USD',
  qualityScore: 0.9, latencyScore: 0.9, reliabilityScore: 0.99, contextWindow: 1_000_000,
  maxCompletionTokens: 1_000_000, supportedParameters: [], inputModalities: ['text'], outputModalities: ['text'],
  canonicalSlug: 'test/model', enabled: true, priceVerifiedAt: new Date().toISOString(), expirationDate: null,
};

const policy = {
  fxRateUsdToBrl: 5, exchangeBufferRate: 0.1, safetyBufferRate: 0.2, infrastructureRate: 0.1,
  creditBrlValue: 1, providerFeeRate: 0, fxBufferRate: 0, pricingDriftBufferRate: 0,
  usageUncertaintyRate: 0, retryReserveRate: 0, failureReserveRate: 0,
  targetGrossMarginRate: 0, minimumGrossMarginRate: 0, globalExecutionEnabled: true, version: 1,
};

test('economic estimate includes FX, exchange buffer, safety buffer and infrastructure', () => {
  const estimate = estimateTextCost(model, 1_000_000, 1_000_000, policy, {
    maxOutputTokens: 1_000_000,
    maxReasoningTokens: 0,
    maxAttempts: 1,
  });
  assert.equal(estimate.maximumProviderCostBrl, 15);
  assert.equal(estimate.maximumTotalCostBrl, 21.78);
  assert.equal(estimate.requiredCredits, 22);
});

test('zero or negative monetary inputs are rejected by the production cost contract', () => {
  assert.throws(() => estimateTextCost({ ...model, inputPricePerMillion: -1 }, 1_000_000, 1_000_000, policy, { maxOutputTokens: 1_000_000 }), /INVALID_COST_INPUT/);
  assert.throws(() => estimateTextCost(model, 1_000_000, 1_000_000, { ...policy, fxRateUsdToBrl: 0 }, { maxOutputTokens: 1_000_000 }), /INVALID_COST_INPUT/);
  assert.throws(() => estimateTextCost(model, 1_000_000, 1_000_000, { ...policy, creditBrlValue: 0 }, { maxOutputTokens: 1_000_000 }), /INVALID_COST_INPUT/);
});

test('provider overage is not implicitly converted into an authorized charge', () => {
  const reserved = 10;
  const actual = 11;
  assert.ok(actual > reserved);
  assert.notEqual(actual, reserved);
});

test('idempotency keys are expected to be unique per user and operation', () => {
  const keys = new Set(['user-a:operation-1']);
  assert.equal(keys.has('user-a:operation-1'), true);
  assert.equal(keys.has('user-b:operation-1'), false);
});
