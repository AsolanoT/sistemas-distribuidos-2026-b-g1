
# Weekly status - Week 02

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group - SynkroTech SAS
- SPRINT_GOAL: Define and document the initial architecture decision (ADR-001) for the sales management system.
<!-- CONFIG-END -->

## Project Board

| Board Name          | URL                                              |
| -------------------- | ------------------------------------------------ |
| SynkroTech - Sprint  | https://github.com/users/AsolanoT/projects/4     |

## Team Members

| Full Name                          | GitHub User                                                 |
| ----------------------------       | ------------------------------------------                  |
| Sergio Andres Ordoñez Diaz         | https://github.com/SergioAndres17                           |
| Fredman Santiago Plazas Artunduaga | https://github.com/SantiagoPlazas2005                       |
| Jordan Ramirez Gallego             | https://github.com/JordanRG420                              |
| Angel Gustavo Solano Trujillo      |  https://github.com/AsolanoT                                |

## 1. User stories worked on this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-ARQ-001 | Define functional and non-functional requirements for the sales management system and create the preliminary architecture | done | https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/52529468ff56c3625791a0c35281cedaab25828a |
| HU-ADR-02  |  Formalize the Architecture Decision | done | https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/blob/main/02-week/hu-status/adr-001-architecture.md |

## 2. My individual contribution
- I wrote the Decision section of ADR-001, formalizing the initial architecture: 4 independent microservices under hexagonal architecture, each with its own PostgreSQL database.
- I defined Auth (Java/Spring Boot) as the service responsible for issuing and validating JWT (RS256, asymmetric signing) and managing roles.
- I specified Clients (Java/Spring Boot), Products (Go), and Sales (Go) — the latter absorbing Reports as an internal module instead of a standalone service.
- I established the inter-service communication strategy: synchronous REST calls (Sales → Clients, Sales → Products), with local JWT validation via public key in each service, avoiding a call to Auth on every request.

## 3. Blockers and risks
- The public/private key distribution and rotation mechanism for JWT validation across the 3 non-Auth services has not been implemented or tested yet.
- Sales concentrates more responsibility than ideal (orchestrates Clients, Products, and Reports), which could become a bottleneck as the service grows in complexity.
- The synchronous REST communication between services introduces temporal coupling; a Products outage would block Sales creation until a fallback strategy is defined.

## 4. Plan for next week
- Implement and test the JWT public key distribution mechanism between Auth and the other 3 services.
- Define the Port that isolates the Reports module inside Sales (HU-ARQ-01), so it can be extracted independently in the future without breaking other modules.
- Support structuring the `docs` repository with the `adr/`, `architecture/`, and `pdr/` folders agreed on for this sprint.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] HU branch by environment + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Verifiable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (the domain has no I/O)
- [x] No secrets; configuration via environment variables

## 6. Evidence links
- Contribution to Architecture Decision: [`adr-001-architecture.md`](./adr-001-architecture.md)