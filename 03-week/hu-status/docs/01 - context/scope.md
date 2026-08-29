# Project Scope

> These assumptions are considered true. If they change, scope must be renegotiated.

## MVP Scope (in scope)

| # | Feature | Description | Owning service |
|---|---------|-------------|-----------------|
| 1 | Authentication and authorization | User registration/login, JWT (RS256) issuance and validation, role-based access control (ADMIN, SALESPERSON, INVENTORY) | Auth |
| 2 | Client management | Register, update, query, and deactivate clients | Clients |
| 3 | Product management | Register, update, query, and deactivate products and categories; organize products by category (RF-03) | Products |
| 4 | Stock control | Query and update available inventory | Products |
| 5 | Sales registration | Create a sale linking a client and products, with automatic total calculation | Sales |
| 6 | Automatic stock deduction | Stock is deducted accordingly when a sale is confirmed | Sales → Products |
| 7 | Sales reports | Daily and monthly sales reports, best-selling products report | Sales |
| 8 | Logical deletion / traceability | Records are deactivated via an `active` flag, never physically deleted, to preserve operational history (RNF-04) | All services |

## Explicitly out of scope

| # | Excluded | Reason |
|---|----------|--------|
| 1 | Self-service portal for end clients | The system is for internal use (employees), not customer-facing |
| 2 | Electronic invoicing to tax authorities | Outside the academic and business scope of the MVP |

## Candidates for future versions

| # | Candidate | Note |
|---|-----------|------|
| 1 | Multiple branches or warehouses | This MVP assumes a single operating site for SynkroTech SAS |
| 2 | Payment gateway integration | No real payment processing in this MVP |
| 3 | Returns and warranties | Not critical for the MVP, could be added in a later version |
| 4 | Asynchronous communication between services (events, RabbitMQ) | The MVP uses synchronous REST communication; this would be an optional advanced phase to further decouple services |

## Open questions inherited from the PDR

These are tracked in detail in `pdr/01_PDR_negocio_v1.md` (section 03) and affect the scope decisions above:

| # | Question | Status | Scope impact |
|---|----------|--------|----------------|
| 1 | Will discounts/promotions be supported in the MVP? | Pending business validation | Affects total calculation in Sales |
| 2 | Will multiple payment methods be supported in the MVP? | Pending business validation | Affects the `sales` data model |
| 3 | What happens if stock reaches zero during checkout, right before confirming? | Pending technical definition | Affects the concurrency design of the Products service; Sales could accept an order it cannot fulfill without additional control |

## External integrations

None. The system is self-contained — it does not depend on external providers (payment gateways, shipping services, electronic invoicing) in this version.

## Project constraints

| Type | Constraint |
|------|-----------|
| Time | 16 weeks total (Distributed Systems course); week 3 in progress |
| Team | 4 members, no fixed development roles beyond the tech lead |
| Technology | Java and Go mandatory in backend; React in frontend; PostgreSQL as the single logical database |
| Architecture | Hexagonal architecture (Ports and Adapters) mandatory across the 4 microservices |
| Repositories | Fixed ecosystem: 4 backend + 4 frontend + 1 database + 1 `docs`, each with a `main/qa/dev` flow |

## Project environments

| Environment | Status |
|-------------|--------|
| Local | Active — development on each team member's machine |
| Development | Active — the team's continuous integration |
| Staging | Planned — pending decision based on progress in the semester's second term |

## How to update the scope

Scope can change, but the change follows a process:

1. Document the proposed change in this file.
2. Assess the impact on timeline and effort.
3. Get team agreement (and course advisor approval if it affects the architecture defined in ADR-001).
4. Update the roadmap in `03-product/vision.md`.
5. Create or update HUs in `04-requirements/user-stories.md`.

## Correlations

- System overview → `01-context/overview.md`
- Detailed functional and non-functional requirements → `04-requirements/`
- Architecture decision → `05-architecture/decisions/records/ADR-001-architecture.md`
