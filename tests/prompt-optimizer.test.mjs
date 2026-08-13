import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTaskProfile, optimizePrompt } from '../lib/nexus/prompt-optimizer.ts';

test('prompt optimizer builds a provider-neutral task profile', () => {
  const profile = buildTaskProfile('pesquise preços atuais e compare as melhores opções');
  assert.equal(profile.freshnessRequired, true);
  assert.equal(profile.complexity, 'MEDIUM');
  assert.equal(profile.reasoningDepth, 'MEDIUM');
});

test('prompt optimizer preserves the user request and authorized context', () => {
  const result = optimizePrompt('quero organizar minha semana', ['reunião segunda 09:00']);
  assert.match(result.optimized, /quero organizar minha semana/);
  assert.match(result.optimized, /reunião segunda 09:00/);
  assert.equal(result.profile.contextRequirement, 'SMALL');
});

test('prompt optimizer rejects empty requests', () => {
  assert.throws(() => optimizePrompt('   '), /PROMPT_EMPTY/);
});
