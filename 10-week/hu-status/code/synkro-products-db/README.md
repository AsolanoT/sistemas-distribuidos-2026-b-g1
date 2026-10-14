# synkro-products-db

> products bounded context: database (schema, seeds, migrations)

Part of the **SynkroTech SAS Sales Management System** — organization `code-corhuila`.
Governance and documentation live in [`synkro-docs`](https://github.com/code-corhuila/synkro-docs).

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `synkro-docs`.

## Layout

The team organizes Flyway migrations by SQL family. Every family folder exists from day one,
even when empty (`.gitkeep`), so execution order never has to be renumbered.

| Folder | Content | Run by |
|---|---|---|
| `01_ddl/` | schemas, types, tables, alters, views, functions, procedures, triggers, indexes | Flyway |
| `02_dml/` | inserts, updates, deletes, upserts, patches | Flyway |
| `03_dcl/` | roles, grants, row-level policies | Flyway |
| `04_tcl/` | transaction blocks, manual recoveries, release tags | Flyway |
| `05_rollbacks/` | one `U` script per `V` migration, mirroring its folder | `psql` only (CI and manual recovery) |
| `deploy/compose.yml` | the migration runner (no database: that is `synkro-infra-postgres`) | Docker Compose |

Rules every new migration follows:

- **One version sequence for the whole repository** — `V001`, `V002`, `V003`, … — whatever folder
  the file lives in. Take the next free number; never renumber.
- **Name:** `V<NNN>__<description>.sql` (two underscores). `validateMigrationNaming` rejects anything else.
- **Every `V` has a `U`** with the same number and description, at the mirrored path under
  `05_rollbacks/` (e.g. `03_dcl/01_grants/V003__grants.sql` → `05_rollbacks/03_dcl/01_grants/U003__grants.sql`).
- **Rollbacks run highest version to lowest.** `U003` (revoke) must run before `U002` (drop role):
  PostgreSQL refuses to drop a role that still holds privileges.
- `05_rollbacks/` is deliberately **not** in `flyway.toml` `locations`: Flyway Community never runs `U` scripts.
- The connection is never in `flyway.toml`; Flyway reads `FLYWAY_URL`, `FLYWAY_USER`, `FLYWAY_PASSWORD`
  from the environment. The runner uses the instance administrator's credentials (ADR-012).
- `products_app` (the login role) is created by `synkro-infra-postgres`'s bootstrap, not here.
  `V003` grants `products_writer` to it, so **it must exist before the first migrate**.
- **Name every constraint**: `ck_<table>_<rule>`, `fk_<table>_<target>`, `uq_<table>_<rule>`.
  The CI checks assert on these names.
- **A status with a conditional timestamp is two implications, never an OR of the valid cases**
  (`stock_reservation.released_at`, `stock_alert.resolved_at`):
  `(status <> 'OPEN' OR resolved_at IS NULL) AND (status <> 'RESOLVED' OR resolved_at IS NOT NULL)`.
  `(OPEN AND NULL) OR (RESOLVED AND NOT NULL)` accepts the same rows but is also false for any
  invalid status, so a bad status gets reported by the wrong constraint.
- **A column added later to an existing table is nullable when old rows cannot be backfilled**
  (`stock_adjustment.stock_after`, `V017`, part of the HU-PRO-09 scope: the idempotent replay of
  `POST /products/{id}/stock-adjustments` must return the stock right after that adjustment).
  Rows predating `V017` stay `NULL`; new rows always carry it. Its CHECK is
  `ck_stock_adjustment_stock_after_non_negative` (`stock_after IS NULL OR stock_after >= 0`), and
  CI asserts it with a valid control (`0`) and a rejected `-1`.
- **A partial unique index that encodes a domain rule** (one active category per name, one OPEN
  `stock_alert` per product) lives in the table's own migration, not in `10_indexes/`. CI tests it
  both ways: the duplicate is rejected, and the row is accepted again once the first leaves the
  predicate (category deactivated, alert resolved).

## Running the migrations locally

Requirements: Docker, and a PostgreSQL 16 instance reachable from the Docker network `platform`.

**1. A database.** Once `synkro-infra-postgres` exists, start it — it provides `synkro-db` on the
`platform` network and creates `products_app`. Until then, a throwaway stand-in:

```bash
docker network create platform
```

```bash
docker run -d --name synkro-db --network platform -e POSTGRES_PASSWORD=dev_admin_pw -e POSTGRES_DB=synkro postgres:16-alpine
```

```bash
docker exec synkro-db psql -U postgres -d synkro -c "CREATE ROLE products_app LOGIN PASSWORD 'dev_app_pw';"
```

To use a PostgreSQL installed on your own machine instead, keep the `platform` network (it must
exist) and point `FLYWAY_URL` at `jdbc:postgresql://host.docker.internal:5432/<database>`.

**2. Credentials.** Copy `.env.example` to `.env` (git-ignored) and fill in the administrator user
and password — for the stand-in above, `postgres` / `dev_admin_pw`.

**3. Migrate**, from the repository root:

```bash
docker compose -f deploy/compose.yml --env-file .env run --rm products-db-migrate
```

`--env-file .env` is required: Compose otherwise looks for `.env` next to `deploy/compose.yml`.
Missing `FLYWAY_*` values stop the run before Flyway starts. Running it again must print
`No migration necessary`.

Other Flyway commands replace `migrate` at the end (`info`, `validate`, …); the working directory
and `flyway.toml` are already fixed in the service's entrypoint, so no path is ever typed:

```bash
docker compose -f deploy/compose.yml --env-file .env run --rm products-db-migrate info
```

`clean` is disabled (`cleanDisabled = true`) on purpose. To start over, apply the rollbacks.

## The CI rebuild check

`.github/workflows/db-ci.yml` runs on every push and PR to `develop`, `qa` and `main`, against an
empty `postgres:16-alpine`, using the same Flyway image as `deploy/compose.yml` (keep both tags equal).
It proves, in order:

1. **Migrate from empty** applies every `V*.sql` in the repository (the applied count is checked:
   Flyway exits 0 with zero migrations when it cannot find its config).
2. **Migrate again** is a no-op (`No migration necessary`).
3. **Privileges:** `products_app` has `USAGE` on `products_schema`, and exactly `SELECT`, `INSERT`,
   `UPDATE` (never `DELETE`) on every table in it. Those table grants come only from `V003`'s
   `ALTER DEFAULT PRIVILEGES`, which covers tables created by the role that ran `V003`: create
   every table through Flyway with the same administrator credentials.
4. **Constraints reject bad rows for the right reason:** every named CHECK, unique index and
   foreign key has an assertion (`expect_violation <SQLSTATE> <constraint> <SQL>`) that must fail
   with that SQLSTATE *and* that constraint name, and every table has a valid-insert control.
   A bare non-zero exit is not enough: once a column is added, every bad-row INSERT could fail
   on that column instead. When a migration adds a constraint, add its assertion to that step;
   when it adds a required column, update the test INSERTs (the control fails until you do).
   Clean up child rows before parents at the end of the step.
5. **Rollbacks** apply cleanly, highest version to lowest, and leave neither `products_schema`
   nor `products_writer` behind.
6. **Rebuild:** after dropping `flyway_schema_history`, migrating from scratch succeeds again.

To reproduce it by hand against the stand-in database above (bash, repository root):

```bash
docker run --rm --network platform -e PGPASSWORD=dev_admin_pw postgres:16-alpine psql -h synkro-db -U postgres -d synkro -tAc "SELECT has_schema_privilege('products_app', 'products_schema', 'USAGE');"
```

```bash
find 05_rollbacks -name 'U*.sql' -printf '%f\t%p\n' | sort -r | cut -f2 | while read -r f; do echo "Applying $f"; docker exec -i synkro-db psql -U postgres -d synkro -v ON_ERROR_STOP=1 < "$f" || break; done
```

```bash
docker exec synkro-db psql -U postgres -d synkro -c "DROP TABLE IF EXISTS flyway_schema_history;"
```

Then migrate again (step 3 above). The first command must print `t`; the loop must apply every `U` script from the highest
version down to `U001` (today `U017` … `U001`) without errors.

To run the whole workflow locally, unchanged, use [`act`](https://github.com/nektos/act):

```bash
act push -W .github/workflows/db-ci.yml -P ubuntu-latest=catthehacker/ubuntu:act-latest
```

## Root composition integration (HU-INF-02)

Flyway uses `products_schema` as its only/default schema and stores its ledger in
`products_schema.flyway_schema_history`. No historical migration was changed.
The tooling runner mounts this repository read-only. Root infrastructure waits
for authenticated PostgreSQL readiness before deliberately invoking it.

If `public.flyway_schema_history` exists in an established environment, stop.
Take a backup, inventory its domain/version/checksum records and obtain a reviewed
reconciliation procedure. Do not repair, move or delete that ledger automatically.
CI drops its disposable schema history **before** the schema-dropping rollback.
Run `python3 tests/test_history_contract.py` for the configuration regression.
