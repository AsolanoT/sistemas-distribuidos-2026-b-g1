# Traceability Matrix

> Traceability connects every line of code to its business justification.
> It allows answering: "Why does this function exist?" and "Which HU covers this part of the system?"
> It also identifies: unimplemented requirements and code without a requirement (possible technical debt).

---

## How to use this matrix

```
Requirement → HU → Test Case → Implementation → Service

If a requirement has no HU: it is not planned
If a HU has no test case: it has no completeness criterion
If a test case has no implementation: there is test technical debt
If there is code without an HU: possible gold-plating or bug introduced without a story
```

---

## FR → HU → Test → Service matrix

| FR ID | Description | HU(s) | Contract | Tests that verify it | Service (target) | Status |
|-------|-------------|-------|----------|----------------------|------------------|--------|
| FR-001 | Register, update, view, and deactivate customers | HU-ARQ-07 (Corte 1 monolith backend) | `synkro-customers-api.yaml` | — | `synkro-customers-api` | 🟡 Implemented in monolith, no automated tests; no code story refined yet for the real service |
| FR-002 | Register, update, view, and deactivate products | HU-ARQ-07 (Corte 1 monolith); HU-PRO-01, HU-PRO-02, HU-PRO-11, HU-PRO-12 (portal) | `synkro-products-api.yaml` (Products) | `internal/application/usecase/products_test.go`, `internal/adapter/in/httpapi/catalog_test.go` (`synkro-products-api`) | `synkro-products-api` | 🟡 Real service built with TDD (hexagonal, Postgres + Flyway) and routed through the gateway; portal covers list/register/edit/deactivate — categories' visual polish pending in HU-PRO-13 |
| FR-003 | Organize products by category | HU-ARQ-07 (Corte 1 monolith); HU-PRO-02, HU-PRO-12 (category selection and category CRUD in the portal) | `synkro-products-api.yaml` (Categories) | `internal/application/usecase/categories_test.go` | `synkro-products-api` | 🟡 Real service built with TDD; portal's category section (create/rename/deactivate) delivered in HU-PRO-12 |
| FR-004 | Control available stock of each product | HU-ARQ-07 (Corte 1 monolith); HU-PRO-01 (stock shown in the portal), HU-PRO-12 (manual stock adjustment from the portal) | `synkro-products-api.yaml` (Stock Adjustments, Stock Alerts) | `internal/application/usecase/stock_test.go`, `internal/adapter/out/persistence/postgres_stock_concurrency_test.go` | `synkro-products-api` | 🟡 Real service built with TDD, including a concurrency test for stock adjustments; the Stock lookup (`/stock`) and Stock alerts (`/stock-alerts`) screens have no route built yet in the portal |
| FR-005 | Register a sale associating a customer with products | HU-ARQ-07; HU-VEN-01, HU-VEN-02 (portal, on simulated services) | `synkro-workflow.yaml` (POST /sagas/register-sale); `synkro-sales-api.yaml` (POST /sales) | — | `synkro-workflow` → `synkro-sales-api` | 🟡 Implemented in monolith, no automated tests; portal planned in the first code delivery, saga and service (MongoDB, ADR-010) in the next one |
| FR-006 | Automatically calculate the total amount of a sale | HU-ARQ-07; HU-VEN-01 (total shown in the portal) | `synkro-sales-api.yaml` (RegisterSaleRequest) | — | `synkro-sales-api` | 🟡 Implemented in monolith, no automated tests; portal planned in the first code delivery, real service in the next one |
| FR-007 | Automatically deduct stock when a sale is registered | HU-ARQ-07; HU-VEN-01 (rejection for insufficient stock shown in the portal) | `synkro-products-api.yaml` (Stock Reservations) | — | `synkro-workflow` → `synkro-products-api` | 🟡 Implemented in monolith, no automated tests; portal planned in the first code delivery, real service in the next one |
| FR-008 | Generate daily and monthly sales reports | — | `synkro-sales-api.yaml` (/reports/daily, /monthly) | — | `synkro-sales-api` | 🔴 Pending — reporting screens out of Corte 1 scope; no code story refined yet |
| FR-009 | Generate a report of the best-selling products | — | `synkro-sales-api.yaml` (/reports/top-products) | — | `synkro-sales-api` | 🔴 Pending — reporting screens out of Corte 1 scope; no code story refined yet |
| FR-010 | Authenticate users and restrict by role | HU-FE-02 (Corte 1 monolith frontend, simulated); HU-FE-03, HU-FE-04 (session, route guard and role menu with a development token) | `synkro-auth-api.yaml` | — | `synkro-auth-api` | 🟡 Simulated — user picker, no real JWT; development identity planned in the first code delivery, real RS256 issuance in the next one |

