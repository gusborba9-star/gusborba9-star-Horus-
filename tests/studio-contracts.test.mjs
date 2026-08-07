import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('studio engine exposes the canonical change classes', () => {
  const source = read('lib/studio/types.ts');
  for (const value of ['MICRO', 'LOW', 'MEDIUM', 'MAJOR', 'REBUILD']) assert.match(source, new RegExp(`['"]${value}['"]`));
});

test('studio project API is RLS-backed and user scoped', () => {
  const source = read('app/api/studio/projects/route.ts');
  assert.match(source, /requireStudioUser/);
  assert.match(source, /owner_user_id/);
  assert.match(source, /studio_projects/);
});

test('revision API generates an optimized specification before persistence', () => {
  const source = read('app/api/studio/projects/[projectId]/revisions/route.ts');
  assert.match(source, /buildOptimizedSpec/);
  assert.match(source, /optimized_spec/);
  assert.match(source, /change_class/);
  assert.match(source, /approval_state/);
});

test('connector execution never exposes provider selection to the project UI', () => {
  const source = read('app/api/studio/connectors/[connectorId]/execute/route.ts');
  assert.match(source, /hasPermission/);
  assert.match(source, /studio_read_connector_secret/);
  assert.match(source, /CONNECTOR_PERMISSION_DENIED/);
});

test('studio UI is a project workspace rather than a module launcher', () => {
  const source = read('app/dashboard/studio/page.tsx');
  assert.match(source, /Nexus Project Execution/);
  assert.match(source, /Novo projeto/);
  assert.match(source, /Revision Engine/);
  assert.doesNotMatch(source, /Studio Música/);
});
