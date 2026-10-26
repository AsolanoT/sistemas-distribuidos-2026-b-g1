# Risk Register

> Unmitigated risks become problems. This register allows the team to
> anticipate, not just react.
> Review and update at each retrospective or when there is a significant project change.

---

## Probability × impact matrix

```
IMPACT
  │
  │ HIGH  │  [Mitigate]    │  [Avoid]       │
  │       │  Low           │  High          │
  │       │  Probability   │  Probability   │
  │───────────────────────────────────────
  │ MEDIUM│  [Accept]      │  [Mitigate]    │
  │       │  with monitoring│              │
  │───────────────────────────────────────
  │ LOW   │  [Accept]      │  [Accept]      │
  │       │                │               │
  └───────────────────────────────────────
              LOW              HIGH
                      PROBABILITY
```

**Response strategies:**
- **Avoid:** Change the plan so the risk cannot materialize
- **Mitigate:** Reduce the probability or impact
- **Transfer:** Pass the risk to another party (insurance, provider, contract)
- **Accept:** Acknowledge the risk and have a contingency plan

---

## Active risk register

### R-001 — Shared PostgreSQL instance is a single point of failure

| Field | Value |
|-------|-------|
| **ID** | R-001 |
| **Category** | Technical |
| **Description** | The four PostgreSQL-backed schemas (auth, customers, products, and the saga's workflow schema) share one PostgreSQL instance per environment (ADR-009, ADR-012). If that instance goes down, those four domains become unavailable simultaneously. Sales is no longer part of this risk: ADR-010 moved it to its own MongoDB instance, covered separately in R-007 below |
| **Probability** | Low |
| **Impact** | High |
| **Risk level** | High |
| **Strategy** | Mitigate |
| **Mitigation plan** | Per-service connection-pool sizing to prevent one service from saturating the instance; health/readiness detects failures but does not itself restart an unhealthy Docker container; restart behavior is a separate container policy. Candidate monitoring tools start, but instrumented engine/service alerts remain TD-006. These controls reduce specific failure/exposure risks; the shared-instance impact remains an accepted architectural cost (ADR-009) |
| **Contingency plan** | Restart the instance; if the volume is corrupted, restore from the last backup (ADR-012 Decision 5 requires one before migrating `qa`/`main`). Recover only eligible execution under Accepted ADR-015; suspended/uncertain outcomes require evidence and retained reservations. Coordinate both engines and never reset rows or assume every RUNNING saga resumes automatically |
| **Trigger** | Auth/Customers/Workflow owning-store readiness or real Products persistence operation fails. Products /health is liveness only (TD-017), so it cannot currently detect the database failure. |
| **Owner** | Angel Gustavo Solano Trujillo (Tech Lead) |
| **Review date** | 2026-10-25 — Week 12; next review at Sprint 12 review |
| **Status** | Active |

**References:** ADR-009 "Accepted cost", ADR-010 (Sales moved out), `overview.md` AT-002 (reopened), `security-threat-model.md` D-3.

---

### R-002 — GRANT misconfiguration allowing cross-schema access

| Field | Value |
|-------|-------|
| **ID** | R-002 |
| **Category** | Technical |
| **Description** | With schema-based isolation (ADR-009), an incorrect GRANT in a `-db` migration could give a service access to another domain's schema. Unlike separate instances, the engine does not prevent the connection — only the permissions do. This applies to the three PostgreSQL-backed domains plus the workflow's schema; it has no equivalent for Sales, whose isolation is a separate MongoDB database and user, not a `GRANT` inside a shared instance (ADR-010) |
| **Probability** | Low |
| **Impact** | High |
| **Risk level** | High |
| **Strategy** | Mitigate |
| **Mitigation plan** | Each `-db`'s CI rebuild check (drop, rebuild from V001, verify) confirms that the domain's `_writer` role has access only to its own schema. The `03_dcl/` migration structure separates role creation from grants, making the scope visible in review. The privilege-check query in `deployment.md` §4 verifies this across every service user in one pass |
| **Contingency plan** | If discovered: revoke the incorrect GRANT immediately, add a regression test to CI, and audit the affected schema for unauthorized changes |
| **Trigger** | CI rebuild check fails with a permission error on a table outside the domain's schema, or the privilege-check query returns an unexpected row |
| **Owner** | Angel Gustavo Solano Trujillo (Tech Lead) |
| **Review date** | 2026-10-25 — Week 12; next review at Sprint 12 review |
| **Status** | Active |

**References:** ADR-009 "Accepted cost", ADR-005 Decision 3, ADR-012 Decision 2, `security-threat-model.md` T-3.

---

### R-003 — Rollback discipline across two different migration tools

| Field | Value |
|-------|-------|
| **ID** | R-003 |
| **Category** | Technical |
| **Description** | Every PostgreSQL `V` migration must have its `U` rollback under `05_rollbacks/`; Flyway never runs `U` scripts automatically — they exist only for manual emergency rollback. `synkro-sales-db` uses Liquibase instead (ADR-010 Decision 5), where the equivalent is each changeset's declared inverse, rolled back with `rollback-count`. If a rollback — either kind — is missing or incorrect, an emergency rollback leaves the store in an inconsistent state |
| **Probability** | Medium |
| **Impact** | Medium |
| **Risk level** | Medium |
| **Strategy** | Mitigate |
| **Mitigation plan** | The CI rebuild check for each PostgreSQL `-db` runs the full rollback sequence (`U` scripts in reverse order) after rebuilding, then rebuilds again; `synkro-sales-db`'s equivalent check runs `liquibase rollback-count` for every changeset, then rebuilds (`11-quality/testing-strategy.md`, "Database repository (`-db`) — Sales"). A missing or broken rollback fails its respective check either way. PR review verifies that every migration has its inverse |
| **Contingency plan** | Stop the persistent rollback. Preserve a verified backup and prefer a reviewed forward fix. An inverse needs owner review, compatibility/data-loss analysis and rehearsal against a copy before controlled execution; disposable rebuild is not persistent recovery authorization |
| **Trigger** | A migration or changeset is merged without its corresponding rollback |
| **Owner** | Jordan Ramirez Gallego |
| **Review date** | 2026-10-25 — Week 12; next review at Sprint 12 review |
| **Status** | Active |

**References:** ADR-005 Decision 2, ADR-010 Decision 5, `models.md` principle 5, `11-quality/testing-strategy.md`.

---

### R-004 — Service tokens rotated manually every 30 days

| Field | Value |
|-------|-------|
| **ID** | R-004 |
| **Category** | Technical |
| **Description** | `synkro-workflow` and `synkro-worker` use service tokens that expire after 30 days. Rotation requires an ADMIN to issue new tokens through `synkro-auth-api` and update the environment secrets. If the token expires unnoticed, the saga and the worker stop working |
| **Probability** | Medium |
| **Impact** | High |
| **Risk level** | High |
| **Strategy** | Mitigate |
| **Mitigation plan** | The responsible operator must record issuance/expiry and schedule replacement before 30-day expiry; no installed reminder or Worker expiry log is established. JWKS (TD-004) concerns signing/public-key distribution, not automatic replacement of SERVICE credentials. Maintain separate expiry and key-rotation procedures |
| **Contingency plan** | Issue a new token immediately; restart the affected service with the new secret |
| **Trigger** | The workflow or worker starts returning 401 on internal calls |
| **Owner** | Sergio Andrés Ordóñez Díaz |
| **Review date** | 2026-10-25 — Week 12; next review at Sprint 12 review |
| **Status** | Active |

**References:** ADR-006, `overview.md` AT-005, `security-policy.md` "Secret Rotation".

---

### R-005 — Connection pool saturation in the shared PostgreSQL instance

| Field | Value |
|-------|-------|
| **ID** | R-005 |
| **Category** | Technical |
| **Description** | The four PostgreSQL-backed services (Auth, Customers, Products, the workflow) share one instance. If one of them opens too many connections (a burst of saga steps, a slow query), the others may be unable to get a connection, causing cascading 503s. Sales cannot contribute to or be affected by this: its MongoDB instance is entirely separate (ADR-010), with its own pool covered in R-007 |
| **Probability** | Low |
| **Impact** | Medium |
| **Risk level** | Medium |
| **Strategy** | Mitigate |
| **Mitigation plan** | Verify each delivered pool and its concurrent lease demand: Customers pool 10/acquire 5s; Workflow pool 12/acquire 3s with dedicated advisory-lock sessions; other services retain their own source configuration. Sum application, migration and operator connections against actual max_connections; no measured capacity or universal 10/5s setting is asserted. Monitoring remains TD-006 |
| **Contingency plan** | If saturation occurs: identify the service consuming connections (Prometheus metrics), reduce its pool size or kill the slow query, and restart the affected service |
| **Trigger** | A datasource acquisition/connectivity timeout, or an operator-confirmed blocked/waiting connection, indicates possible saturation. Diagnose actual pool/engine state and rule out other causes. A metrics-based threshold becomes usable only after its exporter/series and alert are verified under TD-006; no such monitoring is assumed now. |
| **Owner** | Fredman Santiago Plazas Artunduaga |
| **Review date** | 2026-10-25 — Week 12; next review at Sprint 12 review |
| **Status** | Active |

**References:** ADR-009 "What must be watched", ADR-010 (Sales not included), `security-threat-model.md` D-3, `cross-cutting.md` §8.

---

### R-006 — No message broker: eventual consistency only through the saga

| Field | Value |
|-------|-------|
| **ID** | R-006 |
| **Category** | Technical |
| **Description** | ADR-007 Decision 5 deferred RabbitMQ and the outbox pattern out of the MVP. Consistency between domains is handled exclusively by the saga. If a future requirement needs other contexts to react to a sale (e.g. email notifications, analytics), there is no event bus to carry that information |
| **Probability** | Low |
| **Impact** | Low |
| **Risk level** | Low |
| **Strategy** | Accept |
| **Mitigation plan** | None needed for the MVP — no requirement consumes an event. When a consumer appears, a new ADR adopts the broker and applies the outbox pattern to the publishing service (recorded in technical-backlog.md TD-002) |
| **Contingency plan** | Not applicable — this is a scope decision, not a failure scenario |
| **Trigger** | A requirement appears that needs a context to react to a business event from another context |
| **Owner** | Angel Gustavo Solano Trujillo (Tech Lead) |
| **Review date** | 2026-10-25 — Week 12; next review at Sprint 12 review |
| **Status** | Active |

**References:** ADR-007 Decision 5, `pattern-guide.md` "Outbox Pattern: Deferred", `technical-backlog.md` TD-002.

---

### R-007 — Sales' MongoDB instance is its own single point of failure

| Field | Value |
|-------|-------|
| **ID** | R-007 |
| **Category** | Technical |
| **Description** | ADR-010 moved Sales off the shared PostgreSQL instance specifically to satisfy the course's two-engine requirement, but a single-node MongoDB replica set per environment is, on its own, exactly the kind of single point of failure R-001 already accepts for the other four domains — it is a new instance of the same shape of risk, not a new kind of risk |
| **Probability** | Low |
| **Impact** | High |
| **Risk level** | High |
| **Strategy** | Mitigate |
| **Mitigation plan** | Sales driver bounds (`MONGODB_TIMEOUT=5s`, pool 10 by default), authenticated bounded PRIMARY checks and persistent storage are delivered in Mongo v2.0.0. Health detection does not restart an unhealthy container by itself. Candidate observability tools run, but engine metrics/alerts, persistent recovery rehearsal and failover remain unproven (TD-006). A single node is still a single point of failure |
| **Contingency plan** | Restart the instance; if the volume is corrupted, restore from the last backup (ADR-012 Decision 5's backup rule applies to both engines in `qa`/`main`) |
| **Trigger** | `synkro-sales-api`'s health check (`GET /health`) reports `database: down` |
| **Owner** | Jordan Ramirez Gallego |
| **Review date** | 2026-10-25 — Week 12; next review at Sprint 12 review |
| **Status** | Active — Mongo v2.0.0 delivered; single-node outage/data-loss exposure remains. Root acceptance is open and the Sales DB owner pin conflict still blocks a fully green integration result |

**References:** ADR-010 "Accepted cost", R-001 (the PostgreSQL equivalent of this risk).

---

### R-008 — Angular Customers portal's internal routing is unverified

| Field | Value |
|-------|-------|
| **ID** | R-008 |
| **Category** | Technical |
| **Description** | The original mounting-only spike did not validate nested routing. Four routes are now delivered and author real-browser R8 exercises initial login return, creation, detail/edit journey, detail reload and list↔detail Back/Forward. Remaining risk is regression/uncovered entry or lifecycle permutations and independent current-root review; it is not absence of any routing evidence. |
| **Probability** | Medium |
| **Impact** | Medium |
| **Risk level** | Medium |
| **Strategy** | Mitigate |
| **Mitigation plan** | [Route/evidence mapping](../12-ux-ui/navigation-map.md#customers-routing-evidence-and-r-008) cites exact Host/Customers revisions, owner routing/lifecycle tests and [R8 real result](https://github.com/code-corhuila/synkro-infra-postgres/blob/8139a43e786f3ab7adf6367065a6165d8d83c15e/docs/evidence/composition-2026-10-22/runs/R8-customers/customers-browser-result.json), root 217dacf3577b2ec12a4e838b655bf0bea527f561. R8 used locked-owner/TCP-readiness adaptations; available scope exit 2, not full acceptance. Independent current-root review and untested edit deep-refresh/lifecycle permutations remain explicit. |
| **Contingency plan** | If routing under the host's base path proves unworkable with Angular's defaults, an explicit base-href or initial-navigation strategy is added — still inside the custom-element mechanism ADR-011 chose; only if that also fails would ADR-011 itself need reopening |
| **Trigger** | Required initial navigation, deep-link, Back/Forward or unmount behavior remains unverified for a delivered route, or a real browser regression appears. Routed screens already exist; HU-DOCS-97 owns the complete evidence mapping before risk closure. |
| **Owner** | Angel Gustavo Solano Trujillo (Tech Lead) |
| **Review date** | 2026-10-25 — Week 12; next review at Sprint 12 review |
| **Status** | Mitigated for the evidenced route set; active for independent review/uncovered permutations. No new browser execution or complete Infra acceptance claimed |

**References:** ADR-011 Decision 2; [current frontend routing boundary](../_stacks/frontend.md#internal-routing-inside-the-angular-portal--delivered-evidence-and-remaining-limits); [route evidence](../12-ux-ui/navigation-map.md#customers-routing-evidence-and-r-008).

---

## Closed risks / Lessons learned

| ID | Risk | Outcome | Lesson |
|----|------|---------|--------|
| — | No closed risks yet | — | — |

---

## Correlations

- Architectural technical debt → `05-architecture/overview.md` §8 (AT-001 to AT-006)
- Technical backlog (deferred items) → `15-project-control/technical-backlog.md`
- Security threats (STRIDE) → `05-architecture/security-threat-model.md`
- Architecture decisions that originated these risks → ADR-005, ADR-006, ADR-007, ADR-009, ADR-010, ADR-011, ADR-012
- Operational dependencies behind R-001/R-007 and current release gates → `15-project-control/dependencies.md`, `10-devops/releases/2.0.0.md`
