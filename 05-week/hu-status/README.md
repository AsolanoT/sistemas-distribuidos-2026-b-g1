<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       04-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 05

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group - synkro-tech
- SPRINT_GOAL: Close the professor's S00/S06/S12 rubric feedback, formally answer the professor's HU-01 (Technology Stack Selection) and HU-02 (Project Discovery) by auditing existing documentation before writing anything new, and open the Corte 1 MVP build in the dedicated `synkro-tech` repository.
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
| HU-DOCS-17 | Discovery: market research + HU-02 traceability | done | `03-product/problem-framing.md`, `04-requirements/traceability-matrix.md` |
| HU-DOCS-22 | `overview.md` refinement: final consolidation and diagram | doing | `01-context/overview.md`, "Alternatives Considered" |
| HU-FE-02 | Frontend: configuration and refinement of the monolithic MVP | todo | repo `synkro-tech` (frontend) |

## 2. My individual contribution

**Context:** the professor's HU-02 (Discovery) has 10 tasks across 4
blocks. Before writing anything, I mapped all 10 against the existing repo
and found 7 were already answered elsewhere — this HU only had to produce
what genuinely didn't exist yet, plus the evidence trail for the rest.

**HU-DOCS-17 — Market research and HU-02 traceability:**
- I researched two real point-of-sale/inventory products used by SMEs —
  Alegra and Loyverse POS — verifying real figures for each (40,000+
  Colombian SMEs for Alegra; 1M+ businesses in 170 countries for Loyverse)
  rather than estimating them, and added the comparison as a new section 9
  in `03-product/problem-framing.md` without touching the sections the
  professor already graded.
- For the traceability requirement, I found `04-requirements/traceability-matrix.md`
  already exists as a template purpose-built for exactly this kind of
  mapping (requirement → evidence). I used that file instead of creating a
  new one, adding a dedicated "HU-02 → Repository Traceability" section
  listing all 10 tasks and where each is already resolved.
- Conclusion from the market research: neither product organizes
  permissions around SynkroTech's strict 3-role model (ADMIN, SALESPERSON,
  INVENTORY), and neither needs to solve the 4-microservice architecture
  problem that's this project's actual academic goal — the business
  problem is already market-validated, what this project adds is the
  distributed-architecture "how."

**HU-DOCS-22 — Final stack consolidation and diagram (in progress):**
- I consolidated the three subsections written by Fredman (Frontend),
  Sergio (Backend), and Jordan (Database) into a single "Alternatives
  Considered" section, placed immediately after `overview.md`'s existing
  "Technology Stack" table — without editing that table, since it's
  already graded 🟢.
- I built the technology architecture diagram in Mermaid, embedded
  directly in the markdown so it renders natively on GitHub without an
  external image file, showing the 4 microservices, PostgreSQL schema
  isolation, and the JWT local-validation pattern from ADR-001.
- While reviewing what's already uploaded, I found a paste error: the
  Frontend subsection currently shows a stray table row instead of the
  actual text. This is now the main open item on this HU before it can be
  marked done.

## 3. Blockers and risks

- The `overview.md` Frontend-subsection paste error needs fixing before
  the professor reviews HU-01's response — I'm treating this as the
  priority open item for next session, ahead of anything else on
  HU-DOCS-22.
- HU-FE-02 hasn't started; it depends on Sergio's HU-ARQ-07 backend
  configuration and on Fredman's Figma wireframes (HU-DOCS-18) being far
  enough along to build real screens against, not just descriptions.

## 4. Plan for next week

- Fix the Frontend subsection in `overview.md` and close HU-DOCS-22.
- Start HU-FE-02 once HU-ARQ-07 has a running backend to connect to;
  implement the light theme only from `design-system.md` (Crimson
  Circuit), leaving dark theme for Corte 2 as already agreed with Jordan.
- Confirm with the whole team, in the Weekly, that everyone knows and
  validates the consolidated stack documented in `overview.md` — that's
  an explicit acceptance criterion of HU-DOCS-22, not something I can
  check off alone.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to that environment — not applicable to `docs` repo (no branches, direct commit to `main` per `documentation-rules.md`)
- [x] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration) — not applicable, documentation-only HUs
- [ ] DDD / hexagonal boundaries respected (domain has no I/O) — not applicable, documentation-only HUs
- [x] No secrets; config via environment variables

## 6. Evidence links
- Market research: [`problem-framing.md`](./docs/problem-framing.md), section 9
- HU-02 traceability: [`traceability-matrix.md`](./docs/traceability-matrix.md), "HU-02 (Discovery) → Repository Traceability"
- Stack consolidation and diagram (in progress): [`overview.md`](./docs/overview.md), "Alternatives Considered"