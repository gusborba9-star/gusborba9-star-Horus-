import test from 'node:test';
import assert from 'node:assert/strict';
import { rankModels } from '../lib/nexus/model-router.ts';
import { optimizePrompt } from '../lib/nexus/prompt-optimizer.ts';

test('Nexus Core primitives are provider-neutral and task-fit aware', () => {
  const task = optimizePrompt('Compare two options and recommend the better one using current context.').profile;
  const entries = [
    {
      providerId: 'provider-cheap', modelId: 'model-balanced', capability: 'PERSONAL_TEXT',
      inputPricePerMillion: 0.1, outputPricePerMillion: 0.2, qualityScore: 0.84,
      latencyScore: 0.88, reliabilityScore: 0.93, contextWindow: 128000,
      inputModalities: ['text'], outputModalities: ['text'], source: 'LIVE_CATALOG',
    },
    {
      providerId: 'provider-expensive', modelId: 'model-frontier', capability: 'PERSONAL_TEXT',
      inputPricePerMillion: 8, outputPricePerMillion: 24, qualityScore: 0.99,
      latencyScore: 0.45, reliabilityScore: 0.91, contextWindow: 200000,
      inputModalities: ['text'], outputModalities: ['text'], source: 'LIVE_CATALOG',
    },
  ];
  const ranked = rankModels(entries, task, 1, 'PERSONAL_TEXT');
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].providerId, 'provider-cheap');
  assert.notEqual(ranked[0].providerId, 'provider-expensive');
  assert.ok(ranked[0].score > ranked[1].score);
});

test('Nexus task profile includes routing-relevant context', () => {
  const optimized = optimizePrompt('Research this topic and return a verified concise report.');
  assert.equal(optimized.profile.researchRequired, true);
  assert.equal(optimized.profile.criticality !== undefined, true);
  assert.equal(optimized.profile.expectedFormat, 'TEXT');
  assert.match(optimized.optimized, /HORUS TASK INSTRUCTION/);
});
