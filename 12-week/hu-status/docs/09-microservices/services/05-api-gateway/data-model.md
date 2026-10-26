# Data Model — synkro-api-gateway

> Ownership inventory. Canonical fields/constraints remain in models.md and
> the owning migrations/contracts; this record does not create a second schema.

---

## Database engine

**Engine / identity:** None. **Scope:** Own the single public API entry: declarative routing, credential-presence filtering, CORS, rate limits and correlation.

---

## Schema

### Authoritative structures

No database, business entity, migration history or token repository.

| Responsibility | Source of truth | Boundary |
|---|---|---|
| Business entities and invariants | [Entities/rules](../../../02-domain/entities-and-rules.md) | No new domain field/entity invented from storage/UI |
| Actual schema/collection, keys, ACLs and drift | [Models](../../../06-data/models.md), owner migrations at frozen release revision | History and Accepted decisions immutable; no silent correction of applied migration |
| Public fields/statuses | [API guidelines](../../../07-api/guidelines.md) and owning repository configuration; no new public contract | API contract and documented implementation discrepancies remain distinct |
| Cross-domain references | [Ownership matrix](../../data-ownership-matrix.md) | UUID references/frozen prices, never foreign DB access/name replicas |

### Indexes

Not applicable: this component owns no table, collection or index. [Implementation boundaries](decisions.md#consequences-and-unresolved-implementation) are maintained in the service decision record.

---

## Modeling decisions

[ADR-003](../../../05-architecture/decisions/records/ADR-003-gateway-saga-async.md), [ADR-004](../../../05-architecture/decisions/records/ADR-004-api-contract-extensions.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-008](../../../05-architecture/decisions/records/ADR-008-cross-cutting-stack.md) provide the accepted architecture. This component has no own persistent schema or migration history. Service-specific consequences and open discrepancies are maintained in [decisions](decisions.md#consequences-and-unresolved-implementation).

---

## Schema migration

**Tool / owner:** None; no database runner.

Not applicable: there is no component migration/backup procedure. The [dependency map](../../dependency-map.md) identifies the actual store owners; this component must not run their migrations.
