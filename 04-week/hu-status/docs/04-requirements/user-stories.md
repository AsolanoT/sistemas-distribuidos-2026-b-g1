# User Stories — Backlog

> **What to fill in here:** The product's User Story backlog.
> Each HU uses the standard format with Acceptance Criteria in Given/When/Then.
> Refined (Ready) HUs go to the sprint. Unrefined ones are epics or ideas.

---

## Backlog status

| Cut | Sprint | Total HUs | Refined | In progress | Completed |
|-----|--------|-----------|---------|-------------|-----------|
| Cut 1 | Sprint 1-3 (docs discovery) | 22 | 22 | 0 | 22 |
| Cut 2 | Sprint 4 (catalog + product def. + panoramic MVP) | 4 | 4 | 4 | 0 |

---

## Epics

| ID | Epic | Description |
|----|------|-------------|
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
- [ ] `09-microservices/service-catalog.md` filled in with the table below
- [ ] Reviewed and approved by at least one other team member
- [ ] No discrepancy with ADR-001 or `domain-map.md`
- [ ] Per-service detail files (endpoints, events) explicitly deferred — not required for this HU

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
| Status | Ready |
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
- [ ] Code reviewed and approved
- [ ] Backend actually runs and responds (no blank screen, per the instructor's rule)
- [ ] Acceptance criteria verified manually
- [ ] README explains how to run it locally
- [ ] Embedded H2 DB is acceptable — full 4-schema PostgreSQL setup NOT required for this HU

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Must Have |
| Target sprint | Sprint 4 |
| Assigned to | Angel Gustavo Solano Trujillo |
| Status | Ready |
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
- [ ] Mockup actually runs end-to-end in a browser (no blank screen)
- [ ] Visual flow matches the diagram already approved in the PDR
- [ ] Reviewed and approved by at least one other team member
- [ ] README explains how to run it locally

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Must Have |
| Target sprint | Sprint 4 |
| Assigned to | Jordan Ramirez Gallego |
| Status | Ready |
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
- [ ] Both files consistent with `01-context/overview.md` and `01_PDR_negocio_v1.md`
- [ ] "Evidence of the problem" section explicitly labeled as sourced from the professor's original business brief / PDR (academic project — no fabricated interviews or metrics)
- [ ] Reviewed and approved by at least one other team member

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | Should Have |
| Target sprint | Sprint 4 |
| Assigned to | Fredman Santiago Plazas Artunduaga |
| Status | Ready |
| Dependencies | — |
| Affected service(s) | N/A (product definition, cross-cutting) |

---

### HU-DOCS-13 — Formalize the MVP Backlog and Non-Functional Requirements {#HU-DOCS-13}

**Epic:** EP-001

> **As** the Product Owner (course instructor) and the team
> **I want** `04-requirements/user-stories.md` (10–15 MVP user stories) and `04-requirements/non-functional.md` (NFRs with measurable metrics) filled in
> **so that** the backlog and the MVP's quality level are made explicit, and the NFR IDs already referenced in other documents (NFR-03, NFR-04, NFR-07) finally get a real, measurable definition instead of remaining loose references

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
  Given NFR-03, NFR-04, and NFR-07 are already mentioned by ID in
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
- [ ] Both files are consistent with `01-context/scope.md`, `02-domain/domain-map.md`, and `09-microservices/service-catalog.md`
- [ ] No user story contradicts an acceptance criterion already implemented in the MVP monolith (HU-ARQ-02 / HU-FE-01)
- [ ] Reviewed and approved by at least one other team member

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Should Have |
| Target sprint | Sprint 4 |
| Assigned to | Fredman Santiago Plazas Artunduaga + Angel Gustavo Solano Trujillo |
| Status | Ready |
| Dependencies | HU-DOCS-12 (problem-framing/vision must exist first — already done) |
| Affected service(s) | N/A (product/requirements definition, cross-cutting) |

---

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
