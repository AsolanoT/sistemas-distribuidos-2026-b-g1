# Data Dictionary

> Exact meaning of every field that is ambiguous on its own or carries a
> business rule. Purely self-explanatory fields (like a table's own `id`)
> are not repeated here — see `models.md` for the full column list per table.

| Field | Service | Table / collection | Type | Detailed description | Possible values |
|-------|---------|-------|------|----------------------|------------------|
| role | auth | system_user | text + `CHECK` | The single role a system user has. Drives every route guard and permission check (`security-policy.md`). A user has exactly one role, never more than one. `SERVICE` exists only inside service tokens and is never stored here (ADR-006). | `ADMIN`, `SALESPERSON`, `INVENTORY` |
| active | every domain | every table with a lifecycle | boolean | Soft-delete flag, per ADR-001 §7. The service's database role has no `DELETE` permission, so the database itself enforces it. `false` means the row is logically deleted — it must be excluded from normal reads but never physically removed, to preserve traceability (NFR-009). Meaning shifts slightly per entity: for `system_user`, `false` blocks login; for `customer`, `false` blocks new sales; for `product`, `false` blocks new reservations. In Sales the flag is a field of the `sale` document and of each element of `details`; the role `sales_writer` has no action to remove documents. | `true`, `false` |
| token | auth | refresh_token | text | **A hash** of the refresh token issued to a client session, never the token itself. One-time use — rotated on every refresh per `security-policy.md`. | Hash string, unique |
| token_id | auth | service_token | uuid | The `jti` of a service token, and the id used by `GET /api/v1/auth/service-tokens/{id}`. The table keeps only the metadata of the token; the signed token is never stored (ADR-006). | Unique |
| identity_document | customers | customer | text, 1–30 characters | Cédula or NIT. The real-world lookup key sales staff use at the point of sale — not the internal `customer_id`. Unique across all customers, active or not. | Any valid Colombian ID/NIT format |
| key | every domain that creates over HTTP | idempotency_key (in `workflow`, the saga's own column) | text, 8–128 characters | The `Idempotency-Key` a client sent when creating a resource. Written in the same transaction as the resource; a retry with the same key returns the original resource instead of creating a second one (ADR-005). Sales stores it as the field `idempotencyKey` of the sale (see below). | Client-generated value, unique per table |
| price_cents | products | product | bigint | Current unit price, in minor units (1/100 COP). Not historical — see `stock_reservation_line.unit_price_cents` for the price frozen in a sale. | `> 0` |
| stock | products | product | integer | Units currently available. Changes only through a stock reservation or a stock adjustment, never when a product is edited; never negative. | `>= 0` |
| customerId | sales | sale | string (UUID) | **Looks like a reference the engine checks, but it is not.** Points to a customer in another domain. The saga checks that it exists and is active (step 1) before the sale is written. | An existing, `active = true` customer |
| createdBy | sales | sale | string (UUID) | **Salesperson who registered the sale.** External reference to `system_user.user_id`. Sent by the saga from the salesperson's validated token and accepted only from a caller holding `sales:register` (ADR-002, ADR-006). Enables the SALESPERSON "own sales" permission and resolves STRIDE threats R-3 and I-4. | A valid `user_id` |
| date | sales | sale | date (UTC) | When the sale was created. Named `date`, not `createdAt`, per ADR-001's field naming. | Any valid timestamp |
| totalCents | sales | sale | long | Sum of the `subtotalCents` of the sale's lines, enforced by the domain when the sale is registered. | `>= 0` |
| idempotencyKey | sales | sale | string, 8–128 characters | The `Idempotency-Key` the saga sent (`<sagaId>:register-sale`). Unique across sales; written in the same atomic write as the sale (ADR-010). | Unique |
| details | sales | sale | array of 1 to 100 embedded lines | The lines of the sale. They live inside the sale document, not in a collection of their own. | 1 to 100 elements |
| details[].productId | sales | sale | string (UUID) | Same pattern as `customerId`: an external reference, reserved by the saga (step 2) before the sale is written. | A product reserved for this sale |
| details[].unitPriceCents | sales | sale | long | **Frozen when the stock is reserved.** Copied from the reservation line into the sale. Never the product's current price. | `>= 1` |
| details[].subtotalCents | sales | sale | long | Always equal to `quantity * unitPriceCents`, enforced by the domain; the validator checks only its type and range. | `= quantity * unitPriceCents` |
| unit_price_cents | products | stock_reservation_line | bigint | **Frozen when the stock is reserved.** Copied from `product.price_cents` into the reservation line; the saga copies it from there into the sale (`details[].unitPriceCents`). Never the product's current price. | `> 0` |
| delta | products | stock_adjustment | integer | Units added (positive) or removed (negative) by a manual correction. Never edited; a mistake is corrected with a new adjustment. | `<> 0` |
| status | products | stock_reservation | text + `CHECK` | `RESERVED` while the stock is set aside for a sale; `RELEASED` once given back by a compensation. Final once released. | `RESERVED`, `RELEASED` |
| status | products | stock_alert | text + `CHECK` | `OPEN` while the product is at or below the worker's threshold; `RESOLVED` when it recovers. At most one `OPEN` per product. | `OPEN`, `RESOLVED` |
| resource_type | products | idempotency_key | text + `CHECK` | Which kind of resource the key created, because this domain creates several. | `PRODUCT`, `CATEGORY`, `STOCK_ADJUSTMENT`, `STOCK_RESERVATION`, `STOCK_ALERT` |
| status | workflow | saga_instance | text + `CHECK` | Outcome of a saga. A `RUNNING` saga with `failed_step` set is compensating; `FAILED` means a compensation failed and a person must decide (ADR-007). | `RUNNING`, `COMPLETED`, `COMPENSATED`, `FAILED` |
| failed_step | workflow | saga_instance | text | The step that failed, returned to the client as `failedStep`. Internal error details stay in `error_detail` and are never returned. | `validate-customer`, `reserve-stock`, `register-sale`, or empty |

---

## Auth user-creation evidence (ADR-014)

| Field | Table | Meaning / allowed values |
|---|---|---|
| operation | user_creation_audit | USER_REGISTERED for ordinary API creation; INITIAL_ADMIN_CREATED for controlled initialization |
| actor_kind | user_creation_audit | ADMIN refers to the trusted application caller; OPERATOR refers to the controlled deployment identity, not an application user |
| actor_user_id | user_creation_audit | ADMIN's user_id at creation time; null for initialization; no inference from the actor's current role |
| operator_identity | user_creation_audit | Deployment-session identity for initialization; null for ordinary registration; no secrets or free-form payload |
| created_user_id | user_creation_audit | Created user; unique attribution record per new user; no new User authorship column |
| outcome | user_creation_audit | SUCCESS only; failures and no-op runs are operational/security logs |
| occurred_at | user_creation_audit | Evidence creation timestamp; UTC presentation |
| correlation_id | user_creation_audit | Connects the successful creation with HTTP logs or the controlled CLI execution |

Types, constraints, permissions and the initialization lock-key reservation have
one source of truth: `06-data/models.md`. The table is append-only evidence, not
a business aggregate, initialization marker or message-broker event.

## Correlations

- Full column list and constraints per table → `06-data/models.md`
- Domain invariants these fields enforce → `02-domain/entities-and-rules.md`
- Role permissions that `system_user.role` drives → `00-governance/security-policy.md`
- Database per domain, minor units and idempotency keys → ADR-005; Sales' document model → ADR-010
- Stock reservations, stock alerts and the saga store → ADR-007
- ADR-002 (added `created_by`) → `05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md`
