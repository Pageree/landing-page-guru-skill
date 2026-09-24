import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const script = name => `skills/landing-page-guru-skill/scripts/${name}.mjs`;

test('helpers expose help and fail closed on invalid input', () => {
  for (const name of ['validate-events', 'test-form-flow']) {
    const help = spawnSync(process.execPath, [script(name), '--help'], { cwd: root, encoding: 'utf8' });
    assert.equal(help.status, 0);
    assert.match(help.stdout, /Usage:/);
    const bad = spawnSync(process.execPath, [script(name), '--surprise'], { cwd: root, encoding: 'utf8' });
    assert.equal(bad.status, 3);
  }
});
test('event CLI returns failure for the known bad fixture', () => {
  const run = spawnSync(process.execPath, [script('validate-events'), '--contract', 'examples/local-service/integration-contract.json', '--trace', 'evals/fixtures/events-invalid.json'], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.ok(JSON.parse(run.stdout).summary.fail > 0);
});

test('installed helpers execute when launched through a symlinked directory', () => {
  const folder = mkdtempSync(resolve(tmpdir(), 'guru-cli-alias-'));
  try {
    const installed = resolve(folder, 'installed');
    symlinkSync(resolve(root, 'skills/landing-page-guru-skill'), installed, 'dir');
    for (const name of ['validate-events', 'test-form-flow']) {
      const help = spawnSync(process.execPath, [resolve(installed, `scripts/${name}.mjs`), '--help'], { cwd: folder, encoding: 'utf8' });
      assert.equal(help.status, 0);
      assert.match(help.stdout, /Usage:/);
    }
    const run = spawnSync(process.execPath, [resolve(installed, 'scripts/validate-events.mjs'), '--contract', resolve(root, 'examples/local-service/integration-contract.json'), '--trace', resolve(root, 'evals/fixtures/events-valid.json')], { cwd: folder, encoding: 'utf8' });
    assert.equal(run.status, 0);
    assert.equal(JSON.parse(run.stdout).summary.fail, 0);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});
