# Project Scope

> These assumptions are considered true. If they change, the scope must be renegotiated.

## All Candidate Functionalities (before prioritization)

Every functionality considered for this project, before any of it was
prioritized into or out of the MVP:

| # | Functionality | Decision |
|---|---------------|----------|
| FR-001 | Register, update, view, and deactivate customers | ✅ In MVP Scope |
| FR-002 | Register, update, view, and deactivate products | ✅ In MVP Scope |
| FR-003 | Organize products by category | ✅ In MVP Scope |
| FR-004 | Control the available stock of each product | ✅ In MVP Scope |
| FR-005 | Register a sale by associating a customer with one or more products | ✅ In MVP Scope |
| FR-006 | Automatically calculate a sale's total from its product details | ✅ In MVP Scope |
| FR-007 | Automatically deduct stock when a sale is registered | ✅ In MVP Scope |
| FR-008 | Generate daily and monthly sales reports | ✅ In MVP Scope |
| FR-009 | Generate a best-selling products report | ✅ In MVP Scope |
| FR-010 | Authenticate users and restrict operations by role (ADMIN, SALESPERSON, INVENTORY) | ✅ In MVP Scope |
| — | Customer self-service portal | ❌ Explicitly Out of Scope |
| — | Electronic invoicing for tax authorities | ❌ Explicitly Out of Scope |
| — | Multiple branches or warehouses | 🔵 Future Candidate |
| — | Payment gateway integration | 🔵 Future Candidate |
| — | Returns and warranties | 🔵 Future Candidate |
| — | Asynchronous communication between services (events, RabbitMQ) | 🔵 Future Candidate |

The three sections below give the full detail behind each decision. The Corte 1 column is historical; current distributed delivery is recorded in the [traceability matrix](../04-requirements/traceability-matrix.md), [service catalog](../09-microservices/service-catalog.md) and [portal map](../12-ux-ui/navigation-map.md). Sales report endpoints and real login now exist; Worker business automation and reporting/dashboard/administration UI remain unfinished, not newly excluded.

## MVP Scope (In Scope)

| # | Functionality | Description | Responsible Service | Corte 1 Status |
|---|---------------|-------------|----------------------|-----------------|
| 1 | Authentication and Authorization | User registration/login, JWT (RS256) issuance and validation, role-based access control (ADMIN, SALESPERSON, INVENTORY) **(FR-010)** | Auth | 🟡 Simulated only — a user picker with no password or token. Real JWT is target scope for the full MVP, not built in this Corte (see `HU-AUTH-NN`, `12-ux-ui/navigation-map.md` Flow 2) |
| 2 | Customer Management | Register, update, query, and deactivate customers **(FR-001)** | Customers | ✅ Implemented |
| 3 | Product Management | Register, update, query, and deactivate products and categories; organize products by category **(FR-002, FR-003)** | Products | ✅ Implemented |
| 4 | Stock Control | Query and update available inventory **(FR-004)** | Products | ✅ Implemented |
| 5 | Sales Registration | Create a sale by associating a customer and products, with automatic total calculation **(FR-005, FR-006)** | Sales | ✅ Implemented in the Corte 1 monolith; the target design routes this through the synkro-workflow saga (ADR-007, modified by Accepted ADR-015), now delivered with separate acceptance gaps |
| 6 | Automatic Stock Deduction | Upon confirming a sale, the corresponding stock is deducted **(FR-007)** | Sales → Products | ✅ Implemented in the Corte 1 monolith; the target design routes this through the synkro-workflow saga (ADR-007, modified by Accepted ADR-015), now delivered with separate acceptance gaps |
| 7 | Sales Reports | Daily and monthly sales reports, best-selling products report **(FR-008, FR-009)** | Sales | 🔴 Not populated yet — reports aggregate the `sale` collection live; there is no `sales_summary` table or collection (ADR-005 Decision 5, ADR-010 Decision 4) |
| 8 | Soft Deletion / Traceability | Records are deactivated using an `active` flag and are never physically deleted, preserving operational history **(NFR-009)** | All Services | ✅ Implemented |

