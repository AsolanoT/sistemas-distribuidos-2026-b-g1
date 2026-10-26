# Data Model — synkro-customers-api

> Ownership inventory. Canonical fields/constraints remain in models.md and
> the owning migrations/contracts; this record does not create a second schema.

---

## Database engine

**Engine / identity:** PostgreSQL customers_schema / customers_app. **Scope:** Own Customer lifecycle, unique identity documents, exact lookup and idempotent creation while preserving operational history.

---

## Schema

### Authoritative structures

customer and idempotency_key; no Sale/Product/User replica.

| Responsibility | Source of truth | Boundary |
|---|---|---|
| Business entities and invariants | [Entities/rules](../../../02-domain/entities-and-rules.md) | No new domain field/entity invented from storage/UI |
| Actual schema/collection, keys, ACLs and drift | [Models](../../../06-data/models.md), owner migrations at frozen release revision | History and Accepted decisions immutable; no silent correction of applied migration |
| Public fields/statuses | [Public contract](../../../07-api/contracts/openapi/synkro-customers-api.yaml) | API contract and documented implementation discrepancies remain distinct |
| Cross-domain references | [Ownership matrix](../../data-ownership-matrix.md) | UUID references/frozen prices, never foreign DB access/name replicas |

### Indexes

Use the owner's actual migration definitions linked by canonical models. No new index name, enforced constraint or extra reporting aggregate is declared here. [Implementation boundaries](decisions.md#consequences-and-unresolved-implementation) are maintained in the service decision record.

---

## Modeling decisions

[ADR-005](../../../05-architecture/decisions/records/ADR-005-data-isolation-per-domain.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-009](../../../05-architecture/decisions/records/ADR-009-shared-instance-schema-per-domain.md), [ADR-011](../../../05-architecture/decisions/records/ADR-011-angular-customers-portal.md), [ADR-012](../../../05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md) provide the accepted architecture. Soft deactivation/lifecycle is distinct from physical DELETE; append-only evidence retains its owning permissions. Service-specific consequences and open discrepancies are maintained in [decisions](decisions.md#consequences-and-unresolved-implementation).

---

## Schema migration

**Tool / owner:** synkro-customers-db, Flyway V001–V007/U001–U007; guarded runner 10.20.1.

Use [deployment](../../../05-architecture/deployment.md#5-migrations) for explicit tooling order and [backup/recovery](../../../13-operations/backup-and-recovery.md) for protected compatible backups, forward fixes and disposable-restoration limits. Never run a destructive rebuild against persistent qa/main or edit a migration already applied. No service starts owner migrations automatically.
