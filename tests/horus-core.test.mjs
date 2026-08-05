import test from 'node:test';
import assert from 'node:assert/strict';

// Importa o módulo TypeScript diretamente usando o strip-types configurado em package.json.
const { runHorusCore } = await import('../lib/core/horusGraph.ts');

test('Hórus Core rejeita evento sem event_type', async () => {
  const result = await runHorusCore({ payload: {}, source: 'test' });

  assert.equal(result.action, 'invalid_request');
  assert.equal(result.requiresHuman, true);
  assert.equal(result.confidence, 0);
});

test('Hórus Core exige autorização econômica antes da execução automática', async () => {
  const result = await runHorusCore({
    event_type: 'operation.requested',
    source: 'test',
    payload: {
      intent: 'classify_request',
      operation: 'analysis',
      request_id: 'test-request',
      input: 'test execution',
    },
  });

  assert.equal(result.requiresHuman, false);
  assert.equal(result.action, 'economic_authorization_required');
  assert.equal(result.economicAuthorized, false);
  assert.equal(result.error, 'economic_authorization_requires_budget_and_input');
  assert.equal(result.confidence, 0.85);
});

test('Hórus Core encaminha contexto insuficiente para revisão humana', async () => {
  const result = await runHorusCore({
    event_type: 'operation.requested',
    payload: {},
    source: '',
  });

  assert.equal(result.requiresHuman, true);
  assert.equal(result.action, 'human_review');
  assert.equal(result.confidence, 0.55);
});
