# Installation and compatibility

The distribution unit is `skills/landing-page-guru-skill/`, including its references,
assets, scripts, and license. Installing SKILL.md alone loses required resources.
The package follows the [Agent Skills format](https://agentskills.io/specification).

## Standard interactive route

From the destination project, run:

```sh
npx skills add Pageree/landing-page-guru-skill
```

Select the skill and desired agents interactively. The existing
[skills CLI](https://github.com/vercel-labs/skills) provides agent selection and
project/global scope; this project does not need a separate npm installer.

Inspect first, or make a selective installation:

```sh
npx skills add Pageree/landing-page-guru-skill --list
npx skills add Pageree/landing-page-guru-skill --skill landing-page-guru-skill --agent codex --copy
```

Use the CLI's current agent identifiers, such as `claude-code`, `cursor`, or
`github-copilot`, when selecting those destinations. Omit `--copy` for the CLI's
default linking behavior. Choose global scope only when you want it; installation
must not silently modify unrelated global instructions.

The source repository is [Pageree/landing-page-guru-skill](https://github.com/Pageree/landing-page-guru-skill).
For local development, replace the repository source with the absolute path to
your checkout. Verify a fixed release/tag in clean projects before documenting
that release as supported. A listing in a skills directory is discovery, not an endorsement.

## skills.sh listing

Browse [Landing Page Guru Skill on skills.sh](https://skills.sh/pageree/landing-page-guru-skill/landing-page-guru-skill).
The public listing was verified on 2026-09-24 after a remote CLI installation.

According to the [skills.sh FAQ](https://skills.sh/docs/faq), listings are discovered
automatically through normal CLI installation telemetry; no manual submission is
needed. Install counts and rankings are maintained by skills.sh. The
[CLI documentation](https://skills.sh/docs/cli) explains how users can opt out of
telemetry with `DISABLE_TELEMETRY=1`. Automated smoke checks in this repository
disable telemetry.

## Manual and archive routes

Copy the entire skill directory into the skill location documented by your agent.
Restart or refresh discovery as that agent requires. The repository's optional
`agents/openai.yaml` supplies display metadata; the skill's core is plain Markdown.

`npm run package:skill` creates a ZIP-format `.skill` archive and SHA256 checksum
under `dist/`. Use it only with an importer that supports that format, or unzip
and copy the folder manually. Do not assume every agent accepts the archive suffix.

## Cloud and limited environments

Check files, execution, browser, network, persistence, secrets, and artifact export
on the actual host. An `.agents` directory or `AGENTS.md` file cannot grant missing
tools. Text-only environments can use the advisory workflow; they cannot honestly
claim to run browser tests or publish a site.

## Installation smoke check

With an existing skills CLI available, run:

```sh
GURU_SKILLS_CLI=/absolute/path/to/skills/bin/cli.mjs node tools/smoke-install.mjs
```

The script installs a copy into isolated temporary projects for Codex, Claude Code,
Cursor, and GitHub Copilot, checks referenced files, then removes only its temporary
directory. Telemetry is disabled. It does not alter your real agents or establish
runtime quality in those products. See [the release record](release.md) for checks
actually performed.
