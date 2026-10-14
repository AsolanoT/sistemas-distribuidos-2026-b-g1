# Infrastructure PR #2 — draft content

Current delivery split: [verified partial scope, isolated audit and review cuts](partial-delivery-review.md). Delivery 1 is coherent but PR #2 exceeds the 400-code-line gate; no exception is authorized. Portal suite and strict isolated-daemon audit passed. Delivery 2 retains Customers Portal/coordinated Host, full acceptance and unapproved local-method adoption. Original results/statements below are historical. HU-INF-02 must remain OPEN; no full-platform acceptance.

Title: `feat(infra): deliver verified foundation for HU-INF-02 (part 1)`

Existing PR: https://github.com/code-corhuila/synkro-infra-postgres/pull/2.
Base: develop. Head: feat/postgres-bootstrap-and-root-composition. Keep DRAFT; create no duplicate.

## Description

Integrate the approved delivered PostgreSQL/Mongo infrastructure, domain runners, APIs, Workflow, Host and available portals with immutable dependency pins, isolated histories and application/admin credential separation. This is partial platform integration: mandatory Customers Portal/coordinated Host delivery under HU-CLI-04 and full acceptance remain pending.

Host PR #12 is approved and merged into develop at `0e4b8ac7768a1416bdf9513f78a21054e4c22e69`. Select that exact resulting merge; all other pins remain unchanged. Actual PR CI and resulting merge CI are green. Jordan's HU-CLI-04 candidate branches are excluded.

Related to code-corhuila/synkro-docs#239. No closing keyword/reference.

## Validation and limitations

- Complete available portal suite PASSED, exit 0, on exact root `72c1645f124eaf0245a009af7e8d5a2495d18bab`, approved Host `0e4b8ac…`, Auth Portal `02e71fc…`, Products Portal `31f1dc2…`, Sales Portal `d88babf…`. Reports contain full SHAs and committed lock digest.
- Four actual builds/coverage suites and complete JS/CSS chains pass; stopped Sales returns controlled 502 within unchanged 15s, shell/Products remain accessible, Sales recovers after its own restart; standalone and prefixed delivery pass.
- Same-shell navigation/recovery is component-tested with mocked remote loaders; real-browser federation E2E was NOT RUN.
- Suite-owned cleanup and independent zero-residual inspection pass; snapshots/private diagnostics removed. Strict global inventory-preservation audit FAILED during concurrent Customers browser fixture activity, so the helper exited 1 despite child suite exit 0. This is not an all-green run or full acceptance. Repeat the final audit in an exclusive validation window/isolated daemon; do not weaken its guard.
- Previously passed full Mongo lifecycle, migrations/permissions/persistence/recovery and fully real Workflow/WKF-16 remain linked to their original tested SHAs; they were not rerun for this nginx-only merge.
- Root-only automatic CI, owning dependency CI, private integration and local real-engine acceptance are distinct. Actions secret name metadata remains empty; authenticated private integration NOT RUN. No credential-dependent rerun or controls change here.

## Evidence

- Current merge/actual execution/cleanup: `docs/approved-host-integration.md`, `docs/evidence/approved-host-2026-10-12/portals.json`.
- Historical backend/engine/saga evidence: `docs/final-acceptance-refresh.md`, `docs/workflow-WKF-16-handoff.md`.
- Traceability: `docs/verification.md`.
- Concrete proposed venue-substitution decision: `docs/local-integration-approval-proposal.md`; not approved.
- Separate documentation handoff: `docs/synkro-docs-handoff.md`.

Do not attribute the tested root's results to a later documentation HEAD; final publication/PR CI is tracked separately.

## Draft exit criteria

1. Jordan/owners finish HU-CLI-04, approve/merge Customers Portal and coordinated Host; record exact resulting merge revisions and owning CI. Verify the new Host preserves PR #12's Sales timeout correction before replacing its pin.
2. Infrastructure integrates only approved merges, executes affected real assets/ShellContract/Gateway behavior and complete-root startup, deliberate first/no-op runners, privileges, health, persistence/recovery, all portals and exposure/identity/secrets.
3. Obtain successful final global resource audit in an exclusive validation window or isolated daemon.
4. Team adopts the exact local-method decision with peer reproduction and separately approved documentation/traceability, or fulfills required authenticated private integration. No automatic waiver or requirement reduction.
5. Complete applicable INF-PG-01…12 evidence for the final lock, final human PR review, effective-head/base CI and separate documentation handoff.
6. Story maintainers reconcile external #239 closure (via Host PR #12) with outstanding acceptance. This continuation edits no issue; closed state/checkmarks do not establish integral completion.

**NOT READY for integral acceptance.** Keep PR #2 DRAFT. No PR creation/merge, permanent-branch promotion or synkro-docs modification.

## Delivery 1 review gate

Current proposed PR is only the implemented/verified infrastructure foundation. Customers Portal/coordinated Host and complete acceptance remain delivery 2; method-policy approval remains pending. Do not merge the unsplit 2,354-code-line diff: use the prepared sequential <=400-line technical cuts with individual CI/peer review, then normally incorporate develop into the retained feature branch and remeasure PR #2. No squash/rebase/force-push or branch deletion. Exclusive portal suite/audit now passes; prior shared-daemon failure/helper exit 1 remains recorded. See partial-delivery-review.md.
