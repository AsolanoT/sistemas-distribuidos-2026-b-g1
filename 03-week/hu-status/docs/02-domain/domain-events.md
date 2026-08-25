# Domain Events

> Catalog of relevant business facts, expressed in the past tense. Level of detail:
> essential events per entity (Created/Updated/Deactivated). The MVP uses synchronous
> REST communication with no active event bus — these events are documented as a
> reference and would be activated if (and when) the project adopts the optional
> asynchronous phase (see ADR-001).
>
> **Future extension note:** if the asynchronous phase is activated, finer,
> business-specific events can be added (e.g. `StockDepleted`, `SaleRejectedDueToStock`)
> without breaking the events already documented here — new rows are simply added to this table.

## Auth

| Event | Triggered by | Data | Consumers | Bounded Context |
|-------|--------------|------|-----------|------------------|
| UserRegistered | Successful registration of a new system user | userId, email, role, registeredAt | None currently (synchronous MVP) | Auth |
| UserUpdated | Role or data change on an existing user | userId, changes | None currently (synchronous MVP) | Auth |
| UserDeactivated | Deactivation of a user (by an ADMIN) | userId, date | None currently (synchronous MVP) | Auth |

## Customers

| Event | Triggered by | Data | Consumers | Bounded Context |
|-------|--------------|------|-----------|------------------|
| CustomerRegistered | Successful registration of a new customer | customerId, taxId, registeredAt | None currently (synchronous MVP) | Customers |
| CustomerUpdated | Update of a customer's contact information | customerId, changes | None currently (synchronous MVP) | Customers |
| CustomerDeactivated | Deactivation of a customer | customerId, date | None currently (synchronous MVP) | Customers |

## Products

| Event | Triggered by | Data | Consumers | Bounded Context |
|-------|--------------|------|-----------|------------------|
| ProductRegistered | Registration of a new product in the catalog | productId, name, price, categoryId | None currently (synchronous MVP) | Products |
| ProductUpdated | Change to a product's price, stock, or data | productId, changes | None currently (synchronous MVP) | Products |
| ProductDeactivated | Deactivation of a product | productId, date | None currently (synchronous MVP) | Products |
| CategoryRegistered | Registration of a new category | categoryId, name | None currently (synchronous MVP) | Products |
| CategoryDeactivated | Deactivation of a category | categoryId, date | None currently (synchronous MVP) | Products |

## Sales

| Event | Triggered by | Data | Consumers | Bounded Context |
|-------|--------------|------|-----------|------------------|
| SaleRegistered | Successful confirmation of a sale | saleId, customerId, total, date, detail | None currently (synchronous MVP); natural candidate to be consumed by Products if the async phase is activated | Sales |
| SaleVoided | Voiding of an already registered sale | saleId, date, reason | None currently (synchronous MVP) | Sales |

---

## Correlations

- Context map → `02-domain/domain-map.md`
- Entities and business rules → `02-domain/entities-and-rules.md`
- Infrastructure-level event catalog (once implemented) → `09-microservices/event-catalog.md`
- Asynchronous event contracts (if that phase is activated) → `07-api/contracts/`
