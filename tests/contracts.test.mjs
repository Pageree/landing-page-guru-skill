import test from 'node:test';
import assert from 'node:assert/strict';
import { readJSON, validateContract } from '../skills/landing-page-guru-skill/scripts/lib/common.mjs';

const schema = await readJSON(new URL('../skills/landing-page-guru-skill/assets/integration-contract.schema.json', import.meta.url));
const template = await readJSON(new URL('../skills/landing-page-guru-skill/assets/integration-contract-template.json', import.meta.url));
const local = await readJSON(new URL('../examples/local-service/integration-contract.json', import.meta.url));

test('template and four example contracts satisfy structural and semantic constraints', async () => {
  assert.deepEqual(validateContract(template, schema), []);
  for (const page of ['waitlist', 'local-service', 'b2b-demo', 'lead-magnet']) {
    assert.deepEqual(validateContract(await readJSON(new URL(`../examples/${page}/integration-contract.json`, import.meta.url)), schema), [], page);
  }
});

test('connected forms cannot omit their endpoint or required synthetic adapter values', () => {
  const c = structuredClone(local);
  c.form.destination.endpoint = null;
  delete c.verification.browser.values.email;
  assert.equal(validateContract(c, schema).length, 2);
});

test('rejects secrets as extra configuration, credential URLs, and unsafe acceptance semantics', () => {
  const c = structuredClone(local);
  c.form.destination.apiKey = 'not-a-real-secret';
  assert.match(validateContract(c, schema).join(), /unexpected property/);
  delete c.form.destination.apiKey;
  c.form.destination.endpoint = 'https://user:password@example.test/lead';
  c.events[0].deduplication = 'action';
  c.events[0].properties.push('email');
  assert.equal(validateContract(c, schema).length, 3);
});

test('enforces retry identity, unique names, redirect target and version', () => {
  for (const mutate of [
    c => { c.form.responses.idempotencyHeader = null; },
    c => { c.form.fields.push(c.form.fields[0]); },
    c => { c.events.push(c.events[0]); },
    c => { c.form.success.mode = 'redirect'; },
    c => { c.schemaVersion = '999'; }
  ]) {
    const c = structuredClone(local); mutate(c);
    assert.ok(validateContract(c, schema).length);
  }
});
