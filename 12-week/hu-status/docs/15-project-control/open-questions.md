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
| **Context** | Delivered Sale has no discount field; total remains the exact sum of frozen detail subtotals in the domain/contracts. Sales migrations already exist. |
| **Required for** | Confirming scope before accepting an extension. The former “before first Sales migration” gate expired; it is not still future. Do not silently alter historical migrations or accept discounts through reconciliation. |
| **Who answers** | PO/instructor; SergioAndres17 coordinates the domain answer and records its link, SantiagoPlazas2005 tracks the gate. |
| **Deadline** | Replanned for Sprint 12 review; before approving discount scope or claiming PO confirmation. |
| **Status** | 🔴 Unanswered — current delivered no-discount model remains the baseline, not an inferred PO answer. Closing proof: linked dated PO response and consistent scope/domain/contracts, new decision/migration if required. Reviewed 2026-10-25. |

### Q-002 — Will multiple payment methods be supported in the MVP?

| Field | Value |
|-------|-------|
| **Context** | Delivered Sale has no payment-method field; payment capture/provider integration is outside the current model. The first Sales migration already happened. |
| **Required for** | Explicit PO scope confirmation before any payment-field or capture extension; preserve the current contract until that decision. |
| **Who answers** | PO/instructor; SergioAndres17 coordinates, SantiagoPlazas2005 records the gate. |
| **Deadline** | Replanned for Sprint 12 review; before approving payment scope or claiming PO confirmation. |
| **Status** | 🔴 Unanswered — no scope answer is fabricated from implementation/issue closure. Closing proof: linked dated PO response and affected domain/scope/contracts updated through normal review. Reviewed 2026-10-25. |

### Q-003 — What happens if stock reaches zero during checkout, just before confirmation?

| Field | Value |
|-------|-------|
| **Context** | Real reservation rejects insufficient stock atomically; Sales Portal and Infra browser evidence include reserve-stock failure. DOCS-97 maps actual advisory product reads and confirmed rejection/recovery UI; no continuous stock-polling guarantee is delivered by that form. Accepted ADR-015 separates proven rejection from ambiguous outcomes. No UI preview can guarantee stock at confirmation. |
| **Required for** | Confirming the optional live re-check UX and mapping exact delivered rejection/recovery behavior; normal inventory changes do not authorize a fresh sale key. |
| **Who answers** | Sales Portal owner AsolanoT with PO for UX scope/wording; HU-DOCS-97 maps actual flows. |
| **Deadline** | Sprint 12 review; before promising live availability/re-check behavior. |
| **Status** | 🟡 Partially answered — reserve failure behavior/evidence exists; live re-check scope remains unconfirmed. Closing proof: explicit UX/PO disposition with real delivered flow evidence. Reviewed 2026-10-25. |

### Q-004 — Will the `qa` environment actually be provisioned this semester?

| Field | Value |
|-------|-------|
| **Context** | qa branches, environment examples and CI PR/push targets exist. PostgreSQL Infra qa/main remain scaffold; disposable runs do not prove a persistent qa deployment. Project names isolate volumes, while shared platform DNS requires sequential persistent runs on one daemon. |
| **Required for** | Decide whether/where persistent qa will run, access/data policy, named operator and review schedule; distinguish this from branch promotion. |
| **Who answers** | PO/instructor; AsolanoT coordinates environment feasibility, SantiagoPlazas2005 records operations. |
| **Deadline** | Sprint 12 review and before promising a provisioned qa runtime or assigning a rollout date. |
| **Status** | 🔴 Unanswered — no centrally hosted qa server is established. Closing proof: dated decision plus actual provision/operator/evidence if approved, or explicit bounded branch-only scope. Reviewed 2026-10-25. |

### Q-005 — Does `synkro-auth-api` satisfy the course's cross-cutting security service requirement, or is a separate repository needed?

| Field | Value |
|-------|-------|
| **Context** | The project accepted ADR-013 Option A on 2026-10-25: Auth remains the cross-cutting identity/token service and no additional repository is created. This is the internal architecture decision; it does not assert that the instructor confirmed the course classification or naming. |
| **Required for** | External course confirmation only. ADR-013 acceptance is already recorded from the explicit project decision. A later required architecture change must use a new modifying ADR, not edit the Accepted record. |
| **Who answers** | Course instructor; AsolanoT retrieves and records the separate question/response evidence. |
| **Deadline** | Sprint 12 review checkpoint; before claiming external course confirmation or applying an externally required repository change. |
| **Status** | 🟡 Partially answered — project choice accepted; instructor confirmation not recorded. The older #156 closure comment belongs to the earlier Proposed state and is not the new acceptance source. No external approval is fabricated. |

### Q-006 — Do the Users and Service tokens screens need a "list all" endpoint?

| Field | Value |
|-------|-------|
| **Context** | Auth has delivered creation/known-ID lookup; the public contract does not supply list-all user/token endpoints. The prior pre-AUTH-refinement deadline expired. Absence of a review-bot finding is not a PO decision. |
| **Required for** | Decide whether browsable administrative tables are required before extending API/UI scope. No endpoint is invented by documentation reconciliation. |
| **Who answers** | PO/instructor; Auth owner and AsolanoT gather the answer; SantiagoPlazas2005 tracks the checkpoint. |
| **Deadline** | Sprint 12 review; before accepting a list-all scope/API extension. |
| **Status** | 🔴 Unanswered — closing proof: linked dated PO disposition and consistent scope/navigation/contracts. Supporting create/lookup APIs remain bounded; delivered /users and /service-tokens render placeholders, not administration forms. Reviewed 2026-10-25. |

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
