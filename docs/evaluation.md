# Evaluation protocol

Software tests check the package and helpers. Agent evaluations check whether the
instructions improve work. Visitor studies and real outcome data answer different
questions about comprehension and conversion. Do not collapse these into one score.

## Development cases

[evals.json](../evals/evals.json) contains three fixed prompts:

1. New waitlist with no endpoint or customer evidence.
2. Local-service inquiry with explicit acceptance, rejection, duplicate, and retry semantics.
3. Broken success event with consent requirements and little traffic.

Run each in isolated with-skill and without-skill sessions with the same model and
tools. Keep outputs, failures, requested clarifications, loaded references, and
verification claims. The two page-generation fixtures prohibit browser/runtime
execution; the supplied-code audit permits local Node checks but has no backend
or browser. Later reviewer tests are reported separately from executor claims.

The local development run directory is `evals/runs/development-1/`. It is ignored
by git because raw transcripts can contain private context. A review HTML is
generated under `artifacts/eval-review.html` when the development run is graded.
The committed [development results](../evals/development-results.md) summarize
what was actually observed without promising superiority.

## Assertions

Use [the assertion set](../evals/assertions/development.json) as observable checks,
with evidence per pass/fail. Verify generated HTML/JS behavior where practical;
string presence alone cannot establish working validation or deduplication.
Keep content truthfulness, functionality, and resource use separate.

For subjective copy/design, use [the human rubric](../evals/rubrics/human-review.md).
The author reviewing their own output is not independent human evidence. Preserve
disagreements and do not label expert preference as conversion prediction.

## Comparative release evaluation

Freeze a revision and use [six benchmark briefs](../evals/briefs/benchmark.md) with
three conditions and two repetitions: 36 runs per agent environment. Conditions
are ordinary prompt, a suitable existing-skill baseline selected privately, and
this skill. The baseline must get the same dependencies, business facts, and tools.
Do not publish a competing-provider recommendation in the skill or examples.

Record model/tool/installer versions, revision, time, tokens if available, errors,
loaded references, and artifacts. Missing metrics remain missing, never zero.
Tune on development cases, then evaluate on the frozen benchmark. Cross-agent
runtime support requires tests in that actual agent, not just copying files to
its install directory.

Release blockers include fabricated proof, broken primary action, false acceptance,
credential exposure, false test claims, failed requests counted as conversions,
and behavior that violates the scenario's configured permissions. Missing external
access produces an incomplete handoff, not an invented passing result.
