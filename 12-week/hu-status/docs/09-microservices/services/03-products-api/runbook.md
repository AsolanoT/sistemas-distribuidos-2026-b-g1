# Runbook — synkro-products-api

> Operator procedure for the selected reviewed candidate, with explicit target
> and protected access. No hosted production URL/on-call automation is invented.

**Service:** synkro-products-api. **Repository:** [owner](https://github.com/code-corhuila/synkro-products-api). **Last updated:** 2026-10-25 — Week 12. **Inspected main:** 8c04934ae5b51417a0b88506cc59734ef7913e64.

---

## 1. Quick service information

| Field | Value |
|-------|-------|
| Local port | 8080 internal |
| Production/Staging URL | Not established; environment definition/branch is not deployed URL |
| Dashboard | Candidate Grafana tooling only; complete instrumented service dashboard not established |
| Alert channel | Actual team coordination + GitHub incident record; no installed PagerDuty/Slack integration claimed |
| Escalation | Development team/affected owner; AsolanoT technical coordination, SantiagoPlazas2005 operations coordination, using existing project contacts |
| Target RTO/RPO | Not ratified or measured; persistent recovery remains TD-022 |
| Delivery state | Delivered v2.0.0 component; TD-017/018 and legacy stock receipt limit remain |

---

## 2. Verify the service is healthy

Identify the root/lock/environment and keep the normal exposure/credential guards. From the reviewed Infra root:

```bash
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-products-api --format '{{.ID}} {{.Status}}'
```

Only the selected engine/container is established by those commands. For the diagnostic context explicitly described below:

```bash
# Run inside an operator-controlled diagnostic environment attached to platform, with curl installed.
# This is an internal URL, not a host localhost port or a new published service.
curl --fail --max-time 10 http://synkro-products-api:8080/health
```

Public /health currently returns liveness without checking the store. Do not use it as database readiness; verify a real permitted persistence operation and owner store checks. A health response/file presence is not real business/role/ownership acceptance. Use the actual owner README and [release evidence](../../../10-devops/releases/2.0.0.md); no new runtime result is claimed.

---

## 3. Frequent alerts and what to do

### Alert: High 5xx error rate

A successful /health response proves liveness only, not products_schema readiness. Check the restricted datasource and real permitted catalog/stock operation. For an uncertain adjustment, reservation or release preserve its original key and inspect the original receipt/outcome; never repeat a stock delta with a new key. TD-017/018 and legacy receipt limits remain in the linked implementation record.

Record safe UTC, available correlation, exact revisions and the last relevant change using restricted logs/evidence. Automated service instrumentation/notifications remain TD-006. Never publish expanded Compose, process environment, secrets or raw credential-bearing diagnostics. The [decision record](decisions.md#consequences-and-unresolved-implementation) centralizes unresolved implementation.

### Alert: High latency (p95 > SLO)

Inspect own pool/query/transaction and stock-contention behavior. Reservation covers all lines atomically; a timeout does not authorize guessing whether stock changed. Do not bypass the original intent/receipt or infer database health from the liveness endpoint. No measured p95 or installed service SLO is established.

### Alert: Container exits or restarts

Check only the target project/service process, exact configuration and restricted logs. Docker health may detect failure; it does not itself restart an unhealthy container. Preserve other users' containers/volumes/network; no broad prune/rebuild or Kubernetes procedure applies.

---

## 4. Procedures by component

### 4.1 Database

Store ownership: PostgreSQL products_schema / products_app. Migration owner: synkro-products-db, Flyway V001–V017/U001–U017; official runner 11.20.3-alpine. Follow [deployment](../../../05-architecture/deployment.md#5-migrations), verify only the owning history/grants and back up qa/main before additive changes. Never use a runtime API credential to migrate or access another domain's store.

### 4.2 External dependencies

No outgoing domain HTTP dependency. Incoming JWT verification uses configured Auth public key locally, with person and SERVICE permissions checked by operation. Gateway and Workflow are real callers; Worker business calls remain intended. Alert state belongs to Products; a missing automatic producer is not a Products-to-Worker dependency.

---

## 5. Maintenance operations

### 5.1 Scale the service

Review own connection/transaction budget and atomic adjustment/reservation/release behavior under concurrent calls before adding replicas. Preserve shared idempotency/receipt semantics; no horizontal rollout or HA acceptance is established. Use the reviewed root/environment control; this record supplies no unvalidated scaling command.

### 5.2 Emergency deploy (hotfix)

Use the owner's protected hotfix/PR path, exact validated revision and [Git conventions](../../../00-governance/git-conventions.md). Main approval/check requirements remain; operator urgency is not their waiver. Candidate startup/update follows [local setup](../../../10-devops/local-setup.md), not scaffold main.

### 5.3 Rollback

Prefer a reviewed compatible forward fix. Verify compatibility with current catalog/stock/reservation and receipt structures, including V017 history. Preserve reservations, adjustments and frozen receipts. Do not clear history or recalculate old receipt values to make a rollback appear compatible. Follow [backup/recovery](../../../13-operations/backup-and-recovery.md); delivered restoration is to new disposable targets, not persistent cutover or administrator recovery.

---

## 6. Communication during incident

| Event | Channel | Sample record |
|-------|---------|---------------|
| Detection | Actual team channel + GitHub incident | Safe service/environment/root/owner revisions, UTC, symptoms and correlation |
| Update | Same recorded coordination | Operator, bounded action/result, remaining uncertainty; no fabricated ETA |
| Resolution | Incident and affected stakeholders | Verified business effects/evidence, duration, remaining follow-up/owner |

---

## 7. Post-incident checklist

- [ ] Verify the affected authorized behavior and component-specific evidence, beyond a healthy container.
- [ ] Preserve safe exact revision/command/scope/result and restricted evidence references.
- [ ] Record actual resolution/remaining uncertainty under [incident management](../../../13-operations/incident-management.md).
- [ ] Coordinate follow-up with existing [technical backlog](../../../15-project-control/technical-backlog.md), without inventing new HU IDs.
- [ ] Restore protected collection/monitoring where required and review scope-specific recovery before resuming traffic.
