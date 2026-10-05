<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       09-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 09

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group 10 - synkro-tech
- SPRINT_GOAL: Close HU-13 (contract completion and documentation readiness for the code phase), then deliver HU-14 in full — two database engines (ADR-010), the Angular Customers portal inside the React host (ADR-011), instance bootstrap and credentials (ADR-012), and the identity-as-cross-cutting-service proposal (ADR-013) — with every downstream document realigned, and open the code phase with HU-INF-01.
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
| Angel Gustavo Solano Trujillo      | https://github.com/AsolanoT               |

## 1. User stories worked this week

| HU ID      | Title                                                                 | Status | Evidence (PR or commit URL) |
|------------|------------------------------------------------------------------------|--------|------------------------------|
| HU-DOCS-72 | Rewrite the Auth API contract and align `authentication.md` (HU-13)   | done   | `synkro-auth-api.yaml`, `authentication.md` |
| HU-DOCS-74 | Align the Go and Java stack guides with the project decisions (HU-13) | done   | #143 |
| HU-DOCS-78 | Complete the ⭐ documents of `09-microservices/` and `15-project-control/` (HU-13) | done | #141 |
| HU-ARQ-24  | Spike and ADR-011: Angular Customers portal inside the React host (HU-14) | done   | https://github.com/code-corhuila/synkro-docs/pull/160 |
| HU-ARQ-25  | ADR-012: instance bootstrap, service users and environment files (HU-14) | done | https://github.com/code-corhuila/synkro-docs/pull/162 |
| HU-DOCS-84 | Testing strategy: frontend test-first, MongoDB and mocks (HU-14)      | done   | https://github.com/code-corhuila/synkro-docs/pull/172 |
| HU-DOCS-85 | Frontend stack guide and shared design tokens (HU-14)                 | done   | https://github.com/code-corhuila/synkro-docs/pull/173 |
| HU-INF-01  | Common files in every code repository (Cut 6, first code sprint)      | done   | #164 |

## 2. My individual contribution

