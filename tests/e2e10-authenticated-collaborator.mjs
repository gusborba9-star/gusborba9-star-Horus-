import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const BASE_URL = process.env.E2E_BASE_URL?.replace(/\/$/, '');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
for (const [name, value] of Object.entries({ E2E_BASE_URL: BASE_URL, NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY })) {
  if (!value) throw new Error(`MISSING_E2E_ENV:${name}`);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const authClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();
const email = `horus-e2e-${runId}-${crypto.randomUUID().slice(0, 8)}@example.invalid`;
const password = `${crypto.randomBytes(24).toString('base64url')}Aa1!`;

async function json(response) {
  const body = await response.text();
  try { return body ? JSON.parse(body) : {}; } catch { return { raw: body }; }
}
async function post(path, token, body, idempotencyKey) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;
  const response = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return { response, body: await json(response) };
}

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { e2e: true, suite: 'e2e10-authenticated-collaborator' },
});
if (createError || !created.user) throw new Error(`E2E_USER_CREATE_FAILED:${createError?.message ?? 'UNKNOWN'}`);
const userId = created.user.id;

const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
if (signInError || !sessionData.session?.access_token) throw new Error(`E2E_AUTH_FAILED:${signInError?.message ?? 'NO_SESSION'}`);
const token = sessionData.session.access_token;
const { data: verifiedUser, error: verifyError } = await authClient.auth.getUser(token);
if (verifyError || verifiedUser.user?.id !== userId) throw new Error(`E2E_AUTH_IDENTITY_FAILED:${verifyError?.message ?? 'USER_MISMATCH'}`);

const slug = `e2e-collaborator-${runId}-${crypto.randomUUID().slice(0, 8)}`;
const collaboratorResult = await post('/api/collaborators', token, {
  name: 'E2E Digital Collaborator', slug, role: 'E2E Collaborator',
  description: 'Dedicated authenticated E2E fixture.', specialization: 'TEXT_GENERATION',
  instructions: 'Return a concise factual answer. Do not claim actions you did not perform.',
  objectives: ['Prove authenticated collaborator execution'], capabilities: ['TEXT_GENERATION'],
  autonomy_level: 'EXECUTE', memory_scope: { working: true, user: true, organizational: false },
  knowledge_sources: [], tool_policy: { allowed: [] }, connector_policy: { allowed: [] },
  execution_policy: { max_steps: 1 }, fallback_policy: { enabled: false }, organization_id: null,
});
assert.equal(collaboratorResult.response.status, 201, JSON.stringify(collaboratorResult.body));
const collaborator = collaboratorResult.body.collaborator;
assert.ok(collaborator?.id);

const intent = 'Produza uma frase curta confirmando a execução autenticada do colaborador E2E.';
const idempotencyKey = `e2e10-${runId}-${crypto.randomUUID()}`;
const executionResult = await post('/api/collaborators/execute', token, { intent, organization_id: null }, idempotencyKey);
assert.equal(executionResult.response.status, 200, JSON.stringify(executionResult.body));
assert.equal(executionResult.body.success, true);
assert.ok(executionResult.body.execution?.id);
const executionId = executionResult.body.execution.id;

const { data: execution, error: executionError } = await admin.from('horus_collaborator_executions').select('*').eq('id', executionId).single();
if (executionError) throw new Error(`E2E_EXECUTION_QUERY_FAILED:${executionError.message}`);
assert.equal(execution.owner_user_id, userId);
assert.equal(execution.collaborator_id, collaborator.id);
assert.equal(execution.status, 'SUCCEEDED');
assert.ok(execution.provider_id && execution.model_id && execution.completed_at);

const { data: version, error: versionError } = await admin.from('horus_collaborator_versions').select('*').eq('collaborator_id', collaborator.id).order('version', { ascending: false }).limit(1).single();
if (versionError) throw new Error(`E2E_VERSION_QUERY_FAILED:${versionError.message}`);
assert.equal(version.created_by, userId);

const { data: attempt, error: attemptError } = await admin.from('execution_attempts').select('*').eq('id', execution.attempt_id).single();
if (attemptError) throw new Error(`E2E_ATTEMPT_QUERY_FAILED:${attemptError.message}`);
assert.equal(attempt.status, 'SUCCEEDED');

const { data: usage, error: usageError } = await admin.from('execution_usage').select('*').eq('attempt_id', attempt.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
if (usageError) throw new Error(`E2E_USAGE_QUERY_FAILED:${usageError.message}`);
assert.ok(usage);
assert.ok(Number(usage.actual_cost_brl ?? usage.cost_brl ?? 0) >= 0);

const { data: budget, error: budgetError } = await admin.from('execution_budgets').select('*').eq('id', execution.budget_id).single();
if (budgetError) throw new Error(`E2E_BUDGET_QUERY_FAILED:${budgetError.message}`);
assert.equal(budget.status, 'SETTLED');

const { data: log, error: logError } = await admin.from('horus_execution_logs').select('*').eq('id', execution.execution_log_id).single();
if (logError) throw new Error(`E2E_LOG_QUERY_FAILED:${logError.message}`);
assert.equal(log.status, 'COMPLETED');
assert.ok(log.completed_at);

const replay = await post('/api/collaborators/execute', token, { intent, organization_id: null }, idempotencyKey);
assert.equal(replay.response.status, 200, JSON.stringify(replay.body));
assert.equal(replay.body.replay, true);
assert.equal(replay.body.execution?.id, executionId);

const unauthenticated = await post('/api/collaborators/execute', null, { intent, organization_id: null }, `e2e10-unauth-${runId}`);
assert.equal(unauthenticated.response.status, 401, JSON.stringify(unauthenticated.body));
assert.equal(unauthenticated.body.error, 'AUTHENTICATION_REQUIRED');

const forgedOrg = '00000000-0000-0000-0000-000000000000';
const unauthorizedOrg = await post('/api/collaborators/execute', token, { intent, organization_id: forgedOrg }, `e2e10-org-${runId}`);
assert.equal(unauthorizedOrg.response.status, 400, JSON.stringify(unauthorizedOrg.body));
assert.equal(unauthorizedOrg.body.error, 'ORGANIZATION_ACCESS_DENIED');

console.log(JSON.stringify({
  suite: 'e2e10-authenticated-collaborator', authenticated: true, user_id: userId,
  collaborator_id: collaborator.id, collaborator_version: version.version, execution_id: executionId,
  attempt_id: attempt.id, usage_present: true, budget_id: budget.id, budget_status: budget.status,
  execution_status: execution.status, attempt_status: attempt.status, log_status: log.status,
  provider_id: execution.provider_id, model_id: execution.model_id,
  provider_request_id: execution.provider_request_id ?? null,
  actual_cost_brl: execution.result?.usage?.actual_cost_brl ?? null,
  idempotency_replay: true, unauthenticated_denied: true, forged_organization_denied: true,
  cleanup: 'evidence_preserved; temporary password and JWT were process-local only',
}));
