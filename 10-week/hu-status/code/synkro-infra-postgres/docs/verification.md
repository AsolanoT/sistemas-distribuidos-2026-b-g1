# HU-INF-02 — local validation close-out (2026-10-12)

## Latest final-acceptance refresh

Current partial-delivery assessment: [two deliveries and review cuts](partial-delivery-review.md). Fresh unchanged portal suite and strict audit **PASSED** on `c60ffbaab0233809213f2ac84a770a3d49bb3574` in a disposable isolated daemon. Prior shared-daemon audit/helper exit 1 remains historical. Partial scope is coherent; PR #2 exceeds 400 code lines and stays NOT READY pending review cuts. Backend evidence was not rerun; full acceptance remains blocked.

[Approved Host merge and exact portal revalidation](approved-host-integration.md) are current. [Earlier exact evidence](final-acceptance-refresh.md) is preserved. Functional WKF-16/Mongo/migration results remain unchanged, not rerun. Child portal suite passed; global resource-preservation audit failed during concurrent disposable activity and is tracked separately.

| Criterion | Result | Scope |
|---|---|---|
| INF-PG-01 | PASSED engines | Fresh PG and full Mongo initial PRIMARY checks. |
| INF-PG-02 | PASSED current lifecycle | PG no-op and complete Mongo repeat/grant preservation; historical timeout retained. |
| INF-PG-03 | PASSED delivered safeguards | Secret/SQL/fetch failures remain explicit; missing mandatory portal gate nonzero. |
| INF-PG-04 | PASSED engines | PG/Mongo persistence/restart/isolation; not complete mesh startup. |
| INF-PG-05 | PASSED delivered migrations | Auth17/Products17/Customers7/Workflow5; repeat0; real Sales runner/recovery. |
| INF-PG-06 | PASSED | Protected blobs/checksum/legacy refusal; no historical edits. |
| INF-PG-07 | PASSED delivered permissions | Four PG users isolated/audit append-only; actual Sales denial/recovery. |
| INF-PG-08 | PASSED engines | Bad auth/down-PG and full Mongo non-PRIMARY/bounded waits; portal tracked separately. |
| INF-PG-09 | Approved delivered portals PASSED / full BLOCKED | PR #12 exact merge pinned; actual available/stopped/recovered Sales and Host/Products/full assets pass. HU-CLI-04 Customers Portal/Host delivery pending. |
| INF-PG-10 | BLOCKED full composition | Delivered app secret/public-key/portal models pass; full model awaits mandatory portal. |
| INF-PG-11 | PASSED delivered recovery | Actual PG/root Sales/owner Sales/full Mongo restore; no full mesh claim. |
| INF-PG-12 | BLOCKED | HU-CLI-04 approved deliveries, private integration or explicit local-method adoption, full acceptance, successful final global audit, review/docs remain. External issue closure is not acceptance evidence. |

**NOT READY.** Principal stays draft.

## Preserved previous records


## Current affected integration refresh

Customers DB and Workflow approved merge pins/runners now integrate successfully. See [current results and separate blocker matrix](approved-domain-integration.md). Historical evidence below is preserved; its previous missing-Customers/Workflow assessment is superseded by this approved integration, not by candidate delivery. Mongo lifecycle remains historical FAILED and was not rerun.

| Criterion | Current status | Updated evidence / remaining gate |
|---|---|---|
| INF-PG-01 | PASSED delivered PostgreSQL | Fresh real bootstrap; no full acceptance inference |
| INF-PG-02 | FAILED Mongo lifecycle; PG PASSED | Fresh PostgreSQL no-op; historical Mongo failure retained |
| INF-PG-03 | PASSED delivered safeguards | Fresh missing-secret/SQL-failure propagation; mandatory portal gate remains nonzero |
| INF-PG-04 | BLOCKED complete lifecycle | Fresh PostgreSQL persistence/isolation; Mongo lifecycle remainder pending |
| INF-PG-05 | PASSED delivered migrations | Fresh four PostgreSQL histories/no-op; prior Sales evidence retained, not rerun |
| INF-PG-06 | PASSED | Fresh immutable protection and legacy/checksum rejection |
| INF-PG-07 | PASSED delivered permissions | Fresh all-four PG own/cross-schema tests; prior recovered Sales evidence retained |
| INF-PG-08 | FAILED Mongo lifecycle; PG PASSED | Fresh bad-auth/down-PG bounds; complete Mongo lifecycle unresolved |
| INF-PG-09 | BLOCKED | Workflow real runtime passed; Auth/Customers portal packages still absent |
| INF-PG-10 | BLOCKED full platform | Workflow internal port/network/app-secret isolation passed; full portal exposure/secrets pending |
| INF-PG-11 | BLOCKED complete recovery | Fresh PostgreSQL backup/restore; complete Mongo lifecycle/recovery gate pending |
| INF-PG-12 | BLOCKED | Portals, Mongo lifecycle, complete acceptance, policy review and documentation pending |

