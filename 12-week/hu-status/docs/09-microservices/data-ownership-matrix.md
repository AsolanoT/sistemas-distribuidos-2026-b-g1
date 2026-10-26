# Data Ownership Matrix

> Who holds the authoritative version of each piece of data. No service
> stores a copy of another domain's entity — only the plain identifier it
> needs, resolved through that domain's API (ADR-005 Decision 3, ADR-009,
> ADR-010). This is the practical consequence of "each domain owns its
> store": this table says, entity by entity, what that means.

---

## Matrix

| Entity | Owner service | Schema / database | Others that reference it | What they hold | How it stays correct |
|--------|---------------|--------|---------------------------|-----------------|----------------------|
| User | `synkro-auth-api` | `auth_schema` | `synkro-sales-api` (`sale.createdBy`) | A plain UUID, never the user's name or email | The saga sends `createdBy` from the validated token's `sub`; Sales never queries Auth for it (ADR-002, ADR-006) |
| RefreshToken | `synkro-auth-api` | `auth_schema` | — | — | Child of User; never referenced outside Auth |
| ServiceToken | `synkro-auth-api` | `auth_schema` | — | — | Auth persists token metadata, not the issued signed value; the caller holds the credential in protected runtime configuration (ADR-006/017) |
| Customer | `synkro-customers-api` | `customers_schema` | `synkro-sales-api` (`sale.customerId`) | A plain UUID, never the customer's name or document | `synkro-workflow` confirms the customer is active in saga step 1 (`validate-customer`) before the sale is written; Sales never queries Customers for it (ADR-007) |
| Category | `synkro-products-api` | `products_schema` | — | — | Referenced only by Product, inside the same schema |
| Product | `synkro-products-api` | `products_schema` | `synkro-sales-api` (`sale.details[].productId`) | A plain UUID and the price frozen at reservation time (`unitPriceCents`) | `synkro-workflow` reserves stock and receives the frozen price in saga step 2 (`reserve-stock`); that price is copied into the sale because it is a business rule (ADR-005), not a cached read |
| StockAdjustment | `synkro-products-api` | `products_schema` | — | — | Child of Product; never referenced outside Products |
| StockReservation | `synkro-products-api` | `products_schema` | `synkro-workflow` (holds the `reservationId` in the saga's `step_results` while the saga runs) | A plain UUID, to call `release` if the saga compensates | Not a copy — `synkro-workflow` calls back into Products to release it; Products remains the only owner of the reservation's state |
| StockReservationLine | `synkro-products-api` | `products_schema` | — | — | Child of StockReservation; never referenced outside Products |
| StockAlert | `synkro-products-api` | `products_schema` | — | — | Products owns alert state/API. Worker is the intended opener/resolver through SERVICE calls; that business job is not delivered (TD-019) |
| Sale | `synkro-sales-api` | `sales` database (MongoDB), collection `sale` | Workflow execution result and portal view | saleId reference, not ownership | No other business domain writes/replicates Sale; Workflow retains the receipt and Sales remains a domain HTTP sink |
| SaleDetail | `synkro-sales-api` | Embedded in each `sale` document (`details`) | — | — | Part of the Sale aggregate; it has no collection of its own and is never referenced outside its sale |
| Saga instance/attempt receipts | `synkro-workflow` | `workflow_schema` | Browser via authorized Workflow GET only | sagaId/status projection; no direct store reads | Internal execution/recovery state under ADR-015; not a new business aggregate |
| User creation audit | `synkro-auth-api` | `auth_schema` | Authorized operators via controlled Auth evidence access | Safe audit/correlation reference | Creation and audit are atomic; app cannot mutate/delete audit; initialization is not TD-009 recovery |
| Host session descriptor | Host | Per-tab browser metadata | Portal reads token-free capabilities | sub/role/sessionId, never token ownership | ADR-016: descriptor grants no authority; Angular v1 interface remains unchanged |
| Sales intent journal | Sales Portal | Per-tab sessionStorage, synkro.sales.intent.v1 | Host supplies identity only | Original key, fingerprint, optional sagaId and original deadline | Not a backend entity or credential; no automatic submit/observe on reload, no cross-tab guarantee |

---

## Reading the matrix

**"Owner service"** is the only runtime writer of that entity. Soft deactivation updates lifecycle state; it is not a physical SQL DELETE. Application grants deny physical deletion where required, and audit remains append-only. Every other service that needs the data either:

1. **Holds a plain UUID**, with no foreign key and no copy of any other field (`customerId`, `productId`, `createdBy`). This is the normal case, and it is why Sales has no `customerName` or `productName` field (`06-data/models.md`, principle 4b — "External references").
2. **Holds a value frozen at one point in time**, because the business rule requires it to stop changing afterward. The only case in the system is `unitPriceCents` in `SaleDetail`: it must keep the price the customer paid, even if the product's price changes later (`02-domain/entities-and-rules.md`, SaleDetail invariants).

**No entity has two services that can write to it.** This is deliberate: if a future requirement seemed to need that, it would mean the boundary is wrong, not that ownership should be shared — see `service-boundary-rules.md`, "The schema rule".

Optional customer/product display names are resolved by the portal through the Host client, never stored as authoritative Sale fields. Sales detail renders frozen amounts/identifiers even when metadata fails; metadata retry does not re-register a sale. The UI's inactive-sale presentation does not resolve Sales restoration gap TD-012.

**Reports are not an entity.** The three report endpoints of `synkro-sales-api` (`daily`, `monthly`, `top-products`) are calculated on demand by aggregating the `sale` collection with a MongoDB pipeline. There is no `sales_summary` row anywhere to own (ADR-005 Decision 5, ADR-010 Decision 4).

---

## Correlations

- Entity definitions and invariants → `02-domain/entities-and-rules.md`
- External reference resolution at write time and read time → `02-domain/entities-and-rules.md`, "Resolving external references between services"
- Schema-per-domain isolation → ADR-009; Sales on its own MongoDB database → ADR-010
- Money in minor units, external references as plain UUIDs → ADR-005 Decision 3
- Service boundaries and the database rule → `09-microservices/service-boundary-rules.md`
- Dependency graph between services → `09-microservices/dependency-map.md`
