# ADR-004 — API Contract Extensions

| Field | Value |
|-------|-------|
| **ID** | ADR-004 |
| **Date** | 2026-09-23 (extended before acceptance) |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — Tech Lead, SynkroTech team |
| **Reviewers** | Jordan Ramirez Gallego, Sergio Andrés Ordóñez Díaz, Fredman Santiago Plazas Artunduaga — Development team |
| **Modifies** | ADR-001 §8 (Main APIs): extends it, replaces `PATCH /api/products/{id}/stock`, and places every route under `/api/v1/` |

---

## Context

ADR-001 §8 fixed the first endpoint catalog. Two sources of missing endpoints appeared afterward:

1. **Gaps found while writing the contracts** (HU-DOCS-37 to HU-DOCS-39): no way to find a customer by identity document, no way to create categories, and reports that cannot be bounded by date.
2. **Resources introduced by later decisions and requirements:** FR-002 asks to view, update and deactivate products; the sales portal needs a sales history; ADR-006 introduces service tokens; ADR-007 introduces stock reservations, stock alerts and the sale saga; `07-api/authentication.md` invalidates the refresh token on logout, with no endpoint for it.

Without a record, anyone auditing the contracts against ADR-001 §8 would read every new endpoint as an unauthorized addition. This ADR was still `Proposed` when those needs appeared, so it was extended before its acceptance.

**Constraints:**
- ADR-001 is immutable; this ADR extends §8 and replaces one of its endpoints without editing it.
- Every route is under `/api/v1/`, every creation requires `Idempotency-Key`, and every list is paginated (`07-api/guidelines.md`).
- The gateway routes by domain prefix (ADR-008): `/api/v1/auth/`, `/api/v1/customers/`, `/api/v1/products/`, `/api/v1/stock-alerts/`, `/api/v1/sales/`, `/api/v1/sagas/`.

---

## Decision 1 — Customer search by identity document

### Options

**A — A collection endpoint with filters.** **Pros:** the point-of-sale lookup and the customer list in one endpoint. **Cons:** filters must be validated.
**B — A dedicated `/customers/search` route.** **Pros:** explicit. **Cons:** a second endpoint for what one query parameter solves.
**C — Let the saga resolve the customer from the document.** **Pros:** no new endpoint. **Cons:** the salesperson must see the customer before confirming the sale, not after.

### Decision

**Option A:** `GET /api/v1/customers`, paginated, with the optional filters `identityDocument` (exact match) and `active`. Allowed to `ADMIN` and `SALESPERSON`.

### Dominant criterion

**One endpoint serves both the point-of-sale lookup and the customer list** the portal needs anyway.

### Accepted cost

- The endpoint must reject unknown filters and out-of-range limits (`400`).

---

## Decision 2 — Category management

### Options

**A — Category endpoints for the category's whole lifecycle.** **Pros:** consistent with the `Category` entity, which can be created, renamed and deactivated. **Cons:** four more endpoints.
**B — Categories seeded by a migration, with no API.** **Pros:** nothing to build. **Cons:** every new category needs a developer.
**C — Category as free text on the product.** **Pros:** no table. **Cons:** contradicts the data model, where `category` is its own table.

### Decision

**Option A**, under the products prefix the gateway already routes:

- `POST /api/v1/products/categories`, `GET /api/v1/products/categories` (paginated, filter `active`)
- `PUT /api/v1/products/categories/{id}` (rename), `DELETE /api/v1/products/categories/{id}` (deactivate)

A duplicate name among active categories, and deactivating a category with active products, answer `422 BUSINESS_RULE_VIOLATION`. `ADMIN` and `INVENTORY` write; all three roles read. The fixed segment `categories` takes precedence over a product `{id}`.

### Dominant criterion

**Every entity with a lifecycle in the domain has endpoints for that lifecycle.**

### Accepted cost

- Category routes share the `/products/` prefix, so routers must match the fixed segment before `{id}`.

---

## Decision 3 — Date-range filters on sales reports

### Options

**A — Optional `from` and `to` dates.** **Pros:** flexible; omitting them keeps the full history. **Cons:** the day boundary must be defined.
**B — Predefined periods (`last7days`, `thisMonth`).** **Pros:** simple selector. **Cons:** a fixed enum instead of real dates.
**C — No filter; the portal filters.** **Pros:** nothing to build. **Cons:** the whole sales history in the browser.

### Decision

**Option A:** the three reports (`/api/v1/sales/reports/daily`, `/monthly`, `/top-products`) accept optional `from` and `to` (RFC 3339 full dates, both inclusive, UTC days). Every report returns `{data, meta}` with the standard `page` and `limit` — including `top-products`, which drops its own limit of 50.

### Dominant criterion

**A report is always bounded**, by date and by page.

### Accepted cost

- Days are UTC days: a sale made after 19:00 in Colombia (UTC−5) falls on the next report day. A time-zone parameter is added only if the business asks for it.

---

## Decision 4 — Product catalog and stock adjustments

### Options

**A — Full product endpoints, with stock changed only through a stock-adjustment resource.** **Pros:** FR-002 is covered; each manual change is recorded with its reason and author and is safe to retry. **Cons:** replaces an endpoint of ADR-001 §8.
**B — Keep `PATCH /api/products/{id}/stock`.** **Pros:** no change. **Cons:** a retried request changes stock twice, and it mixes manual corrections with the saga's reservations.
**C — Stock editable through `PUT /products/{id}`.** **Pros:** one endpoint. **Cons:** an edit could overwrite a reservation made in between.

