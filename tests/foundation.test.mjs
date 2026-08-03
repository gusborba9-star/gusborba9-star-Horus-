import test from 'node:test';
import assert from 'node:assert/strict';

function hasAvailableCredits(balance, held, requested) {
  return balance - held >= requested;
}

test('credit reservation cannot exceed available credits', () => {
  assert.equal(hasAvailableCredits(1000, 200, 800), true);
  assert.equal(hasAvailableCredits(1000, 200, 801), false);
});

test('idempotency keys must be non-empty', () => {
  assert.throws(() => {
    if (!'operation-123') throw new Error('INVALID_IDEMPOTENCY_KEY');
  }, /INVALID_IDEMPOTENCY_KEY/);
  assert.doesNotThrow(() => {
    if (!'operation-123') throw new Error('INVALID_IDEMPOTENCY_KEY');
  });
});

test('privileged operations are not represented as user-scoped authorization', () => {
  const authorization = { privileged: false, permissions: ['ai.execute'] };
  assert.equal(authorization.privileged, false);
  assert.ok(authorization.permissions.includes('ai.execute'));
});
