# Proposed acceptance-method decision — HU-INF-02

Current issue handling: the user authorized reopening #239 and recording two deliveries. Partial integration is not adoption of this proposal; the prior external closure observation below is historical. [Current assessment](partial-delivery-review.md).

**PROPOSAL ONLY; approval pending.** Implementing the local verifier was authorized. Substituting its evidence for the story's private cross-repository CI requirement was not thereby approved. This proposal changes the execution venue, not the acceptance scenarios or their pass criteria.

## Sources and unresolved decision

Published synkro-docs main remains `61056c93e6e0783a9199bf56778e9494739bc458`. [Definition of Done](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/00-governance/definition-of-done.md) requires every criterion, local tests/acceptance, real HTTP integration, Docker Compose operation, green applicable CI and at least one team member's review. Its allowed exceptions require explicit team agreement; it does not automatically waive infrastructure acceptance. [Testing strategy](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/11-quality/testing-strategy.md) and [branching policy](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/00-governance/branching-policy.md) remain in force.

[HU-INF-02 #239](https://github.com/code-corhuila/synkro-docs/issues/239) INF-PG-12 says CI executes applicable cases using real engines and links evidence/SHAs. Root automatic checks alone do not meet that private integration requirement. No explicit decision accepting local substitution was found in the issue comments (none) or published documentation. Issue closure/checkmarks are not approval of a different method. GitHub records #239 closed at 2026-10-13T02:33:56Z, and Host PR #12 lists it as a closing reference. This external closure conflicts with remaining full acceptance; story maintainers must reconcile it. This continuation changes no issue state.

## Proposed scope and wording for review

For HU-INF-02's private sibling integration only, propose accepting either:

1. Successful credentialed remote integration against the exact approved lock; or
2. Successful reviewed, independently reproducible automated local integration against the same committed root/lock and approved dependency revisions, with the evidence/controls below and a recorded acceptance-method decision.

Suggested INF-PG-12 validation-method addition: "Required repository automatic CI and owning dependency CI remain green. Private cross-repository real-engine acceptance executes in the authenticated integration workflow, or in the approved immutable local verifier with equivalent mandatory scenarios, exact revision evidence, peer reproduction and verified disposable cleanup. Incomplete or failed local results do not satisfy the full-HU gate."

This wording is not currently adopted. It preserves qa/main development-identity rejection, all functional/full-composition criteria, coverage/protection checks, real users/HTTP/engines, repeat/no-op migrations, isolation, recovery, secrets/exposure and required review/documentation. It does not authorize skipped tests, fake services, unreviewed pins, timeout increases, permanent-branch bypass or replacement of code-repository CI. Browser E2E omission, if applicable to acceptance, is a separate explicit team risk decision; this method proposal grants no such exception.

## Required control and evidence packet

| Control | Required evidence before acceptance |
|---|---|
| Exact published inputs | Committed root full SHA; lock SHA-256; full approved resulting merge SHAs/PR URLs and owning CI. Snapshot HEAD/clean-state checks; no substitution with active source branches. |
| Reproducibility and source preservation | Documented portable command/tool versions; unique run ID/timestamps/OS; independent immutable sibling copies; original checkouts unchanged. A peer repeats the complete acceptance, not merely reviews a screenshot. |
| Equivalent real suites | Actual owning migrations/images/packages and real domain users; root start, first/repeated migrations, independent histories, effective permissions, health, persistence/recovery, all mandatory portals/Gateway and identity/exposure/secrets. Relevant current engine, saga and portal suites remain mandatory within the affected acceptance scope. |
| Honest aggregate outcome | Per-suite PASSED/FAILED/BLOCKED/NOT RUN and reason/exit; full prerequisites explicit. Full acceptance requires all actual deliveries, the complete acceptance suite and aggregate exit 0. Available subsets, file existence or omitted steps cannot satisfy it. |
| Disposable safety | Exclusive projects/networks/containers/volumes; verified ownership before cleanup; preexisting identities preserved; cleanup results included. No persistent qa/main mutation or deletion. |
| Safe publication | Sanitized machine/human manifests; no credentials, environment values, raw diagnostics, database archives or private sibling snapshots. Private temporary diagnostics destroyed after audit. |
| Review and audit trail | Named decision/reviewer/date, scope and wording adopted; evidence linked to tested SHAs and INF-PG-01…12. Team peer acceptance and required separate documentation review. |

Commands remain:

```text
python scripts/verify_local.py --source-workspace <absolute-approved-workspace> --scope available
python scripts/verify_local.py --source-workspace <absolute-approved-workspace> --scope full
```

`available` is evidence of delivered subsets, never full readiness. Current `full` remains blocked: Customers Portal/coordinated Host delivery is pending and a complete root acceptance implementation/evidence must be supplied; the existing verifier explicitly refuses to infer full acceptance from delivered-component successes. That remaining work is not waived by this proposal. The targeted complete-portals run records exact reviewed inputs but is not a complete-platform manifest.

## Approval path and responsible actions

1. **Ángel Gustavo Solano Trujillo / AsolanoT and team:** submit this proposed decision with the evidence packet; identify acceptance owner and peer reviewer, agree or reject the precise venue substitution and residual risks. A green pipeline alone cannot record this human decision.
2. **Infrastructure peer reviewer:** verify test equivalence, complete acceptance coverage and source/resource safeguards; independently reproduce the final approved revision set after HU-CLI-04 delivery.
3. **synkro-docs owner/team:** prepare a separate reviewed documentation change covering #239/traceability, validation strategy, deployment/local setup and DoD alignment. If significant, record a decision using the repository's existing process without inventing an ADR ID here. Under published branching policy, a docs PR into main requires approval from **ariel5253**. No instructor/institutional approval is claimed by this document.
4. **Repository/governance owners:** inspect actual required-check rules at adoption. If a private integration context is required server-side, explicitly approve its mapping; local reports do not bypass protection. No check/settings change is proposed for this continuation.
5. **Story maintainers:** reconcile external #239 closure with outstanding acceptance and record the actual decision/evidence. Infrastructure does not reopen/close or edit the issue.

Until that record exists, retain optional authenticated private integration and report it NOT RUN when its access prerequisite is absent. If that route is chosen, approved repository owners configure `SYNKRO_DEPENDENCY_READ_TOKEN` (limited read access to synkro-infra-mongo and necessary organization authorization), confirm retrieval and run the required workflow. No token value is requested/copied/published, and no broad GITHUB_TOKEN permission is added.

HU-CLI-04 is separately in implementation by Jordan. Integrate no candidate branches. After approved Customers Portal and coordinated Host PRs merge, select their exact resulting merge revisions and verify the new Host retains reviewed PR #12's Sales correction. Then execute affected portals and complete-platform acceptance before principal review. **Approval of this method alone does not make HU-INF-02 complete.**
