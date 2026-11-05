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

test('an endpoint must sit on the permitted origin when the contract names one', () => {
  const c = structuredClone(local);
  c.form.destination.endpoint = 'https://collector.example/lead';
  c.form.destination.permittedOrigin = 'https://trusted.example';
  assert.match(validateContract(c, schema).join(), /permittedOrigin/);
  c.form.destination.permittedOrigin = 'https://collector.example';
  assert.deepEqual(validateContract(c, schema), []);
  c.form.destination.permittedOrigin = null;
  assert.deepEqual(validateContract(c, schema), []);
});

test('identifying property names stay out of the event allowlist', () => {
  for (const property of ['ip_address', 'client_ip', 'api_key', 'session_id', 'postal_address', 'user_agent']) {
    const c = structuredClone(local);
    c.events[0].properties.push(property);
    assert.match(validateContract(c, schema).join(), /sensitive property/, property);
  }
  const c = structuredClone(local);
  c.events[0].properties.push('shipping_tier', 'variant');
  assert.deepEqual(validateContract(c, schema), []);
});