**Note on the "Tests" column:** every row is still empty. No code story
is finished except HU-INF-01 (common repository files, done Week 9), which
has no FR of its own — it is scaffolding, not a requirement implementation
(see its row in the inverse traceability table below). From the first
code stories on, each one names the first test to write, and its file is
recorded here when the story closes. The Corte 1 monolith had no
automated tests and is not counted.

**Note on the "Service" column:** the column shows the target service (the microservice that will own this FR per `09-microservices/service-catalog.md`), not the monolith where the Corte 1 implementation currently lives. FR-005 and FR-007 name `synkro-workflow` as the entry point because the sale-registration saga orchestrates the stock reservation and sale registration across domains (ADR-007).

**Note on the "Contract" column:** each FR now traces to the OpenAPI contract file and endpoint tag that implements it (`07-api/contracts/openapi/`). This closes the FR → Contract traceability gap.

---

## NFR → Validation matrix

| NFR ID | Category | Key metric | How it is validated | Tool | Status |
|--------|----------|------------|---------------------|------|--------|
| NFR-001 | Performance | P95 < 300ms for critical endpoints | Load test | k6 (proposed) | 🔴 No load-testing infrastructure |
| NFR-002 | Availability | Health checks per service | `GET /health` | curl / docker | 🔴 Endpoints designed but not built |
| NFR-003 | Scalability | Stateless service instances | Code review | — | 🟡 Design principle adopted, no automated verification |
| NFR-004 | Security | JWT RS256 validated locally + RBAC | Security contract tests | Postman + manual review | 🟡 Controls defined in `security-policy.md`, not automated |
| NFR-005 | Observability | Security events logged | Log review | — | 🔴 Defined in `security-policy.md`, not implemented |
| NFR-006 | Maintainability | One PR per service, no cross-service coupling | PR review | — | 🟡 Principle adopted; HU-INF-01 (Week 9) gives every repository its first green pipeline, a first concrete check toward this NFR |
| NFR-007 | Portability | Reproducible Docker containers, two engines (PostgreSQL + MongoDB, ADR-010) | `docker compose up` | Docker Compose | 🟡 Documented in `deployment.md`, functional locally for the PostgreSQL side; the MongoDB instance waits on `synkro-infra-mongo` |
| NFR-008 | Disaster Recovery | RTO/RPO defined | — | — | 🔴 Aspirational — no production environment |
| NFR-009 | Data Integrity | Zero `DELETE` against business tables; zero document-removal calls in Sales' persistence adapter | Static grep in code | grep / code review | 🟡 Principle adopted (soft delete), manual verification |

---

## ADR-014 design-to-verification traceability

