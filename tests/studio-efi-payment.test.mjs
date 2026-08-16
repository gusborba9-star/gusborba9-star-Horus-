import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('one-time Efí payment extends the existing PaymentService only', () => {
  const source = read('lib/payment.ts');
  assert.match(source, /class PaymentService/);
  assert.match(source, /createSubscriptionLink/);
  assert.match(source, /createOneTimePaymentLink/);
  assert.match(source, /\/v1\/charge\/one-step\/link/);
  assert.match(source, /charge_id/);
  assert.match(source, /payment_url/);
  assert.match(source, /status !== 'link'/);
});

test('commercial price is materialized from the existing economic policy', () => {
  const migration = read('supabase/migrations/20260816160000_studio_efi_one_time_payment.sql');
  assert.match(migration, /materialize_studio_commercial_price/);
  assert.match(migration, /target_gross_margin_rate/);
  assert.match(migration, /minimum_gross_margin_rate/);
  assert.match(migration, /provider_fee_rate/);
  assert.match(migration, /infrastructure_rate/);
  assert.match(migration, /safety_buffer_rate/);
  assert.doesNotMatch(migration, /49\.90|79\.90|99\.90/);
});

test('checkout freezes the materialized price and persists charge identity', () => {
  const route = read('app/api/studio/projects/[projectId]/payment/checkout/route.ts');
  assert.match(route, /materialize_studio_commercial_price/);
  assert.match(route, /final_price_brl/);
  assert.match(route, /pricing_snapshot/);
  assert.match(route, /charge_id/);
  assert.match(route, /payment_url/);
  assert.match(route, /studio:\$\{projectId\}:\$\{revision\.id\}/);
  assert.match(route, /status === 'AWAITING_PAYMENT'/);
  assert.doesNotMatch(route, /TEST_BUDGET_BRL/);
});

test('checkout-existing is read-only and cannot create a financial resource', () => {
  const route = read('app/api/studio/projects/[projectId]/payment/checkout-existing/route.ts');
  assert.match(route, /export async function GET/);
  assert.match(route, /getCharge/);
  assert.doesNotMatch(route, /createOneTimePaymentLink/);
  assert.doesNotMatch(route, /createSubscriptionLink/);
});

test('webhook uses deterministic financial identity and is idempotent', () => {
  const source = read('app/api/studio/billing/webhook/route.ts');
  assert.match(source, /identifiers\?\.charge_id/);
  assert.match(source, /custom_id/);
  assert.match(source, /horus_webhook_events/);
  assert.match(source, /duplicate/);
  assert.match(source, /status = 'PAID'/);
  assert.doesNotMatch(source, /studio.*execute/i);
});

test('payment identity is unique per project and revision', () => {
  const migration = read('supabase/migrations/20260816160000_studio_efi_one_time_payment.sql');
  assert.match(migration, /unique index if not exists studio_project_payments_project_revision_key/);
  assert.match(migration, /\(project_id, revision_id\)/);
});
