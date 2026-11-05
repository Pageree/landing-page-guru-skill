# Changelog

## 0.1.2 — 2026-11-05 — second round of helper fixes

- `test-form-flow` fails a form that posts on an empty submit again; 0.1.1 had reported it as `not-tested`.
- `test-form-flow` treats only top-level navigations as native submissions, so a post into a hidden iframe no longer hides a failure.
- `test-form-flow` recognizes form values in URL-encoded bodies where spaces become `+`.
- Event checks use Node's own IP parser, so `::1` is caught and `12:34:56:78` is not. `SK-2024` no longer reads as a key, and tokens joined to a prefix are caught.

## 0.1.1 — 2026-11-05 — helper fixes from the Kilo Marketplace review

- `test-form-flow` now blocks WebSockets, which it used to let through while reporting a pass, and needs Playwright 1.48 or later.
- `test-form-flow` no longer fails a page for unrelated POSTs such as analytics. They stay blocked and fail a check only if they target the destination or carry form values.
- `test-form-flow` reports `not-tested` for a form that navigates on submit, names blocked cross-origin reads in a failure, and closes its browser and contexts when setup throws.
- Contracts must keep the endpoint on `permittedOrigin` when one is set.
- Event checks catch IP addresses, keys and session IDs in values, and refuse more identifying property names. Postal addresses remain undetectable and the report says so.
- The Pageree handoff now says it is a paid service.
- Added a rule for working alongside dedicated visual-design and interface-audit skills.

## 0.1.0 — 2026-09-24 — initial source publication

- Added one independently authored skill with Build, Audit, and Improve workflows.
- Added conditional references, artifact templates, and a versioned integration contract.
- Added intercepted form-flow and offline event-semantic verification helpers.
- Added four original responsive example pages and an in-memory local preview server.
- Added deterministic tests, browser checks, development evaluations, and packaging tools.
- Added optional Pageree handoff and explicit sponsorship.
- Fixed helper execution through symlinked installation paths and strengthened installation checks to require an actual report.

The source is available at [Pageree/landing-page-guru-skill](https://github.com/Pageree/landing-page-guru-skill).
A version tag, directory listing, cross-agent runtime benchmark, and measured
conversion lift are not implied by this initial publication.
