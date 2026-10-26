# Microservices Catalog

> The complete inventory of system services. One row per service in the
> registry, one card per service in the detail section. This document
> is the executive view — for deployment topology and compose files see
> `05-architecture/deployment.md`; for the data model of each schema
> see `06-data/models.md`.

---

## Services map

```text
Browser -> synkro-front :5173 (Host + four independently loaded portal assets)
              -> synkro-api-gateway :8000 (public API entry)
                   -> Auth / Customers / Products / Sales APIs :8080
                   -> Workflow :8080
Workflow -> Customers (validate), Products (reserve/release), Sales (register)
Worker: scheduler/placeholder; intended Products calls are NOT delivered
Auth / Customers / Products / Workflow -> own schema in one PostgreSQL instance
Sales -> sales database in one authenticated MongoDB rs0 instance
```

The browser's shared Host client calls the Gateway; portals have no independent API client/token owner. Internal Workflow calls use its SERVICE token directly, never a cross-domain store. Three portals are React federated remotes; Customers is an Angular custom element with ShellContract v1. A single database instance per engine/environment is the topology definition, not proof of a provisioned persistent environment.

**Week 12 snapshot, 2026-10-25:** all 18 owner main heads were read. Component source/tag delivery, a candidate integration run and a deployed/accepted environment are distinct states. Infra PostgreSQL main/qa remains scaffold; full composition is an open candidate. The [release record](../10-devops/releases/2.0.0.md) owns exact tags/revisions/CI/pins and remaining gates; this catalog does not duplicate that ledger.

---

## Service registry

| # | Service | Responsibility | Technology | Port | Database | Repository | Status |
|---|---------|---------------|------------|------|----------|------------|--------|
| 01 | [synkro-auth-api](services/01-auth-api/README.md) | Login, ADMIN-only registration, refresh/logout, service tokens, initial ADMIN CLI | Java/Spring Boot | 8080 internal | auth_schema / auth_app | synkro-auth-api | Delivered component v2.0.0; stateless-JWT limits and TD-009 remain |
| 02 | [synkro-customers-api](services/02-customers-api/README.md) | Customer lifecycle/lookup with preserved identity document | Java/Spring Boot | 8080 internal | customers_schema / customers_app | synkro-customers-api | Delivered component v2.0.0; correlated request/error logging gap owner #15 |
| 03 | [synkro-products-api](services/03-products-api/README.md) | Catalog/categories, stock adjustments/reservations/alert API | Go | 8080 internal | products_schema / products_app | synkro-products-api | Delivered component v2.0.0; health/schema gaps TD-017/018 and legacy receipt limit remain |
| 04 | [synkro-sales-api](services/04-sales-api/README.md) | Saga-only sale write, history/detail and report endpoints | Go | 8080 internal | MongoDB sales / sales_app | synkro-sales-api | Delivered component v2.0.0; TD-012 lifecycle and owner-pin/root wiring gates remain |
| 05 | [synkro-api-gateway](services/05-api-gateway/README.md) | Public API routing, presence check, limits/CORS/correlation | NGINX | 8000 published | None | synkro-api-gateway | Delivered component v2.0.0; not the JWT authority or proof of all-store health |
| 06 | [synkro-workflow](services/06-workflow/README.md) | Durable register-sale orchestration/replay/evidence-based recovery | Java/Spring Boot | 8080 internal | workflow_schema / workflow_app | synkro-workflow | Delivered component v2.0.0; TD-014/015/016 and root acceptance remain |
| 07 | [synkro-worker](services/07-worker/README.md) | Delivered scheduler; required low-stock business job still missing | Go | None | None | synkro-worker | Partial foundation on main, no v2.0.0 tag; TD-019/020 open |

**Statuses describe source/component delivery, not running production.** None of these rows alone grants full requirement acceptance. Owner/store structure remains in [models](../06-data/models.md) and [contracts](../07-api/contracts/openapi/). HTTP owners use internal 8080; Gateway publishes 8000, Host 5173; selected portal containers use internal 80. The tagged Products Portal publishing 5175 is excluded from the root candidate selection. [Deployment](../05-architecture/deployment.md) owns exposure details and monitoring loopback ports.

---

## Frontend and shared repositories

