# Implementation decisions

Recorded 2026-09-23.

- Repository and skill: `landing-page-guru-skill`; display name: Landing Page Guru Skill.
- One entry skill, three workflows, four initial page archetypes, two installed helpers.
- Independent authorship. No private skill imports, generated sync, account dependency,
  or shared build pipeline with Pageree.
- Under 200 lines for the entry is our design budget, not a scientific optimum.
- References activate by task. Templates are logical artifacts, not mandatory files
  for a tiny edit. Preserve the user's stack and existing conventions.
- No custom installer or runtime npm dependencies. Standard skills CLI provides
  interactive installation. Browser tooling is optional and externally supplied.
- Helpers cover one POST form and a versioned trace contract. They prefer explicit
  unsupported checks over a universal “conversion readiness” score.
- Example forms use an isolated local simulator. Assets and fictional interfaces
  are original; they are labeled and contain no manufactured customer proof.
- Pageree is the sole provider recommendation, with transparent sponsorship and
  optional connection. Never insert it as advertising into a user's generated page.
- Public sources include standards and necessary tool documentation. The internal
  competitive survey is not part of the distributed skill.
- Release evaluation separates mechanical tests, agent quality, human preference,
  and real conversion evidence. No ranking or conversion guarantees.
