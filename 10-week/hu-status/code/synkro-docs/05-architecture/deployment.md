# Deployment Topology

> Defines how the system is composed and run in each environment. Any developer
> must be able to start the complete system by following only this document and
> the repositories it names.

---

## 1. Overview

```
┌──────────────────────────────── Developer machine ──────────────────────────────────┐
│                                                                                     │
│   Browser ──▶ synkro-front :5173 (published)                                        │
│                 └─ serves the four portals as remotes under /remotes/<domain>/      │
│   Browser ──▶ synkro-api-gateway :8000 (published) ── /api/v1/...                   │
│                                                                                     │
│   ┌──────────────────────────── network: platform ────────────────────────────┐     │
│   │                                                                            │    │
│   │   synkro-auth-api ─────────┐                                               │    │
│   │   synkro-customers-api ────┤                                               │    │
│   │   synkro-products-api ─────┼──▶ synkro-db (PostgreSQL, shared instance)    │    │
│   │   synkro-workflow ─────────┘     ├ auth_schema                             │    │
│   │     │ (saga steps, service token)├ customers_schema                        │    │
│   │     │                            ├ products_schema                         │    │
│   │     │                            └ workflow_schema                         │    │
│   │     │                                                                      │    │
│   │   synkro-sales-api ────────────▶ synkro-mongo (MongoDB, replica set)       │    │
│   │                                  └ database sales                          │    │
│   │                                                                            │    │
│   │   synkro-worker ──(low-stock job, service token)──▶ synkro-products-api    │    │
│   │                                                                            │    │
│   └────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

- Every container joins one network, `platform`. Services and both database instances declare `expose`, never `ports`: they are reachable inside the network and not from outside.
- Only `synkro-api-gateway` and `synkro-front` publish ports to the host, together with the observability tools (§8). A published domain service would let any client skip the gateway, its rate limit and its correlation.
- Two database instances per environment. One PostgreSQL instance holds `auth_schema`, `customers_schema`, `products_schema` and `workflow_schema`, defined and started by `synkro-infra-postgres` (ADR-009). One MongoDB instance holds the `sales` database, defined and started by `synkro-infra-mongo` (ADR-010). Each `-db` repository and `synkro-workflow` own only the migrations of their store. The system has no message broker in the MVP (ADR-007).
- `synkro-infra` was renamed to `synkro-infra-postgres` (ADR-010 Decision 6); the rename is pending the instructor's action on [code-corhuila/synkro-docs#159](https://github.com/code-corhuila/synkro-docs/issues/159). Until it lands, the repository still exists under its current name `synkro-infra`.

---

## 2. Reserved Ports

| Port | Published to the host | Service | Description |
|------|-----------------------|---------|-------------|
| 8000 | Yes | `synkro-api-gateway` | The only entry point to the API |
| 5173 | Yes | `synkro-front` | The web application; serves the portals' remotes |
| 3000 | Yes | Grafana | Dashboards over metrics and logs (§8) |
| 9090 | Yes | Prometheus | Metrics store (§8) |
| 8080 | No | Every `-api`, `synkro-workflow`, each portal | HTTP port inside the network, reached by service name (e.g. `synkro-sales-api:8080`) |
| 5432 | No | `synkro-db` | PostgreSQL shared instance inside the network, reached by service name; holds `auth_schema`, `customers_schema`, `products_schema` and `workflow_schema` |
| 27017 | No | `synkro-mongo` | MongoDB instance (single-node replica set `rs0`) inside the network; holds the `sales` database |

`synkro-worker` listens on no port.

---

## 3. Composition

The repositories are cloned as siblings in one workspace. Each one brings its own `deploy/compose.yml`, and `synkro-infra-postgres` only puts them together:

| Repository | Brings |
|---|---|
| `synkro-infra-postgres` | the `include` list, **the PostgreSQL instance** (`synkro-db`) with its bootstrap script, the `platform` network, one environment file per environment, observability, the development keys and the simulated services of `develop` (§10) |
| `synkro-infra-mongo` | **the MongoDB instance** (`synkro-mongo`): pinned image, single-node replica set, its volume, its health check and the bootstrap that creates `sales_app` |
| `synkro-auth-db`, `synkro-customers-db`, `synkro-products-db` | its Flyway migration runner only (no database service) |
| `synkro-sales-db` | its Liquibase migration runner only (no database service) |
| each `synkro-<domain>-api`, `synkro-worker` | its own service |
| `synkro-workflow` | its service and its Flyway migration runner for `workflow_schema` (no database service) |
| `synkro-api-gateway`, `synkro-front`, each portal | its own service |

```yaml
# synkro-infra-postgres/compose.yml (excerpt)
services:
  synkro-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: synkro
      POSTGRES_USER: ${DB_ADMIN_USER}
      POSTGRES_PASSWORD: ${DB_ADMIN_PASSWORD:?set DB_ADMIN_PASSWORD in the environment file}
      AUTH_APP_PASSWORD: ${AUTH_APP_PASSWORD:?set AUTH_APP_PASSWORD in the environment file}
      CUSTOMERS_APP_PASSWORD: ${CUSTOMERS_APP_PASSWORD:?set CUSTOMERS_APP_PASSWORD in the environment file}
      PRODUCTS_APP_PASSWORD: ${PRODUCTS_APP_PASSWORD:?set PRODUCTS_APP_PASSWORD in the environment file}
      WORKFLOW_APP_PASSWORD: ${WORKFLOW_APP_PASSWORD:?set WORKFLOW_APP_PASSWORD in the environment file}
    volumes:
      - synkro-db-data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
    expose: ["5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_ADMIN_USER} -d synkro"]
    networks: [platform]

