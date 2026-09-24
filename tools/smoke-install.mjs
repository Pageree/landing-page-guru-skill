import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = process.env.GURU_SKILLS_CLI;
if (!cli) throw new Error('Set GURU_SKILLS_CLI to an existing skills/bin/cli.mjs');
const temp = await mkdtemp(resolve(tmpdir(), 'guru-install-'));
async function findSkills(folder) {
  const found = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const path = resolve(folder, entry.name);
    if (entry.isDirectory()) found.push(...await findSkills(path));
    else if (entry.name === 'SKILL.md') found.push(dirname(path));
  }
  return found;
}
const results = [];
try {
  for (const agent of ['codex', 'claude-code', 'cursor', 'github-copilot']) {
    const target = resolve(temp, agent); await mkdir(target);
    execFileSync(process.execPath, [resolve(cli), 'add', root, '--skill', 'landing-page-guru-skill', '--agent', agent, '--copy', '--yes'], { cwd: target, env: { ...process.env, DISABLE_TELEMETRY: '1', DO_NOT_TRACK: '1' }, stdio: 'pipe', timeout: 30000 });
    const installs = await findSkills(target);
    if (!installs.length) throw new Error(`No installed skill found for ${agent}`);
    for (const install of installs) {
      for (const resource of ['SKILL.md', 'LICENSE.txt', 'references/forms-and-delivery.md', 'assets/integration-contract.schema.json', 'scripts/lib/common.mjs', 'scripts/test-form-flow.mjs', 'scripts/validate-events.mjs']) await readFile(resolve(install, resource));
      const output = execFileSync(process.execPath, [resolve(install, 'scripts/validate-events.mjs'), '--contract', resolve(root, 'examples/local-service/integration-contract.json'), '--trace', resolve(root, 'evals/fixtures/events-valid.json')], { cwd: target, encoding: 'utf8', stdio: 'pipe' });
      const report = JSON.parse(output);
      assert.equal(report.tool, 'validate-events');
      assert.equal(report.summary.fail, 0);
      assert.ok(report.summary.pass > 0);
    }
    results.push({ agent, status: 'pass', installs: installs.map(path => path.slice(target.length + 1)), checks: 'Selective copy, runtime resources, installed event helper execution' });
  }
  await mkdir(resolve(root, 'artifacts'), { recursive: true });
  await writeFile(resolve(root, 'artifacts/install-smoke.json'), JSON.stringify({ date: new Date().toISOString(), node: process.version, results, limitation: 'File installation and helper execution only; actual agent discovery/triggering and runtime parity need separate tests.' }, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { await rm(temp, { recursive: true, force: true }); }
