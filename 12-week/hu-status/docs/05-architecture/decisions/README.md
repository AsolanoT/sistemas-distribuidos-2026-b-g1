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

## Decisions accepted in HU-ARQ-28

ADR-013 Option A, ADR-015 Option B, ADR-016 Option B and ADR-017 Option A were explicitly accepted by the project decision communicated on 2026-10-25. The [acceptance entry](../../15-project-control/documentation-verification.md#hu-arq-28-acceptance-entry--2026-10-25) records its source and limits. Named reviewers are not claimed to have approved a GitHub PR; required PR/main review, checks and publication remain separate.

ADR-013 accepts the existing Auth arrangement without another security repository. The former Proposed record's wait is separated into the external course-confirmation question Q-005; no instructor answer or exception approval is invented. A later externally required architecture change needs a new ADR.

ADR-015 modifies the exact ADR-007 clauses named in the register, while ADR-007 itself stays unchanged. Accepted targets that differ from delivered code remain implementation gaps, notably TD-014 namespace rollout and TD-016 retry/jitter correction. ADR-016/017 resolve the policy questions TD-010/011. The unpublished infrastructure alternative remains unadopted; local evidence does not waive required CI/private integration.

## ADR register

| ID | Title | Status | Date | Modifies | Modified or superseded by | Builds on / Context |
|----|-------|--------|------|----------|---------------------------|---------------------|
| [ADR-001](records/ADR-001-architecture.md) | Sales Management System Architecture | Accepted | 2026-08 | — | §1 → ADR-008 → ADR-011; §2 → ADR-005 → ADR-009 → ADR-010 (Sales); §5 → ADR-003; §6 → ADR-003; §7 → ADR-002, ADR-005 → ADR-010 (Sales); §8 → ADR-004; registration visibility → ADR-014 | — |
| [ADR-002](records/ADR-002-sale-authorship-traceability.md) | Sale Authorship Traceability and `sales_summary` Status | Accepted | 2026-09 | ADR-001 §7 | Source of `created_by` → ADR-006; "Resolution of `sales_summary`" → ADR-005 | — |
| [ADR-003](records/ADR-003-gateway-saga-async.md) | API Gateway, Saga Workflow, and Async Messaging Adoption | Accepted | 2026-09 | ADR-001 §5, §6 | Decision 1 (gateway scope), Decision 2 → ADR-006; Decision 1 (routing…), Decisions 3, 4, 5 → ADR-007 | — |
| [ADR-004](records/ADR-004-api-contract-extensions.md) | API Contract Extensions | Accepted | 2026-09-28 | ADR-001 §8: catalog → extended; stock `PATCH` → replaced | — | ADR-006, ADR-007, ADR-008 |
| [ADR-005](records/ADR-005-data-isolation-per-domain.md) | Data Isolation and Data Model per Domain | Accepted | 2026-09-26 | ADR-001 §2, §7; ADR-002 "Resolution of `sales_summary`" | Decision 1 → ADR-009; Decisions 2, 3 and 4 (Sales only) → ADR-010; Decision 2 (extended: per-domain history table, rebuild check) → ADR-012 | — |
| [ADR-006](records/ADR-006-token-validation-per-service.md) | Token Validation in Every Service and Service Credentials | Accepted | 2026-09-27 | ADR-003 Decisions 1 and 2; ADR-002 (source of `created_by`) | — | ADR-013 (Option A accepted as project architecture; external course confirmation remains Q-005); ADR-017 (accepted token-class clarification; validation unchanged) |
| [ADR-007](records/ADR-007-persistent-saga-and-scheduled-work.md) | Persistent Saga Execution and Scheduled Work | Accepted | 2026-09-27 | ADR-003 Decisions 1, 3, 4 and 5 | Decision 1 (own instance) → ADR-009; Decisions 1 (startup scan), 2 (POST replay/retry/compensation), 4 (unresolved failure interpretation) → ADR-015 (Accepted 2026-10-25) | — |
| [ADR-008](records/ADR-008-cross-cutting-stack.md) | Technology Stack of the Cross-Cutting Repositories | Accepted | 2026-09-27 | None | Version table, "Databases and migrations" row → ADR-010; Decision 4 (every portal in React) and "Frontend" version row → ADR-011 | ADR-001 (versions), ADR-003 (stack gap) |
| [ADR-009](records/ADR-009-shared-instance-schema-per-domain.md) | Shared Instance with Schema-per-Domain Isolation | Accepted | 2026-09-28 | ADR-005 Decision 1; ADR-007 Decision 1 (own instance) | `sales_schema` (Sales leaves the shared instance) → ADR-010; repository name `synkro-infra` → `synkro-infra-postgres` (ADR-010); init script and connection credentials → ADR-012 | ADR-005 (reassessed trade-off), ADR-007 (workflow store) |
| [ADR-010](records/ADR-010-sales-on-mongodb.md) | Sales Domain on MongoDB | Accepted | 2026-10-03 | ADR-005 Decisions 2, 3 and 4 (Sales only); ADR-009 (`sales_schema`; repository name `synkro-infra`); ADR-008 version table ("Databases and migrations") | — | ADR-002 (live report aggregation, unchanged), ADR-007 (saga and frozen prices) |
| [ADR-011](records/ADR-011-angular-customers-portal.md) | Angular Customers Portal in the React Host | Accepted | 2026-10-03 | ADR-008 Decision 4 (every portal in React as a Module Federation remote) and its "Frontend" version row; ADR-001 §1 (single frontend framework) | — | ADR-006 (session and token validation) |
| [ADR-012](records/ADR-012-instance-bootstrap-and-environments.md) | Instance Bootstrap, Service Users and Environment Files | Accepted | 2026-10-03 | ADR-009 (init script that creates schemas and roles; per-domain connection credentials); ADR-005 Decision 2 (extended: migration history per domain, rebuild check) | — | ADR-010 (Sales leaves the shared instance; repository renamed to `synkro-infra-postgres`), ADR-007 (`workflow_schema`) |
| [ADR-013](records/ADR-013-identity-as-cross-cutting-security.md) | Identity Service as the Cross-Cutting Security Service | Accepted | 2026-10-25 | — | — | ADR-006 (private key holder, token validation in every service), ADR-001 (identity and roles) |
| [ADR-014](records/ADR-014-admin-only-registration-and-initial-administrator.md) | Admin-Only User Registration and Initial Administrator Creation | Accepted | 2026-10-10 | ADR-001 §8 (registration visibility only) | — | ADR-004, ADR-006, ADR-009, ADR-012 |
| [ADR-015](records/ADR-015-sale-saga-execution-safety.md) | Sale Saga Execution Safety | Accepted | 2026-10-25 | ADR-007 Decision 2 replay/retry/business-4xx compensation; Decision 1 startup scan; Decision 4 unresolved interpretation | — | ADR-006/009/014; TD-013/014/016 |
| [ADR-016](records/ADR-016-host-session-renewal-and-operation-recovery.md) | Host Session Renewal and Operation Recovery | Accepted | 2026-10-25 | None | — | ADR-008 Decision 4; ADR-011; TD-010 |
| [ADR-017](records/ADR-017-refresh-reuse-and-jwt-revocation-boundaries.md) | Refresh Reuse and JWT Revocation Boundaries | Accepted | 2026-10-25 | None | — | ADR-006 Decisions 1/2 unchanged; TD-011 |

**Dates:** Date is the acceptance date: 2026-10-25 for ADR-013/015/016/017. ADR-015/016/017 separately retain Proposal date = 2026-10-24. Publication/review dates must be recorded from their actual PR evidence.

**Numbering:** ADR-015–017 are the records accepted under HU-ARQ-28; the next new record after incorporating this package is ADR-018. ADR numbering does not consume a HU-ARQ identifier. The reciprocal ADR-015 links identify its accepted modification; predecessor file contents remain immutable.

Every new ADR adds its own row in the same PR, and updates the **Modified or superseded by** cell of each ADR it modifies.
