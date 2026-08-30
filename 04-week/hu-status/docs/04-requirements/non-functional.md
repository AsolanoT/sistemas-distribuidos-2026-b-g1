# Non-Functional Requirements (NFR)

> NFRs define the **qualities of the system** — not what it does but how well it does it.
> The golden rule: every NFR must have a metric. "The system must be fast" is not an NFR.
>
> **Numbering note:** this project uses its own `NFR-01` to `NFR-07` numbering (carried over
> from the original PDR's non-functional requirements), not the generic `NFR-001`–`NFR-008`
> industry categories the scaffold template ships with. This keeps consistency with the IDs
> already referenced in `01-context/overview.md` (NFR-03, NFR-07) and `01-context/scope.md`

---

## NFR-01: Availability (web access)

| Attribute | Metric |
|-----------|--------|
| Access method | System must be reachable via any evergreen browser (latest 2 versions of Chrome, Firefox, Edge) |
| Formal uptime SLA | Not applicable — academic project, no real end users (see `overview.md`, Environments) |
| Local/Dev availability | Available whenever `docker compose up` succeeds on the Local/Development environment |

**Scope note:** enterprise-grade SLOs (99.9% uptime, multi-region failover) are explicitly out of scope for this MVP — there is no production traffic to protect.

---

## NFR-02: Security — Authentication and Authorization

| Attribute | Metric |
|-----------|--------|
| Token type | JWT, signed with RS256 (asymmetric) |
| Access token expiration | 1 hour |
| Refresh token expiration | 7 days, with rotation on each use |
| Validation | Every service validates the JWT **locally** with Auth's public key — no runtime call to Auth per request |
| RBAC | 3 roles: `ADMIN`, `SALESPERSON`, `INVENTORY` — see `00-governance/security-policy.md` |
| Password storage | bcrypt, cost factor ≥ 12 |
| Transport | HTTPS mandatory outside Local; HTTP allowed only in Local development |

This NFR is already fully defined in `00-governance/security-policy.md` and `05-architecture` (ADR-001) — this entry exists so the ID is traceable from `04-requirements`, not to redefine it.

---

## NFR-03: Independent Evolution of Components

| Attribute | Metric |
|-----------|--------|
| Deployability | Each of the 4 services (Auth, Customers, Products, Sales) must be deployable independently, without requiring a redeploy of the other 3 |
| Code coupling | No service imports another service's internal code — verified via code review; only HTTP calls to public endpoints are allowed between services |
| Database coupling | No service queries another service's schema directly — verified against `05-architecture`/ADR-001 (own DB user per schema, `GRANT`-restricted) |
| Validation method | Manual code review checklist per PR (no automated coupling-detection tool for this MVP) |

**Why this matters:** this is the NFR that justifies the hexagonal + microservices decision in ADR-001 — see `01-context/overview.md`'s Technology Stack table.

---

## NFR-04: Traceability (Soft Deletion)

| Attribute | Metric |
|-----------|--------|
| Deletion method | 100% of entities use an `active` boolean flag; no `DELETE` SQL statement is used for business records |
| Verification | Schema review confirms every table has an `active` column before a service is marked "Done" |
| Audit fields | `fecha_registro`/`created_at` present on every entity per `02-domain/entities-and-rules.md` |

This directly implements FR-08 (soft delete requirement) referenced in `01-context/scope.md`, item #8.

---

## NFR-05: Response Time for Critical Operations

| Attribute | Metric | Status |
|-----------|--------|--------|
| Sale creation (`POST /api/sales`) | P95 < 500ms | Design target — **not yet measured**, no load testing performed |
| Stock lookup (`GET /api/products/{id}`) | P95 < 300ms | Design target — **not yet measured** |
| Login (`POST /api/auth/login`) | P95 < 400ms | Design target — **not yet measured** |

**Why these three are "critical":** they sit on the main sales flow documented in the PDR's expected-flow diagram — a slow response here directly blocks a vendor mid-sale.

**Scope note:** these are reasonable engineering targets set by the team, not values derived from load testing (k6/JMeter/Gatling are out of scope for the MVP). They should be validated once the real services are deployed to Development.

---

## NFR-06: Scalability Readiness

| Attribute | Metric |
|-----------|--------|
| Catalog growth | Adding new products/categories must not require a schema redesign |
| Transaction growth | Adding more sales records must not require a schema redesign (single `ventas`/`sales` schema, indexed by expected query patterns) |
| Validation method | Design review only — no load testing or auto-scaling infrastructure for this MVP (no Kubernetes, no horizontal auto-scaling) |

**Scope note:** enterprise scalability infrastructure (Kubernetes, horizontal auto-scaling, Redis-backed sessions) is explicitly **out of scope** — this NFR only requires that the *data model and service boundaries* don't need to be redesigned as volume grows, not that the system is load-tested at scale.

---

## NFR-07: Interoperability (REST APIs)

| Attribute | Metric |
|-----------|--------|
| Communication protocol | 100% of inter-service communication uses REST/HTTP with JSON payloads |
| Contract-first | Every exposed endpoint has a corresponding OpenAPI contract in `07-api/contracts/openapi/` (pending — next in the SDD fill-in order) |
| No shared database access | Confirmed via NFR-03 — services never read another service's schema directly, always through its REST API |

This directly supports the "no API Gateway, direct frontend-to-backend" decision documented in `09-microservices/service-catalog.md`.

---

## Simplified observability (academic scope)

The scaffold template's generic `non-functional.md` includes enterprise-grade observability requirements (Prometheus + Grafana metrics, OpenTelemetry distributed tracing, PagerDuty alerting). For this academic MVP, that tooling is **explicitly out of scope**. The minimum bar for this project is:

| Attribute | Metric |
|-----------|--------|
| Logs | Each service logs to stdout in a readable format (JSON not required for MVP) |
| Health check | Each service exposes a basic `GET /health` returning 200 if the process is running |

If the team later needs real observability (e.g. for a more advanced sprint), this section should be expanded using the scaffold's original `NFR-005: Observability` structure as a reference.

---

## NFR priority matrix

| NFR | Priority (P1/P2/P3) | Validated how? | Owner |
|-----|---------------------|-----------------|-------|
| NFR-01 Availability | P3 | Manual check (app loads) | Team |
| NFR-02 Security | P1 | Code review against `security-policy.md` / `security-rules.md` | Team |
| NFR-03 Independent evolution | P1 | Code review checklist per PR | Team |
| NFR-04 Traceability | P1 | Schema review | Team |
| NFR-05 Response time | P2 | Manual observation — not load-tested | Team |
| NFR-06 Scalability readiness | P3 | Design review only | Team |
| NFR-07 Interoperability | P1 | OpenAPI contract review | Team |

---

## Out of scope for this MVP (explicitly deferred)

- Formal uptime SLA / SLO with error budgets
- Load testing (k6, JMeter, Gatling, Locust)
- Distributed tracing (OpenTelemetry/Jaeger) and metrics dashboards (Prometheus/Grafana)
- Kubernetes-based auto-scaling
- Disaster recovery across availability zones/regions
- Regulatory compliance frameworks (GDPR, PCI-DSS) — not applicable, no real payment or EU personal data processing in this academic project

---

## Correlations

- Functional requirements these NFRs support → `01-context/scope.md` (MVP Scope table)
- Security detail → `00-governance/security-policy.md`, `00-governance/security-rules.md`
- Architecture decision that NFR-03/NFR-07 justify → `05-architecture/decisions/records/ADR-001-architecture.md`
- User stories that must satisfy these NFRs → `04-requirements/user-stories.md`
