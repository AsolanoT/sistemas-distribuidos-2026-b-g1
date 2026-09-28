<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       08-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 08

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group 10 - synkro-tech
- SPRINT_GOAL: Close HU-08 (professor review feedback) and HU-09 (first version of the API contracts), and replace the architecture decisions that no longer held — shared database instance, gateway-only token validation, stateless saga, broker without a real consumer, undecided cross-cutting stack — through ADR-005 to ADR-008, rewriting every dependent document (HU-10).
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
| Angel Gustavo Solano Trujillo      |  https://github.com/AsolanoT              |

## 1. User stories worked this week

| HU ID      | Title                                                        | Status | Evidence (PR or commit URL)                                                                       |
|------------|---------------------------------------------------------------|--------|---------------------------------------------------------------------------------------------------|
| HU-DOCS-32 | Governance corrections and `user-stories.md` catch-up (HU-08) | done   | https://github.com/code-corhuila/synkro-docs/pull/38 |
| HU-DOCS-34 | Stale week/status references in `01-context/` and `03-product/` (HU-08) | done   | https://github.com/code-corhuila/synkro-docs/pull/40 |
| HU-ARQ-16  | Java example moved to an appendix in `hexagonal-architecture.md` (HU-08) | done   | https://github.com/code-corhuila/synkro-docs/pull/58 |
| HU-DOCS-35 | REST guidelines and authentication strategy (HU-09)           | done   | https://github.com/code-corhuila/synkro-docs/pull/48 |
| HU-DOCS-36 | OpenAPI contracts: `_shared.yaml` and auth (HU-09)            | done   | https://github.com/code-corhuila/synkro-docs/pull/49 |
| HU-DOCS-42 | ADR-004: API contract extensions (HU-09, with Jordan)         | done   | https://github.com/code-corhuila/synkro-docs/pull/57 |
| HU-ARQ-17  | Dominant criterion and accepted cost in the ADR template; decision register filled (HU-10) | done   | `05-architecture/decisions/_template-adr.md`, `05-architecture/decisions/README.md` |
| HU-ARQ-19  | ADR-006: token validation in every service and service credentials (HU-10) | done   | `05-architecture/decisions/records/ADR-006-token-validation-per-service.md` |
| HU-ARQ-21  | ADR-008: technology stack of the cross-cutting repositories (HU-10) | done   | https://github.com/code-corhuila/synkro-docs/pull/82 |
| HU-DOCS-48 | Security policy, authentication strategy and security rules (HU-10) | done   | `07-api/authentication.md`, `00-governance/security-policy.md`, `00-governance/security-rules.md` |
| HU-DOCS-50 | `cross-cutting.md` realignment (HU-10)                        | done   | `05-architecture/cross-cutting.md`, `07-api/guidelines.md` |

## 2. My individual contribution

**HU-08 — closing the professor's review feedback (HU-DOCS-32, HU-DOCS-34, HU-ARQ-16):**
- HU-DOCS-32: applied 3 governance corrections and brought `04-requirements/user-stories.md` up to date — no HU since week 5 had been reflected there.
- HU-DOCS-34: removed stale week and status references from `01-context/` and `03-product/`.
- HU-ARQ-16: moved the Java comparison example of `hexagonal-architecture.md` into its own appendix and cross-referenced `_stacks/java-spring.md` and `_stacks/go.md`.
- Wrote the HU-08 closing comment, assigning every automated-review finding to HU-10, HU-11 or HU-12 so each one has a traceable answer.

**HU-09 — first version of the API contracts (HU-DOCS-35, HU-DOCS-36, HU-DOCS-42):**
- HU-DOCS-35: wrote `07-api/guidelines.md` (naming, pagination, standard responses, error format) and `07-api/authentication.md`.
- HU-DOCS-36: wrote `_shared.yaml` (error envelope, pagination parameters, security scheme) and the auth contract.
- HU-DOCS-42 (with Jordan): drafted ADR-004 as `Proposed`, recording the endpoint gaps found while writing the contracts (customer search, categories, date filters on reports).

