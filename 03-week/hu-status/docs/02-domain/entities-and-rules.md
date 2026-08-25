# Entities and Business Rules

> Catalog of entities, aggregates, and business rules (invariants) of the domain.
> Prices and totals are modeled with primitive types for now (no Value Objects),
> to keep things simple at this stage of the project.

---

## Identifier strategy: UUID

All entities in the system use **UUID** as their identifier, instead of auto-increment (`SERIAL`/`BIGSERIAL`). Justification:

| Criterion | Why UUID wins in this project |
|---|---|
| Microservice independence | Each service generates its own IDs without depending on the database to hand it the next number — consistent with the real independence principle defined in ADR-001 |
| Cross-service references without real FKs | External references (`customerId`, `productId` in Sales) remain unambiguous even if the databases are physically split in the future (see "candidates for future versions" in `scope.md`) |
| Hexagonal architecture | The domain can build a complete aggregate, identity included, **before** touching infrastructure — it does not depend on the database assigning the ID after the INSERT |
| Does not leak business volume | An ID like `customerId = 42` leaks how many customers exist; a UUID does not reveal that information |

**Accepted trade-off:** UUIDs are less readable in logs/debugging than a sequential number. Mitigated with structured logging (always include descriptive fields alongside the ID, not just the raw UUID).

---

## Context: Authentication and Users (Auth)

### Aggregate: User (root) + RefreshToken (child entity)

## Entity: User
**Belongs to:** Auth
**Identifier:** userId

### Attributes
| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|----------|-------|
| userId | UUID | Unique identifier | Yes | — |
| name | string | Employee's full name | Yes | — |
| email | string | Email used to log in | Yes | Unique across the system |
| passwordHash | string | Encrypted password (bcrypt) | Yes | Never stored in plain text |
| role | enum | ADMIN, SALESPERSON, or INVENTORY | Yes | Only one of the 3 valid values |
| registeredAt | datetime | User creation date | Yes | — |
| active | boolean | Whether the user can log in | Yes | Default `true` |

### Business rules (invariants)
- [ ] `email` must be unique among all active users.
- [ ] A deactivated user (`active = false`) cannot log in or receive new tokens.
- [ ] `role` can only take one of the 3 defined values; there are no custom roles in the MVP.
- [ ] The password is never exposed in any API response.

### Behaviors (domain methods)
- `authenticate(credentials)`: validates email/password and returns the user if correct.
- `changeRole(newRole)`: can only be executed by an ADMIN on another user.
- `deactivate()`: sets `active = false` and revokes all their active refresh tokens.

---

## Entity: RefreshToken
**Belongs to:** Auth (child entity of the User aggregate)
**Identifier:** tokenId

### Attributes
| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|----------|-------|
| tokenId | UUID | Unique identifier | Yes | — |
| userId | UUID | Owning user | Yes | FK to User |
| token | string | Refresh token value (hash) | Yes | — |
| expiresAt | datetime | When it stops being valid | Yes | 7 days after issuance |
| active | boolean | Whether the token can be used | Yes | Default `true` |

### Business rules (invariants)
- [ ] A refresh token can only be used once (mandatory rotation).
- [ ] An expired token is never valid, even if `active = true`.
- [ ] Revoking a user automatically revokes all of their refresh tokens.

### Behaviors (domain methods)
- `rotate()`: invalidates the current token and issues a new one.
- `revoke()`: sets `active = false` manually (logout).
- `isExpired()`: returns whether `expiresAt` has already passed.

---

## Context: Customers

### Aggregate: Customer (root, no child entities)

## Entity: Customer
**Belongs to:** Customers
**Identifier:** customerId

### Attributes
| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|----------|-------|
| customerId | UUID | Unique identifier | Yes | — |
| name | string | Name or business name | Yes | — |
| taxId | string | Identification document | Yes | Unique among active customers |
| email | string | Contact email | No | — |
| phone | string | Contact phone | No | — |
| address | string | Contact address | No | — |
| registeredAt | datetime | Creation date | Yes | — |
| active | boolean | Whether the customer can be linked to new sales | Yes | Default `true` |

### Business rules (invariants)
- [ ] `taxId` must be unique among active customers.
- [ ] A deactivated customer cannot be linked to new sales (historical sales remain intact).

### Behaviors (domain methods)
- `updateInfo(data)`: updates the customer's contact fields.
- `deactivate()`: sets `active = false`, preserving their sales history.

---

## Context: Products and Inventory

### Aggregate 1: Product (root, references Category by ID)

## Entity: Product
**Belongs to:** Products
**Identifier:** productId

### Attributes
| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|----------|-------|
| productId | UUID | Unique identifier | Yes | — |
| name | string | Product name | Yes | — |
| price | decimal | Unit sale price | Yes | Must be > 0 |
| stock | integer | Available quantity | Yes | Can never be negative |
| categoryId | UUID | Category it belongs to | Yes | FK to Category |
| active | boolean | Whether the product can be sold | Yes | Default `true` |

### Business rules (invariants)
- [ ] `price` must always be greater than 0.
- [ ] `stock` can never become a negative value.
- [ ] A deactivated product cannot be added to a new sale.

### Behaviors (domain methods)
- `updateStock(quantity)`: adjusts stock (used for inventory replenishment).
- `reduceStock(quantity)`: deducts stock when a sale is confirmed; fails if `quantity > stock`.
- `deactivate()`: sets `active = false`.

---

### Aggregate 2: Category (root, independent)

## Entity: Category
**Belongs to:** Products
**Identifier:** categoryId

