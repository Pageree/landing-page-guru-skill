import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { readJSON } from '../skills/landing-page-guru-skill/scripts/lib/common.mjs';
import { testFormFlow } from '../skills/landing-page-guru-skill/scripts/test-form-flow.mjs';

const contract = await readJSON(new URL('../examples/b2b-demo/integration-contract.json', import.meta.url));
const url = 'http://127.0.0.1:4173/b2b-demo/';

function fakeBrowser(context) {
  const counts = { opened: 0, closed: 0 };
  return {
    counts,
    version: () => 'fake',
    close: async () => {},
    newContext: async () => { counts.opened++; return { ...context, close: async () => { counts.closed++; } }; }
  };
}

test('refuses to run on a Playwright that cannot block WebSockets', async () => {
  const browser = fakeBrowser({});
  const report = await testFormFlow(contract, { url, browser });
  const check = report.checks.find(check => check.id === 'browser-available');
  assert.equal(check.status, 'not-tested');
  assert.equal(report.checks.length, 1, 'No scenario ran');
  assert.deepEqual(browser.counts, { opened: 1, closed: 1 });
});

test('a context that fails during setup is reported and still closed', async () => {
  const browser = fakeBrowser({ routeWebSocket: async () => {}, route: async () => { throw new Error('setup failed'); } });
  const report = await testFormFlow(contract, { url, browser });
  assert.equal(report.checks.filter(check => check.status === 'fail').length, 6);
  assert.deepEqual(browser.counts, { opened: 6, closed: 6 });
});

test('a launched browser is closed when setup throws before the first scenario', async () => {
  const folder = mkdtempSync(resolve(tmpdir(), 'guru-form-flow-'));
  try {
    const module = resolve(folder, 'browser.mjs');
    writeFileSync(module, 'export const chromium = { launch: async () => globalThis.fakeLaunchedBrowser };');
    let closed = 0;
    globalThis.fakeLaunchedBrowser = { version() { throw new Error('no version'); }, close: async () => { closed++; } };
    await assert.rejects(testFormFlow(contract, { url, browserModule: module }), /no version/);
    assert.equal(closed, 1);
  } finally {
    delete globalThis.fakeLaunchedBrowser;
    rmSync(folder, { recursive: true, force: true });
  }
});