**HU-13 — closing contract completion and documentation readiness (HU-DOCS-72, 74, 78):**
- HU-DOCS-72: rewrote `synkro-auth-api.yaml` end to end and aligned `authentication.md` with it — service-token issuance, RBAC per resource, the browser-session note.
- HU-DOCS-74: brought `_stacks/go.md` and `_stacks/java-spring.md` in line with every decision made since they were first written (ADR-008's pinned versions, the hexagonal folder layout as actually used in later guides).
- HU-DOCS-78: filled the remaining ⭐ documents of `09-microservices/` and `15-project-control/` that HU-13's scope carried over from HU-12.

**HU-14 — ADR-011 and ADR-012 (HU-ARQ-24, HU-ARQ-25):**
- HU-ARQ-24: ran the spike validating the Angular custom-element mounting mechanism — loading, mounting, the host's client, and portal isolation all passed; internal routing under the host's base path did **not**, and that gap is recorded as an open risk rather than assumed away. Wrote ADR-011 on the spike's technical-design grounds: which portal is Angular (Customers), the mounting mechanism, the `ShellContract`, and visual consistency through shared CSS custom properties.
- HU-ARQ-25: wrote ADR-012 — the PostgreSQL bootstrap script creates only extensions and login users, never schemas or roles (those stay owned by each `-db`'s own migrations); one fixed-name service user per domain with administrator credentials reserved for bootstrap and migrations only; three environment files (`env/dev.env`, `env/qa.env`, `env/main.env`), never a single shared `.env`.

**HU-14 — downstream documents (HU-DOCS-84, HU-DOCS-85):**
- HU-DOCS-84: `11-quality/testing-strategy.md` had no frontend testing tier at all before this — wrote one from scratch (tools per framework, test doubles, coverage thresholds, what a portal's and the host's tests must cover), extended Tier 2 with MongoDB integration-test examples for Sales, and added the Liquibase rebuild-check pipeline alongside the existing Flyway one.
- HU-DOCS-85: wrote `_stacks/frontend.md`, the project's first frontend stack guide. The course norm's Anexo H only shows a full-React or full-Angular stack; our Angular portal is mounted inside a React host via a custom element (ADR-011 Decision 2), not Native Federation, so the Angular folder structure in this guide is built from our own ADR, not copied from the norm's example.

**Cut 6 — opening the code phase (HU-INF-01):**
- Common files (README, `.gitignore`, `.env.example`, `CODEOWNERS`, PR template, first `ci.yml`) across all 17 code repositories. Found and fixed a stale template artifact while at it: every repository's README and CODEOWNERS still referenced a different course project ("LMS Library" / `library-docs`) from before this repository set was reused — corrected to SynkroTech / `synkro-docs` in the same PRs.

## 3. Blockers and risks

- **`synkro-infra` rename to `synkro-infra-postgres`, and `synkro-infra-mongo`'s creation, both still pending the instructor.** Filed as [#159](https://github.com/code-corhuila/synkro-docs/issues/159); blocks `HU-INF-02` and anything that touches the real MongoDB instance. Tracked as `dependencies.md` and `risks.md` R-007.
- **ADR-011's internal-routing risk is still open.** The spike validated mounting and isolation but not routing under the host's base path; recorded as `risks.md` R-008, and set as an explicit acceptance-criteria item for the portal's first routed screens rather than left implicit.
- **ADR-013 (HU-ARQ-26) is `Proposed`, pending the instructor's answer** on whether `synkro-auth-api` already satisfies the course's cross-cutting security requirement. Does not block HU-14's closure — the story's own deliverable (the record and the question) is complete.
- **Two rounds of automated-review findings on HU-14 PRs** (HU-ARQ-26, HU-DOCS-81, HU-DOCS-86) — all addressed and re-verified in follow-up commits, not just acknowledged. Slowed closure by about a day per PR.

## 4. Plan for next week

- HU-INF-02: infrastructure skeleton and development identity in `synkro-infra-postgres` — blocked on confirming the repository's real current name post-rename, or proceeding under the old name if the instructor hasn't acted yet.
- HU-INF-03: contract-driven simulated services behind the gateway, once HU-INF-02 lands.
- Pick up HU-PRO-03 (base structure of `synkro-products-api`) as the first real backend vertical, since it depends on no pending ADR.
- Review Sergio's and Santiago's contract/document PRs against the two-engine model before they merge.

## 5. Compliance self-check

- [x] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to `main` — branches `docs/rewrite-auth-api-contract`, `docs/align-go-java-stack-guides`, `docs/complete-microservices-and-project-control-docs`, `docs/add-adr-011-angular-customers-portal`, `docs/add-adr-012-instance-bootstrap-and-environments`, `docs/extend-testing-strategy-for-frontend-and-mongodb`, `docs/add-frontend-stack-guide`, and `chore/add-common-repository-files` (17 repositories), merged via PR approved by `ariel5253`
- [x] Testable acceptance criteria
- [x] Tests added/updated — N/A, documentation-only HUs; HU-INF-01 added each repository's first CI job (file-presence check, not application tests)
- [x] DDD / hexagonal boundaries respected — N/A, no application code touched this week
- [x] No secrets; config via environment variables — ADR-012 keeps every credential in an environment file never committed; HU-INF-01's `.env.example` files hold no real values

## 6. Evidence links

- ADR-011 (HU-ARQ-24): [`ADR-011-angular-customers-portal.md`](./docs/ADR-011-angular-customers-portal.md)
- ADR-012 (HU-ARQ-25): [`ADR-012-instance-bootstrap-and-environments.md`](./docs/ADR-012-instance-bootstrap-and-environments.md)
- Frontend testing tier (HU-DOCS-84): [`testing-strategy.md`](./docs/testing-strategy.md)
- Frontend stack guide (HU-DOCS-85): [`_stacks/frontend.md`](./docs/_stacks/frontend.md)
- Shared instance schema per domain: [`ADR-009-shared-instance-schema-per-domain.md`](./docs/ADR-009-shared-instance-schema-per-domain.md)
- Authentication documentation: [`authentication.md`](./docs/authentication.md)
- Container diagram (Draw.io): [`c4-02-containers.drawio`](./docs/c4-02-containers.drawio)
- Container diagram (SVG): [`c4-02-containers.svg`](./docs/c4-02-containers.svg)
- Communication patterns: [`communication-patterns.md`](./docs/communication-patterns.md)
- Data dictionary: [`data-dictionary.md`](./docs/data-dictionary.md)
- Data ownership matrix: [`data-ownership-matrix.md`](./docs/data-ownership-matrix.md)
- README changes record: [`decisions-readme-changes.md`](./docs/decisions-readme-changes.md)
- Dependencies: [`dependencies.md`](./docs/dependencies.md)
- Dependency map: [`dependency-map.md`](./docs/dependency-map.md)
- Design system patch: [`design-system-patch.md`](./docs/design-system-patch.md)
- Diagram index: [`diagram-index.md`](./docs/diagram-index.md)
- Domain map: [`domain-map.md`](./docs/domain-map.md)
- Entities and rules: [`entities-and-rules.md`](./docs/entities-and-rules.md)
- Frontend guide: [`frontend.md`](./docs/frontend.md)
- Go stack guide: [`go.md`](./docs/go.md)
- Hexagonal architecture: [`hexagonal-architecture.md`](./docs/hexagonal-architecture.md)
- Java Spring stack guide: [`java-spring.md`](./docs/java-spring.md)
- Models: [`models.md`](./docs/models.md)
- Navigation map: [`navigation-map.md`](./docs/navigation-map.md)
- Open questions: [`open-questions.md`](./docs/open-questions.md)
- Documentation index: [`README.md`](./docs/README.md)
- Service boundary rules: [`service-boundary-rules.md`](./docs/service-boundary-rules.md)
- Service catalog: [`service-catalog.md`](./docs/service-catalog.md)
- Authentication API contract: [`synkro-auth-api.yaml`](./docs/synkro-auth-api.yaml)
- TDD guide: [`tdd-guide.md`](./docs/tdd-guide.md)
- Common repository files (HU-INF-01): 17 PRs, one per repository, branch `chore/add-common-repository-files`
- Issue tracking the pending instructor rename: https://github.com/code-corhuila/synkro-docs/issues/159