### Attributes
| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|----------|-------|
| categoryId | UUID | Unique identifier | Yes | — |
| name | string | Category name | Yes | Unique among active categories |
| active | boolean | Whether the category can be used on new products | Yes | Default `true` |

### Business rules (invariants)
- [ ] `name` must be unique among active categories.
- [ ] A category with active products still assigned to it cannot be deactivated (validated in the use case).

### Behaviors (domain methods)
- `rename(newName)`: updates the category's name.
- `deactivate()`: sets `active = false`.

---

## Context: Sales

### Aggregate: Sale (root) + SaleDetail (child entity)

## Entity: Sale
**Belongs to:** Sales
**Identifier:** saleId

### Attributes
| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|----------|-------|
| saleId | UUID | Unique identifier | Yes | — |
| customerId | UUID | Associated customer (external reference) | Yes | Validated via API against Customers |
| date | datetime | Sale date | Yes | — |
| total | decimal | Sum of the detail's subtotals | Yes | Must equal the sum of `saleDetail.subtotal` |
| active | boolean | Whether the sale is valid (not voided) | Yes | Default `true` |

### Business rules (invariants)
- [ ] A sale must have at least 1 associated `SaleDetail`.
- [ ] `total` must always equal the sum of its detail's `subtotal` values.
- [ ] `customerId` must correspond to an active customer (validated via API before creating the sale).
- [ ] Each `productId` in the detail must have sufficient stock at confirmation time (validated via API against Products).

### Behaviors (domain methods)
- `addDetail(product, quantity, unitPrice)`: adds a line to the detail and recalculates the total.
- `calculateTotal()`: recalculates the total from the current detail.
- `confirm()`: validates the rules above and triggers the stock deduction in Products.

---

## Entity: SaleDetail
**Belongs to:** Sales (child entity of the Sale aggregate)
**Identifier:** detailId

### Attributes
| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|----------|-------|
| detailId | UUID | Unique identifier | Yes | — |
| saleId | UUID | Sale it belongs to | Yes | FK to Sale |
| productId | UUID | Product sold (external reference) | Yes | Validated via API against Products |
| quantity | integer | Units sold | Yes | Must be > 0 |
| unitPrice | decimal | Product's price at the time of the sale | Yes | Copied from Product when the line is added |
| subtotal | decimal | `quantity * unitPrice` | Yes | Calculated, not directly editable |

### Business rules (invariants)
- [ ] `quantity` must always be greater than 0.
- [ ] `subtotal` must always equal `quantity * unitPrice`.
- [ ] `unitPrice` is frozen at the time the line is added (it does not change if the product's price changes later).

### Behaviors (domain methods)
- `calculateSubtotal()`: recalculates `subtotal` from `quantity` and `unitPrice`.

---

## Resolving external references between services

Since `customerId` (on Sale) and `productId` (on SaleDetail) are UUIDs belonging to other microservices' schemas, **there is no real foreign key** — Sales never performs a direct JOIN against the Customers or Products tables. Resolution happens at two distinct moments:

### 1. At write time (when creating the sale) — synchronous validation via API

When the Sales service receives a request to create a sale:

1. It calls `GET /api/customers/{customerId}` on the Customers service.
   - If it returns `404` or the customer has `active = false` → the sale is rejected (`CustomerNotFound` or `CustomerInactive`).
   - If it returns `200` and the customer is active → it proceeds.
2. For each detail line, it calls `GET /api/products/{productId}` on the Products service.
   - If the product does not exist or is inactive → that line is rejected.
   - If it exists, Sales takes the product's current `price` and **copies** it as the `unitPrice` on the `SaleDetail` (per the invariant already defined: the price is frozen at the time of sale).
   - It verifies that `stock >= requested quantity`.
3. If all validations pass, Sales confirms the sale and calls `PATCH /api/products/{productId}/stock` to deduct the corresponding inventory.

**What Sales actually stores:** only the UUID (`customerId`, `productId`) — it does **not** store a copy of the customer's name or the product's name. The only already-documented exception is `unitPrice`, which is copied because it is part of the business rule (the price of a past sale must not change if the product's price increases later).

### 2. At read time (when querying a sale) — on-demand hydration

When someone queries a sale's detail (`GET /api/sales/{id}`) and the UI needs to display, for example, the customer's name or each product's name (not just their UUIDs), Sales makes an additional call at that moment:

```
GET /api/sales/{id}             → Sales returns: customerId, detail[] (with productId)
GET /api/customers/{customerId} → Customers returns: name, taxId, etc.
GET /api/products/{productId}   (per line) → Products returns: name, category, etc.
```

**Known limitation (accepted for the MVP):** if a list of sales needs to display the names of many different customers/products, this implies several HTTP calls (an N+1 pattern across services). This cost is accepted for the MVP for the sake of simplicity. If this becomes a real performance issue later, the options to evaluate would be: (a) a "batch lookup" endpoint (`POST /api/customers/batch` with a list of IDs) to reduce the number of calls, or (b) introducing a small read-only cache in Sales — neither is implemented in this MVP.

---

## Note on Reports (SalesSummary)

`SalesSummary` **is not modeled as a domain entity**. It was decided to treat it as a **derived view/projection**, calculated on demand via aggregation queries (`SUM`, `GROUP BY`) directly over `Sale` and `SaleDetail`, with no domain logic or invariants of its own. This avoids maintaining a manually synchronized counter and eliminates the risk of the summary becoming out of sync with the actual sales.

---

## Correlations

- Context map → `02-domain/domain-map.md`
- Domain events → `02-domain/domain-events.md`
- Technical data model (tables per schema) → `06-data/models.md`
- Business rules → acceptance criteria in `04-requirements/user-stories.md`
