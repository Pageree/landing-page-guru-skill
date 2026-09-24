import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runs = resolve(root, 'evals/runs/development-1/eval-3-broken-success-event');
function harness(source, { result = { accepted: true, id: 'opaque-1' }, statusCode = 200, networkFailure = false, invalidJSON = false, sinkThrows = false, deferred = false } = {}) {
  const emitted = [], navigations = [], storage = new Map(), listeners = new Map();
  const button = { type: 'submit', disabled: false };
  const form = { querySelectorAll: () => [button], setAttribute() {}, removeAttribute() {}, reportValidity: () => true, addEventListener: (name, handler) => listeners.set(name, handler), removeEventListener() {} };
  const status = { textContent: '', setAttribute() {}, focus() {} };
  let permission = false, requests = 0, release;
  const pending = new Promise(resolve => { release = resolve; });
  const context = vm.createContext({
    FormData: class {}, AbortController, setTimeout, clearTimeout,
    sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    window: { location: { assign: url => navigations.push(url) } },
    fetch: async () => {
      requests++;
      if (deferred) await pending;
      if (networkFailure) throw new Error('Synthetic transport failure');
      return { status: statusCode, ok: statusCode >= 200 && statusCode < 300, json: async () => { if (invalidJSON) throw new Error('Invalid JSON'); return result; } };
    }
  });
  vm.runInContext(source, context);
  const track = (name, properties) => { if (sinkThrows) throw new Error('Synthetic sink error'); emitted.push({ name, properties: JSON.parse(JSON.stringify(properties)) }); };
  let controller;
  if (context.createLeadCapture) controller = context.createLeadCapture({ form, status, createAnalytics: () => ({ send: track, stop() {} }), timeoutMs: 100 });
  else context.installLeadForm(form, { hasAnalyticsConsent: () => permission, track, showMessage: message => { status.textContent = message; }, timeoutMs: 100 });
  return {
    emitted, navigations, button, status,
    setConsent(value) { permission = value; controller?.setAnalyticsConsent(value); },
    submit: () => listeners.get('submit')({ preventDefault() {} }),
    release, requests: () => requests
  };
}

const cases = [
  ['application rejection emits nothing and permits correction', async source => {
    const h = harness(source, { result: { accepted: false } }); h.setConsent(true); await h.submit();
    assert.equal(h.emitted.length, 0); assert.equal(h.navigations.length, 0); assert.equal(h.button.disabled, false);
  }],
  ['confirmed acceptance without consent has no analytics or later replay', async source => {
    const h = harness(source); await h.submit(); h.setConsent(true);
    assert.equal(h.emitted.length, 0); assert.deepEqual(h.navigations, ['/thanks']);
  }],
  ['permitted acceptance is opaque and duplicate clicks do not resubmit', async source => {
    const h = harness(source); h.setConsent(true); await h.submit(); await h.submit();
    assert.equal(h.requests(), 1); assert.equal(h.emitted.length, 1);
    assert.equal(h.emitted[0].name, 'lead_accepted');
    assert.equal(h.emitted[0].properties.event_id, 'lead_accepted:opaque-1');
    assert.ok(Object.keys(h.emitted[0].properties).every(key => ['event_id', 'lead_id'].includes(key)));
  }],
  ['withdrawal during a pending request suppresses its event', async source => {
    const h = harness(source, { deferred: true }); h.setConsent(true); const pending = h.submit();
    h.setConsent(false); h.release(); await pending;
    assert.equal(h.emitted.length, 0); assert.deepEqual(h.navigations, ['/thanks']);
  }],
  ['unknown transport outcome does not emit, redirect, or blindly retry', async source => {
    const h = harness(source, { networkFailure: true }); h.setConsent(true); await h.submit(); await h.submit();
    assert.equal(h.requests(), 1); assert.equal(h.emitted.length, 0); assert.equal(h.navigations.length, 0);
  }],
  ['malformed JSON is not an acceptance', async source => {
    const h = harness(source, { invalidJSON: true }); h.setConsent(true); await h.submit();
    assert.equal(h.emitted.length, 0); assert.equal(h.navigations.length, 0);
  }],
  ['HTTP failure with accepted body does not count', async source => {
    const h = harness(source, { statusCode: 500 }); h.setConsent(true); await h.submit();
    assert.equal(h.emitted.length, 0); assert.equal(h.navigations.length, 0);
  }],
  ['analytics failure cannot turn an accepted lead into a retry', async source => {
    const h = harness(source, { sinkThrows: true }); h.setConsent(true); await h.submit(); await h.submit();
    assert.equal(h.requests(), 1); assert.deepEqual(h.navigations, ['/thanks']);
  }],
  ['initialization and opt-in alone create no lead', async source => {
    const h = harness(source); h.setConsent(true);
    assert.equal(h.requests(), 0); assert.equal(h.emitted.length, 0);
  }]
];
for (const condition of ['with_skill', 'without_skill']) {
  const source = await readFile(resolve(runs, condition, 'outputs/fix.js'), 'utf8');
  const checks = [];
  for (const [name, run] of cases) { await run(source); checks.push({ name, status: 'pass' }); }
  await writeFile(resolve(runs, condition, 'reviewer-checks.json'), JSON.stringify({ evidenceSource: 'Reviewer Node VM with fake DOM, fetch, storage and analytics', limitations: ['Not browser or backend verification', 'Collector deduplication and SDK cleanup remain integration requirements'], checks }, null, 2));
  console.log(`${condition}: ${checks.length} shared semantic cases passed.`);
}
