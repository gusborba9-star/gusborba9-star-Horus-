import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTaskProfile } from '../lib/nexus/task-profile.ts';
import { rankModels } from '../lib/nexus/model-router.ts';

const catalog = fs.readFileSync(new URL('../lib/personal/catalog.ts', import.meta.url), 'utf8');

test('Personal has exactly the six official personas', () => {
  const match = catalog.match(/PERSONAL_PERSONA_IDS = \[([^\]]+)\]/s);
  assert.ok(match);
  const ids = [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
  assert.deepEqual(ids, ['aline', 'luiza', 'iris', 'clara', 'bel', 'lucia']);
});

test('task profile captures routing-relevant dimensions', () => {
  const profile = buildTaskProfile('Pesquise preços atuais e compare alternativas com uma análise detalhada em tabela.');
  assert.equal(profile.researchRequired, true);
  assert.equal(profile.freshnessRequired, true);
  assert.equal(profile.expectedFormat, 'STRUCTURED');
  assert.equal(profile.reasoningDepth, 'MEDIUM');
});

test('adaptive router prefers task-fit cost efficiency over absolute quality', () => {
  const profile = buildTaskProfile('Responda objetivamente a esta pergunta curta.');
  const ranked = rankModels([
    { providerId: 'p', modelId: 'expensive', capability: 'TEXT_GENERATION', inputPricePerMillion: 20, outputPricePerMillion: 40, qualityScore: 1, latencyScore: 0.7, reliabilityScore: 0.95, contextWindow: 128000, inputModalities: ['text'], outputModalities: ['text'], source: 'REGISTRY' },
    { providerId: 'p', modelId: 'efficient', capability: 'TEXT_GENERATION', inputPricePerMillion: 0.1, outputPricePerMillion: 0.2, qualityScore: 0.82, latencyScore: 0.9, reliabilityScore: 0.95, contextWindow: 128000, inputModalities: ['text'], outputModalities: ['text'], source: 'REGISTRY' },
  ], profile, 0.04);
  assert.equal(ranked[0].modelId, 'efficient');
});

test('Personal runtime is provider-neutral at the execution boundary', () => {
  const source = fs.readFileSync(new URL('../lib/providers/inference.ts', import.meta.url), 'utf8');
  assert.match(source, /interface TextInferenceProvider/);
  assert.match(source, /getTextInferenceProvider/);
  assert.doesNotMatch(source, /gemini-3\.5-flash/);
});

test('permission center is allowlisted and revocable', () => {
  const source = fs.readFileSync(new URL('../app/api/personal/permissions/route.ts', import.meta.url), 'utf8');
  assert.match(source, /PERSONAL_CAPABILITIES/);
  assert.match(source, /REMINDERS_CREATE/);
  assert.match(source, /status: 'REVOKED'/);
});

test('existing checkout is tier-agnostic and strictly read-only', () => {
  const page = fs.readFileSync(new URL('../app/dashboard/personal/page.tsx', import.meta.url), 'utf8');
  const route = fs.readFileSync(new URL('../app/api/personal/billing/checkout-existing/route.ts', import.meta.url), 'utf8');
  assert.match(page, /const canInspectExistingCheckout=hasExistingPendingSubscription/);
  assert.match(page, /fetch\('\/api\/personal\/billing\/checkout-existing',\{method:'GET'/);
  assert.doesNotMatch(page, /canInspectExistingCheckout=data\?\.subscription\?\.tier===['"]PERSONAL_PRO/);
  assert.doesNotMatch(route, /1050230429|1528967|136181/);
  assert.match(route, /paymentService\.getSubscription\(subscription\.external_subscription_id/);
  assert.match(route, /paymentService\.getCharge\(chargeId/);
  assert.doesNotMatch(route, /method:\s*['"]POST['"]/);
});
