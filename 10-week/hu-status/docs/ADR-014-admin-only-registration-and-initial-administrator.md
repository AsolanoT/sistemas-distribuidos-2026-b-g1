# ADR-014 — Admin-Only User Registration and Initial Administrator Creation

| Field | Value |
|-------|-------|
| **ID** | ADR-014 |
| **Date** | 2026-10-10 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo |
| **Reviewers** | Jordan Ramirez Gallego, Sergio Andrés Ordóñez Díaz, Fredman Santiago Plazas Artunduaga — Development team |
| **Modifies** | ADR-001 §8 (Main APIs): registration visibility only |
| **Builds on** | ADR-004 (Auth endpoints and contract conventions), ADR-006 (local token validation), ADR-009 (shared PostgreSQL database), ADR-012 (infrastructure bootstrap and service credentials) |

---

## Context

`POST /api/v1/auth/register` is currently documented as a public operation. Any caller can request the creation of a user with one of the supported human roles, including `ADMIN`. This was an accepted simplification under ADR-001 §8.

Two problems require a decision:

1. **Uncontrolled user creation and missing attribution.** Creating an internal employee account is an administrative operation. It must require an authenticated administrator and preserve a record of who performed it.
2. **Initial administrator creation.** Once ordinary registration requires an administrator, a separate procedure is needed to create the first administrator before any administrator can authenticate.

These are related decisions with different entry points: ordinary registration is an authenticated API operation; initial administrator creation is a controlled operational procedure.

**Constraints:**

- The gateway checks only for the presence of an `Authorization` header on protected routes. Each service validates tokens locally, as decided in ADR-006.
- Authentication belongs to the service's authentication adapter. Authorization for user creation is enforced by the application use case.
- Human users may have the roles `ADMIN`, `SALESPERSON` or `INVENTORY`. `SERVICE` is a token-only role and cannot be assigned to a user.
- Ordinary registration retains the existing idempotency, response and password-hashing conventions.
- Auth owns user data and its audit records in `auth_schema`. No other domain writes them.
- The infrastructure bootstrap and the application administrator are separate concerns. The PostgreSQL instance administrator is not an application `ADMIN`.
- ADR-001 and the other accepted ADRs remain unchanged. The decision register records the sections modified by this ADR.

---

## Decision 1 — Ordinary registration requires ADMIN authorization and durable attribution

### Options

**A — Public registration followed by administrator approval.**

Users submit registration requests and remain inactive until an administrator approves them. Requested privileges cannot become effective before approval.

- **Pros:** supports self-service onboarding.
- **Cons:** requires a pending-account lifecycle, approval rules and additional operations; the initial request is not an administrator-performed creation.

**B — ADMIN-only registration with a transactional audit record.**

An authenticated administrator creates each user. The user and the successful creation audit record are committed in the same Auth transaction.

- **Pros:** authorization and attribution are enforced at creation time; a committed user creation cannot lack its corresponding success record.
- **Cons:** removes self-service registration and adds an audit table, migrations and retention responsibilities.

**C — ADMIN-only registration with attribution only in operational logs.**

Authorization is enforced by the application use case, while creation attribution is recorded only through the logging system.

- **Pros:** avoids adding an audit table.
- **Cons:** user persistence and logging are separate operations; a failure between them can leave a created user without its attribution record.

### Decision

**We choose Option B.**

The gateway treats `POST /api/v1/auth/register` as a protected route and requires an `Authorization` header. It does not validate the JWT or inspect its roles.

The service's authentication adapter validates the JWT according to ADR-006 and passes a trusted caller identity to the registration use case. The use case requires the human `ADMIN` role before processing registration or returning an idempotent replay.

A valid token without the required role, including a service token, is rejected with `403`. Missing or invalid authentication is rejected with `401`.

The registration use case remains independent of HTTP and JWT libraries. Transactional persistence and audit storage are accessed through application ports implemented by infrastructure adapters.

For every successful creation, Auth stores a durable audit record containing:

