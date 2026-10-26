# Data Model — synkro-auth-api

> Ownership inventory. Canonical fields/constraints remain in models.md and
> the owning migrations/contracts; this record does not create a second schema.

---

## Database engine

**Engine / identity:** PostgreSQL auth_schema / auth_app. **Scope:** Own internal user identity, credentials, refresh/logout, ADMIN-only registration/creation audit and scoped SERVICE-token issuance.

---

## Schema

### Authoritative structures

system_user, refresh_token, service_token, idempotency_key and append-only user_creation_audit.

| Responsibility | Source of truth | Boundary |
|---|---|---|
| Business entities and invariants | [Entities/rules](../../../02-domain/entities-and-rules.md) | No new domain field/entity invented from storage/UI |
| Actual schema/collection, keys, ACLs and drift | [Models](../../../06-data/models.md), owner migrations at frozen release revision | History and Accepted decisions immutable; no silent correction of applied migration |
| Public fields/statuses | [Public contract](../../../07-api/contracts/openapi/synkro-auth-api.yaml) | API contract and documented implementation discrepancies remain distinct |
| Cross-domain references | [Ownership matrix](../../data-ownership-matrix.md) | UUID references/frozen prices, never foreign DB access/name replicas |

### Indexes

Use the owner's actual migration definitions linked by canonical models. No new index name, enforced constraint or extra reporting aggregate is declared here. [Implementation boundaries](decisions.md#consequences-and-unresolved-implementation) are maintained in the service decision record.

---

## Modeling decisions

[ADR-001](../../../05-architecture/decisions/records/ADR-001-architecture.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-012](../../../05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md), [ADR-013](../../../05-architecture/decisions/records/ADR-013-identity-as-cross-cutting-security.md), [ADR-014](../../../05-architecture/decisions/records/ADR-014-admin-only-registration-and-initial-administrator.md), [ADR-016](../../../05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md), [ADR-017](../../../05-architecture/decisions/records/ADR-017-refresh-reuse-and-jwt-revocation-boundaries.md) provide the accepted architecture. Soft deactivation/lifecycle is distinct from physical DELETE; append-only evidence retains its owning permissions. Service-specific consequences and open discrepancies are maintained in [decisions](decisions.md#consequences-and-unresolved-implementation).

---

## Schema migration

**Tool / owner:** synkro-auth-db, Flyway V001–V017/U001–U017; official runner 11.20.3-alpine.

Use [deployment](../../../05-architecture/deployment.md#5-migrations) for explicit tooling order and [backup/recovery](../../../13-operations/backup-and-recovery.md) for protected compatible backups, forward fixes and disposable-restoration limits. Never run a destructive rebuild against persistent qa/main or edit a migration already applied. No service starts owner migrations automatically.
