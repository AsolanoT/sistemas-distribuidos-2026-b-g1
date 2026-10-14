# HU-INF-02 — two deliveries and partial-integration review

**Current PR #2: NOT READY for manual merge review in its unsplit form.** The implemented partial scope is coherent and no new functional defect is demonstrated, but it exceeds the mandatory review-size gate. No exception is authorized. Full HU/platform acceptance remains incomplete.

## Delivery 1: verified infrastructure foundation

Usable through explicit PostgreSQL, migration, Mongo migration and observability modes and the immutable available-scope verifier. It integrates approved domain owners without duplicating their migrations/implementations. Verified at the exact earlier revisions: one PG instance per environment, bounded/idempotent bootstrap, four isolated PostgreSQL histories and effective domain permissions, real Mongo rs0 lifecycle and Sales recovery/permissions, guarded backups/restores/volume protection, observability, actual Auth/Gateway login, real Workflow/customer/products/sales functional/replay/compensation/recovery and compiled Host/Auth/Products/Sales delivery.

The full `compose.yml` deliberately fails on missing mandatory Customers Portal; this is an honest prerequisite guard, not an available full-platform startup. Worker/full-mesh startup, fourth portal/coordinated Host contract and complete INF-PG-09/10/12 acceptance are not claimed. Available-scope success cannot make full scope exit 0. Independent Mongo/migration/Workflow suites retain earlier evidence and were not rerun here. Browser navigation recovery is component-tested with mocked remote loaders; real-browser federation E2E remains NOT RUN.

No defect now demonstrated blocks the foundation's functional integration. Review size, independent approval and per-PR CI still block recommending the oversized PR's merge. The local method's implementation may be reviewed as a capability; its unapproved substitution for private-CI acceptance is not bundled as a silently granted waiver.

## Historical failure and necessary exclusive revalidation

Prior approved-pin portal child suite PASSED, but strict shared-daemon audit FAILED during concurrent Customers fixture changes and its helper exited 1. Both results remain in [original evidence](evidence/approved-host-2026-10-12/portals.json). An unchanged-baseline cleanup audit was necessary before recommending this partial cut; prior scoped cleanup alone did not satisfy it.

[Fresh isolated evidence](evidence/partial-delivery-2026-10-12/isolated-portals.json): root **`c60ffbaab0233809213f2ac84a770a3d49bb3574`**, unchanged approved lock SHA-256 `ea981735c719a4d756100a435335955a838dbf6a09741da1b3017c8ad1ea4c74`. Host `0e4b8ac7768a1416bdf9513f78a21054e4c22e69`; Auth Portal `02e71fcab39a98aa14a082c68957e750c35347c0`; Products Portal `31f1dc235e50c69030c60f5d5faca5d2c1786270`; Sales Portal `d88babf9cd5a95bd7fb6cbae3a0db642c8df285f`.

Complete unchanged portal suite and strict unchanged-baseline audit both **PASSED**, runner exit **0**, 2026-10-13T03:19:47Z–03:23:30Z. All four builds/coverage suites, complete compiled chains, actual available/stopped Sales 502 inside 15s, shell/Products access, Sales recovery and standalone/prefixed delivery passed. A disposable Docker-in-Docker 29.9.0 daemon kept concurrent tests outside its inventory; no host Docker socket or published daemon API. Its runner saw the same mounted committed layout as the daemon. No client timeout/assertion/guard changed, no failure retry, no backend rerun.

Inner cleanup verified original daemon resource identities and removed no fallback resources. Outer ownership checks removed only its runner/daemon containers, labeled data volume/network, snapshots/private fixtures/raw diagnostics. Separate inspection confirmed zero residual task resources; public runner/base image cache can remain. Persistent environments and concurrent Customers tests were untouched. The new pass supersedes the audit prerequisite for this exact partial scope without erasing the old failure.

## Review-size gate and concrete prepared cuts

Applicable [git-conventions.md](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/00-governance/git-conventions.md): maximum **400 lines of code excluding tests**, split larger PRs, minimum one teammate approval and all applicable CI green.

Initial PR diff against current develop `22ddd80bbd5c781190e79cca19ae864c1f297633`, source `c60ffba…`: 111 files, 8,590 additions / 7 deletions. Conservative metric counts additions plus deletions, includes executable/configuration/operational lock changes, and classifies test/docs/sanitized generated evidence separately. It does not assume those files disappear from review.

