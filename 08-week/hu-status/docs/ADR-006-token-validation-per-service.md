# ADR-006 — Token Validation in Every Service and Service Credentials

| Field | Value |
|-------|-------|
| **ID** | ADR-006 |
| **Date** | 2026-09-27 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — Tech Lead |
| **Reviewers** | Jordan Ramirez Gallego, Sergio Andrés Ordóñez Díaz, Fredman Santiago Plazas Artunduaga — Development team |
| **Modifies** | ADR-003 Decision 2 (JWT Validation); ADR-003 Decision 1, "Gateway scope" paragraph (internal traffic as trusted); ADR-002 Alternative A (source of `created_by`) |

---

## Context

ADR-003 Decision 2 moved JWT validation to `synkro-api-gateway`: the gateway checks the token once and forwards `X-User-Id` and `X-User-Roles`, and the domain services trust those headers without validating anything. ADR-003 Decision 1 added that internal calls (for example `synkro-workflow` → `customers-api`) bypass the gateway and are trusted because they come from inside the network.

That model has four problems:

1. **Trust depends on one network rule.** ADR-003 itself states that if a domain service becomes reachable without passing through the gateway, it accepts any forged header as valid, with no way to detect it. A single misconfigured port turns every service into an open door.
2. **Internal calls carry no identity at all.** Anything that runs inside the network (the workflow, the worker, or a compromised container) can call any domain service as any user by setting two headers. The gateway never sees those calls, so it cannot protect them.
3. **The workflow and the worker have no credential of their own.** The worker acts without any person behind it, so it has no token to present. If the workflow reused the salesperson's token, it could expire in the middle of a compensation (access tokens last 1 hour), and the salesperson would need permissions such as reserving stock, which would let them call that operation directly.
4. **Sale authorship comes from a trusted header.** ADR-002 extracts `created_by` from the JWT `sub`, but under ADR-003 `sales-api` reads it from `X-User-Id`, a header anyone inside the network can set.

**Constraints:**
- ADR-002 and ADR-003 are immutable; this ADR replaces sections of them without editing them.
- `synkro-auth-api` is the only service that holds the RS256 private key; that does not change.
- The gateway is declarative configuration with no custom code (ADR-008).
- Access tokens last 1 hour and refresh tokens 7 days (`00-governance/security-policy.md`).

---

## Decision 1 — Every service validates the token

### Options

**Option A — Only the gateway validates and forwards trusted headers (current, ADR-003 Decision 2).**
- **Pros:** one validation configuration; services stay simpler.
- **Cons:** services accept forged headers; internal calls have no identity; security depends on one network rule.

**Option B — Every service validates the token; the gateway only checks that a credential is present.**
- **Pros:** a service is safe even if it becomes reachable by mistake; internal calls are authenticated like external ones; the gateway stays declarative.
- **Cons:** the same validation is implemented in five services; the public key must reach all of them.

**Option C — Every service validates the token; the gateway checks nothing.**
- **Pros:** no authentication logic at the edge at all.
- **Cons:** requests without any credential reach every service and consume its resources before being rejected.

### Decision

**We decided: Option B.** Every service that receives requests validates the JWT by itself: the four `-api` services and `synkro-workflow`. `synkro-worker` receives no requests, so it validates nothing.

Validation rules, identical in Java and Go:

- Only `RS256` is accepted. `none`, `HS256` and any other algorithm are rejected explicitly, whatever the token header says.
- The signature is verified with the public key of `synkro-auth-api`, provided as `JWT_PUBLIC_KEY` (PEM) or `JWT_PUBLIC_KEY_FILE` (path).
- `exp` and `sub` are required. A clock skew of up to 30 seconds is tolerated.
- A missing, malformed, expired or wrongly signed token is answered with `401 UNAUTHORIZED`, using the common error envelope.

The gateway only checks that protected routes carry an `Authorization` header, and answers `401 UNAUTHORIZED` when it is missing. Public routes (login, refresh, `/health`) are listed in its route files. The gateway does not validate signatures and does not forward identity headers.

Distributing the key by environment variable is kept (`05-architecture/cross-cutting.md` §5); a JWKS endpoint remains a future candidate.

