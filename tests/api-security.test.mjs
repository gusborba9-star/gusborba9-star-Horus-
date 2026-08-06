import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('API middleware enforces JSON authentication failures for API paths', async () => {
  const content = await source('middleware.ts');
  assert.match(content, /function isApiPath\(pathname: string\)/);
  assert.match(content, /AUTHENTICATION_REQUIRED/);
  assert.match(content, /status: 401/);
  assert.match(content, /return authenticationFailure\(request\)/);
});

test('Hórus execution route enforces permission and sanitizes public errors', async () => {
  const content = await source('app/api/horus/route.ts');
  assert.match(content, /requirePermission\('ai\.execute'\)/);
  assert.match(content, /function publicCoreError\(error\?: string\)/);
  assert.match(content, /CORE_EXECUTION_FAILED/);
  assert.doesNotMatch(content, /error: error instanceof Error \? error\.message/);
});

test('Human review route scopes review lookup to authenticated owner', async () => {
  const content = await source('app/api/horus/review/route.ts');
  assert.match(content, /requirePermission\('ai\.execute'\)/);
  assert.match(content, /metadata->>owner_scope/);
  assert.match(content, /reviewed_by_user_id/);
});

test('Payment webhook fails closed and has replay/idempotency protection', async () => {
  const content = await source('app/api/webhook-pix/route.ts');
  assert.match(content, /timingSafeEqual/);
  assert.match(content, /x-webhook-event-id/);
  assert.match(content, /horus_webhook_events/);
  assert.match(content, /WEBHOOK_EVENT_ID_REUSE/);
  assert.match(content, /METHOD_NOT_ALLOWED/);
  assert.doesNotMatch(content, /searchParams\.get\('token'\)/);
});
