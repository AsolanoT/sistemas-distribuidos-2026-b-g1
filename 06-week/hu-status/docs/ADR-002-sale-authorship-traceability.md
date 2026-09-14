# ADR-002 — Sale Authorship Traceability and sales_summary Status

| Field | Value |
|-------|-------|
| **ID** | ADR-002 |
| **Date** | 2026-09 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — Tech Lead, Sergio Andrés Ordóñez Díaz |
| **Reviewers** | Jordan Ramirez Gallego, Fredman Santiago Plazas Artunduaga — Development team |
| **Modifies** | ADR-001 §7 (Data Model per Schema — schema `sales`) |

---

## Context

ADR-001 was accepted as the system's architectural decision. Its immutability rule states that any change must be documented in a new ADR that explicitly references ADR-001.

This ADR resolves three problems that ADR-001 left open:

### Problem 1 — The `sales` table does not record who created the sale

ADR-001 §6 grants the SALESPERSON role permission to "view reports for their own sales." However, the `sales` table defined in ADR-001 §7 contains no field identifying the user who registered the sale (`sale_id`, `customer_id`, `date`, `total`, `active`). This makes the permission impossible to implement: sales-service has no way to filter sales by user.

Additionally, the STRIDE threat model identifies this gap as:

- **R-3 (Repudiation):** it is impossible to determine which user registered a specific sale.
- **I-4 (Information Disclosure):** a SALESPERSON could access another salesperson's sales data.

Non-functional requirement NFR-04 (operation traceability) is also partially unmet: the system knows *what* was done (soft deletion, logs) but not always *who* did it at the persistent data level.

### Problem 2 — `sales_summary` has three contradictory definitions

| Document | What it says |
|----------|-------------|
| ADR-001 §7 | `sales_summary` is a table with columns: `date`, `daily_sales_total`, `monthly_sales_total`, `product_id`, `quantity_sold`, `active` |
| `02-domain/entities-and-rules.md` | `SalesSummary` **is not a domain entity**; it is calculated on demand via aggregation queries (`SUM`, `GROUP BY`) |
| `06-data/models.md` | The table exists in the schema but **no process populates it**; reporting screens are still pending scope |

Three documents, three interpretations. A single authoritative definition is needed.

### Problem 3 — No traceability of who deactivated a record

The `active` field records *that* a record was deactivated, but not *who* or *when* the deactivation occurred. Structured logs cover this information, but it is not persisted in the database for programmatic queries.

---

## Evaluated Alternatives

### Alternative A — Add `created_by` to the `sales` table (CHOSEN)

Add a single field `created_by UUID NOT NULL` to the `sales` table that stores the `user_id` of the authenticated user who registered the sale, extracted from the JWT `sub` claim at creation time.

- **Pros:** Resolves the SALESPERSON permission with minimal change (1 column, 1 table). Requires no additional infrastructure. The "my sales" query is a simple `WHERE created_by = :userId`. Consistent with the principle of minimal change over an immutable ADR.
- **Cons:** Only covers the `sales` table, not operations in other services (customers, products). Does not record who deactivated a record, only who created it.

### Alternative B — Cross-cutting audit table in each schema

Create an `audit_log` table in each schema that automatically records `user_id`, `action`, `entity`, `entity_id`, `timestamp`, and `old_values`/`new_values` for every write operation.

- **Pros:** Complete NFR-04 coverage for all entities and all services. Allows knowing who created, modified, and deactivated any record. Supports historical auditing.
- **Cons:** Requires implementing the mechanism in all 4 services (2 different languages). Significantly increases write volume to the database. Introduces complexity in the infrastructure layer (trigger vs interceptor vs middleware). Exceeds the MVP scope to solve a problem that currently only affects the `sales` table.

---

## Decision

**Alternative A:** add `created_by UUID NOT NULL` to the `sales` table.

