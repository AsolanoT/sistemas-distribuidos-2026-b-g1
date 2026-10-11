# User Stories — Backlog

> **What to fill in here:** The product's User Story backlog.
> Each HU uses the standard format with Acceptance Criteria in Given/When/Then.
> Refined (Ready) HUs go to the sprint. Unrefined ones are epics or ideas.

---

## Backlog status

| Cut | Sprint | Total HUs | Refined | In progress | Completed |
|-----|--------|-----------|---------|-------------|-----------|
| Cut 1 | Sprint 1-3 (docs discovery) | 22 | 22 | 0 | 22 |
| Cut 2 | Sprint 4 (catalog + product def. + panoramic MVP) | 5 | 5 | 0 | 5 |
| Cut 3 | Sprint 5-7 (architecture decisions, domain events, UML, review corrections) | 15 | 15 | 0 | 15 |
| Cut 4 | Sprint 8-9 (DB topology correction, API contracts rewrite, governance alignment, pre-code readiness) | 52 | 52 | 0 | 52 |
| Cut 5 | Sprint 9-10 (two database engines, Angular Customers portal — ADR-010 to ADR-012 and downstream documents) | 13 | 13 | 1 | 12 |
| Cut 6 | Sprint 10-11 (first code delivery: host, gateway, two portals on simulated services, base structure of services and databases) | 19 | 19 | 18 | 1 |

