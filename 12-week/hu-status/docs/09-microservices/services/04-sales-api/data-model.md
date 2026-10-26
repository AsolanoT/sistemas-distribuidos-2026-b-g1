# Data Model — synkro-sales-api

> Ownership inventory. Canonical fields/constraints remain in models.md and
> the owning migrations/contracts; this record does not create a second schema.

---

## Database engine

**Engine / identity:** MongoDB sales database, sale collection / sales_app authenticated in admin. **Scope:** Own Sale/SaleDetail aggregate with frozen integer amounts, saga-authorized creation, ownership-scoped reads and derived reports.

---

## Schema

### Authoritative structures

sale documents with embedded details, validators/indexes, Sales Liquibase history and Sales roles; no sales_summary entity.

| Responsibility | Source of truth | Boundary |
|---|---|---|
| Business entities and invariants | [Entities/rules](../../../02-domain/entities-and-rules.md) | No new domain field/entity invented from storage/UI |
| Actual schema/collection, keys, ACLs and drift | [Models](../../../06-data/models.md), owner migrations at frozen release revision | History and Accepted decisions immutable; no silent correction of applied migration |
| Public fields/statuses | [Public contract](../../../07-api/contracts/openapi/synkro-sales-api.yaml) | API contract and documented implementation discrepancies remain distinct |
| Cross-domain references | [Ownership matrix](../../data-ownership-matrix.md) | UUID references/frozen prices, never foreign DB access/name replicas |

### Indexes

Use the owner's actual migration definitions linked by canonical models. No new index name, enforced constraint or extra reporting aggregate is declared here. [Implementation boundaries](decisions.md#consequences-and-unresolved-implementation) are maintained in the service decision record.

---

## Modeling decisions

[ADR-002](../../../05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md), [ADR-005](../../../05-architecture/decisions/records/ADR-005-data-isolation-per-domain.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-010](../../../05-architecture/decisions/records/ADR-010-sales-on-mongodb.md), [ADR-012](../../../05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md), [ADR-015](../../../05-architecture/decisions/records/ADR-015-sale-saga-execution-safety.md) provide the accepted architecture. Soft deactivation/lifecycle is distinct from physical DELETE; append-only evidence retains its owning permissions. Service-specific consequences and open discrepancies are maintained in [decisions](decisions.md#consequences-and-unresolved-implementation).

---

## Schema migration

**Tool / owner:** synkro-sales-db, Liquibase 4.31.1 + Mongo extension 4.29.1, ten changesets with owner inverses.

Use [deployment](../../../05-architecture/deployment.md#5-migrations) for explicit tooling order and [backup/recovery](../../../13-operations/backup-and-recovery.md) for protected compatible backups, forward fixes and disposable-restoration limits. Never run a destructive rebuild against persistent qa/main or edit a migration already applied. No service starts owner migrations automatically.
