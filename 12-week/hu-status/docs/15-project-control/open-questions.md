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
| **Required for** | Confirming the `Sale` document's fields in `06-data/models.md` — already rewritten for the document model in HU-DOCS-80 (ADR-010) — before `synkro-sales-db`'s first migration |
| **Who answers** | Product Owner (course instructor) |
| **Deadline** | Before `synkro-sales-db`'s first migration |
| **Status** | 🔴 Unanswered |

### Q-002 — Will multiple payment methods be supported in the MVP?

| Field | Value |
|-------|-------|
| **Context** | The current `Sale` entity has no payment-method field at all — the MVP scope (`01-context/scope.md`) never mentions payment capture, only sale registration and stock deduction |
| **Required for** | The `sale` document's shape in `06-data/models.md` — already rewritten for MongoDB in HU-DOCS-80 (ADR-010) — if the answer is yes |
| **Who answers** | Product Owner (course instructor) |
| **Deadline** | Before `synkro-sales-db`'s first migration |
| **Status** | 🔴 Unanswered |

### Q-003 — What happens if stock reaches zero during checkout, just before confirmation?

| Field | Value |
|-------|-------|
| **Context** | `StockReservation.reserve()` already fails the whole reservation if any line lacks stock (`entities-and-rules.md`), which covers the case where two salespeople reserve the same product at nearly the same instant — PostgreSQL's row-level locking during the `UPDATE` serializes the two requests. What is still open is only the **UX**: what message the salesperson sees when their reservation is rejected for this reason, and whether the frontend should re-check stock live while the form is open |
| **Required for** | `12-ux-ui/navigation-map.md` Flow 1 — now partially answered: `12-ux-ui/wireframes.md` (HU-DOCS-86) specifies the exact rejection message shown for insufficient stock, naming the failed step. Live re-checking while the form is open is still undecided |
| **Who answers** | Whoever implements the sales portal, with the Product Owner for the exact wording |
| **Deadline** | Before the sales portal's UI for Flow 1 is built |
| **Status** | 🟡 Partially answered — the concurrency problem and the rejection message are solved; only live re-checking remains |

### Q-004 — Will the `qa` environment actually be provisioned this semester?

| Field | Value |
|-------|-------|
| **Context** | `scope.md`'s "Project Environments" table has marked Staging as "Planned — pending a decision" since the project began. The branching model (`develop/qa/main`) and the `qa/*` branch prefix already assume it exists (`git-conventions.md`), but no `qa` PostgreSQL instance, MongoDB instance, or CI job has ever been configured |
| **Required for** | Whether the team spends time configuring a second environment in `synkro-infra-postgres` and `synkro-infra-mongo`, or treats `qa` as a branch name only, with no running environment behind it, for the rest of the course |
| **Who answers** | Product Owner (course instructor), based on progress during the second half of the semester |
| **Deadline** | Before the team plans a sprint around provisioning it |
| **Status** | 🔴 Unanswered |

### Q-005 — Does `synkro-auth-api` satisfy the course's cross-cutting security service requirement, or is a separate repository needed?

| Field | Value |
|-------|-------|
| **Context** | The project accepted ADR-013 Option A on 2026-10-25: Auth remains the cross-cutting identity/token service and no additional repository is created. This is the internal architecture decision; it does not assert that the instructor confirmed the course classification or naming. |
| **Required for** | External course confirmation only. ADR-013 acceptance is already recorded from the explicit project decision. A later required architecture change must use a new modifying ADR, not edit the Accepted record. |
| **Who answers** | Course instructor; AsolanoT retrieves and records the separate question/response evidence. |
| **Deadline** | Before claiming external course confirmation or applying any externally required repository change. |
| **Status** | 🟡 Partially answered — project choice accepted; instructor confirmation not recorded. The older #156 closure comment belongs to the earlier Proposed state and is not the new acceptance source. No external approval is fabricated. |

### Q-006 — Do the Users and Service tokens screens need a "list all" endpoint?

| Field | Value |
|-------|-------|
| **Context** | `12-ux-ui/navigation-map.md` (HU-DOCS-86) designed the `/users` and `/service-tokens` screens around what `synkro-auth-api.yaml` actually supports today — creation and lookup by a known ID, with **no endpoint to list every user or every issued token**. The instructor's review bot did not flag this (it flagged three other points in the same PR), so it has not been raised outside this team yet |
| **Required for** | Deciding whether a browsable administration table is in scope at all, before `synkro-auth-api.yaml` gets a new endpoint added through an ADR-004-style extension |
| **Who answers** | Product Owner (course instructor), since it is a scope question, not a technical one — the team can build either shape |
| **Deadline** | Before the `AUTH` prefix's first real stories are refined (the Cut 6 backlog's "next cut" row) |
| **Status** | 🔴 Unanswered |

---

## Closed questions

*(none yet — the six above are the first to be logged)*

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
- External dependencies behind Q-004 and the instructor's actions on Q-005 → `15-project-control/dependencies.md`
- ADR-013 behind Q-005 → `05-architecture/decisions/records/ADR-013-identity-as-cross-cutting-security.md`
- Screens behind Q-006 → `12-ux-ui/navigation-map.md`, "Endpoints per screen"
