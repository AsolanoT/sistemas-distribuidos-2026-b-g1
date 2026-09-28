# REST Guidelines

> SynkroTech's REST standard. The entire team must follow this before
> designing a new endpoint.

---

## Versioning

**Decision: no version in the URL** (`/api/customers`, not `/api/v1/customers`).

Evaluated and deliberately not adopted for now — not simply overlooked:

- Every document already approved (ADR-001 §8 "Main APIs", the
  communication matrix in `service-catalog.md`, the diagrams in
  `overview.md`, `domain-events.md`, `models.md`) uses unversioned
  paths, without exception. Introducing `/v1/` now would desynchronize
  those documents from the real contract.
- URL versioning is justified when multiple external consumers depend
  on freezing one version while another evolves. That scenario doesn't
  exist here — a single team builds frontend and backend in parallel.

**When to reconsider this:** if a specific endpoint needs an
incompatible change in the future, that *specific* endpoint gets
versioned (`/api/v2/sales`), not the whole API at once. `/v1/` is not
retrofitted onto everything else just for cosmetic consistency.

---

## Endpoint naming

- Plural for collections: `GET /api/customers`, not `/api/customer`
- Nouns, not verbs: `GET /api/sales/{id}` (not `GET /api/getSale`)
- kebab-case for multi-word URL segments (none of the 10 real endpoints
  from ADR-001 §8 need this today, but the rule stands for when one does)
- Nested sub-resources only when the relationship is real ownership:
  `PATCH /api/products/{id}/stock` (stock belongs to the product), not
  for read-only relationships between distinct aggregates — a sale does
  not nest customers or products in its URL; it references them by ID
  in the body

---

## Pagination

**Decision: offset-based** (`?page=1&limit=20`), not cursor-based.

The 3 sales reports (`/api/sales/reports/daily|monthly|top-products`)
are the only endpoints that return potentially long lists — and none
has the volume that would justify cursor-based pagination (thousands of
results per page, concurrent inserts during pagination). `GET /api/sales`
and `GET /api/customers` also use offset-based, for consistency with
the rest of the API.

```
GET /api/sales?page=1&limit=20
```

| Parameter | Type | Default | Max |
|---|---|---|---|
| `page` | integer | 1 | — |
| `limit` | integer | 20 | 100 |

---

## Standard responses

| Code | When to use it |
|---|---|
| 200 | Success with a body (GET, successful PATCH) |
| 201 | Successful creation (POST that creates a resource) |
| 204 | Success without a body (not currently used — there is no physical `DELETE` anywhere in the system, per the soft-delete pillar; see note below) |
| 400 | Client error (payload validation) |
| 401 | Not authenticated (JWT missing, expired, or invalid) |
| 403 | Not authorized (JWT valid, but the role lacks the permission) |
| 404 | Resource not found |
| 409 | Conflict (real example: `PATCH /api/products/{id}/stock` trying to reserve more stock than available) |
| 422 | Unprocessable entity (the payload is syntactically valid but violates a business invariant — example: `unitPrice` doesn't match `quantity * unitPrice` on a sale line) |
| 500 | Server error |

**Note on 204 and `DELETE`:** no endpoint in the system uses a physical
`DELETE` HTTP verb result — `entities-and-rules.md` and `models.md`
already establish that the whole system uses soft deletion via the
`active` field. What would be `DELETE /api/customers/{id}` in other
projects is `DELETE /api/customers/{id}` here too, but internally it
performs `active = false` (not a real `DELETE FROM`) — the HTTP verb
stays because semantically it's still "deactivate this resource", but
the actual database operation never removes the row. It returns `200 OK`
with the updated resource (`active: false`), not `204`, so the client
sees the resulting state without having to fetch it again.

---

## Error format

```json
{
  "error": "VALIDATION_ERROR",
  "message": "The email field is required",
  "details": [
    { "field": "email", "message": "required" }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `error` | string | Stable `SCREAMING_SNAKE_CASE` error code — the frontend can branch logic on this field |
| `message` | string | Human-readable message, in English (per `documentation-rules.md`, "Language" — error messages to the frontend) |
| `details` | array, optional | Field-by-field error list, present only on 400/422 validation errors |

**Catalog of error codes used in this project** (expanded as needed —
new codes are not invented without adding them here):

| Code | When it appears |
|---|---|
| `VALIDATION_ERROR` | Payload with missing or malformed fields (400) |
| `UNAUTHENTICATED` | JWT missing, expired, or with an invalid signature (401) |
| `FORBIDDEN` | Valid JWT, role lacks the required permission (403) |
| `NOT_FOUND` | The requested resource doesn't exist or isn't active (404) |
| `INACTIVE_CUSTOMER` | Attempting to create a sale for a customer with `active = false` (422) |
| `INSUFFICIENT_STOCK` | Attempting to reserve/sell more stock than available (409) |
| `INVARIANT_VIOLATION` | A business rule is violated (e.g. `subtotal ≠ quantity * unitPrice`) (422) |

---

## Correlations

- Authentication strategy → `07-api/authentication.md`
- OpenAPI contracts per service → `07-api/contracts/openapi/`
- Real endpoints fixed → `05-architecture/decisions/records/ADR-001-architecture.md`, §8
- Business invariants that generate the 422 errors → `02-domain/entities-and-rules.md`
