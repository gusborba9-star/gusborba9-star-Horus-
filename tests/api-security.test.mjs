import test from 'node:test';
import assert from 'node:assert/strict';
import { middleware } from '../middleware.ts';
import { GET as webhookGet, POST as webhookPost } from '../app/api/webhook-pix/route.ts';

function unauthenticatedApiRequest() {
  return {
    nextUrl: { pathname: '/api/horus' },
    cookies: { get: () => undefined },
  };
}

test('API middleware returns JSON 401 instead of redirect when session is absent', async () => {
  const response = await middleware(unauthenticatedApiRequest());
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { success: false, error: 'AUTHENTICATION_REQUIRED' });
});

test('Webhook rejects GET because the endpoint is mutation ingress only', async () => {
  const response = await webhookGet();
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
});

test('Webhook fails closed when its provider credential is absent', async () => {
  const previous = process.env.TOKEN_WEBHOOK_EFI;
  delete process.env.TOKEN_WEBHOOK_EFI;
  try {
    const request = new Request('https://horus.example/api/webhook-pix', { method: 'POST' });
    const response = await webhookPost(request);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { success: false, error: 'WEBHOOK_AUTH_NOT_CONFIGURED' });
  } finally {
    if (previous === undefined) delete process.env.TOKEN_WEBHOOK_EFI;
    else process.env.TOKEN_WEBHOOK_EFI = previous;
  }
});
