# Authentication and Authorization Strategy

> **Note on a known inconsistency:** `00-governance/security-policy.md`
> still describes the pre-ADR-003 model ("each microservice validates
> the JWT locally"). That model changed — see ADR-003 §2, which
> `05-architecture/overview.md`'s own "Adopted Architectural Patterns"
> table explicitly marks as "supersedes ADR-001 §6". This document
> describes the **current, correct** model (ADR-003). Correcting
> `security-policy.md` so it stops contradicting this remains a
> separate, pending HU — not resolved here, but flagged so no one builds
> on the old version in the meantime.

---

## Mechanism: JWT (RS256), validated once at the Gateway

**Decision (ADR-003 §2):** `synkro-api-gateway` validates the JWT
**exactly once**, using `auth-service`'s RS256 public key. The 4 domain
services (`auth`, `customers`, `products`, `sales`) **do not re-validate
the token** — they trust the headers the Gateway forwards.

```
Client ──JWT (Bearer)──> Gateway ──validates signature + exp──┐
                                                                 │
                          X-User-Id: <sub>                       │
                          X-User-Roles: <roles>                    ▼
                                                          auth-service
                                                          customers-service
                                                          products-service
                                                          sales-service
```

**Why this is secure:** only if the network guarantees no domain
service is reachable without passing through the Gateway first. That
network guarantee is documented in `05-architecture/deployment.md`,
"Network Guarantee" section — this document doesn't repeat it, only
references it.

**Internal traffic (`synkro-workflow` → domain services) doesn't pass
through the Gateway** — it's East-West traffic between trusted
services, not an external request. `synkro-workflow` doesn't need the
end user's JWT to call `customers-api`/`products-api`/`sales-api` —
those internal calls are authenticated by being inside the internal
network (see `deployment.md`, "Network Guarantee"), not by repeating
the JWT.

---

## Token shape

| Claim | Content | Required |
|---|---|---|
| `sub` | `user_id` (UUID) | Yes |
| `roles` | Array, e.g. `["SALESPERSON"]` | Yes |
| `permissions` | Array of granular permissions (see table below) | Yes |
| `iat` | Issued-at timestamp | Yes |
| `exp` | Expiration timestamp | Yes |
| `jti` | Unique token ID (for revocation) | Yes |

**Prohibited in the payload:** passwords, card data, full PII (only
`user_id`) — per `00-governance/security-policy.md`.

**Expiration:** access token 1 hour, refresh token 7 days.
**Algorithm:** RS256 (asymmetric) — the Gateway consumes the public key;
the private key never leaves `auth-service`.

---

## Headers the Gateway forwards to domain services

| Header | Content | Example |
|---|---|---|
| `X-User-Id` | The JWT's `sub` claim, already validated | `9f8e7d6c-...` |
| `X-User-Roles` | The `roles` claim, as a comma-separated string | `SALESPERSON` |

Domain services read these headers directly — **they never receive or
process the original JWT**. This is what makes it possible for
`customers-service`/`products-service` (Java, unchanged by ADR-003 in
their business code) to need no knowledge of JWT/RS256 whatsoever.

---

## RBAC — Roles and permissions

| Role | Description | Permissions |
|---|---|---|
| `ADMIN` | Business administrator | Full access: users/roles, customers, products, sales, reports |
| `SALESPERSON` | Sales staff | Manages customers, creates sales, checks stock, views their own sales' reports |
| `INVENTORY` | Inventory staff | Manages products, categories, and stock; no access to customers, sales, or reports |

**Permission model** (per `security-policy.md`):

```
customers:create   customers:read   customers:update   customers:delete
products:read      products:write
sales:create        sales:read
reports:read
users:manage
```

**Authorization table per endpoint** (the 10 real endpoints from
ADR-001 §8, cross-checked against the 3 roles):

| Endpoint | Method | `ADMIN` | `SALESPERSON` | `INVENTORY` |
|---|---|---|---|---|
| `/api/auth/register` | POST | Public — no JWT required (ADR-001 §8) | Public | Public |
| `/api/auth/login` | POST | Public — no JWT required | Public | Public |
| `/api/auth/refresh` | POST | Requires a valid refresh token, no specific role | same | same |
| `/api/customers` | POST | ✅ | ✅ | ❌ |
| `/api/customers/{id}` | GET/PUT | ✅ | ✅ | ❌ |
| `/api/customers/{id}` | DELETE (soft) | ✅ | ✅ | ❌ |
| `/api/products` | POST | ✅ | ❌ | ✅ |
| `/api/products/{id}/stock` | PATCH | ✅ | ❌ (read-only stock lookup, no write) | ✅ |
| `/api/sales` | POST | ✅ | ✅ | ❌ |
| `/api/sales/{id}` | GET | ✅ | ✅ (own sales only — filtered by `created_by`, see ADR-002) | ❌ |
| `/api/sales/reports/*` | GET | ✅ | ✅ (own sales only) | ❌ |

**Note on `register` being public:** ADR-001 §8 explicitly exempts
`register` — along with `login` — from requiring a Bearer token. As
written, this means anyone can create an account with any role (including
`ADMIN`) without prior authentication. This is an accepted simplification
for the academic MVP, not a production-grade access control — ADR-001's
exception list is explicit and, per its own immutability rule, changing
this would require a new ADR, not a silent reinterpretation here.

**Note on "own sales only":** this filter exists thanks to the
`created_by` field ADR-002 added to the `sales` table — without it,
`SALESPERSON` couldn't distinguish "my sales" from "all sales".
`sales-service` applies this filter by reading `X-User-Id` and
comparing it against `sales.created_by`.

**Where each permission is validated:** the Gateway validates the JWT's
signature/expiration (authentication). Each domain service validates
the specific permission for its own operation (authorization) — the
Gateway doesn't know each service's business rules, it only routes and
trusts the forwarded role.

---

## Authentication/authorization error responses

Follow `07-api/guidelines.md`'s standard format:

**401 — JWT missing, expired, or with an invalid signature** (detected
by the Gateway):
```json
{
  "error": "UNAUTHENTICATED",
  "message": "Missing or invalid authentication token"
}
```

**403 — Valid JWT, but the role lacks the permission** (detected by the
domain service, using the `X-User-Roles` header):
```json
{
  "error": "FORBIDDEN",
  "message": "Role INVENTORY is not authorized to create sales"
}
```

---

## Refresh token flow

- Stored in `auth.refresh_tokens` (bcrypt hash, not plaintext)
- **Mandatory rotation on every use**: one refresh token = one use;
  `POST /api/auth/refresh` invalidates the used token and issues a new one
- Invalidated on logout and on password change
- If a revoked token's use is detected, **all** of the user's active
  tokens are invalidated (a signal of token theft)

---

## Correlations

- Decision that moves validation to the Gateway → `05-architecture/decisions/records/ADR-003-gateway-saga-async.md`, §2
- Network guarantee that makes this secure → `05-architecture/deployment.md`, "Network Guarantee"
- General security policy (partially outdated, see note above) → `00-governance/security-policy.md`
- `created_by` field for the "own sales" filter → `05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md`
- Standard error format → `07-api/guidelines.md`