| Repository | Pairs with | Type | Branches |
|------------|------------|------|----------|
| `synkro-auth-portal` | `synkro-auth-api` | React remote (Module Federation) | `main/qa/develop` |
| `synkro-customers-portal` | `synkro-customers-api` | Angular 21, mounted as a custom element in the host (ADR-011) | `main/qa/develop` |
| `synkro-products-portal` | `synkro-products-api` | React remote | `main/qa/develop` |
| `synkro-sales-portal` | `synkro-sales-api` | React remote | `main/qa/develop` |
| `synkro-front` | all 4 portals | Frontend host: session, HTTP client, navigation | `main/qa/develop` |
| `synkro-auth-db` | `synkro-auth-api` | Flyway migrations for `auth_schema` | `main/qa/develop` |
| `synkro-customers-db` | `synkro-customers-api` | Flyway migrations for `customers_schema` | `main/qa/develop` |
| `synkro-products-db` | `synkro-products-api` | Flyway migrations for `products_schema` | `main/qa/develop` |
| `synkro-sales-db` | `synkro-sales-api` | Liquibase migrations for the `sales` database (MongoDB, ADR-010) | `main/qa/develop` |
| `synkro-infra-postgres` | PostgreSQL owners and full-root candidate | PostgreSQL/bootstrap, composition and observability; main/qa scaffold, develop/candidates contain runtime | `main/qa/develop` |
| `synkro-infra-mongo` | `synkro-sales-api` | MongoDB instance, bootstrap script (ADR-010) | `main/qa/develop` |
| `synkro-docs` | — | Documentation repository, outside the 18-code-repository count | `main` with `docs/*` work branches |

---

## Detail per service

> The seven numbered service folders linked above now contain README, data-model, events, decisions and runbook records following the existing template. Their owner is the development team, as recorded in domain-map.md; AsolanoT coordinates this documentation and JordanRG420 is its requested peer reviewer. These are coordination references, not invented permanent on-call assignments or approvals. `_template/` and `services/_example-*` remain visibly generic examples; they are not adopted service records, Redis deployments or event contracts.

### 01 — `synkro-auth-api`

| Field | Value |
|-------|-------|
| **Responsibility** | Manages the identity of SynkroTech SAS's internal users: credentials, roles, JWT (RS256) issuance, refresh tokens, and service-token issuance |
| **Type** | Supporting service (cross-cutting identity, not a core business process) |
| **Technology** | Java/Spring Boot — core (domain/application), adapters and app runtime modules; build/coverage modules do not create extra services |
| **Port** | 8080 |
| **DB** | PostgreSQL, shared instance — schema `auth_schema`, own service user `auth_app`, member of role `auth_writer` (ADR-009, ADR-012) |
| **Bounded Context** | `02-domain/domain-map.md` → Authentication and Users |
| **Externally exposed** | Via the gateway only. The only holder of the RS256 private key |
| **Contract** | `07-api/contracts/openapi/synkro-auth-api.yaml` |

**Delivered boundary:** Auth portal login is implemented, while `/users` and `/service-tokens` administration screens are placeholder UI. InitialAdminCli is an operator entry point, not browser recovery. ADR-013 Option A and ADR-016/017 are Accepted; Q-005 is external confirmation only.

**Key behavior:** issues JWTs and service tokens. Every other service validates the JWT locally with the public key (ADR-006) — no runtime call to this service per request. Service tokens are issued to an ADMIN and carry scoped permissions.

---

### 02 — `synkro-customers-api`

| Field | Value |
|-------|-------|
| **Responsibility** | Register, update, query, and deactivate customers. Lookup by identity document for the point-of-sale flow |
| **Type** | Core service |
| **Technology** | Java/Spring Boot — core (domain/application), adapters and app modules |
| **Port** | 8080 |
| **DB** | PostgreSQL, shared instance — schema `customers_schema`, own service user `customers_app`, member of role `customers_writer` (ADR-009, ADR-012) |
| **Bounded Context** | `02-domain/domain-map.md` → Customers |
| **Externally exposed** | Via the gateway. Called internally by `synkro-workflow` (saga step 1: validate-customer) |
| **Contract** | `07-api/contracts/openapi/synkro-customers-api.yaml` |

**Note:** `synkro-customers-api` is unaffected by its portal's frontend framework — `synkro-customers-portal` is Angular (ADR-011), but the service itself is the same Java/Spring Boot shape as every other domain API and exposes the same REST contract.

---

### 03 — `synkro-products-api`

