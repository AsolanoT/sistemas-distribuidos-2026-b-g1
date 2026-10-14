# HU-INF-02 — approved Host merge integration

Current delivery split: [verified partial scope, isolated audit and review cuts](partial-delivery-review.md). Delivery 1 is coherent but PR #2 exceeds the 400-code-line gate; no exception is authorized. Portal suite and strict isolated-daemon audit passed. Delivery 2 retains Customers Portal/coordinated Host, full acceptance and unapproved local-method adoption. Original results/statements below are historical. HU-INF-02 must remain OPEN; no full-platform acceptance.

**NOT READY for full HU acceptance.** Starting infrastructure `94479635791dd72823eb8b27b3ab38af3c850ae1`, existing `feat/postgres-bootstrap-and-root-composition`. Only Host's approved pin changed. Jordan's HU-CLI-04 implementation branches are excluded.

## Verified merge and immutable selection

User confirmed owner approval; GitHub confirms [Host PR #12](https://github.com/code-corhuila/synkro-front/pull/12), `fix/sales-upstream-timeout` → `develop`, MERGED 2026-10-13T02:33:54Z, resulting full SHA **`0e4b8ac7768a1416bdf9513f78a21054e4c22e69`**. The correction head `24d53684fece340968b8dccf466177416b1f5169` is an ancestor and its tree equals the merged tree; no unrelated later develop tip was selected. The previous six merges and every other dependency/documentation pin are preserved. GitHub review objects are empty; the user's explicit approved-merge instruction is recorded separately from server metadata, not represented as a fabricated GitHub review.

[Actual PR CI](https://github.com/code-corhuila/synkro-front/actions/runs/38337241037): SUCCESS, common/deployment, lint, build and test. [Resulting merge CI](https://github.com/code-corhuila/synkro-front/actions/runs/38337480524): SUCCESS at exactly `0e4b8ac7768a1416bdf9513f78a21054e4c22e69`. [Merge metadata](evidence/approved-host-2026-10-12/host-merge.json), [merge per-step CI](evidence/approved-host-2026-10-12/host-merge-ci.json). Both prior references remain preserved; no owner branch/source modification, PR creation/merge or force-push by this continuation.

## Actual affected-suite execution

Pin commit/tested root: **`72c1645f124eaf0245a009af7e8d5a2495d18bab`**, `chore(infra): pin reviewed Host upstream timeout merge`. Committed lock SHA-256: `ea981735c719a4d756100a435335955a838dbf6a09741da1b3017c8ad1ea4c74`. [Sanitized execution evidence](evidence/approved-host-2026-10-12/portals.json), run `run-0c9c6cb5f8f6406aae65dbb71648f8a6`.

| Actually executed owning package | Exact approved revision |
|---|---|
| Host | `0e4b8ac7768a1416bdf9513f78a21054e4c22e69` |
| Auth Portal | `02e71fcab39a98aa14a082c68957e750c35347c0` |
| Products Portal | `31f1dc235e50c69030c60f5d5faca5d2c1786270` |
| Sales Portal | `d88babf9cd5a95bd7fb6cbae3a0db642c8df285f` |

**Complete `tests/portal_delivery.py`: PASSED, exit 0.** Exact clean independent snapshots; original sources preserved. All four owning build/coverage suites passed. Actual Auth 10 JS/1 CSS, Products 8 JS/1 CSS, Sales 8 JS/1 CSS delivered through Host. Actual stopped Sales returned controlled 502 within the unchanged 15-second client deadline, Host `/sales` and the complete Products chain stayed available, and actual Sales assets recovered after its container restart without restarting Host. Shell exports, production inputs, internal platform/HTTP delivery and standalone/prefixed Sales builds passed. No retries added, assertion omitted or timeout increased.

Same-shell/navigation recovery is separately covered by the owning component suite with mocked loaders; real-browser federation E2E was NOT RUN here. The prior causal red 15.031s/SYN_SENT and green 2.031s/502 evidence remains in [Sales diagnosis](sales-outage-resolution.md); those diagnostic timings are not falsely attributed to the new merged run, which asserts the unchanged deadline without printing a timing.

Mongo complete lifecycle, migrations/permissions/recovery and real Workflow/WKF-16 results remain from [previous exact executions](final-acceptance-refresh.md), NOT RERUN. This nginx-only merge has no backend/migration/runtime contract changes.

## Cleanup: scoped success and honest audit failure

The portal suite's own guarded shutdown verified/deleted only its labeled containers and network. Subsequent label inventory confirmed **zero owned residual resources**, and guarded snapshot/private fixture/raw-diagnostic cleanup completed. Build cache may remain. No unrelated resource was removed.

The strict **global preexisting-resource preservation audit FAILED**, causing the diagnostic orchestration helper to exit **1** after the child suite's **0**. The guard was retained, not bypassed. Docker events record an independent Customers browser fixture created at 02:44:53Z, before the suite launcher/raw sink at 02:45:08Z, and its container/network destroyed at 02:46:42–43Z during this run. Thus concurrent disposable activity changed the shared-daemon inventory. Exact baseline identities were not persisted by this one-off helper, so the report does not claim a clean global audit or attribute a specific actor. Safe event categories/timestamps are preserved; raw inspect/events/source fixtures are not published.

Next global-audit action: coordinate an exclusive Docker validation window or isolated daemon with the concurrent test operator, then obtain an unchanged-baseline audit with the final approved HU-CLI-04 revision set. No repeated complete backend run, altered auditor or deletion of concurrent resources is used to force green in this continuation. **Functional portal PASS is distinct from a successful whole-run/global-cleanup result.**

## Remaining review and integration sequence

1. **Jordan / Customers Portal and Host owners — HU-CLI-04:** finish their implementation, real contract/assets/build/test evidence and peer-reviewed PR merges. Until then no candidate branch enters the lock. Select their exact resulting Customers Portal merge and a new approved Host merge that retains PR #12's Sales correction; verify ancestry or patch/tree equivalence if the reviewed merge method changes lineage, then rerun affected actual delivery and accepted ShellContract/Gateway behavior.
2. **AsolanoT / infrastructure:** integrate only those approved deliveries; run complete root startup, deliberate initial/repeated runners, effective permissions, every mandatory portal, exposure/identity and recovery. A file-present prerequisite or portal subset does not substitute for actual complete composition; the full acceptance implementation/evidence remains pending.
3. **Team / acceptance and documentation owners:** decide the [concrete local-integration approval proposal](local-integration-approval-proposal.md). Authorization to implement the verifier and root automatic CI do not approve substitution for INF-PG-12 real-engine private CI. Peer reproduction and a separately approved documentation/traceability decision remain necessary, or satisfy the retained authenticated remote integration path. No private workflow was retried here.
4. **Team / story maintainers:** reconcile external #239 closure with pending acceptance. GitHub shows CLOSED at 02:33:56Z and Host PR #12 has a closing reference to it. No issue state/content is changed here; closure/checkmarks are not evidence of local-method approval or full acceptance.
5. **Principal PR owner/reviewer:** [infrastructure PR #2](https://github.com/code-corhuila/synkro-infra-postgres/pull/2) already exists targeting develop and was observed non-draft. Prepare/update its description to delivered scope and remaining gates and keep it DRAFT; do not create/merge another PR. Final publication SHA/CI and resulting draft metadata are recorded in the close-out.

Concrete principal content: [prepared draft description](prepared-pr-infrastructure.md). Current read-only repository secret metadata is empty; authenticated private integration was not retried. No new credential is necessary for the executed local portal path.

INF-PG-01…08 and 11 retain scoped delivered PASS evidence. INF-PG-09 delivered approved portal scenario PASSED, full four-portal composition BLOCKED. INF-PG-10 full composition BLOCKED. INF-PG-12 BLOCKED by full acceptance, local-method/private-CI decision, successful final global audit, review and separate documentation. No integral acceptance is declared.
