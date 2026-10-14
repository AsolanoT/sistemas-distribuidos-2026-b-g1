# HU-INF-02 — approved dependency refresh

Current delivery 1 recommendation: **NOT READY for unsplit PR #2**, due to 2,354 code/config changed lines versus the 400-line gate. [Prepared cuts and partial scope](partial-delivery-review.md) preserve original history; exclusive portal revalidation/audit passed and no new functional defect is demonstrated. HU-INF-02 remains OPEN for delivery 2, full acceptance/method-policy/documentation. No exception is authorized.

Latest refresh: [approved Host merge integration](approved-host-integration.md). Host PR #12 is pinned with successful PR/merge CI and complete portal suite. Owned cleanup passed, global preservation audit failed during concurrent resource changes. HU-CLI-04 Customers Portal/Host candidates remain excluded; [local-method adoption](local-integration-approval-proposal.md), full acceptance/audit and review/docs remain pending. Principal PR #2 must remain DRAFT. Earlier assessments below are historical. **NOT READY.**


## Latest continuation: owner handoffs, 2026-10-12

Starting/root remote checkpoint `19a14e3426ea72fa026cd2fd3b3c575ef7cef356` was clean and matched. The six complementary merges are preserved without repeating reconciliation. Actions secret metadata is still empty; no CI was relaunched. Four pending owner refs and documentation main remain unchanged; no new approved delivery exists to pin. Principal remains draft and #239 is verified OPEN, without issue/repository mutation.

Use the [independent owner handoffs/current gate report](owner-handoffs/README.md) for verified design/story references, decisions, contracts, existing CI steps and retained INF-PG matrix. Auth needs coordinated Host public login/authentication capability; Customers needs accepted ShellContract property delivery and tested Angular routing. These dependencies are not implemented here. Renewal guidance remains proposed (TD-010), not an accepted architecture decision.

This documentation-only continuation is committed locally without pushing to the CI-triggering branch while access is absent. Fresh test claims below belong to the preceding approved-pin refresh, not a new execution in this continuation.

2026-10-12 America/Bogota. **NOT READY — full-HU blockers remain.** The checkpoint ac61240c09cb2b41740565da1505bb482caa163c matched the clean primary checkout and origin/feat/postgres-bootstrap-and-root-composition. Current develop remains 22ddd80bbd5c781190e79cca19ae864c1f297633; the initial branch is 28 commits ahead, zero behind, with a conflict-free merge-tree evaluation. No checkpoint reset or sibling correction was recreated.

## Resolved complementary review/pin blockers

All six complementary PRs have approved manual reviews and are merged to develop. Host #7 reviewed cc3184f735fceef72fe7f7d37c026699bdfff617 and resulted in 3cd1e19e5127726e5bc73862fdcf132d901bd3de; Sales Portal #3 reviewed 64af63d12e88e41ac6fb5e791bd846f36403e487 and resulted in d88babf9cd5a95bd7fb6cbae3a0db642c8df285f. Both resulting Git trees equal their reviewed/tested candidates. The four older approved pins remain unchanged.

