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
| [ADR-001](records/ADR-001-architecture.md) | Sales Management System Architecture | Accepted | 2026-08 | — | §2 → ADR-005; §5 → ADR-003; §6 → ADR-003; §7 → ADR-002, ADR-005 |
| [ADR-002](records/ADR-002-sale-authorship-traceability.md) | Sale Authorship Traceability and `sales_summary` Status | Accepted | 2026-09 | ADR-001 §7 | Source of `created_by` → ADR-006; "Resolution of `sales_summary`" → ADR-005 |
| [ADR-003](records/ADR-003-gateway-saga-async.md) | API Gateway, Saga Workflow, and Async Messaging Adoption | Accepted | 2026-09 | ADR-001 §5, §6 | Decision 1 (gateway scope), Decision 2 → ADR-006; Decision 1 (routing of `POST /api/sales`), Decisions 3, 4, 5 → ADR-007 |
| [ADR-004](records/ADR-004-api-contract-extensions.md) | API Contract Extensions — Customer Search, Category Management, and Date-Range Report Filters | Proposed | 2026-09-23 | Extends ADR-001 §8 | — |
| [ADR-005](records/ADR-005-data-isolation-per-domain.md) | Data Isolation and Data Model per Domain | Accepted | 2026-09-26 | ADR-001 §2, §7; ADR-002 "Resolution of `sales_summary`" | — |
| [ADR-006](records/ADR-006-token-validation-per-service.md) | Token Validation in Every Service and Service Credentials | Accepted | 2026-09-27 | ADR-003 Decisions 1 and 2; ADR-002 (source of `created_by`) | — |
| [ADR-007](records/ADR-007-persistent-saga-and-scheduled-work.md) | Persistent Saga Execution and Scheduled Work | Accepted | 2026-09-27 | ADR-003 Decisions 1, 3, 4 and 5 | — |
| [ADR-008](records/ADR-008-cross-cutting-stack.md) | Technology Stack of the Cross-Cutting Repositories | Accepted | 2026-09-27 | None (fills the stack left open by ADR-003; pins ADR-001's versions) | — |

Every new ADR adds its own row in the same PR, and updates the **Modified or superseded by** cell of each ADR it modifies.
