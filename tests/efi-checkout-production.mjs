import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const BASE_URL = process.env.E2E_BASE_URL?.replace(/\/$/, '');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OIDC = process.env.VERCEL_TRUSTED_OIDC_TOKEN;
for (const [name, value] of Object.entries({ E2E_BASE_URL: BASE_URL, NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY, VERCEL_TRUSTED_OIDC_TOKEN: OIDC })) if (!value) throw new Error(`MISSING_EFI_E2E_ENV:${name}`);

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const authClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();
const email = `horus-efi-checkout-${runId}-${crypto.randomUUID().slice(0, 8)}@example.invalid`;
const password = `${crypto.randomBytes(24).toString('base64url')}Aa1!`;
const correlationId = `efi-e2e-${runId}-${crypto.randomUUID()}`;

async function json(response) {
  const body = await response.text();
  try { return body ? JSON.parse(body) : {}; } catch { return { raw: body }; }
}

const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { e2e: true, suite: 'efi-checkout-production' } });
if (createError || !created.user) throw new Error(`EFI_E2E_USER_CREATE_FAILED:${createError?.message ?? 'UNKNOWN'}`);
const userId = created.user.id;
let subscriptionId = null;

try {
  const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
  if (signInError || !sessionData.session?.access_token) throw new Error(`EFI_E2E_AUTH_FAILED:${signInError?.message ?? 'NO_SESSION'}`);
  const token = sessionData.session.access_token;

  const subscription = await fetch(`${BASE_URL}/api/personal/subscriptions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'x-vercel-trusted-oidc-idp-token': OIDC,
      'x-correlation-id': correlationId,
    },
    body: JSON.stringify({ tier: 'PERSONAL_PRO' }),
  });
  const subscriptionBody = await json(subscription);
  assert.equal(subscription.status, 201, JSON.stringify(subscriptionBody));
  subscriptionId = subscriptionBody.subscription?.id;
  assert.ok(subscriptionId);
  assert.equal(subscriptionBody.subscription?.status, 'PENDING');

  const checkout = await fetch(`${BASE_URL}/api/personal/billing/checkout`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'x-vercel-trusted-oidc-idp-token': OIDC,
      'x-correlation-id': correlationId,
    },
    body: JSON.stringify({ tier: 'PERSONAL_PRO' }),
  });
  const checkoutBody = await json(checkout);

  console.log(JSON.stringify({
    suite: 'efi-checkout-production',
    correlation_id: checkoutBody.correlation_id ?? correlationId,
    http_status: checkout.status,
    provider: checkoutBody.provider ?? null,
    provider_status: checkoutBody.status ?? null,
    provider_code: checkoutBody.code ?? null,
    provider_error: checkoutBody.error_code ?? null,
    provider_error_description: checkoutBody.error_description ?? null,
    provider_message: checkoutBody.message ?? null,
    provider_request_id: checkoutBody.request_id ?? null,
    checkout_created: Boolean(checkoutBody.success && checkoutBody.checkout?.payment_url),
    payment_url: checkoutBody.success ? checkoutBody.checkout?.payment_url : null,
    charge_id: checkoutBody.success ? checkoutBody.checkout?.charge_id : null,
    subscription_id: checkoutBody.success ? checkoutBody.subscription?.external_subscription_id : null,
  }));

  if (checkout.status !== 200) throw new Error(`EFI_CHECKOUT_PRODUCTION_FAILED:${JSON.stringify(checkoutBody)}`);
  assert.equal(checkoutBody.success, true, JSON.stringify(checkoutBody));
  assert.ok(checkoutBody.checkout?.payment_url, JSON.stringify(checkoutBody));
  assert.ok(checkoutBody.checkout?.charge_id, JSON.stringify(checkoutBody));
  assert.ok(checkoutBody.subscription?.external_subscription_id, JSON.stringify(checkoutBody));
  assert.notEqual(checkoutBody.subscription?.status, 'ACTIVE');
} finally {
  // Preserve the local subscription row when Efí created an external subscription,
  // because it is the authoritative reconciliation anchor. Never fabricate ACTIVE.
  if (!subscriptionId) {
    await admin.from('personal_subscriptions').delete().eq('user_id', userId);
  }
  await admin.from('personal_profiles').delete().eq('user_id', userId);
  await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
}
