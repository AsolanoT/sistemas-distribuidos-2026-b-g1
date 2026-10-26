# Data Model — synkro-workflow

> Ownership inventory. Canonical fields/constraints remain in models.md and
> the owning migrations/contracts; this record does not create a second schema.

---

## Database engine

**Engine / identity:** PostgreSQL workflow_schema / workflow_app. **Scope:** Own durable register-sale coordination, caller/input replay privacy, attempts/receipts and evidence-based recovery/compensation.

---

## Schema

### Authoritative structures

saga_instance and private execution/recovery data; not a fifth business bounded context.

| Responsibility | Source of truth | Boundary |
|---|---|---|
| Business entities and invariants | [Entities/rules](../../../02-domain/entities-and-rules.md) | No new domain field/entity invented from storage/UI |
| Actual schema/collection, keys, ACLs and drift | [Models](../../../06-data/models.md), owner migrations at frozen release revision | History and Accepted decisions immutable; no silent correction of applied migration |
| Public fields/statuses | [Public contract](../../../07-api/contracts/openapi/synkro-workflow.yaml) | API contract and documented implementation discrepancies remain distinct |
| Cross-domain references | [Ownership matrix](../../data-ownership-matrix.md) | UUID references/frozen prices, never foreign DB access/name replicas |

### Indexes

Use the owner's actual migration definitions linked by canonical models. No new index name, enforced constraint or extra reporting aggregate is declared here. [Implementation boundaries](decisions.md#consequences-and-unresolved-implementation) are maintained in the service decision record.

---

## Modeling decisions

[ADR-003](../../../05-architecture/decisions/records/ADR-003-gateway-saga-async.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-007](../../../05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md), [ADR-008](../../../05-architecture/decisions/records/ADR-008-cross-cutting-stack.md), [ADR-009](../../../05-architecture/decisions/records/ADR-009-shared-instance-schema-per-domain.md), [ADR-012](../../../05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md), [ADR-015](../../../05-architecture/decisions/records/ADR-015-sale-saga-execution-safety.md), [ADR-016](../../../05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md) provide the accepted architecture. Soft deactivation/lifecycle is distinct from physical DELETE; append-only evidence retains its owning permissions. Service-specific consequences and open discrepancies are maintained in [decisions](decisions.md#consequences-and-unresolved-implementation).

---

## Schema migration

**Tool / owner:** Own db/ Flyway V001–V005/U001–U005 via workflow-db-migrate, official 11.20.3-alpine.

Use [deployment](../../../05-architecture/deployment.md#5-migrations) for explicit tooling order and [backup/recovery](../../../13-operations/backup-and-recovery.md) for protected compatible backups, forward fixes and disposable-restoration limits. Never run a destructive rebuild against persistent qa/main or edit a migration already applied. No service starts owner migrations automatically.
