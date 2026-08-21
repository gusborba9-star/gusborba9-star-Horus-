import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inferCapabilities, buildOptimizedSpec } from '../lib/studio/engine.ts';
import { inferCapabilityFromModalities, rankModels } from '../lib/nexus/model-router.ts';
import { optimizePrompt } from '../lib/nexus/prompt-optimizer.ts';
import { createArtifactToken, verifyArtifactToken } from '../lib/studio/artifact-access.ts';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('Studio preserves objective context when a revision prompt is shorter', () => {
  const project = {
    identity: { id: 'p1', name: 'Imagem', ownerUserId: 'u1' },
    objective: 'Quero criar uma imagem de uma mulher andando na chuva.',
    context: {}, requirements: [], architecture: {}, capabilities: [], connectors: [], executionGraph: {}, environment: 'PREVIEW', environmentState: {}, delivery: {},
  };
  const capabilities = inferCapabilities('Mulher andando', project);
  assert.ok(capabilities.includes('IMAGE'));
  assert.ok(!capabilities.includes('CODE'));
});

test('Studio optimized spec selects IMAGE from project objective plus revision prompt', () => {
  const project = {
    identity: { id: 'p1', name: 'Imagem', ownerUserId: 'u1' },
    objective: 'Quero criar uma imagem de uma mulher andando na chuva.',
    context: {}, requirements: [], architecture: {}, capabilities: [], connectors: [], executionGraph: {}, environment: 'PREVIEW', environmentState: {}, delivery: {},
  };
  const spec = buildOptimizedSpec({ prompt: 'Mulher andando', project });
  assert.ok(spec.capabilities.includes('IMAGE'));
});

test('OpenRouter live modality metadata maps image output to IMAGE', () => {
  assert.equal(inferCapabilityFromModalities(['image'], ['text']), 'IMAGE');
  assert.equal(inferCapabilityFromModalities(['text'], ['image', 'text']), 'TEXT_GENERATION');
});

test('Model router selects an IMAGE-capable output model', () => {
  const task = optimizePrompt('Quero criar uma imagem de uma mulher andando na chuva.').profile;
  const entries = [
    { providerId: 'openrouter', modelId: 'text-model', capability: 'TEXT_GENERATION', inputPricePerMillion: 1, outputPricePerMillion: 2, qualityScore: 0.9, latencyScore: 0.9, reliabilityScore: 0.9, contextWindow: 128000, inputModalities: ['text'], outputModalities: ['text'], source: 'LIVE_CATALOG' },
    { providerId: 'openrouter', modelId: 'image-model', capability: 'IMAGE', inputPricePerMillion: 1, outputPricePerMillion: 2, qualityScore: 0.9, latencyScore: 0.9, reliabilityScore: 0.9, contextWindow: 128000, inputModalities: ['text'], outputModalities: ['image'], source: 'LIVE_CATALOG' },
  ];
  const ranked = rankModels(entries, task, 10, 'IMAGE');
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].modelId, 'image-model');
});

test('Binary results use a stable signed browser artifact URL', () => {
  const nexus = read('app/api/studio/projects/[projectId]/nexus/route.ts');
  const artifact = read('app/api/studio/results/[resultId]/artifact/route.ts');
  assert.match(nexus, /source_artifact_url/);
  assert.match(nexus, /createArtifactToken/);
  assert.match(nexus, /\/api\/studio\/results\/\$\{storedResult\.id\}\/artifact\?token=/);
  assert.match(nexus, /NEXUS_ARTIFACT_PERSIST_FAILED/);
  assert.match(artifact, /requireStudioUser/);
  assert.match(artifact, /verifyArtifactToken/);
  assert.match(artifact, /Content-Type/);
  assert.match(artifact, /Content-Disposition/);
});

test('Artifact access tokens round-trip and reject tampering', () => {
  const previous = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'studio-artifact-test-secret';
  try {
    const resultId = '00000000-0000-0000-0000-000000000001';
    const token = createArtifactToken(resultId, Math.floor(Date.now() / 1000) + 60);
    assert.equal(verifyArtifactToken(resultId, token), true);
    assert.equal(verifyArtifactToken(resultId, `${token}x`), false);
    assert.equal(verifyArtifactToken('00000000-0000-0000-0000-000000000002', token), false);
  } finally {
    if (previous === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previous;
  }
});
