<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       06-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 06

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group - synkro-tech
- SPRINT_GOAL: Close the architecture documentation gap in `05-architecture/` by delivering HU-04 (ADR-001 publication, architectural overview, distributed-pattern evaluation, deployment topology, security threat model, and ADR-002 for sale-authorship traceability), and begin HU-05 (unify FR/NFR requirement identifiers and disconnect the repository from the external PDR).
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

## 1. User stories worked this week

| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-ARQ-09 | Publish ADR-001 into the docs repository | done | `05-architecture/decisions/records/ADR-001-architecture.md` |
| HU-ARQ-12 | Document deployment and the security threat model | done | `05-architecture/deployment.md`, `05-architecture/security-threat-model.md` |
| HU-ARQ-13 | Write ADR-002 — sale authorship traceability (joint with @SergioAndres17) | done | `05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md` |

## 2. My individual contribution

**Context:** HU-04 groups the whole `05-architecture/` folder, which had
been sitting as the professor's unfilled template since week 3. I took
the three sub-issues that close the decision-record and infrastructure
side of that gap: publishing the already-accepted ADR-001, documenting
how the system actually runs, and opening ADR-002 to fix a permission
gap ADR-001 left open.

**HU-ARQ-09 — Publish ADR-001:**
- Transcribed the team's already-accepted ADR-001 verbatim into
  `05-architecture/decisions/records/ADR-001-architecture.md` — the exact
  path `01-context/overview.md` and `01-context/scope.md` were already
  pointing to, so both links resolve with no further edits.
- Replaced the external `.jpg` diagram with an embedded Mermaid diagram
  (3 layers: frontend, microservices, PostgreSQL schemas), so the
  architecture diagram renders directly from the repository instead of
  depending on a file outside it.
- Adapted the document to the governance-required ADR structure (metadata
  table, Evaluated Alternatives with Pros/Cons, Mitigation subsection)
  without altering any decision from the original.

**HU-ARQ-12 — Deployment and threat model:**
- Resolved the migration-ownership ambiguity ADR-001 left open: the
  `database` repository owns schema/user/GRANT creation (one-time init
  script); each service owns its own table migrations (Flyway for Java,
  golang-migrate for Go). Documented in `deployment.md` §3.
- Wrote the full `docker-compose.yml` + SQL init script for the 4
  database users with schema-level `GRANT`s and explicit cross-schema
  `REVOKE`, plus the verification command to prove isolation actually
  holds.
- Applied STRIDE to the JWT authentication flow in
  `security-threat-model.md`: 19 threats across the 6 categories, 15
  designed at the time of writing, 2 explicitly tied to the
  `sales.created_by` gap (see ADR-002 below), 2 accepted as residual risk
  given the academic scope (no API Gateway, single PostgreSQL instance).

**HU-ARQ-13 — ADR-002 (joint with Sergio):**
- Co-authored ADR-002 to close the gap the threat model surfaced: the
  `sales` table had no field identifying who registered a sale, making
  the SALESPERSON role's "own sales" permission from ADR-001 §6
  unimplementable.
- Evaluated two alternatives — a single `created_by` column vs. a
  cross-cutting audit table — and adopted the column for the MVP,
  recording the audit table as a future candidate.
- Propagated the change to every downstream document in the same
  delivery: `06-data/models.md` (DDL + ER diagram), `data-dictionary.md`
  (new field entry), `entities-and-rules.md` (attribute + invariant), and
  `security-threat-model.md` (R-3 and I-4 moved from Pending to Designed).

## 3. Blockers and risks

- ADR-002 only resolves authorship for sale creation. Operations in the
  other 3 services (customer/product create-update-deactivate) still rely
  solely on structured logs, not a persisted `created_by`-equivalent
  field — flagged in ADR-002's Consequences as accepted scope, not hidden.
- The deployment guide assumes local Docker for all 4 services and
  PostgreSQL on the same machine; it does not yet cover a multi-machine
  or CI environment, which is out of scope until `10-devops/` is filled.

## 4. Plan for next week

- Start HU-05 (`HU-DOCS-24` through `HU-DOCS-27`) jointly with Jordan and
  Santiago: unify `RF/RNF` into `FR/NFR`, create the canonical
  `04-requirements/functional.md`, and remove every remaining reference
  to the external PDR from the repository.
- Verify with the whole team, in the Weekly, that the ADR-002 authorship
  decision is understood before it lands in any service's implementation.

## 5. Compliance self-check
- [x] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to that environment — N/A: direct commit to `main` for `docs` per `documentation-rules.md` (no branches in this repo)
- [x] Testable acceptance criteria
- [x] Tests added/updated (unit / integration) — N/A, documentation-only HU
- [x] DDD / hexagonal boundaries respected (domain has no I/O) — N/A, no code touched this week
- [x] No secrets; config via environment variables — deployment.md documents `JWT_PUBLIC_KEY` and DB credentials as env vars only, no real secrets committed

## 6. Evidence links
- ADR-001 publication: [`ADR-001-architecture.md`](./05-architecture/decisions/records/ADR-001-architecture.md)
- Deployment topology: [`deployment.md`](./05-architecture/deployment.md)
- Security threat model: [`security-threat-model.md`](./05-architecture/security-threat-model.md)
- ADR-002: [`ADR-002-sale-authorship-traceability.md`](./05-architecture/decisions/records/ADR-002-sale-authorship-traceability.md)