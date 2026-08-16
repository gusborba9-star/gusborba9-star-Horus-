import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const existingRoute = fs.readFileSync(new URL('../app/api/personal/billing/checkout-existing/route.ts', import.meta.url), 'utf8');
const checkoutRoute = fs.readFileSync(new URL('../app/api/personal/billing/checkout/route.ts', import.meta.url), 'utf8');
const adapter = fs.readFileSync(new URL('../lib/payment.ts', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../db/migrations/20260816_add_efi_checkout_identity.sql', import.meta.url), 'utf8');

test('creation persists subscription, charge and original payment URL', () => {
  assert.match(adapter, /subscriptionId: String\(data\.subscription_id\)/);
  assert.match(adapter, /chargeId: String\(data\.charge\?\.id/);
  assert.match(adapter, /paymentUrl: data\.payment_url/);
  assert.match(checkoutRoute, /external_subscription_id: checkout\.subscriptionId/);
  assert.match(checkoutRoute, /external_charge_id: checkout\.chargeId/);
  assert.match(checkoutRoute, /payment_url: checkout\.paymentUrl/);
});

test('existing checkout uses persisted creation identity as primary source', () => {
  assert.match(existingRoute, /external_subscription_id,external_charge_id,payment_url/);
  assert.match(existingRoute, /const persisted: PersistedCheckout/);
  assert.match(existingRoute, /linkedHistory = history\.find/);
  assert.match(existingRoute, /payment_url: persisted\.payment_url/);
  assert.doesNotMatch(existingRoute, /charge\.subscription_id/);
  assert.doesNotMatch(existingRoute, /safe\.subscription_id/);
});

test('incompatible subscription and charge identities are rejected', () => {
  assert.match(existingRoute, /EFI_EXISTING_SUBSCRIPTION_ID_MISMATCH/);
  assert.match(existingRoute, /EFI_EXISTING_CHARGE_ID_MISMATCH/);
  assert.match(existingRoute, /EFI_EXISTING_CHARGE_NOT_ASSOCIATED/);
  assert.match(existingRoute, /EFI_EXISTING_CHARGE_STATUS_INVALID/);
});

test('checkout-existing contains no financial mutation', () => {
  assert.doesNotMatch(existingRoute, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(existingRoute, /createSubscription|createSubscriptionLink|generatePix|generateBoleto/);
});

test('missing payment URL never generates an artificial URL', () => {
  assert.match(existingRoute, /EFI_EXISTING_CHECKOUT_NOT_PERSISTED/);
  assert.match(existingRoute, /PAYMENT_URL_MISSING/);
  assert.doesNotMatch(existingRoute, /pagamento\.gerencianet|pagamento\.efi/);
});

test('migration persists Efí charge identity and original checkout URL', () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS external_charge_id TEXT/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS payment_url TEXT/);
});
