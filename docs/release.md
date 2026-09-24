# Release checklist and verification record

Version: 0.1.0 source preview. Updated: 2026-09-24.

## Before publication

- Run `npm run check`, `npm test`, and the relevant browser checks.
- Inspect desktop/mobile screenshots and complete human copy/design review.
- Run selective installation in clean destinations; check every runtime reference.
- Confirm LICENSE/NOTICE and original asset provenance.
- Inspect packaged archive and checksum; keep secrets/raw runs out of publication.
- Confirm the GitHub owner/repository and publish a reviewed revision/tag.
- Test the remote installation command after publication.
- Recheck directory submission rules and prepare a dedicated Pageree website page
  with real examples, the install command, sponsorship, and evidence limits.

The source repository is [Pageree/landing-page-guru-skill](https://github.com/Pageree/landing-page-guru-skill).
Publishing an npm package, deploying the examples, tagging a release, and submitting
to directories are separate release actions. This project uses the standard skills
installer; it has no custom npm CLI.

## Verification record

Local checks ran on macOS with Node 25.8.2, skills CLI 1.5.14, and Playwright 1.62.1
using existing cached Chromium 149.0.7827.55. GitHub CI also passed on Node 22
for the initial publication on 2026-09-24. No dependencies were installed into other projects.

| Area | Result / limit |
| --- | --- |
| Project checks | Passed metadata, local links, self-contained references, JSON/contracts |
| Deterministic tests | 14 passed: contract consistency, event semantics, CLI failures, symlinked helper execution, local simulator |
| Browser checks | 8 responsive views and 18 intercepted form scenarios passed; local acceptance/events, unconnected waitlist, download and reload checked |
| Visual inspection | Desktop/mobile screenshots inspected by the author; independent human review pending |
| Installer smoke | Selective copy and installed helper execution passed for Codex, Claude Code, Cursor and GitHub Copilot destinations; actual agent triggering/runtime parity untested |
| Development evaluation | 3 paired cases; both conditions passed 13/13 assertions; no demonstrated incremental advantage |
| Comparative release benchmark | 36-run protocol defined; not yet executed |
| Live integration | No real backend, email, or Pageree publishing performed |

Raw browser reports, installation paths, screenshots, and local review UI live under
`artifacts/`. Generated binaries are reproducible with the documented commands.
The development comparison is summarized in [its result record](../evals/development-results.md).
