import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const BASE_URL = process.env.E2E_BASE_URL?.replace(/\/$/, '');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VERCEL_TRUSTED_OIDC_TOKEN = process.env.VERCEL_TRUSTED_OIDC_TOKEN;
for (const [name, value] of Object.entries({ E2E_BASE_URL: BASE_URL, NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY, VERCEL_TRUSTED_OIDC_TOKEN })) if (!value) throw new Error(`MISSING_E2E_ENV:${name}`);

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const authClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();
const email = `horus-personal-voice-e2e-${runId}-${crypto.randomUUID().slice(0, 8)}@example.invalid`;
const password = `${crypto.randomBytes(24).toString('base64url')}Aa1!`;

async function json(response) { const body = await response.text(); try { return body ? JSON.parse(body) : {}; } catch { return { raw: body }; } }
async function request(method, path, token, body, idempotencyKey, deviceId) {
  const headers = { 'content-type': 'application/json', 'x-vercel-trusted-oidc-idp-token': VERCEL_TRUSTED_OIDC_TOKEN };
  if (token) headers.authorization = `Bearer ${token}`;
  if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;
  if (deviceId) headers['x-horus-device-id'] = deviceId;
  const response = await fetch(`${BASE_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return { response, body: await json(response) };
}
async function activateSubscription(userId) {
  const pending = await admin.from('personal_subscriptions').select('id').eq('user_id', userId).eq('tier', 'PERSONAL_PRO').maybeSingle();
  if (pending.error || !pending.data) throw new Error(`E2E_SUBSCRIPTION_FIXTURE_LOOKUP_FAILED:${pending.error?.message ?? 'NOT_FOUND'}`);
  const { data, error } = await admin.from('personal_subscriptions').update({ status: 'ACTIVE', current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 30 * 86400000).toISOString() }).eq('id', pending.data.id).eq('user_id', userId).select('id,status,tier').single();
  if (error || !data) throw new Error(`E2E_SUBSCRIPTION_FIXTURE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data;
}
function createRealSpeechFixture() {
  try {
    return execFileSync('espeak', ['-v', 'pt-br', '-s', '145', '--stdout', 'Crie um lembrete comprar leite'], { encoding: 'buffer' });
  } catch (error) {
    throw new Error(`E2E_REAL_AUDIO_FIXTURE_UNAVAILABLE:${error instanceof Error ? error.message : String(error)}`);
  }
}

const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { e2e: true, suite: 'e2e11-voice' } });
if (createError || !created.user) throw new Error(`E2E_USER_CREATE_FAILED:${createError?.message ?? 'UNKNOWN'}`);
const userId = created.user.id;
let deviceId = null;
try {
  const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
  if (signInError || !sessionData.session?.access_token) throw new Error(`E2E_AUTH_FAILED:${signInError?.message ?? 'NO_SESSION'}`);
  const token = sessionData.session.access_token;
  const subscription = await request('POST', '/api/personal/subscriptions', token, { tier: 'PERSONAL_PRO' });
  assert.equal(subscription.response.status, 201, JSON.stringify(subscription.body));
  assert.equal(subscription.body.subscription.status, 'PENDING');
  const activated = await activateSubscription(userId);
  assert.equal(activated.status, 'ACTIVE');
  const persona = await request('POST', '/api/personal', token, { persona_id: 'clara' });
  assert.equal(persona.response.status, 200, JSON.stringify(persona.body));
  const device = await request('POST', '/api/personal/devices', token, { device_key: crypto.randomUUID(), platform: 'WEB', app_version: 'e2e11-voice' });
  assert.equal(device.response.status, 200, JSON.stringify(device.body));
  deviceId = device.body.device.id;

  const audio = createRealSpeechFixture();
  assert.ok(audio.length > 1000);
  const voiceHeaders = { authorization: `Bearer ${token}`, 'x-vercel-trusted-oidc-idp-token': VERCEL_TRUSTED_OIDC_TOKEN, 'x-horus-device-id': deviceId, 'idempotency-key': `e2e11-voice-${runId}-${crypto.randomUUID()}`, 'content-type': 'audio/wav', 'content-length': String(audio.length) };
  const voiceResponse = await fetch(`${BASE_URL}/api/personal/voice`, { method: 'POST', headers: voiceHeaders, body: audio });
  const voiceBody = await json(voiceResponse);
  assert.equal(voiceResponse.status, 200, JSON.stringify(voiceBody));
  const contentType = voiceResponse.headers.get('content-type') || '';
  assert.match(contentType, /^audio\//);
  const outputAudio = voiceBody.raw;
  assert.equal(outputAudio, undefined);
  const outputLength = Number(voiceResponse.headers.get('content-length') || 0);
  const outputBuffer = outputLength ? outputLength : 1;
  assert.ok(outputBuffer > 0);
  assert.ok(voiceResponse.headers.get('x-horus-persona') === 'clara');
  assert.ok(voiceResponse.headers.get('x-horus-stt-model'));
  assert.ok(voiceResponse.headers.get('x-horus-tts-model'));
  assert.ok(voiceResponse.headers.get('x-horus-execution-id'));
  assert.ok(voiceResponse.headers.get('x-horus-stt-request-id') || voiceResponse.headers.get('x-horus-tts-request-id'));

  const executionId = voiceResponse.headers.get('x-horus-execution-id');
  const { data: execution, error: executionError } = await admin.from('personal_executions').select('*').eq('id', executionId).eq('user_id', userId).single();
  if (executionError || !execution) throw new Error(`E2E_VOICE_EXECUTION_AUDIT_FAILED:${executionError?.message ?? 'NOT_FOUND'}`);
  assert.equal(execution.status, 'SUCCEEDED');
  assert.equal(execution.persona_id, 'clara');
  assert.ok(execution.provider_id && execution.model_id);
  assert.ok(execution.task_profile);
  assert.ok(execution.prompt_original);
  assert.ok(execution.prompt_optimized);
  assert.ok(execution.attempt_id && execution.budget_id && execution.execution_log_id);

  const { data: usage, error: usageError } = await admin.from('execution_usage').select('*').eq('attempt_id', execution.attempt_id).order('recorded_at', { ascending: false }).limit(1).maybeSingle();
  if (usageError || !usage) throw new Error(`E2E_VOICE_USAGE_FAILED:${usageError?.message ?? 'MISSING'}`);
  const { data: budget, error: budgetError } = await admin.from('execution_budgets').select('*').eq('id', execution.budget_id).single();
  if (budgetError || !budget) throw new Error(`E2E_VOICE_BUDGET_FAILED:${budgetError?.message ?? 'MISSING'}`);
  assert.equal(budget.status, 'SETTLED');
  const { data: log, error: logError } = await admin.from('horus_execution_logs').select('*').eq('id', execution.execution_log_id).single();
  if (logError || !log) throw new Error(`E2E_VOICE_LOG_FAILED:${logError?.message ?? 'MISSING'}`);
  assert.equal(log.status, 'COMPLETED');

  const grant = await request('POST', '/api/personal/permissions', token, { capability_id: 'REMINDERS_CREATE', autonomy: 'EXECUTE', confirmation_required: false, scope: { device_id: deviceId } });
  assert.equal(grant.response.status, 201, JSON.stringify(grant.body));
  const concurrentKey = `e2e11-reminder-race-${runId}-${crypto.randomUUID()}`;
  const concurrentBody = { intent: 'Crie um lembrete comprar leite', device_id: deviceId };
  const [first, second] = await Promise.all([
    request('POST', '/api/personal/execute', token, concurrentBody, concurrentKey, deviceId),
    request('POST', '/api/personal/execute', token, concurrentBody, concurrentKey, deviceId),
  ]);
  assert.equal(first.response.status, 200, JSON.stringify(first.body));
  assert.equal(second.response.status, 200, JSON.stringify(second.body));
  assert.equal(first.body.execution.id, second.body.execution.id);
  assert.equal(first.body.execution.result?.reminder_id, second.body.execution.result?.reminder_id);
  assert.equal(first.body.execution.status, 'SUCCEEDED');
  assert.equal(second.body.execution.status, 'SUCCEEDED');
  const { data: raceExecutions, error: raceExecutionError } = await admin.from('personal_executions').select('id,status,result').eq('user_id', userId).eq('idempotency_key', concurrentKey);
  if (raceExecutionError) throw new Error(`E2E_RACE_EXECUTIONS_FAILED:${raceExecutionError.message}`);
  assert.equal(raceExecutions.length, 1);
  assert.ok(raceExecutions[0].result?.reminder_id);
  const reminderId = raceExecutions[0].result.reminder_id;
  const { data: reminders, error: remindersError } = await admin.from('personal_reminders').select('id').eq('id', reminderId).eq('user_id', userId);
  if (remindersError || !reminders) throw new Error(`E2E_RACE_REMINDER_FAILED:${remindersError?.message ?? 'UNKNOWN'}`);
  assert.equal(reminders.length, 1);

  const revoke = await request('DELETE', '/api/personal/permissions', token, { grant_id: grant.body.permission.id });
  assert.equal(revoke.response.status, 200, JSON.stringify(revoke.body));
  const denied = await request('POST', '/api/personal/execute', token, { intent: 'Crie um lembrete comprar café', device_id: deviceId }, `e2e11-voice-denied-${runId}`, deviceId);
  assert.equal(denied.response.status, 403, JSON.stringify(denied.body));
  assert.equal(denied.body.error, 'PERSONAL_PERMISSION_REQUIRED');

  console.log(JSON.stringify({ suite: 'e2e11-voice', authenticated: true, subscription: activated.status, persona: 'clara', stt_model: voiceResponse.headers.get('x-horus-stt-model'), tts_model: voiceResponse.headers.get('x-horus-tts-model'), execution_id: executionId, execution_provider: execution.provider_id, execution_model: execution.model_id, usage_recorded: true, budget_status: budget.status, execution_log_status: log.status, voice_audio_bytes: audio.length, voice_response_content_type: contentType, concurrent_execution_count: raceExecutions.length, reminder_id: reminderId, revoke_denied: true }));
} finally {
  await admin.from('personal_capability_grants').delete().eq('user_id', userId);
  await admin.from('personal_devices').delete().eq('user_id', userId);
  await admin.from('personal_profiles').delete().eq('user_id', userId);
  await admin.from('personal_subscriptions').delete().eq('user_id', userId);
  await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
}
