import test from 'node:test';
import assert from 'node:assert/strict';
import { readJSON, finishReport } from '../skills/landing-page-guru-skill/scripts/lib/common.mjs';
import { validateEvents } from '../skills/landing-page-guru-skill/scripts/validate-events.mjs';

const contract = await readJSON(new URL('../examples/local-service/integration-contract.json', import.meta.url));
const good = await readJSON(new URL('../evals/fixtures/events-valid.json', import.meta.url));
const check = (trace, c = contract) => finishReport(validateEvents(c, trace));
const status = (report, id) => report.checks.find(check => check.id === id)?.status;

test('complete trace distinguishes acceptance from rejection, timeout, duplicates and page loads', () => {
  const report = check(good);
  assert.equal(report.summary.fail, 0);
  assert.equal(report.summary['not-tested'], 0);
});
test('finds failure counted as lead, personal property, and duplicate conversion without leaking the value', async () => {
  const trace = await readJSON(new URL('../evals/fixtures/events-invalid.json', import.meta.url));
  const report = check(trace);
  for (const id of ['permission-and-outcome', 'property-allowlist', 'deduplication', 'expected-event-counts']) assert.equal(status(report, id), 'fail');
  assert.ok(!JSON.stringify(report).includes('fiction@example.test'));
});
test('missing event and direct success-page event fail independently', () => {
  const missing = structuredClone(good); missing.events = [];
  assert.equal(status(check(missing), 'expected-event-counts'), 'fail');
  const direct = structuredClone(good); direct.events[0].actionId = 'a6';
  assert.equal(status(check(direct), 'permission-and-outcome'), 'fail');
});
test('requires permission at the action and catches withdrawal', () => {
  const c = structuredClone(contract);
  c.privacy.analyticsRequiresPermission = true;
  c.privacy.permissionStates = ['denied', 'granted', 'withdrawn'];
  const trace = structuredClone(good);
  trace.actions.forEach(action => { action.permission = 'granted'; });
  trace.events[0].permission = 'granted';
  trace.actions[0].permission = 'denied';
  trace.actions[5].permission = 'withdrawn';
  assert.equal(check(trace, c).summary.fail, 0);
  trace.actions[3].permission = 'withdrawn';
  trace.events[0].permission = 'withdrawn';
  assert.equal(status(check(trace, c), 'permission-and-outcome'), 'fail');
});
test('one acceptance repeated on retry cannot emit a second conversion', () => {
  const trace = structuredClone(good);
  trace.actions[4].outcome = 'accepted';
  assert.equal(check(trace).summary.fail, 0);
  trace.events.push({ ...trace.events[0], actionId: 'a5', eventId: 'new-event' });
  assert.equal(status(check(trace), 'deduplication'), 'fail');
});
test('malformed actions, wrong page, empty traces, and missing coverage cannot become a complete pass', () => {
  const wrong = structuredClone(good); wrong.pageId = 'another';
  assert.equal(check(wrong).summary.fail, 1);
  const malformed = structuredClone(good); malformed.actions[1].id = 'a1';
  assert.equal(status(check(malformed), 'trace-actions'), 'fail');
  const empty = structuredClone(good); empty.actions = []; empty.events = [];
  assert.equal(check(empty).summary['not-tested'], 1);
  const partial = structuredClone(good); partial.actions = partial.actions.filter(a => a.outcome !== 'timeout');
  assert.equal(status(check(partial), 'acceptance-coverage'), 'not-tested');
});
