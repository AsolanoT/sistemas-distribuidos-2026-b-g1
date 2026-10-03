# Data Ownership Matrix

> Who holds the authoritative version of each piece of data. No service
> stores a copy of another domain's entity — only the plain identifier it
> needs, resolved through that domain's API (ADR-005 Decision 3, ADR-009).
> This is the practical consequence of "each domain owns its schema": this
> table says, entity by entity, what that means.

---

## Matrix

| Entity | Owner service | Schema | Others that reference it | What they hold | How it stays correct |
|--------|---------------|--------|---------------------------|-----------------|----------------------|
| User | `synkro-auth-api` | `auth_schema` | `synkro-sales-api` (`sale.created_by`) | A plain UUID, never the user's name or email | The saga sends `createdBy` from the validated token's `sub`; Sales never queries Auth for it (ADR-002, ADR-006) |
| RefreshToken | `synkro-auth-api` | `auth_schema` | — | — | Child of User; never referenced outside Auth |
| ServiceToken | `synkro-auth-api` | `auth_schema` | — | — | Metadata only; the signed token itself is never stored anywhere (ADR-006) |
| Customer | `synkro-customers-api` | `customers_schema` | `synkro-sales-api` (`sale.customer_id`) | A plain UUID, never the customer's name or document | `synkro-workflow` confirms the customer is active in saga step 1 (`validate-customer`) before the sale is written; Sales never queries Customers for it (ADR-007) |
| Category | `synkro-products-api` | `products_schema` | — | — | Referenced only by Product, inside the same schema |
| Product | `synkro-products-api` | `products_schema` | `synkro-sales-api` (`sale_detail.product_id`) | A plain UUID and the price frozen at reservation time (`unit_price_cents`) | `synkro-workflow` reserves stock and receives the frozen price in saga step 2 (`reserve-stock`); that price is copied into the sale because it is a business rule (ADR-005), not a cached read |
| StockAdjustment | `synkro-products-api` | `products_schema` | — | — | Child of Product; never referenced outside Products |
| StockReservation | `synkro-products-api` | `products_schema` | `synkro-workflow` (holds the `reservationId` in the saga's `step_results` while the saga runs) | A plain UUID, to call `release` if the saga compensates | Not a copy — `synkro-workflow` calls back into Products to release it; Products remains the only owner of the reservation's state |
| StockReservationLine | `synkro-products-api` | `products_schema` | — | — | Child of StockReservation; never referenced outside Products |
| StockAlert | `synkro-products-api` | `products_schema` | — | — | Opened and resolved by `synkro-worker` through the API, never written directly |
| Sale | `synkro-sales-api` | `sales_schema` | — | — | Never referenced by another domain — Sales is a terminal node (see `dependency-map.md`) |
| SaleDetail | `synkro-sales-api` | `sales_schema` | — | — | Child of Sale; never referenced outside Sales |
| Saga instance | `synkro-workflow` | `workflow_schema` | — | — | Internal orchestrator state, not a domain entity (ADR-007); no other service reads or writes it |

---

## Reading the matrix

**"Owner service"** is the only service that can `INSERT`, `UPDATE` or `DELETE` (soft-delete) rows of that entity. Every other service that needs the data either:

1. **Holds a plain UUID**, with no foreign key and no copy of any other field (`customer_id`, `product_id`, `created_by`). This is the normal case, and it is why Sales has no `customer_name` or `product_name` column (`06-data/models.md`, principle 4 — "External references").
2. **Holds a value frozen at one point in time**, because the business rule requires it to stop changing afterward. The only case in the system is `unit_price_cents` in `SaleDetail`: it must keep the price the customer paid, even if the product's price changes later (`02-domain/entities-and-rules.md`, SaleDetail invariants).

**No entity has two services that can write to it.** This is deliberate: if a future requirement seemed to need that, it would mean the boundary is wrong, not that ownership should be shared — see `service-boundary-rules.md`, "The schema rule".

**Reports are not an entity.** The three report endpoints of `synkro-sales-api` (`daily`, `monthly`, `top-products`) are calculated on demand by aggregating `Sale` and `SaleDetail`. There is no `sales_summary` row anywhere to own (ADR-005 Decision 5).

---

## Correlations

- Entity definitions and invariants → `02-domain/entities-and-rules.md`
- External reference resolution at write time and read time → `02-domain/entities-and-rules.md`, "Resolving external references between services"
- Schema-per-domain isolation → ADR-009
- Money in minor units, external references as plain UUIDs → ADR-005 Decision 3
- Service boundaries and the database rule → `09-microservices/service-boundary-rules.md`
- Dependency graph between services → `09-microservices/dependency-map.md`