### Dominant criterion

**No call is accepted without a valid credential, whatever path it takes to reach the service.** Security does not depend on a network rule staying correct.

### Accepted cost

- The same validation is written and tested in five services, in two languages.
- Rotating the key pair means redeploying every service that validates, not only the gateway.

---

## Decision 2 — Service tokens for the workflow and the worker

### Options

**Option A — Internal calls are trusted because they come from the network (current, ADR-003 Decision 1).**
- **Pros:** nothing to issue or rotate.
- **Cons:** internal calls carry no identity; anything inside the network can act as anyone.

**Option B — The workflow forwards the person's token.**
- **Pros:** no new credential type.
- **Cons:** the token can expire in the middle of a compensation; the worker has no person behind it; people would need the permissions the saga uses, which would let them call those operations directly.

**Option C — Service tokens issued by `synkro-auth-api` and stored as environment secrets.**
- **Pros:** each service has its own identity and only the permissions it needs; the token does not depend on any person's session; nothing changes at runtime for the other services.
- **Cons:** tokens must be rotated by hand before they expire; a leaked token stays valid until it expires.

**Option D — Client credentials fetched at runtime.** Each service holds an ID and a secret and asks `synkro-auth-api` for short-lived tokens.
- **Pros:** short-lived tokens; automatic renewal.
- **Cons:** a new runtime dependency on `synkro-auth-api` and a new flow to build and secure in it; a client secret still has to be stored.

### Decision

**We decided: Option C.** `synkro-auth-api` issues service tokens through `POST /api/v1/auth/service-tokens`, available only to `ADMIN`. A service token is a JWT signed with the same RS256 key, with:

| Claim | Value |
|---|---|
| `sub` | The service name (`synkro-workflow`, `synkro-worker`) |
| `roles` | `["SERVICE"]` |
| `permissions` | Only the permissions listed below |
| `iat`, `exp` | Issue time; expiry 30 days later |
| `jti` | Unique token ID |

| Service | Permissions |
|---|---|
| `synkro-workflow` | `customers:read`, `stock:reserve`, `stock:release`, `sales:register` |
| `synkro-worker` | `products:read`, `stock-alerts:read`, `stock-alerts:write` |

- `SERVICE` is a token role only. It cannot be assigned to a system user.
- The token is stored as the `SERVICE_TOKEN` secret of each environment and sent as `Authorization: Bearer <token>` on every internal call.
- In `develop`, the development-key scripts of `synkro-infra` generate it; in `qa` and `main` it is issued by `synkro-auth-api` and stored as an environment secret.
- Rotation: before the token expires, an `ADMIN` issues a new one, the secret is replaced and the service is restarted.
- A new permission set requires updating this table in a new ADR.

### Dominant criterion

**Every internal call carries its own identity, limited to what that service needs**, without depending on a person's session or adding a runtime dependency on `synkro-auth-api`.

### Accepted cost

- Service tokens are rotated by hand every 30 days.
- A leaked service token stays valid until it expires, because services validate locally and do not check revocation. Its narrow permissions limit the damage.

---

## Decision 3 — Identity from claims, and sale authorship

### Options

**Option A — Services read identity from `X-User-Id` and `X-User-Roles` (current).**
- **Pros:** no change in services.
- **Cons:** the headers can be set by any caller inside the network.

**Option B — Services read identity from the validated token; the workflow sends the salesperson as `createdBy`, accepted only from callers holding `sales:register`.**
- **Pros:** every identity comes from a signed token; authorship is set by the only caller allowed to register sales.
- **Cons:** `sales-api` must distinguish the service caller from a person.

**Option C — The workflow sends both its own token and the person's token.**
- **Pros:** `sales-api` sees the person directly.
- **Cons:** two credentials per call, a non-standard header, and the person's token can still expire mid-saga.

### Decision

**We decided: Option B.**

