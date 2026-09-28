# ADR-004: API Contract Extensions — Customer Search, Category Management, and Date-Range Report Filters

## Status
Proposed

## Date
2026-09-23

## Deciders
SynkroTech team (surfaced from HU-09's own work, not professor feedback)

---

## Context

While writing the 6 OpenAPI contracts in `07-api/contracts/openapi/`
(HU-DOCS-35 through 40), we found 3 real gaps between what ADR-001 §8
fixed as the immutable endpoint catalog and what the business actually
needs. None were resolved on the spot — each contract flagged the gap
explicitly, so the decision would be made here, deliberately, instead
of improvised inside a YAML file.

This ADR follows the same pattern ADR-002 already established: it
**extends** ADR-001 §8, it does not rewrite it. ADR-001 remains
immutable; this document adds endpoints and parameters ADR-001 never
considered.

---

## Decision 1 — Customer search by identity document

### The problem

`06-data/models.md` describes `identity_document` as *"used to look up
a customer at the point of sale"* — but ADR-001 §8 only fixes
`POST /api/customers` (create) and `GET/PUT/DELETE /api/customers/{id}`
(by ID). There is no way to find a customer's UUID without already
knowing it.

### Decision

Add **`GET /api/customers`** as a collection endpoint, supporting:
- Standard pagination (`page`, `limit`, already defined in `_shared.yaml`)
- An optional `identityDocument` parameter for exact lookup — the real
  point-of-sale use case

```
GET /api/customers?identityDocument=123456789
GET /api/customers?page=1&limit=20
```

**Authorization:** same as the existing Customers endpoints — `ADMIN`
and `SALESPERSON`, not `INVENTORY`.

### Alternatives considered

| Alternative | Verdict | Reason |
|---|---|---|
| `GET /api/customers?identityDocument=...` (collection with filter) | **Adopted** | Solves the real point-of-sale lookup, and enables listing/pagination of customers as a side effect — something that also didn't exist and that the frontend will need regardless |
| `GET /api/customers/search?document=...` (dedicated route) | Rejected | A separate endpoint for a case a single query parameter already solves — unnecessary complexity |
| Resolve the lookup inside `POST /api/sales` itself (let the Saga resolve the ID) | Rejected | Would implicitly move search logic from the frontend to the backend; the frontend needs to show the found customer to the salesperson *before* confirming the sale, not after |

---

## Decision 2 — Product category management

### The problem

FR-003 requires products to be organized by category, and
`products.category_id` is a real FK in `models.md`. But ADR-001 §8
fixes no endpoint to create or list categories — it assumed they
already existed, without saying how they got there.

### Decision

Add 2 new endpoints under `products-service`:

```
POST /api/products/categories       — create a category
GET  /api/products/categories       — list categories (to populate the selector when creating a product)
```

**Authorization:** same as Products — `ADMIN` and `INVENTORY` can
create; both roles (plus `SALESPERSON` indirectly, via product
listings) can see categories through the list.

### Alternatives considered

| Alternative | Verdict | Reason |
|---|---|---|
| Dedicated category endpoints (above) | **Adopted** | Consistent with the rest of the system — every entity with its own existence has its own creation endpoint |
| Fixed categories, seeded via database migration, no API | Rejected | Removes real business flexibility — Inventory would need to ask a developer every time a new category is needed |
| Categories as free text on the product itself (no separate table) | Rejected | Contradicts the data model already fixed in `models.md`, which has `categories` as its own table with a real FK — changing this would violate ADR-001 §7, which is immutable |

---

## Decision 3 — Date-range filters on sales reports

### The problem

ADR-002's reference SQL queries for the reports (`daily`, `monthly`,
`top-products`) have no date filter at all — they return the entire
history, grouped. In practice, a report that can't be bounded by date
range has limited use (no one wants "every day since the system
existed" in a single response).

### Decision

Add optional **`from`** and **`to`** parameters (`date` format, both
inclusive) to `sales-service`'s 3 report endpoints:

```
GET /api/sales/reports/daily?from=2026-09-01&to=2026-09-30
GET /api/sales/reports/monthly?from=2026-01-01&to=2026-12-31
GET /api/sales/reports/top-products?from=2026-09-01&to=2026-09-30&limit=10
```

Both parameters are optional — omitting them preserves the original
reference query's behavior (the full history).

### Alternatives considered

| Alternative | Verdict | Reason |
|---|---|---|
| Explicit, optional `from`/`to` | **Adopted** | Maximum flexibility; compatible with the original behavior when omitted |
| Predefined periods (`period=last7days\|last30days\|thisMonth`) | Rejected | Less flexible; would force the frontend to map user selections to a fixed enum instead of letting the backend work with real dates |
| No filter, let the frontend paginate/filter client-side | Rejected | Would potentially bring the entire sales history into browser memory — doesn't scale, and contradicts the pagination principle already established in `guidelines.md` |

---

## Consequences

### Positive
- All 3 gaps are resolved with an explicit, justified decision instead of a silent improvisation inside a YAML file.
- `07-api/contracts/openapi/customers-service.yaml`, `products-service.yaml`, and `sales-service.yaml` stop saying "deferred" and cite this ADR instead.
- The Sales frontend can now implement the customer-lookup-by-document flow the data model already assumed was possible.

### Negative
- 3 new endpoints that weren't in ADR-001 §8's original catalog — anyone auditing the API catalog against ADR-001 without knowing this document exists might think they're unauthorized additions. Mitigated by citing this ADR explicitly from every affected contract.
- None of the new endpoints have implementation code yet — they remain contract-only until the code sprint starts.

---

## References

- Extends → `05-architecture/decisions/records/ADR-001-architecture.md`, §8 ("Main APIs")
- Same extension pattern as → `05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md`
- Contracts updated by this decision → `07-api/contracts/openapi/customers-service.yaml`, `products-service.yaml`, `sales-service.yaml`
- Gaps originally found in → HU-DOCS-37, HU-DOCS-38, HU-DOCS-39
