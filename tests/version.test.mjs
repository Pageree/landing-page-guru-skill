import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { reportFor } from '../skills/landing-page-guru-skill/scripts/lib/common.mjs';

const skill = await readFile(new URL('../skills/landing-page-guru-skill/SKILL.md', import.meta.url), 'utf8');
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('helper reports carry the version in SKILL.md and package.json', () => {
  const version = skill.match(/^\s+version:\s*"([^"]+)"/m)?.[1];
  assert.ok(version, 'SKILL.md metadata has a version');
  assert.equal(pkg.version, version);
  assert.equal(reportFor({ pageId: 'p', environment: 'test' }, 'validate-events', 'fixture').toolVersion, version);
});
