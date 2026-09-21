# Distributed Pattern Evaluation

> This document evaluates Circuit Breaker, Saga, Outbox, and CQRS against
> the concrete scope of the SynkroTech SAS MVP, as required by the
> Distributed Systems course. Each pattern receives an explicit
> **adopted** or **rejected** decision with its technical justification.
>
> This is not a generic pattern catalog — it is a project-specific
> evaluation. For reference material on what each pattern is, see the
> teaching notes preserved at the bottom of this file.

---

## Summary of Decisions

| Pattern | Decision | Justification (one line) |
|---------|----------|--------------------------|
| Circuit Breaker | **Adopted (simplified)** | `synkro-workflow` depends synchronously on two services; a fail-fast mechanism prevents cascading timeouts |
| Saga | **Adopted (ADR-003)** | The professor's `synkro-workflow` infrastructure now exists, and sale registration matches his own definition of a workflow-worthy process |
| Outbox Pattern | **Adopted (ADR-003)** | RabbitMQ is now adopted; the final Saga outcome must reach `synkro-worker` reliably |
| CQRS | **Rejected for MVP** | Read and write models are nearly identical; reports use aggregation queries, not a separate read store |

---

## 1. Circuit Breaker — Adopted (Simplified)

### Why It Applies

ADR-001 Consequences (Negative) identifies temporal coupling as a risk: if products-service is unavailable, `synkro-workflow` cannot complete the `SaleRegistrationSaga` (ADR-003 §4). Without a Circuit Breaker, `synkro-workflow` would hold connections open for the full TCP timeout (typically 30–60 seconds), exhausting its connection pool and becoming unresponsive to all in-flight sagas — not just the ones that depend on the failing service.

### What We Adopt

