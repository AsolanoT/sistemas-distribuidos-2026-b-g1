# ADR-008 — Technology Stack of the Cross-Cutting Repositories

| Field | Value |
|-------|-------|
| **ID** | ADR-008 |
| **Date** | 2026-09-27 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — Tech Lead |
| **Reviewers** | Jordan Ramirez Gallego, Sergio Andrés Ordóñez Díaz, Fredman Santiago Plazas Artunduaga — Development team |
| **Modifies** | None. It decides the technology that ADR-003 left undecided, and pins the versions of the stack fixed in ADR-001 |

---

## Context

ADR-001 fixed Java with Spring Boot for Auth and Customers, Go for Products and Sales, and React for the frontend. ADR-003 added four cross-cutting repositories — `synkro-api-gateway`, `synkro-workflow`, `synkro-worker` and `synkro-front` — but left their technology open: `09-microservices/service-catalog.md` lists the gateway, the workflow and the worker with no technology and "PORT_TBD", and `05-architecture/deployment.md` repeats the gap.

This blocks three things:

1. **Scaffolding.** None of the four repositories can be started without knowing its language, framework and structure.
2. **The decisions already taken.** ADR-006 needs a gateway that only checks that a credential is present, without custom code. ADR-007 needs a workflow that persists state transactionally and a worker that runs a scheduled job.
3. **Consistency between repositories.** No document pins versions, so each repository could start on a different Java, Go or Node release.

**Constraints:**
- The backend uses Java and Go; the frontend uses React (ADR-001).
- The team knows Spring Boot best on the Java side (`01-context/overview.md`, "Alternatives Considered").
- The gateway is the system's single entry point (ADR-003 Decision 1).
- Every Java service follows the same hexagonal structure, with the domain core free of framework dependencies (ADR-001 §3).

---

## Decision 1 — Gateway: declarative NGINX

### Options

**Option A — NGINX with declarative configuration.**
- **Pros:** no code to write, test or maintain; routing, rate limiting, CORS and error pages are standard configuration; small image.
- **Cons:** cannot host business logic; validating a JWT signature would need extra modules.

**Option B — Spring Cloud Gateway (Java).**
- **Pros:** filters in Java; could validate tokens itself.
- **Cons:** a full Java service to build, test and run just to route requests.

**Option C — A custom gateway in Go.**
- **Pros:** full control.
- **Cons:** reimplements routing, rate limiting and CORS by hand; one more codebase to test.

### Decision

**We decided: Option A.** `synkro-api-gateway` is NGINX (official image, fixed version tag) with declarative configuration:

- One route file per domain. Routes use the versioned prefix and resolve the target service by name on every request, so the gateway starts even when a service is down:

| Route prefix | Target |
|---|---|
| `/api/v1/auth/` | `synkro-auth-api` |
| `/api/v1/customers/` | `synkro-customers-api` |
| `/api/v1/products/`, `/api/v1/stock-alerts/` | `synkro-products-api` |
| `/api/v1/sales/` | `synkro-sales-api` |
| `/api/v1/sagas/` | `synkro-workflow` |

- Stock reservations are not routed: only the workflow calls them, over the internal network, with its service token (ADR-006, ADR-007).
- On protected routes, the gateway only checks that an `Authorization` header is present (ADR-006). Public routes (login, refresh, `/health`) are listed explicitly.
- It reuses the incoming `X-Correlation-Id` or generates one, and forwards it.
- Rate limiting answers `429` with `Retry-After`. The gateway's own errors (`401`, `404`, `429`, `502`, `503`, `504`) use the common error envelope, never NGINX's default HTML pages.
- CORS is configured here, only for the origins of `synkro-front` and the portals.
- It publishes port `8000`, the only port of the system published to the host. Smoke tests in CI check every route and every gateway error.

### Dominant criterion

**No custom code where configuration is enough.** The gateway routes and protects the edge; everything that needs logic lives in the services.

### Accepted cost

- NGINX cannot host business logic. Any future need that configuration cannot express requires a new ADR, not custom code in the gateway.

---

## Decision 2 — `synkro-workflow`: Java 21 with Spring Boot 3.5

### Options

**Option A — Java 21 with Spring Boot 3.5.**
- **Pros:** transaction management for saving saga state after every step; Flyway integration for `workflow-db`; the team's strongest Java framework; keeps a balanced split of three Java and three Go services.
- **Cons:** heavier build and slower startup than Go; three Maven modules to maintain.

**Option B — Go.**
- **Pros:** small binary, fast startup.
- **Cons:** transactions, retries and resumption written by hand; four of the six backend services would be in Go.

### Decision

**We decided: Option A.** `synkro-workflow` uses Java 21 and Spring Boot 3.5, in three Maven modules:

- `-core`: domain and use cases, with no framework dependency;
- `-adapters`: HTTP input, the HTTP clients to the participants and persistence in `workflow-db`;
- `-app`: the Spring Boot application that wires everything together.

`workflow-db` is migrated with Flyway (ADR-007).

### Dominant criterion

**Team knowledge and transactional support for a stateful orchestrator**, while keeping three services in each backend language.

### Accepted cost

- A heavier build and a slower startup than a Go service, and a three-module structure for one component.

---