Design documentation was merged through [PR #220](https://github.com/code-corhuila/synkro-docs/pull/220), which closed [HU-ARQ-27 — #219](https://github.com/code-corhuila/synkro-docs/issues/219).
[HU-DOCS-91 — #221](https://github.com/code-corhuila/synkro-docs/issues/221) reconciles the catalog, index and tracking statements; it does not deliver the design alignment a second time.

| Requirement | Decision / design delivery | Design artifact | Planned verification | Implementation status |
|---|---|---|---|---|
| FR-010, NFR-004 | ADR-014 Decision 1; [HU-ARQ-27](https://github.com/code-corhuila/synkro-docs/issues/219); [PR #220](https://github.com/code-corhuila/synkro-docs/pull/220) | Auth contract, authentication strategy, User creation rule | AUTH-REG-01/02/03; AUTH-UI-01 | Design documentation merged; code-story refinement and execution evidence pending |
| NFR-005, NFR-009 | ADR-014 Decision 1; [HU-ARQ-27](https://github.com/code-corhuila/synkro-docs/issues/219); [PR #220](https://github.com/code-corhuila/synkro-docs/pull/220) | user_creation_audit specification, security policy, observability | AUTH-REG-04; AUTH-AUDIT-01 | Design documentation merged; schema/adapters/test execution evidence pending |
| FR-010, NFR-004, NFR-009 | ADR-014 Decision 2; [HU-ARQ-27](https://github.com/code-corhuila/synkro-docs/issues/219); [PR #220](https://github.com/code-corhuila/synkro-docs/pull/220) | initialization runbook, reserved lock key, deployment sequence | AUTH-INIT-01/02/03 | Design documentation merged; CLI and real PostgreSQL test evidence pending |

Test IDs refer to the planned scenarios in `11-quality/testing-strategy.md`, not
existing test files. Link the refined implementation HU, first test file and
actual repository evidence when available; merged design documentation alone
does not close FR/NFR → HU → Test → Code. The completion of HU-DOCS-91 depends on
its documentation DoD and its own merged PR, not on executing these future code tests.

## Frontend session design-to-verification traceability

| Requirements | Documentation HU | Design sources | Planned verification | Implementation evidence |
|---|---|---|---|---|
| FR-010, NFR-004 | [HU-DOCS-92 — #223](https://github.com/code-corhuila/synkro-docs/issues/223) | Browser session, frontend guide, navigation map and wireframes | FE-AUTH-01/02; FE-SESSION-01 through FE-SESSION-07 in `11-quality/testing-strategy.md` | Pending refined code-story links, test files and execution evidence; this documentation change does not close implementation traceability. |

The prior development-token stories remain historical scope; these production scenarios are planned additions, not evidence that their code has been delivered.

## Auth documentation reconciliation and remaining decision gaps

| Requirements | Documentation HU | Design / planned verification | Evidence boundary |
|---|---|---|---|
| FR-010, NFR-004, NFR-009 | [HU-DOCS-93 — #227](https://github.com/code-corhuila/synkro-docs/issues/227) | Auth schema/dictionary/guidelines; AUTH-REFRESH-01/02/03, AUTH-LOGOUT-01/02 and AUTH-SECRETS-01 in `testing-strategy.md` | Planned tests; refined code HU, actual test files and run evidence pending. |
| FR-010, NFR-004 | [HU-DOCS-93 — #227](https://github.com/code-corhuila/synkro-docs/issues/227) | [Renewal proposal](../07-api/authentication.md#renewal-policy-proposal-and-decision-status); FE-SESSION scenarios | Proposed guidance only; no standalone ADR or accepted-policy claim. TD-010 formalization and TD-011 revocation scope remain pending. |

## Inverse traceability: HU → FR

| HU | Title | FR(s) it implements | Sprint/Week |
|----|-------|---------------------|-------------|
| HU-ARQ-07 | Backend: monolithic MVP setup | FR-001 through FR-007 (Corte 1 monolith) | Week 5 |
| HU-FE-02 | Frontend: monolithic MVP setup | FR-010 (simulated) | Week 5 |
| HU-INF-01 | Common files in every code repository | NFR-006 — pipeline green on `develop` in all 17 repositories | Week 9, **Done** |
| HU-INF-02 | Infrastructure skeleton and development identity | NFR-007, NFR-004 — composition valid; bootstrap script runs twice without error | Week 10 |
| HU-INF-03 | Simulated services from the contracts | NFR-007 — smoke script through the gateway, one route per simulated service | Week 10 |
| HU-GTW-01 | Gateway routes and its own behavior | NFR-004, NFR-005 — `tests/smoke.sh` (401, 404, 429, 503, CORS, correlation) | Week 10 |
| HU-FE-03 | Host: single HTTP client, session and development sign-in | FR-010 (development identity), NFR-004, NFR-005 — client tests: 401 closes the session, timeout, error message | Week 10 |
| HU-FE-04 | Host: portal registry, isolation, layout and not found | FR-010, NFR-006 — a remote that fails shows the notice and the layout stays | Week 10 |
| HU-PRO-01 | Products portal: list products | FR-002, FR-004 — four view states; newest request wins | Week 10-11 |
| HU-PRO-02 | Products portal: register a product | FR-002, FR-003 — money from text; idempotency key reused; errors per field | Week 10-11 |
| HU-VEN-01 | Sales portal: register a sale | FR-005, FR-006, FR-007 — rejected registration shows the failed step; no double submit | Week 10-11 |
| HU-VEN-02 | Sales portal: sales history | FR-005 — four view states; access refused to INVENTORY | Week 10-11 |
| HU-AUTH-01 | Base structure of the Auth service | NFR-002, NFR-006 — `/health` without a token; architecture check | Week 10-11 |
| HU-CLI-01 | Base structure of the Customers service | NFR-002, NFR-004, NFR-006 — `/health`; token of another key rejected | Week 10-11 |
| HU-PRO-03 | Base structure of the Products service | NFR-002, NFR-006 — `/health`; 401 with the common envelope | Week 10 |
| HU-VEN-03 | Base structure of the Sales service | NFR-002, NFR-006 — `/health`; 401 with the common envelope; its persistence adapter targets MongoDB (ADR-010) once built | Week 10-11 |
| HU-WKF-01 | Base structure of the workflow | NFR-002, NFR-006 — `/health`; architecture check | Week 10-11 |
| HU-WRK-01 | Base structure of the worker | NFR-005, NFR-006 — run cancelled at its time limit; next run starts | Week 10-11 |
| HU-AUTH-02 | Base structure of the Auth database repository | NFR-007, NFR-004 — rebuild check: migrate, zero changes, roll back, migrate | Week 10-11 |
| HU-CLI-02 | Base structure of the Customers database repository | NFR-007, NFR-004 — rebuild check | Week 10-11 |
| HU-PRO-04 | Base structure of the Products database repository | NFR-007, NFR-004 — rebuild check; privilege check across the three PostgreSQL schemas | Week 10-11 |
| HU-PRO-11 | Products portal: base structure (Module Federation remote, shared HTTP client, registration in `synkro-front`, CI, failure-isolation test) | — (scaffolding, no FR of its own) — a remote that fails shows the notice, the layout stays | Week 10 |
| HU-PRO-12 | Products portal: edit, adjust stock and deactivate products; categories section (create, rename, deactivate) | FR-002, FR-003, FR-004 | Week 10 |

**Note:** documentation stories (HU-PDR-*, HU-ADR-*, HU-DOCS-*, HU-ARQ-*)
do not implement requirements in code and are not listed here. Code
stories use the `AUTH`, `CLI`, `PRO`, `VEN`, `FE`, `INF`, `GTW`, `WKF`
and `WRK` prefixes defined in `00-governance/agile-conventions.md`,
"Story identifiers".

---

## Status legend

| Status | Meaning |
|--------|---------|
| ✅ Done | Implemented with TDD, reviewed, and in the corresponding branch |
| 🟡 In progress | Partially implemented or without automated tests |
| 🔴 Pending | In the backlog, not started |
| ⏸ Blocked | Has an external blocker |
| ❌ Cancelled | Removed from scope |

---

## Identified gaps (requirements without coverage)

> Updated in Week 9 as part of HU-DOCS-87.

| Gap type | Description | Required action | Owner | When |
|----------|-------------|----------------|-------|------|
| FR without tests | All 10 FRs still lack automated tests — Corte 1 was a monolith without TDD, and no Cut 6 code story has closed yet except HU-INF-01, which has no FR of its own | Each code story writes its test first; the file is recorded here when the story closes | Whole team | From Week 10 |
| FR without code HU | FR-001, FR-008 and FR-009 have no refined code story | Refine the planned `CLI` and `VEN` stories listed in `user-stories.md`, "Next cut" | Product Owner | Planning of the next cut |
| FR-010 partial | Cut 6 delivers session and route guard with a development token; no real login yet | Refine the planned `AUTH` story for RS256 issuance | Whole team | Planning of the next cut |
| Portals on simulated services | The Sales portal (HU-VEN-01, HU-VEN-02) is still verified against the contracts, not against a real service; Products is no longer affected — its real service and portal closed in HU-PRO-11, HU-PRO-12, HU-PRO-13 | Replace the Sales simulated service once `synkro-sales-api`'s MongoDB adapter is integrated against `synkro-infra-mongo` (ADR-010) | Whole team | Next cut |
| Sales' real database untested | `synkro-sales-db` and `synkro-sales-api`'s MongoDB adapter still have no integration tests — `synkro-infra-mongo` now exists (ADR-010), so this is ready to build, not blocked | Build the MongoDB adapter and its integration tests against `synkro-infra-mongo` | Whole team | Next cut |
| Angular portal routing unverified | ADR-011's internal-routing risk has not been closed by any story yet | Verify as acceptance criteria on the first story that builds `synkro-customers-portal`'s routed screens | Whole team | Next cut |
| Users / Service tokens screens have no list endpoint | `synkro-auth-api.yaml` has no "list users" or "list service tokens" endpoint — only creation and lookup by ID (`12-ux-ui/navigation-map.md`, HU-DOCS-86) | Decide whether a list endpoint is needed; if so, add it to `synkro-auth-api.yaml` through a new ADR-004-style extension | Product Owner | Pending prioritization |
| NFR without validation | 7 of 9 NFRs still have no automated validation | Cut 6 adds the first automated checks for NFR-002, NFR-004, NFR-005, NFR-006 and NFR-007 through its stories; update the NFR matrix as each one closes | Whole team | From Week 10 |
| Test coverage | ~~The minimum coverage threshold required by the DoD has not been set~~ — **Resolved**: ≥ 90/80/60/80% set in `testing-strategy.md` for the backend, ≥ 85/70/70% for the frontend, and referenced from the DoD | — | — | Closed |

---

## HU-02 (Discovery) → Repository Traceability

> This section responds to the professor's HU-02 ("Project Discovery"). It
> is not a new feature or a new file per task — it is the evidence that
> each of its 10 tasks is already resolved in the repo, so nothing gets
> duplicated across folders.

| HU-02 Block | Task | Where it's resolved | Status |
|---|---|---|---|
| Context Analysis | Describe the problem | `03-product/problem-framing.md`, §1 | ✅ Done |
| Context Analysis | Target users (persona) | `03-product/problem-framing.md`, §2 + `01-context/overview.md`, "Main Users" | ✅ Done |
| Context Analysis | Market research | `03-product/problem-framing.md`, §9 (Alegra, Loyverse) | ✅ Done |
| MVP Definition | Candidate features | `01-context/scope.md`, "MVP Scope" | ✅ Done |
| MVP Definition | Corte 1 scope (what's in) | `01-context/scope.md`, "MVP Scope" | ✅ Done |
| MVP Definition | What's out of scope | `01-context/scope.md`, "Explicitly Out of Scope" + `problem-framing.md`, §8 | ✅ Done |
| Initial Design | Wireframes/mockups | `12-ux-ui/wireframes.md` | ✅ Done |
| Initial Design | Initial data model | `02-domain/domain-map.md` + `entities-and-rules.md` | ✅ Done |
| Initial Design | Main user flows | `12-ux-ui/navigation-map.md`, "Main user flows" (Flow 1-5) | ✅ Done |
| Documentation | Consolidate everything in `docs` | This same table — each piece lives in its correct folder per that folder's own README | ✅ Done |

**Why this table lives here and not elsewhere:** `traceability-matrix.md`
is exactly the file the professor's own framework defines to connect an
external requirement to where its evidence lives in the repo — it is the
correct place, rather than creating a new document just for this.

---

## How to maintain this matrix

1. When an HU is created: add the row in the FR → HU → Test → Service section
2. When a test is written: note the file in the "Tests that verify it" column
3. When an HU is completed: change the status to ✅
4. At each Sprint Planning: review gaps and assign actions

---

## Correlations

- User Stories → `04-requirements/user-stories.md`
- Non-Functional Requirements → `04-requirements/non-functional.md`
- Functional Requirements → `04-requirements/functional.md`
- Testing strategy → `11-quality/testing-strategy.md`
- DoD that determines when an HU is Done → `00-governance/definition-of-done.md`
- The professor's original user story → HU-02, delivered in the Weekly
- Detail of each HU-02 piece → `03-product/problem-framing.md`, `01-context/scope.md`, `02-domain/`, `12-ux-ui/`
