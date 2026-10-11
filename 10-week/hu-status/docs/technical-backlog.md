# Technical Backlog

> Technical debt and deferred improvements identified during architecture
> decisions. Each item traces to the ADR that originated it and records
> the trigger that would justify picking it up. Items here are NOT bugs
> or product features — they are architectural improvements the team
> chose to defer in order to keep the MVP scope proportional to its
> requirements.

---

## Active items

### TD-001 — Daily sales closing job in the worker

| Field | Value |
|-------|-------|
| **ID** | TD-001 |
| **Description** | Add a second scheduled job to `synkro-worker` that produces a frozen daily snapshot of sales totals. Currently, reports aggregate the `sale` collection live (ADR-002, ADR-010 Decision 4); a closing would write a daily summary document that reports can read instead of re-aggregating |
| **Reference** | ADR-007 Decision 6, Option C (evaluated and deferred) |
| **Impact if not resolved** | Reports always query live data, which is acceptable at current volume but may become slow as sales grow |
| **Trigger to pick up** | PO decision, or report response time exceeds the 5-second statement timeout (`cross-cutting.md` §8) |
| **Estimated effort** | 3 SP |
| **Priority** | Low |
| **Sprint** | Post-MVP |

---

### TD-002 — Message broker and outbox pattern

| Field | Value |
|-------|-------|
| **ID** | TD-002 |
| **Description** | Adopt RabbitMQ (or equivalent) and apply the outbox pattern to the publishing service when an event gets a consumer that a requirement needs. Currently, no event is published in the MVP — consistency is handled by the saga only |
| **Reference** | ADR-007 Decision 5 (deferred), `pattern-guide.md` "Outbox Pattern: Deferred" |
| **Impact if not resolved** | Other contexts cannot react to business events (e.g. email on sale, analytics). Not a problem until a requirement asks for it |
| **Trigger to pick up** | A requirement appears that needs a context to react to a business event from another context |
| **Estimated effort** | 8 SP |
| **Priority** | Low |
| **Sprint** | Post-MVP |

---

### TD-003 — Per-product stock threshold

| Field | Value |
|-------|-------|
| **ID** | TD-003 |
| **Description** | Replace the global `LOW_STOCK_THRESHOLD` (default 5) with a per-product threshold stored in the `product` table. Currently a laptop and a cable trigger a low-stock alert at the same level |
| **Reference** | ADR-007 Decision 6, accepted cost |
| **Impact if not resolved** | False positives for high-volume products, missed alerts for low-volume ones |
| **Trigger to pick up** | The product catalog grows beyond a few dozen items, or the PO reports noise from irrelevant alerts |
| **Estimated effort** | 2 SP |
| **Priority** | Medium |
| **Sprint** | Post-MVP |

---

### TD-004 — JWKS endpoint for key rotation without redeployment

| Field | Value |
|-------|-------|
| **ID** | TD-004 |
| **Description** | Add a `GET /api/v1/auth/.well-known/jwks.json` endpoint to `synkro-auth-api` (RFC 7517) so that validating services can fetch the public key at startup or on a schedule, instead of receiving it as an environment variable. This enables key rotation without redeploying every service |
| **Reference** | ADR-006 (chose environment variable over JWKS); cross-cutting.md §5 "Future candidate" |
| **Impact if not resolved** | Key rotation requires redeploying every validating service with the new `JWT_PUBLIC_KEY`. Acceptable for the MVP (no real end users, frequent deployments) |
| **Trigger to pick up** | The system moves to a production-like environment with real users, or the team adopts automated deployments |
| **Estimated effort** | 3 SP |
| **Priority** | Medium |
| **Sprint** | Post-MVP |

---

### TD-006 — Operational monitoring for the shared instance and the MongoDB instance

| Field | Value |
|-------|-------|
| **ID** | TD-006 |
| **Description** | AT-002 (reopened in ADR-009) accepts the shared PostgreSQL instance as a single point of failure with mitigations: connection-pool sizing, CI GRANT verification, and operational monitoring. ADR-010 later created a second, equally single-instance point of failure for Sales on MongoDB (`risks.md` R-007). The monitoring part — Prometheus alerts for connection saturation, query duration and instance health, on both engines — is designed (`deployment.md` §8) but not yet configured |
| **Reference** | ADR-009 "What must be watched", ADR-010 "Accepted cost", `overview.md` AT-002, `risks.md` R-001 and R-007 |
| **Impact if not resolved** | A slow query, connection leak, or Mongo instance issue would be detected only when a service starts returning 503, not proactively |
| **Trigger to pick up** | When `synkro-infra-postgres` and `synkro-infra-mongo` are built and Prometheus/Grafana are running |
| **Estimated effort** | 3 SP |
| **Priority** | Medium |
| **Sprint** | First implementation sprint of `synkro-infra-postgres` / `synkro-infra-mongo` |

