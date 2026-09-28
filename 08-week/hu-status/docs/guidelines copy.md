# REST Guidelines

> SynkroTech's REST standard. The entire team must follow this before
> designing a new endpoint.

---

## Versioning

**Decision: every route is versioned under `/api/v1/`** (`/api/v1/customers`).

- The gateway routes by version prefix, one route file per domain (ADR-008), so a future `/api/v2/…` can run beside `/api/v1/…` while clients move over.
- The contract of every service states which version it serves, so a client can tell from the URL which contract it is calling.

This replaces the earlier decision of unversioned routes: that decision assumed a single frontend moving in lockstep with the backend, but the portals are now deployed independently of each other (ADR-008) and cannot all switch at once.

**Health checks are the exception:** `GET /health` is not versioned and requires no token (`05-architecture/cross-cutting.md` §4).

---

## Endpoint naming

- Plural for collections: `GET /api/v1/customers`, not `/api/v1/customer`
- Nouns, not verbs: `GET /api/v1/sales/{id}` (not `GET /api/v1/getSale`)
- kebab-case for multi-word URL segments: `/api/v1/stock-reservations`
- Nested sub-resources only when the relationship is real ownership: `POST /api/v1/products/{id}/stock-adjustments` (an adjustment belongs to the product), never for references between distinct aggregates — a sale references its customer and products by ID in the body
- **State transitions** are a `POST` to a sub-resource named after the transition: `POST /api/v1/stock-reservations/{id}/release`, `POST /api/v1/stock-alerts/{id}/resolve`. A transition that is already done answers `200` with the resource unchanged; a transition the current status does not allow answers `422 INVALID_STATUS_TRANSITION`
- A fixed path segment takes precedence over `{id}`: `/api/v1/products/categories` is not read as a product with id `categories`

---

## Payload conventions

| Aspect | Rule |
|---|---|
| Field names | JSON in `camelCase` |
| Identifiers | UUID v4 |
| Money | Integer in minor units (1/100 COP), named `…Cents`; never floating point (ADR-005) |
| Timestamps | RFC 3339 in UTC (`2026-09-15T10:30:00Z`) |
| Date-only parameters | RFC 3339 full date (`2026-09-15`), interpreted as a UTC day |
| Domain entities | Never serialized directly: the HTTP adapter translates them into a response object, so renaming a domain field never breaks a client |

---

## Lists

**Every list is paginated, offset-based:** `page` from 1 and `limit` from 1 to 100 (default 20). This includes the sales reports: a list without a limit is a defect, not a simplification.

```
GET /api/v1/sales?page=1&limit=20
```

```json
{
  "data": [ ... ],
  "meta": { "page": 1, "limit": 20, "total": 142, "totalPages": 8 }
}
```

- Results are ordered newest first, with a stable order.
- A `limit` out of range, or a filter the endpoint does not declare, answers `400 VALIDATION_ERROR`.
- Cursor-based pagination is not used: no list in the MVP has the volume or the concurrent inserts that would justify it.

---

## Idempotent creation

Every operation that creates a resource requires the `Idempotency-Key` header (8 to 128 characters). The key and the resource are written in the same transaction (ADR-005).

| Request | Response |
|---|---|
| First request with a key | `201`, with `Location` and the created resource |
| Same key again | `200`, with the same resource; nothing new is created |
| No key | `400 VALIDATION_ERROR` |

The saga uses `<sagaId>:<step>` as the key of each step (ADR-007).

---

## Correlation

Every request carries `X-Correlation-Id`: the gateway generates one if the client sends none, every service reuses it on its own calls, returns it in the response, writes it in every log line and uses it as the `traceId` of any error (`05-architecture/cross-cutting.md` §3).

---

## Standard responses

| Code | When to use it |
|---|---|
| 200 | Success with a body; also a repeated creation with the same `Idempotency-Key`, and a transition that was already done |
| 201 | Successful creation, with `Location` |
| 204 | Success without a body (not currently used — there is no physical `DELETE` anywhere in the system, per the soft-delete pillar; see note below) |
| 400 | Client error (payload validation, unknown filter, missing `Idempotency-Key`) |
| 401 | Not authenticated (token missing, expired, or invalid) |
| 403 | Not authorized (valid token, but its roles or permissions do not allow the operation) |
| 404 | Resource not found |
| 409 | Not used: a business conflict is a `422 BUSINESS_RULE_VIOLATION` (see the catalog below) |
| 422 | The payload is valid but a business rule or a state transition rejects it (`BUSINESS_RULE_VIOLATION`, `INVALID_STATUS_TRANSITION`) |
| 429 | Gateway only: rate limit exceeded, with `Retry-After` |
| 500 | Server error |
| 503 | Gateway only: the target service cannot be reached |

