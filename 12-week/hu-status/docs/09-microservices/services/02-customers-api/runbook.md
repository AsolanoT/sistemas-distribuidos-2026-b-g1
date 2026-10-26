# Runbook — synkro-customers-api

> Operator procedure for the selected reviewed candidate, with explicit target
> and protected access. No hosted production URL/on-call automation is invented.

**Service:** synkro-customers-api. **Repository:** [owner](https://github.com/code-corhuila/synkro-customers-api). **Last updated:** 2026-10-25 — Week 12. **Inspected main:** 28caff4f2d4c5e562416db7400061675e4b6766b.

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
| Delivery state | Delivered v2.0.0 component; owner correlated request/error logging gap #15 |

---

## 2. Verify the service is healthy

Identify the root/lock/environment and keep the normal exposure/credential guards. From the reviewed Infra root:

```bash
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-customers-api --format '{{.ID}} {{.Status}}'
```

Only the selected engine/container is established by those commands. For the diagnostic context explicitly described below:

```bash
# Run inside an operator-controlled diagnostic environment attached to platform, with curl installed.
# This is an internal URL, not a host localhost port or a new published service.
curl --fail --max-time 10 http://synkro-customers-api:8080/health
```

Bounded own-store health; authorized CRUD and denied cross-schema/audit actions need separate evidence. A health response/file presence is not real business/role/ownership acceptance. Use the actual owner README and [release evidence](../../../10-devops/releases/2.0.0.md); no new runtime result is claimed.

---

## 3. Frequent alerts and what to do

### Alert: High 5xx error rate

Check the Customers process and customers_schema connectivity/permissions. Distinguish documented validation, uniqueness and missing/inactive-resource responses from server failure. For an uncertain creation preserve the original intent key and payload. Use response correlation plus restricted evidence; complete correlated request/error logging remains owner issue #15.

Record safe UTC, available correlation, exact revisions and the last relevant change using restricted logs/evidence. Automated service instrumentation/notifications remain TD-006. Never publish expanded Compose, process environment, secrets or raw credential-bearing diagnostics. The [decision record](decisions.md#consequences-and-unresolved-implementation) centralizes unresolved implementation.

### Alert: High latency (p95 > SLO)

Inspect own datasource acquisition/query time and the exact lookup/filter/page being requested. There is no outgoing domain call to diagnose. Do not turn a timed-out creation into a new intent; first determine the original operation outcome. No measured p95 or installed service SLO is established.

### Alert: Container exits or restarts

Check only the target project/service process, exact configuration and restricted logs. Docker health may detect failure; it does not itself restart an unhealthy container. Preserve other users' containers/volumes/network; no broad prune/rebuild or Kubernetes procedure applies.

---

## 4. Procedures by component

### 4.1 Database

Store ownership: PostgreSQL customers_schema / customers_app. Migration owner: synkro-customers-db, Flyway V001–V007/U001–U007; guarded runner 10.20.1. Follow [deployment](../../../05-architecture/deployment.md#5-migrations), verify only the owning history/grants and back up qa/main before additive changes. Never use a runtime API credential to migrate or access another domain's store.

### 4.2 External dependencies

No outgoing domain HTTP dependency. Verify incoming person/SERVICE JWTs locally with the configured Auth public key; do not add a per-request Auth call. Gateway and Workflow are callers. Only the own Customers store is accessed; frontend route/lifecycle failures belong to the separate portal/Host.

---

## 5. Maintenance operations

### 5.1 Scale the service

Review the Customers connection budget and the own-store uniqueness/idempotency guarantees before adding replicas. No horizontal rollout or HA acceptance is established. Use the reviewed root/environment control; this record supplies no unvalidated scaling command.

### 5.2 Emergency deploy (hotfix)

Use the owner's protected hotfix/PR path, exact validated revision and [Git conventions](../../../00-governance/git-conventions.md). Main approval/check requirements remain; operator urgency is not their waiver. Candidate startup/update follows [local setup](../../../10-devops/local-setup.md), not scaffold main.

### 5.3 Rollback

Prefer a reviewed compatible forward fix. Check compatibility with current customer/idempotency structures and preserved identity-document uniqueness. Preserve customer lifecycle/history and applied migrations; follow the documented own-store backup/recovery boundary. Follow [backup/recovery](../../../13-operations/backup-and-recovery.md); delivered restoration is to new disposable targets, not persistent cutover or administrator recovery.

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