| Category | Files | Added | Deleted | Changed lines |
|---|---:|---:|---:|---:|
| Code/configuration (including dependency/protection locks) | 42 | 2,351 | 3 | **2,354** |
| Tests | 22 | 2,105 | 0 | 2,105 |
| Documentation | 23 | 1,372 | 4 | 1,376 |
| Generated sanitized evidence | 24 | 2,762 | 0 | 2,762 |

No raw diagnostic, private sibling source, runtime environment or database archive belongs to the diff. Additional documentation/evidence from this continuation is measured separately in the final publication close-out; it does not increase the operational-code figure. Even disregarding the generated operational protection lock, the code exceeds the gate. Splitting only tests/docs would not solve it.

Ten prepared cumulative references and source patches preserve the original feature branch/history; [full SHA/file/parent catalog](evidence/partial-delivery-2026-10-12/review-cuts.json). Final cut tree equals the original tested `c60ffba…` tree, not a replacement implementation. No original commit was amended/rebased/squashed, no branch was deleted and no permanent branch was changed. Superseded local preparation references were retained; only the catalog's final sequence was published.

| Cut | Published review branch | Code/config changed lines |
|---|---|---:|
| 1 — PostgreSQL/environment configuration | `codex/hu-inf-02-review-v2-01` | 297 |
| 2 — Immutable protection baseline | `codex/hu-inf-02-review-v2-02` | 361 |
| 3 — Operational helpers | `codex/hu-inf-02-review-v2-03` | 297 |
| 4 — Operational command implementation | `codex/hu-inf-02-review-v2-04` | 134 |
| 5 — Immutable snapshots/ownership helpers | `codex/hu-inf-02-review-v2-05` | 298 |
| 6 — Local orchestration/evidence implementation | `codex/hu-inf-02-review-v2-06` | 273 |
| 7 — Public commands/recovery/dev identity | `codex/hu-inf-02-review-v2-07` | 160 |
| 8 — Observability/approved composition | `codex/hu-inf-02-review-v2-08` | 142 |
| 9 — Locked retrieval and test resource ownership | `codex/hu-inf-02-review-v2-09` | 249 |
| 10 — Regressions/docs/evidence plus CI activation | `codex/hu-inf-02-review-v2-10-complete` | 143 |

Cuts 3–6 add complete top-level Python definitions in syntax-valid stages, with no placeholders/stubs or copied owner business logic. Intermediate cuts are preparatory libraries/configuration, **not independently complete CLI/platform releases**. Tests and changed CI are introduced together in the final cut. These prepared references do not have individual PR CI or reviewer approval yet; none is a merge recommendation. Small diffs alone are insufficient, and their individual appropriate verification still has to be recorded. Original test-before-fix history remains on the retained feature branch and is brought into develop only through a later normal merge of that original branch.

Because current #2 still contains all code in one diff, it must stay DRAFT/NOT READY. The team must use sequential normal-merge technical review cuts for delivery 1, verify actual then-current bases/diffs/CI/peer approval, and only then normalize the original PR #2 against develop. No PR was created or merged by this preparation, and no policy exception is assumed.

## Delivery 2 and history-preserving continuation

Delivery 2 remains Customers Portal/coordinated Host HU-CLI-04 approved resulting merges, retaining Host PR #12, affected real contracts/assets and complete root acceptance. It also requires the [explicit local-method decision](local-integration-approval-proposal.md) or required private validation, final global audit, team review and separate documentation. Local authorization/partial merge is not a method-policy approval or HU closure.

For delivery 1's technical cuts: after each owner-approved normal merge into develop, refresh develop and verify the next cut's diff/ancestry/CI; no rebase/force-push/squash. Before finally merging original #2, incorporate resulting develop into the original `feat/postgres-bootstrap-and-root-composition` using a normal merge, resolve only proven overlaps preserving user work, then remeasure its actual remaining diff and checks. This makes develop an ancestor and avoids a stale three-dot comparison still showing the original large diff. Its original TDD commits remain preserved.

After the team merges delivery 1 normally, keep that same feature branch. Verify the actual develop merge SHA, PR base and source ancestry. Incorporate newer develop by normal merge where needed. Only approved remaining HU-CLI-04/full-acceptance changes enter the second PR's diff relative to develop; reject duplicated first-delivery changes. Do not change/delete/rebase the branch or use squash. No such future merge is executed in this task.

HU-INF-02 #239 must remain OPEN across both deliveries. Partial review/merge is recorded as progress, not acceptance of INF-PG-09/10/12 or complete platform readiness. Issue separation/reopening and actual PR metadata are recorded in the final close-out.