include:
  - ../synkro-infra-mongo/compose.yml
  - ../synkro-auth-db/deploy/compose.yml
  - ../synkro-auth-api/deploy/compose.yml
  # … the same pair for customers and products
  - ../synkro-sales-db/deploy/compose.yml
  - ../synkro-sales-api/deploy/compose.yml
  - ../synkro-workflow/deploy/compose.yml
  - ../synkro-worker/deploy/compose.yml
  - ../synkro-api-gateway/deploy/compose.yml
  - ../synkro-front/deploy/compose.yml
  # … each portal

volumes:
  synkro-db-data:
networks:
  platform: { name: platform, external: true }
```

A missing sibling fails visibly when the platform starts; nothing is skipped silently. Each domain can also be started alone from its own repositories. The `platform` network is created once per machine (`docker network create platform`), and every `compose.yml` — including this root one — declares it as external.

The bootstrap script (`synkro-infra-postgres/postgres/init/01-instance.sh`) creates only what belongs to the whole instance: no extension is needed today, and one login user per domain (`auth_app`, `customers_app`, `products_app`, `workflow_app`), each with its `search_path` set to its schema and no privilege of its own. It is idempotent and mounted so it only runs by itself on the first start, when the volume is empty (ADR-012 Decision 1).

```yaml
# synkro-customers-db/deploy/compose.yml (excerpt; exact image tags are pinned in the repository)
services:
  customers-db-migrate:
    image: flyway/flyway:11-alpine
    profiles: [tooling]              # never started by `up`
    depends_on:
      synkro-db: { condition: service_healthy }
    environment:
      FLYWAY_URL: jdbc:postgresql://synkro-db:5432/synkro
      FLYWAY_USER: ${DB_ADMIN_USER}
      FLYWAY_PASSWORD: ${DB_ADMIN_PASSWORD:?set DB_ADMIN_PASSWORD in the environment file}
    volumes: ["../:/workspace:ro"]
    command: ["-workingDirectory=/workspace", "-configFiles=flyway.toml", "migrate"]
    networks: [platform]

networks:
  platform: { external: true }
