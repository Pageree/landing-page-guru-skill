// Reviewer checks run after isolated executor generation; they do not change executor claims.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startPreview } from './serve.mjs';
import { loadBrowser } from '../skills/landing-page-guru-skill/scripts/lib/common.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runs = resolve(root, 'evals/runs/development-1');
const { chromium } = await loadBrowser(process.env.GURU_PLAYWRIGHT_MODULE);
const browser = await chromium.launch({ headless: true, executablePath: process.env.GURU_CHROMIUM_EXECUTABLE });
const results = [];
try {
  for (const condition of ['with_skill', 'without_skill']) {
    for (const [id, name] of [[1, 'unconnected-waitlist'], [2, 'local-service-form']]) {
      const run = resolve(runs, `eval-${id}-${name}`, condition);
      const preview = await startPreview({ root: resolve(run, 'outputs') });
      const checks = [];
      try {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
        await page.goto(preview.url);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.screenshot({ path: resolve(run, 'reviewer-mobile.png'), fullPage: true });
        checks.push('No horizontal overflow at 390px; reviewer screenshot captured');
        if (id === 1) {
          assert.equal(await page.locator('button').first().isDisabled(), true);
          checks.push('Waitlist submit disabled');
        }
        await page.close();
        if (id === 2) {
          for (const scenario of ['accepted', 'rejected', 'application-rejected', 'duplicate', 'retry']) {
            const context = await browser.newContext();
            const page = await context.newPage();
            let requests = 0;
            const keys = [], payloads = [];
            await context.route('**/demo/submit', route => {
              requests++;
              keys.push(route.request().headers()['idempotency-key']);
              payloads.push(route.request().postData());
              if (scenario === 'retry' && requests === 1) return route.abort('timedout');
              const status = scenario === 'rejected' ? 422 : scenario === 'duplicate' ? 409 : 200;
              const body = scenario === 'duplicate' ? { duplicate: true } : { accepted: ['accepted', 'retry'].includes(scenario) };
              return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
            });
            await page.goto(preview.url);
            await page.locator('input[type=email]').fill('visitor@example.test');
            await page.locator('[name=serviceArea]').fill('Oakfield');
            const button = page.locator('button[type=submit]');
            await button.click();
            await page.waitForFunction(() => (document.querySelector('[role=status]')?.textContent ?? '').length > 0 && document.querySelector('button[type=submit]')?.textContent?.trim() !== 'Sending…');
            if (scenario === 'retry') {
              await button.click();
              await page.waitForFunction(() => /accepted/i.test(document.querySelector('[role=status]').textContent));
              assert.equal(requests, 2);
              assert.ok(keys[0]); assert.equal(keys[0], keys[1]); assert.equal(payloads[0], payloads[1]);
            }
            const message = await page.locator('[role=status]').textContent();
            if (['accepted', 'retry'].includes(scenario)) assert.match(message, /inquiry.*accepted|inquiry was accepted/i);
            if (scenario === 'duplicate') assert.match(message, /already received/i);
            if (scenario === 'rejected') assert.match(message, /reject/i);
            if (scenario === 'application-rejected') assert.match(message, /not confirm/i);
            if (['rejected', 'application-rejected'].includes(scenario)) assert.equal(await page.locator('input[type=email]').inputValue(), 'visitor@example.test');
            checks.push(`${scenario}: response behavior passed${scenario === 'retry' ? ', identical retry key and payload' : ''}`);
            await context.close();
          }
        }
      } finally { await preview.close(); }
      const record = { eval_id: id, condition, evidenceSource: 'separate reviewer browser checks', browser: browser.version(), checks };
      await writeFile(resolve(run, 'reviewer-checks.json'), JSON.stringify(record, null, 2));
      results.push(record);
    }
  }
  await mkdir(resolve(root, 'artifacts'), { recursive: true });
  await writeFile(resolve(root, 'artifacts/development-browser.json'), JSON.stringify(results, null, 2));
  console.log('Reviewer browser checks passed for both waitlists and both inquiry forms, including application rejection and identical retry payloads.');
} finally { await browser.close(); }
