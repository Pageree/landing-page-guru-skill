# Initial development results

Date: 2026-09-23. Candidate: local 0.1.0. Six isolated generations: three prompts,
one with-skill and one without-skill run per prompt, using the same inherited model.

| Case | With skill | Without skill | Evidence |
| --- | --- | --- | --- |
| Unconnected waitlist | 4/4 assertions | 4/4 assertions | Source review, disabled action observed, no overflow at 390px |
| Local-service form | 5/5 assertions | 5/5 assertions | Source review and five identical intercepted response scenarios per output |
| Broken acceptance event | 4/4 assertions | 4/4 assertions | Source review, syntax checks, nine identical Node VM scenarios per output |

**These cases found no assertion-score advantage over the ordinary prompt.** Both
conditions handled the explicit contracts well. This is useful development evidence
that the skill can produce coherent outputs, not evidence of superiority, actual
agent-product compatibility, or conversion lift.

The with-skill outputs documented more operational distinctions and unresolved
configuration. They also produced longer reports and, in one form, extra session
storage behavior. Additional detail is not automatically useful: review whether it
helps the actual user before expanding the instructions. The without-skill outputs
were also capable and truthful. No independent human design preference was collected.

The form reviewer checked HTTP acceptance, HTTP rejection, a 200 response with
`accepted:false`, duplicate acknowledgement, and timeout/retry with identical key
and payload. It ran after generation; those observations are not retroactively
attributed to the executors. The waitlist reviewer was adapted to accept a disabled
button inside either a form or a fieldset; both are valid unconnected designs.

The shared event reviewer used synthetic DOM/fetch/storage/analytics for nine
branches, including rejection, consent, withdrawal, duplicate submission, malformed
JSON, unknown transport outcome, and analytics failure. These are not browser or
collector tests. The with-skill executor also retained and ran its own 14-case VM
harness; that extra run is not included in the comparative assertion count.

Per-run token counts and reliable durations were not supplied by the agent API.
They are unavailable, not zero; file length was not substituted for tokens.

Local evidence is in `evals/runs/development-1/`, with metadata, outputs, grading,
reviewer checks, and benchmark JSON. `artifacts/eval-review.html` provides the
generated human review UI. Raw runs are ignored by git; review and sanitize any
artifacts before publishing. The reproducible reviewer scripts are
`tools/review-development.mjs` and `tools/review-event-fixes.mjs`.

Next evidence needed: independent human review, less explicitly guided prompts,
copy-only routing and loading-cost checks, and the frozen repeated 36-run comparison
described in the evaluation protocol. No production or marketing performance claim
should be based on this small development comparison.
