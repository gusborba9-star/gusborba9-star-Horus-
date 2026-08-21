import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('result API never exposes inline image payloads', () => {
  const source = read('app/api/studio/results/[resultId]/route.ts');
  assert.match(source, /isDataUrl/);
  assert.match(source, /metadata\.source_artifact_url/);
  assert.match(source, /artifact_url:/);
  assert.match(source, /provider_metadata: _providerMetadata/);
});

test('artifact route supports legacy data URLs without returning the payload as a URL', () => {
  const source = read('app/api/studio/results/[resultId]/artifact/route.ts');
  assert.match(source, /decodeDataUrl/);
  assert.match(source, /result\.artifact_url\.startsWith\('data:'\)/);
  assert.match(source, /Content-Type/);
  assert.match(source, /Content-Disposition/);
});
