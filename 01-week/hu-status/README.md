
# Weekly status - Week 01

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group - SynkroTech SAS
- SPRINT_GOAL: Convert the sales management product brief into a set of functional and non-functional requirements and a preliminary hexagonal microservices architecture (Clients, Products, Sales, Reports).
<!-- CONFIG-END -->

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
| HU-PDR-001 | Define functional and non-functional requirements for the sales management system and create the preliminary architecture | done | https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/blob/main/01-week/hu-status/pdr.md |

## 2. My individual contribution
- I wrote the Requirements section (RF-01 to RF-10, RNF-01 to RNF-07) covering clients, products, sales, reports, and JWT authentication for the sales management system.
- I defined the preliminary architecture: 4 independent microservices (Clients and Sales in Java/Spring Boot, Products and Reports in Go), each with its own PostgreSQL database, exposed through a React frontend.
- I specified the hexagonal layer scheme (Ports and Adapters) to apply within each microservice: domain, application (use cases/ports), and infrastructure (REST controllers, PostgreSQL repositories, HTTP clients).
- I described the service communication strategy: synchronous REST/HTTP for the initial phase (Sales → Clients, Sales → Products, Reports → Sales).

## 3. Blockers and risks
- There is not yet a shared folder template (domain/application/infrastructure) for Java and Go, so consistency across services is not guaranteed until it is defined.
- The choice between synchronous HTTP calls and event-based communication for the Reports service is still pending and depends on available time after the main services are running.

## 4. Plan for next week
- Agree on and publish the base hexagonal folder template for Java (Spring Boot) and Go.
- Configure repositories for the 4 services and their databases.
- Start implementing the Clients service (domain + basic CRUD), since it has the lowest risk.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] HU branch by environment + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Verifiable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (the domain has no I/O)
- [x] No secrets; configuration via environment variables

## 6. Evidence links
- Contribution to Requirements and Architecture: [`pdr.md`](./pdr.md)