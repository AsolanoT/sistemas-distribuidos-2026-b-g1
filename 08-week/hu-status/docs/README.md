# ADRs — Architecture Decision Records

An ADR records one architectural decision: the problem, the options the team really considered, what tipped the decision, what it costs and what it changes. Each ADR is one file in `records/`.

## How to create an ADR

1. Copy `_template-adr.md` to `records/ADR-NNN-short-title.md`, using the next sequential number.
2. Fill in every section. An ADR needs at least two real options, a dominant criterion and an accepted cost; without the last two it is a statement, not a decision.
3. Open a `docs/` branch and a PR that contains the ADR and its row in the register below. The whole team reviews it.
4. While its status is `Proposed`, the ADR can still be edited.
5. Once `Accepted`, the ADR is never edited. A change is a new ADR that names the sections it replaces in its **Modifies** field, and the register records the link in both directions.

## Statuses

| Status | Meaning |
|--------|---------|
| `Proposed` | Under discussion; it can still be edited |
| `Accepted` | Approved by the team; immutable from this point on |
| `Rejected` | Evaluated and discarded; the ADR keeps the reason |
| `Superseded by ADR-NNN` | Every decision in it has been replaced by a newer ADR |

When a newer ADR replaces only some sections of an older one, the older ADR stays `Accepted`, and the register lists the replaced sections in the **Modified or superseded by** column.

## ADR register

| ID | Title | Status | Date | Modifies | Modified or superseded by |
|----|-------|--------|------|----------|---------------------------|
| [ADR-001](records/ADR-001-architecture.md) | Sales Management System Architecture | Accepted | 2026-08 | — | §7 → ADR-002; §5, §6 → ADR-003 |
| [ADR-002](records/ADR-002-sale-authorship-traceability.md) | Sale Authorship Traceability and `sales_summary` Status | Accepted | 2026-09 | ADR-001 §7 | — |
| [ADR-003](records/ADR-003-gateway-saga-async.md) | API Gateway, Saga Workflow, and Async Messaging Adoption | Accepted | 2026-09 | ADR-001 §5, §6 | — |
| [ADR-004](records/ADR-004-api-contract-extensions.md) | API Contract Extensions — Customer Search, Category Management, and Date-Range Report Filters | Proposed | 2026-09-23 | Extends ADR-001 §8 | — |

Every new ADR adds its own row in the same PR, and updates the **Modified or superseded by** cell of each ADR it modifies.