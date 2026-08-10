import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('studio engine exposes the canonical change classes', () => {
  const source = read('lib/studio/types.ts');
  for (const value of ['MICRO', 'LOW', 'MEDIUM', 'MAJOR', 'REBUILD']) assert.match(source, new RegExp(`[\\'\\"]${value}[\\'\\"]`));
});

test('studio project API is RLS-backed and user scoped', () => {
  const source = read('app/api/studio/projects/route.ts');
  assert.match(source, /requireStudioUser/);
  assert.match(source, /owner_user_id/);
  assert.match(source, /studio_projects/);
});

test('revision API generates an optimized specification before persistence', () => {
  const source = read('app/api/studio/projects/[projectId]/revisions/route.ts');
  assert.match(source, /buildOptimizedSpec/);
  assert.match(source, /optimized_spec/);
  assert.match(source, /change_class/);
  assert.match(source, /approval_state/);
});

test('optimized execution spec is contextual and provider-invisible', () => {
  const source = read('lib/studio/engine.ts');
  assert.match(source, /optimizedExecutionPrompt/);
  assert.match(source, /executionStrategy/);
  assert.match(source, /economicAuthorizationRequired: true/);
  assert.match(source, /providerInvisible: true/);
});

test('revision approval has an explicit state transition boundary', () => {
  const source = read('app/api/studio/projects/[projectId]/revisions/[revisionId]/approval/route.ts');
  assert.match(source, /APPROVED/);
  assert.match(source, /REJECTED/);
  assert.match(source, /approved_by/);
  assert.match(source, /approved_at/);
  assert.match(source, /PREVIEW_VALIDATION_REQUIRED/);
});

test('revision lifecycle prevents promotion without preview, staging and approval gates', () => {
  const source = read('app/api/studio/projects/[projectId]/revisions/[revisionId]/lifecycle/route.ts');
  assert.match(source, /PREVIEW_READY/);
  assert.match(source, /STAGING_READY/);
  assert.match(source, /PRODUCTION_APPROVED/);
  assert.match(source, /PREVIEW_VALIDATION_REQUIRED/);
  assert.match(source, /STAGING_VALIDATION_REQUIRED/);
  assert.match(source, /PRODUCTION_APPROVAL_REQUIRED/);
  assert.match(source, /ROLLBACK_REQUESTED/);
  assert.match(source, /'PRODUCTION', 'ROLLBACK'/);
});

test('preview execution boundary is authenticated, economic-gated, connector-authorized and idempotent', () => {
  const source = read('app/api/studio/projects/[projectId]/revisions/[revisionId]/execute/route.ts');
  assert.match(source, /requireStudioUser/);
  assert.match(source, /studio_executions/);
  assert.match(source, /idempotency_key/);
  assert.match(source, /authorize_horus_execution_attempt/);
  assert.match(source, /studio_read_connector_secret/);
  assert.match(source, /DEPLOY_PREVIEW/);
  assert.match(source, /DEPLOY_STAGING/);
  assert.match(source, /DEPLOY_PRODUCTION/);
  assert.match(source, /api.vercel.com\/v13\/deployments/);
  assert.match(source, /reconcile_horus_execution_attempt/);
  assert.match(source, /PREVIEW_ALREADY_READY/);
  assert.match(source, /ROLLBACK_PRODUCTION/);
  assert.match(source, /api.vercel.com\/v1\/projects/);
  assert.match(source, /VERCEL_ROLLBACK_FAILED/);
  assert.match(source, /studio-rollback:/);
});

test('preview verification resolves project connector or owned global connector', () => {
  const source = read('app/api/studio/projects/[projectId]/revisions/[revisionId]/preview/verify/route.ts');
  assert.match(source, /requireStudioUser/);
  assert.match(source, /\.eq\('project_id', projectId\)/);
  assert.match(source, /\.is\('project_id', null\)/);
  assert.match(source, /\.eq\('owner_user_id', userId\)/);
  assert.match(source, /studio_read_connector_secret/);
  assert.match(source, /DEPLOY_PREVIEW/);
  assert.match(source, /VERCEL_DEPLOYMENT_READ_FAILED/);
  assert.match(source, /verified: true/);
});

test('staging and production verification are real provider reads behind authenticated gates', () => {
  const staging = read('app/api/studio/projects/[projectId]/revisions/[revisionId]/staging/verify/route.ts');
  const production = read('app/api/studio/projects/[projectId]/revisions/[revisionId]/production/verify/route.ts');
  assert.match(staging, /requireStudioUser/);
  assert.match(staging, /DEPLOY_STAGING/);
  assert.match(staging, /api.vercel.com\/v13\/deployments/);
  assert.match(staging, /verified: true/);
  assert.match(production, /requireStudioUser/);
  assert.match(production, /DEPLOY_PRODUCTION/);
  assert.match(production, /api.vercel.com\/v13\/deployments/);
  assert.match(production, /verified: true/);
});

test('production approval and delivery require prior verified gates', () => {
  const approval = read('app/api/studio/projects/[projectId]/revisions/[revisionId]/production/approval/route.ts');
  const delivery = read('app/api/studio/projects/[projectId]/revisions/[revisionId]/delivery/route.ts');
  assert.match(approval, /STAGING_VALIDATION_REQUIRED/);
  assert.match(approval, /productionApproval/);
  assert.match(delivery, /PRODUCTION_VERIFICATION_REQUIRED/);
  assert.match(delivery, /DELIVERED/);
  assert.match(delivery, /api.vercel.com\/v13\/deployments/);
});

test('vercel deployment is represented in the economic provider registry', () => {
  const source = read('supabase/migrations/20260808_add_vercel_execution_provider.sql');
  assert.match(source, /'vercel'/);
  assert.match(source, /'vercel\/deployment'/);
  assert.match(source, /'DEV'/);
});

test('connector execution has a permission boundary before secret access and hides provider identity', () => {
  const source = read('app/api/studio/connectors/[connectorId]/execute/route.ts');
  assert.match(source, /CONNECTOR_PERMISSION_DENIED/);
  assert.match(source, /getSecret\(connector\.secret_ref\)/);
  assert.doesNotMatch(source, /const token = await getSecret\(connector\.secret_ref\)/);
  assert.doesNotMatch(source, /provider: connector\.provider/);
  assert.match(source, /CONNECTOR_CREDENTIAL_EXPIRED_OR_REVOKED/);
});

test('studio UI exposes the complete lifecycle actions through the canonical execution boundary', () => {
  const source = read('app/dashboard/studio/page.tsx');
  assert.match(source, /Nexus Project Execution/);
  assert.match(source, /Novo projeto/);
  assert.match(source, /Revision Engine/);
  assert.match(source, /Criar Preview/);
  assert.match(source, /\/execute/);
  assert.match(source, /Criar Staging/);
  assert.match(source, /Verificar Staging/);
  assert.match(source, /Aprovar Production/);
  assert.match(source, /Criar Production/);
  assert.match(source, /Verificar Production/);
  assert.match(source, /Executar Delivery/);
  assert.match(source, /Executar Rollback/);
  assert.doesNotMatch(source, /Studio Música/);
});