```

No `-db` repository defines a database service: the PostgreSQL instance belongs to `synkro-infra-postgres`, the MongoDB instance to `synkro-infra-mongo`. The schema and its roles are created only by the `-db`'s own migrations, never by the bootstrap script (ADR-012 Decision 1). Credentials come from the environment file, never committed; no password is written in any repository.

---

## 4. Database Instances

Two instances per environment. Neither is defined by a `-db` repository.

### PostgreSQL (ADR-009, ADR-012)

| Environment | Instance | Database | Schemas | Defined by |
|---|---|---|---|---|
| develop | `synkro-db` | `synkro` | `auth_schema`, `customers_schema`, `products_schema`, `workflow_schema` | `synkro-infra-postgres` |
| qa | `synkro-db` | `synkro` | same | `synkro-infra-postgres` |
| main | `synkro-db` | `synkro` | same | `synkro-infra-postgres` |

| Schema | Migrated by | Used only by | Service user |
|---|---|---|---|
| `auth_schema` | `synkro-auth-db` | `synkro-auth-api` | `auth_app` |
| `customers_schema` | `synkro-customers-db` | `synkro-customers-api` | `customers_app` |
| `products_schema` | `synkro-products-db` | `synkro-products-api` | `products_app` |
| `workflow_schema` | `synkro-workflow` | `synkro-workflow` | `workflow_app` |

### MongoDB (ADR-010)

| Environment | Instance | Database | Migrated by | Used only by | Service user | Defined by |
|---|---|---|---|---|---|---|
| develop | `synkro-mongo` | `sales` | `synkro-sales-db` | `synkro-sales-api` | `sales_app` | `synkro-infra-mongo` |
| qa | `synkro-mongo` | `sales` | same | same | same | `synkro-infra-mongo` |
| main | `synkro-mongo` | `sales` | same | same | same | `synkro-infra-mongo` |

The instance is a single-node replica set (`rs0`) with access control enabled; its bootstrap initiates the replica set and creates `sales_app` on the first start. No other service holds credentials for it.

### Privilege check

After migrating the PostgreSQL instance, this query lists, for every service user, the schemas it can read and write:

```sql
SELECT r.rolname AS service_user, n.nspname AS schema,
       bool_or(has_table_privilege(r.rolname, c.oid, 'SELECT')) AS reads,
       bool_or(has_table_privilege(r.rolname, c.oid, 'INSERT')
            OR has_table_privilege(r.rolname, c.oid, 'UPDATE')
            OR has_table_privilege(r.rolname, c.oid, 'DELETE')) AS writes
FROM pg_roles r
JOIN pg_class c ON c.relkind = 'r'
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE r.rolname LIKE '%\_app'
  AND n.nspname NOT LIKE 'pg\_%' AND n.nspname <> 'information_schema'
  AND has_schema_privilege(r.rolname, n.nspname, 'USAGE')