## Decision 3 — `synkro-worker`: Go

### Options

**Option A — Go, with the standard library.**
- **Pros:** a scheduled loop and an HTTP client need no framework; small memory footprint for a process that runs all the time.
- **Cons:** retries and backoff are written by hand.

**Option B — Java with Spring Boot and its scheduler.**
- **Pros:** scheduling and retries provided by the framework.
- **Cons:** a full JVM process running all the time for one job every few minutes.

### Decision

**We decided: Option A.** `synkro-worker` is written in Go with the standard library: a scheduler as its input adapter, and an HTTP client to `products-api` as its output adapter. It exposes no business interface.

### Dominant criterion

**The lightest process that can run a bounded, scheduled job**, with no framework to learn or maintain for it.

### Accepted cost

- Backoff, jitter and the run timeout are implemented by hand, and must be covered by the worker's tests.

---

## Decision 4 — `synkro-front` and the portals: React 19 with Module Federation

### Options

**Option A — Module Federation: `synkro-front` is the host and each portal is a remote loaded at runtime.**
- **Pros:** each portal builds and deploys on its own; one shared HTTP client and session in the host.
- **Cons:** build configuration is more complex; host and remotes must share compatible library versions.

**Option B — Portals published as packages and bundled into `synkro-front` at build time.**
- **Pros:** simple runtime.
- **Cons:** any portal change requires rebuilding and redeploying the host; portals stop being independently deployable.

**Option C — One single application containing every domain.**
- **Pros:** simplest build.
- **Cons:** the four portal repositories would lose their purpose.

### Decision

**We decided: Option A.** The frontend uses React 19 with TypeScript, built with Vite and Module Federation, on Node 22 LTS:

- `synkro-front` is the host: it owns navigation, the session and the only HTTP client, which talks to the gateway.
- Each `synkro-<domain>-portal` is a remote. It uses the host's HTTP client and session; it never creates its own client and never calls a service directly.
- If a remote fails to load, the host shows an error for that area and keeps the rest of the application working.
- Until the Auth portal exists, a development sign-in accepts a development token. It is enabled only in `develop` and never reaches `main`.

### Dominant criterion

**Each portal stays independently buildable and deployable**, while the whole frontend shares one session and one way of calling the system.

### Accepted cost

- A more complex build configuration, and shared library versions that must stay compatible between the host and the four remotes.

---

## Versions for every repository

| Component | Version |
|---|---|
| Java services (`synkro-auth-api`, `synkro-customers-api`, `synkro-workflow`) | Java 21, Spring Boot 3.5, Maven |
| Go services (`synkro-products-api`, `synkro-sales-api`, `synkro-worker`) | The Go release pinned in each `go.mod`, the same across the three |
| Frontend (`synkro-front`, four portals) | Node 22 LTS, React 19, TypeScript, Vite |
| Gateway | Official NGINX image, fixed version tag |
| Databases and migrations | PostgreSQL and Flyway, fixed image versions (ADR-005) |

These versions add detail to the stack fixed in ADR-001 without changing it. Upgrading a major version is a team decision recorded in a new ADR.

---

## Consequences

**What changes in the system:**
- The technology entries of the gateway, the workflow and the worker stop being "TBD" in the service catalog and the architecture overview.
- Each of the four cross-cutting repositories can be scaffolded with a known language, framework and structure.
- The Java services, including the workflow, share the three-module structure; the Go services share the same release.

**What must be watched:**
- Library versions shared between `synkro-front` and the portals: an incompatible upgrade in one remote can break the host at runtime. Shared libraries are upgraded in every frontend repository in the same release.
- Any request to add logic to the gateway: it is a signal to reopen Decision 1 through a new ADR.

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| `09-microservices/service-catalog.md` | Technology, port and repository of the gateway, workflow and worker (HU-DOCS-70) |
| `05-architecture/overview.md` | Catalog table technology column (HU-DOCS-51) |
| `05-architecture/deployment.md` | Gateway on port `8000` as the only published port; images and versions (HU-DOCS-44, HU-DOCS-45) |
| `05-architecture/cross-cutting.md` | CORS configured at the gateway (HU-DOCS-50) |
| `01-context/overview.md`, `01-context/scope.md` | Stack table and technology constraints (HU-DOCS-65) |
| `05-architecture/hexagonal-architecture.md` | Three Maven modules for Java services; Go layout (HU-DOCS-68) |
| `11-quality/testing-strategy.md` | Tools and CI commands per language; gateway smoke tests; frontend build (HU-DOCS-67) |
| `09-microservices/services/` | Leftover gateway template renamed as an example (HU-DOCS-61) |
| `05-architecture/decisions/README.md` | ADR-008 row (this PR) |

---

## Immutability rule

Once this ADR is `Accepted`, it is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

---

## References

- Backend languages and frontend framework → `05-architecture/decisions/records/ADR-001-architecture.md`
- Cross-cutting repositories → `05-architecture/decisions/records/ADR-003-gateway-saga-async.md`
- Gateway responsibilities and service tokens → ADR-006
- Workflow store and worker job → ADR-007
- Framework comparisons → `01-context/overview.md`, "Alternatives Considered"
- Current technology gaps → `09-microservices/service-catalog.md`, `05-architecture/deployment.md`