- an audit record identifier;
- the operation type;
- the authenticated administrator's identifier;
- the created user's identifier;
- the successful outcome;
- a UTC timestamp;
- a correlation identifier.

The user and this success record are inserted in the same transaction. If either insert fails, neither is committed. No authorship field is added to the `User` entity.

Audit records are append-only during normal application operation. They contain no password, password hash, access token, refresh token or raw registration payload.

Rejected and failed attempts are recorded by the component that detects them: the gateway, authentication adapter or application use case. These security logs include the available caller identity, operation, outcome, reason, timestamp and correlation identifier. They do not invent a created-user identifier when no user was created.

The operation retains its existing contract:

- `Idempotency-Key` is required.
- The first successful creation returns `201` and `Location`.
- An authorized replay returns `200` with the same user.
- A replay does not create another user or another successful creation audit record.
- Duplicate-email handling retains the existing `422 BUSINESS_RULE_VIOLATION` behavior.
- `SERVICE` remains invalid as the requested user role.
- Passwords are hashed using the established password policy and are never returned.

The idempotency record, user and successful creation audit record are committed in the same transaction.

### Dominant criterion

**Attributable administrative creation.** Restricting registration identifies who may create users; transactional auditing preserves who actually created each user. This weighs more than self-service convenience or avoiding an additional persistence object.

### Accepted cost

- Every new user must be created by an existing administrator.
- Auth gains a dedicated audit table and its migrations, persistence adapter, tests and retention policy.
- A failure to persist the successful audit record prevents user creation.
- Rejected attempts rely on security logging outside the user-creation transaction; loss of those logs must be treated as an observability and security incident.
- Audit records require access controls and operational handling because they contain user identifiers.

---

## Decision 2 — Initial administrator creation uses a transactional advisory lock

### Options

**A — Check and insert under READ COMMITTED without an explicit lock.**

- **Pros:** simple transaction flow.
- **Cons:** concurrent transactions can both observe that no administrator exists and insert one. Rejected because it does not provide mutual exclusion.

**B — A partial unique index on role, or on a constant, for ADMIN rows.**

- **Pros:** enforces at most one current administrator directly in the database.
- **Cons:** prevents ordinary registration from creating additional administrators. Rejected because the system supports multiple administrators.

A partial unique index on `user_id` would not impose this restriction and would not solve the initialization race.

**C — SERIALIZABLE isolation with retries.**

- **Pros:** can provide a correct check-and-insert procedure when serialization failures are handled.
- **Cons:** requires explicit retry behavior and recovery from transaction failures in a manually operated procedure.

**D — A dedicated control row locked with SELECT FOR UPDATE.**

- **Pros:** provides mutual exclusion through ordinary row locking; a control record could also preserve initialization history.
- **Cons:** adds a persistent initialization-control object. That lifetime guarantee exceeds the operational scope selected here.

**E — A transaction-level advisory lock acquired before the existence check.**

- **Pros:** serializes cooperating executions without restricting the number of administrators or adding an initialization-control table.
- **Cons:** depends on a reserved key, a defined transaction protocol and operational restrictions on when the procedure may run.

### Decision

**We choose Option E.**

A dedicated initialization use case creates the first application administrator. It is invoked only through a manual command-line adapter supplied with `synkro-auth-api`. It is not exposed through an HTTP endpoint and does not bypass the authorization rule of the ordinary registration use case.

The initialization procedure must:

1. Open a transaction with explicit `READ COMMITTED` isolation.
2. Acquire `pg_advisory_xact_lock` using the reserved key.
3. In a separate statement after acquiring the lock, check whether any user has role `ADMIN`, including inactive users.
4. If an administrator exists, commit without changing users or credentials and report `already initialized`.
5. Otherwise, create one administrator and its initialization audit record in the same transaction.
6. Commit and report `created`.

The lock acquisition, existence check, user insertion and audit insertion use the same database connection and transaction.

A failed execution rolls back all inserts. The transaction-level lock is released on commit or rollback.