Alternative B is recorded as a **candidate for a future version** if NFR-04 is extended to require full auditing across all services. For the MVP, the combination of `created_by` in the database + structured logs with `userId` on every operation (`cross-cutting.md` §2) provides sufficient traceability.

### Data Model Change

**Table `sales` — before (ADR-001 §7):**

```
sales (sale_id, customer_id, date, total, active)
```

**Table `sales` — after (ADR-002):**

```
sales (sale_id, customer_id, created_by, date, total, active)
```

**DDL for the new field:**

```sql
ALTER TABLE sales
  ADD COLUMN created_by UUID NOT NULL;

CREATE INDEX idx_sales_created_by ON sales (created_by);
```

`created_by` is an **external reference** to `user_id` in the `auth` schema, following the same pattern as `customer_id`: validated at runtime (the value is extracted from the JWT), not as a database foreign key.

### Resolution of `sales_summary`

**Single interpretation:** the `sales_summary` table defined in ADR-001 §7 **exists in the schema** (because ADR-001 is immutable and names it), but **is not a domain entity and is not populated by any process in the MVP**.

Reports (FR-08, FR-09) are served through direct aggregation queries over `sales` and `sale_details`:

```sql
-- Daily report (FR-08)
SELECT DATE(date) AS day, SUM(total) AS daily_total
FROM sales WHERE active = true
GROUP BY DATE(date) ORDER BY day DESC;

-- Top-selling products (FR-09)
SELECT sd.product_id, SUM(sd.quantity) AS total_sold
FROM sale_details sd
JOIN sales s ON s.sale_id = sd.sale_id
WHERE s.active = true AND sd.active = true
GROUP BY sd.product_id
ORDER BY total_sold DESC LIMIT 10;
```

If data volume grows to the point where these queries degrade performance, the `sales_summary` table would be activated as a materialization (CQRS), which was already evaluated and rejected for the MVP in `pattern-guide.md` §4.

---

## Consequences

**Positive:**

* The SALESPERSON role's "view reports for their own sales" permission becomes implementable with a simple `WHERE created_by = :userId`.
* STRIDE threats R-3 and I-4 move from "Pending" to "Designed."
* NFR-04 is covered for the system's most critical operation (sale registration).
* `sales_summary` has a single, consistent interpretation across the entire repository.

**Negative:**

* Authorship traceability only covers sale creation. Operations in other services (create/deactivate customers, modify stock) rely solely on logs.
* ADR-001 §7 now has a data model that differs from the actual state. This ADR documents the difference; ADR-001 remains unaltered.

**Mitigation:**

* Structured logs with `userId` and `traceId` (`cross-cutting.md` §2, §3) complement database traceability for uncovered operations.
* If full auditing becomes necessary, Alternative B is implemented as an evolution, not a rewrite.

---

## Affected Documents

| Document | Required Change |
|----------|----------------|
| `06-data/models.md` | Add `created_by UUID NOT NULL` to the `sales` table; update ER diagram; add data-dictionary entry |
| `02-domain/entities-and-rules.md` | Add `createdBy` to Entity: Sale; add invariant "createdBy must correspond to a valid, active system user" |
| `06-data/data-dictionary.md` | Add entry for `created_by` |
| `05-architecture/security-threat-model.md` | Update R-3 and I-4 from "Pending (ADR-002)" to "Designed" |
| `05-architecture/overview.md` | No changes — the overview does not detail fields |
| ADR-001 | **No changes** — immutable per its own rule |

---

## References

* Original decision → `05-architecture/decisions/records/ADR-001-architecture.md`
* Threat model → `05-architecture/security-threat-model.md` (R-3, I-4)
* Pattern evaluation → `05-architecture/pattern-guide.md` §4 (CQRS rejected)
* Security policy and RBAC → `00-governance/security-policy.md`
* Non-functional requirements → `04-requirements/non-functional.md` NFR-004
* Cross-cutting concerns → `05-architecture/cross-cutting.md` §2 (logging), §3 (correlation ID)
