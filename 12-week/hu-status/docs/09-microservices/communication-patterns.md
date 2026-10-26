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

- Business routes are versioned under `/api/v1/`; public health stays unversioned at `/health` (`07-api/guidelines.md`).
- JSON in `camelCase`; money as integers in minor units, named `…Cents`
  (ADR-005 Decision 3).
- Every creation requires `Idempotency-Key`; a repeated key returns the
  original resource instead of creating a second one (ADR-005 Decision 4).
- Errors use the single closed catalog of `07-api/guidelines.md` — no
  service invents a code.
- Explicit timeouts and a bounded number of retries on every outgoing
  call under Accepted ADR-015. Network/429/5xx policy is bounded; validated rejection is distinct from ambiguous/protocol/local failure. Delivered HTTP 408/jitter and Circuit Breaker discrepancies remain TD-015/016.

**Example — a portal reading a resource:**

```
GET /api/v1/customers/{id}
Authorization: Bearer <person's JWT>
```

---

## Pattern 2 — API Gateway

**What goes through it:** browser API requests through the Host-owned shared transport. `synkro-api-gateway` (NGINX) is the single published API entry (ADR-008 Decision 1). Host/portal assets use their separate delivery path; they are not API calls routed through the Gateway.

**Internal calls:** delivered Workflow participant calls reach domain APIs directly inside the platform network, with SERVICE authority. The Worker-to-Products edge is intended only: its business job remains missing. API validation remains mandatory even on that internal network (ADR-004/006).

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
registering a sale. The worker's intended low-stock calls are not delivered by its placeholder.

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
     │  [only proven permitted rejection may authorize release; ambiguity retains stock]

synkro-worker: placeholder; future low-stock SERVICE calls remain TD-019
```

**Rules specific to this pattern (ADR-006, ADR-007):**

- Each caller presents its own service token (`Authorization: Bearer
  <service-token>`), never a person's token.
- Each step sends `Idempotency-Key: <sagaId>:<step>`, so a retried step
  runs no business logic twice.
- Only validated operation-specific rejection evidence can authorize compensation. An uncertain/later/malformed response does not disprove an earlier commit: retain the reservation and reconcile. A stock reservation is atomic for all lines; do not claim no execution state was written. ADR-015 modifies the older blanket rule in ADR-007.
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
| Decoupling the saga from service availability | Durable evidence/recovery handles outcomes; ambiguity can suspend with stock retained. A broker is not an adopted substitute |

**Trigger to revisit:** a requirement appears that needs a context to
react to a business event from another context (`15-project-control/technical-backlog.md`
TD-002). When that happens, the adopting ADR also decides the outbox
pattern for whichever service publishes the event.

---

## Pattern 5 — Service Discovery

**Mechanism: static DNS inside the platform network**, not a service registry. Services in the composed environment resolve the configured Compose service names on their shared network. There is no Consul or Eureka; this topology does not require dynamic discovery.

`synkro-infra-postgres` contains the full-root composition candidate; its main/qa branches remain scaffold. `synkro-infra-mongo` supplies the separate authenticated MongoDB replica-set foundation. [Deployment](../05-architecture/deployment.md) owns actual names, network and start-up prerequisites; the [release record](../10-devops/releases/2.0.0.md) owns candidate pins and outstanding acceptance. A repository or DNS definition alone does not prove that every service is running or accepted.

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