GROUP BY 1, 2
HAVING bool_or(has_table_privilege(r.rolname, c.oid, 'SELECT'))
ORDER BY 1, 2;
```

Expected: exactly one row per service user, its own schema, with `writes = true`. Any other row is a defect in a grant migration (ADR-012 Decision 2).

---

## 5. Migrations

- The store of each domain lives **only** in its `-db` repository (ADR-005 Decision 2, ADR-010 Decision 5). Services never run migrations at startup.
- A migration is applied **before** deploying the service version that needs it; a breaking change is split into two releases (expand, then contract).
- Each runner uses a pinned image, waits for its instance to be healthy, mounts its repository read-only and never starts with the platform. Runners connect with the instance administrator's credentials; nothing else uses them (ADR-012 Decision 2).
- Each `-db` keeps its own migration history inside its own schema or database — never shared between repositories (ADR-012 Decision 4).
- In `qa` and `main`, a backup is taken before migrating, and volumes are never removed (ADR-012 Decision 5).

```bash
# from synkro-infra-postgres, once per schema, and after pulling new migrations
docker compose --env-file env/dev.env run --rm customers-db-migrate            # apply
docker compose --env-file env/dev.env run --rm customers-db-migrate info       # applied and pending versions
docker compose --env-file env/dev.env run --rm customers-db-migrate validate   # checksums of applied migrations
docker compose --env-file env/dev.env run --rm sales-db-migrate                # apply (Liquibase update)
docker compose --env-file env/dev.env run --rm sales-db-migrate status         # pending changesets
```

Running `migrate` a second time applies zero changes.

---

## 6. Configuration

### Environment files

`synkro-infra-postgres/env/` holds one file per environment. Only the example is committed; the real file carries secrets and is ignored by git.

| Environment | Real file | Committed example | `COMPOSE_PROJECT_NAME` |
|---|---|---|---|
| develop | `env/dev.env` | `env/dev.env.example` | `synkro-dev` |
| qa | `env/qa.env` | `env/qa.env.example` | `synkro-qa` |
| main | `env/main.env` | `env/main.env.example` | `synkro-main` |

Every command names its file (`docker compose --env-file env/dev.env …`); there is no default `.env`. Every variable a service reads appears in the example of each environment. In `qa` and `main`, secrets come from the environment's secret store (ADR-012 Decision 3).

### Database credentials

| Credential | Used by | Rights |
|---|---|---|
| `DB_ADMIN_USER` / `DB_ADMIN_PASSWORD` | the PostgreSQL bootstrap and the Flyway runners | administrator of the PostgreSQL instance |
| `AUTH_APP_PASSWORD`, `CUSTOMERS_APP_PASSWORD`, `PRODUCTS_APP_PASSWORD`, `WORKFLOW_APP_PASSWORD` | each service, as `auth_app`, `customers_app`, `products_app` and `workflow_app` | member of `<domain>_writer` only, granted by a `03_dcl` migration of its `-db` |
| `MONGO_ADMIN_USER` / `MONGO_ADMIN_PASSWORD` | the MongoDB bootstrap and the Liquibase runner | administrator of the MongoDB instance |
| `SALES_APP_PASSWORD` | `synkro-sales-api`, as `sales_app` | member of `sales_writer` in the `sales` database |

The name of each service user is fixed; only its password is a secret. No service connects as an administrator (ADR-012 Decision 2, `06-data/models.md` principle 6).

### Variables per service

| Service | Variables |
|---|---|
| `synkro-auth-api` | `SPRING_DATASOURCE_URL=jdbc:postgresql://synkro-db:5432/synkro?currentSchema=auth_schema`, `SPRING_DATASOURCE_USERNAME=auth_app`, `SPRING_DATASOURCE_PASSWORD` (`AUTH_APP_PASSWORD`), `SPRING_FLYWAY_ENABLED=false`, `JWT_PRIVATE_KEY_FILE`, `JWT_PUBLIC_KEY`, `JWT_ACCESS_TOKEN_TTL=3600`, `JWT_REFRESH_TOKEN_TTL=604800`, `SERVICE_TOKEN_TTL=2592000`, `SERVER_PORT=8080` |
| `synkro-customers-api` | `SPRING_DATASOURCE_URL=jdbc:postgresql://synkro-db:5432/synkro?currentSchema=customers_schema`, `SPRING_DATASOURCE_USERNAME=customers_app`, `SPRING_DATASOURCE_PASSWORD` (`CUSTOMERS_APP_PASSWORD`), `SPRING_FLYWAY_ENABLED=false`, `JWT_PUBLIC_KEY`, `SERVER_PORT=8080` |
| `synkro-products-api` | `DATABASE_URL=postgres://products_app:${PRODUCTS_APP_PASSWORD}@synkro-db:5432/synkro?search_path=products_schema&sslmode=disable`, `JWT_PUBLIC_KEY`, `HTTP_PORT=8080` |
| `synkro-sales-api` | `MONGODB_URI=mongodb://sales_app:${SALES_APP_PASSWORD}@synkro-mongo:27017/sales?replicaSet=rs0`, `MONGODB_TIMEOUT=5s`, `MONGODB_MAX_POOL_SIZE=10`, `JWT_PUBLIC_KEY`, `HTTP_PORT=8080` |
| `synkro-workflow` | `SPRING_DATASOURCE_URL=jdbc:postgresql://synkro-db:5432/synkro?currentSchema=workflow_schema`, `SPRING_DATASOURCE_USERNAME=workflow_app`, `SPRING_DATASOURCE_PASSWORD` (`WORKFLOW_APP_PASSWORD`), `SPRING_FLYWAY_ENABLED=false`, `JWT_PUBLIC_KEY`, `SERVICE_TOKEN` (from `WORKFLOW_SERVICE_TOKEN`), `CUSTOMERS_API_URL=http://synkro-customers-api:8080`, `PRODUCTS_API_URL=http://synkro-products-api:8080`, `SALES_API_URL=http://synkro-sales-api:8080`, `HTTP_TIMEOUT=5s`, `HTTP_ATTEMPTS=3`, `SAGA_REQUEST_TIMEOUT=10s`, `SERVER_PORT=8080` |
| `synkro-worker` | `SERVICE_TOKEN` (from `WORKER_SERVICE_TOKEN`), `PRODUCTS_API_URL=http://synkro-products-api:8080`, `LOW_STOCK_EVERY=15m`, `LOW_STOCK_THRESHOLD=5`, `BATCH_SIZE=100`, `RUN_TIMEOUT=2m`, `HTTP_TIMEOUT=5s`, `HTTP_ATTEMPTS=3` |
| `synkro-api-gateway` | `CORS_ALLOWED_ORIGINS=http://localhost:5173`, `RATE_LIMIT_PER_SECOND=10` (burst `20`); upstream names live in its route files, not in variables |
| `synkro-front` | `VITE_API_BASE_URL=http://localhost:8000`, `VITE_DEV_SIGN_IN=true` in `develop` only |

