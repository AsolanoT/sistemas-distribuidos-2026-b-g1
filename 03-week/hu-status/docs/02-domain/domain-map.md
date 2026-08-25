# Domain Map

> Mental model of SynkroTech SAS's business — this is not technology, it is the
> understanding of the problem the system solves, before writing any code.

## Bounded Contexts

### Authentication and Users (Auth)
**Responsibility:** manage the identity of the system's internal users (SynkroTech SAS employees), their credentials, roles, and sessions.
**Main entities:** User, RefreshToken
**Owning team:** entire team (no fixed per-service owner yet)

### Customers
**Responsibility:** manage information about SynkroTech SAS's customers (buyers).
**Main entities:** Customer
**Owning team:** entire team (no fixed per-service owner yet)

### Products and Inventory
**Responsibility:** manage the product catalog, its categories, and available stock control.
**Main entities:** Product, Category
**Owning team:** entire team (no fixed per-service owner yet)

### Sales
**Responsibility:** manage the registration of commercial transactions and their detail, orchestrating with Customers and Products, and serving as the data source for reports (calculated as a derived view, not as its own entity — see `entities-and-rules.md`).
**Main entities:** Sale, SaleDetail
**Owning team:** entire team (no fixed per-service owner yet)

---

## Relationship map

```
                    ┌──────────┐
                    │   Auth   │  (upstream — everyone depends
                    └────┬─────┘   on it to validate JWTs)
                         │
        validates JWT (locally, with public key)
         ┌───────────────┼───────────────┐
         ▼                ▼               ▼
   ┌──────────┐     ┌───────────┐   ┌──────────┐
   │ Customers│◄────│   Sales   │──►│ Products │
   └──────────┘     └───────────┘   └──────────┘
     checks               │            checks
    customer               │           stock/price,
    existence               │          updates stock
                          ▼
                  (derived reporting
                   view, not an
                   independent context)
```

| Context A | Relationship | Context B | Description |
|-----------|-------------|-----------|-------------|
| Customers | downstream-of | Auth | Customers locally validates the JWT issued by Auth |
| Products | downstream-of | Auth | Products locally validates the JWT issued by Auth |
| Sales | downstream-of | Auth | Sales locally validates the JWT issued by Auth |
| Sales | downstream-of | Customers | Sales checks customer existence before creating a sale |
| Sales | downstream-of | Products | Sales checks stock/price and triggers the stock update after confirming a sale |

**Note:** no context is upstream of Auth — Auth does not depend on any other context, confirming it is a correctly isolated transversal context.

---

## Ubiquitous Language (per context)

| Term | Context | Exact meaning in this context |
|------|---------|-------------------------------|
| User | Auth | A SynkroTech SAS employee who logs into the system |
| Customer | Customers | A natural or legal person who buys products — **never** refers to a system user |
| Product | Products | A catalog item with its own price and stock |
| Sale | Sales | A confirmed transaction that has already deducted stock and generated traceability |
| Report | Sales | A view computed on demand from Sale/SaleDetail — not a persisted entity |

---

## Correlations

- Entity and rule catalog → `02-domain/entities-and-rules.md`
- Domain event catalog → `02-domain/domain-events.md`
- This map directly feeds → `05-architecture/overview.md` (bounded contexts → microservices)
- Architecture decision → `05-architecture/decisions/records/ADR-001-architecture.md`