**Note on 204 and `DELETE`:** no endpoint in the system uses a physical
`DELETE` HTTP verb result — `entities-and-rules.md` and `models.md`
already establish that the whole system uses soft deletion via the
`active` field. `DELETE /api/v1/customers/{id}` internally
performs `active = false` (not a real `DELETE FROM`) — the HTTP verb
stays because semantically it's still "deactivate this resource", but
the actual database operation never removes the row. It returns `200 OK`
with the updated resource (`active: false`), not `204`, so the client
sees the resulting state without having to fetch it again. Deactivating
a resource that is already inactive also answers `200`.

---

## Contract files

- One OpenAPI 3.0 file per service in `07-api/contracts/openapi/`; every path includes its `/api/v1/…` prefix.
- Every contract lists one server, the local gateway: `http://localhost:8000`. Services are never called on their own port from outside the network. More servers are added only when the `qa` and `main` environments exist.
- Errors, pagination, the `Idempotency-Key` and `X-Correlation-Id` headers and the security scheme are referenced from `_shared.yaml`, never redefined.

---

## Error format

```json
{
  "error": "VALIDATION_ERROR",
  "message": "The email field is required",
  "details": [
    { "field": "email", "message": "required" }
  ],
  "traceId": "4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90"
}
```

| Field | Type | Description |
|---|---|---|
| `error` | string | Stable `SCREAMING_SNAKE_CASE` code from the closed catalog below — the frontend can branch logic on this field |
| `message` | string | Human-readable message, in English (per `documentation-rules.md`, "Language" — error messages to the frontend) |
| `details` | array, optional | Per-field detail (`field`, `message`); present on validation errors and when a business rule names the field |
| `traceId` | string | The request's `X-Correlation-Id` (`05-architecture/cross-cutting.md` §3) |

Every error uses this envelope, including unknown routes, methods not allowed and malformed JSON. It never contains a driver message, a stack trace or an internal host name.

**Catalog of error codes — closed.** This is the only catalog in the repository (`05-architecture/cross-cutting.md` §1 refers here). No service adds a code: a domain rule is expressed as `BUSINESS_RULE_VIOLATION`, with the rule in `message` and the field in `details`.

| Code | HTTP | When it appears |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing or malformed fields, a `limit` out of range, an unknown filter, malformed JSON |
| `UNAUTHORIZED` | 401 | Token missing, expired, malformed or with an invalid signature; wrong login credentials; invalid refresh token |
| `FORBIDDEN` | 403 | Valid token, but its roles or permissions do not allow the operation |
| `NOT_FOUND` | 404 | The resource does not exist or is not active; unknown route |
| `INVALID_STATUS_TRANSITION` | 422 | The resource's current status does not allow the requested transition |
| `BUSINESS_RULE_VIOLATION` | 422 | A domain rule rejects the request |
| `INTERNAL_ERROR` | 500 | Unexpected failure; the detail goes only to the log |
| `TOO_MANY_REQUESTS` | 429 | **Gateway only** — rate limit exceeded; the response includes `Retry-After` |
| `SERVICE_UNAVAILABLE` | 503 | **Gateway only** — the target service cannot be reached |

**Previous codes and how they are expressed now:**

| Previous code | Now |
|---|---|
| `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `INVALID_REFRESH_TOKEN` | `401 UNAUTHORIZED` (the message never reveals whether an email exists) |
| `EMAIL_ALREADY_EXISTS`, `IDENTITY_DOCUMENT_ALREADY_EXISTS`, `CATEGORY_ALREADY_EXISTS` | `422 BUSINESS_RULE_VIOLATION`, with the field in `details` |
| `INSUFFICIENT_STOCK`, `INACTIVE_CUSTOMER`, `CUSTOMER_INACTIVE` | `422 BUSINESS_RULE_VIOLATION`, with the rule in `message` |
| `INVARIANT_VIOLATION` | `422 BUSINESS_RULE_VIOLATION` |
| `SALE_REGISTRATION_ERROR` | Not an HTTP error: the saga ends `COMPENSATED` and reports its failed step (ADR-007) |

---

## Correlations

- Authentication strategy → `07-api/authentication.md`
- OpenAPI contracts per service and shared components → `07-api/contracts/openapi/`
- Endpoints fixed by the decision records → `05-architecture/decisions/records/ADR-001-architecture.md` §8 and `05-architecture/decisions/records/ADR-004-api-contract-extensions.md`
- Money in minor units and idempotency keys → `05-architecture/decisions/records/ADR-005-data-isolation-per-domain.md`
- Gateway routing by version prefix → `05-architecture/decisions/records/ADR-008-cross-cutting-stack.md`
- Correlation, limits and retries → `05-architecture/cross-cutting.md`
- Business invariants that generate the 422 errors → `02-domain/entities-and-rules.md`
