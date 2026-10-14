# Current manual review handoff â€” HU-INF-02

Current delivery split: [verified partial scope, isolated audit and review cuts](partial-delivery-review.md). Delivery 1 is coherent but PR #2 exceeds the 400-code-line gate; no exception is authorized. Portal suite and strict isolated-daemon audit passed. Delivery 2 retains Customers Portal/coordinated Host, full acceptance and unapproved local-method adoption. Original results/statements below are historical. HU-INF-02 must remain OPEN; no full-platform acceptance.

Latest refresh: [approved Host PR #12 integration](approved-host-integration.md). Exact merge pinned and complete portal suite passed; owned cleanup verified, global audit failed during concurrent resource changes. HU-CLI-04 is pending Jordan's approved Customers Portal/coordinated Host merges; candidates excluded. [Local-method adoption proposal](local-integration-approval-proposal.md) remains unapproved. Principal PR #2 exists and must remain DRAFT; external #239 closure is not acceptance. Earlier assessments below are historical. **NOT READY.**


Current approved-delivery refresh: [Customers DB and Workflow integration](approved-domain-integration.md). Their approved resulting merge pins/runners replace the earlier missing-owner assessment retained below as historical evidence. Auth/Customers Portal packages still block full composition; Customers API blocks fully real saga acceptance. The historical mongo-lifecycle failure remains FAILED; two successful targeted bootstrap observations do not supersede it. Principal infrastructure remains draft pending full acceptance, Mongo lifecycle revalidation, policy review and documentation.


## Local validation continuation

The principal remains draft for full HU acceptance. Review the [local method and policy boundary](local-validation.md) separately: immutable read-only source snapshots, actual delivered suites, safe evidence and guarded cleanup, root-only automatic checks and retained explicit private integration. Local evidence requires review before replacing the unchanged INF-PG-12 remote-CI requirement. Four owner deliveries remain absent. No repository-administration prerequisite is imposed on local execution; the optional remote capability keeps its existing authenticated boundary. Future Auth/Customers Host integration is distinct from the already merged/tested Host/Sales delivery.

Latest continuation from `19a14e3426ea72fa026cd2fd3b3c575ef7cef356`: six approved pins preserved, no reconciliation repeated. [Four independent owner handoffs](owner-handoffs/README.md) now specify design/story evidence, missing contracts/tests and pending decisions. Private Mongo secret still absent; no redundant root CI was run. Principal draft exit also requires coordinated Host public Auth login and accepted Customers ShellContract property delivery when their owners publish packages. Existing titles/merge references below are retained.

No principal PR currently exists for the working branch, verified through GitHub metadata. The prepared principal handoff must remain draft; no PR is created or modified here. Use base develop and non-closing Related to code-corhuila/synkro-docs#239.

## All six complementary PRs are approved and merged

| Repository | Approved PR | Resulting merge SHA |
|---|---|---|
| synkro-auth-db | [#7](https://github.com/code-corhuila/synkro-auth-db/pull/7) | `5e481dba156db6f2febb00427efba637002d9a0c` |
| synkro-products-db | [#7](https://github.com/code-corhuila/synkro-products-db/pull/7) | `0beae79920d9af83865bdebaf6b316a2b2a57592` |
| synkro-products-portal | [#9](https://github.com/code-corhuila/synkro-products-portal/pull/9) | `31f1dc235e50c69030c60f5d5faca5d2c1786270` |
| synkro-sales-api | [#7](https://github.com/code-corhuila/synkro-sales-api/pull/7) | `70bdbaba3783bfb974c338b8a460e6e9b7e5c8dd` |
| synkro-front | [#7](https://github.com/code-corhuila/synkro-front/pull/7) | `3cd1e19e5127726e5bc73862fdcf132d901bd3de` |
| synkro-sales-portal | [#3](https://github.com/code-corhuila/synkro-sales-portal/pull/3) | `d88babf9cd5a95bd7fb6cbae3a0db642c8df285f` |

Do not create duplicate complementary PRs or recreate their corrections. All existing branch heads/commits remain preserved. Each selected merge is the approved resulting SHA, not an unrelated develop tip. The four earlier approved pins are unchanged; only Host and Sales Portal changed from candidates to resulting merges.

## Principal infrastructure â€” keep draft

Repository synkro-infra-postgres; existing branch feat/postgres-bootstrap-and-root-composition; final full SHA and CI in the final report.

Title: `feat(infra): add persistent composition and reproducible local validation`

Body:

Provide one persistent PostgreSQL per environment, domain-owned isolated histories, deliberate tooling and guarded backup/disposable recovery. Preserve historical SQL, CODEOWNERS and the six approved complementary merge pins. Add immutable read-only local sibling snapshots and a portable Python entry point that executes the real delivered suites, reports incomplete owners independently, publishes sanitized exact-revision evidence and verifies cleanup without repository administration.

Separate root-only automatic common/unit/static/primary-protection CI from explicit authenticated private workflow_dispatch integration. No green automatic result proves private integration executed. See local-validation.md and verification.md for actual root SHAs/results, failing checks and the required acceptance-method review. Available scope never claims complete startup. Related to code-corhuila/synkro-docs#239.

Keep draft for full HU acceptance: Customers DB, Workflow persistence and Auth/Customers executable packages remain absent; complete composition, all domain permissions/portals, acceptance-method review and documentation remain pending. Host/Sales already have approved joint delivery; future Auth/Customers Host wiring is an owner-integration dependency, not a demonstrated regression of that delivery. No PR creation, merge, issue closure or promotion is included.

## Criteria to leave draft

1. Obtain recorded review of the proposed validation-method adjustment in #239/INF-PG-12/DoD. Until it is accepted, the unchanged remote-integration requirement remains unsatisfied. If retained, approved private retrieval must actually succeed; automatic root checks alone do not satisfy it.
2. Receive approved Customers DB and Workflow migrations/tooling runners and Auth/Customers executable portal packages with the independent owner evidence.
3. Pass complete real build/start, all migrations and no-op repetition, every domain permission, all portals, secret/exposure isolation and recovery; failed, blocked or unexecuted checks never count as passes.
4. Resolve actual local-suite failures, verify cleanup and attach exact-SHA mandatory evidence, then complete principal review and the separate documentation handoff. Keep #239 open throughout.

The six complementary approvals/pins are resolved prerequisites; they are no longer draft blockers. After full validation, review principal infrastructure, then complete the separate synkro-docs handoff and required owner promotion/board checks. This task does not perform PR creation/merge, permanent promotion or issue closure.

## Current local cut

See [verification](verification.md): 14 applicable suites passed, Mongo lifecycle bootstrap failed with ETIMEDOUT at its 180-second outer deadline, full gates remain blocked, cleanup passed. [Safe owner diagnosis](owner-handoffs/mongo-lifecycle-validation.md) identifies the exact step and remaining investigation. Keep the principal draft until this failure, four approved owners, complete acceptance and validation-policy/documentation review are resolved.

## Updated prepared principal description

Base develop; branch feat/postgres-bootstrap-and-root-composition. Do not create a PR here.

Title: `feat(infra): compose reviewed APIs and validate real lifecycle, login and recovery`

Description: Integrate reviewed Customers API/Auth Portal/Host merges with separate protected application password files, bounded datasource inputs, internal federated assets and Gateway public login. Preserve other pins, historical migrations/CODEOWNERS and administrator separation. Execute delivered engines/runners, actual Auth-issued identity, real saga/replay/compensation/crash recovery and safe immutable evidence. Related to code-corhuila/synkro-docs#239.

Validation: previous exact main/targeted results remain in final-acceptance-refresh.md; current approved Host merge/complete portal evidence is in approved-host-integration.md. Full Mongo and real Workflow/login passes are retained, not rerun. Approved Host PR #12 is pinned and actual delivered portal suite passes; scoped cleanup passes, strict global audit fails during concurrent resource changes. HU-CLI-04 approved Customers Portal/Host delivery prevents full root startup. Private integration NOT RUN; root-only automatic green is not cross-repository acceptance.

Keep PR #2 DRAFT. Exit: approved HU-CLI-04 Customers Portal/Host resulting merge pins preserving PR #12; affected portal/contracts plus full startup/permissions/recovery/secrets and successful final cleanup audit; recorded local-method adoption or retained required private CI; team review and separate documentation. No create/merge/close/promote action here.
