import test from 'node:test';
import assert from 'node:assert/strict';
import { assessCoreConfidence, validateCoreInput } from '../lib/core/confidence.ts';

test('Hórus Core rejeita evento sem event_type', () => {
  const result = validateCoreInput({ eventType: '', payload: {}, source: '', memoryMatches: 0 });
  assert.equal(result.valid, false);
  assert.equal(result.error, 'event_type é obrigatório');
});

test('Hórus Core exige autorização econômica depois de confiança suficiente', () => {
  const result = assessCoreConfidence({
    eventType: 'operation.requested',
    source: 'test',
    memoryMatches: 0,
    payload: { intent: 'classify_request', operation: 'analysis', request_id: 'test-request', input: 'test execution' },
  });
  assert.equal(result.requiresHuman, false);
  assert.equal(result.action, 'route_to_service');
  assert.equal(result.confidence, 0.9);
});

test('Hórus Core encaminha contexto insuficiente para revisão humana', () => {
  const result = assessCoreConfidence({ eventType: 'operation.requested', payload: {}, source: '', memoryMatches: 0 });
  assert.equal(result.requiresHuman, true);
  assert.equal(result.action, 'human_review');
  assert.equal(result.confidence, 0.55);
});

test('aprovação humana explícita libera a continuação sem remover a autorização econômica', () => {
  const result = assessCoreConfidence({ eventType: 'operation.requested', payload: {}, source: 'human-review', memoryMatches: 0, humanApproval: { reviewId: 'review-1', approved: true } });
  assert.equal(result.requiresHuman, false);
  assert.equal(result.action, 'route_to_service');
  assert.equal(result.confidence, 0.7);
});