A lightweight Circuit Breaker on every outgoing HTTP call from `synkro-workflow` to customers-service and products-service (and to sales-service for the Saga's final step). The mechanism follows the standard three-state model:

```
CLOSED (normal)
  │ call succeeds → stays CLOSED, reset failure count
  │ call fails    → increment failure count
  │ failure count >= threshold → switch to OPEN
  │
OPEN (circuit tripped)
  │ all calls fail immediately with SERVICE_UNAVAILABLE (503)
  │ after cooldown period → switch to HALF-OPEN
  │
HALF-OPEN (probing)
  │ allow 1 call through
  │ if it succeeds → switch to CLOSED
  │ if it fails    → switch to OPEN
```

### Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Failure threshold | 3 consecutive failures | Low traffic MVP — 3 failures in a row is a strong signal |
| Cooldown period | 15 seconds | Short enough to recover quickly from a service restart |
| Timeout per call | 3 seconds | See §5 below |
| Monitored calls | `GET /api/customers/{id}`, `PATCH /api/products/{id}/stock` (reserve + release), `POST /api/sales` | The 3 Saga steps orchestrated by `synkro-workflow` (ADR-003 §4) |

### What We Do NOT Adopt

A full resiliency library with bulkheads, rate limiters, and retry policies managed by an external configuration server. The MVP has a single instance of each service; the goal is fail-fast, not self-healing at scale.

### Implementation Guidance

`synkro-workflow`'s implementation language is not yet decided (see `09-microservices/service-catalog.md`, row 06 — Technology: TBD). Whichever language is chosen:

**If Go:** `sony/gobreaker` — a mature, minimal Circuit Breaker library. Wrap each HTTP client call in a `gobreaker.CircuitBreaker` instance.

**If Java:** Resilience4j `CircuitBreaker` module — Spring Boot starter available.

This decision should be finalized alongside `synkro-workflow`'s technology choice, not deferred silently.

### Fallback Behavior

When the circuit is open, `synkro-workflow` returns `503 SERVICE_UNAVAILABLE` with the standard error format defined in `cross-cutting.md`:

```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "The customers service is temporarily unavailable. Please try again shortly.",
  "traceId": "abc123-def456"
}
```

There is no cached fallback, because creating a sale with stale customer or stock data would violate business invariants. The only safe fallback is to reject the operation and let the user retry.

---

## 2. Saga — Adopted (ADR-003)

### Previous Decision (now superseded)

This section previously rejected the Saga pattern with the argument that "the MVP does not have [a message broker or a saga state machine] to solve a 2-step problem that can be handled with a simpler inline compensation strategy." That justification is no longer valid: the professor's `synkro-workflow` and `synkro-worker` repositories mean the infrastructure now exists, and the sale-creation flow (3 domains, multi-step, with designed compensation) matches the professor's own description of what belongs in `workflow`.

### Current Decision

The sale-registration process moves from inline orchestration inside `sales-service` to an orchestrated Saga in `synkro-workflow`. See ADR-003 §4 for the full sequence diagram, the step-order change (reserve stock before registering the sale), and the justification.

**Key design properties:**
- `synkro-workflow` is a **stateless orchestrator** — no database, no persisted saga state. It executes 3 synchronous REST calls within a single HTTP request and handles compensation in memory.
- The professor did not create a `synkro-workflow-db` repository, confirming this stateless design.
- Compensation surface is reduced to 1 reversal (release stock) by reordering the steps: stock is reserved before the sale is written.

### What stays in `sales-api`

Single-domain operations that do not touch other services: `GET /api/sales/{id}`, `GET /api/sales/reports/*` (FR-008, FR-009). These are not Saga-worthy — they live in the domain API per the professor's rule.

### The compensation strategy from §6 is now the Saga's compensation

The inline compensation documented in §6 below ("mark sale inactive, release stock lines") is now implemented as the Saga's own compensation steps, orchestrated by `workflow` rather than inlined in `sales-service`. §6's content is preserved for historical reference but no longer describes the active flow.

---

## 3. Outbox Pattern — Adopted (ADR-003)

### Previous Decision (now superseded)

This section previously rejected the Outbox pattern because "the MVP does not have a message broker to publish events to" and "there are no domain events that need to be published." Both conditions changed with ADR-003: RabbitMQ is now adopted, and `SaleCompleted`/`SaleFailed` are real events that `synkro-worker` needs to consume reliably.

### Current Decision

Outbox lives inside the `sales` schema (already existing, owned by `sales_user`), not in a new schema. When `sales-api` registers the sale (Saga step 3), it writes the `sales` row **and** an `outbox` row in the same local transaction. A relay process reads `sales.outbox` and publishes to RabbitMQ.

```sql
CREATE TABLE sales.outbox (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   VARCHAR(100) NOT NULL,
  payload      JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  published    BOOLEAN DEFAULT false
);
```

### Why Outbox is adopted now, not deferred

With Saga and RabbitMQ already adopted in the same ADR, publishing the final event without Outbox would leave a real case unresolved: if `sales-api` crashes after committing the sale but before the relay publishes to RabbitMQ, `synkro-worker` never learns that the sale completed, and no confirmation email is sent. Adopting the Saga without Outbox means the first implementation is born with a known defect.

### What does NOT need Outbox

The intermediate Saga step (`ReleaseStock` compensation in `products-api`) does not need Outbox — it happens within the same synchronous request from `workflow`. Outbox only protects the *final* event that another service (`worker`) needs to receive reliably.

---

## 4. CQRS — Rejected for MVP

### Why It Was Evaluated

CQRS separates the write model (commands) from the read model (queries), allowing each to be optimized independently. In the SynkroTech context, the potential use case is reports: the write model is `sales` + `sale_details`, and the read model could be a pre-aggregated `sales_summary`.

### Why It Is Rejected

The read and write models in this system are nearly identical. The entities the API exposes for reading (customers, products, sales) are the same entities the API writes to — there is no transformation, no denormalization, and no different schema. The reporting queries (daily sales, monthly sales, top products) are simple `SUM` + `GROUP BY` aggregations over `sales` and `sale_details`, executable in milliseconds at the MVP's data volume.

Introducing CQRS would mean maintaining two models (a write model and a read projection) with a synchronization mechanism between them, for a system where a single `SELECT` already answers the query.

### The Reporting Strategy We Use Instead

Reports are computed on demand using aggregation queries directly over `sales` and `sale_details`. The `sales_summary` table defined in ADR-001 §7 exists in the schema but **is not populated by any process in the MVP** — this is consistent with the decision in `02-domain/entities-and-rules.md` to treat `SalesSummary` as a derived projection, not a domain entity. The status of this table will be formalized in ADR-002.

### When It Would Be Adopted

If the transaction volume grows to the point where aggregation queries degrade the write path's performance (contention on `sales`/`sale_details` during reporting windows), CQRS with a materialized read model becomes justified. This is not expected within the academic scope of the project.

---

## 5. Timeout and Retry Policy

### Timeouts

Every outgoing HTTP call from `synkro-workflow` (the 3 Saga steps, ADR-003 §4) has a hard timeout. The values are intentionally conservative for an MVP that runs on localhost or a local Docker network.

| Call | Timeout | Rationale |
|------|---------|-----------|
| `GET /api/customers/{id}` | 3 seconds | Single-row lookup by primary key; if it takes longer than 3s, the service is likely down |
| `GET /api/products/{id}` | 3 seconds | Same rationale |
| `PATCH /api/products/{id}/stock` | 5 seconds | Write operation; slightly more generous to account for lock contention |

If the timeout is exceeded, the call is treated as a failure for Circuit Breaker purposes.

### Retry Policy

| Call Type | Retryable? | Policy | Rationale |
|-----------|-----------|--------|-----------|
| `GET` (read) | Yes | 1 retry after 500ms | Idempotent by nature; a transient network hiccup should not fail the sale |
| `PATCH /api/products/{id}/stock` | **No** | No retries | The stock deduction is **not idempotent** — retrying could deduct stock twice. If it fails, the compensation path activates (see §6) |

### Implementation Notes

**Whichever language `synkro-workflow` adopts:** use an HTTP client with a per-call timeout configured per downstream service (Auth's public key is not needed here — `workflow` receives trusted identity via the Gateway-forwarded headers, ADR-003 §2). The retry logic is a simple loop with a fixed delay, not a retry library — for 1 retry, a library adds more complexity than it saves.

---

## 6. Stock Concurrency and Failure Compensation

### The Problem

Two concurrent sales could both read `stock = 5`, both try to sell 3 units, and both succeed — leaving stock at -1, violating the invariant "stock can never be negative."

### Chosen Mechanism: Conditional UPDATE with Row-Level Result Check

products-service implements stock deduction as a single atomic SQL statement:

```sql
UPDATE products
SET stock = stock - :quantity
WHERE product_id = :productId
  AND active = true
  AND stock >= :quantity;
```

The application checks `rows_affected`:

- **`rows_affected = 1`:** deduction succeeded; return `200 OK`.
- **`rows_affected = 0`:** either the product does not exist, is inactive, or stock is insufficient; return `409 CONFLICT`.

This mechanism works because:

1. PostgreSQL's `UPDATE` acquires a row-level lock implicitly — two concurrent UPDATEs on the same row are serialized.
2. The `CHECK (stock >= 0)` constraint on the `products` table acts as a safety net — even if the application logic has a bug, the database will reject a negative stock.
3. No explicit `SELECT FOR UPDATE` or optimistic locking (`version` column) is needed, because the read-then-write race condition is eliminated: there is no separate read step.

### Alternatives Evaluated

| Alternative | Verdict | Reason |
|-------------|---------|--------|
| **Conditional UPDATE** (chosen) | Adopted | Simplest; no extra columns; leverages PostgreSQL's implicit row lock; the `CHECK` constraint acts as a double safeguard |
| Optimistic locking (`version` column) | Rejected | Requires adding a `version` column to `products`, modifying the domain entity, and handling `StaleObjectStateException` / retry-on-conflict — more complexity for the same result at MVP traffic |
| `SELECT FOR UPDATE` (pessimistic locking) | Rejected | Holds the lock for the entire transaction duration; in a REST call where the lock crosses a network boundary (sales-service → products-service), the lock time is unpredictable |
| Application-level distributed lock (Redis) | Rejected | Introduces an infrastructure dependency (Redis) the MVP does not have |

### Failure Path and Compensation

The sale creation flow has three possible failure points after the initial validations (customer exists, products exist, stock sufficient):

```
sales-service                              products-service
     │                                            │
     │  1. INSERT sale + sale_details              │
     │     (local transaction in schema: sales)    │
     │                                             │
     │  2. For each detail line:                   │
     │     PATCH /api/products/{id}/stock ────────>│
     │                                             │
     │     Possible outcomes:                      │
     │     a) 200 OK ── stock deducted             │
     │     b) 409 CONFLICT ── insufficient stock   │
     │     c) timeout / 5xx ── service failure     │
     │                                             │
```

**Compensation rules:**

| Failure Point | What Happens | Compensation |
|---------------|-------------|--------------|
| Step 1 fails (INSERT sale) | Local transaction rolls back | None needed — nothing was written |
| Step 2, outcome (b): `409 CONFLICT` on any line | Stock was already insufficient when the UPDATE ran | Mark the sale as `active = false` in schema: sales; return `409 CONFLICT` to the client with the specific product and available stock |
| Step 2, outcome (c): timeout or 5xx on any line | Unknown whether stock was deducted or not | Mark the sale as `active = false` in schema: sales; log the incident with `ERROR` level and the `traceId`; return `503 SERVICE_UNAVAILABLE` to the client |
| Step 2 succeeds for lines 1–2 but fails on line 3 | Lines 1–2 already deducted stock | **Reverse the already-deducted lines** by calling `PATCH /api/products/{id}/stock` with a positive quantity to restore stock; then mark the sale as `active = false`; if the reversal call also fails, log it as a critical inconsistency for manual resolution |

**Why this is not a Saga:** a Saga implies a coordination mechanism (orchestrator or choreography through events) that manages the state machine of the transaction. Here, the compensation is inline code in sales-service's `CreateSaleUseCase` — a simple `if err != nil { compensate() }` block, not a state machine. This is proportional to a 2-step flow in an MVP.

### Idempotency of `POST /api/sales`

`POST /api/sales` is **not idempotent** in the MVP. Sending the same request twice creates two sales and deducts stock twice. This is acceptable because:

1. The frontend disables the "Register sale" button after the first click (documented in `12-ux-ui/wireframes.md`).
2. There is no retry policy on the write path (see §5).
3. The failure compensation marks failed sales as `active = false`, so they do not appear in normal queries.

If idempotency becomes necessary (e.g., unreliable network, mobile clients), the mechanism would be an `Idempotency-Key` header: the client sends a UUID with the request, sales-service stores it alongside the sale, and a duplicate key returns the original response without creating a new sale. This is recorded as a future candidate, not an MVP requirement.

---

## 7. Patterns Not Evaluated

The following patterns appear in the teaching reference but were not evaluated because they have no applicability to the current system:

| Pattern | Why Not Evaluated |
|---------|-------------------|
| Event Sourcing | No audit or state-replay requirement beyond soft deletion; outside MVP scope |
| Backend for Frontend (BFF) | All 4 frontends are web SPAs with similar data needs |
| Strangler Fig | No legacy system to migrate from |
| Sidecar | No service mesh; each service handles its own concerns |

---

## Correlations

* Architecture decision → `05-architecture/decisions/records/ADR-001-architecture.md`
* Architectural overview and pattern table → `05-architecture/overview.md` §6
* Cross-cutting concerns (error format, timeouts) → `05-architecture/cross-cutting.md`
* Stock constraint and data model → `06-data/models.md` (schema: products)
* Domain invariants → `02-domain/entities-and-rules.md`
* Sale creation flow → `02-domain/entities-and-rules.md` §Resolving external references
* MVP scope and future candidates → `01-context/scope.md`

---
---

## Teaching Reference (preserved from template)

> The sections below are the original pattern catalog provided by the
> course instructor as reference material. They are preserved here for
> educational context but do not represent project decisions. Project
> decisions are in §1–§6 above.
>
> Code snippets use pseudo-TypeScript as a reference language; the
> project's actual stack is Java (Spring Boot) and Go.

### Circuit Breaker — Reference

```
CLOSED state (normal):
  Calls pass through → if N consecutive failures → switch to OPEN

OPEN state (circuit breaker):
  Calls blocked immediately (fail fast) → after T seconds → HALF-OPEN

HALF-OPEN state (testing):
  Allows 1 call → if it fails: back to OPEN | if it passes: back to CLOSED
```

### Retry with Exponential Backoff — Reference

```
Attempt 1: wait 100ms
Attempt 2: wait 200ms
Attempt 3: wait 400ms
Attempt 4: wait 800ms (max retries reached → fail)
```

### Saga — Reference

```
Orchestrated Saga:
  Coordinator ──▶ Step 1 (Service A) ──▶ Step 2 (Service B) ──▶ Step 3 (Service C)
  If Step 2 fails → Coordinator calls compensate(Step 1)

Choreographed Saga:
  Service A publishes Event1 → Service B reacts, publishes Event2 → Service C reacts
  If Service C fails → publishes CompensationEvent → Services B and A react
```

### Outbox Pattern — Reference

```sql
CREATE TABLE outbox (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   VARCHAR(100) NOT NULL,
  payload      JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  published    BOOLEAN DEFAULT false
);

CREATE INDEX idx_outbox_unpublished ON outbox (created_at) WHERE published = false;
```

### CQRS — Reference

```
Write side:  Command → Aggregate → write to DB (source of truth)
Read side:   Query → read from projection/view (optimized for reads)
Sync:        DB trigger / event / scheduled job keeps the projection updated
```
