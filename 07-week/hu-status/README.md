<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       07-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 07

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group - synkro-tech
- SPRINT_GOAL: Close the documentation gap left by ADR-003's ripple effects across 05-architecture/, 09-microservices/, and 06-data/, and close HU-DOCS-25/26 by fixing FR/NFR identifiers and disconnecting the repository from the external PDR.
<!-- CONFIG-END -->

## Docs Repository

| Board Name             | URL                                              |
|------------------------|--------------------------------------------------|
| synkro-docs Repository | https://github.com/code-corhuila/synkro-docs.git |

## Team Members

| Full Name                          | GitHub User                               |
|------------------------------------|-------------------------------------------|
| Sergio Andres Ordoñez Diaz         | https://github.com/SergioAndres17         |
| Fredman Santiago Plazas Artunduaga | https://github.com/SantiagoPlazas2005     |
| Jordan Ramirez Gallego             | https://github.com/JordanRG420            |

## 1. User stories worked this week

| HU ID      | Title                                                       | Status | Evidence (PR or commit URL)                                                                       |
|------------|-------------------------------------------------------------|--------|---------------------------------------------------------------------------------------------------|
| HU-DOCS-25 | Unify FR/NFR identifiers and disconnect PDR                 | done   | [`navigation-map.md`](https://github.com/code-corhuila/synkro-docs/commit/bb1025cec8be555ceb0a9bb7f6203668b7ab4d01#diff-7c8e087ff7d67c09f5b612ed5fa74c71404cbd8ed6bfe540c1fbdfa4dd9949da) |
| HU-ARQ-14  | Add ADR-003 — Gateway, Saga, RabbitMQ, Outbox + downstream | done   | `05-architecture/decisions/records/ADR-003-gateway-saga-async.md`, `05-architecture/overview.md`, `05-architecture/pattern-guide.md`, `05-architecture/deployment.md` |

## 2. My individual contribution

**HU-DOCS-25 — Unify FR/NFR identifiers and disconnect PDR:**
- Updated `01-context/navigation-map.md` to remove every remaining
  reference to the external PDR document and replace all `RF-`/`RNF-`
  prefixes with the unified `FR-`/`NFR-` three-digit format adopted by
  the team (e.g. `RF-01` → `FR-001`).
- Verified that all cross-references in `navigation-map.md` resolve to
  files that exist in the repository after the PDR disconnection.

**HU-ARQ-14 — ADR-003 and downstream corrections:**
- Authored `ADR-003-gateway-saga-async.md`, formalizing 6 architectural
  decisions introduced by the professor adding `synkro-api-gateway`,
  `synkro-workflow`, and `synkro-worker` to the course scope: API Gateway
  as the single external entry point, JWT validation moved to the Gateway,
  RabbitMQ formally adopted, sale registration moved to an orchestrated
  Saga in `synkro-workflow`, Outbox pattern adopted inside the existing
  `sales` schema, and 3 new services added to the catalog.
- Updated `05-architecture/overview.md`: rewrote Principle P3 (Gateway
  is now the single external entry point), updated C4 L1 and L2 diagrams
  to include Gateway/Workflow/RabbitMQ/Worker, updated the Adopted
  Architectural Patterns table, rewrote the Communication Patterns
  section around the Saga flow, and marked AT-003 as resolved.
- Updated `05-architecture/pattern-guide.md`: flipped Saga and Outbox
  from "Rejected for MVP" to "Adopted (ADR-003)", updated Circuit Breaker
  and Timeout/Retry sections to reference `synkro-workflow` (not
  `sales-service`) as the caller making cross-service calls, and removed
  API Gateway from "Patterns Not Evaluated".
- Updated `05-architecture/deployment.md`: added RabbitMQ to
  docker-compose with healthcheck, added a "Network Guarantee" section
  documenting the Docker network split that makes Gateway-only JWT
  validation safe, removed `JWT_PUBLIC_KEY` from `customers-service` and
  `products-service` env vars, and added env var blocks for `api-gateway`,
  `synkro-workflow`, and `synkro-worker`.

## 3. Blockers and risks

- ADR-003 introduced a deliberate exception to the single-source rule: C4
  diagrams now live in two places (`05-architecture/overview.md` as Mermaid
  and `08-uml/diagrams/source/` as draw.io). Whoever updates the
  architecture must update both in the same PR — documented explicitly in
  `08-uml/diagram-index.md`, but it remains a coordination risk.
- The technology stack for `synkro-workflow` and `synkro-worker` is still
  TBD in `service-catalog.md`. This must be resolved before API contracts
  (folder `07-api/`) can be written for those services.

## 4. Plan for next week

- Follow up on professor's feedback on the merged PRs and address any
  requested corrections.
- Begin folder `07-api/` (OpenAPI contracts) once the technology decision
  for `synkro-workflow` and `synkro-worker` is confirmed.
- Coordinate with the team on the first coding sprint kickoff (TDD cycle,
  hexagonal structure per `05-architecture/hexagonal-architecture.md`).

## 5. Compliance self-check

- [x] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to `main` — branches `docs/add-adr-003-gateway-saga-async` and `docs/unify-fr-nfr-and-disconnect-pdr`, both merged via PR approved by `ariel5253`
- [x] Testable acceptance criteria
- [x] Tests added/updated — N/A, documentation-only HU
- [x] DDD / hexagonal boundaries respected — N/A, no code touched this week
- [x] No secrets; config via environment variables — `deployment.md` documents all credentials as env vars only

## 6. Evidence links

- ADR-003: [`ADR-003-gateway-saga-async.md`](./docs/ADR-003-gateway-saga-async.md)
- Architecture overview: [`overview.md`](./docs/overview.md)
- Pattern guide: [`pattern-guide.md`](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/pattern-guide.md)
- Deployment: [`deployment.md`](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/deployment.md)
- Navigation map (HU-DOCS-25): [`navigation-map.md`](https://github.com/code-corhuila/synkro-docs/blob/main/01-context/navigation-map.md)