### Decision

**Option A:**

- `GET /api/v1/products` (paginated; filters `categoryId`, `active`, `name`, `stockAtMost`), `GET /api/v1/products/{id}`
- `PUT /api/v1/products/{id}` (name, `priceCents`, category; never stock), `DELETE /api/v1/products/{id}` (deactivate)
- `POST /api/v1/products/{id}/stock-adjustments` (`delta`, `reason`; requires `Idempotency-Key`). A result below zero answers `422 BUSINESS_RULE_VIOLATION`.

`PATCH /api/products/{id}/stock` from ADR-001 §8 is replaced: manual changes use stock adjustments, and the saga uses stock reservations (Decision 6). `ADMIN` and `INVENTORY` write; all three roles and the worker's token (`products:read`) read.

### Dominant criterion

**Stock changes only through operations that are safe to retry and leave a record.**

### Accepted cost

- Clients use two stock resources (adjustments and reservations) instead of one endpoint.

---

## Decision 5 — Sales history

### Options

**A — A paginated sales list.** **Pros:** the portal can show the history; the "own sales" rule is applied by the server. **Cons:** another list to filter and paginate.
**B — Only the reports.** **Pros:** nothing to build. **Cons:** no way to open a past sale from a list.

### Decision

**Option A:** `GET /api/v1/sales`, paginated, newest first, with optional filters `from`, `to` and `customerId`. A `SALESPERSON` only sees sales whose `created_by` is their own `sub` (ADR-002, ADR-006). `POST /api/v1/sales` stays reserved to the saga (`sales:register`).

### Dominant criterion

**The sales history is visible, and the own-sales rule is enforced by the server, not by the portal.**

### Accepted cost

- One more paginated list with its own filters to validate.

---

## Decision 6 — Endpoints required by other decisions

### Options

**A — Register them here.** **Pros:** ADR-001 §8 plus this ADR list every endpoint of the system. **Cons:** this ADR must be superseded to add an endpoint later.
**B — Leave each one in the ADR that introduced it.** **Pros:** no duplication. **Cons:** rebuilding the catalog means reading six records.

### Decision

**Option A.** The endpoints below exist because another record requires them:

| Method and path | Required by | Caller |
|---|---|---|
| `POST /api/v1/auth/service-tokens` | ADR-006 | `ADMIN` |
| `POST /api/v1/auth/logout` | `07-api/authentication.md` (refresh token invalidated on logout) | Any authenticated person |
| `POST /api/v1/sagas/register-sale`, `GET /api/v1/sagas/{id}` | ADR-007 Decision 2 | `ADMIN`, `SALESPERSON` |
| `POST /api/v1/stock-reservations`, `GET /api/v1/stock-reservations/{id}`, `POST /api/v1/stock-reservations/{id}/release` | ADR-007 Decision 3 | Workflow token only (`stock:reserve`, `stock:release`); not routed by the gateway |
| `GET /api/v1/stock-alerts` | ADR-007 Decision 6 | `ADMIN`, `INVENTORY`, worker token (`stock-alerts:read`) |
| `POST /api/v1/stock-alerts`, `POST /api/v1/stock-alerts/{id}/resolve` | ADR-007 Decision 6 | Worker token only (`stock-alerts:write`) |

Every creation above requires `Idempotency-Key`; `release` and `resolve` are idempotent by their status.

### Dominant criterion

**An auditor can rebuild the full endpoint catalog from two records: ADR-001 §8 and this ADR.**

### Accepted cost

- Adding an endpoint later requires a new ADR that supersedes this one.

---

## Consequences

**What changes in the system:**
- Every contract in `07-api/contracts/openapi/` must contain exactly the endpoints of ADR-001 §8 (as replaced here) plus this ADR, under `/api/v1/`, and cite the decision that introduced each one; no contract keeps a "known gap".
- `PATCH /api/products/{id}/stock` disappears from the catalog.

**What must be watched:**
- Endpoints added in a contract without a record: the contract review checks every path against these two records.

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| `07-api/contracts/openapi/` (auth, customers, products, sales, workflow) | Endpoints of this ADR, under `/api/v1/` (HU-DOCS-55 to HU-DOCS-60) |
| `07-api/authentication.md` | Logout endpoint in the authorization table (HU-DOCS-55) |
| `12-ux-ui/navigation-map.md` | Sales history and categories in the portal flows (HU-DOCS-69) |
| `05-architecture/decisions/README.md` | ADR-004 accepted; ADR-001 §8 marked as modified (this PR) |
| ADR-001 | **No changes**: immutable |

---

## Immutability rule

Once this ADR is `Accepted`, it is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

---

## References

- Original endpoint catalog → `05-architecture/decisions/records/ADR-001-architecture.md` §8
- Own-sales rule → `05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md`
- Service tokens and permissions → `05-architecture/decisions/records/ADR-006-token-validation-per-service.md`
- Saga, stock reservations and stock alerts → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`
- Gateway route prefixes → `05-architecture/decisions/records/ADR-008-cross-cutting-stack.md`
- Route, list, idempotency and error conventions → `07-api/guidelines.md`
- Product catalog and stock requirements → `04-requirements/functional.md` (FR-002, FR-004)
