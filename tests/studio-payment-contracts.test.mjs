import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('studio pricing is dynamic and policy/model driven', () => {
  const source = read('lib/studio/pricing.ts');
  assert.match(source, /inputPricePerMillion/);
  assert.match(source, /outputPricePerMillion/);
  assert.match(source, /targetGrossMarginRate/);
  assert.doesNotMatch(source, /49\.90|79\.90|99\.90/);
});

test('Nexus remains provider/model invisible and routes by cost/capability', () => {
  const source = read('lib/nexus/core.ts');
  const router = read('lib/nexus/model-router.ts');
  assert.match(source, /resolveAdaptiveModel/);
  assert.match(source, /optimizePrompt/);
  assert.match(router, /costScore/);
  assert.match(router, /capability/);
  assert.match(router, /TEXT_GENERATION/);
});

test('Studio payment uses the canonical Efí one-step payment-link endpoint', () => {
  const source = read('lib/payment.ts');
  assert.match(source, /createOneTimePaymentLink/);
  assert.match(source, /\/v1\/charge\/one-step\/link/);
  assert.match(source, /charge_id/);
  assert.match(source, /payment_url/);
  assert.match(source, /status !== 'link'/);
});

test('Studio payment persists deterministic project identity and is idempotent', () => {
  const route = read('app/api/studio/projects/[projectId]/payment/checkout/route.ts');
  const migration = read('supabase/migrations/20260816090000_studio_project_payments.sql');
  assert.match(route, /studio_project:\$\{projectId\}/);
  assert.match(route, /studio_project_payments/);
  assert.match(route, /status === 'AWAITING_PAYMENT'/);
  assert.match(route, /payment_url/);
  assert.match(route, /charge_id/);
  assert.match(migration, /unique index.*project_unique/s);
});

test('Studio webhook associates by charge identity/custom id and is idempotent', () => {
  const source = read('app/api/studio/billing/webhook/route.ts');
  assert.match(source, /identifiers\?\.charge_id/);
  assert.match(source, /custom_id/);
  assert.match(source, /horus_webhook_events/);
  assert.match(source, /duplicate/);
  assert.match(source, /status = 'PAID'/);
});

test('Billable Studio execution is database-gated on confirmed payment', () => {
  const source = read('supabase/migrations/20260816090000_studio_project_payments.sql');
  assert.match(source, /enforce_studio_payment_before_billable_execution/);
  assert.match(source, /NEW\.environment in \('STAGING', 'PRODUCTION'\)/);
  assert.match(source, /p\.status = 'PAID'/);
  assert.match(source, /STUDIO_PAYMENT_REQUIRED/);
});
