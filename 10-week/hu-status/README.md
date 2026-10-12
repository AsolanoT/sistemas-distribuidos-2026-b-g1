<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       10-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 10

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group 10 - synkro-tech
- SPRINT_GOAL: Open the gateway's public auth routes end to end, close synkro-front and the Products portal (list, registration form, stock views and deployment), land synkro-auth-db's Flyway skeleton and synkro-auth-api's real RS256 token issuance, and settle ADR-014 (admin registration) together with its downstream documentation debt.
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
| HU-INF-01  | Common files (README, CI, PR template) across the 17 code repositories | done   | https://github.com/code-corhuila/synkro-docs/issues/164 |
| HU-GTW-01  | Gateway routes, credential check, rate limiting, CORS, correlation, upstream-down tolerance | done | https://github.com/code-corhuila/synkro-docs/issues/182 |
| HU-CLI-01  | Base structure of `synkro-customers-api` (3 Maven modules + `/health` + default filter) | done | https://github.com/code-corhuila/synkro-docs/issues/187 |
| HU-WKF-01  | Base structure of `synkro-workflow` (3 Maven modules + `/health` + default filter) | done | https://github.com/code-corhuila/synkro-docs/issues/185 |
| HU-AUTH-02 | `synkro-auth-db` Flyway skeleton: schema + role, no tables yet | done | https://github.com/code-corhuila/synkro-docs/issues/196 |
| HU-AUTH-03 | `synkro-auth-api` issues real RS256-signed tokens (Auth side only) | done | https://github.com/code-corhuila/synkro-docs/issues/197 |
| HU-FE-05   | Host's single HTTP client: `query`, `idempotencyKey`, caller-driven cancellation, fake body and protected headers | done | https://github.com/code-corhuila/synkro-docs/issues/201 |
| HU-FE-06   | Host: design tokens, shared React, per-route role guard, 404, Spanish UI, styled dev sign-in, CI and deployment files | done | https://github.com/code-corhuila/synkro-docs/issues/203 |
| HU-PRO-11  | Base structure of `synkro-products-portal`: Module Federation remote, single HTTP client, registration in `synkro-front`, CI, failure-isolation test | done | https://github.com/code-corhuila/synkro-docs/issues/200 |
| HU-PRO-01  | Products portal: list products with filters, pagination, four states, latest-request-wins | done | https://github.com/code-corhuila/synkro-docs/issues/202 |
| HU-PRO-02  | Products portal: register a product from the list (embedded form, price in minor units, idempotency, design-token styling) | done | https://github.com/code-corhuila/synkro-docs/issues/205 |
| HU-PRO-13  | Products portal: apply the design system to the list (summary cards, badge table, skeleton, states, filters), fully in Spanish | done | https://github.com/code-corhuila/synkro-docs/issues/204 |
| HU-PRO-12  | Products portal: catalogue/category management, stock adjustment, stock lookup, stock alerts, "Low stock" view, screen navigation, container deployment | done | https://github.com/code-corhuila/synkro-docs/issues/206 |
| HU-ARQ-27  | ADR-014: ADMIN-controlled registration + initial-admin creation with explicit mutual exclusion | done | branch: `docs/define-admin-registration-and-initial-admin` |
| HU-DOCS-91 | Reconcile ADR-014 documentation tracking and the user-story catalog | done | branch: `docs/align-auth-registration-contracts` |
| HU-DOCS-92 | Align login ownership in `synkro-auth-portal`; document the host-managed session cycle (proactive renewal, tab-resume check, per-operation error handling) | done | branch: `docs/align-frontend-session-and-login-docs` |
| HU-DOCS-93 | Inventory and fix remaining Auth documentation inconsistencies (excluding frontend session and ADR-014 content) | done | branch: `docs/clear-auth-documentation-debt` |
| HU-GTW-02  | Gateway: `/api/v1/auth/login` and `/api/v1/auth/refresh` public, rest of Auth protected, per-route rate limits, CORS/correlation/upstream-error handling preserved | done | branch: `feat/routes-and-gateway-behavior` (merged to `develop`; closes #231 pending) |

> Rows marked `branch:` don't have a merged PR link yet — replace with the real PR URL before upload.

## 2. My individual contribution

**Common foundations and gateway (HU-INF-01, HU-GTW-01, HU-GTW-02):**
- HU-INF-01: rolled out the common file set (README, CI, PR template, `.gitignore`, `.env.example`) across all 17 code repositories, the baseline every other HU this sprint builds on.
- HU-GTW-01: implemented the gateway's own cross-cutting behavior — route table, credential check, rate limiting, CORS, request correlation, and graceful handling of a downed upstream.
- HU-GTW-02: opened `login` and `refresh` as the only unauthenticated Auth routes, kept every other Auth operation behind the credential check, and applied a tighter rate limit to login than to refresh, without weakening CORS, correlation or upstream-error handling.

**Base structures and Auth foundations (HU-CLI-01, HU-WKF-01, HU-AUTH-02, HU-AUTH-03):**
- HU-CLI-01 and HU-WKF-01: stood up the standard 3-module Maven skeleton, `/health` and the default filter for Customers and Workflow, matching the structure already agreed for the Java services.
- HU-AUTH-02: created `synkro-auth-db`'s Flyway skeleton — schema and role only, no tables, so `synkro-auth-api` has something real to connect to before AUTH-04/05/06 land the schema.
- HU-AUTH-03: wired real RS256 token issuance on the Auth side, the piece every other service's token validation (HU-AUTH-07, Santiago) depends on.

**`synkro-front` and the Products portal (HU-FE-05, HU-FE-06, HU-PRO-11, HU-PRO-01, HU-PRO-02, HU-PRO-13, HU-PRO-12):**
- HU-FE-05: built the host's single HTTP client — query-parameter handling, idempotency keys, cancellation owned by the caller, and protection against a forged body or headers.
- HU-FE-06: finished the host shell itself — design tokens, shared React, a role guard per route, a 404 page, Spanish-language UI, a styled development sign-in, CI and the deployment files.
- HU-PRO-11 through HU-PRO-12: took the Products portal from its Module Federation skeleton to a complete feature — list with filters/pagination/four states, product registration, the full design system applied to the list, and finally catalogue, category, stock and alert management with navigation and a containerized deployment.

**ADR-014 and Auth documentation (HU-ARQ-27, HU-DOCS-91, HU-DOCS-92, HU-DOCS-93):**
- HU-ARQ-27: wrote ADR-014 on admin registration — ADMIN-only creation, and the initial-admin bootstrap guarded by an explicit mutual-exclusion mechanism (a unique constraint or lock, not just "run inside a transaction").
- HU-DOCS-91 through HU-DOCS-93: reconciled every downstream document against ADR-014, aligned the frontend session/login ownership story, and closed out the remaining Auth documentation debt with a concrete per-file inventory.

## 3. Blockers and risks

- **ADR-014's mutual-exclusion mechanism is a design decision, not yet code.** HU-AUTH-13/14 (Jordan) implement the advisory-lock approach it calls for; until that lands, the admin-registration flow described in the ADR isn't exercised against a real database.
- **HU-GTW-02 depends on HU-AUTH-03 being correct in practice.** The gateway's public/protected split was validated against real RS256 tokens, but full end-to-end coverage (gateway → Auth → protected route) still needs AUTH-07 through AUTH-11 (Santiago) on the Auth side.
- **The Products portal (HU-PRO-12/13) is coupled to the Products API's stock endpoints (HU-PRO-09/10, Jordan).** Any contract change there has to be re-synced against the portal's screens.
- **Issue #231 (gateway public-route closure) is still open**, pending final sign-off even though the implementation already merged to `develop`.

## 4. Plan for next week

- Verify HU-AUTH-13/14's advisory-lock implementation against ADR-014 once Jordan's PRs are up, and close out #231.
- Extend gateway rate limiting to the service-token endpoints (HU-AUTH-11) now that they exist.
- Start the base structure of the Sales portal once HU-VEN-09's endpoints (Jordan) are stable.
- Re-review the Products API contract changes from HU-DOCS-90 (Jordan) against the deployed Products portal.

## 5. Compliance self-check

- [x] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to `main`, approved by `ariel5253`
- [x] Testable acceptance criteria
- [x] Tests added/updated — CI checks (HU-INF-01), failure-isolation test (HU-PRO-11); documentation-only HUs (ARQ-27, DOCS-91/92/93) carry no tests
- [x] DDD / hexagonal boundaries respected — N/A for the Java/Go base-structure and portal HUs this week; domain untouched
- [x] No secrets; config via environment variables — `.env.example` files hold no real values; RS256 key material stays out of commits

## 6. Evidence links

- ADR-014: `docs/ADR-014-admin-registration-and-initial-admin.md`
- Gateway routing and behavior: `synkro-api-gateway` (branch `feat/routes-and-gateway-behavior`)
- Host HTTP client and shell: `synkro-front`
- Products portal: `synkro-products-portal`
- `synkro-auth-db` Flyway skeleton: `synkro-auth-db` (branch `feat/migration-skeleton`)
- `synkro-auth-api` RS256 issuance: `synkro-auth-api` (branch `feat/real-rs256-token-issuance`)
- Common repository files (HU-INF-01): 17 PRs, one per repository, branch `chore/add-common-repository-files`
- Open issue tracking GTW-02 closure: https://github.com/code-corhuila/synkro-docs/issues/231
- 5-README: [`5-README.md`](./docs/5-README.md)
- 13-README: [`13-README.md`](./docs/13-README.md)
- ADR-014 admin-only registration and initial administrator: [`ADR-014-admin-only-registration-and-initial-administrator.md`](./docs/ADR-014-admin-only-registration-and-initial-administrator.md)
- Agile conventions: [`agile-conventions.md`](./docs/agile-conventions.md)
- Authentication: [`authentication.md`](./docs/authentication.md)
- Data dictionary: [`data-dictionary.md`](./docs/data-dictionary.md)
- Deployment: [`deployment.md`](./docs/deployment.md)
- Documentation verification: [`documentation-verification.md`](./docs/documentation-verification.md)
- Entities and rules: [`entities-and-rules.md`](./docs/entities-and-rules.md)
- Frontend: [`frontend.md`](./docs/frontend.md)
- Guidelines: [`guidelines.md`](./docs/guidelines.md)
- Initial administrator initialization: [`initial-administrator-initialization.md`](./docs/initial-administrator-initialization.md)
- Models: [`models.md`](./docs/models.md)
- Navigation map: [`navigation-map.md`](./docs/navigation-map.md)
- Observability: [`observability.md`](./docs/observability.md)
- Security policy: [`security-policy.md`](./docs/security-policy.md)
- Security threat model: [`security-threat-model.md`](./docs/security-threat-model.md)
- Synkro auth API: [`synkro-auth-api.yaml`](./docs/synkro-auth-api.yaml)
- Technical backlog: [`technical-backlog.md`](./docs/technical-backlog.md)
- Testing strategy: [`testing-strategy.md`](./docs/testing-strategy.md)
- Traceability matrix: [`traceability-matrix.md`](./docs/traceability-matrix.md)
- User stories: [`user-stories.md`](./docs/user-stories.md)
- Wireframes: [`wireframes.md`](./docs/wireframes.md)
