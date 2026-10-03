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
| Repository provisioning for the 15-repository ecosystem | Course logistics | Starting the code-implementation phase — the 4 `-api`, 4 `-db`, 4 `-portal`, `synkro-front`, `synkro-api-gateway`, `synkro-workflow`, `synkro-worker` and `synkro-infra` repositories must exist on the `code-corhuila` organization before any team member can clone and start one | Course instructor (`@ariel5253`) | Before HU-13 closes and implementation sprints begin | 🟡 Waiting — `09-microservices/service-catalog.md` is the exact specification the instructor provisions from (this was HU-ARQ-01's stated purpose) |
| Decision on provisioning a real `qa` environment | Decision | Whether the team spends implementation time configuring a second PostgreSQL instance and CI job in `synkro-infra`, versus treating `qa` as a branch name only | Course instructor (`@ariel5253`) | Second half of the semester (`scope.md`, "Project Environments") | 🔴 Waiting — tracked as `open-questions.md` Q-004 |
| CI/CD pipeline infrastructure (GitHub Actions runners, secrets store) | Infrastructure | Running the unit, HTTP, integration and contract tests that `11-quality/testing-strategy.md` already specifies; today those commands are documented but run only locally | Whoever has admin rights on the `code-corhuila` GitHub organization | Before the first implementation sprint's Definition of Done can require "CI green" instead of "manual verification" | 🔴 Not provisioned |
| `postgres:16-alpine` base image | Third-party software | The single shared PostgreSQL instance `synkro-infra` defines (ADR-009) | Docker Hub / PostgreSQL project | Already available; pinned at first use | 🟢 Available |
| `flyway/flyway:11-alpine` base image | Third-party software | Every `-db` repository's migration runner (ADR-005 Decision 2) | Docker Hub / Flyway (Redgate) | Already available; pinned at first use | 🟢 Available |
| `nginx` base image | Third-party software | `synkro-api-gateway` (ADR-008 Decision 1) | Docker Hub / NGINX | Already available; pinned at first use | 🟢 Available |
| Prometheus and Grafana images | Third-party software | Observability stack referenced by `deployment.md` §8 and by `technical-backlog.md` TD-006 (operational monitoring of the shared instance) | Docker Hub | Needed once `synkro-infra`'s first implementation sprint starts | 🟡 Not yet pulled into any compose file |

---

## Explicitly not a dependency

| What | Why it is listed here instead of above |
|---|---|
| A payment gateway | Out of scope for the MVP (`scope.md`, "Candidates for Future Versions" #2) — no integration exists or is planned for this course delivery |
| Electronic invoicing (tax authority integration) | Explicitly out of scope (`scope.md`, "Explicitly Out of Scope" #2) |
| A message broker (RabbitMQ) | Deferred, not pending — ADR-007 Decision 5 is a decision already made, not a dependency waiting on someone else |
| Redis or any cache provider | Not adopted anywhere in the project (`05-architecture/overview.md` §8) |
| A JWKS provider or external identity provider | `synkro-auth-api` issues and validates its own RS256 keys; nothing external is involved (ADR-001 §6, ADR-006) |

---

## Correlations

- Repository ecosystem this depends on provisioning → `09-microservices/service-catalog.md`
- The `qa` environment question → `15-project-control/open-questions.md` Q-004
- Monitoring dependency and its technical-debt entry → `15-project-control/technical-backlog.md` TD-006
- Risk this connects to (shared instance as a single point of failure) → `15-project-control/risks.md` R-001
- Deployment topology and exact image tags → `05-architecture/deployment.md`