- Services ignore any `X-User-*` header. Identity, roles and permissions come only from the claims of the validated token (`sub`, `roles`, `permissions`). A caller without the required permission receives `403 FORBIDDEN`.
- The workflow validates the salesperson's token when a sale starts, and stores that `sub` in the saga state (ADR-007). When it calls `POST /api/v1/sales`, it sends that value as `createdBy` in the body, using its service token.
- `sales-api` accepts `createdBy` only from a caller holding `sales:register`; any other caller receives `403 FORBIDDEN`. `created_by` keeps its meaning from ADR-002: the user who registered the sale.
- The "own sales only" filter for `SALESPERSON` compares `created_by` with the `sub` of the person's validated token.

### Dominant criterion

**Every identity the system records comes from a signed token**, including the authorship of a sale registered by the workflow on behalf of a salesperson.

### Accepted cost

- `sales-api` has one operation that trusts a body field, and it depends entirely on the `sales:register` permission being granted only to the workflow.

---

## Consequences

**What changes in the system:**
- `JWT_PUBLIC_KEY` reaches the four `-api` services and `synkro-workflow`; `SERVICE_TOKEN` reaches `synkro-workflow` and `synkro-worker`; `JWT_PRIVATE_KEY` stays only in `synkro-auth-api`.
- The gateway stops validating signatures and stops forwarding identity headers.
- The "Network Guarantee — JWT Header Trust" model in `deployment.md` disappears. Network isolation still limits exposure, but it is no longer what makes a request trustworthy.
- `synkro-auth-api` gains one ADMIN-only operation to issue service tokens.

**What must be watched:**
- Service token expiry: an expired token stops the saga and the worker at once. The expiry date of each token is tracked in `15-project-control/risks.md`.
- Validation drift between the Java and Go implementations: the automated HTTP checks of every service (`11-quality/testing-strategy.md`) cover the same token cases in both languages.

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| `07-api/authentication.md` | Rewrite the flow, add service tokens and sale authorship; remove the stale note about `security-policy.md` (HU-DOCS-48) |
| `00-governance/security-policy.md`, `00-governance/security-rules.md` | Per-service validation, service tokens, internal communication (HU-DOCS-48) |
| `05-architecture/security-threat-model.md` | Per-service validation, leaked service token, algorithm confusion, forged headers (HU-DOCS-49) |
| `05-architecture/cross-cutting.md` | §5 key distribution to every validating service; §6 CORS headers; summary (HU-DOCS-50) |
| `05-architecture/deployment.md` | Replace "Network Guarantee — JWT Header Trust"; environment variables per service (HU-DOCS-45) |
| `05-architecture/overview.md` | Principle P3 (HU-DOCS-51) |
| `02-domain/entities-and-rules.md`, `01-context/glossary.md` | `Sale.createdBy` provided by the saga; "Service token" (HU-DOCS-43) |
| `06-data/models.md`, `06-data/data-dictionary.md` | Source of `created_by` (HU-DOCS-47) |
| `07-api/contracts/openapi/` | Service-token endpoint; permissions per operation (HU-DOCS-55 to HU-DOCS-59) |
| ADR-004 | Service-token endpoint in the endpoint register (HU-DOCS-54) |
| `09-microservices/service-catalog.md` | Communication matrix with service tokens (HU-DOCS-70) |
| `04-requirements/non-functional.md`, `04-requirements/traceability-matrix.md` | NFR-004 (HU-DOCS-66) |
| `00-governance/definition-of-done.md` | Integration checklist (HU-DOCS-62) |
| `05-architecture/hexagonal-architecture.md` | `createdBy` accepted only with `sales:register` (HU-DOCS-68) |
| `15-project-control/risks.md` | Service token expiry and leakage (HU-DOCS-64) |
| `05-architecture/decisions/README.md` | ADR-006 row; ADR-002 and ADR-003 marked as modified (this PR) |
| ADR-002, ADR-003 | **No changes**: immutable |

---

## Immutability rule

Once this ADR is `Accepted`, it is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

---

## References

- Original authentication model → `05-architecture/decisions/records/ADR-001-architecture.md` §6
- Gateway validation and internal traffic → `05-architecture/decisions/records/ADR-003-gateway-saga-async.md`, Decisions 1 and 2
- `created_by` → `05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md`
- Token lifetimes and permissions format → `00-governance/security-policy.md`
- Key distribution → `05-architecture/cross-cutting.md` §5
- Saga state that stores the salesperson → ADR-007
- Gateway technology → ADR-008
