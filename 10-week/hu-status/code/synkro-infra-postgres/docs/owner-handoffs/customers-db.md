# Owner handoff: Customers database

## Current status — approved delivery integrated

Customers DB PR #3 is merged into develop at `a23ba04f94ff0f150c5bafd9801cc0c6d9e98bd7` and selected in dependencies.lock.json. Approval is supplied by the user; no formal GitHub review record was present. The prior missing-delivery assessment below is historical design/handoff evidence. Current affected integration results and remaining acceptance boundaries are recorded in [approved-domain-integration](../approved-domain-integration.md). Do not implement or recreate this owner delivery under infrastructure.


Checked 2026-10-12. Recipient: maintainers of `code-corhuila/synkro-customers-db`. Related to [HU-INF-02 #239](https://github.com/code-corhuila/synkro-docs/issues/239); this is an integration dependency, not authorization to implement Customers under infrastructure.

## Published evidence and verified history

`origin/develop` remains `a098042426f259270d9ba28728212872fd2c1b4f`. [PR #1](https://github.com/code-corhuila/synkro-customers-db/pull/1) only delivers common repository files. There is no migration, `flyway.toml`, owning deployment or runner. The current PR inventory contains no later delivery to integrate.

[Customers service structure #187, HU-CLI-01](https://github.com/code-corhuila/synkro-docs/issues/187) is CLOSED and explicitly leaves persistence for later work. It names HU-CLI-02 for Customers DB; #239 and the documented backlog also reserve that label. No implementation issue with that title was found in the current all-state synkro-docs issue inventory. Confirm the actual owner story and its scope before implementation; do not treat #187 or a reserved label as approved DB delivery.

## Available design

Documentation revision `61056c93e6e0783a9199bf56778e9494739bc458` is still published main:

- [Data model, Customers section](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/06-data/models.md): existing specification for `customer`, `idempotency_key`, constraints, same-domain FK/index and uniqueness of identity document across active and inactive customers. These are design examples, not migrations already applied.
- [Data dictionary](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/06-data/data-dictionary.md) and [Customers OpenAPI](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/07-api/contracts/openapi/synkro-customers-api.yaml) define data/API alignment.
- [ADR-009](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/05-architecture/decisions/records/ADR-009-shared-instance-schema-per-domain.md) and [ADR-012](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md) establish shared-instance topology, create-only service users and owner-managed isolated histories.
- [Testing strategy](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/11-quality/testing-strategy.md) supplies owner test expectations. The historical monolith in `12-ux-ui/mvp-synkro-tech` is not a deployment of this database repository.

## Required delivery contract

Deliver reviewed, approved versioned SQL families with corresponding controlled `05_rollbacks/U...` scripts, one repository-wide version sequence and `flyway.toml` selecting only `customers_schema` as schema/default schema/history owner. Do not edit applied versions or place domain objects/history in `public`.

Provide `deploy/compose.yml` with service `customers-db-migrate`, profile `tooling`, external `platform`, no published port and a read-only owner workspace/config mount. Preserve the owning build context if a runner image is needed. Its explicit migrate invocation must accept root-provided `FLYWAY_URL`, `FLYWAY_USER`, `FLYWAY_PASSWORD`; root targets `synkro-db:5432/synkro` with bounded connection/socket timeouts. Select a tested pinned Flyway image/tool version. Migration administrator credentials are runner-only, never application credentials or committed defaults.

Create owner schema and NOLOGIN `customers_reader`/`customers_writer`; grant only own-schema SELECT/INSERT/UPDATE to writer, no DELETE/TRUNCATE, and grant writer to existing `customers_app`. Bootstrap owns that LOGIN/password/search_path; missing app user must fail explicitly. Do not create another PostgreSQL container, grant cross-domain access or hide an absent runner with optional includes. Runtime API credentials stay restricted to Customers.

## Evidence required before root integration

1. Red-before-green owner regressions, followed by actual first migration on disposable PostgreSQL and a second run with zero changes; record tool version, full commit SHA, commands and actual CI steps.
2. Verify history is in `customers_schema`, constraints reject invalid data, duplicate identity documents include inactive records, and idempotency FK/uniqueness match the documented specification.
3. Execute controlled reverse rollback/rebuild only on a disposable database, then reapply; verify checksum drift rejection without rewriting history.
4. Connect as `customers_app`: prove own SELECT/INSERT/UPDATE work; DELETE/TRUNCATE/DDL and reads/writes of Auth, Products and Workflow fail. Prove other application users cannot read Customers. Test missing login, credentials, unavailable engine and bounded failure.
5. Supply independent approved PR URL/resulting full merge SHA and owner CI evidence. Infrastructure then updates only the approved pin/protected-file inventory and runs real root tooling, no-op repetition and permissions. CI green for common files alone is insufficient.

## Decisions to confirm

The schema/model and role boundary already have design sources; do not invent a replacement. Owners must confirm the missing implementation story, exact initial version/rollback inventory, pinned runner version and CI fixture policy against that specification. Any model/API divergence requires a reviewed owner/design change. Keep customer CRUD and API persistence adapter work in their owner stories; this handoff does not implement them.

Clears the Customers portion of INF-PG-05/07/09/10/12; the other owner deliveries and private CI access remain separate blockers.

## Next-task handoff: reserved HU-CLI-02

HU-CLI-02 is a reserved label with base-repository scope in the documentation backlog. Refine its owner migration scope/acceptance before use; no published implementation issue number is asserted. Use the pinned Customers model/dictionary/OpenAPI and ADR-009/012 above. Deliver approved customers_schema versions, controlled rollbacks, isolated history and restricted customers_app grants through customers-db-migrate. Root supplies FLYWAY_URL/USER/PASSWORD to tooling only; runtime uses CUSTOMERS_APP_PASSWORD_PATH and its restricted datasource, never the administrator.

After approved merge, update the root immutable pin/protected inventory and run `python scripts/verify_local.py --source-workspace /absolute/sibling/workspace --scope available`. Use locked local objects without resetting original branches; optional isolated fetch uses existing approved access. Require real first migration, zero-change repetition, disposable rollback/rebuild/reapply and own/cross-schema permission evidence. Exit 2 still identifies incomplete full acceptance while other owners/policy review remain pending. No Customers implementation is added under HU-INF-02.