> *In progress* counts every open HU, started or not. Cut 4 total = HU-08 continued (2) + HU-09 (7) + HU-10 (15) + HU-11 (9) + HU-12 (10) + HU-13 (9) = 52. Cut 5 total = HU-ARQ-23 to 26 (4) + HU-DOCS-80 to 88 (9) = 13 — 12 Done (HU-ARQ-23 to 26, HU-DOCS-80 to 87), 1 In progress per the table's broad definition (HU-DOCS-88, not yet started). HU-ARQ-26 counts as Done: the story itself — recording ADR-013 and asking the instructor — is complete; ADR-013 staying `Proposed` pending that answer is a separate fact from the story's own completion (see the HU-14 table above). Cut 6 total = the 19 code stories of the first delivery (`HU-INF-01` through `HU-PRO-04`, listed below).
>
> Cuts group HUs by theme, and the velocity table of `00-governance/agile-conventions.md` counts them by calendar week, so the two do not add up row by row. Live status for any HU not yet reconciled here is on the [GitHub Projects board](https://github.com/orgs/code-corhuila/projects/24) — a cell in this table should say "per board" only together with this link, never alone. They reconcile: Cut 4 (52) = Sprint 8 (26) − 2 HUs that stay in Cut 3 (HU-DOCS-32, HU-ARQ-16) + Sprint 9 (19 done + 9 of HU-13, status per board). Cut 1 and the early sprints (0 to 6) are not reconciled here. Cut 5 and Cut 6 are both counted within Sprint 9-11 of the velocity table, not as separate sprint rows of their own.

---

## Cut 3 — Documentation Track (Weeks 5-7)

> These HUs follow the documentation formalization workflow, not the
> code sprint format below. Each one already has its full specification
> (User Story + Gherkin Acceptance Criteria + DoD) written directly in
> its GitHub Issue — repeating it here would duplicate content, which
> this file's own Definition of Done prohibits. This table exists only
> to satisfy that same rule's requirement to mark each HU complete here.

| HU ID | Title | Epic | Status | Resolved in |
|---|---|---|---|---|
| HU-ARQ-09 | Publish ADR-001 | HU-04 | Done | `ADR-001-architecture.md` |
| HU-ARQ-12 | Deployment + threat model | HU-04 | Done | `deployment.md`, `security-threat-model.md` |
| HU-ARQ-13 | ADR-002 — sale authorship | HU-04 | Done | `ADR-002-sale-authorship-traceability.md` |
| HU-DOCS-25/26 | Unify FR/NFR, disconnect PDR | HU-05 (#5) | Done | 13 files, incl. `navigation-map.md` |
| HU-DOCS-27 | Rebuild traceability matrix | HU-05 (#5) | Done | `traceability-matrix.md` |
| HU-DOCS-28 | Align git-conventions.md | #15 | Done | `git-conventions.md`, `documentation-rules.md` |
| HU-ARQ-14 | ADR-003 + downstream | HU-06 (#19) | Done | `ADR-003-gateway-saga-async.md` + 5 files |
| HU-ARQ-15 | Hexagonal architecture guide | HU-06 (#19) | Done | `hexagonal-architecture.md` |
| HU-DOCS-29 | Fill domain-events.md | HU-07 (#22) | Done | `domain-events.md` |
| HU-DOCS-30 | Add BPMN/C4 diagrams | HU-07 (#22) | Done | `diagram-index.md` + 10 files |
| HU-DOCS-31 | Cite PR #17 in NFR record | HU-08 (#31) | Done | `non-functional.md` |
| HU-DOCS-33 | C4 sync cross-reference | HU-08 (#31) | Done | `overview.md` |
| HU-DOCS-32 | Governance corrections | HU-08 (#31) | Done | `definition-of-done.md`, `definition-of-ready.md`, `user-stories.md` (Cut 3 section) |
| HU-ARQ-16 | Java appendix + `_stacks/` refs | HU-08 (#31) | Done | `hexagonal-architecture.md` (Java code moved to appendix, Go-only main body) |

> HU-DOCS-32 and HU-ARQ-16 belong to HU-08 (#31) and stay in this table with their epic; they were executed in week 8.
> HU-DOCS-25 and HU-DOCS-26 share one row, so this table has 14 rows for 15 HUs: 3 (weeks 5-6) + 10 (week 7) + 2 (week 8).

---

## Cut 4 — Documentation Track (Weeks 8-9)

> Weeks 8-9 continued the architecture decision formalization (HU-10)
> and completed the first-pass API contracts (HU-09). Week 9
> corrected the database topology after the professor clarified that
> the model is one instance per environment with schemas per domain
> (ADR-009 supersedes ADR-005 Decision 1), rewrote the Products, Sales
> and Workflow contracts from scratch (HU-11) and aligned the
> governance, context, requirements and architecture documents
> (HU-12). HU-DOCS-55 and HU-DOCS-56 were repurposed from API
> contracts to DB topology corrections; their original scope, plus the
> follow-ups found while closing HU-11 and HU-12, is scheduled in HU-13.

### HU-08 — Address Professor Review Feedback (continued)

| HU ID | Title | Status | Resolved in |
|---|---|---|---|
| HU-DOCS-34 | Update stale status references in context and vision | Done | `01-context/overview.md`, `03-product/vision.md` |
| HU-DOCS-41 | Fix pre-ADR-003 JWT and CORS model in security-policy and cross-cutting | Done | `security-policy.md`, `cross-cutting.md` |

### HU-09 — API Contracts (first pass, pre-ADR-004)

| HU ID | Title | Status | Resolved in |
|---|---|---|---|
| HU-DOCS-35 | REST guidelines and authentication strategy | Done | `07-api/guidelines.md`, `07-api/authentication.md` |
| HU-DOCS-36 | Shared components and auth contract | Done | `07-api/contracts/openapi/_shared.yaml`, `synkro-auth-api.yaml` |
| HU-DOCS-37 | Customers contract | Done | `synkro-customers-api.yaml` |
| HU-DOCS-38 | Products contract (first pass) | Done | `synkro-products-api.yaml` (superseded by HU-DOCS-57) |
| HU-DOCS-39 | Sales contract (first pass) | Done | `synkro-sales-api.yaml` (superseded by HU-DOCS-59) |
| HU-DOCS-40 | Workflow contract (first pass) | Done | `synkro-workflow.yaml` (superseded by HU-DOCS-60) |
| HU-DOCS-42 | ADR-004 — API contract extensions (proposed) | Done | `ADR-004-api-contract-extensions.md` (accepted in HU-DOCS-54) |

### HU-10 — Architecture Decisions

| HU ID | Title | Status | Resolved in |
|---|---|---|---|
| HU-ARQ-17 | Add dominant criterion and accepted cost to ADR template | Done | `_template-adr.md`, `decisions/README.md` |
| HU-ARQ-18 | ADR-005 — data isolation and data model per domain | Done | `ADR-005-data-isolation-per-domain.md` (Decision 1 superseded by ADR-009) |
| HU-ARQ-19 | ADR-006 — token validation in every service | Done | `ADR-006-token-validation-per-service.md` |
| HU-ARQ-20 | ADR-007 — persistent saga execution and scheduled work | Done | `ADR-007-persistent-saga-and-scheduled-work.md` |
| HU-ARQ-21 | ADR-008 — cross-cutting repository stack | Done | `ADR-008-cross-cutting-stack.md` |
| HU-DOCS-43 | Update domain model, events and glossary | Done | `entities-and-rules.md`, `domain-events.md`, `glossary.md` |
| HU-DOCS-44 | Rewrite deployment: composition, DB and migrations | Done | `deployment.md` (superseded by HU-DOCS-55 for DB topology) |
| HU-DOCS-45 | Rewrite deployment: configuration, dev identity, observability | Done | `deployment.md` §6-§8 |
| HU-DOCS-46 | Rewrite auth and customers data models | Done | `models.md` (auth, customers sections) |
| HU-DOCS-47 | Rewrite products, sales and saga store data models | Done | `models.md` (products, sales, workflow sections) |
| HU-DOCS-48 | Align security policy and authentication strategy | Done | `security-policy.md`, `authentication.md` |
| HU-DOCS-49 | Update security threat model | Done | `security-threat-model.md` (superseded by HU-DOCS-56 for DB topology) |
| HU-DOCS-50 | Realign cross-cutting concerns | Done | `cross-cutting.md` (superseded by HU-DOCS-56 for DB topology) |
| HU-DOCS-51 | Update architecture overview and pattern guide | Done | `overview.md`, `pattern-guide.md` (superseded by HU-DOCS-65 for DB topology) |
| HU-DOCS-52 | Update C4 container and sale registration diagrams | Done | `c4-02-containers.drawio`, `bpmn-sales-registration.drawio` |

### HU-11 — API Contracts and DB Topology Correction

| HU ID | Title | Status | Resolved in |
|---|---|---|---|
| HU-DOCS-53 | Define common REST contract, guidelines and `_shared.yaml` | Done | `07-api/guidelines.md`, `_shared.yaml` |
| HU-DOCS-54 | Extend and accept ADR-004 with the full endpoint register | Done | `ADR-004-api-contract-extensions.md` (accepted) |
| HU-ARQ-22 | ADR-009 — shared instance with schema-per-domain isolation | Done | `ADR-009-shared-instance-schema-per-domain.md`, `decisions/README.md` |
| HU-DOCS-55 | Correct deployment and data models for shared-instance topology | Done | `deployment.md` §1-§9, `models.md` header + P1 + domain headers. **Repurposed** from auth API contract; original scope deferred to HU-DOCS-72 |
| HU-DOCS-56 | Correct security and cross-cutting docs for shared-instance topology | Done | `security-threat-model.md`, `security-policy.md`, `cross-cutting.md`. **Repurposed** from customers API contract; original scope deferred to HU-DOCS-73 |
| HU-DOCS-57 | Align Products API contract — catalog, categories and stock adjustments | Done | `synkro-products-api.yaml` (full rewrite) |
| HU-DOCS-58 | Add Products API contract — stock reservations and stock alerts | Done | `synkro-products-api.yaml` (reservation and alert endpoints added) |
| HU-DOCS-59 | Align Sales API contract | Done | `synkro-sales-api.yaml` (full rewrite) |
| HU-DOCS-60 | Align Workflow and saga contract | Done | `synkro-workflow.yaml` (full rewrite) |

### HU-12 — Governance and Documentation

| HU ID | Title | Status | Resolved in |
|---|---|---|---|
| HU-DOCS-61 | Adopt component naming convention and rename contract files | Done | `documentation-rules.md`, contract file renames |
| HU-DOCS-62 | Amend DoD and branch conventions | Done | `definition-of-done.md`, `git-conventions.md`, `documentation-rules.md` |
| HU-DOCS-63 | Reconcile backlog by semester cut | Done | `user-stories.md` (this section), `agile-conventions.md` |
| HU-DOCS-64 | Fill risk register and tech backlog | Done | `risks.md`, `technical-backlog.md` |
| HU-DOCS-65 | Align context and product documents + correct overview DB topology | Done | `overview.md` (P2, AT-002, §4, C4 Mermaid), `01-context/overview.md` |
| HU-DOCS-66 | Align requirements and contract traceability + correct NFR-007 | Done | `non-functional.md`, `functional.md`, `traceability-matrix.md` |
| HU-DOCS-67 | Define testing strategy for Java and Go | Done | `testing-strategy.md` |
| HU-DOCS-68 | Align hexagonal architecture guide with service layout | Done | `hexagonal-architecture.md` |
| HU-DOCS-69 | Align diagram index and UX flows + correct C4 for shared instance | Done | `diagram-index.md`, `navigation-map.md`, `c4-02-containers.drawio` |
| HU-DOCS-70 | Rewrite service catalog + correct database column | Done | `service-catalog.md` |

### HU-13 — Contract completion and documentation readiness for the code phase

| HU ID | Title | Status | Resolved in |
|---|---|---|---|
| HU-DOCS-71 | Rename DDL schema prefixes to `<domain>_schema` in `models.md` | Done | — |
| HU-DOCS-72 | Rewrite the Auth API contract and align `authentication.md` | Done | — |
| HU-DOCS-73 | Rewrite the Customers API contract | Done | — |
| HU-DOCS-74 | Align the Go and Java stack guides with the project decisions | Done | `_stacks/go.md`, `_stacks/java-spring.md` |
| HU-DOCS-75 | Align `domain-map.md` with the saga and the workflow | Done | `02-domain/domain-map.md` |
| HU-DOCS-76 | Sweep stale references in context and governance documents | Done | — |
| HU-DOCS-77 | Close Cut 4 in the backlog and fix pending references | Done | — |
| HU-DOCS-78 | Complete the ⭐ documents of `09-microservices/` and `15-project-control/` | Done | — |
| HU-DOCS-79 | Adapt contributing, onboarding, TDD and `10-devops/` documents | Done | — |

HU-DOCS-71 to HU-DOCS-73 were deferred from HU-DOCS-55 and HU-DOCS-56 (HU-DOCS-71 was identified while closing HU-DOCS-55); they are scheduled here.

### HU-14 — Two database engines, mixed-framework frontend and code-phase backlog

| HU ID | Title | Status | Resolved in |
|---|---|---|---|
| HU-ARQ-23 | ADR-010 — Sales domain on MongoDB and the MongoDB infrastructure repository | Done | `ADR-010-sales-on-mongodb.md` |
| HU-ARQ-24 | Spike and ADR-011 — Angular customers portal inside the React host | Done | `ADR-011-angular-customers-portal.md` |
| HU-ARQ-25 | ADR-012 — instance bootstrap, service users and environment files | Done | `ADR-012-instance-bootstrap-and-environments.md` |
| HU-ARQ-26 | ADR-013 — the identity service as the cross-cutting security service | Done — the story itself (record ADR-013, ask the instructor) is complete. ADR-013's own status stays `Proposed`, pending the instructor's answer, which does not keep this story open | `ADR-013-identity-as-cross-cutting-security.md` |
| HU-DOCS-80 | Rewrite the Sales data model as documents | Done | `06-data/models.md`, `data-dictionary.md`, `02-domain/entities-and-rules.md`, `09-microservices/data-ownership-matrix.md`, `01-context/glossary.md`, `synkro-sales-api.yaml`, `synkro-workflow.yaml` |
| HU-DOCS-81 | Update deployment for two engines and per-environment files | Done | `05-architecture/deployment.md`, `cross-cutting.md`, `10-devops/` |
| HU-DOCS-82 | Align overview, context, service catalog and C4 | Done | `05-architecture/overview.md`, `01-context/overview.md`, `01-context/scope.md`, `09-microservices/service-catalog.md`, `dependency-map.md`, `_stacks/README.md`, `_stacks/go.md`, `08-uml/diagram-index.md`, `c4-02-containers.drawio` |
| HU-DOCS-83 | Align security documents and non-functional requirements | Done | `00-governance/security-policy.md`, `security-rules.md`, `05-architecture/security-threat-model.md`, `04-requirements/non-functional.md` |
| HU-DOCS-84 | Extend the testing strategy for frontend, MongoDB and mocks | Done | `11-quality/testing-strategy.md`, `tdd-guide.md` |
| HU-DOCS-85 | Add the frontend stack guide and shared design tokens | Done | `_stacks/frontend.md` (new), `12-ux-ui/design-system.md` |
| HU-DOCS-86 | Assign screens to portals and define view states | Done | `12-ux-ui/navigation-map.md`, `wireframes.md` |
| HU-DOCS-87 | Add the code-phase backlog, story prefixes and traceability | Done | `agile-conventions.md`, `user-stories.md`, `traceability-matrix.md` |
| HU-DOCS-88 | Update open questions, risks, dependencies and technical backlog | Not started | — |

---

## Cut 5 — Two Database Engines and the Angular Customers Portal (Weeks 9-10)

> See the HU-14 table above for the 13 stories and their current status.
> This cut corrects the single-PostgreSQL-instance model to two engines
> (ADR-010) and introduces the Angular Customers portal (ADR-011), both
> required by the course architecture; ADR-012 and ADR-013 are the
> operational decisions that correction needed.

---

## Cut 6 — First Code Delivery (Weeks 10-11)

> Code stories. Each one has its full specification (story, acceptance
> criteria with at least one error scenario, technical notes, first test to
> write, dependencies and points) in its GitHub Issue; this table marks its
> status. Every code pull request references its story as
> `code-corhuila/synkro-docs#<issue>`. The test is written before the code
> it verifies (`11-quality/tdd-guide.md`).
>
> Goal: the host and two portals working through the gateway against
> services simulated from the contracts, and every service and PostgreSQL
> database repository with its base structure and a green pipeline.

| HU ID | Title | Repository | Points | Priority | Status |
|---|---|---|---|---|---|
| HU-INF-01 | Common files in every code repository | all code repositories | 3 | Must | **Done** |
| HU-INF-02 | Infrastructure skeleton and development identity | `synkro-infra-postgres` | 5 | Must | Not started |
| HU-INF-03 | Simulated services from the contracts | `synkro-infra-postgres` | 3 | Must | Not started |
| HU-GTW-01 | Gateway routes and its own behavior | `synkro-api-gateway` | 3 | Must | Not started |
| HU-FE-03 | Host: single HTTP client, session and development sign-in | `synkro-front` | 5 | Must | Not started |
| HU-FE-04 | Host: portal registry, isolation, layout and not found | `synkro-front` | 3 | Must | Not started |
| HU-PRO-01 | Products portal: list products | `synkro-products-portal` | 3 | Must | Not started |
| HU-PRO-02 | Products portal: register a product | `synkro-products-portal` | 3 | Must | Not started |
| HU-VEN-01 | Sales portal: register a sale | `synkro-sales-portal` | 5 | Must | Not started |
| HU-VEN-02 | Sales portal: sales history | `synkro-sales-portal` | 3 | Could | Not started |
| HU-AUTH-01 | Base structure of the Auth service | `synkro-auth-api` | 3 | Should | Not started |
| HU-CLI-01 | Base structure of the Customers service | `synkro-customers-api` | 3 | Should | Not started |
| HU-PRO-03 | Base structure of the Products service | `synkro-products-api` | 2 | Should | Not started |
| HU-VEN-03 | Base structure of the Sales service | `synkro-sales-api` | 2 | Should | Not started |
| HU-WKF-01 | Base structure of the workflow | `synkro-workflow` | 3 | Should | Not started |
| HU-WRK-01 | Base structure of the worker | `synkro-worker` | 2 | Should | Not started |
| HU-AUTH-02 | Base structure of the Auth database repository | `synkro-auth-db` | 2 | Should | Not started |
| HU-CLI-02 | Base structure of the Customers database repository | `synkro-customers-db` | 2 | Should | Not started |
| HU-PRO-04 | Base structure of the Products database repository | `synkro-products-db` | 2 | Should | Not started |

Total: 57 points (Must 33, Should 21, Could 3). 3 points (HU-INF-01) done.

**Not in this cut, and why:**

| Repository | Waits for |
|---|---|
| `synkro-customers-portal` (screens beyond a first one) | ADR-011 is accepted, but its internal-routing risk is still open — must be verified as part of this portal's own acceptance criteria before it grows past one screen |
| `synkro-auth-portal` | The Auth service; the development sign-in of the host covers identity until then |

**Next cut — not refined yet:**

| Planned story | Prefix | Requirement |
|---|---|---|
| Customer registration and lookup, service and portal | `CLI` | FR-001 |
| Login, refresh and token issuance with RS256 | `AUTH` | FR-010 |
| Sale registration saga and sale persistence (MongoDB) | `WKF`, `VEN` | FR-005, FR-006, FR-007 |
| Daily, monthly and best-selling reports (MongoDB aggregation pipelines), service and screens | `VEN` | FR-008, FR-009 |
| Low-stock job | `WRK` | FR-004 |
| Stock alerts screen, Sale detail screen, Users and Service tokens screens | `PRO`, `VEN`, `AUTH` | FR-004; `12-ux-ui/navigation-map.md`'s new screens (HU-DOCS-86) |
| Sales persistence integration against `synkro-infra-mongo` | `VEN` | FR-005, FR-006, FR-007 (ADR-010) |

---

## Cut 7 — Products Portal Completion (Week 10)

> Closes the "Product catalog on the real service" item planned in Cut 6's
> "Next cut" table — superseded by these three stories.

| HU ID | Title | Repository | Points | Priority | Status |
|---|---|---|---|---|---|
| HU-PRO-11 | Products portal: base structure (Module Federation remote, shared HTTP client, registration in `synkro-front`, CI, failure-isolation test) | `synkro-products-portal` | ? | Must | **Done** |
| HU-PRO-12 | Products portal: edit, adjust stock and deactivate products; categories section (create, rename, deactivate) | `synkro-products-portal` | ? | Must | **Done** |
| HU-PRO-13 | Products portal: list design (summary cards, table with badges, skeleton, states and filters), all in Spanish | `synkro-products-portal` | ? | Should | **Done** |

---

## Epics

| ID | Epic | Description |
|----|------|--------------|
| EP-001 | Docs & Architecture Formalization | Formalize the domain-to-repository catalog and fill the remaining gap in product definition (`03-product`) |
| EP-002 | Panoramic MVP | Single-repo monolith prototype (Spring Boot + React) to validate business understanding before the 4 real hexagonal microservices are built |

---

## User Stories

### HU-ARQ-01 — Formalize the Domain-to-Repository Service Catalog {#HU-ARQ-01}

**Epic:** EP-001

> **As** the technical lead
> **I want** to formalize the final list of the 4 bounded contexts as future microservices, with concrete repository names, languages, and DB schemas
> **so that** the course instructor can create the exact repository ecosystem without ambiguity, and the team has a single source of truth linking `domain-map.md` to the real repos

**Acceptance Criteria:**

```gherkin
Scenario 1: Catalog matches the bounded contexts
  Given the 4 bounded contexts already defined in 02-domain/domain-map.md
        (Auth, Customers, Products and Inventory, Sales)
  When  the catalog is filled in
  Then  each context has a corresponding backend repo name, frontend repo
        name, language, and DB schema

Scenario 2: Languages match ADR-001 exactly
  Given ADR-001's technology decision (Java for Auth/Customers, Go for
        Products/Sales)
  When  the catalog lists each service's language
  Then  it matches ADR-001 exactly with no discrepancy

Scenario 3: All 10 repositories are accounted for
  Given the fixed repository ecosystem (4 backend + 4 frontend + 1 database
        + 1 docs)
  When  the catalog is complete
  Then  all 10 repositories are listed with their name and branch strategy
        (main/qa/dev, except docs which is main-only)

Scenario 4: Service numbering follows the convention
  Given the service numbering convention already defined in
        09-microservices/README.md (01 = IAM/Security, 02 = reference data,
        03-0N = domain services)
  When  services are numbered
  Then  Auth = 01, Customers = 02, Products = 03, Sales = 04
```

**Definition of Done:**
- [x] `09-microservices/service-catalog.md` filled in with the table below
- [x] Reviewed and approved by at least one other team member
- [x] No discrepancy with ADR-001 or `domain-map.md`
- [x] Per-service detail files (endpoints, events) explicitly deferred — not required for this HU

**Reference table (drop directly into `09-microservices/service-catalog.md`):**

| # | Bounded Context | Backend Repo | Language | Frontend Repo | DB Schema |
|---|---|---|---|---|---|
| 01 | Authentication & Users | `auth-service` | Java (Spring Boot) | `auth-frontend` | `auth` |
| 02 | Customers | `customers-service` | Java (Spring Boot) | `customers-frontend` | `customers` |
| 03 | Products & Inventory | `products-service` | Go | `products-frontend` | `products` |
| 04 | Sales | `sales-service` | Go | `sales-frontend` | `sales` |

Plus the two fixed non-domain repos: `database` (single PostgreSQL instance, 4 schemas above) and `docs` (`main`-only).

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Must Have |
| Target sprint | Sprint 4 |
| Assigned to | Sergio Andrés Ordóñez Díaz |
| Status | Done |
| Dependencies | — |
| Affected service(s) | N/A (cross-cutting, `09-microservices/`) |

---

### HU-ARQ-02 — MVP Monolith: Functional Backend {#HU-ARQ-02}

**Epic:** EP-002

> **As** the Product Owner (course instructor)
> **I want** a functional Spring Boot monolith exposing the core business flows (customer management, product/stock catalog, sale registration with stock deduction)
> **so that** the end-to-end business flow can be validated before the 4 real hexagonal microservices from ADR-001 are built

**Acceptance Criteria:**

```gherkin
Scenario 1: Product price and stock invariants
  Given a product with price and stock fields
  When  a product is created via the API
  Then  price must be greater than 0 and stock can never become negative
  And   the request is rejected otherwise
        (mirrors the Product invariant in entities-and-rules.md)

Scenario 2: Sale requires an active customer
  Given an existing customer
  When  a sale is created for a customer with active = true
  Then  the sale is accepted
  And   given a deactivated customer, the sale is rejected
        (mirrors the Sale invariant "customerId must correspond to an
        active customer")

Scenario 3: Stock deduction on sale confirmation
  Given a sale with one or more line items
  When  it is confirmed
  Then  each product's stock is reduced by the sold quantity
  And   the request is rejected if the requested quantity exceeds
        available stock (mirrors Product.reduceStock())

Scenario 4: Total calculation with frozen unit price
  Given a confirmed sale
  When  its total is calculated
  Then  total equals the sum of each line's subtotal (quantity * unitPrice)
  And   unitPrice stays frozen at the moment of sale — it does not change
        if the product's price changes afterward
        (mirrors the SaleDetail invariant)

Scenario 5: Internal modularity without full hexagonal ports
  Given this is a single-repo monolith and not the 4 real microservices
  When  the code is organized
  Then  Auth/Customers/Products/Sales are kept as separate packages/modules
        internally, to ease a future split
  And   full hexagonal ports-and-adapters per module is explicitly not
        required here — that belongs to the real ADR-001 implementation
```

**Definition of Done:**
- [x] Code reviewed and approved
- [x] Backend actually runs and responds (no blank screen, per the instructor's rule)
- [x] Acceptance criteria verified manually
- [x] README explains how to run it locally
- [x] Embedded H2 DB is acceptable — full 4-schema PostgreSQL setup NOT required for this HU

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Must Have |
| Target sprint | Sprint 4 |
| Assigned to | Angel Gustavo Solano Trujillo |
| Status | Done |
| Dependencies | — |
| Affected service(s) | New temporary repo `mvp-demo` (`/backend`) — **not** one of the 4 fixed backend repos from HU-ARQ-01 |

> **Technical notes:** Auth can be a simple mocked role selector (no real JWT/RS256 signing needed). Circuit Breaker, Saga, Outbox, and CQRS are out of scope — those are ADR-001's target-architecture patterns, not part of this throwaway spike.

---

### HU-FE-01 — Interactive MVP Walkthrough — Sales Management System {#HU-FE-01}

**Epic:** EP-002

> **As** the Product Owner (course instructor)
> **I want** to navigate a React interface covering login, customer management, product/stock catalog, and sale registration
> **so that** I can validate the team's understanding of the business flow before the distributed architecture is implemented

**Acceptance Criteria:**

```gherkin
Scenario 1: Simulated role-based login
  Given the app loads
  When  the user opens it
  Then  a login screen lets them pick a role (ADMIN, SALESPERSON, INVENTORY)
  And   no real JWT is required — this is a simulated session

Scenario 2: ADMIN sees all modules
  Given a user logs in as ADMIN
  When  they reach the main navigation
  Then  all modules are visible (Customers, Products, Sales, basic summary)

Scenario 3: SALESPERSON sees a restricted menu
  Given a user logs in as SALESPERSON
  When  they reach the main navigation
  Then  only Customers, Sales, and a read-only stock lookup are visible
  And   product/category management is not visible

Scenario 4: INVENTORY sees a restricted menu
  Given a user logs in as INVENTORY
  When  they reach the main navigation
  Then  only Products/Categories/Stock are visible
  And   Customers and Sales are not visible

Scenario 5: Customer management reflects immediately
  Given the Customers module
  When  the user creates or edits a customer
  Then  the change is reflected immediately in the list

Scenario 6: Product registration
  Given the Products module
  When  the user registers a product with price and stock
  Then  it appears in the catalog with its current stock

Scenario 7: Confirming a sale
  Given the Sales module
  When  the user selects a customer + products + quantities and confirms
  Then  the UI shows the total, deducts stock, and the sale appears in a
        sales history list

Scenario 8: Insufficient stock is blocked
  Given a product has insufficient stock
  When  the user tries to sell more than available
  Then  the sale is blocked with a clear message
```

**Definition of Done:**
- [x] Mockup actually runs end-to-end in a browser (no blank screen)
- [x] Visual flow matches the diagrams already documented in `12-ux-ui/navigation-map.md`
- [x] Reviewed and approved by at least one other team member
- [x] README explains how to run it locally

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Must Have |
| Target sprint | Sprint 4 |
| Assigned to | Jordan Ramirez Gallego |
| Status | Done |
| Dependencies | — (intentionally decoupled from HU-ARQ-02's backend; connecting to the real API is a stretch goal, not a blocker) |
| Affected service(s) | Same temporary repo `mvp-demo` (`/frontend`) — **not** one of the 4 fixed frontend repos from HU-ARQ-01 |

> **Technical notes:** Stack: React (Vite recommended). Data layer: local/in-memory mock (Context or a simple store).

---

### HU-DOCS-12 — Fill In Problem Framing and Product Vision {#HU-DOCS-12}

**Epic:** EP-001

> **As** the Product Owner (course instructor) and the team
> **I want** `03-product/problem-framing.md` and `03-product/vision.md` filled in, following the Week 2 order in `00-sdd-guide.md` that was skipped while the team fixed the ADR and context-map
> **so that** the product rationale (why SynkroTech SAS needs this system, and what "done" looks like) is documented before requirements and architecture keep building on top of a gap

**Acceptance Criteria:**

```gherkin
Scenario 1: Problem framing names real segments and a metric
  Given the _template-problem-framing.md structure
  When  problem-framing.md is filled in
  Then  it names the affected user segments — the three internal roles
        already defined in RBAC (ADMIN, SALESPERSON, INVENTORY) — the
        current pain each one has, and at least one North Star success metric

Scenario 2: Vision statement stays inside the approved MVP scope
  Given the vision.md template (Geoffrey Moore format)
  When  it's filled in
  Then  it produces one vision statement consistent with what's already
        fixed in 01-context/scope.md
  And   no feature is introduced that falls outside the documented MVP scope

Scenario 3: Domain modeling is not redone here
  Given 02-domain/domain-map.md already exists and is approved
  When  problem-framing is written
  Then  it does not redefine bounded contexts — this section only frames
        the business problem, per the correlation rule in 03-product/README.md

Scenario 4: Pending note gets resolved
  Given the project's own tracking flagged this as "Pendiente inmediato"
        (03-product before 04-requirements/05-architecture)
  When  this HU is closed
  Then  that pending note is resolved
```

**Definition of Done:**
- [x] Both files consistent with `01-context/overview.md` and `03-product/problem-framing.md`
- [x] "Evidence of the problem" section explicitly labeled as sourced from the professor's original business brief (academic project — no fabricated interviews or metrics)
- [x] Reviewed and approved by at least one other team member

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | Should Have |
| Target sprint | Sprint 4 |
| Assigned to | Fredman Santiago Plazas Artunduaga |
| Status | Done |
| Dependencies | — |
| Affected service(s) | N/A (product definition, cross-cutting) |

---

### HU-DOCS-13 — Formalize the MVP Backlog and Non-Functional Requirements {#HU-DOCS-13}

**Epic:** EP-001

> **As** the Product Owner (course instructor) and the team
> **I want** `04-requirements/user-stories.md` (10–15 MVP user stories) and `04-requirements/non-functional.md` (NFRs with measurable metrics) filled in
> **so that** the backlog and the MVP's quality level are made explicit, and the NFR IDs already referenced in other documents (NFR-03, NFR-004, NFR-007) finally get a real, measurable definition instead of remaining loose references

**Acceptance Criteria:**

```gherkin
Scenario 1: User stories formalize what's already decided, not invented from scratch
  Given the MVP scope already fixed in 01-context/scope.md, and the
        concrete flows already built in the MVP monolith (HU-ARQ-02, HU-FE-01)
  When  user-stories.md is filled in
  Then  it must contain 10–15 user stories in the _template-hu.md
        format, each traceable to an item already present in scope.md's
        "MVP Scope" table
  And   no story introduces functionality outside that table

Scenario 2: Non-functional requirements get real, measurable definitions
  Given NFR-03, NFR-004, and NFR-007 are already mentioned by ID in
        01-context/overview.md but were never formally defined
  When  non-functional.md is filled in
  Then  each of those three IDs gets a complete definition with a
        measurable metric (per _template-nfr.md)
  And   any additional NFR the team identifies is added with its own ID

Scenario 3: Each user story is mapped to a responsible service
  Given the 4 bounded contexts already fixed in 02-domain/domain-map.md
  When  each user story is written
  Then  it must state which of Auth/Customers/Products/Sales is
        responsible, consistent with 09-microservices/service-catalog.md
```

**Definition of Done:**
- [x] Both files are consistent with `01-context/scope.md`, `02-domain/domain-map.md`, and `09-microservices/service-catalog.md`
- [x] No user story contradicts an acceptance criterion already implemented in the MVP monolith (HU-ARQ-02 / HU-FE-01)
- [x] Reviewed and approved by at least one other team member

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Should Have |
| Target sprint | Sprint 4 |
| Assigned to | Fredman Santiago Plazas Artunduaga + Angel Gustavo Solano Trujillo |
| Status | Done |
| Dependencies | HU-DOCS-12 (problem-framing/vision must exist first — already done) |
| Affected service(s) | N/A (product/requirements definition, cross-cutting) |

---

## ADR-014 documentation alignment

| HU | Scope | Status / evidence |
|---|---|---|
| [HU-ARQ-27](https://github.com/code-corhuila/synkro-docs/issues/219) | Record ADR-014 and its index relationships | Decision accepted by the team; repository completion is not inferred from acceptance |
| HU-DOCS-91 | Align the affected contracts, security/domain/data design, operations, UX and planned tests | Documentation package prepared; review and merge pending; live issue linkage remains to be reconciled |

HU-ARQ-27 explicitly assigns downstream documentation to HU-DOCS-91.
This update does not rewrite historical cut totals or mark unverified stories Done.

As the development team, we want the documentation and Auth contract aligned with
accepted ADR-014, so that implementation starts from one consistent authorization,
attribution and initial-administrator procedure.

**Documentation acceptance scenarios:**
- Happy path: a reviewer traces ADMIN registration, transactional attribution and controlled initialization consistently through the contract, model, runbook and verification plan.
- Error path: a reviewer finds 401/403 behavior, audit rollback, inactive-ADMIN no-op and recovery exclusion without a public initialization endpoint or a claimed lifetime guarantee.

**Deliverable:** the affected Markdown/YAML files in English, with planned tests
and pending implementation clearly identified. Implementation stories must refine
the AUTH verification scenarios in `11-quality/testing-strategy.md` before code;
this documentation story does not claim tests or migrations have run.

## Rules for writing HUs

### 1. The role matters
Do not write "As a user" — that says nothing. Use the specific role:
```
✓ As a system administrator
✓ As a registered customer
✓ As an inventory operator
✗ As a user
✗ As a person
```

### 2. The benefit justifies the work
The "so that" must describe a business benefit, not redescribe the action:
```
✓ so that I can manage my orders without calling support
✗ so that I can see my orders (this only describes the feature)
```

### 3. ACs are verifiable
Each AC must be verifiable manually or automatable as a test:
```
✓ Then the system shows a message "Order #123 confirmed"
✓ Then the confirmation email arrives in less than 30 seconds
✗ Then the system works well (not verifiable)
✗ Then the user is satisfied (not verifiable)
```

### 4. One HU = one unit of value
If the HU has 15 ACs, it is probably 3 HUs.
The team must be able to complete it in one sprint (maximum 2 weeks).

---

## Ready-to-copy HU template

```markdown
### HU-00X — [Name] {#HU-00X}

**Epic:** EP-00X

> **As** [role]
> **I want** [action]
> **so that** [benefit]

**Acceptance Criteria:**

\```gherkin
Scenario 1: [name]
  Given [context]
  When  [action]
  Then  [result]
\```

| Field | Value |
|-------|-------|
| Story Points | |
| Priority | |
| Target sprint | |
| Status | Backlog |
| Dependencies | |
```

---

## Correlations

- Full template with DoD checklist → `04-requirements/_template-hu.md`
- Non-functional requirements → `04-requirements/non-functional.md`
- Traceability matrix → `04-requirements/traceability-matrix.md`
- API contracts derived from these HUs → `07-api/contracts/openapi/`