**Corte 1 delivery repository:** the code referenced in the "Corte 1
Status" column above lives at
[`code-corhuila/synkro-tech`](https://github.com/code-corhuila/synkro-tech.git)
— a monolithic build, separate from the 4-microservice target architecture
fixed in ADR-001.

## Explicitly Out of Scope

| # | Excluded Item | Reason |
|---|----------|-------|
| 1 | Customer Self-Service Portal | The system is intended for internal use (employees), not end customers |
| 2 | Electronic Invoicing for Tax Authorities | Outside the academic and business scope of the MVP |

## Candidates for Future Versions

| # | Candidate | Note |
|---|-----------|------|
| 1 | Multiple Branches or Warehouses | This MVP assumes a single SynkroTech SAS operating location |
| 2 | Payment Gateway Integration | There is no real payment processing in this MVP |
| 3 | Returns and Warranties | Not critical for the MVP; could be added in a later version |
| 4 | Asynchronous Communication Between Services (Events, RabbitMQ) | Deferred until an event has a consumer that a requirement needs (ADR-007 Decision 5, `technical-backlog.md` TD-002) |

## Open Questions

| # | Question | Status | Impact on Scope |
|---|----------|--------|------------------|
| 1 | Will discounts/promotions be supported in the MVP? | Pending business validation | Affects total calculation in Sales |
| 2 | Will multiple payment methods be supported in the MVP? | Pending business validation | Affects the `sales` data model |
| 3 | What happens if stock reaches zero during checkout, just before confirmation? | Reservation/concurrency and failure UI exist; optional live re-check UX remains Q-003 | Atomic Products reservation/Workflow evidence govern the outcome; preview is not a reservation |

## External Integrations

None. The system is self-contained and does not depend on external providers (payment gateways, shipping services, electronic invoicing) in this version.

## Project Constraints

| Type | Constraint |
|------|-------------|
| Time | 16 weeks total (Distributed Systems course); reconciliation stories are Sprint 12 — Week 12 |
| Team | 4 members, with no fixed development roles beyond technical leadership |
| Technology | Java and Go are required in the backend; React 19 and Angular 21 in the frontend (ADR-011); one shared PostgreSQL instance per environment for Auth, Customers, Products and the saga store, plus one MongoDB instance per environment for Sales (ADR-009, ADR-010) |
| Architecture | Hexagonal Architecture (Ports and Adapters) is mandatory for the 4 domain `-api` services, `synkro-workflow` and `synkro-worker` (ADR-007, ADR-008) |
| Repositories | Fixed ecosystem: 4 domain backends + 4 `-db` (3 on Flyway, 1 on Liquibase for Sales) + 4 portals (3 React, 1 Angular) + `synkro-front` + `synkro-api-gateway` + `synkro-workflow` + `synkro-worker` + `synkro-infra-postgres` + `synkro-infra-mongo` + `synkro-docs`, each following the `main/qa/develop` workflow except `synkro-docs` (`main`-only) |

## Project Environments

| Environment | Status |
|---------|--------|
| Local | Active — development on each team member's machine |
| Development | Active — team continuous integration |
| Staging | Planned — pending a decision based on progress during the second half of the semester |

## How to Update the Scope

The scope can change, but changes follow a defined process:

1. Document the proposed change in this file.
2. Evaluate the impact on the timeline and effort.
3. Obtain agreement from the team (and approval from the course advisor if it affects the architecture defined in ADR-001).
4. Update the roadmap in `03-product/vision.md`.
5. Create or update user stories in `04-requirements/user-stories.md`.

## References

- System Overview → `01-context/overview.md`
- Detailed Functional and Non-Functional Requirements → `04-requirements/`
- Architecture Decision → `05-architecture/decisions/records/ADR-001-architecture.md`
- Corte 1 MVP repository → `https://github.com/code-corhuila/synkro-tech.git`
