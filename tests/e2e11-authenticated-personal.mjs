import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const BASE_URL = process.env.E2E_BASE_URL?.replace(/\/$/, '');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VERCEL_TRUSTED_OIDC_TOKEN = process.env.VERCEL_TRUSTED_OIDC_TOKEN;
for (const [name, value] of Object.entries({ E2E_BASE_URL: BASE_URL, NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY, VERCEL_TRUSTED_OIDC_TOKEN })) if (!value) throw new Error(`MISSING_E2E_ENV:${name}`);

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const authClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();
const email = `horus-personal-e2e-${runId}-${crypto.randomUUID().slice(0, 8)}@example.invalid`;
const password = `${crypto.randomBytes(24).toString('base64url')}Aa1!`;

async function json(response) { const body = await response.text(); try { return body ? JSON.parse(body) : {}; } catch { return { raw: body }; } }
async function request(method, path, token, body, idempotencyKey) {
  const headers = { 'content-type': 'application/json', 'x-vercel-trusted-oidc-idp-token': VERCEL_TRUSTED_OIDC_TOKEN };
  if (token) headers.authorization = `Bearer ${token}`;
  if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;
  const response = await fetch(`${BASE_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return { response, body: await json(response) };
}
async function activateSubscription(userId, tier) {
  const pending = await admin.from('personal_subscriptions').select('id').eq('user_id', userId).eq('tier', tier).maybeSingle();
  if (pending.error || !pending.data) throw new Error(`E2E_SUBSCRIPTION_FIXTURE_LOOKUP_FAILED:${pending.error?.message ?? 'NOT_FOUND'}`);
  const { data, error } = await admin.from('personal_subscriptions').update({ status: 'ACTIVE', current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 30 * 86400000).toISOString() }).eq('id', pending.data.id).eq('user_id', userId).select('id,status,tier,economic_profile').single();
  if (error || !data) throw new Error(`E2E_SUBSCRIPTION_FIXTURE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data;
}

const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { e2e: true, suite: 'e2e11-authenticated-personal' } });
if (createError || !created.user) throw new Error(`E2E_USER_CREATE_FAILED:${createError?.message ?? 'UNKNOWN'}`);
const userId = created.user.id;
let secondUserId = null;
let secondSubscriptionId = null;
try {
  const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
  if (signInError || !sessionData.session?.access_token) throw new Error(`E2E_AUTH_FAILED:${signInError?.message ?? 'NO_SESSION'}`);
  const token = sessionData.session.access_token;
  const { data: verifiedUser, error: verifyError } = await authClient.auth.getUser(token);
  if (verifyError || verifiedUser.user?.id !== userId) throw new Error(`E2E_AUTH_IDENTITY_FAILED:${verifyError?.message ?? 'USER_MISMATCH'}`);

  const plans = await request('GET', '/api/personal/plans', token);
  assert.equal(plans.response.status, 200, JSON.stringify(plans.body));
  assert.deepEqual(plans.body.plans.map((plan) => plan.id), ['PERSONAL', 'PERSONAL_PRO', 'PERSONAL_PRIME']);
  const subscription = await request('POST', '/api/personal/subscriptions', token, { tier: 'PERSONAL_PRO' });
  assert.equal(subscription.response.status, 201, JSON.stringify(subscription.body));
  assert.equal(subscription.body.subscription.status, 'PENDING');
  const activatedSubscription = await activateSubscription(userId, 'PERSONAL_PRO');

  const personal = await request('GET', '/api/personal', token);
  assert.equal(personal.response.status, 200, JSON.stringify(personal.body));
  assert.deepEqual(personal.body.personas.map((persona) => persona.id), ['aline', 'bel', 'clara', 'iris', 'lucia', 'luiza']);
  const persona = await request('POST', '/api/personal', token, { persona_id: 'clara' });
  assert.equal(persona.response.status, 200, JSON.stringify(persona.body));
  assert.equal(persona.body.profile.persona_id, 'clara');

  const device = await request('POST', '/api/personal/devices', token, { device_key: crypto.randomUUID(), platform: 'WEB', app_version: 'e2e11' });
  assert.equal(device.response.status, 200, JSON.stringify(device.body));
  const deviceId = device.body.device.id;
  const voice = await request('GET', '/api/personal/voice', token);
  assert.equal(voice.response.status, 200, JSON.stringify(voice.body));
  assert.equal(voice.body.identity_lock, true);
  assert.equal(voice.body.mode, 'BROWSER_NATIVE_WITH_PROVIDER_FALLBACK');
  assert.equal(voice.body.primary.locale, 'pt-BR');
  assert.equal(voice.body.fallback.locale, 'pt-BR');

  const grant = await request('POST', '/api/personal/permissions', token, { capability_id: 'REMINDERS_CREATE', autonomy: 'EXECUTE', confirmation_required: false, scope: { device_id: deviceId } });
  assert.equal(grant.response.status, 201, JSON.stringify(grant.body));
  assert.equal(grant.body.permission.status, 'GRANTED');

  const intent = 'Explique em uma frase por que a identidade da Clara deve permanecer estável.';
  const idempotencyKey = `e2e11-${runId}-${crypto.randomUUID()}`;
  const execution = await request('POST', '/api/personal/execute', token, { intent, device_id: deviceId }, idempotencyKey);
  assert.equal(execution.response.status, 200, JSON.stringify(execution.body));
  assert.equal(execution.body.success, true);
  assert.equal(execution.body.execution.status, 'SUCCEEDED');
  assert.equal(execution.body.execution.persona_id, 'clara');
  assert.ok(execution.body.execution.provider_id && execution.body.execution.model_id);
  assert.ok(execution.body.execution.attempt_id && execution.body.execution.budget_id && execution.body.execution.execution_log_id);
  assert.ok(execution.body.execution.result?.text);
  const executionId = execution.body.execution.id;

  const replay = await request('POST', '/api/personal/execute', token, { intent, device_id: deviceId }, idempotencyKey);
  assert.equal(replay.response.status, 200, JSON.stringify(replay.body));
  assert.equal(replay.body.replay, true);
  assert.equal(replay.body.execution.id, executionId);

  const action = await request('POST', '/api/personal/execute', token, { intent: 'Crie um lembrete comprar leite', device_id: deviceId }, `e2e11-action-${runId}-${crypto.randomUUID()}`);
  assert.equal(action.response.status, 200, JSON.stringify(action.body));
  assert.equal(action.body.execution.status, 'SUCCEEDED');
  assert.ok(action.body.reminder?.id);

  const revoke = await request('DELETE', '/api/personal/permissions', token, { grant_id: grant.body.permission.id });
  assert.equal(revoke.response.status, 200, JSON.stringify(revoke.body));
  assert.equal(revoke.body.permission.status, 'REVOKED');
  const deniedAction = await request('POST', '/api/personal/execute', token, { intent: 'Crie um lembrete comprar café', device_id: deviceId }, `e2e11-denied-${runId}`);
  assert.equal(deniedAction.response.status, 403, JSON.stringify(deniedAction.body));
  assert.equal(deniedAction.body.error, 'PERSONAL_PERMISSION_REQUIRED');

  const unauthenticated = await request('POST', '/api/personal/execute', null, { intent: 'Teste sem JWT', device_id: deviceId }, `e2e11-unauth-${runId}`);
  assert.equal(unauthenticated.response.status, 401, JSON.stringify(unauthenticated.body));

  const secondEmail = `horus-personal-e2e-cross-${runId}-${crypto.randomUUID().slice(0, 8)}@example.invalid`;
  const secondPassword = `${crypto.randomBytes(24).toString('base64url')}Aa1!`;
  const { data: secondUser, error: secondError } = await admin.auth.admin.createUser({ email: secondEmail, password: secondPassword, email_confirm: true, user_metadata: { e2e: true, suite: 'e2e11-cross-user' } });
  if (secondError || !secondUser.user) throw new Error(`E2E_SECOND_USER_CREATE_FAILED:${secondError?.message ?? 'UNKNOWN'}`);
  secondUserId = secondUser.user.id;
  const { data: secondSubscription, error: secondSubscriptionError } = await admin.from('personal_subscriptions').insert({ user_id: secondUserId, tier: 'PERSONAL', status: 'ACTIVE', economic_profile: 'PERSONAL_STANDARD', current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 30 * 86400000).toISOString() }).select('id').single();
  if (secondSubscriptionError || !secondSubscription) throw new Error(`E2E_SECOND_SUBSCRIPTION_FAILED:${secondSubscriptionError?.message ?? 'UNKNOWN'}`);
  secondSubscriptionId = secondSubscription.id;
  const secondAuthClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
  const { data: secondSession, error: secondSignInError } = await secondAuthClient.auth.signInWithPassword({ email: secondEmail, password: secondPassword });
  if (secondSignInError || !secondSession.session?.access_token) throw new Error(`E2E_SECOND_AUTH_FAILED:${secondSignInError?.message ?? 'NO_SESSION'}`);
  const crossDevice = await request('POST', '/api/personal/execute', secondSession.session.access_token, { intent: 'Tente usar o dispositivo de outro usuário.', device_id: deviceId }, `e2e11-cross-${runId}`);
  assert.equal(crossDevice.response.status, 403, JSON.stringify(crossDevice.body));
  assert.equal(crossDevice.body.error, 'PERSONAL_DEVICE_NOT_ACTIVE');

  const { data: dbExecution, error: dbExecutionError } = await admin.from('personal_executions').select('*').eq('id', executionId).single();
  if (dbExecutionError || !dbExecution) throw new Error(`E2E_EXECUTION_AUDIT_FAILED:${dbExecutionError?.message ?? 'UNKNOWN'}`);
  assert.equal(dbExecution.user_id, userId);
  assert.equal(dbExecution.status, 'SUCCEEDED');
  assert.equal(dbExecution.persona_id, 'clara');
  const { data: attempt, error: attemptError } = await admin.from('execution_attempts').select('*').eq('id', dbExecution.attempt_id).single();
  if (attemptError || !attempt) throw new Error(`E2E_ATTEMPT_AUDIT_FAILED:${attemptError?.message ?? 'UNKNOWN'}`);
  assert.equal(attempt.status, 'SUCCEEDED');
  const { data: usage, error: usageError } = await admin.from('execution_usage').select('*').eq('attempt_id', attempt.id).order('recorded_at', { ascending: false }).limit(1).maybeSingle();
  if (usageError || !usage) throw new Error(`E2E_USAGE_AUDIT_FAILED:${usageError?.message ?? 'MISSING'}`);
  const { data: budget, error: budgetError } = await admin.from('execution_budgets').select('*').eq('id', dbExecution.budget_id).single();
  if (budgetError || !budget) throw new Error(`E2E_BUDGET_AUDIT_FAILED:${budgetError?.message ?? 'UNKNOWN'}`);
  assert.equal(budget.status, 'SETTLED');
  const { data: log, error: logError } = await admin.from('horus_execution_logs').select('*').eq('id', dbExecution.execution_log_id).single();
  if (logError || !log) throw new Error(`E2E_LOG_AUDIT_FAILED:${logError?.message ?? 'UNKNOWN'}`);
  assert.equal(log.status, 'COMPLETED');
  assert.ok(log.completed_at);

  console.log(JSON.stringify({ suite: 'e2e11-authenticated-personal', authenticated: true, user_id: userId, persona_id: 'clara', subscription_status: activatedSubscription.status, device_id: deviceId, execution_id: executionId, attempt_id: attempt.id, usage_present: true, budget_id: budget.id, budget_status: budget.status, execution_log_id: log.id, execution_status: dbExecution.status, provider_id: dbExecution.provider_id, model_id: dbExecution.model_id, actual_cost_brl: usage.actual_total_cost_brl ?? usage.actual_provider_cost_brl ?? null, idempotency_replay: true, permission_grant: true, permission_revocation: true, action_execution: true, unauthenticated_denied: true, cross_user_denied: true, cleanup: 'evidence preserved; test identities isolated and banned after run' }));
} finally {
  await admin.from('personal_capability_grants').delete().eq('user_id', userId);
  await admin.from('personal_devices').delete().eq('user_id', userId);
  await admin.from('personal_profiles').delete().eq('user_id', userId);
  await admin.from('personal_subscriptions').delete().eq('user_id', userId);
  if (secondSubscriptionId) await admin.from('personal_subscriptions').delete().eq('id', secondSubscriptionId).eq('user_id', secondUserId);
  await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
  if (secondUserId) await admin.auth.admin.updateUserById(secondUserId, { ban_duration: '876000h' });
}
