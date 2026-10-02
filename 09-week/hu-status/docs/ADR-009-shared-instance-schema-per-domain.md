# ADR-009 — Shared Instance with Schema-per-Domain Isolation

| Field | Value |
|-------|-------|
| **ID** | ADR-009 |
| **Date** | 2026-09-28 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — Tech Lead |
| **Reviewers** | Jordan Ramirez Gallego, Sergio Andrés Ordóñez Díaz, Fredman Santiago Plazas Artunduaga — Development team |
| **Modifies** | ADR-005 Decision 1 (One database instance per domain); ADR-007 Decision 1 (workflow's own PostgreSQL instance) |

---

## Context

ADR-005 Decision 1 replaced the shared instance of ADR-001 §2 with **one PostgreSQL instance per domain**, each with its own volume and health check, defined in the `deploy/compose.yml` of its `-db` repository. The dominant criterion was to eliminate the single point of failure and make isolation come from the deployment, not from permissions.

That decision was documented but **no database container has been built yet**. While preparing the implementation, the team identified three problems:

1. **Operational cost disproportionate to the system's volume.** Four domain instances plus the workflow's produce 15 PostgreSQL containers across three environments (develop, qa, main). Each one needs its own volume, its credential pair and its health check. For a system where all five database-backed services run on the same developer's machine, the memory and configuration that consumes is not justified by the data volume SynkroTech handles.

2. **The system's real isolation no longer depends on the database.** With ADR-006, every service validates the JWT by itself and accepts internal calls only with a valid service token. With ADR-005 Decisions 3 and 4, each domain has its own credentials, its own roles (`<domain>_reader`, `<domain>_writer`) and its own idempotency table. An incorrect `GRANT` is still a risk, but it is a configuration risk, not an architectural one — and it is verified in CI.

3. **`synkro-infra` is already the central composition point.** The repository structure establishes that `-infra` assembles the complete system. Having each `-db` define its own instance contradicts that principle: the instance belongs to the environment's infrastructure, not to an individual domain.

**Constraints:**
- ADR-005 is immutable; this ADR replaces only its Decision 1.
- Decisions 2 (Flyway), 3 (schema conventions and money in minor units), 4 (idempotency keys) and 5 (no `sales_summary`) **remain in force** — nothing in this ADR changes them.
- Local development runs on Docker Compose, on the team members' machines.
- The three environments (develop, qa, main) require the same database topology.

---

## Options

### Option A — Keep one instance per domain (ADR-005 Decision 1 as it is)

Four PostgreSQL instances in each environment, each defined in its `-db`.

- **Pros:** the strongest possible isolation at the engine level; no need to change the documentation already written.
- **Cons:** 12+ database containers in total; high memory on development machines; each `-db` defines the instance even though `-infra` is the composition point; operational complexity exceeds the benefit for the system's volume.

### Option B — One instance per environment, one schema per domain

A single PostgreSQL instance per environment (develop, qa, main), defined and started by `synkro-infra`. Each domain has its own schema (`auth_schema`, `customers_schema`, `products_schema`, `sales_schema`), with its own roles and permissions. Each `-db` owns the migrations for its schema; it does not define the instance.

- **Pros:** one database container per environment instead of four; the `-db` focuses on what it owns (the schema); `-infra` is the only one that defines the instance; per-domain credentials and roles (ADR-005 Decision 3) stay the same.
- **Cons:** single point of failure at the engine level: if the instance goes down, all four domains go down; isolation depends on correct `GRANT`s.

---

## Decision

**We decided: Option B.** One PostgreSQL instance exists per environment, defined and started by `synkro-infra`. Each domain's data lives in its own schema; no table resides in `public`.

```
PostgreSQL instance (1 per environment)
└── Database: synkro_<environment>
    ├── auth_schema        → synkro-auth-db owns migrations
    ├── customers_schema   → synkro-customers-db owns migrations
    ├── products_schema    → synkro-products-db owns migrations
    ├── sales_schema       → synkro-sales-db owns migrations
    └── workflow_schema    → synkro-workflow owns migrations
```

Concrete rules:

- `synkro-infra` defines the instance in its `compose.yml`: pinned image, volume, health check and an init script that creates the empty schemas and the `NOLOGIN` roles of each domain.
- Each `-db` repository carries, in its `deploy/compose.yml`, **only the migration runner** (Flyway), configured to point to the environment's instance via `FLYWAY_URL`. It does not define any `postgres` service.
- Each service connects to the environment's instance with credentials that only give it access to its own schema (`<domain>_writer`). No service has `GRANT` on another schema.
- An identifier from another domain (for example `customer_id` in `sale`) is stored as a UUID **without** a foreign key and is verified through the owning domain's API — this does not change from ADR-005.
- The CI check of each `-db` (rebuild from scratch, full rollback and rebuild) runs against an ephemeral instance of its own, not against the environment's instance.

### The workflow's saga store also enters the shared instance

ADR-007 Decision 1 assigned `synkro-workflow` its own PostgreSQL instance (`workflow-db`) to persist saga state. The `saga_instance` table is internal state of the orchestrator, not a business domain; ADR-007 chose PostgreSQL over SQLite to share the engine and migration conventions with the rest of the system.

With the shared-instance model, keeping a separate instance only for the workflow is inconsistent: if the business data of all four domains shares an engine, the internal state of a single table does not justify its own container, volume and credential pair.

`workflow_schema` enters the environment's shared instance under the same rules:

- `synkro-workflow` is the only service that connects to that schema, with its own credentials (`workflow_writer`).
- The schema's migrations continue to live inside the `synkro-workflow` repository, under `db/`, with the same Flyway layout (ADR-005 Decision 2).
- The `-infra` init script creates `workflow_schema` and its roles alongside those of the four domains.
- This reduces the database containers from 2 per environment (the shared domain instance + workflow-db) to 1.

### The following decisions of ADR-005 remain unchanged

| Decision | Title | Status |
|----------|-------|--------|
| Decision 2 | Migrations owned by each `-db` repository, with Flyway | In force |
| Decision 3 | Schema conventions and money in minor units | In force |
| Decision 4 | Idempotency keys stored in each domain database | In force — "domain database" reads as "domain schema" |
| Decision 5 | `sales_summary` is not created | In force |

---

## Dominant criterion

**Operational cost proportional to the system's actual scale.** The SynkroTech MVP runs on Docker Compose on the developers' machines. Four PostgreSQL instances per environment consume memory and configuration that are not justified when the real isolation between domains is already guaranteed by per-schema credentials (ADR-005 Decision 3), per-service token validation (ADR-006), and the absence of foreign keys between domains.

---

## Accepted cost

- **Single point of failure at the engine level.** If the PostgreSQL instance of an environment goes down, all four domains become unreachable. AT-002 in `overview.md`, which ADR-005 had closed, is reopened as an accepted risk.
- **Isolation depends on permissions, not on the deployment.** An incorrect `GRANT` would let a service read or write in another domain's schema. Mitigation: roles and permissions are defined in the `03_dcl/` migrations of each `-db` and are verified by the CI rebuild check.
- **Each `-db` can no longer be started in complete isolation.** It needs the environment's instance to migrate; in CI it uses its own ephemeral instance.

---

## Consequences

**What changes in the system:**
- One PostgreSQL instance per environment replaces the four domain instances and `workflow-db`. `synkro-infra` defines and starts it with 5 schemas; the `-db` repositories and `synkro-workflow` only migrate it.
- The `deploy/compose.yml` of each `-db` loses the `postgres` service with its volume and health check; it keeps only the migration runner pointing to the environment's instance. `synkro-workflow` loses `workflow-db` from its `deploy/compose.yml` and keeps only its migration runner.
- AT-002 ("Single PostgreSQL instance is a single point of failure") is reopened in `overview.md` as an accepted risk.
- Credentials remain per domain/service (two pairs: owner and app), but they point to the same instance.

**What must be watched:**
- That the `GRANT`s of each `-db` are correct: the CI rebuild check must verify that the `<domain>_writer` role only has access to its own schema.
- That the `-infra` init script creates the schemas and roles before any migration runner attempts to connect.
- Connection consumption: if the four services + the workflow + the worker saturate the shared instance's pool, a per-service connection limit is needed (`max_connections` partitioned by role or with PgBouncer).

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| `05-architecture/deployment.md` | §4: one instance per environment with 5 schemas; compose.yml example without a postgres service in the `-db`. §6: credential context. §9: startup script narrative (HU-DOCS-55) |
| `06-data/models.md` | Header and principle 1: "Schema per domain" (HU-DOCS-55) |
| `05-architecture/overview.md` | P2: "Schema per Domain in a Shared Instance". §4: Database column in the catalog. AT-002: reopened. Mermaid C4 diagram (HU-DOCS-65) |
| `05-architecture/security-threat-model.md` | Scope, T-3, D-3, E-3: schema-level isolation (HU-DOCS-56) |
| `00-governance/security-policy.md` | Credential context per schema (HU-DOCS-56) |
| `05-architecture/cross-cutting.md` | Health check: shared instance (HU-DOCS-56) |
| `08-uml/diagrams/source/c4-02-containers.drawio` | 1 database container with 5 schemas (HU-DOCS-69) |
| `08-uml/diagram-index.md` | ERD rows per schema (HU-DOCS-69) |
| `09-microservices/service-catalog.md` | DB column: "shared instance — schema `<domain>_schema`" (HU-DOCS-70) |
| `04-requirements/non-functional.md` | NFR-007: schema-level isolation (HU-DOCS-66) |
| `01-context/overview.md`, `01-context/scope.md` | Stack table and technology constraints (HU-DOCS-65) |
| `15-project-control/tech-backlog.md` | AT-002 reopened record (HU-DOCS-64) |
| `05-architecture/decisions/README.md` | ADR-009 row; ADR-005 marked with "Decision 1 → ADR-009"; ADR-007 marked with "Decision 1 (own instance) → ADR-009" (this PR) |
| ADR-005, ADR-007 | **No changes**: immutable |

---

## Immutability rule

Once this ADR is `Accepted`, it is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

---

## References

- Original shared-instance decision → `05-architecture/decisions/records/ADR-001-architecture.md` §2
- Instance per domain (superseded) → `05-architecture/decisions/records/ADR-005-data-isolation-per-domain.md` Decision 1
- Schema conventions, Flyway, minor units, idempotency keys → ADR-005 Decisions 2–5 (in force)
- Per-service token validation and service tokens → ADR-006
- Workflow store and worker → ADR-007
- Cross-cutting repository stack → ADR-008
- Deployment topology → `05-architecture/deployment.md`
- Data model → `06-data/models.md`