**HU-10 — architecture decisions (HU-ARQ-17, HU-ARQ-19, HU-ARQ-21):**
- HU-ARQ-17: added **Dominant criterion** and **Accepted cost** to `_template-adr.md`, required at least two real options, and filled the decision register, which said "None yet".
- HU-ARQ-19: authored ADR-006. Every service validates the RS256 token itself and the gateway only checks that a credential is present; the workflow and the worker call other services with scoped service tokens; identity comes from token claims, never from `X-User-*` headers.
- HU-ARQ-21: authored ADR-008 (NGINX gateway, Java 21 + Spring Boot 3.5 workflow, Go worker, React 19 + Module Federation frontend, pinned versions). Addressed the automated review in follow-up commits: moved ADR-007 to its correct folder (a 100% rename), fixed two constraint citations, and added a **Builds on / Context** column to the register so "modifies" and "builds on" no longer share one cell.

**HU-10 — dependent documents (HU-DOCS-48, HU-DOCS-50):**
- HU-DOCS-48: rewrote `authentication.md` (per-service validation, service tokens, browser session, authorization per resource) and aligned `security-policy.md` and `security-rules.md`, removing the `httpOnly` cookie line that contradicted CORS.
- HU-DOCS-50: realigned `cross-cutting.md` — `X-Correlation-Id`, health checks on own dependencies only, public key for every validating service, CORS only at the gateway, and a new section of explicit limits and retries. After the automated review, brought the error section of `guidelines.md` into the same PR so both documents share a single, closed error catalog.

## 3. Blockers and risks

- **No microservice code yet, with the Corte 2 release due in week 10.** The architecture had to be fixed first so the code would not be built on decisions about to change. Raised with the product owner; recorded as R-001 in HU-DOCS-64.
- **Approval latency on `main`.** Every documentation PR needs the professor's approval, and several of this week's PRs depend on each other through the ADR register, so they had to be merged in order.
- **Automated review findings keep arriving after approval.** Each one is answered in the PR itself (applied, or not applied with a reason), because the defense asks what was done with every finding.
- **One PR over the 400-line limit (HU-DOCS-43, owned by Sergio),** kept whole by team decision because its three files describe one indivisible domain change. Documented as a reasoned exception in the HU-10 closing comment.

## 4. Plan for next week

- HU-11 — API contracts:
  - HU-DOCS-53: common contract (`guidelines.md` and `_shared.yaml`).
  - HU-DOCS-54: extend and accept ADR-004.
  - HU-DOCS-55 and HU-DOCS-74: the `synkro-auth-api` contract and service-token issuance.
- HU-12 — HU-DOCS-61: adopt the component naming convention and rename the contract files. It goes first, so the HU-11 contract PRs show only content changes.
- Review the other members' HU-11 contracts against the common contract and ADR-004.

## 5. Compliance self-check

- [x] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to `main` — branches `docs/governance-corrections-and-backlog-catchup`, `docs/update-stale-status-context-and-vision`, `docs/separate-java-appendix-hexagonal-architecture`, `docs/add-rest-guidelines-and-auth-strategy`, `docs/add-shared-and-auth-openapi-contracts`, `docs/add-adr-004-api-contract-extensions`, `docs/add-dominant-criterion-to-adr-template`, `docs/add-adr-006-token-validation-per-service`, `docs/add-adr-008-cross-cutting-stack`, `docs/align-security-docs-with-per-service-validation` and `docs/realign-cross-cutting-concerns`, merged via PR approved by `ariel5253`
- [x] Testable acceptance criteria
- [x] Tests added/updated — N/A, documentation-only HU
- [x] DDD / hexagonal boundaries respected — N/A, no code touched this week
- [x] No secrets; config via environment variables — ADR-006 keeps the private key only in `synkro-auth-api` and service tokens as environment secrets

## 6. Evidence links

- ADR template and register (HU-ARQ-17): [`README.md`](./docs/README.md), [`_template-adr.md`](./docs/_template-adr.md)
- ADR-006 (HU-ARQ-19): [`ADR-006-token-validation-per-service.md`](./docs/ADR-006-token-validation-per-service.md)
- ADR-008 (HU-ARQ-21): [`ADR-008-cross-cutting-stack.md`](./docs/ADR-008-cross-cutting-stack.md)
- Authentication strategy (HU-DOCS-48): [`authentication.md`](./docs/authentication.md)
- Security policy (HU-DOCS-48): [`security-policy.md`](./docs/security-policy.md)
- Cross-cutting concerns (HU-DOCS-50): [`cross-cutting.md`](./docs/cross-cutting.md)
- REST guidelines (HU-DOCS-35, HU-DOCS-50): [`guidelines.md`](./docs/guidelines.md)
