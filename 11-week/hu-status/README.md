<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       11-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 11

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: Group 10 - synkro-tech
- SPRINT_GOAL: Prepare traceable component deliveries, validate security and the real sales workflow, advance sale registration and composed detail with session-bound recovery, and consolidate PostgreSQL/root-composition evidence without claiming final platform acceptance.
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

| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-VEN-12 | Real sale registration through Workflow, composed detail and session-bound recovery | doing | [Story #246](https://github.com/code-corhuila/synkro-docs/issues/246) · [Sales Portal #4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) · [Front #41](https://github.com/code-corhuila/synkro-front/pull/41) |
| HU-INF-02 | Persistent PostgreSQL infrastructure and root composition | doing | [Story #239](https://github.com/code-corhuila/synkro-docs/issues/239) · [Infra #12](https://github.com/code-corhuila/synkro-infra-postgres/pull/12) · [Products DB #22](https://github.com/code-corhuila/synkro-products-db/pull/22) |
| HU-WKF-03 | Persistent and recoverable sales registration orchestration | doing | [Story #243](https://github.com/code-corhuila/synkro-docs/issues/243) · [Workflow #13](https://github.com/code-corhuila/synkro-workflow/pull/13) |
| HU-AUTH-12 | Transactional user-creation audit schema — release preparation | done | [Closed story #232](https://github.com/code-corhuila/synkro-docs/issues/232) · [Auth DB #14](https://github.com/code-corhuila/synkro-auth-db/pull/14) · [Auth DB #22](https://github.com/code-corhuila/synkro-auth-db/pull/22) · [Release #25](https://github.com/code-corhuila/synkro-auth-db/pull/25) |

HU-AUTH-12's schema story is already closed; Auth DB release #25 remains under review. Its `done` status does not claim publication to main. HU-VEN-12, HU-INF-02 and HU-WKF-03 remain open.

## 2. My individual contribution

**Sales Portal and recovery (HU-VEN-12):**

- Advanced the registration form, Workflow saga tracking and composed customer/product detail. Prepared six reviewable increments: #5 → #6 → #7 → #8 → #9 → #4.
- Added tests and recovery behavior for uncertain operations, same-key retries, session ownership, logout and navigation. Reload observes a known saga explicitly and never automatically submits another sale.
- Consolidated the portal's seven complementary real-browser cases and compatible Front evidence, keeping normal transactions, induced failures and test doubles distinct. Integration remains pending.

**Infrastructure and release evidence (HU-INF-02):**

- Advanced migration, permissions, persistence, restore and observability validation and prepared candidate evidence/dependency documentation.
- Recorded five production builds and 13 browser scenarios for the Front/Sales candidate. The approved dependency lock is unchanged; the final integrated revisions and independent reproduction are still pending.
- Prepared/reviewed delivery chains through PRs and `cherry-pick -x`: `develop → qa → release/2.0.0 → main`, where `release/2.0.0` is a temporary candidate branch. This describes component-specific progress, not completed promotion of the entire platform.

**Security and component delivery:**

- Consolidated evidence for Products API's cryptographic RS256 validation and dependency fixes, Sales API's toolchain update and Sales DB v2.0.0 launcher compatibility, Workflow's real-participant recovery, and Auth DB's audit/history-isolation delivery.
- Recorded Products DB's published annotated `v2.0.0` and official-runner verification from a clean tag copy.
- Distinguished PR preparation/validation from code authorship: the selected Front session/outage and Sales API toolchain/launcher source commits are authored by `JordanRG420`. Their PRs were opened by `AsolanoT`; they are not counted as my original implementation commits. The detailed inventory preserves both roles.

**Recorded verification:**

| Component | Reported result | Published evidence |
|---|---|---|
| Front candidate | 360 tests + 3 existing todo; 95.29% statements; 12 real-browser scenarios | [#41](https://github.com/code-corhuila/synkro-front/pull/41) · [#43](https://github.com/code-corhuila/synkro-front/pull/43) |
| Sales Portal | 242 tests; 96.43% statements; seven additional real-browser scenarios, plus separately reused Front evidence | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) |
| Products API | 192 integration checks; 89.8% global coverage; source/binary scans reported no detected vulnerabilities | [Final update](https://github.com/code-corhuila/synkro-products-api/pull/19#issuecomment-6256064078) |
| Sales API | 34 real-MongoDB scenarios; separately 84 Auth/Gateway checks; zero reachable vulnerabilities in the recorded scan | [#23](https://github.com/code-corhuila/synkro-sales-api/pull/23) |
| Workflow | 43 Maven tests; 91.30% global coverage; real-participant saga validation | [#13](https://github.com/code-corhuila/synkro-workflow/pull/13) |
| Infrastructure | PostgreSQL/observability evidence; five builds; 13 candidate browser scenarios | [#12](https://github.com/code-corhuila/synkro-infra-postgres/pull/12) |

These are owner-reported results on identified revisions, not tests rerun to produce this README. Separate suites and reused evidence are not summed. Detailed provenance, file copies and limits are recorded in the [commit evidence](./code/week-11-commit-evidence.md).

## 3. Blockers and risks

- **CI execution:** Front/Sales Portal and several components report billing-lock failures before any test step. Infra reports startup failures with zero jobs and unknown cause. Local evidence does not make these checks green; any substitution needs an explicit decision for the affected scope.
- **Front/Sales integration:** session support is implemented in Front #41/#42/#43 but remains unmerged; Front #36 lacks it. Sales Portal's stacked PRs remain open and require ordered integration and applicable checks.
- **Review and publication:** Products API #19, Sales API #23, Auth DB #25, Workflow #13 and Front #36 remain open toward main. Reviews must cover the actual final heads; earlier approvals do not approve later changes.
- **Infrastructure acceptance:** final approved dependency pins and independent reproduction are pending. Candidate ephemeral runs do not newly certify persistent platform mode, Worker or every engine lifecycle.
- **Recovery and release limits:** the retention probe is controlled backdated evidence, not an elapsed 48-hour guarantee. Products DB's global Docker inventory limitation remains disclosed. Other pending tags and final tag-based integration prevent a claim of platform acceptance.
- **Central tracking:** documentation and HU/Environment updates still need to reflect the accepted, integrated revisions.

## 4. Plan for next week

- Resolve Actions execution or obtain an explicit, scoped decision on equivalent local evidence.
- Integrate the matching Front recovery contract and Sales Portal increments after their controls pass.
- Obtain the required reviews on final release heads; publish pending tags only after approved main integration and verify artifacts from clean tag copies.
- Fix the final infrastructure revision set, update its dependency lock through review and obtain independent reproduction of the affected checks.
- Update central documentation, traceability and HU/Environment status from actual accepted evidence. Keep incomplete stories open.

## 5. Compliance self-check

- [x] Conventional Commits - `type(scope): summary` — commit subjects and provenance are listed in the evidence inventory.
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...) — delivery chains are documented; pending integrations and main approvals are not complete.
- [x] Testable acceptance criteria — happy paths, authorization failures, compensation, replay and recovery are linked to their reported checks.
- [x] Tests added/updated (unit / integration) — test-first commits and corresponding implementations are identified; dependency/documentation-only changes reuse the applicable regression evidence.
- [x] DDD / hexagonal boundaries respected (domain has no I/O) — the report follows the documented context ownership and ports/adapters; component reports provide architecture-check evidence. This is not a new whole-codebase audit.
- [x] No secrets; config via environment variables — this submission contains selected tracked source, test, migration and configuration copies; private credentials/log packages are not copied.
- [ ] Required CI, final-head reviews and platform acceptance completed — still pending as described above.

## 6. Evidence links

- [October 18 commits, source-file copies, authorship and recorded verification](./code/week-11-commit-evidence.md)

Evidence date: **October 18, 2026 only, Colombia time (UTC−05:00)**. The day runs from 05:00 UTC on October 18 to before 05:00 UTC on October 19. New implementation, re-applied code and publication are distinguished in the commit report.

| Repository source folder | Copied files | October 18 scope |
|---|---:|---|
| [synkro-front](./code/synkro-front/) | 9 | HU-VEN-12 / HU-INF-02 |
| [synkro-sales-portal](./code/synkro-sales-portal/) | 58 | HU-VEN-12 |
| [synkro-products-api](./code/synkro-products-api/) | 17 | Security and release support for HU-INF-02 / HU-WKF-03 / HU-VEN-12 |
| [synkro-sales-api](./code/synkro-sales-api/) | 7 | Release support; minimal launcher backport related to HU-INF-02 |
| [synkro-auth-db](./code/synkro-auth-db/) | 39 | HU-AUTH-12 / HU-INF-02 support |
| [synkro-products-db](./code/synkro-products-db/) | 38 | HU-INF-02 support / Products DB component release |
| [synkro-workflow](./code/synkro-workflow/) | 49 | HU-WKF-03 |
| [synkro-infra-postgres](./code/synkro-infra-postgres/) | 2 | HU-INF-02 |

The folders contain **219 actual source, test, migration and configuration files**, preserving their original repository paths. File contents match the upstream Git blob hashes at the revisions named in the commit report. These selected copies are not complete runnable repositories.

The scoped report identifies **41 new original AsolanoT commits** for October 18 across five repositories. Promotions and `JordanRG420` source commits are recorded separately. Products DB files come from its main publication on October 18, without relabeling the earlier implementation as new work. Infra includes only that day's actual code change: the observability fixture correction and regression test.

Source provenance, GitHub links, test results and limits are consolidated in `week-11-commit-evidence.md`. No per-repository Markdown index, CSV inventory, manifest or separate verification/download report is included.

### Session learning evidence

- [Session 1 — Observability: logs, metrics and distributed tracing](./summary%20sessions/Session%201%20-%20Observability%20-%20logs,%20metrics%20and%20distributed%20tracing.jpg).
- [Session 2 — SLIs, SLOs, error budgets and alerting](./summary%20sessions/Session%202%20%C2%B7%20Planning%20-%20SLIs,%20SLOs,%20error%20budgets%20and%20alerting.jpg).

These existing session images are learning material, separate from application verification.

### Evidence scope

- New original commits are selected by author date; promotions are selected by re-application date. Only October 18 entries are listed.
- Code promoted or published on October 18 can originate from earlier implementation. Its authorship is retained.
- Private execution packages are not copied and application tests were not rerun to prepare this submission.
- Pending integration, CI, review and acceptance remain pending.
- Changes are limited to `11-week`; no commit, push or GitHub state change was performed.

## workshop d1

**Date:** October 20, 2026 - Week 11.
**Workshop:** Observability, SLOs and incident response applied to the SynkroTech project - Delivery 1.
**Journey:** Register a sale with customer validation and stock reservation through Gateway, Workflow, Customers, Products and Sales.

| Checkpoint | Work completed | Commit evidence |
|---|---|---|
| CP0 - Preparation | Created the workshop CONFIG with personal, repository and reflection-document references. | [2bd2c90](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/2bd2c904293dfc9e514dd1c3d1feada67a8f7470) |
| CP1 - Critical journey | Mapped real service hops and endpoints, the Mermaid sequence, span tree and trace propagation; documented the absence of broker messaging in the MVP. | [6bd375c](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/6bd375c6634f5862aa80dc80279c183e2132c622) |
| CP2 - Structured logs | Defined common/domain fields, redaction, severity policy and seven JSON examples sharing one trace ID, including timeout and insufficient-stock rejection. | [ea7ecfa](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/ea7ecfad589d08bd5df46bd0571dfa0e3016ec9e) |
| CP3 - Inbound instrumentation | Built the minimal Java 21/Spring Boot synkro-workflow module, trace-context filter, response headers and CP2-compatible JSON logger. | [c3bd4ef](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/c3bd4efa8d354777d1b2b932530a7bc50dd10b20) |
| CP3 - Downstream instrumentation | Propagated trace context to the Products stock-reservation endpoint, exposed a request counter and latency histogram at /metrics, and added automated tests and HOW-TO-RUN.md. | [1b631c8](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/1b631c8138393931d04c4b86c7437608917f277f) |
| CP4 - Metrics catalog | Defined four golden signals for each of the five backend services, dashboard PromQL, label/cardinality budgets and latency buckets, distinguishing implemented metrics from proposals. | [0b8dd15](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/0b8dd15bffb379417a837c9839aa650d559e5468) |

**Recorded validation:** 19 automated tests passed. A local HTTP run confirmed the same trace_id at Workflow and the Products fixture, distinct span IDs, HTTP 201, and counter/histogram output. The fixture changed no real inventory; this is workshop evidence, not acceptance of the production sale saga.
**Remaining scope:** saturation gauges and the proposed 0.3-second bucket are not implemented in CP3. No live Prometheus dashboard was executed for CP4.
**CP5:** this section updates the weekly tracking with the published CP0-CP4 commits. Moodle submission is not verified here.

Artifacts: [Workshop CONFIG](../workshop/README.md), [Journey](../workshop/01-journey.md), [Log contract](../workshop/02-log-contract.md), [Instrumentation instructions and actual output](../workshop/03-instrumentation/HOW-TO-RUN.md), [Metrics catalog](../workshop/04-metrics.md).
