# Communication Patterns

> How services talk to each other, and why. Every interaction in the MVP is
> synchronous REST/HTTP; there is no message broker (ADR-007 Decision 5).
> This document is the practical reference — the decision records
> (ADR-006, ADR-007, ADR-008) are the source of truth if the two disagree.

---

## Pattern 1 — Request/Response (REST over HTTP)

**When it is used:** every interaction in the system. There is no other
pattern in the MVP.

**Rules:**

- Every route is versioned under `/api/v1/` (`07-api/guidelines.md`).
- JSON in `camelCase`; money as integers in minor units, named `…Cents`
  (ADR-005 Decision 3).
- Every creation requires `Idempotency-Key`; a repeated key returns the
  original resource instead of creating a second one (ADR-005 Decision 4).
- Errors use the single closed catalog of `07-api/guidelines.md` — no
  service invents a code.
- Explicit timeouts and a bounded number of retries on every outgoing
  call (`05-architecture/cross-cutting.md` §8). A `4xx` is never retried:
  it is an answer, not a failure.

**Example — a portal reading a resource:**

```
GET /api/v1/customers/{id}
Authorization: Bearer <person's JWT>
```

---

## Pattern 2 — API Gateway

**What goes through it:** every request that starts at a browser.
`synkro-api-gateway` (NGINX) is the single published entry point
(ADR-008 Decision 1).

**What does NOT go through it:** the internal calls of `synkro-workflow`
and `synkro-worker` to the domain services. Those reach each `-api`
directly, inside the `platform` network, never through the gateway
(ADR-004 Decision 6).

**Routing table:**

| Path | Routed to |
|------|-----------|
| `/api/v1/auth/*` | `synkro-auth-api` |
| `/api/v1/customers/*` | `synkro-customers-api` |
| `/api/v1/products/*`, `/api/v1/stock-alerts/*` | `synkro-products-api` |
| `/api/v1/sales/*` | `synkro-sales-api` |
| `/api/v1/sagas/*` | `synkro-workflow` |

**What the gateway does:** checks that a credential is present, routes,
applies rate limiting and CORS, and assigns a correlation ID when the
client sends none (`cross-cutting.md` §3, §6).

**What the gateway does NOT do:** validate the JWT. Each service
validates it locally with the public key and authorizes the operation in
its own use case (ADR-006). The gateway forwards no `X-User-*` header —
identity comes only from the token inside each service.

---

## Pattern 3 — Service-to-service calls with a service token (the saga)

**When it is used:** the only write that spans more than one domain —
registering a sale — and the worker's low-stock job.

**Who calls whom:**

```
synkro-workflow          synkro-customers-api   synkro-products-api   synkro-sales-api
     │ state saved after every step, service token + Idempotency-Key <sagaId>:<step>
     │── 1. validate-customer ────>│                        │                     │
     │<──── customer active ───────│                        │                     │
     │── 2. reserve-stock (all lines, one transaction) ────────────────>│         │
     │<──── reservation + frozen unit prices ────────────────────────────│        │
     │── 3. register-sale (lines, prices, createdBy) ──────────────────────────────>│
     │<──── sale registered ─────────────────────────────────────────────────────────│
     │  [if step 3 fails: release-stock on the reservation — compensation, idempotent]

synkro-worker ──(low-stock job, service token)──▶ synkro-products-api
```

**Rules specific to this pattern (ADR-006, ADR-007):**

- Each caller presents its own service token (`Authorization: Bearer
  <service-token>`), never a person's token.
- Each step sends `Idempotency-Key: <sagaId>:<step>`, so a retried step
  runs no business logic twice.
- A business rejection (`4xx`) is never retried — it starts compensation
  instead. A business rule rejected at step 1 or 2 stops the saga before
  anything is written.
- Compensation (`release-stock`) is idempotent: releasing an
  already-released reservation changes nothing and succeeds.
- `synkro-sales-api` makes no outgoing call. It is a terminal node — see
  `dependency-map.md`.

**Why not events here:** the saga needs to know the outcome of each step
before deciding the next one (reserve the stock only if the customer is
active; register the sale only if the stock was reserved). A fire-and-
forget event does not give that guarantee; a synchronous call with a
persisted saga state does (ADR-007 Decision 1).

---

## Pattern 4 — Events / Message broker

**Status: not adopted in the MVP** (ADR-007 Decision 5).

No service publishes or consumes an event. The register-sale saga is
handled entirely by Pattern 3, with no broker in between. This was
evaluated and deferred, not overlooked:

| What a broker would add | Why it is not needed yet |
|---|---|
| Another context reacting to a sale (e.g. a notification, analytics) | No requirement asks for it today |
| Decoupling the saga from service availability | The saga already tolerates a step failing — it compensates, it does not need async delivery to do that |

**Trigger to revisit:** a requirement appears that needs a context to
react to a business event from another context (`15-project-control/technical-backlog.md`
TD-002). When that happens, the adopting ADR also decides the outbox
pattern for whichever service publishes the event.

---

## Pattern 5 — Service Discovery

**Mechanism: static DNS inside the `platform` network**, not a service
registry. Every container resolves another by its Docker Compose service
name (`synkro-products-api`, `synkro-db`, etc.) because they share the
same Docker network (`05-architecture/deployment.md` §1, §7). There is no
Consul, Eureka or equivalent — the MVP's scale does not need dynamic
discovery, and `synkro-infra` already composes every service by name in
one `compose.yml`.

---

## What NOT to use

- **GraphQL or gRPC:** not adopted; REST/JSON is the only contract style
  (ADR-001).
- **A shared cache (Redis):** not adopted; no caching layer in the MVP
  (`05-architecture/overview.md` §8).
- **Database-level replication or change-data-capture between schemas:**
  forbidden by ADR-009 — no service reads another's schema, by any
  mechanism.

---

## Correlations

- Saga decision and its steps → ADR-007
- Token validation, service tokens and their permissions → ADR-006
- Gateway technology and routing → ADR-008 Decision 1
- Timeouts, retries and correlation → `05-architecture/cross-cutting.md` §3, §8
- Idempotency keys → ADR-005 Decision 4
- Deferred broker and outbox → `15-project-control/technical-backlog.md` TD-002
- Service boundaries this pattern set assumes → `09-microservices/service-boundary-rules.md`
- Dependency graph → `09-microservices/dependency-map.md`
