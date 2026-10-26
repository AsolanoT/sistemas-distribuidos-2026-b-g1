<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       12-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 12

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group 10 - synkro-tech
- SPRINT_GOAL: Reconcile delivered traceability and identifiers (HU-DOCS-94), domain/data/API contracts (HU-DOCS-95), saga/session/security decisions (HU-ARQ-28), deployment/release/project control (HU-DOCS-96), and the service catalog, portal flows and architecture views (HU-DOCS-97), with individual evidence and explicit remaining implementation and acceptance gaps.
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
| HU-ARQ-28 | Formalize saga safety, session lifecycle and integration decision boundaries | done | [PR #259](https://github.com/code-corhuila/synkro-docs/pull/259); [issue #254](https://github.com/code-corhuila/synkro-docs/issues/254) |
| HU-DOCS-97 | Update the service catalog, portal flows and architecture views | done | [PR #261](https://github.com/code-corhuila/synkro-docs/pull/261); [PR #262](https://github.com/code-corhuila/synkro-docs/pull/262); [issue #256](https://github.com/code-corhuila/synkro-docs/issues/256) |

## 2. My individual contribution

**HU-ARQ-28 — saga safety, session lifecycle and decision boundaries:**

- Wrote ADR-015 for sale-saga execution safety, explicitly identifying the ADR-007 sections it modifies while preserving ADR-007's accepted text. Recorded real alternatives, the dominant safety criterion, accepted costs and consequences.
- Defined evidence-based compensation: an ambiguous participant outcome retains the reservation. Recorded authenticate/authorize-before-replay, equivalent-input 200, conflicting validated-input 400 and another caller's key generic 403 without exposing stored input or its owner.
- Distinguished durable attempt limits, transient/local/protocol failures, unresolved outcomes and advisory-lock namespaces. Kept lock overlap, missing Circuit Breaker and retry/jitter differences visible as implementation discrepancies.
- Wrote ADR-016 for Host session renewal and Sales operation recovery: the 60-second renewal margin, one shared refresh per session, noncredential per-tab session identity, reload/renewal continuity and invalidation on logout/new login.
- Recorded the Sales intent journal's original idempotency key, subject/session scope and local 24-hour deadline. That local deadline does not guarantee backend retention or cross-tab coordination.
- Wrote ADR-017 to distinguish refresh-token invalidation, already-issued person JWTs and manually replaced service tokens. No unsupported immediate access-JWT revocation is promised.
- Reconciled ADR-013's project acceptance while retaining Q-005's missing external instructor confirmation. Updated the ADR register, authentication/frontend/security guidance, testing references and backlog boundaries.

**Evidence:** [issue #254](https://github.com/code-corhuila/synkro-docs/issues/254), [merged PR #259](https://github.com/code-corhuila/synkro-docs/pull/259), [ADR-015](./docs/05-architecture/decisions/records/ADR-015-sale-saga-execution-safety.md), [ADR-016](./docs/05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md), [ADR-017](./docs/05-architecture/decisions/records/ADR-017-refresh-reuse-and-jwt-revocation-boundaries.md) and [decision register](./docs/05-architecture/decisions/README.md).

**Decision status:** the supplied records show ADR-013/015/016/017 as Accepted project decisions dated 2026-10-25. Their project acceptance, GitHub review/publication, instructor confirmation and runtime verification remain separate evidence. TD-010/011/013 policy questions are resolved; TD-009 and TD-012/014/015/016/017/018 implementation/recovery gaps remain separate.

**HU-DOCS-97 — service catalog, portal flows and architecture views:**

- Updated the service catalog, dependency map, data-ownership matrix and context/architecture views to reflect the 18 code repositories and actual delivered/partial/pending component states.
- Completed five records for each of seven services: README, data model, events, decisions and runbook. Kept component-specific responsibilities explicit: the four APIs and Workflow validate JWTs; Gateway performs its documented gateway checks; Worker remains a scheduler with a placeholder business job.
- Reconciled project entry points and contribution guidance. Linked each service to its contract, owned data, decisions, frozen source and operational limits without inventing production deployment or new infrastructure.
- Updated portal navigation and wireframe guidance for Host/Auth login, Angular Customers custom-element/ShellContract v1, Products catalog/category/stock/alerts and Sales registration/history/detail with recovery/observation states.
- Described loading/error/empty/data, role denial, cancellation, optional-name fallback and frozen amounts. Kept report/dashboard and user/service-token administration UI explicitly unfinished.
- Updated ten editable draw.io sources and their ten SVG exports, plus the diagram index. Each paired export records its source digest; the delivery records rendered visual inspection.
- Reassessed R-008 against the bounded Customers R8 evidence rather than route presence alone. Kept independent current-root review, uncovered routing permutations and Sales E2E-02 NOT EXECUTED explicit.

**Evidence:** [issue #256](https://github.com/code-corhuila/synkro-docs/issues/256), [merged PR #261 — service catalog/context](https://github.com/code-corhuila/synkro-docs/pull/261), [merged PR #262 — portal flows/diagrams](https://github.com/code-corhuila/synkro-docs/pull/262), [service catalog](./docs/09-microservices/service-catalog.md), [navigation map](./docs/12-ux-ui/navigation-map.md), [wireframes](./docs/12-ux-ui/wireframes.md) and [diagram index](./docs/08-uml/diagram-index.md).

**Validation recorded in the deliveries:** PR #259 records source/test/contract-reference checks; PR #261 records service/route/port/schema and link checks; PR #262 records ten source/export digest pairs and rendered diagram review. These were documentation checks. No application suite, migration, restore, browser flow or platform deployment was rerun as part of these documentation stories.

## 3. Blockers and risks

- TD-014/015/016 remain Workflow implementation gaps despite Accepted ADR-015. Documentation acceptance does not implement isolated locks, Circuit Breakers or compliant retry/jitter behavior.
- Session guarantees remain per tab. Cross-tab coordination is a separate improvement; the session ID is not a credential and the browser journal does not authorize a request.
- R-008 is mitigated for the evidenced routing subset and remains active for independent review/uncovered permutations. R8 is not complete platform acceptance; E2E-02 remains NOT EXECUTED.
- Worker low-stock automation, report/dashboard UI and Auth administration screens remain unfinished. Q-005 still requires external confirmation; TD-009 administrator recovery remains unresolved.
- Infrastructure promotion, exact owner revision agreement, private/CI integration and persistent recovery retain the separate gates documented by HU-DOCS-96.

## 4. Plan for next week

- Coordinate Workflow lock/retry/resilience follow-up from Accepted ADR-015, beginning with documented scope and regression tests.
- Complete independent routing/integration evidence with the relevant owners before closing remaining R-008 and platform acceptance boundaries.
- Keep the service catalog, diagrams, session guidance and traceability current as implementation gaps close.
- Support release revision agreement and refine pending Worker/UI/recovery work without allocating identifiers ahead of the shared register.

These are follow-up proposals, not completed work or newly assigned HU identifiers.

## 5. Compliance self-check

- [x] Conventional Commits - `type(scope): summary` — PR #259 `docs(architecture): formalize saga safety, session lifecycle and integration decision boundaries`; PR #261 `docs(microservices): refresh service catalog and architecture context`; PR #262 `docs(frontend): refresh portal flows and architecture diagrams`.
- [x] Documentation branches + PRs to `main` — `docs/formalize-saga-and-session-decisions` and `docs/refresh-service-catalog-and-portal-flows`; all three PRs are merged.
- [x] Testable acceptance criteria — unsafe compensation/session isolation, actual portal flow, metadata/component outage, pending UI and bounded routing evidence are explicit.
- [x] Tests added/updated — N/A for application code; decision-to-test references and documentation/diagram checks were updated with their execution limits.
- [x] DDD / hexagonal boundaries respected — domain authorities, public contracts and data ownership govern the catalog; Host/session capabilities and gateway/service responsibilities remain explicit.
- [x] No secrets; config via environment variables — the local evidence consists of Markdown, OpenAPI YAML, draw.io and SVG files.

## 6. Evidence links

The following 94 local files reproduce the evidence directory supplied for this personal Week 12 submission. Shared documents include earlier team work; the bullets in section 2 and the PR diffs identify my individual changes.

Three supplied copies — `00-governance/security-rules.md`, `15-project-control/dependencies.md` and `15-project-control/technical-backlog.md` — omit some later operations/control additions present in the final merged tree. They are retained as the supplied evidence snapshot. Read the [merged security rules](https://github.com/code-corhuila/synkro-docs/blob/88cc7681662d15110e01f29be4d25f97d3887303/00-governance/security-rules.md), [merged dependencies](https://github.com/code-corhuila/synkro-docs/blob/88cc7681662d15110e01f29be4d25f97d3887303/15-project-control/dependencies.md) and [merged technical backlog](https://github.com/code-corhuila/synkro-docs/blob/88cc7681662d15110e01f29be4d25f97d3887303/15-project-control/technical-backlog.md) for those later additions.

The root project README is evidenced in [PR #261's merged tree](https://github.com/code-corhuila/synkro-docs/blob/1134314a7560cfe8c294f2274e74e08399546672/README.md); it is not present in the supplied local `docs/` snapshot. This is a documentation subset; use the complete pinned repository for cross-document references outside the copied evidence.

### Merged delivery references

- [PR #259 — docs(architecture): formalize saga safety, session lifecycle and integration decision boundaries](https://github.com/code-corhuila/synkro-docs/pull/259); [merge commit d43e1cf](https://github.com/code-corhuila/synkro-docs/commit/d43e1cfed2ce739c22026229e072dfaff1f7c317).
- [PR #261 — docs(microservices): refresh service catalog and architecture context](https://github.com/code-corhuila/synkro-docs/pull/261); [merge commit 1134314](https://github.com/code-corhuila/synkro-docs/commit/1134314a7560cfe8c294f2274e74e08399546672).
- [PR #262 — docs(frontend): refresh portal flows and architecture diagrams](https://github.com/code-corhuila/synkro-docs/pull/262); [merge commit 88cc768](https://github.com/code-corhuila/synkro-docs/commit/88cc7681662d15110e01f29be4d25f97d3887303).

### Local document evidence


**_stacks**

- [_stacks/frontend.md](./docs/_stacks/frontend.md)

**00-governance**

- [00-governance/agile-conventions.md](./docs/00-governance/agile-conventions.md)
- [00-governance/security-policy.md](./docs/00-governance/security-policy.md)
- [00-governance/security-rules.md](./docs/00-governance/security-rules.md)

**01-context**

- [01-context/overview.md](./docs/01-context/overview.md)
- [01-context/scope.md](./docs/01-context/scope.md)

**02-domain**

- [02-domain/domain-map.md](./docs/02-domain/domain-map.md)
- [02-domain/entities-and-rules.md](./docs/02-domain/entities-and-rules.md)

**04-requirements**

- [04-requirements/traceability-matrix.md](./docs/04-requirements/traceability-matrix.md)
- [04-requirements/user-stories.md](./docs/04-requirements/user-stories.md)

**05-architecture**

- [05-architecture/cross-cutting.md](./docs/05-architecture/cross-cutting.md)
- [05-architecture/decisions/README.md](./docs/05-architecture/decisions/README.md)
- [05-architecture/decisions/records/ADR-013-identity-as-cross-cutting-security.md](./docs/05-architecture/decisions/records/ADR-013-identity-as-cross-cutting-security.md)
- [05-architecture/decisions/records/ADR-015-sale-saga-execution-safety.md](./docs/05-architecture/decisions/records/ADR-015-sale-saga-execution-safety.md)
- [05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md](./docs/05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md)
- [05-architecture/decisions/records/ADR-017-refresh-reuse-and-jwt-revocation-boundaries.md](./docs/05-architecture/decisions/records/ADR-017-refresh-reuse-and-jwt-revocation-boundaries.md)
- [05-architecture/overview.md](./docs/05-architecture/overview.md)
- [05-architecture/pattern-guide.md](./docs/05-architecture/pattern-guide.md)
- [05-architecture/security-threat-model.md](./docs/05-architecture/security-threat-model.md)

**06-data**

- [06-data/models.md](./docs/06-data/models.md)

**07-api**

- [07-api/authentication.md](./docs/07-api/authentication.md)
- [07-api/contracts/openapi/synkro-workflow.yaml](./docs/07-api/contracts/openapi/synkro-workflow.yaml)
- [07-api/guidelines.md](./docs/07-api/guidelines.md)

**08-uml**

- [08-uml/diagram-index.md](./docs/08-uml/diagram-index.md)
- [08-uml/diagrams/exports/bpmn-auth-login.svg](./docs/08-uml/diagrams/exports/bpmn-auth-login.svg)
- [08-uml/diagrams/exports/bpmn-customers-deactivate.svg](./docs/08-uml/diagrams/exports/bpmn-customers-deactivate.svg)
- [08-uml/diagrams/exports/bpmn-customers-register.svg](./docs/08-uml/diagrams/exports/bpmn-customers-register.svg)
- [08-uml/diagrams/exports/bpmn-customers-update.svg](./docs/08-uml/diagrams/exports/bpmn-customers-update.svg)
- [08-uml/diagrams/exports/bpmn-products-deactivate.svg](./docs/08-uml/diagrams/exports/bpmn-products-deactivate.svg)
- [08-uml/diagrams/exports/bpmn-products-register.svg](./docs/08-uml/diagrams/exports/bpmn-products-register.svg)
- [08-uml/diagrams/exports/bpmn-products-update.svg](./docs/08-uml/diagrams/exports/bpmn-products-update.svg)
- [08-uml/diagrams/exports/bpmn-sales-registration.svg](./docs/08-uml/diagrams/exports/bpmn-sales-registration.svg)
- [08-uml/diagrams/exports/c4-01-context.svg](./docs/08-uml/diagrams/exports/c4-01-context.svg)
- [08-uml/diagrams/exports/c4-02-containers.svg](./docs/08-uml/diagrams/exports/c4-02-containers.svg)
- [08-uml/diagrams/source/bpmn-auth-login.drawio](./docs/08-uml/diagrams/source/bpmn-auth-login.drawio)
- [08-uml/diagrams/source/bpmn-customers-deactivate.drawio](./docs/08-uml/diagrams/source/bpmn-customers-deactivate.drawio)
- [08-uml/diagrams/source/bpmn-customers-register.drawio](./docs/08-uml/diagrams/source/bpmn-customers-register.drawio)
- [08-uml/diagrams/source/bpmn-customers-update.drawio](./docs/08-uml/diagrams/source/bpmn-customers-update.drawio)
- [08-uml/diagrams/source/bpmn-products-deactivate.drawio](./docs/08-uml/diagrams/source/bpmn-products-deactivate.drawio)
- [08-uml/diagrams/source/bpmn-products-register.drawio](./docs/08-uml/diagrams/source/bpmn-products-register.drawio)
- [08-uml/diagrams/source/bpmn-products-update.drawio](./docs/08-uml/diagrams/source/bpmn-products-update.drawio)
- [08-uml/diagrams/source/bpmn-sales-registration.drawio](./docs/08-uml/diagrams/source/bpmn-sales-registration.drawio)
- [08-uml/diagrams/source/c4-01-context.drawio](./docs/08-uml/diagrams/source/c4-01-context.drawio)
- [08-uml/diagrams/source/c4-02-containers.drawio](./docs/08-uml/diagrams/source/c4-02-containers.drawio)

**09-microservices**

- [09-microservices/communication-patterns.md](./docs/09-microservices/communication-patterns.md)
- [09-microservices/data-ownership-matrix.md](./docs/09-microservices/data-ownership-matrix.md)
- [09-microservices/dependency-map.md](./docs/09-microservices/dependency-map.md)
- [09-microservices/README.md](./docs/09-microservices/README.md)
- [09-microservices/service-catalog.md](./docs/09-microservices/service-catalog.md)
- [09-microservices/services/01-auth-api/data-model.md](./docs/09-microservices/services/01-auth-api/data-model.md)
- [09-microservices/services/01-auth-api/decisions.md](./docs/09-microservices/services/01-auth-api/decisions.md)
- [09-microservices/services/01-auth-api/events.md](./docs/09-microservices/services/01-auth-api/events.md)
- [09-microservices/services/01-auth-api/README.md](./docs/09-microservices/services/01-auth-api/README.md)
- [09-microservices/services/01-auth-api/runbook.md](./docs/09-microservices/services/01-auth-api/runbook.md)
- [09-microservices/services/02-customers-api/data-model.md](./docs/09-microservices/services/02-customers-api/data-model.md)
- [09-microservices/services/02-customers-api/decisions.md](./docs/09-microservices/services/02-customers-api/decisions.md)
- [09-microservices/services/02-customers-api/events.md](./docs/09-microservices/services/02-customers-api/events.md)
- [09-microservices/services/02-customers-api/README.md](./docs/09-microservices/services/02-customers-api/README.md)
- [09-microservices/services/02-customers-api/runbook.md](./docs/09-microservices/services/02-customers-api/runbook.md)
- [09-microservices/services/03-products-api/data-model.md](./docs/09-microservices/services/03-products-api/data-model.md)
- [09-microservices/services/03-products-api/decisions.md](./docs/09-microservices/services/03-products-api/decisions.md)
- [09-microservices/services/03-products-api/events.md](./docs/09-microservices/services/03-products-api/events.md)
- [09-microservices/services/03-products-api/README.md](./docs/09-microservices/services/03-products-api/README.md)
- [09-microservices/services/03-products-api/runbook.md](./docs/09-microservices/services/03-products-api/runbook.md)
- [09-microservices/services/04-sales-api/data-model.md](./docs/09-microservices/services/04-sales-api/data-model.md)
- [09-microservices/services/04-sales-api/decisions.md](./docs/09-microservices/services/04-sales-api/decisions.md)
- [09-microservices/services/04-sales-api/events.md](./docs/09-microservices/services/04-sales-api/events.md)
- [09-microservices/services/04-sales-api/README.md](./docs/09-microservices/services/04-sales-api/README.md)
- [09-microservices/services/04-sales-api/runbook.md](./docs/09-microservices/services/04-sales-api/runbook.md)
- [09-microservices/services/05-api-gateway/data-model.md](./docs/09-microservices/services/05-api-gateway/data-model.md)
- [09-microservices/services/05-api-gateway/decisions.md](./docs/09-microservices/services/05-api-gateway/decisions.md)
- [09-microservices/services/05-api-gateway/events.md](./docs/09-microservices/services/05-api-gateway/events.md)
- [09-microservices/services/05-api-gateway/README.md](./docs/09-microservices/services/05-api-gateway/README.md)
- [09-microservices/services/05-api-gateway/runbook.md](./docs/09-microservices/services/05-api-gateway/runbook.md)
- [09-microservices/services/06-workflow/data-model.md](./docs/09-microservices/services/06-workflow/data-model.md)
- [09-microservices/services/06-workflow/decisions.md](./docs/09-microservices/services/06-workflow/decisions.md)
- [09-microservices/services/06-workflow/events.md](./docs/09-microservices/services/06-workflow/events.md)
- [09-microservices/services/06-workflow/README.md](./docs/09-microservices/services/06-workflow/README.md)
- [09-microservices/services/06-workflow/runbook.md](./docs/09-microservices/services/06-workflow/runbook.md)
- [09-microservices/services/07-worker/data-model.md](./docs/09-microservices/services/07-worker/data-model.md)
- [09-microservices/services/07-worker/decisions.md](./docs/09-microservices/services/07-worker/decisions.md)
- [09-microservices/services/07-worker/events.md](./docs/09-microservices/services/07-worker/events.md)
- [09-microservices/services/07-worker/README.md](./docs/09-microservices/services/07-worker/README.md)
- [09-microservices/services/07-worker/runbook.md](./docs/09-microservices/services/07-worker/runbook.md)

**11-quality**

- [11-quality/testing-strategy.md](./docs/11-quality/testing-strategy.md)

**12-ux-ui**

- [12-ux-ui/navigation-map.md](./docs/12-ux-ui/navigation-map.md)
- [12-ux-ui/wireframes.md](./docs/12-ux-ui/wireframes.md)

**14-training**

- [14-training/technical-onboarding.md](./docs/14-training/technical-onboarding.md)

**15-project-control**

- [15-project-control/dependencies.md](./docs/15-project-control/dependencies.md)
- [15-project-control/documentation-verification.md](./docs/15-project-control/documentation-verification.md)
- [15-project-control/open-questions.md](./docs/15-project-control/open-questions.md)
- [15-project-control/risks.md](./docs/15-project-control/risks.md)
- [15-project-control/technical-backlog.md](./docs/15-project-control/technical-backlog.md)

**Root documents**

- [CONTRIBUTING.md](./docs/CONTRIBUTING.md)