The lock key is fixed for this operation and reserved across the environment's shared PostgreSQL database. It is not scoped to `auth_schema`. Its numeric value and owner must be recorded centrally in `06-data/models.md` before implementation and reused by every execution.

The existence check includes inactive administrator accounts. Deactivation therefore does not, by itself, make the procedure create another administrator.

The initialization audit record contains the created user's identifier, a UTC timestamp, a correlation identifier and the operator's execution identity. It explicitly identifies initialization as the operation and does not claim that an authenticated application administrator performed it.

### Dominant criterion

**Explicit mutual exclusion during environment initialization.** The chosen protocol prevents cooperating concurrent executions from both creating an initial administrator while allowing additional administrators through ordinary registration.

### Accepted cost

- Advisory locking is cooperative. Direct inserts and other paths that do not acquire the reserved lock are not protected.
- The procedure depends on the specified isolation level, connection scope and statement ordering.
- The lock prevents competing successful initializations; it does not guarantee that initialization is executed or completes successfully.
- No persistent initialization marker is introduced. The procedure cannot detect a former administrator whose role was changed, or an administrator record removed through exceptional database intervention.
- Restricting execution to environment initialization is an operational control, not a lifetime database constraint.
- A lock timeout or another database failure produces an explicit failure with rollback. It must never trigger an unlocked fallback.

---

## Scope boundary — Initialization is not recovery

The initialization procedure is authorized only during environment initialization, after Auth's migrations have completed and before the environment is opened for normal application use.

A designated deployment operator executes the command through the controlled deployment environment. The runbook records the operator's identity, the target environment and the execution result.

The command uses Auth's existing database credentials, scoped to `auth_schema`. It does not use PostgreSQL superuser or instance-administrator credentials. This ADR does not extend the administrative credential uses decided in ADR-012.

The initial administrator's identity and password are supplied through deployment secrets or a protected interactive input. They are not committed, hardcoded, printed or provided as command-line arguments. There is no default account or default password.

The initialization command uses the established Auth password-hashing policy. After initialization, operators remove its temporary input secrets and disable routine access to the initialization command.

The procedure is separate from the infrastructure bootstrap, which creates infrastructure-level objects such as service connection users. It is also separate from the migration runners, which apply schema changes.

If no usable administrator remains after normal operation has begun—because of deactivation, role changes or exceptional data removal—this procedure is not the authorized recovery path. Recovery requires a separate reviewed operational decision, recorded in the technical backlog.

This restriction does not claim that the database technically prevents an operator with sufficient access from rerunning initialization after all current ADMIN roles disappear.

---

## Consequences

**What changes in the system:**

- Ordinary registration requires an authenticated human administrator.
- JWT validation remains in the authentication adapter; the registration use case enforces authorization.
- Successful user creation and its attribution record are committed atomically.
- Auth gains a dedicated audit table without adding an authorship field to `User`.
- Initial administrator creation uses a separate manual entry point and a transaction-level advisory lock.
- Multiple administrators remain supported.
- ADR-001 §8 is modified only for registration visibility. ADR-004's endpoint decisions remain in force.

**What must be watched:**

- Any registration path that creates users without applying the ADMIN rule.
- Any initial-administrator execution outside environment initialization.
- Missing or inaccessible audit records and security logs.
- Reuse of the advisory lock key for another operation.
- Bootstrap executions that use a different isolation level or database connection.
- The absence of a reviewed recovery procedure when all usable administrators are lost.

