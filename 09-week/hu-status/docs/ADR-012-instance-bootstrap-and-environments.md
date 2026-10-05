# ADR-012 — Instance Bootstrap, Service Users and Environment Files

| Field | Value |
|-------|-------|
| **ID** | ADR-012 |
| **Date** | 2026-10-03 |
| **Status** | Accepted |
| **Authors** | Fredman Santiago Plazas Artunduaga |
| **Reviewers** | Angel Gustavo Solano Trujillo — Tech Lead, Jordan Ramirez Gallego, Sergio Andrés Ordóñez Díaz — Development team |
| **Modifies** | ADR-009, concrete rules of its decision: the init script that creates schemas and roles, and the credentials each domain connects with. ADR-005 Decision 2: extends `flyway.toml` configuration and the rebuild check |
| **Traced to** | HU-ARQ-25 |

This ADR refers to the PostgreSQL infrastructure repository as `synkro-infra-postgres`, the name ADR-010 Decision 6 decided for it. That rename is accepted but its execution by the instructor is pending on [code-corhuila/synkro-docs#159](https://github.com/code-corhuila/synkro-docs/issues/159); until it lands, the repository still operates under its current name `synkro-infra`, and every script, path and document below should be read with that in mind.

---

## Context

ADR-009 placed one PostgreSQL instance per environment in `synkro-infra-postgres`, one schema per domain. Its concrete rules, and `05-architecture/deployment.md` with them, today describe:

- an `init-schemas.sql` script that creates the empty schemas, the no-login roles and the users, while each `-db`'s migrations create the same objects idempotently;
- two credential pairs per domain: an owner for the migration runner and a service user whose name is a variable;
- a single `.env`, copied from `.env.develop.example`, `.env.qa.example` or `.env.main.example`;
- the address `?currentSchema=<domain>_schema` as the only indication of where Flyway keeps its history.

While preparing `synkro-infra-postgres`, four problems appeared:

1. **Schemas and roles are created in two places.** If the script and a migration drift apart, the environment and a `-db`'s CI stop matching, and nobody notices until a permission fails.
2. **The script only runs on an empty volume.** Adding a domain to an environment that already holds data has no procedure.
3. **A single `.env` does not separate environments.** Starting `qa` with the wrong file reuses `develop`'s container and volume.
4. **Two `-db` repositories in the same database share the Flyway migration-history table by default**, and the second one fails.

No database or infrastructure repository has been built yet.

**Constraints:**
- ADR-005 and ADR-009 are immutable; this ADR replaces and extends sections without editing them.
- Still in force from ADR-009: one instance per environment in `synkro-infra-postgres`, one schema per domain, no `-db` defines a database service or a volume, no foreign keys between schemas.
- Still in force from ADR-005: Flyway, the migration families, the no-login `<domain>_reader` and `<domain>_writer` roles with no delete permission.
- After ADR-010, the PostgreSQL instance has four schemas: `auth_schema`, `customers_schema`, `products_schema` and `workflow_schema`. The MongoDB instance follows the same environment convention decided here.
- No service connects as the instance administrator.

---

## Decision 1 — What the instance bootstrap creates

### Options

**Option A — The script creates schemas, roles and users; migrations repeat them idempotently** (current model).
- **Pros:** a freshly created environment already has its schemas before the first migration.
- **Cons:** every object has two definitions that can drift; the `-db` stops being the sole owner of its schema.

**Option B — The script creates only what belongs to the whole instance: extensions and login users. Each `-db` creates its own schemas and roles.**
- **Pros:** every object is created in one place; a domain's whole schema is rebuilt from its own `-db`; the script is short and safe to re-run.
- **Cons:** the migration runner needs permission to create schemas and roles.

### Decision

**We decided: Option B.**

- `synkro-infra-postgres/postgres/init/01-instance.sh` creates whatever extensions the system needs and one login user per domain: `auth_app`, `customers_app`, `products_app` and `workflow_app`. Each one gets its `search_path` set to its own schema. The password of each user comes from an environment variable.
- The script is **idempotent**: it creates what is missing and leaves what exists unchanged. It is mounted in the image's init directory, so it only runs by itself the first time, on an empty volume.
- No extension is needed today (`gen_random_uuid()` is part of PostgreSQL 16). If one is ever needed, this script creates it — never a `-db`.
- The schema `<domain>_schema` and the roles `<domain>_reader` and `<domain>_writer` are created **only** by the migrations of that domain's `-db` (and by `synkro-workflow` for `workflow_schema`).
- To add a domain to an environment that already exists: its user is added to the script, and the script is run once by hand in that environment.
- In a `-db`'s CI, which runs against an ephemeral instance with no script, the job itself creates the `<domain>_app` user before migrating.

### Dominant criterion

**Every database object is created in exactly one place.** What belongs to the instance lives in infrastructure; what belongs to a domain lives in its `-db`.

### Accepted cost

- Adding a domain requires a manual step in every existing environment.
- A freshly created environment has no schema until migrations run; a service started before that answers with an error.

---

## Decision 2 — Which user each component connects as

### Options

**Option A — Services connect as `<domain>_app`; migration runners connect as the instance administrator.**
- **Pros:** one credential pair per domain instead of two; the runner can create the schema and the roles; this matches what already happens in CI.
- **Cons:** a migration could touch another domain's schema; this is prevented by review and a privilege check, not by a permission.

**Option B — Services as `<domain>_app`; runners with a per-domain owner user** (current model).
- **Pros:** one domain's runner cannot alter another schema.
- **Cons:** to create its schema and roles, that owner needs permission to create objects and roles in the database — almost the administrator's scope; it duplicates each domain's credentials.

### Decision

**We decided: Option A.**

- Each service connects with its own domain's user: `synkro-auth-api` as `auth_app`, `synkro-customers-api` as `customers_app`, `synkro-products-api` as `products_app`, and `synkro-workflow` as `workflow_app`.
- The user name is fixed; only its password is a secret (`<DOMAIN>_APP_PASSWORD`). Each `-db`'s last permission migration grants `<domain>_writer` to `<domain>_app` by name, and fails if that user does not exist.
- An `_app` user has no privilege of its own: everything comes from `<domain>_writer`.
- Migration runners use the instance administrator's credentials. Nothing else uses them: no service, no scheduled job.
- The pairs `<DOMAIN>_DB_USER` / `<DOMAIN>_DB_PASSWORD` and the variable `<DOMAIN>_APP_USER` are removed.
- **Privilege check.** After migrating an environment, a query lists, for each `_app` user, the schemas it reads and writes. The expected result is one row per user: its own schema, with write access. Any other row is a defect.

### Dominant criterion

**A service can only write to its own domain's schema**, and that is checked with a query, not assumed.

### Accepted cost

- Isolation between different domains' migrations depends on review and the privilege check, not on a permission.
- The administrator's credentials are used on every migration and must be protected as the environment's most sensitive secret.

---

## Decision 3 — Environment variable files and environment separation

### Options

**Option A — A single `.env`, copied from the environment's example** (current model).
- **Pros:** one file to remember.
- **Cons:** nothing on a machine indicates which environment its `.env` holds; two environments on the same machine share a container and a volume.

**Option B — One file per environment, each fixing its own Compose project name.**
- **Pros:** each environment has its own container and volume; every command names the environment it acts on.
- **Cons:** every command carries the environment's file.

### Decision

**We decided: Option B.**

| Environment | Real file (never versioned) | Versioned example | `COMPOSE_PROJECT_NAME` |
|---|---|---|---|
| `develop` | `env/dev.env` | `env/dev.env.example` | `synkro-dev` |
| `qa` | `env/qa.env` | `env/qa.env.example` | `synkro-qa` |
| `main` | `env/main.env` | `env/main.env.example` | `synkro-main` |

- Every command names its file: `docker compose --env-file env/dev.env …`. There is no default `.env`.
- Every example lists every variable some service reads, with placeholders and no real value.
- The `platform` network is created once per machine, and every `compose.yml` declares it as external.
- Development keys and sign-in exist only in `develop`.
- `synkro-infra-mongo` follows the same convention (ADR-010).

### Dominant criterion

**An environment never uses another environment's container or volume.**

### Accepted cost

- Longer commands.
- The network and the gateway's published port have fixed names: on one machine, only one environment runs at a time.

---

## Decision 4 — Migration history per domain

### Options

**Option A — Each `-db`'s history table lives inside its own domain's schema.**
- **Pros:** each domain keeps its history next to its own tables; nothing in `public`.
- **Cons:** reverting the migration that creates the schema requires dropping the history table first.

**Option B — Every history table in `public`, named with the domain.**
- **Pros:** the history survives even if the schema is dropped.
- **Cons:** domain objects in `public`, where no other system table lives.

### Decision

**We decided: Option A.** Each `-db`'s `flyway.toml`, and `synkro-workflow`'s, declares its schema as its only and default schema. The history table lives in `<domain>_schema`. The runner's connection address no longer carries `currentSchema`.

Each `-db`'s rebuild check becomes: migrate from empty; migrate again and apply zero changes; apply the `U` scripts from highest to lowest, dropping the history table before the `U` that drops the schema; migrate again.

### Dominant criterion

**One domain's migrations do not interfere with another's**, even sharing the same database.

### Accepted cost

- One more step in the rebuild check.

---

## Decision 5 — Volume protection

### Options

**Option A — A written rule, reinforced by operational scripts.**
- **Pros:** the costliest mistake (deleting `qa` or `main`'s data) does not depend on someone remembering.
- **Cons:** two more scripts to maintain.

**Option B — Only the written rule.**
- **Pros:** nothing to build.
- **Cons:** a habitual `down -v` deletes the environment.

### Decision

**We decided: Option A.**

- In `qa` and `main`, the volume is never removed. `synkro-infra-postgres`'s shutdown script refuses to remove volumes when the environment is not `develop`.
- In `qa` and `main`, a backup of the database is taken before migrating. Backups are stored outside the repositories.
- The database is created once per environment; after that it only grows with each `-db`'s pending migrations.

### Dominant criterion

**`qa` and `main`'s data is not lost by a command.**

### Accepted cost

- Migrating in `qa` and `main` takes longer.
- Backups contain data and must be protected like the database itself.

---

## Decision 6 — Cross-domain reads

### Options

**Option A — Only through the owning domain's API.**
- **Pros:** a change to one domain's schema never breaks another; one single way to get a piece of data.
- **Cons:** composing data from several domains costs several requests (`02-domain/entities-and-rules.md`, a known limitation).

**Option B — Allow read-only queries to another domain's tables, granted by the owning `-db` and recorded as technical debt.**
- **Pros:** fewer requests for listings that mix domains.
- **Cons:** couples one service to another's tables; the case that would benefit most from it — showing a sale with its customer's and products' names — cannot use it, because Sales already left this database (ADR-010).

### Decision

**We decided: Option A.** No `-db` grants `<domain>_reader` to another domain's user. A service obtains another domain's data only through its API.

### Dominant criterion

**A domain's schema can change without notifying anyone outside it.**

### Accepted cost

- The cost of several requests to show customer and product names alongside a sale is kept.

---

## Decision 7 — Schema naming

### Options

**Option A — Keep `<domain>_schema`.**
- **Pros:** the data model, the dictionary and the contracts already use that name; the suffix tells schema, role and user apart at a glance (`customers_schema`, `customers_writer`, `customers_app`).
- **Cons:** longer names.

**Option B — Rename to the bare domain name, no suffix.**
- **Pros:** shorter names.
- **Cons:** rewriting documents just aligned, with no functional gain.

### Decision

**We decided: Option A.** Schemas are `auth_schema`, `customers_schema`, `products_schema` and `workflow_schema`. Nothing lives in `public`.

### Dominant criterion

**Do not redo accepted work without a functional gain.**

### Accepted cost

- Schema names longer than the domain name.

---

## Consequences

**What changes in the system:**
- `synkro-infra-postgres` contains `postgres/init/01-instance.sh` instead of `scripts/init-schemas.sql`, and `env/dev.env.example`, `env/qa.env.example` and `env/main.env.example`.
- Each domain goes from two credential pairs to one; the service user's name stops being configurable.
- Permission migrations grant the writer role by a fixed name, with no Flyway placeholder.
- Each `-db`'s `flyway.toml` declares its schema; the rebuild check gains one step.
- `synkro-infra-postgres`'s scripts take the environment as an argument.

**What must be watched:**
- The privilege check after every migration: it is the only evidence that isolation holds.
- Any migration that names a schema other than its own: rejected in review.
- The bootstrap script must stay idempotent; a change that fails on its second run blocks adding domains.
- Any request to read another domain's tables: the signal to reopen Decision 6 with a new ADR.
- Until the instructor applies the rename of issue #159, every script and path above that says `synkro-infra-postgres` describes the target state, not the repository's current name.

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| `06-data/models.md` | Principle 6: schemas and roles only in the `-db`, `<domain>_app` users, per-domain history; the Flyway placeholder is removed; every `synkro-infra` → `synkro-infra-postgres` (HU-DOCS-80) |
| `05-architecture/deployment.md` | §3 external network and bootstrap; §4 bootstrap script and privilege check; §5 runner, history and backup; §6 per-environment files and credentials; §9 start steps; every `synkro-infra` → `synkro-infra-postgres` (HU-DOCS-81) |
| `10-devops/environments.md`, `10-devops/local-setup.md` | Environments, files and commands (HU-DOCS-81) |
| `00-governance/security-policy.md`, `00-governance/security-rules.md`, `05-architecture/security-threat-model.md` | One credential pair per domain; administrator use limited to migrations (HU-DOCS-83) |
| `04-requirements/non-functional.md` | NFR-004 and NFR-007: `<domain>_app` users and separated environments (HU-DOCS-83) |
| `11-quality/testing-strategy.md` | Rebuild check with the history step; `_app` user creation in CI (HU-DOCS-84) |
| `15-project-control/open-questions.md` | Q-004 closed, pointing to this ADR (HU-DOCS-88) |
| `05-architecture/decisions/README.md` | ADR-012 row; ADR-005 and ADR-009 marked as modified (this PR) |
| ADR-005, ADR-009 | **Unchanged**: immutable |

---

## Immutability rule

Once `Accepted`, this ADR is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

---

## References

- Shared instance with one schema per domain → `05-architecture/decisions/records/ADR-009-shared-instance-schema-per-domain.md`
- Flyway, roles and the rebuild check → `05-architecture/decisions/records/ADR-005-data-isolation-per-domain.md` Decisions 2 and 3
- Sales domain on MongoDB and the repository rename → `05-architecture/decisions/records/ADR-010-sales-on-mongodb.md` Decision 6
- Saga store → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`
- Current deployment → `05-architecture/deployment.md` §3–§6, §9
- Data model and credentials → `06-data/models.md`, principle 6
- Known limitation on cross-domain reads → `02-domain/entities-and-rules.md`
