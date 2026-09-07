<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       04-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 05

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group - synkro-tech
- SPRINT_GOAL: Close the professor's S00/S06/S12 rubric feedback, formally answer the professor's HU-01 (Technology Stack Selection) and HU-02 (Project Discovery) by auditing existing documentation before writing anything new, and deliver the Corte 1 MVP in the dedicated `synkro-tech` repository.
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
| HU-DOCS-22 | `overview.md` refinement: final consolidation and diagram | done | `01-context/overview.md`, "Alternatives Considered" |
| HU-FE-02 | Frontend: configuration and refinement of the monolithic MVP | done | repo `synkro-tech` (frontend) |
| HU-ARQ-08 | QA and merge of the Corte 1 MVP to `main` (with @SergioAndres17) | done | repo `synkro-tech` (`main`) + `docs/12-ux-ui/mvp-synkro-tech/` |

## 2. My individual contribution

**Context:** the professor's HU-02 (Discovery) has 10 tasks across 4
blocks. Before writing anything, I mapped all 10 against the existing repo
and found 7 were already answered elsewhere. Later in the sprint I moved
into closing HU-01's stack consolidation and, at the end, into building
and shipping the Corte 1 frontend.

**HU-DOCS-17 — Market research and HU-02 traceability:**
- Researched two real point-of-sale/inventory products used by SMEs —
  Alegra and Loyverse POS — verifying real figures for each (40,000+
  Colombian SMEs for Alegra; 1M+ businesses in 170 countries for Loyverse)
  rather than estimating them, and added the comparison as section 9 in
  `03-product/problem-framing.md` without touching already-graded content.
- Found `04-requirements/traceability-matrix.md` already exists as a
  template purpose-built for exactly this mapping. Used that file instead
  of creating a new one, adding a dedicated "HU-02 → Repository
  Traceability" section listing all 10 tasks and where each is resolved.

**HU-DOCS-22 — Final stack consolidation and diagram:**
- Consolidated the three subsections written by Fredman (Frontend), Sergio
  (Backend), and Jordan (Database) into a single "Alternatives Considered"
  section in `overview.md`, placed after the already-graded "Technology
  Stack" table without editing it.
- Built the technology architecture diagram in Mermaid, embedded directly
  in the markdown, showing the 4 microservices, PostgreSQL schema
  isolation, and the JWT local-validation pattern from ADR-001.
- Found and fixed a paste error in the already-uploaded Frontend
  subsection (a stray table row instead of the real text) before closing
  this HU.

**HU-FE-02 — Frontend configuration (Corte 1 MVP):**
- Replaced `tokens.css` with the Crimson Circuit light theme approved in
  `design-system.md` — full token set (primary scale, semantic colors,
  typography, radii, shadows).
- Switched typography to Big Shoulders Display (h1/h2, weight 900,
  uppercase) and IBM Plex Sans (body), loaded via Google Fonts.
- Updated the login screen's radial gradient to the new primary red, and
  verified with a repo-wide search that no hardcoded color from the old
  blue/copper palette remained anywhere in the codebase.
- Aligned the frontend's customer fields with Sergio's `identity_document`
  rename on the backend.
- One known, non-blocking defect: the sidebar/login logo's CSS rule wasn't
  fully updated for an `<img>` element (still sized/styled like the old
  text-box placeholder), so it currently renders slightly distorted.
  Tracked as an immediate follow-up fix, not a merge blocker.

**HU-ARQ-08 — QA and merge to `main` (joint with Sergio):**
- Validated `develop → qa → main`: full customer/product/category/sales
  CRUD, sale registration with stock validation, role-based navigation for
  all 3 roles, soft delete throughout.
- After merging, synced the final backend + frontend into
  `docs/12-ux-ui/mvp-synkro-tech/` per the professor's instruction — the
  project has no `05-release/` folder, so this is the actual delivery
  location, not a GitHub Release.

## 3. Blockers and risks

- The logo CSS defect noted above needs a quick fix (`.brand-mark` sized
  and styled for an image, not a text box) before the next visual review —
  scheduled as the first thing to fix next session, in both `synkro-tech`
  and its synced copy in `docs`.
- Corte 1's Authentication (simulated login) and Sales Reports (not
  populated) are explicitly documented as pending full-MVP scope in
  `scope.md` — not gaps in this delivery, but real work for a later Corte.

## 4. Plan for next week

- Apply the logo CSS fix and re-sync `12-ux-ui/mvp-synkro-tech/`.
- Publish the team's consolidated response to HU-01, HU-02, and HU-03 in
  the professor's GitHub issues, with links to the verified evidence.
- Confirm with the whole team, in the Weekly, that everyone knows and
  validates the consolidated stack in `overview.md` — the one acceptance
  criterion that needs a live confirmation, not just a commit.

## 5. Compliance self-check
- [x] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to that environment — `develop → qa → main` followed in `synkro-tech`; direct commit to `main` for `docs` per `documentation-rules.md`
- [x] Testable acceptance criteria
- [x] Tests added/updated (unit / integration)
- [x] DDD / hexagonal boundaries respected (domain has no I/O) — not applicable to this Corte 1 monolith spike; hexagonal boundaries are ADR-001's target-architecture scope
- [x] No secrets; config via environment variables

## 6. Evidence links
- Market research: [`problem-framing.md`](./docs/problem-framing.md), section 9
- HU-02 traceability: [`traceability-matrix.md`](./docs/traceability-matrix.md), "HU-02 (Discovery) → Repository Traceability"
- Stack consolidation and diagram: [`overview.md`](./docs/overview.md), "Alternatives Considered"
- Corte 1 MVP frontend: [`synkro-tech`](https://github.com/code-corhuila/synkro-tech) (`main`)