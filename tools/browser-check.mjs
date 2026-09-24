import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startPreview } from './serve.mjs';
import { finishReport, loadBrowser, loadContract } from '../skills/landing-page-guru-skill/scripts/lib/common.mjs';
import { testFormFlow } from '../skills/landing-page-guru-skill/scripts/test-form-flow.mjs';
import { validateEvents } from '../skills/landing-page-guru-skill/scripts/validate-events.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'artifacts/browser');
await mkdir(output, { recursive: true });
const { chromium } = await loadBrowser(process.env.GURU_PLAYWRIGHT_MODULE);
const browser = await chromium.launch({ headless: true, executablePath: process.env.GURU_CHROMIUM_EXECUTABLE });
const preview = await startPreview();
const results = [];
try {
  for (const slug of ['waitlist', 'local-service', 'b2b-demo', 'lead-magnet']) {
    const contract = await loadContract(resolve(root, `examples/${slug}/integration-contract.json`));
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.name));
      await page.goto(`${preview.url}/${slug}/`);
      const structure = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: document.querySelectorAll('h1').length,
        unlabeled: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(input => !input.labels?.length && !input.getAttribute('aria-label')).length,
        brokenFragments: [...document.querySelectorAll('a[href^="#"]')].filter(a => a.hash && !document.getElementById(a.hash.slice(1))).length,
        missingAssets: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).length
      }));
      assert.deepEqual(structure, { overflow: false, h1: 1, unlabeled: 0, brokenFragments: 0, missingAssets: 0 }, `${slug} at ${width}`);
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.classList.contains('skip')), true, 'Keyboard begins at skip link');
      await page.keyboard.press('Enter');
      await page.screenshot({ path: resolve(output, `${slug}-${width}.png`), fullPage: true });
      assert.deepEqual(errors, []);
      results.push({ page: slug, width, status: 'pass', checks: structure });
      await context.close();
    }
    if (slug === 'waitlist') {
      const page = await browser.newPage();
      let submissions = 0;
      page.on('request', request => { if (request.method() === 'POST') submissions++; });
      await page.goto(`${preview.url}/${slug}/`);
      await page.locator('#email').fill('visitor@example.test');
      await page.locator('button[type=submit]').click();
      assert.match(await page.locator('#form-status').textContent(), /not connected/i);
      assert.equal(submissions, 0);
      await page.close();
      continue;
    }
    const flow = finishReport(await testFormFlow(contract, { url: `${preview.url}/${slug}/`, browser }));
    await writeFile(resolve(output, `${slug}-form.json`), JSON.stringify(flow, null, 2));
    assert.equal(flow.summary.fail, 0, `${slug} form states; inspect ${slug}-form.json`);
    assert.equal(flow.summary.pass, 6, `${slug} six browser scenarios actually ran`);
    const page = await browser.newPage();
    await page.goto(`${preview.url}/${slug}/`);
    for (const field of contract.form.fields) {
      const locator = page.locator(`[name="${field.name}"]`);
      if (field.type === 'select') await locator.selectOption(contract.verification.browser.values[field.name]);
      else await locator.fill(contract.verification.browser.values[field.name]);
    }
    await page.locator('button[type=submit]').click();
    await page.waitForFunction(() => window.__landingEvents.length === 1);
    const trace = await page.evaluate(() => ({ schemaVersion: '1.0', pageId: document.body.dataset.page, environment: 'demo', source: 'browser-observed', actions: window.__landingActions, events: window.__landingEvents }));
    const eventReport = finishReport(validateEvents(contract, trace));
    await writeFile(resolve(output, `${slug}-events.json`), JSON.stringify(eventReport, null, 2));
    assert.equal(eventReport.summary.fail, 0);
    if (slug === 'lead-magnet') {
      assert.equal(await page.locator('[data-resource]').isVisible(), true);
      assert.equal((await page.request.get(`${preview.url}/lead-magnet/launch-checklist.md`)).status(), 200);
    }
    await page.reload();
    assert.equal(await page.evaluate(() => window.__landingEvents.length), 0, 'Reload does not manufacture a lead');
    await page.close();
  }
  await writeFile(resolve(output, 'summary.json'), JSON.stringify({ date: new Date().toISOString(), browser: browser.version(), results, limitations: ['No live backend or email delivery tested', 'Structural checks are not a full accessibility audit', 'Browser event traces cover acceptance and reload; broader semantics use separate fixtures'] }, null, 2));
  console.log(`Browser checks passed: ${results.length} responsive views, 18 intercepted form scenarios, 3 local acceptances/events, unconnected waitlist, download and reload checks.`);
} finally { await browser.close(); await preview.close(); }
