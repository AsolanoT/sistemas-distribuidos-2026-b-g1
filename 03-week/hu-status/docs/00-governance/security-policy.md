# Security Policy

> Security is not a feature — it is a system property built from day one. This document
> defines the mandatory practices.
> Any deviation must be explicitly approved by the team.

---

## Security principles

1. **Defense in Depth:** Multiple security layers. If one fails, the others contain the damage.
2. **Least Privilege:** Each component has only the minimum necessary permissions (see the per-schema DB user mechanism in ADR-001).
3. **Fail Secure:** In case of error, the system denies access, does not allow it.
4. **Security by Design:** Security controls are designed from the start, not added at the end.
5. **Zero Trust:** Always verify, never implicitly trust, even within the internal network (every microservice validates the JWT locally, no exceptions).

---

## Authentication

### JWT (JSON Web Tokens)

| Property | Required value |
|----------|---------------|
| Signing algorithm | RS256 (asymmetric) — defined in ADR-001 |
| Access token expiration | 1 hour (`exp`) |
| Refresh token expiration | 7 days |
| Required claims | `sub` (userId), `roles`, `permissions`, `iat`, `exp`, `jti` (unique token ID) |
| Client storage | `httpOnly cookie` (web) |

**Prohibited in the payload:**
- Passwords
- Card data
- Full PII (only the user ID)

### Refresh Token

- Stored in the `auth` schema database (with bcrypt hash)
- Mandatory rotation on each use (one refresh token = one use)
- Invalidated on logout and on password change
- ALL active tokens invalidated if use of a revoked token is detected

---

## Authorization

### RBAC (Role-Based Access Control)

| Role | Description | Permissions |
|------|-------------|------------|
| `ADMIN` | Business administrator | Full access: users/roles, clients, products, sales, and reports |
| `SALESPERSON` | Sales staff | Manages clients, creates sales, checks stock, views reports of their own sales |
| `INVENTORY` | Inventory staff | Manages products, categories, and stock; no access to clients, sales, or reports |

**Permission model:**

```
Permission: [resource]:[action]

Examples applied to the project:
  clients:create
  clients:read
  clients:update
  clients:delete
  products:read
  products:write
  sales:create
  sales:read
  reports:read
  users:manage
```

**Validation:**
- Each microservice validates the JWT locally (signature and expiration) using Auth's public key.
- Each service validates the role's permissions for the specific operation on its own resources.
- Roles are included in the JWT as claim `roles: ["SALESPERSON"]`.

---

## Secure communication

### Transmission

- **HTTPS mandatory** in all environments except local
- TLS 1.2 minimum; TLS 1.3 recommended
- HSTS enabled in production

### Internal service-to-service communication

- Bearer token (JWT) for synchronous communication between the 4 microservices (Sales → Clients, Sales → Products)

---

## Secret management

```
✗ NEVER in source code
✗ NEVER in a committed .env
✗ NEVER in logs
✗ NEVER in client error messages
✓ Environment variables
✓ Per-service database credentials (auth_user, clients_user, products_user, sales_user) injected via environment variable
```

**Secret rotation:**
- DB passwords: every 6 months or immediately if compromise is suspected

---

## Input validation and sanitization

### General rules

1. **Never trust user input.** Validate at the edge (controller) before processing.
2. **Whitelist, not blacklist.** Define what is allowed, not only what is prohibited.
3. **Reject early.** If input is invalid, respond 400 and do not process further.

### SQL Injection prevention

With separate schemas per service (see ADR-001), each service MUST use parameterized queries exclusively against its own schema — never build dynamic SQL with the schema or table name derived from user input.

---

## OWASP Top 10 — Review checklist

| Vulnerability | Implemented control |
|---------------|-------------------|
| A01: Broken Access Control | RBAC + permission validation in each service |
| A02: Cryptographic Failures | TLS 1.2+, bcrypt for passwords, RS256 for JWT |
| A03: Injection | Prepared parameters in SQL, schema validation |
| A05: Security Misconfiguration | Review of defaults before each release |
| A07: Authentication Failures | JWT with rotation, minimal per-service schema permissions |
| A09: Logging Failures | Logs without PII, security events recorded |

---

## Audit and security logs

### Events that are ALWAYS recorded

```
auth.login.success
auth.login.failure
auth.token.revoked
auth.unauthorized_access_attempt
admin.role.changed
```

**Required fields in security logs:**
- `userId` (or `ANONYMOUS` if not authenticated)
- `action`
- `resource`
- `result` (SUCCESS / FAILURE)
- `timestamp`

---

## Correlations

- Security non-functional requirements → `04-requirements/non-functional.md`
- Authentication ADR → `05-architecture/decisions/records/ADR-001-architecture.md`
- RBAC implemented in → `09-microservices/services/01-auth/`
