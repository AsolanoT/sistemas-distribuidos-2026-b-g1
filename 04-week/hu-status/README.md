<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       04-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 04

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group - synkro-tech
- SPRINT_GOAL: Formalize the domain-to-repository service catalog, fill the product-definition gap (problem framing + vision), and build a panoramic MVP monolith (Spring Boot + React) to validate business understanding, as requested by the instructor for Week 4.
<!-- CONFIG-END -->

## Docs Repository

| Board Name          | URL                                              |
| -------------------- | ------------------------------------------------ |
| synkro-docs Repository | https://github.com/code-corhuila/synkro-docs.git |

## Team Members

| Full Name                          | GitHub User                                                 |
| ----------------------------       | ------------------------------------------                  |
| Sergio Andres Ordoñez Diaz         | https://github.com/SergioAndres17                           |
| Fredman Santiago Plazas Artunduaga | https://github.com/SantiagoPlazas2005                       |
| Jordan Ramirez Gallego             | https://github.com/JordanRG420                              |
| Angel Gustavo Solano Trujillo      |  https://github.com/AsolanoT                                |


## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-FE-01 | Interactive MVP Walkthrough — Sales Management System | done | https://github.com/AsolanoT/mvp-synkro-tech/tree/main/frontend |
| HU-DOCS-13 | Formalize the MVP Backlog and Non-Functional Requirements | done | https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/blob/main/04-week/hu-status/docs/04-requirements/user-stories.md |

## 2. My individual contribution

**Context:** the instructor asked for 3 explicit deliverables this week: the domain catalog, continuing the `docs` repo, and a panoramic, interactive MVP mockup that lets the instructor visually validate whether the team really understood the business need. My HU-FE-01 covers the frontend half of that mockup. Together with Fredman Santiago, I also closed a documentation gap that had been floating since earlier weeks: NFR IDs referenced without a real definition.

**HU-FE-01 — Interactive MVP frontend:**
- I built the React interface covering the full business flow already documented in the PDR's expected-flow diagram: simulated role-based login (ADMIN, SALESPERSON, INVENTORY, with no real JWT), customer management, product/stock catalog, and sale registration.
- I implemented the RBAC-driven navigation exactly matching the roles already defined: ADMIN sees all modules; SALESPERSON sees Customers, Sales, and a read-only stock lookup (no product/category management); INVENTORY sees only Products/Categories/Stock (no Customers or Sales).
- I wired the sale confirmation flow to show the calculated total, deduct stock, and append the sale to a visible sales history list — and to block the sale with a clear message when the requested quantity exceeds available stock.
- I deliberately kept the data layer as a local/in-memory mock (decoupled from HU-ARQ-02's backend), so this HU doesn't block on the backend being finished — connecting to the real API is a stretch goal, not a requirement for this week.
- I converted this HU into the Gherkin-scenario format required by `04-requirements/user-stories.md` and added it there.

**HU-DOCS-13 — MVP backlog and non-functional requirements (with Fredman Santiago):**
- We filled in `04-requirements/user-stories.md` with 10–15 MVP user stories, each traceable to an item already fixed in `01-context/scope.md`'s MVP scope table — no story introduces anything outside that documented scope.
- Each story names the responsible bounded context (Auth, Customers, Products, or Sales), kept consistent with `09-microservices/service-catalog.md`.
- We formally defined `04-requirements/non-functional.md`, giving NFR-03, NFR-04, and NFR-07 (already referenced by ID in `01-context/overview.md` but never actually defined) a real, measurable metric each, following `_template-nfr.md`.
- We cross-checked that none of the new user stories contradict what's already shipped in the MVP monolith (HU-ARQ-02 / HU-FE-01).

## 3. Blockers and risks
- Since the frontend's data layer is in-memory only, nothing persists between page reloads — acceptable for a live demo walkthrough, but worth flagging so nobody expects saved state across sessions.
- The visual flow was built to match the PDR diagram closely; if the instructor's feedback during the Weekly session asks for changes to that flow, both this mockup and the original PDR diagram would need to be revisited together to stay consistent.
- The newly defined NFR metrics (NFR-03, NFR-04, NFR-07) haven't been validated against real load or usage yet — they're reasonable targets on paper, not measured values.

## 4. Plan for next week
- If the instructor's feedback validates the business flow, start scoping how much of this frontend logic can be reused (at least visually) when building the real `sales-frontend`/`customers-frontend` repos.
- Support connecting the frontend to the real backend (HU-ARQ-02) if that becomes a priority instead of staying a stretch goal.
- Start mapping the newly formalized user stories (HU-DOCS-13) to concrete API contracts in `07-api/contracts/openapi/`, now that each story names its responsible service.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O) — not applicable, this is a UI-only prototype
- [x] No secrets; config via environment variables

## 6. Evidence links
- Frontend mockup repo: [`mvp-synkro-tech/frontend`](./frontend/README.md)
- User stories backlog (HU-FE-01 and HU-DOCS-13 entries): [`user-stories.md`](./docs/04-requirements/user-stories.md)
- Non-functional requirements: [`non-functional.md`](./docs/04-requirements/non-functional.md)