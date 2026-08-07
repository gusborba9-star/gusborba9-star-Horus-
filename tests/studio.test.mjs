import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPlan, classifyComplexity, selectCapabilities, selectIntegrations } from '../lib/studio/capabilities.ts';
import { allowedConnectorPermissions, isProductionPermission, resolveConnectorPermission } from '../lib/studio/connectors.ts';

test('Studio capability selection composes a multimodal project from intent', () => {
  const capabilities = selectCapabilities('crie um SaaS com site, dashboard, API, logo, vídeo e automações');
  assert.deepEqual(capabilities, ['CODE', 'DEV', 'WEBSITES', 'APIS', 'DASHBOARDS', 'IMAGE', 'VIDEO', 'AUTOMATIONS']);
});

test('Studio plan creates a dynamic dependency graph', () => {
  const plan = buildPlan('crie um SaaS com site, API e dashboard', 'PREVIEW');
  assert.equal(plan.environment, 'PREVIEW');
  assert.equal(plan.approval_required, true);
  assert.equal(plan.complexity, 'MAJOR_REBUILD');
  assert.equal(plan.execution_graph.length, plan.capabilities.length);
  assert.deepEqual(plan.execution_graph[0].depends_on, []);
  assert.deepEqual(plan.execution_graph[1].depends_on, ['capability-1']);
});

test('Production requires approval and major plans are escalated', () => {
  const plan = buildPlan('reconstruir a arquitetura enterprise do ecossistema', 'PRODUCTION');
  assert.equal(plan.complexity, 'MAJOR_REBUILD');
  assert.equal(plan.approval_required, true);
});

test('Complexity remains bounded and deterministic', () => {
  assert.equal(classifyComplexity('faça um documento', ['DOCS']), 'SIMPLE');
  assert.equal(classifyComplexity('faça site e dashboard', ['WEBSITES', 'DASHBOARDS']), 'LOCALIZED');
  assert.equal(classifyComplexity('crie um SaaS com integração', ['CODE', 'APIS', 'DEV']), 'ARCHITECTURAL');
});

test('Integration selection stays capability-driven', () => {
  assert.deepEqual(selectIntegrations(['CODE', 'WEBSITES']), ['github', 'vercel', 'supabase']);
  assert.deepEqual(selectIntegrations(['MUSIC', 'VIDEO']), []);
});

test('Connector permissions are granular and production-scoped', () => {
  const github = allowedConnectorPermissions('github');
  assert.ok(github.includes('READ_FILES'));
  assert.ok(github.includes('CREATE_PULL_REQUEST'));
  assert.equal(resolveConnectorPermission('github', 'CREATE_PULL_REQUEST'), true);
  assert.equal(resolveConnectorPermission('github', 'DEPLOY_PRODUCTION'), false);
  assert.equal(isProductionPermission('DEPLOY_PRODUCTION'), true);
  assert.equal(isProductionPermission('READ_FILES'), false);
});
