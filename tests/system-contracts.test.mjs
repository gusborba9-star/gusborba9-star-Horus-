import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('system vertical slice preserves API -> Core -> Memory -> Economic -> Provider order', async () => {
  const api = await source('app/api/horus/route.ts');
  const core = await source('lib/core/horusGraph.ts');

  assert.match(api, /requirePermission\('ai\.execute'\)/);
  assert.match(api, /runHorusCore\(/);
  assert.match(api, /persistHorusExecutionLog\(/);

  const order = [
    'retrieve_memory',
    'assess_confidence',
    'route_decision',
    'economic_authorization',
    'provider_execution',
  ];
  let previous = -1;
  for (const node of order) {
    const index = core.indexOf(`'${node}'`);
    assert.ok(index > previous, `${node} must remain after the previous canonical stage`);
    previous = index;
  }
});

test('economic authorization remains a hard gate before provider execution', async () => {
  const core = await source('lib/core/horusGraph.ts');
  assert.match(core, /addEdge\('route_decision', 'economic_authorization'\)/);
  assert.match(core, /addEdge\('economic_authorization', 'provider_execution'\)/);
  assert.match(core, /if \(!state\.economicAuthorized \|\| state\.cacheHit/);
});

test('Core preserves Memory retrieval without granting Memory economic authority', async () => {
  const core = await source('lib/core/horusGraph.ts');
  assert.match(core, /MemoryGraph\.searchSimilarContext/);
  assert.match(core, /authorizeHorusExecution/);
  assert.match(core, /requirePermission\('ai\.execute'\)/);
});

test('Core preserves execution logging at the API boundary', async () => {
  const api = await source('app/api/horus/route.ts');
  assert.match(api, /persistHorusExecutionLog\(/);
  assert.match(api, /persistHorusExecutionError\(/);
  assert.match(api, /execution_log_id/);
});

test('canonical route does not import or call provider SDKs directly', async () => {
  const api = await source('app/api/horus/route.ts');
  assert.doesNotMatch(api, /GoogleGenAI/);
  assert.doesNotMatch(api, /openrouter\.ai\/api\/v1/);
  assert.doesNotMatch(api, /fetch\([^)]*openrouter/i);
});

test('legacy provider and billing routes remain inert tombstones', async () => {
  const routes = await Promise.all([
    source('app/api/chat/route.ts'),
    source('app/api/horus-router/route.ts'),
    source('app/api/charge/route.ts'),
  ]);
  assert.match(routes[0], /status: 410/);
  assert.match(routes[1], /status: 410/);
  assert.match(routes[2], /status: 410/);
  for (const content of routes) {
    assert.doesNotMatch(content, /GoogleGenAI/);
    assert.doesNotMatch(content, /openrouter\.ai\/api\/v1/);
  }
});

test('webhook contract fails closed before persistence and enforces event idempotency', async () => {
  const webhook = await source('app/api/webhook-pix/route.ts');
  const authIndex = webhook.indexOf('constantTimeTokenMatch');
  const eventIndex = webhook.indexOf("x-webhook-event-id");
  const lookupIndex = webhook.indexOf("from('horus_webhook_events')");
  assert.ok(authIndex >= 0);
  assert.ok(eventIndex > authIndex);
  assert.ok(lookupIndex > eventIndex);
  assert.match(webhook, /WEBHOOK_EVENT_ID_REUSE/);
  assert.match(webhook, /23505/);
});

test('public API errors do not leak raw provider/core exception messages', async () => {
  const api = await source('app/api/horus/route.ts');
  assert.match(api, /INTERNAL_SERVER_ERROR/);
  assert.doesNotMatch(api, /error: error instanceof Error \? error\.message/);
});

test('human review remains authenticated and owner-scoped', async () => {
  const review = await source('app/api/horus/review/route.ts');
  assert.match(review, /requirePermission\('ai\.execute'\)/);
  assert.match(review, /metadata->>owner_scope/);
  assert.match(review, /reviewed_by_user_id/);
});

test('security boundary keeps privileged execution data on server-side paths', async () => {
  const executionLog = await source('lib/core/executionLog.ts');
  const supabase = await source('lib/supabase.ts');
  assert.match(executionLog, /getServiceSupabase/);
  assert.match(supabase, /service_role/i);
});

test('package test/build contract runs the full test suite before production build', async () => {
  const packageJson = JSON.parse(await source('package.json'));
  assert.match(packageJson.scripts.test, /tests\/\*\*\/\*\.test\.mjs/);
  assert.match(packageJson.scripts.build, /npm test/);
  assert.match(packageJson.scripts.build, /next build/);
});

test('canonical route exposes explicit response fields for economic and execution evidence', async () => {
  const api = await source('app/api/horus/route.ts');
  for (const field of ['economic_authorized', 'execution_attempt_id', 'pricing_snapshot_id', 'actual_cost_brl', 'usage', 'execution_log_id']) {
    assert.match(api, new RegExp(field));
  }
});
