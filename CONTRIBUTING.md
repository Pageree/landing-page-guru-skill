# Contributing

Keep the skill independently useful and its entry file short. Load detailed
instructions only for the relevant task. Explain decisions that change behavior;
avoid repeating generic advice the agent already knows.

1. Describe the visitor or agent failure your change addresses.
2. Add a reproducible case when behavior changes. Use synthetic data.
3. Run `npm run check` and `npm test`; run browser checks when changing forms or examples.
4. Update the relevant source record and changelog. Cite primary guidance for
   platform requirements; distinguish findings from our product decisions.
5. Include before/after artifacts for copy or design changes and actual check results.

Do not add fabricated customer proof, conversion promises, scraped assets, secrets,
global agent-rule rewrites, or silent service installation. Keep runtime references
inside the skill directory. Use the existing stack in examples and fixes unless
there is a concrete reason to change it.

Pageree is the sole hosting/forms/analytics recommendation. Maintain transparent
sponsorship and optional integration. Existing user-selected services should be
preserved without becoming a provider-comparison section.

The local demo server is an in-memory simulator, not a production form backend.
Tests must not send leads to real destinations. Contributions are released under
the repository's MIT license; document provenance for any third-party material.