The fully real saga is separately BLOCKED by Customers API; database/runner/runtime integration does not clear it. Principal remains draft.

## Preserved preceding run


Starting published SHA: `7731dc3c4e077b15a98254ddf56777195f1bd5dd`. Real run tested committed root `e8ce612ee43e52e5b0cf778fc8f9a547844abd7d`; final publication adds only safe evidence/documentation. No dependency pin was changed. See [exact manifest](evidence/local-validation-2026-10-12/manifest.json), [per-suite results](evidence/local-validation-2026-10-12/report.md), [method](local-validation.md) and [Mongo diagnosis](owner-handoffs/mongo-lifecycle-validation.md).

All 17 immutable dependency snapshots were prepared from local Git objects with exact clean HEADs, without an Actions secret or modifying source checkouts. Sixteen sibling HEAD/status digests matched their initial state. Workflow's original checkout changed externally during this cut to `462644e0e79bbfffdefdcdfb8ae6e25ac0122358`; it was not incorporated or reset. The run used only its approved locked revision, not that candidate. Source fixture regressions separately prove dirty checkouts are excluded and preserved.

14 delivered-component suites PASSED, mongo-lifecycle FAILED (exit 1), full-prerequisites BLOCKED (actual exit 1) and full-platform-acceptance BLOCKED (not executed). Aggregate exit 1; neither local capability readiness nor full HU acceptance is claimed. Host/Sales joint delivery and failure isolation passed; future Auth/Customers incorporation is an owner dependency, not a demonstrated new Host defect.

Cleanup PASSED: task-owned snapshots, private diagnostics and short temporary fixture were removed; no recorded resources remained and preexisting Docker identities were preserved (9 containers, 169 volumes, 11 networks). Build images/cache are intentionally retained. The earlier run recorded cleanup failure; subsequent guarded remediation removed its owned deep Windows snapshots without rewriting that original failure. Real regressions exposed and corrected Windows deep-path, temporary-path, ownership and prerequisite-classification defects; all 61 final unit/Git tests passed. No suites were restarted after the close-out instruction.

| Criterion | Current status | Evidence / remaining acceptance |
|---|---|---|
| INF-PG-01 | PASSED (delivered subset) | Restricted PostgreSQL initialization passed; full platform acceptance remains separate. |
| INF-PG-02 | FAILED | PostgreSQL bootstrap/no-op passed; published Mongo manual bootstrap exceeded its outer 180-second deadline. |
| INF-PG-03 | PASSED | 61 unit/Git regressions and explicit missing-owner prerequisite gate; blocked is not passed integration. |
| INF-PG-04 | BLOCKED | PostgreSQL persistence passed; complete Mongo lifecycle remainder unexecuted after bootstrap timeout. |
| INF-PG-05 | BLOCKED | Auth/Products real migrations passed; Customers/Workflow approved histories and runners absent. |
| INF-PG-06 | PASSED | All 17 immutable protected baselines verified; historical migrations and CODEOWNERS unchanged. |
| INF-PG-07 | BLOCKED | Auth/Products and recovered Sales permissions passed; Customers/Workflow permissions await owners. |
| INF-PG-08 | FAILED | Negative delivered checks passed; Mongo lifecycle bootstrap ETIMEDOUT remains unresolved. |
| INF-PG-09 | BLOCKED | Real Host/Products/Sales builds, assets and outage/recovery passed; four mandatory owner deliveries absent. |
| INF-PG-10 | BLOCKED | Delivered secret/exposure/model checks passed; complete platform evidence awaits owners. |
| INF-PG-11 | BLOCKED | PostgreSQL, root Mongo Sales and published Sales recovery passed; complete lifecycle/platform acceptance incomplete. |
| INF-PG-12 | BLOCKED | Local lifecycle failed; four owners, full acceptance, validation-policy review and documentation remain open. Private remote integration NOT RUN. |

The four [owner handoffs](owner-handoffs/README.md) remain required: approved Customers DB, Workflow persistence, Auth Portal and Customers Portal. Only approved resulting revisions may update the lock. The next reserved HU-CLI-02 is described in [Customers handoff](owner-handoffs/customers-db.md), including design refinement, real migration/permission/no-op/rollback evidence; no issue number is invented.

Automatic common/unit/static/primary-protection CI is separated from explicitly dispatched authenticated private integration. Green automatic checks do not prove private integration. No remote integration was dispatched with the unchanged missing-access constraint. Replacing the original remote-CI acceptance method requires recorded #239/DoD/team review; settings, protection and permissions were not altered. See the separate [synkro-docs proposal](synkro-docs-handoff.md); synkro-docs was not modified. Principal PR remains draft; no PR/issue/promotion action was performed.

**NOT READY — blockers listed. HU-INF-02 remains incomplete.** Next actions: owner investigation of Mongo bootstrap; approved delivery of each of the four missing owners; validation-method review; then affected checks and complete disposable acceptance, principal review and separate documentation handoff.