| Field | Value |
|-------|-------|
| **Responsibility** | Product catalog, categories, manual stock adjustments, stock reservations (saga step 2) and low-stock alert API/state (intended Worker job missing) |
| **Type** | Core service |
| **Technology** | Go — delivered cmd/ and internal/ domain/application/adapter structure |
| **Port** | 8080 |
| **DB** | PostgreSQL, shared instance — schema `products_schema`, own service user `products_app`, member of role `products_writer` (ADR-009, ADR-012) |
| **Bounded Context** | `02-domain/domain-map.md` → Products and Inventory |
| **Externally exposed** | Via the gateway (`/api/v1/products/*`, `/api/v1/stock-alerts/*`). Called internally by `synkro-workflow` (saga step 2: reserve-stock, compensation: release-stock) and, in the intended design only, by `synkro-worker` (business job missing) |
| **Contract** | `07-api/contracts/openapi/synkro-products-api.yaml` |

**Key behavior:** stock changes only through a reservation (saga) or a manual adjustment (INVENTORY/ADMIN). A reservation decreases stock for every line in one transaction; releasing restores it idempotently. At most one OPEN alert per product (partial unique index).

---

### 04 — `synkro-sales-api`

| Field | Value |
|-------|-------|
| **Responsibility** | Persists sales registered by the saga (step 3), serves sale queries and three report endpoints (daily, monthly, top-products) |
| **Type** | Core service |
| **Technology** | Go — delivered cmd/ and internal/ domain/application/adapter structure |
| **Port** | 8080 |
| **DB** | MongoDB, own instance — database `sales`, own service user `sales_app`, member of role `sales_writer` (ADR-010); the only domain not on the shared PostgreSQL instance |
| **Bounded Context** | `02-domain/domain-map.md` → Sales |
| **Externally exposed** | Via the gateway for reads and reports. Called internally by `synkro-workflow` (saga step 3: register-sale with `sales:register` permission). Makes no outgoing calls to other domain services |
| **Contract** | `07-api/contracts/openapi/synkro-sales-api.yaml` |

**Key behavior:** `POST /api/v1/sales` requires the workflow's service token with `sales:register` — not directly accessible from the frontend. `createdBy` comes from the saga's validated person token (ADR-002, ADR-006). SALESPERSON sees only own sales on GET endpoints. Each sale and its lines are stored as one document, with a field-level idempotency key (ADR-010 Decision 3); reports are MongoDB aggregation pipelines over that collection — there is no `sales_summary` table or collection (ADR-005 Decision 5, ADR-010 Decision 4).

---

### 05 — `synkro-api-gateway`

| Field | Value |
|-------|-------|
| **Responsibility** | Single external entry point: checks that a credential is present (does not validate the JWT), routes to the target service, applies rate limiting, CORS and correlation ID |
| **Type** | Infrastructure service |
| **Technology** | NGINX (ADR-008 Decision 1) |
| **Port** | 8000 (published to the host) |
| **DB** | — (stateless) |
| **Externally exposed** | Yes — the only published API entry point; Host/observability exposure remains separately defined |
| **Contract** | Route configuration in `synkro-api-gateway` repository |

**Key behavior:** does NOT validate the JWT — each downstream service validates locally (ADR-006). Does not forward `X-User-Id` or `X-User-Roles` headers — identity comes only from the validated token inside each service. CORS is configured once here for `synkro-front`'s origin only (cross-cutting.md §6). Its routing is identical regardless of which engine or frontend framework sits behind a path.

---

### 06 — `synkro-workflow`

| Field | Value |
|-------|-------|
| **Responsibility** | Register-sale coordination: validate Customer, reserve all stock/frozen prices, register Sale; release only when justified |
| **Type** | Orchestrator, not a fifth business bounded context |
| **Technology** | Java/Spring Boot, domain/application ports plus infrastructure adapters |
| **Port** | 8080 internal |
| **DB** | workflow_schema on shared PostgreSQL, workflow_app; own db/ migrations |
| **Externally exposed** | Gateway /api/v1/sagas; person JWT at entry, SERVICE token to participants |
| **Contract** | [Workflow OpenAPI](../07-api/contracts/openapi/synkro-workflow.yaml) |

**Key behavior:** durable state/attempts and original operation identity survive interruption. Equivalent authorized replay returns existing execution; caller/input checks precede disclosure. Accepted ADR-015 modifies ADR-007 Decisions 1/2/4: validated operation-specific rejection can justify compensation, ambiguous outcomes retain reservations and may suspend execution. A RUNNING status is not a promise that all work automatically resumes. COMPLETED, COMPENSATED and FAILED have distinct evidence/attention paths. TD-014 lock partition rollout, TD-015 Circuit Breaker and TD-016 retry/jitter remain implementation gaps, not waived by acceptance of the decision. [Service record](services/06-workflow/README.md).

