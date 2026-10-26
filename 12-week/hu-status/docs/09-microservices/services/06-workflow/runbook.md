# Runbook — synkro-workflow

> Operator procedure for the selected reviewed candidate, with explicit target
> and protected access. No hosted production URL/on-call automation is invented.

**Service:** synkro-workflow. **Repository:** [owner](https://github.com/code-corhuila/synkro-workflow). **Last updated:** 2026-10-25 — Week 12. **Inspected main:** 09a193866f05f3714a0bd1ad6d7559a9f00b3611.

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
| Delivery state | Delivered v2.0.0 component; TD-014/015/016 and exact-root acceptance remain |

---

## 2. Verify the service is healthy

Identify the root/lock/environment and keep the normal exposure/credential guards. From the reviewed Infra root:

```bash
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-workflow --format '{{.ID}} {{.Status}}'
```

Only the selected engine/container is established by those commands. For the diagnostic context explicitly described below:

```bash
# Run inside an operator-controlled diagnostic environment attached to platform, with curl installed.
# This is an internal URL, not a host localhost port or a new published service.
curl --fail --max-time 10 http://synkro-workflow:8080/health
```

Bounded own saga-store readiness; real participant effects/replay/restart acceptance remains a distinct exact-lock suite. A health response/file presence is not real business/role/ownership acceptance. Use the actual owner README and [release evidence](../../../10-devops/releases/2.0.0.md); no new runtime result is claimed.

---

## 3. Frequent alerts and what to do

### Alert: High 5xx error rate

Inspect workflow_schema state/attempt evidence and the failing participant response under Accepted ADR-015. Only validated operation-specific rejection may justify release. Ambiguous or possibly committed outcomes retain stock and original identity; do not use a fresh key, manual release or broad restart as proof of failure. Check own-store access and protected participant SERVICE credential separately.

Record safe UTC, available correlation, exact revisions and the last relevant change using restricted logs/evidence. Automated service instrumentation/notifications remain TD-006. Never publish expanded Compose, process environment, secrets or raw credential-bearing diagnostics. The [decision record](decisions.md#consequences-and-unresolved-implementation) centralizes unresolved implementation.

### Alert: High latency (p95 > SLO)

Separate own datasource/lease acquisition from bounded participant HTTP attempts. Preserve operation identity and inspect durable attempts before deciding recovery. RUNNING is not a guarantee of automatic continuation; timeout is not proof of rejection. Circuit Breaker and retry/jitter discrepancies remain TD-015/016; no measured service SLO is established.

### Alert: Container exits or restarts

Check only the target project/service process, exact configuration and restricted logs. Docker health may detect failure; it does not itself restart an unhealthy container. Preserve other users' containers/volumes/network; no broad prune/rebuild or Kubernetes procedure applies.

---

## 4. Procedures by component

### 4.1 Database

Store ownership: PostgreSQL workflow_schema / workflow_app. Migration owner: Own db/ Flyway V001–V005/U001–U005 via workflow-db-migrate, official 11.20.3-alpine. Follow [deployment](../../../05-architecture/deployment.md#5-migrations), verify only the owning history/grants and back up qa/main before additive changes. Never use a runtime API credential to migrate or access another domain's store.

### 4.2 External dependencies

Verify incoming person JWTs locally with the configured Auth public key. Outgoing Customer validation, Products reserve/release and Sales registration use the configured Workflow SERVICE token directly, not the person token or Gateway. Own workflow_schema stores execution evidence. TD-014/015/016 remain in the linked implementation record; no per-request Auth validation or implemented Circuit Breaker is inferred.

---

## 5. Maintenance operations

### 5.1 Scale the service

Review dedicated lease sessions, own-store pool capacity and execution exclusivity before changing replicas. The delivered lease algorithm differs from the accepted lock-partition target (TD-014). Preserve participant idempotency and durable evidence; no horizontal rollout or HA acceptance is established. Use the reviewed root/environment control; this record supplies no unvalidated scaling command.

### 5.2 Emergency deploy (hotfix)

Use the owner's protected hotfix/PR path, exact validated revision and [Git conventions](../../../00-governance/git-conventions.md). Main approval/check requirements remain; operator urgency is not their waiver. Candidate startup/update follows [local setup](../../../10-devops/local-setup.md), not scaffold main.

### 5.3 Rollback

Prefer a reviewed compatible forward fix. Check compatibility with persisted saga state, attempts, participant receipts and lease behavior. Preserve unresolved reservations/identities and record a responsible recovery plan. An older binary, process restart or app rollback must not be treated as compensation or evidence that an uncertain Sale was not committed. Follow [backup/recovery](../../../13-operations/backup-and-recovery.md); delivered restoration is to new disposable targets, not persistent cutover or administrator recovery.

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
