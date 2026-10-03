# Data Dictionary

> Exact meaning of every field that is ambiguous on its own or carries a
> business rule. Purely self-explanatory fields (like a table's own `id`)
> are not repeated here — see `models.md` for the full column list per table.

| Field | Service | Table | Type | Detailed description | Possible values |
|-------|---------|-------|------|----------------------|------------------|
| role | auth | system_user | text + `CHECK` | The single role a system user has. Drives every route guard and permission check (`security-policy.md`). A user has exactly one role, never more than one. `SERVICE` exists only inside service tokens and is never stored here (ADR-006). | `ADMIN`, `SALESPERSON`, `INVENTORY` |
| active | every domain | every table with a lifecycle | boolean | Soft-delete flag, per ADR-001 §7. The service's database role has no `DELETE` permission, so the database itself enforces it. `false` means the row is logically deleted — it must be excluded from normal reads but never physically removed, to preserve traceability (NFR-009). Meaning shifts slightly per entity: for `system_user`, `false` blocks login; for `customer`, `false` blocks new sales; for `product`, `false` blocks new reservations. | `true`, `false` |
| token_id | auth | service_token | uuid | The `jti` of a service token, and the id used by `GET /api/v1/auth/service-tokens/{id}`. The table keeps only the metadata of the token; the signed token is never stored (ADR-006). | Unique |
| identity_document | customers | customer | text, 1–30 characters | Cédula or NIT. The real-world lookup key sales staff use at the point of sale — not the internal `customer_id`. Unique across all customers, active or not. | Any valid Colombian ID/NIT format |
| key | every domain that creates over HTTP | idempotency_key (in `workflow`, the saga's own column) | text, 8–128 characters | The `Idempotency-Key` a client sent when creating a resource. Written in the same transaction as the resource; a retry with the same key returns the original resource instead of creating a second one (ADR-005). | Client-generated value, unique per table |
| price_cents | products | product | bigint | Current unit price, in minor units (1/100 COP). Not historical — see `sale_detail.unit_price_cents` for the price frozen in a sale. | `> 0` |
| stock | products | product | integer | Units currently available. Changes only through a stock reservation or a stock adjustment, never when a product is edited; never negative. | `>= 0` |
| customer_id | sales | sale | uuid | **Looks like a foreign key but is not one.** Points to a customer in another domain's database. The saga checks that it exists and is active (step 1) before the sale is written. | An existing, `active = true` customer |
| created_by | sales | sale | uuid | **Salesperson who registered the sale.** External reference to `system_user.user_id`. Sent by the saga from the salesperson's validated token and accepted only from a caller holding `sales:register` (ADR-002, ADR-006). Enables the SALESPERSON "own sales" permission and resolves STRIDE threats R-3 and I-4. | A valid `user_id` |
| product_id | sales | sale_detail | uuid | Same pattern as `sale.customer_id`: an external reference, reserved by the saga (step 2) before the sale is written. | A product reserved for this sale |
| unit_price_cents | products, sales | stock_reservation_line, sale_detail | bigint | **Frozen when the stock is reserved.** Copied from `product.price_cents` into the reservation line, and from there into the sale. Never the product's current price. | `> 0` |
| subtotal_cents | sales | sale_detail | bigint | Always equal to `quantity * unit_price_cents`, enforced by a `CHECK`. | `= quantity * unit_price_cents` |
| total_cents | sales | sale | bigint | Sum of the sale's `subtotal_cents`, enforced by the domain when the sale is registered. | `>= 0` |
| date | sales | sale | timestamptz | When the sale was created. Named `date`, not `created_at`, per ADR-001's field naming. | Any valid timestamp |
| delta | products | stock_adjustment | integer | Units added (positive) or removed (negative) by a manual correction. Never edited; a mistake is corrected with a new adjustment. | `<> 0` |
| status | products | stock_reservation | text + `CHECK` | `RESERVED` while the stock is set aside for a sale; `RELEASED` once given back by a compensation. Final once released. | `RESERVED`, `RELEASED` |
| status | products | stock_alert | text + `CHECK` | `OPEN` while the product is at or below the worker's threshold; `RESOLVED` when it recovers. At most one `OPEN` per product. | `OPEN`, `RESOLVED` |
| resource_type | products | idempotency_key | text + `CHECK` | Which kind of resource the key created, because this domain creates several. | `PRODUCT`, `CATEGORY`, `STOCK_ADJUSTMENT`, `STOCK_RESERVATION`, `STOCK_ALERT` |
| status | workflow | saga_instance | text + `CHECK` | Outcome of a saga. A `RUNNING` saga with `failed_step` set is compensating; `FAILED` means a compensation failed and a person must decide (ADR-007). | `RUNNING`, `COMPLETED`, `COMPENSATED`, `FAILED` |
| failed_step | workflow | saga_instance | text | The step that failed, returned to the client as `failedStep`. Internal error details stay in `error_detail` and are never returned. | `validate-customer`, `reserve-stock`, `register-sale`, or empty |

---

## Correlations

- Full column list and constraints per table → `06-data/models.md`
- Domain invariants these fields enforce → `02-domain/entities-and-rules.md`
- Role permissions that `system_user.role` drives → `00-governance/security-policy.md`
- Database per domain, minor units and idempotency keys → ADR-005
- Stock reservations, stock alerts and the saga store → ADR-007
- ADR-002 (added `created_by`) → `05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md`