- Every service that receives requests validates tokens with `JWT_PUBLIC_KEY` (ADR-006). `synkro-worker` receives no requests, so it has no public key.
- `JWT_PRIVATE_KEY_FILE` exists only in `synkro-auth-api`. Services with Flyway on the classpath keep it disabled: their schema belongs to their `-db` repository (ADR-005).
- The values above are the `develop` defaults; limits and timeouts are explained in `05-architecture/cross-cutting.md`.

### Development identity

Until the Auth domain issues real tokens, two scripts in `synkro-infra-postgres` provide identity **only in `develop`**:

| Script | What it does |
|---|---|
| `scripts/dev-keys.sh` | Generates a 2048-bit RSA key pair in `keys/`, writes `JWT_PUBLIC_KEY` to `env/dev.env` (PEM on one line, with literal `\n`), and writes `WORKFLOW_SERVICE_TOKEN` and `WORKER_SERVICE_TOKEN` with the permissions of ADR-006 |
| `scripts/dev-token.sh <subject> [minutes]` | Signs an RS256 token for a person, for manual calls and for the frontend's development sign-in |

`keys/`, `*.pem` and `env/*.env` are ignored by git. In `qa` and `main`, the public key and the service tokens are issued by `synkro-auth-api` and stored as environment secrets; development keys never leave `develop`.

---

## 7. Network Isolation

- Every container joins the `platform` network. Services and both database instances declare `expose`, never `ports`, so none of them is reachable from outside the network.
- Isolation limits exposure, but it is **not** what makes a request trustworthy. Every service validates the token itself, ignores any `X-User-*` header, and accepts internal calls only with a valid service token (ADR-006).
- If a domain service were published by mistake, it would still reject every request without a valid token. The mistake itself is caught in review: no `-api`, `-db`, `synkro-workflow` or `synkro-worker` compose file may contain `ports:`.

---

## 8. Observability

| Signal | How it is produced | Where it goes |
|---|---|---|
| Logs | Structured JSON on stdout, one line per request or job run, with `correlationId`, service, route, status and duration; never tokens, passwords or personal data | `docker compose logs`; queried by `correlationId` |
| Metrics | Request count, errors and duration per route; job runs and failures in the worker; exported over OTLP | OpenTelemetry collector → Prometheus → Grafana |
| Traces | One span per request and per outgoing call, with the same `X-Correlation-Id`, exported over OTLP | OpenTelemetry collector (printed by its debug exporter in `develop`) |

- `synkro-infra-postgres/observability/` holds `otel-collector.yaml`, `prometheus.yml` and `grafana-datasources.yaml`.
- Every service sends its telemetry to `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317`, with `OTEL_SERVICE_NAME` set to its repository name.
- A request can be followed across the gateway, the workflow and every participant by its `X-Correlation-Id`, which is also the `traceId` of any error (`05-architecture/cross-cutting.md`).

---

## 9. How to Start Everything from Scratch

