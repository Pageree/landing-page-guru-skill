import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
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
