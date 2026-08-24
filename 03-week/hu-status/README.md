<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       03-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 03

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group - synkro-tech
- SPRINT_GOAL: Correct the PDR and ADR-001 to align with the actual course requirements (business-only PDR, single logical database, explicit context map) before starting the docs repository.
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
| HU-PDR-06 | Correct section 01 - Needs and problems (functional/non-functional requirements) in the business PDR | done | https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/blob/main/03-week/hu-status/docs/01_PDR_negocio_v2.md |
| HU-ADR-06 (B) | Correct ADR-001: move from 4 independent databases to a single logical database with one schema per service | done | https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/blob/main/03-week/hu-status/docs/adr-001-architecture_v2.md |

## 2. My individual contribution

**Context for the correction:** the team's decision was to move from 4 physically independent PostgreSQL databases to a single logical database shared by the 4 microservices, given that a shared infrastructure with strict logical isolation (one schema per service, one dedicated database user per service) better fits the current scale of the project without adding unnecessary operational overhead. We also reviewed the business PDR and found it mixed technical architecture content (microservices, hexagonal layers, data model, APIs) into what should be a preliminary business discovery document — the PDR should only contain business context, needs, expected processes, open questions and a business glossary. 

- I corrected section **01 — Necesidades y problemas** of the business PDR, keeping only the functional requirements (RF-01 to RF-10) and non-functional requirements (RNF-01 to RNF-07), removing the technical architecture content that used to be mixed into the same document (that content now lives exclusively in the ADR).
- I rewrote the **Decision** section of ADR-001 to reflect the corrected architecture: a single physical PostgreSQL instance (`synkrotech_db`) with one independent schema per microservice (`auth`, `clientes`, `productos`, `ventas`), instead of 4 separate databases.
- I documented the isolation mechanism that keeps this a real microservices setup and not a data monolith: a dedicated database user per service (`auth_user`, `clientes_user`, `productos_user`, `ventas_user`) with `GRANT` permissions scoped only to its own schema, independent migrations per service, and no real foreign keys across schemas (`cliente_id` and `producto_id` in Ventas are still validated via API calls).
- Together with Fredman Santiago, I updated the "Alternativas consideradas" and "Consecuencias" sections of the ADR to reflect the new decision (adding the rejected alternative of 4 separate databases, and the new negative consequence of a single point of failure at the database instance level).

## 3. Blockers and risks
- The database permission model (`GRANT` per schema/user) is documented but not yet implemented or tested against a real PostgreSQL instance — there is a risk that a misconfiguration silently breaks the intended isolation between services.
- The `docs` repository structure (folders for `pdr/`, `architecture/`, `adr/`) has not been created yet, so the corrected documents currently only exist as loose files, not organized in their final location.

## 4. Plan for next week
- Write the base hexagonal folder template for Java (Auth, Clientes) and Go (Productos, Ventas), reflecting the single-schema-per-service connection pattern.
- Start configuring the single PostgreSQL instance with the 4 schemas and their dedicated users, to validate the isolation mechanism described in the ADR.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

## 6. Evidence links
- Corrected business PDR: [`01_PDR_negocio_v2.md`](./docs/01_PDR_negocio_v2.md)
- Corrected ADR-001 (single logical database): [`adr-001-architecture_v2.md`](./docs/adr-001-architecture_v2.md)