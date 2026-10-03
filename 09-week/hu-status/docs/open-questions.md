# Open Questions

> Unanswered questions that block or could block the project. When a
> question gets an answer: if it is architectural, it becomes an ADR and
> this row closes pointing to it; if it is not, this row closes with the
> decision written directly here.

---

## Active questions

### Q-001 — Will discounts or promotions be supported in the MVP?

| Field | Value |
|-------|-------|
| **Context** | `Sale.totalCents` is currently defined as exactly the sum of `SaleDetail.subtotalCents`, with no discount field anywhere in the model (`02-domain/entities-and-rules.md`) |
| **Required for** | Confirming the `Sale` and `SaleDetail` schema before the first real migration is written (`06-data/models.md`) |
| **Who answers** | Product Owner (course instructor) |
| **Deadline** | Before `synkro-sales-db`'s first migration |
| **Status** | 🔴 Unanswered |

### Q-002 — Will multiple payment methods be supported in the MVP?

| Field | Value |
|-------|-------|
| **Context** | The current `Sale` entity has no payment-method field at all — the MVP scope (`01-context/scope.md`) never mentions payment capture, only sale registration and stock deduction |
| **Required for** | The `sales_schema` data model, if the answer is yes |
| **Who answers** | Product Owner (course instructor) |
| **Deadline** | Before `synkro-sales-db`'s first migration |
| **Status** | 🔴 Unanswered |

### Q-003 — What happens if stock reaches zero during checkout, just before confirmation?

| Field | Value |
|-------|-------|
| **Context** | `StockReservation.reserve()` already fails the whole reservation if any line lacks stock (`entities-and-rules.md`), which covers the case where two salespeople reserve the same product at nearly the same instant — PostgreSQL's row-level locking during the `UPDATE` serializes the two requests. What is still open is only the **UX**: what message the salesperson sees when their reservation is rejected for this reason, and whether the frontend should re-check stock live while the form is open |
| **Required for** | `12-ux-ui/navigation-map.md` Flow 1 (currently shows a generic "insufficient stock" message); not required for the backend, which already handles the concurrency case correctly |
| **Who answers** | Whoever implements the sales portal, with the Product Owner for the exact wording |
| **Deadline** | Before the sales portal's UI for Flow 1 is built |
| **Status** | 🟡 Partially answered — the concurrency problem itself is solved (see Context); only the UX detail remains |

### Q-004 — Will the `qa` environment actually be provisioned this semester?

| Field | Value |
|-------|-------|
| **Context** | `scope.md`'s "Project Environments" table has marked Staging as "Planned — pending a decision" since the project began. The branching model (`develop/qa/main`) and the `qa/*` branch prefix already assume it exists (`git-conventions.md`), but no `qa` PostgreSQL instance or CI job has ever been configured |
| **Required for** | Whether the team spends time configuring a second environment in `synkro-infra`, or treats `qa` as a branch name only, with no running environment behind it, for the rest of the course |
| **Who answers** | Product Owner (course instructor), based on progress during the second half of the semester |
| **Deadline** | Before the team plans a sprint around provisioning it |
| **Status** | 🔴 Unanswered |

### Q-005 — Will the team implement the post-MVP items already deferred, or is the MVP the final deliverable?

| Field | Value |
|-------|-------|
| **Context** | `15-project-control/technical-backlog.md` lists six deferred items (daily sales closing, message broker, per-product threshold, JWKS endpoint, DDL prefix rename, operational monitoring), all marked "Post-MVP" or tied to a trigger that may never fire during the course |
| **Required for** | Deciding whether any Post-MVP item should be pulled into the implementation sprints, or whether the backlog is purely documentation of what was consciously not built |
| **Who answers** | Product Owner (course instructor) |
| **Deadline** | Before the implementation phase's sprint planning |
| **Status** | 🔴 Unanswered |

---

## Closed questions

*(none yet — the five above are the first to be logged)*

---

## How a question closes

1. If the answer changes an architectural decision already recorded,
   write the new ADR, mark this table's row "✅ Closed — ADR-0NN", and
   leave the row instead of deleting it (so the history of what was once
   open is not lost).
2. If the answer does not need an ADR (a UX wording choice, a scope
   confirmation that doesn't change a contract), write the decision
   directly in the "Status" cell and change it to "✅ Closed".
3. Either way, update every document the Context column pointed to.

---

## Correlations

- Original source of Q-001 to Q-003 → `01-context/scope.md`, "Open Questions"
- Technical debt these questions might feed → `15-project-control/technical-backlog.md`
- Risk register → `15-project-control/risks.md`
- External dependencies behind Q-004 → `15-project-control/dependencies.md`
