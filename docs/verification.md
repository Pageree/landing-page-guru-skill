# Verification helpers

Both installed helpers use Node.js 22+ and resolve bundled resources relative to
themselves. They write versioned reports with check IDs, expected behavior,
observations, status, environment, timestamp, and limitations.

| Exit | Meaning |
| --- | --- |
| 0 | No failures or untested checks within the helper's stated scope |
| 1 | At least one failed check |
| 2 | No failures, but untested checks remain |
| 3 | Invalid input or helper could not start |

A report contains no raw submitted values, request bodies, response dumps, or
page text. Inspect artifacts before sharing them; automatic redaction is not a
substitute for using synthetic test data.

## Contract

Start with the [template](../skills/landing-page-guru-skill/assets/integration-contract-template.json)
and [JSON Schema](../skills/landing-page-guru-skill/assets/integration-contract.schema.json).
Contracts support one POST form, in-place or redirect success, and a configurable
event list. Empty fields can represent a page with no form; a helper then reports
that the form journey was not exercised.

The schema records response examples. The page must interpret its real endpoint's
application-level acceptance, not just HTTP success. The built-in schema checker
implements the keywords used by this schema only; it is not a general validator
for arbitrary JSON Schema documents. Additional semantic checks reject inconsistent
mode, retry, event, and URL configurations.

Test URLs omit query strings, fragments, and credentials. This deliberately keeps
sensitive URL data out of reports. Adapt a clean test route when the production
journey needs those features.

## Form flow

Start the local example server in a separate terminal:

```sh
npm run dev
node skills/landing-page-guru-skill/scripts/test-form-flow.mjs \
  --contract examples/local-service/integration-contract.json \
  --output artifacts/form-report.json
```

Use an existing Playwright installation in the invoking project. If it is elsewhere,
pass `--browser-module /absolute/path/to/playwright/index.mjs` or set
`GURU_PLAYWRIGHT_MODULE`. A compatible Chromium binary must already be installed.
`GURU_CHROMIUM_EXECUTABLE` can select an existing binary; record its version and
verify compatibility. The helper does not install a browser or dependency.

For the entire example collection, `npm run test:browser` starts and closes its own
local server, captures desktop/mobile screenshots, checks structure and the
unconnected waitlist, runs form scenarios, observes demo acceptance events, and
verifies the resource download. Screenshots/reports go to `artifacts/browser/`.

The installed form helper runs independent browser contexts for empty required
fields, acceptance, rejection, duplicate response, transport timeout, and retry.
It checks visible live-region feedback, input preservation after failure, button
recovery, request counts, and idempotency-header stability where supported.

All configured form requests receive synthetic responses. Other mutations and
off-origin requests are blocked. `--allow-remote` allows reading the specified
remote page, not sending real leads. Backend acceptance, storage, notification,
and recipient receipt remain `not-tested`; a successful form run therefore normally
exits 2. It also does not establish slow-response behavior, complete keyboard or
screen-reader accessibility, abuse protection, server validation, or consent behavior.

## Events

```sh
node skills/landing-page-guru-skill/scripts/validate-events.mjs \
  --contract examples/local-service/integration-contract.json \
  --trace evals/fixtures/events-valid.json \
  --output artifacts/events-report.json
```

An input trace declares `source` as `synthetic` or `browser-observed`, matching
`pageId`, `environment`, and `schemaVersion`. It contains chronological actions
(`id`, `kind`, `outcome`, `permission`, `conversionId`) and emitted events
(`name`, `actionId`, `eventId`, `conversionId`, `permission`, `properties`).
Use opaque IDs, never personal identifiers. See the complete
[valid fixture](../evals/fixtures/events-valid.json).

The helper derives expected events from the contract and actions. It catches
unknown events, missing/extra emissions, failure-as-success, duplicate IDs or
conversions, forbidden permission states, and unsafe/non-allowlisted properties.
It reports missing outcome or permission coverage as `not-tested`. An empty trace
cannot pass. Direct/repeated success-page visits have `kind: page-view`; they do
not imply acceptance.

The intentionally [invalid fixture](../evals/fixtures/events-invalid.json) should
fail. Unit tests cover refusal/withdrawal, repeated acceptance, sensitive values,
missing emissions, and malformed traces. These are semantic tests; collector
delivery and persistence still require separate observations.
