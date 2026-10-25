# External Dependencies

> Things the project needs that it does not control itself: decisions
> owed by someone outside the development team, infrastructure the team
> has not provisioned yet, and third-party software the system's own
> images are built from. SynkroTech has no external business integration
> (`01-context/scope.md`, "External Integrations": none) — everything
> here is course logistics or base infrastructure, not a payment gateway
> or a shipping provider.

---

## Active dependencies

| Dependency | Type | Required for | External owner | Expected date | Status |
|---|---|---|---|---|---|
| Repository provisioning for the 19-repository ecosystem (4 `-api`, 4 `-db`, 4 `-portal`, `synkro-front`, `synkro-api-gateway`, `synkro-workflow`, `synkro-worker`, `synkro-infra-postgres`, `synkro-infra-mongo`) | Course logistics | Starting the code-implementation phase — every repository must exist on the `code-corhuila` organization before any team member can clone and start one | Course instructor (`@ariel5253`) | Before HU-13 closed implementation sprints began | 🟢 Done — all 19 repositories exist; `synkro-infra-postgres` still answers to its old name `synkro-infra`, tracked separately below |
| `synkro-infra` renamed to `synkro-infra-postgres`, and `synkro-infra-mongo` created | Course logistics | `synkro-sales-db` and `synkro-sales-api` cannot build their real MongoDB adapter against a real instance until `synkro-infra-mongo` exists (ADR-010 Decision 6); every document that currently carries a "pending rename" note can drop it once the rename lands | Course instructor (`@ariel5253`) | Requested in [code-corhuila/synkro-docs#159](https://github.com/code-corhuila/synkro-docs/issues/159) | 🔴 Waiting — tracked as risk `risks.md` R-007 |
| External course confirmation of the accepted ADR-013 Option A | External assessment | The project choice is accepted on 2026-10-25 and creates no new repository. This dependency is only the instructor's classification/confirmation; a later required change uses a new ADR. | Course instructor; AsolanoT coordinates the evidence | Before claiming external confirmation | 🟡 Project decision accepted; external confirmation remains Q-005. Neither user acceptance nor #156 closure is presented as an instructor response. |
| Decision on provisioning a real `qa` environment | Decision | Whether the team spends implementation time configuring a second PostgreSQL instance, a second MongoDB instance, and a CI job in `synkro-infra-postgres`/`synkro-infra-mongo`, versus treating `qa` as a branch name only | Course instructor (`@ariel5253`) | Second half of the semester (`scope.md`, "Project Environments") | 🔴 Waiting — tracked as `open-questions.md` Q-004 |
| CI/CD pipeline infrastructure (GitHub Actions runners, secrets store) | Infrastructure | Running the unit, HTTP, integration, contract and frontend tests that `11-quality/testing-strategy.md` already specifies; today those commands are documented but run only locally, except the common-files check HU-INF-01 already put in every repository's own `ci.yml` | Whoever has admin rights on the `code-corhuila` GitHub organization | Before the first implementation sprint's Definition of Done can require "CI green" instead of "manual verification" | 🟡 Partially provisioned — each repository's own `ci.yml` runs, but no org-wide runner configuration or secrets store beyond that exists yet |
| `postgres:16-alpine` base image | Third-party software | The shared PostgreSQL instance `synkro-infra-postgres` defines (ADR-009) | Docker Hub / PostgreSQL project | Already available; pinned at first use | 🟢 Available |
| `mongo:7.0` base image | Third-party software | The Sales MongoDB instance `synkro-infra-mongo` defines (ADR-010) | Docker Hub / MongoDB | Already available; pinned at first use | 🟢 Available |
| `flyway/flyway:11-alpine` base image | Third-party software | Every PostgreSQL `-db` repository's migration runner (ADR-005 Decision 2) | Docker Hub / Flyway (Redgate) | Already available; pinned at first use | 🟢 Available |
| `liquibase/liquibase` image, with the MongoDB extension | Third-party software | `synkro-sales-db`'s migration runner (ADR-010 Decision 5) | Docker Hub / Liquibase | Already available; pinned at first use | 🟢 Available |
| `nginx` base image | Third-party software | `synkro-api-gateway` (ADR-008 Decision 1) | Docker Hub / NGINX | Already available; pinned at first use | 🟢 Available |
| Prometheus and Grafana images | Third-party software | Observability stack referenced by `deployment.md` §8 and by `technical-backlog.md` TD-006 (operational monitoring of the shared PostgreSQL instance, and of the MongoDB instance per R-007) | Docker Hub | Needed once `synkro-infra-postgres`'s first implementation sprint starts | 🟡 Not yet pulled into any compose file |

---

## Explicitly not a dependency

| What | Why it is listed here instead of above |
|---|---|
| A payment gateway | Out of scope for the MVP (`scope.md`, "Candidates for Future Versions" #2) — no integration exists or is planned for this course delivery |
| Electronic invoicing (tax authority integration) | Explicitly out of scope (`scope.md`, "Explicitly Out of Scope" #2) |
| A message broker (RabbitMQ) | Deferred, not pending — ADR-007 Decision 5 is a decision already made, not a dependency waiting on someone else |
| Redis or any cache provider | Not adopted anywhere in the project (`05-architecture/overview.md` §8) |
| A JWKS provider or external identity provider | `synkro-auth-api` issues and validates its own RS256 keys; nothing external is involved (ADR-001 §1, ADR-006) |
| Native Federation, or any Angular-specific module-federation tooling | ADR-011 mounts the one Angular portal as a custom element, not through module federation of any kind — there is nothing to depend on here |

---

## Correlations

- Repository ecosystem this depends on provisioning → `09-microservices/service-catalog.md`
- The `qa` environment question → `15-project-control/open-questions.md` Q-004
- ADR-013's pending answer → `15-project-control/open-questions.md` Q-005
- Monitoring dependency and its technical-debt entry → `15-project-control/technical-backlog.md` TD-006
- Risks this connects to (shared instance and Sales' instance as single points of failure) → `15-project-control/risks.md` R-001, R-007
- Deployment topology and exact image tags → `05-architecture/deployment.md`
- Sales domain on MongoDB, infra repository naming → `05-architecture/decisions/records/ADR-010-sales-on-mongodb.md`
