# Owner handoff: Workflow persistence and migration tooling

## Current status — approved delivery integrated

Workflow PR #4 is merged into develop at `45aa244251851fda46212c5b6338668daaa683be` and selected in dependencies.lock.json. Approval is supplied by the user; no formal GitHub review record was present. The prior missing-delivery assessment below is historical design/handoff evidence. Current affected integration results and remaining acceptance boundaries are recorded in [approved-domain-integration](../approved-domain-integration.md). Do not implement or recreate this owner delivery under infrastructure.


Checked 2026-10-12. Recipient: maintainers of `code-corhuila/synkro-workflow`. Related to [HU-INF-02 #239](https://github.com/code-corhuila/synkro-docs/issues/239). Persistence functionality belongs to Workflow; infrastructure consumes approved delivery only.

## Published evidence and verified history

`origin/develop` remains `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37`. [PR #2](https://github.com/code-corhuila/synkro-workflow/pull/2) provides structure/health and [PR #3](https://github.com/code-corhuila/synkro-workflow/pull/3) fixes architecture/UTF-8 tests. The existing deployment builds `synkro-workflow`, exposes internal 8080 and joins external `platform`. Persistence contains only `package-info.java`; there is no migration/configuration or `workflow-db-migrate`. No newer owner PR delivery appears in the current inventory.

[HU-WKF-01 #185](https://github.com/code-corhuila/synkro-docs/issues/185) and [HU-WKF-02 #190](https://github.com/code-corhuila/synkro-docs/issues/190) are CLOSED base/guard stories. #185 explicitly excludes persistence and a real database health check. Neither completes this missing store. No later persistence implementation issue was verified in the current all-state issue inventory; owner must identify/agree the story instead of assigning a new HU ID here.

## Available design

Sources are pinned at documentation main `61056c93e6e0783a9199bf56778e9494739bc458`:

- [ADR-007](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md): durable state after each step/before the next, resume/compensate after restart, idempotency and bounded retries.
- [ADR-009](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/05-architecture/decisions/records/ADR-009-shared-instance-schema-per-domain.md) supersedes ADR-007's separate PostgreSQL instance. [ADR-012](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md) controls bootstrap users/migration ownership.
- [Data model, Saga store section](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/06-data/models.md): `db/` owner layout, `workflow_schema.saga_instance`, input/step results, initiating user, completed/failed steps, timestamps, documented status checks, unique saga type/idempotency key and RUNNING index. This is a specified model, not published SQL.
- [Workflow OpenAPI](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/07-api/contracts/openapi/synkro-workflow.yaml), [data ownership](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/09-microservices/data-ownership-matrix.md) and [testing strategy](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/11-quality/testing-strategy.md) bound the public/internal state and verification.

## Required delivery contract

Provide approved persistence adapter and `db/` versioned SQL/controlled rollback families, owner Flyway config and owner tests. `workflow_schema` is the only schema/default/history; histories cannot collide with another owner. Add `workflow-db-migrate` to the existing `deploy/compose.yml`, explicit `tooling` profile, external `platform`, read-only SQL/config mounts and pinned tested tooling. Accept root-injected `FLYWAY_URL`, `FLYWAY_USER`, `FLYWAY_PASSWORD` to shared `synkro-db:5432/synkro`; administrator input is runner-only. No new `workflow-db` instance and no automatic app-start migration.

Create schema/NOLOGIN `workflow_reader` and `workflow_writer`, grant writer to bootstrap-created `workflow_app`; application accesses only its schema with restricted SELECT/INSERT/UPDATE and no DELETE/TRUNCATE/DDL. Wire actual app datasource for `workflow_schema` using Workflow application credentials and disable application Flyway. Preserve service DNS `synkro-workflow`, internal 8080 and existing health/security/architecture tests. Health must check the actual owner store once persistence exists, without making participant availability its own health prerequisite. Service tokens/public keys and app secrets stay runtime inputs; signing-private keys and instance-admin credentials do not belong to the app.

## Evidence required before root integration

1. Red-before-green owner tests; real disposable first migration, zero-change second execution, schema-isolated history, rollback/rebuild/reapply and checksum failure.
2. Real PostgreSQL adapter tests for documented saga storage/reload, uniqueness and invalid status rejection, transaction rollback and durable data across restart. Test write failure cannot be reported as a saved step.
3. As `workflow_app`, prove own permissions, denial of DELETE/TRUNCATE/DDL and all cross-schema access; confirm other app users cannot read internal saga state. Test missing bootstrap login and bounded bad-auth/down-store behavior.
4. Decide and test concurrency/ownership of persisted transitions before claiming safe resume. Where the owner delivery includes orchestration, prove interruption/restart, idempotent forward/reverse steps and bounded compensation failures on real persisted state; such business implementation is outside this infrastructure continuation. A package-info file or placeholder HTTP response is not persistence evidence.
5. Provide reviewed approved PR/resulting full merge SHA and exact-SHA CI with the existing Maven/architecture/UTF-8 suite plus new database tests. Root then pins the approved revision and exercises actual tooling, no-op, permissions, startup and recovery.

## Decisions to confirm

Owner must confirm the persistence story, adapter transaction boundaries and concurrent resume/step-update policy: the documented schema does not by itself specify an implemented locking/versioning mechanism. Do not add a lock/version table or column under HU-INF-02. Confirm JSON payload validation/compatibility and operational handling of FAILED state against the existing API/design before implementation. The model, four documented lifecycle statuses, topology and ownership already have sources; preserve them unless a reviewed design change supersedes them. Do not conflate delivering the runner with delivering the complete register-sale saga.

Clears Workflow's part of INF-PG-05/07/09/10/12 after actual integration evidence; other owner/CI blockers remain independent.
