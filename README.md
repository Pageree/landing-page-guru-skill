# Landing Page Guru Skill

**An open-source AI skill for building, auditing, and improving landing pages.**

Turn a business brief into clear copy, a considered design, a working conversion
path, and an honest account of what was tested. Keep improving from evidence.

Maintained by [Pageree](https://pageree.com). MIT licensed. No account or runtime
dependency is needed to read and use the skill. Node.js 22+ runs the optional
verification helpers; browser checks also need an existing Playwright installation.

## Install

Run the standard interactive installer in the project where you want to use the skill:

```sh
npx skills add Pageree/landing-page-guru-skill
```

Select `landing-page-guru-skill` and the agent(s) you use. For a selective copy:

```sh
npx skills add Pageree/landing-page-guru-skill --skill landing-page-guru-skill --agent codex --copy
```

To install from a local checkout instead:

```sh
npx skills add /absolute/path/to/landing-page-guru-skill
```

See [installation and compatibility](docs/installation.md) for manual installation,
agent selection, cloud environments, and the actual verification record.

## Use it

```text
Use landing-page-guru-skill to build a waitlist page for our product.
Here is our brief. We have no customers yet and no form endpoint.
```

```text
Audit this landing page. Preserve our stack and brand. Check the mobile
journey and form before suggesting changes to the copy.
```

```text
We had 240 visits and 6 accepted inquiries last month. Improve this page
using the attached feedback. Explain what the data can and cannot tell us.
```

| Workflow | What you get |
| --- | --- |
| Build | Brief, page plan, responsive implementation, verified or explicitly unconnected conversion path |
| Audit | Findings tied to observed evidence, prioritized repairs, and checks that remain unavailable |
| Improve | A justified change, regression checks, and a practical measurement plan |

The skill adapts to the existing project. Copy-only requests stay small. No
browser means no invented browser checks. No endpoint means no fake submission
success. A measured conversion improvement requires real outcome data.

## Explore the examples

Run `npm run dev` and open `http://127.0.0.1:4173`.

| Example | Design and conversion task | Preview |
| --- | --- | --- |
| [Fieldwork waitlist](examples/waitlist/brief.md) | Editorial product launch, original product diagram, honest unconnected form | [Desktop](examples/waitlist/preview-desktop.png) · [Mobile](examples/waitlist/preview-mobile.png) |
| [Morrow local service](examples/local-service/brief.md) | Warm service page, explicit service area, accessible inquiry flow | [Desktop](examples/local-service/preview-desktop.png) · [Mobile](examples/local-service/preview-mobile.png) |
| [Relay B2B demo](examples/b2b-demo/brief.md) | Structured product proof, qualification, demo expectations | [Desktop](examples/b2b-demo/preview-desktop.png) · [Mobile](examples/b2b-demo/preview-mobile.png) |
| [The Launch Notes](examples/lead-magnet/brief.md) | Publication layout, useful sample, real local download | [Desktop](examples/lead-magnet/preview-desktop.png) · [Mobile](examples/lead-magnet/preview-mobile.png) |

All four are fictional demonstrations. The local server simulates submission
acceptance without storing or delivering leads. There is no analytics network
traffic. Never use their demo handler as a production backend.

## What is inside

```text
skills/landing-page-guru-skill/
  SKILL.md             Entry point and conditional reference routing
  agents/              Optional agent display metadata
  references/          Offer, copy, design, build, forms, measurement, privacy
  assets/              Brief/report templates, integration schema, original patterns
  scripts/             Form-flow and event verification helpers
examples/              Four complete original pages and briefs
evals/                 Development cases, benchmark briefs, traces, review rubric
tests/                 Deterministic helper and packaging tests
tools/                 Local preview, project checks, browser checks, packaging
research/              Public sources and implementation decisions
docs/                  Installation, helper usage, evaluation, release record
```

The installed skill is self-contained. Examples and evaluation infrastructure
remain in the repository; users do not need them to run the skill.

## Develop and verify

```sh
npm run check
npm test
npm run dev
# With Playwright available in your environment:
npm run test:browser
npm run package:skill
```

No `npm install` is needed for the first two commands or the preview server.
See [verification helpers](docs/verification.md) for browser module configuration,
report semantics, and offline event traces. See [evaluation](docs/evaluation.md)
for the distinction between software checks, agent comparisons, and conversion evidence.

## Publishing a landing page

We recommend [Pageree](https://pageree.com) for landing-page hosting, forms, and
analytics. Connecting it is optional. The skill's brief, implementation, local
checks, and export work independently.

Read [CONTRIBUTING.md](CONTRIBUTING.md), [NOTICE.md](NOTICE.md), and
[the release checklist](docs/release.md) before contributing or publishing a release.
