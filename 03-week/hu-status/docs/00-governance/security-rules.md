# Technical Security Rules

> Mandatory technical controls that apply to all project code.
> These rules complement the security policy (`security-policy.md`) with
> concrete implementation practices for the Java (Spring Boot) and Go stacks.

---

## OWASP Top 10 — Controls per category

### A01 — Broken Access Control

**Rules:**
- Every protected endpoint MUST have the authentication middleware/filter applied (Spring Security in Java, custom middleware in Go)
- Permissions are verified in the application layer (use case), not in the controller
- A resource is only returned if the user has `[resource]:read` permission
- Write actions require `[resource]:write` or the corresponding specific permission

### A02 — Cryptographic Failures

**Rules:**
- Passwords: use **bcrypt** with cost factor ≥ 12. Never MD5 or SHA-1 for passwords
- JWTs: sign with RS256 (asymmetric), as defined in ADR-001
- Sensitive data in transit: HTTPS mandatory in all environments except local
- Never log passwords, tokens, or card data

### A03 — Injection

**Rules:**
- Parameterized queries ALWAYS. Zero concatenated SQL strings.
- Validate and sanitize all inputs with a validation library (Bean Validation in Java, `go-playground/validator` in Go)
- Each service operates exclusively on its own schema (`auth`, `clients`, `products`, `sales`) — never build the schema name from user input

### A05 — Security Misconfiguration

```
# Verification checklist per environment
□ Stack traces NOT visible in production
□ Security headers configured
□ Unnecessary ports closed
□ Development credentials NOT in production
```

### A06 — Vulnerable Components

**Rules:**
- Run a dependency scan (`mvn dependency-check` in Java, `govulncheck` in Go) before each release
- Critical/High vulnerabilities block the deploy
- Renew dependencies each sprint (at least once)

### A07 — Identification and Authentication Failures

- JWT with maximum expiration of **1 hour** for access tokens
- Refresh tokens with expiration of **7 days** and rotation on each use
- Rate limiting on `/api/auth/login`: maximum 10 attempts per IP in 5 minutes

### A09 — Security Logging and Monitoring Failures

- Every failed authentication must be logged with IP, timestamp
- Logical delete operations (`active = false`) logged with who, when, and what was deactivated
- Security logs are retained for a minimum of 90 days

---

## User input handling

**Rule:** all external inputs (HTTP body, query params, path params) pass through a validation schema before reaching the domain.

- Java: use `jakarta.validation` (`@Valid`, `@NotNull`, `@Email`, etc.) on the input DTOs of each controller.
- Go: use `go-playground/validator` with input structs validated before invoking the use case.

---

## Secure error handling

**Rule:** never expose internal details (stack traces, database exception messages) in the HTTP response. Respond with a generic error code and log the detail only on the server side.

```
✗ BAD — exposes internal details to the client
✓ GOOD — generic message + internal error code for log correlation
```

---

## Correlations

- Security policy (management, access) → `00-governance/security-policy.md`
- Authentication and JWT → `07-api/authentication.md`
- Security architecture decision → `05-architecture/decisions/records/ADR-001-architecture.md`
