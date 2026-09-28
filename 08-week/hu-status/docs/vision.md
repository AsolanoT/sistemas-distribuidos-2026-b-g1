# Product Vision

> The vision is the team's north star. All sprints, design decisions,
> and trade-offs are evaluated against this vision.
> It must be ambitious yet achievable, inspiring but specific.

---

## Vision statement

**For** SynkroTech SAS's internal staff — administrators, sales staff, and inventory staff —
**who** need a single, reliable source of truth for customers, products, stock, and sales,
**the** SynkroTech Sales Management System
**is a** role-based internal sales and inventory management platform
**that** validates stock in real time, automatically deducts inventory on every confirmed sale, and gives full traceability of every transaction,
**unlike** the disconnected spreadsheets, physical notebooks, and manual stock checks used today,
**our product** keeps customers, products, stock, and sales as one connected system, with reports generated from real, up-to-date data instead of manual tallying.

---

## Team mission

We exist to replace SynkroTech SAS's fragmented, manual sales and inventory process with one connected system its staff can trust — and, in doing so, to prove that this team can design and ship real distributed software against DDD, SOLID, and hexagonal-architecture principles, not just check items off a course rubric.

---

## Strategic pillars

| Pillar | Description | Success metrics |
|--------|-------------|------------------|
| Real-time accuracy | Stock and sales always reflect the true state of the business — no manual reconciliation | Stock discrepancy incidents; time for a sale to reflect in stock |
| Traceability | Every record preserves its history through soft deletion — nothing is silently lost | % of deactivations using the `active` flag vs. any hard delete (target: 100%) |
| Role clarity | Each of the 3 roles (ADMIN, SALESPERSON, INVENTORY) sees and does only what its job requires | Unauthorized-access incidents across roles (target: 0) |
| Independent evolution | Each bounded context can change without breaking the others | Cross-service deploys required per change (target: trending to 0) |

---

## High-level roadmap

> Adapted to the course's 16-week timeline instead of calendar quarters.

```
Weeks 1–4 ──── Weeks 5–10 ──── Weeks 11–16
     │               │               │
 Foundation    Real microservices  Hardening
 (done)        (Auth, Customers,   & final demo
                Products, Sales)
```

| Horizon | Period | Objective | Epics / Features | Uncertainty |
|---------|--------|-----------|---------------------|--------------|
| H1 (Done) | Weeks 1–4 | Validate the domain and prove the business flow end to end | PDR, ADR-001, domain model, service catalog, MVP monolith demo | Low — done |
| H2 (Now) | Weeks 5–10 | Rebuild the proven flow as 4 independent hexagonal microservices | `auth-service`, `customers-service`, `products-service`, `sales-service`, contract-first APIs | **Medium → flagged for team attention: as of week 8 (mid-H2), all delivered work has been architecture decisions and documentation (ADR-003, hexagonal guide, domain events, UML, HU-08 corrections) — no microservice code has been written yet. Confirm with the team whether H2's timeline still holds or needs revisiting.** |
| H3 (Later) | Weeks 11–16 | Add resilience patterns where justified, sales reports, and prepare the final demo | Evaluate Circuit Breaker/Saga/Outbox/CQRS per ADR-001; daily/monthly/best-seller reports | High — depends on H2 velocity |

---

## Product principles

1. **Business understanding first:** every technical decision must trace back to a real rule in `02-domain/entities-and-rules.md` — no feature exists just because it's a common pattern.
2. **Simple before distributed:** prove the business flow works (the MVP monolith) before paying the cost of a distributed system.
3. **Documentation is not an afterthought:** per the SDD pillar, if it isn't written down, it doesn't exist yet.

---

## Product Definition of Done

**Objective:** Deliver a working, understandable sales management system that proves the team can design and build a real distributed system.

| Key Result | Baseline | Target | Date |
|-------------|----------|--------|------|
| KR1: Average time to register a sale (North Star, see `problem-framing.md`) | Unmeasured | Defined once instrumented | Week 12 |
| KR2: Microservices deployed independently with hexagonal architecture | 0/4 | 4/4 | Week 16 |
| KR3: Hard-delete compliance (soft delete only) | N/A — not yet built | 100% | Week 16 |

---

## Correlations

- Problem framing (the why) → `03-product/problem-framing.md`
- Backlog that implements the vision → `04-requirements/user-stories.md`
- KPIs in operations → `13-operations/README.md`