A requirement for technically enforced, lifetime initialization uniqueness would reopen Decision 2 and require a new ADR considering a persistent initialization marker.

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| `05-architecture/decisions/README.md` | Add ADR-014 and the reverse link from ADR-001 §8, limited to registration visibility. Keep the record and register statuses consistent. |
| `07-api/contracts/openapi/synkro-auth-api.yaml` | Protect register with Bearer authentication, document ADMIN authorization and add 401/403 responses. Preserve idempotency, 201/200, Location, duplicate-email behavior and rejection of SERVICE as a requested user role. |
| `07-api/authentication.md` | Separate register from public login/refresh operations and replace the current public-registration explanation with a reference to this decision. |
| `00-governance/security-policy.md` | Document authorization, transactional creation auditing, rejected-attempt logging and initialization-secret handling. |
| `05-architecture/security-threat-model.md` | Address unauthorized user creation, bootstrap misuse, missing attribution and audit access or tampering. |
| `02-domain/entities-and-rules.md` | Add the ADMIN requirement for ordinary user creation and distinguish the operational initialization exception from domain invariants. |
| `06-data/models.md` | Specify the Auth audit table, its constraints and access controls; reserve the advisory lock key. No initialization-control table or User authorship column is introduced. |
| `06-data/data-dictionary.md` | Describe the audit record fields, actor kinds and successful registration/initialization operation types. |
| `05-architecture/deployment.md` | Place initial administrator creation after Auth migrations; document the command, Auth credentials, secret flow and post-initialization access restriction. |
| `13-operations/initial-administrator-initialization.md` | Add the runbook: authorized operator, preconditions, inputs, execution, result verification, timeout/failure handling, no-op behavior and recovery exclusion. |
| `13-operations/observability.md` | Define how successful audit records and rejected-attempt logs are accessed, retained and monitored, without duplicating their data definitions. |
| `11-quality/testing-strategy.md` | Update the registration example to include a trusted requester and authorization. Add transactional audit and real PostgreSQL concurrency scenarios. |
| `04-requirements/user-stories.md` | Link the architecture and documentation work to the confirmed stories. Update registration and initialization acceptance criteria before implementation. |
| `04-requirements/traceability-matrix.md` | Connect FR-010 and applicable security NFRs to this ADR, user stories, planned tests and eventual implementation evidence. |
| `15-project-control/technical-backlog.md` | Record the administrator-recovery gap and any explicitly agreed deferred documentation. |
| `12-ux-ui/navigation-map.md`, `12-ux-ui/wireframes.md` | Ensure user creation is an ADMIN operation and no public self-registration flow remains. |

Implementation stories must include at least these verification scenarios:

- ADMIN creates users with each permitted human role.
- Missing or invalid authentication returns 401.
- Valid non-ADMIN and SERVICE callers return 403 without creating a user.
- SERVICE is rejected as a requested user role.
- Authorized idempotent replay returns the existing user without duplicating its success audit record.
- Failure to persist the success audit record rolls back user creation.
- Concurrent initialization executions against real PostgreSQL create one initial administrator.
- Repeated initialization with an existing active or inactive ADMIN changes no user or credential.
- Initialization failure rolls back the user and audit record; a subsequent authorized retry can succeed.

Tests precede production implementation. Planned verification must not be reported as completed evidence.

---

## Immutability rule

Once this ADR is `Accepted`, it is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

Acceptance records the actual team approval date and confirmed authors and reviewers. Repository integration follows the documentation review and protected-main process.

---

## References

- [ADR-001 — Sales Management System Architecture](ADR-001-architecture.md), §8.
- [ADR-004 — API Contract Extensions](ADR-004-api-contract-extensions.md).
- [ADR-006 — Token Validation in Every Service and Service Credentials](ADR-006-token-validation-per-service.md).
- [ADR-009 — Shared Instance with Schema-per-Domain Isolation](ADR-009-shared-instance-schema-per-domain.md).
- [ADR-012 — Instance Bootstrap, Service Users and Environment Files](ADR-012-instance-bootstrap-and-environments.md).
- [ADR template](../_template-adr.md).
- [Authentication and authorization](../../../07-api/authentication.md).
- [Auth API contract](../../../07-api/contracts/openapi/synkro-auth-api.yaml).
- [Security policy](../../../00-governance/security-policy.md).
- [Entities and business rules](../../../02-domain/entities-and-rules.md).
- [Data models](../../../06-data/models.md).
- [Testing strategy](../../../11-quality/testing-strategy.md).