---

### 07 — `synkro-worker`

| Field | Value |
|-------|-------|
| **Responsibility** | Current sequential scheduler invokes a logging placeholder; intended low-stock automation remains required FR-004 scope |
| **Type** | Background scheduler foundation, not a completed inventory business process |
| **Technology** | Go; scheduler adapter/configuration and signal shutdown |
| **Port** | None; no HTTP/health endpoint |
| **DB** | None; no own store or migrations |
| **Externally exposed** | No route; intended Products SERVICE calls are not implemented |
| **Contract** | Consumes Products contract when the real job is implemented; no new event/API contract |

**Key behavior:** ticks every LOW_STOCK_EVERY (default 15m), sequentially, with a cooperative RUN_TIMEOUT (2m). The delivered placeholder produces logs without creating/resolving alerts. A panic can end the process; context cancellation cannot stop an uncooperative job. No per-business-run correlation, hard termination, automatic alert recovery or broker consumption is inferred. No v2.0.0 tag is present. [TD-019/020](../15-project-control/technical-backlog.md#td-019--deliver-the-required-low-stock-worker-job) and [service record](services/07-worker/README.md) own follow-up.

---

## Service communication matrix

| Source | Destination | Channel | Auth | Description |
|--------|-------------|---------|------|-------------|
| Host shared client (browser) | `synkro-api-gateway` | HTTP :8000 | Public login/refresh, otherwise person JWT | All browser API traffic; portal assets load through Host delivery |
| `synkro-api-gateway` | `synkro-auth-api` | HTTP :8080 | Login/refresh public; protected routes forward credential | `/api/v1/auth/*`; Auth validates/authorizes |
| `synkro-api-gateway` | `synkro-customers-api` | HTTP :8080 | Forwarded JWT | `/api/v1/customers/*` |
| `synkro-api-gateway` | `synkro-products-api` | HTTP :8080 | Forwarded JWT | `/api/v1/products/*`, `/api/v1/stock-alerts/*` |
| `synkro-api-gateway` | `synkro-sales-api` | HTTP :8080 | Forwarded JWT | `/api/v1/sales/*` |
| `synkro-api-gateway` | `synkro-workflow` | HTTP :8080 | Forwarded JWT | `/api/v1/sagas/*` |
| `synkro-workflow` | `synkro-customers-api` | HTTP :8080 | Workflow service token | Step 1: validate-customer |
| `synkro-workflow` | `synkro-products-api` | HTTP :8080 | Workflow service token | Step 2: reserve-stock / release-stock (compensation) |
| `synkro-workflow` | `synkro-sales-api` | HTTP :8080 | Workflow service token | Step 3: register-sale |
| `synkro-worker` | `synkro-products-api` | Intended HTTP :8080, not delivered | Intended Worker SERVICE token | Required low-stock job missing; current placeholder makes no call |

**No message broker in the MVP** — ADR-007 Decision 5 deferred RabbitMQ until an event has a consumer that a requirement needs (see `technical-backlog.md` TD-002).

**JWT validation:** every service validates the JWT locally with `synkro-auth-api`'s public key (ADR-006). The gateway only checks that a credential is present — it does not validate the token, and no `X-User-Id` or `X-User-Roles` headers are forwarded.

---

## Correlations

- Deployment topology, compose files and startup → `05-architecture/deployment.md`
- Data model per store → `06-data/models.md`
- OpenAPI contracts → `07-api/contracts/openapi/`
- Architecture overview and C4 → `05-architecture/overview.md` §3, §4
- Saga, stock reservations and stock alerts → ADR-007
- Token validation and service tokens → ADR-006
- Technology stack decisions → ADR-008
- Schema-per-domain isolation → ADR-009
- Sales domain on MongoDB, infra repository naming → ADR-010
- Angular Customers portal → ADR-011
- Instance bootstrap and service users → ADR-012
- Security policy and RBAC → `00-governance/security-policy.md`
- Bounded contexts → `02-domain/domain-map.md`
- Who owns each entity → `09-microservices/data-ownership-matrix.md`
- How services call each other → `09-microservices/communication-patterns.md`
- Criteria for where a responsibility belongs → `09-microservices/service-boundary-rules.md`
- Runtime and repository dependency graphs → `09-microservices/dependency-map.md`
