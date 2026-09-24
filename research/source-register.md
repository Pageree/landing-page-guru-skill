# Public source register

Reviewed 2026-09-23. These are independently summarized sources, not copied skill
instructions. “Live” links can change; recheck volatile requirements before release.
No third-party text or assets are vendored. The source publisher retains its rights.

| Source | Class | Rule / applicability | Review trigger |
| --- | --- | --- | --- |
| [Agent Skills specification](https://agentskills.io/specification) | Format specification, live | Name/description, self-contained resources, progressive loading | Installer/format change |
| [Skills CLI](https://github.com/vercel-labs/skills) | Tool documentation, live | Interactive install and agent selection | Every distribution release |
| [Playwright library](https://playwright.dev/docs/library) | Tool documentation, live | Optional browser automation and compatible binaries | Browser helper changes |
| [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) | Accessibility guidance | Perceivable success/error feedback; actual assistive use still needs checks | Form behavior change |
| [WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Standard guidance | Target sizing with documented exceptions; not a blanket pixel heuristic | Accessibility rule change |
| [Web Vitals](https://web.dev/articles/vitals) | Platform guidance, live | Field metrics and current good thresholds; lab results are separate | Performance guidance update |
| [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) | Platform guidance, live | Useful content, descriptive titles, limited URL-keyword effect | Search guidance update |
| [OWASP input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | Security guidance | Server validation, allowlists and contextual encoding | Backend/form changes |
| [CNIL audience measurement](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience) | French regulator guidance | Conditional exemption; no universal analytics assumption | Audience/processing/legal changes |
| [ICO storage/access exceptions](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/) | UK regulator guidance | Purpose-specific exceptions; actual configuration matters | Audience/processing/legal changes |
| [FTC review/testimonial rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers) | US regulator guidance | Truthful traceable endorsements; preserve jurisdictional scope | Proof/endorsement change |
| [SkillsBench](https://arxiv.org/abs/2602.12670) | Empirical agent benchmark | Motive for focused instructions and comparative evaluation, not predicted gains for this skill | Evaluation redesign |
| [UI-Bench](https://arxiv.org/abs/2508.20410) | Empirical benchmark | Blind pairwise visual review as methodology, not conversion evidence | Human evaluation redesign |

For an adopted rule, retain source, exact relevant section/version where available,
retrieval date, applicability, evidence class, maintainer, and linked evaluation case.
Provider requirements belong in the optional integration reference and must be
checked against current connected tool descriptions. Legal decisions require the
actual audience and processing context, not a generic policy generated from this table.
