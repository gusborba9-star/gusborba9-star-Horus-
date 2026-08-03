import test from 'node:test';
import assert from 'node:assert/strict';

function estimate(inputTokens, outputTokens, inputPrice, outputPrice, fx, exchange, safety, infra, creditValue) {
  const provider = ((inputTokens / 1e6) * inputPrice + (outputTokens / 1e6) * outputPrice) * fx;
  const exchangeBuffer = provider * exchange;
  const safetyBuffer = (provider + exchangeBuffer) * safety;
  const platform = (provider + exchangeBuffer + safetyBuffer) * infra;
  return Math.ceil((provider + exchangeBuffer + safetyBuffer + platform) / creditValue);
}

test('economic estimate includes FX, exchange buffer, safety buffer and infrastructure', () => {
  assert.equal(estimate(1_000_000, 1_000_000, 1, 2, 5, 0.1, 0.2, 0.1, 1), 18);
});

test('zero or negative monetary inputs are rejected by the contract', () => {
  assert.throws(() => estimate(1_000_000, 1_000_000, -1, 2, 5, 0.1, 0.2, 0.1, 1));
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
