import test from 'node:test';
import assert from 'node:assert/strict';

const moduleUrl = new URL('../lib/collaborators/nexus.ts', import.meta.url);

test('E2E 10 Nexus contract: deterministic capability inference falls back to TEXT_GENERATION', async () => {
  const { inferCapability } = await import(moduleUrl.href);
  assert.equal(inferCapability('prepare um texto executivo', ['TEXT_GENERATION']), 'TEXT_GENERATION');
});

test('E2E 10 Nexus contract: unavailable specialized capability is never selected', async () => {
  const { inferCapability } = await import(moduleUrl.href);
  assert.equal(inferCapability('analisar e comparar dados', ['TEXT_GENERATION']), 'TEXT_GENERATION');
});

test('E2E 10 idempotency hash is stable for identical intent/options', async () => {
  const { hashRequest } = await import(moduleUrl.href);
  assert.equal(hashRequest('same intent', { organization_id: null }), hashRequest('same intent', { organization_id: null }));
  assert.notEqual(hashRequest('same intent', { organization_id: null }), hashRequest('different intent', { organization_id: null }));
});