---

### TD-007 — Confirm ADR-001 §1 is the section the frontend-framework register cell points to

| Field | Value |
|-------|-------|
| **ID** | TD-007 |
| **Description** | `05-architecture/decisions/README.md`'s register row for ADR-001 cites `§1` as the section ADR-008 and ADR-011 modify for the frontend framework decision. That number was inferred by elimination (every other section, §2 through §8, is independently identified by other rows) while fixing an earlier unresolved placeholder the instructor's bot flagged — it was never confirmed against ADR-001's literal heading text |
| **Reference** | HU-ARQ-26's PR discussion; `05-architecture/decisions/README.md` |
| **Impact if not resolved** | A low but nonzero chance the register cites the wrong section number in an otherwise-authoritative document |
| **Trigger to pick up** | Immediately — this is a two-minute check, not a scheduled item; whoever opens `ADR-001-architecture.md` next should confirm it in passing |
| **Estimated effort** | 1 SP |
| **Priority** | Low (quick to resolve, low impact, but easy to forget precisely because it's quick) |
| **Sprint** | Whenever ADR-001 is next opened for any reason |

---

### TD-008 — Ratify or revise the frontend test coverage thresholds

| Field | Value |
|-------|-------|
| **ID** | TD-008 |
| **Description** | `11-quality/testing-strategy.md`'s "Frontend tests" section sets coverage thresholds (85% for the host's client/session, 70% for portal components) as proposed defaults, lower than the backend's 80-90% — there was no existing frontend test suite to calibrate against when they were written, only a judgment call about UI code's different risk profile |
| **Reference** | `11-quality/testing-strategy.md`, "Frontend coverage thresholds" |
| **Impact if not resolved** | Minor — the thresholds are enforced in CI (`testing-strategy.md`'s frontend pipeline) whether or not the team has explicitly discussed them, so nothing breaks; the risk is only that an unreviewed number quietly becomes the permanent bar |
| **Trigger to pick up** | After the first portal (`HU-PRO-01`/`HU-PRO-02`) has a real test suite — revisit with actual numbers in hand instead of a guess |
| **Estimated effort** | 1 SP (a team discussion, not a code change) |
| **Priority** | Low |
| **Sprint** | After Cut 6's first frontend stories close |

---

### TD-009 — Recovery when no usable application administrator remains

| Field | Value |
|---|---|
| **ID** | TD-009 |
| **Description** | Decide and review recovery after all ADMIN accounts become unusable through deactivation, role changes or exceptional removal. ADR-014 initialization is not the authorized recovery path. |
| **Reference** | ADR-014 scope boundary; initial-administrator runbook |
| **Impact if not resolved** | Administrative user creation is unavailable; the initialization existence check has no lifetime marker and cannot infer historical ADMIN roles. |
| **Trigger to pick up** | Before an environment with real users needs administrative recovery, or immediately if every usable ADMIN is lost. |
| **Priority** | High before real operation |
| **Status** | Pending decision; no recovery procedure or implementation claimed |

The ADR-014 downstream design documentation was merged through
[PR #220](https://github.com/code-corhuila/synkro-docs/pull/220), which closed
[HU-ARQ-27 — #219](https://github.com/code-corhuila/synkro-docs/issues/219).
[HU-DOCS-91 — #221](https://github.com/code-corhuila/synkro-docs/issues/221)
reconciles the remaining catalog and tracking records; that design alignment is
not deferred. TD-009 remains pending and outside HU-DOCS-91. Neither documentation
story supplies recovery implementation, schema migrations or executed Auth tests.

---

## Resolved items

| ID | Description | Resolved in | Date |
|----|-------------|-------------|------|
| TD-005 | Rename DDL schema prefixes to `<domain>_schema` | HU-DOCS-71 (`models.md`) | 2026-10 |

---

## Correlations

- Risk register (risks these items mitigate) → `15-project-control/risks.md`
- Architectural technical debt table → `05-architecture/overview.md` §8 (AT-001 to AT-006)
- Planned evolution → `05-architecture/overview.md` §9
- Architecture decisions that originated these items → ADR-005, ADR-006, ADR-007, ADR-009, ADR-010, ADR-011
- Pattern evaluation → `05-architecture/pattern-guide.md`