| Repository | Approved PR | Resulting merge SHA |
|---|---|---|
| synkro-auth-db | [#7](https://github.com/code-corhuila/synkro-auth-db/pull/7) | `5e481dba156db6f2febb00427efba637002d9a0c` |
| synkro-products-db | [#7](https://github.com/code-corhuila/synkro-products-db/pull/7) | `0beae79920d9af83865bdebaf6b316a2b2a57592` |
| synkro-products-portal | [#9](https://github.com/code-corhuila/synkro-products-portal/pull/9) | `31f1dc235e50c69030c60f5d5faca5d2c1786270` |
| synkro-sales-api | [#7](https://github.com/code-corhuila/synkro-sales-api/pull/7) | `70bdbaba3783bfb974c338b8a460e6e9b7e5c8dd` |
| synkro-front | [#7](https://github.com/code-corhuila/synkro-front/pull/7) | `3cd1e19e5127726e5bc73862fdcf132d901bd3de` |
| synkro-sales-portal | [#3](https://github.com/code-corhuila/synkro-sales-portal/pull/3) | `d88babf9cd5a95bd7fb6cbae3a0db642c8df285f` |

Original sibling working branches and commits were preserved, including the Host cc3184f checkout, original Sales feature checkout d575d35 and its existing isolated integration worktree at 64af63d. Only root lock/documentation are changed in this continuation. The original Sales business behavior, Host error isolation and asset route correction remain as approved, not reimplemented.

## Fresh affected validation on approved revisions

Seventeen clean detached snapshots were checked out at exact lock SHAs. Fresh tests/portal_delivery.py runs the existing host/Products/Sales build-stage suites with their coverage gates and actual owning images. Host serves entry, eight JavaScript files and one CSS file per remote at /remotes/products/ and /remotes/sales/. Standalone Sales serves the same assets with base /. The real Sales outage returns 502 while host /sales and Products assets remain reachable; actual Sales delivery recovers after restart. Internal portal HTTP 80/platform, exact build contexts/bases, browser shell/origin inputs, no credential mounts, shell exports, cache headers and compiled host entry consumers are checked. Owned disposable containers/networks are removed; unrelated persistent containers/networks are untouched.

Fresh root units (32), shell syntax/ShellCheck (12 scripts), four sibling contracts, protected SQL/CODEOWNERS baselines and whitespace checks pass. Full prerequisites remain exit 1. Database/CLI/Mongo/runtime/observability evidence from the previous reports remains explicitly historical: no relevant engine/domain implementation changed, and the approved merge trees equal the earlier tested candidates. No complete platform startup or real-business browser E2E is claimed by this portal subset.

## Unresolved owner deliveries

| Repository / current published SHA | Missing contract/files | Required clearing evidence |
|---|---|---|
| synkro-customers-db / a098042426f259270d9ba28728212872fd2c1b4f | Common files only: no owning composition, migrations or tooling runner | Approved customers_schema migrations and customers-db-migrate deployment/tooling; real first/no-op, rollback and application/cross-domain rights. HU-CLI-02 is reserved in #239; no issue ID invented. |
| synkro-workflow / 32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37 | Placeholder app/persistence package-info; no approved migrations or workflow-db-migrate | Approved workflow_schema store/migrations and owning tooling runner; real migration/replay/rollback/privilege checks. Domain saga functionality stays separate. |
| synkro-auth-portal / d478fba7344f3a778da4f122dd5aefe481a1d32a | Common files/.env only, no executable package/Dockerfile/composition | Approved owning federation package/internal HTTP platform deployment, browser entry/shared identity/production restrictions and actual host delivery. |
| synkro-customers-portal / 875b269d217f17568b8125c4fd805e825f01867d | Common files/.env only, no executable package/Dockerfile/composition | Approved owning custom element package/internal HTTP platform deployment, browser entry/identity restrictions and actual host delivery. |

Current origin/develop SHAs and actual files were inspected read-only; no new approved delivery exists at those refs. Full prerequisites explicitly name Customers DB, Auth Portal, Customers Portal and the Workflow migration runner. No substitute container/migration, optional include, domain feature or skipped prerequisite was introduced.

## Private Mongo CI prerequisite

Fresh Actions secret metadata is empty. Required workflow still reads secrets.SYNKRO_DEPENDENCY_READ_TOKEN in both mandatory integration jobs through the bounded Git askpass helper. No secret value was read/requested, copied, logged or committed.

Exact owner action: **synkro-infra-postgres → Settings → Secrets and variables → Actions → New repository secret**, name **SYNKRO_DEPENDENCY_READ_TOKEN**. Use an approved fine-grained credential with resource owner code-corhuila, repository selection Only select repositories: synkro-infra-mongo, Contents: Read-only (automatic Metadata read), and required organization approval/SSO authorization. No write/admin/workflow scope or workstation credential copy. Its value belongs only in the Actions secret interface, never chat/files/logs.

Once access is available, rerun required root CI on the exact current root SHA and lock. Confirm actual immutable Mongo retrieval; metadata presence alone is insufficient. Keep subsequent integration/prerequisite failures visible and skipped tests skipped. The standalone final report records the new publication run, exact SHA and every required job/step, avoiding a self-referential commit SHA here.

## Actual issue state and principal readiness

GitHub initially showed #239 CLOSED, with an external closure event by AsolanoT at 2026-10-12T05:08:03Z. The user explicitly requested keeping it open until acceptance/review/documentation; this continuation reopened only its state and verified OPEN, without editing its body, posting a comment or changing synkro-docs files. No issue was closed. No principal PR currently exists; its prepared handoff must stay draft. Six complementary reviews/pins are resolved, but private CI access, four owner deliveries, complete platform tests and principal review/documentation remain required.

## INF-PG-01…12

| Scenario | Status | Evidence / remaining acceptance |
|---|---|---|
| INF-PG-01 | PASSED | Retained real restricted-login PG bootstrap evidence; no bootstrap changes. |
| INF-PG-02 | PASSED | Retained repeated/manual PG and Mongo create-only bootstrap; no relevant source changes. |
| INF-PG-03 | PASSED | Fresh complete prerequisites fail explicitly for four missing owner deliveries; existing SQL/secret/fetch fail/retry tests pass. |
| INF-PG-04 | PASSED | Retained real PG/Mongo stop/start persistence/environment isolation; fresh disposable portal stop/start additionally passes. |
| INF-PG-05 | BLOCKED | Previously tested Auth/Products qualified 17-version histories and Sales 10/replay; all six approved merge trees equal tested candidates. Customers/Workflow runners/migrations absent. |
| INF-PG-06 | PASSED | Retained real checksum/legacy-history rejection; fresh protected historical blobs pass without changing baseline. |
| INF-PG-07 | BLOCKED | Retained Auth/Products/Sales application and recovered-Sales permissions; Customers/Workflow rights untestable without owners. |
| INF-PG-08 | PASSED | Retained bounded wrong-auth/stopped-PG/non-PRIMARY checks; engine/runner/runtime source trees unchanged. |
| INF-PG-09 | BLOCKED | Fresh host/Products/Sales builds, coverage, JS/CSS delivery and Sales isolation/recovery pass. Customers/Workflow runners and Auth/Customers packages still prevent complete root build/start. |
| INF-PG-10 | BLOCKED | Fresh three-package model verifies internal portal HTTP/platform, exact contexts/bases/browser inputs, no portal credentials/mounts and production identity guard. Full secret/exposure acceptance remains blocked by four missing owners. |
| INF-PG-11 | PASSED | Retained actual independent PG and Mongo Sales authorization/data recovery; approved merge trees equal prior tested trees. Not freshly rerun. |
| INF-PG-12 | BLOCKED | Missing private Mongo Actions access and four missing owner deliveries prevent complete required root CI. Skipped integrations are not passes. |

## Integration sequence and draft exit

The six approved complementary merges are now pinned. Integrate only actual approved missing owner deliveries; do not implement their features under this HU. With approved private read access, validate the entire root on the exact commit/lock: startup, all domain migrations then zero-change replay, domain permissions, four portals, secret/exposure separation and recovery. Record required CI without treating skipped steps as passed. Only after those gates pass should the principal PR leave its prepared draft state and proceed to manual review. Deliver the separate synkro-docs deployment/local setup/story/NFR → HU → Test → Code handoff, then required owner review/promotion/board checks before any completion. This task does not create or merge PRs, promote permanent branches, force-push or close issues.
