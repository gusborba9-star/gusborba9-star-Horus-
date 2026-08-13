import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, '');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const oidc = process.env.VERCEL_TRUSTED_OIDC_TOKEN;
for (const [name, value] of Object.entries({ baseUrl, supabaseUrl, anonKey, serviceKey, oidc })) if (!value) throw new Error(`MISSING_E2E_ENV:${name}`);
const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const auth = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();
const email = `horus-personal-memory-${runId}-${crypto.randomUUID().slice(0, 8)}@example.invalid`;
const password = `${crypto.randomBytes(24).toString('base64url')}Aa1!`;
const headers = (token, key) => ({ 'content-type': 'application/json', 'x-vercel-trusted-oidc-idp-token': oidc, authorization: `Bearer ${token}`, ...(key ? { 'idempotency-key': key } : {}) });
async function call(path, token, body, key) { const response = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: headers(token, key), body: JSON.stringify(body) }); const text = await response.text(); const data = text ? JSON.parse(text) : {}; return { response, data }; }
const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { e2e: true, suite: 'e2e11-memory-context' } });
if (createError || !created.user) throw new Error(`E2E_MEMORY_USER_CREATE_FAILED:${createError?.message ?? 'UNKNOWN'}`);
const userId = created.user.id; let memoryId = null;
try {
  const { data: session, error: signInError } = await auth.auth.signInWithPassword({ email, password });
  if (signInError || !session.session?.access_token) throw new Error(`E2E_MEMORY_AUTH_FAILED:${signInError?.message ?? 'NO_SESSION'}`);
  const token = session.session.access_token;
  const plan = await call('/api/personal/subscriptions', token, { tier: 'PERSONAL_PRO' }); assert.equal(plan.response.status, 201, JSON.stringify(plan.data));
  const { data: subscription, error: subscriptionError } = await admin.from('personal_subscriptions').select('id').eq('user_id', userId).eq('tier', 'PERSONAL_PRO').maybeSingle(); if (subscriptionError || !subscription) throw new Error(`E2E_MEMORY_SUBSCRIPTION_FAILED:${subscriptionError?.message ?? 'NOT_FOUND'}`);
  const { error: activateError } = await admin.from('personal_subscriptions').update({ status: 'ACTIVE', current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 30 * 86400000).toISOString() }).eq('id', subscription.id); if (activateError) throw new Error(`E2E_MEMORY_ACTIVATE_FAILED:${activateError.message}`);
  const personal = await call('/api/personal', token, { persona_id: 'clara' }); assert.equal(personal.response.status, 200, JSON.stringify(personal.data));
  const deviceResponse = await call('/api/personal/devices', token, { device_key: crypto.randomUUID(), platform: 'WEB', app_version: 'e2e11-memory' }); assert.equal(deviceResponse.response.status, 200, JSON.stringify(deviceResponse.data));
  const deviceId = deviceResponse.data.device.id;
  const content = `E2E11 memory context ${runId}: user prefers concise Portuguese responses.`; const contentHash = crypto.createHash('sha256').update(content).digest('hex');
  const { data: memory, error: memoryError } = await admin.from('memory_graph_nodes').insert({ node_type: 'core_knowledge', content, importance: 0.95, metadata: { source: 'e2e11-memory-context', run_id: runId }, owner_scope: 'USER', user_id: userId, lifecycle_state: 'ACTIVE', content_hash: contentHash }).select('id').single(); if (memoryError || !memory) throw new Error(`E2E_MEMORY_INSERT_FAILED:${memoryError?.message ?? 'UNKNOWN'}`); memoryId = memory.id;
  const key = `e2e11-memory-${runId}-${crypto.randomUUID()}`; const execution = await call('/api/personal/execute', token, { intent: 'Responda considerando minhas preferências de contexto.', device_id: deviceId }, key); assert.equal(execution.response.status, 200, JSON.stringify(execution.data)); assert.equal(execution.data.execution.status, 'SUCCEEDED');
  assert.ok(execution.data.execution.memory_context?.some((item) => item.content === content));
  assert.ok(execution.data.execution.task_profile); assert.ok(execution.data.execution.prompt_optimized.includes('HORUS TASK INSTRUCTION'));
  const { data: persisted, error: persistedError } = await admin.from('personal_executions').select('id,memory_context,task_profile,prompt_optimized,policy_decision').eq('id', execution.data.execution.id).single(); if (persistedError || !persisted) throw new Error(`E2E_MEMORY_PERSISTENCE_FAILED:${persistedError?.message ?? 'UNKNOWN'}`);
  assert.ok(persisted.memory_context?.some((item) => item.content === content)); assert.equal(persisted.policy_decision?.prompt_optimization, true);
  console.log(JSON.stringify({ suite: 'e2e11-memory-context', authenticated: true, execution_id: persisted.id, memory_context: true, prompt_optimization: true, task_profile: true, cleanup: true }));
} finally {
  if (memoryId) await admin.from('memory_graph_nodes').delete().eq('id', memoryId).eq('user_id', userId);
  await admin.from('personal_capability_grants').delete().eq('user_id', userId); await admin.from('personal_devices').delete().eq('user_id', userId); await admin.from('personal_profiles').delete().eq('user_id', userId); await admin.from('personal_subscriptions').delete().eq('user_id', userId); await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
}