```bash
# 0. Once per machine
docker network create platform

# 1. Clone every repository as a sibling of synkro-infra-postgres, then:
cd synkro-infra-postgres
cp env/dev.env.example env/dev.env      # set DB_ADMIN_PASSWORD, MONGO_ADMIN_PASSWORD, every *_APP_PASSWORD
./scripts/dev-keys.sh                   # develop only: key pair, JWT_PUBLIC_KEY, service tokens, into env/dev.env
./scripts/up.sh dev                     # checks env/dev.env, creates the network if missing, starts everything

# 2. Migrate each store (once per -db, and after pulling new migrations)
docker compose --env-file env/dev.env run --rm auth-db-migrate
docker compose --env-file env/dev.env run --rm customers-db-migrate
docker compose --env-file env/dev.env run --rm products-db-migrate
docker compose --env-file env/dev.env run --rm sales-db-migrate
docker compose --env-file env/dev.env run --rm workflow-db-migrate

# 3. Run the privilege check of §4

# 4. Verify
docker compose ps                                        # every service healthy
curl http://localhost:8000/health                        # gateway
curl -H "Authorization: Bearer $(./scripts/dev-token.sh alice)" \
http://localhost:8000/api/v1/customers              # routed and validated by synkro-customers-api
docker compose logs synkro-worker                        # one entry per low-stock run
open http://localhost:3000                               # Grafana
```

- The databases are created once per environment: the bootstrap of each instance runs only when its volume is empty. From then on, starting the environment starts the containers with their data, and step 2 applies only what is pending.
- Until a store is migrated, that domain's API answers `500 INTERNAL_ERROR` and the worker logs the failed run with its `traceId`; the next run works once the migration is applied.
- `qa` and `main` use the same steps with `env/qa.env` or `env/main.env`, without step 1's development keys and with a backup (ADR-012 Decision 5) before step 2.
- To stop: `./scripts/down.sh dev`. Volumes are kept; only `dev` accepts their removal.

---

## Initial administrator creation after Auth migrations (ADR-014)

For a new real environment, after §9 step 2 and the privilege check, the designated
deployment operator runs the initialization CLI supplied by synkro-auth-api before
opening the platform to normal users. Follow
`13-operations/initial-administrator-initialization.md` for inputs and verification.
Use auth_app and the same target database as Auth; no PostgreSQL administrator
credential is consumed. User and audit migrations must exist first.

The CLI is a separate application entry point; it exposes no HTTP route, is not a
startup hook and is not part of the infrastructure bootstrap or migration runner.
Temporary initialization inputs use protected secret files or interactive input;
after success remove them and restrict routine access to the CLI. A current ADMIN,
including an inactive one, produces an unchanged `already initialized` result.

The command's executable packaging is an implementation deliverable: this document
does not claim that a runnable command already exists in the source ZIP. Do not
substitute direct SQL, public register, development tokens or a seed with a default
password. Development simulation remains separate from real initialization.

## 10. Simulated Services (`develop` only)

While a service does not exist yet, the host and the portals are built against a simulation of it generated from its OpenAPI contract, so the frontend depends on the contract and not on invented data.

| Element | Rule |
|---|---|
| What is simulated | Each `-api` and `synkro-workflow` that has no implementation yet |
| Source | Its file in `07-api/contracts/openapi/`, read from the sibling `synkro-docs` repository, mounted read-only |
| How it is reached | The simulation joins `platform` under the network name of the service it stands in for, on port `8080`, so the gateway's routes do not change |
| Where it is enabled | A Compose profile named `mocks`, set only in `env/dev.env`; the `qa` and `main` files never set it |
| When it is removed | In the same pull request that adds the real service to the `include` list |

A simulated service keeps no state (a created resource does not appear in a later list) and does not validate tokens; the gateway still requires a credential to be present.

---

## Correlations

* Schema per domain and shared instance → ADR-009 (supersedes ADR-005 Decision 1); migrations → ADR-005 Decision 2
* Sales domain on MongoDB and infrastructure repository naming → ADR-010
* Instance bootstrap, service users and environment files → ADR-012
* Token validation and service tokens → ADR-006
* Error format, correlation, limits and retries → `05-architecture/cross-cutting.md`
* Workflow store and worker job → ADR-007
* Gateway and frontend technology → ADR-008
* Timeout and retry configuration → `05-architecture/pattern-guide.md` §5
* Data model per domain → `06-data/models.md`
