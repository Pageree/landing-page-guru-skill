import test from 'node:test';
import assert from 'node:assert/strict';
import { startPreview } from '../tools/serve.mjs';

test('preview serves examples, rejects invalid input, and deduplicates simulated requests', async () => {
  const preview = await startPreview();
  try {
    const page = await fetch(`${preview.url}/local-service/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Morrow/);
    const post = (value, identity, extra = {}) => fetch(`${preview.url}/demo/submit`, { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': identity, ...extra }, body: JSON.stringify(value) });
    assert.equal((await post({ email: 'invalid' }, 'bad-request')).status, 422);
    const accepted = await post({ email: 'visitor@example.test' }, 'request-1');
    assert.deepEqual(await accepted.json(), { accepted: true, demo: true });
    assert.equal((await post({ email: 'visitor@example.test' }, 'request-1')).status, 409);
    assert.equal((await post({ email: 'visitor@example.test' }, 'request-2', { origin: 'https://outside.example' })).status, 403);
    assert.equal((await fetch(`${preview.url}/%2e%2e%2fpackage.json`)).status, 403);
    assert.equal((await fetch(`${preview.url}/lead-magnet/launch-checklist.md`)).status, 200);
  } finally { await preview.close(); }
});
