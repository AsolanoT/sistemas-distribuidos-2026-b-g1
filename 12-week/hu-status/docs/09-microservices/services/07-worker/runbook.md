# Runbook — synkro-worker

> Operator procedure for the selected reviewed candidate, with explicit target
> and protected access. No hosted production URL/on-call automation is invented.

**Service:** synkro-worker. **Repository:** [owner](https://github.com/code-corhuila/synkro-worker). **Last updated:** 2026-10-25 — Week 12. **Inspected main:** 8ccef730f849807809c5b11c135bc7cae3ce6342.

---

## 1. Quick service information

| Field | Value |
|-------|-------|
| Local port | None |
| Production/Staging URL | Not established; environment definition/branch is not deployed URL |
| Dashboard | Candidate Grafana tooling only; complete instrumented service dashboard not established |
| Alert channel | Actual team coordination + GitHub incident record; no installed PagerDuty/Slack integration claimed |
| Escalation | Development team/affected owner; AsolanoT technical coordination, SantiagoPlazas2005 operations coordination, using existing project contacts |
| Target RTO/RPO | Not ratified or measured; persistent recovery remains TD-022 |
| Delivery state | Partial scheduler foundation merged on main, no v2.0.0 tag |

---

## 2. Verify the service is healthy

Identify the root/lock/environment and keep the normal exposure/credential guards. From the reviewed Infra root:

```bash
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-worker --format '{{.ID}} {{.Status}}'
```

Only the selected engine/container is established by those commands. For the diagnostic context explicitly described below:

```bash
# Worker has no HTTP health endpoint. Inspect the selected process/container only.
```

No /health endpoint. Inspect container/process state and scheduler logs; neither certifies low-stock work. Process state and placeholder logs are the observable evidence here, not low-stock business acceptance. Use the actual owner README and [release evidence](../../../10-devops/releases/2.0.0.md); no new runtime result is claimed.

---

## 3. Frequent alerts and what to do

### Alert: Job failure or unexpected business result

The delivered process runs a logging placeholder; it has no HTTP listener or implemented business HTTP call, so there is no Worker 5xx response to investigate. Check protected startup configuration, process exit status and scheduler/job logs. Placeholder completion does not prove that an alert was created or resolved; TD-019 remains required scope.

Record safe UTC, available correlation, exact revisions and the last relevant change using restricted logs/evidence. Automated service instrumentation/notifications remain TD-006. Never publish expanded Compose, process environment, secrets or raw credential-bearing diagnostics. The [decision record](decisions.md#consequences-and-unresolved-implementation) centralizes unresolved implementation.

### Alert: Job does not finish within RUN_TIMEOUT

Check the sequential scheduler and whether the job observes context cancellation. RUN_TIMEOUT defaults to 2m and is cooperative: it does not forcibly stop an uncooperative job. LOW_STOCK_EVERY defaults to 15m. No HTTP latency percentile, business completion guarantee or measured job SLO is established; TD-020 retains the panic/cancellation boundary.

### Alert: Container exits or restarts

Inspect process exit and scheduler logs; a panic may terminate the process, and cancellation is cooperative. No HTTP health endpoint or automatic business recovery is delivered. Preserve other users' containers/volumes/network; no broad prune/rebuild or Kubernetes procedure applies.

---

## 4. Procedures by component

### 4.1 Database

Not applicable: this component has no database, migration history, grants to verify or own data backup. Do not run another owner's migrations or data recovery from this runbook.

### 4.2 External dependencies

No incoming HTTP/JWT-validation path and no implemented outbound business HTTP call. Startup requires protected SERVICE_TOKEN configuration, but the current placeholder does not call Products with it. The intended real job will use Products SERVICE APIs, never its database; no transport retry/Circuit Breaker behavior is delivered by this placeholder.

---

## 5. Maintenance operations

### 5.1 Scale the service

The current process schedules sequentially, but multiple Worker replicas could duplicate intended future work. No cross-replica job coordination or HA acceptance is established. Before adding replicas, design and verify the real business intent/idempotency/coordination behavior under the existing required job scope. Use the reviewed root/environment control; this record supplies no unvalidated scaling command.

### 5.2 Emergency deploy (hotfix)

Use the owner's protected hotfix/PR path, exact validated revision and [Git conventions](../../../00-governance/git-conventions.md). Main approval/check requirements remain; operator urgency is not their waiver. Candidate startup/update follows [local setup](../../../10-devops/local-setup.md), not scaffold main.

### 5.3 Rollback

Prefer a reviewed compatible forward fix. Use a reviewed compatible Worker image/configuration revision and preserve evidence of scheduler/job outcomes. Worker owns no database, migrations or persistent business records. Do not restore or modify Products data through Worker rollback, and do not claim that replacing the process implements the missing alert job. Deployment rollback follows the protected owner/root path; there is no component database restore step.

---

## 6. Communication during incident

| Event | Channel | Sample record |
|-------|---------|---------------|
| Detection | Actual team channel + GitHub incident | Safe service/environment/root/owner revisions, UTC, symptoms and correlation |
| Update | Same recorded coordination | Operator, bounded action/result, remaining uncertainty; no fabricated ETA |
| Resolution | Incident and affected stakeholders | Verified process/job outcome and its business limits, duration, remaining follow-up/owner |

---

## 7. Post-incident checklist

- [ ] Verify the actual scheduler/placeholder process outcome; keep the missing business job explicitly unresolved.
- [ ] Preserve safe exact revision/command/scope/result and restricted evidence references.
- [ ] Record actual resolution/remaining uncertainty under [incident management](../../../13-operations/incident-management.md).
- [ ] Coordinate follow-up with existing [technical backlog](../../../15-project-control/technical-backlog.md), without inventing new HU IDs.
- [ ] Restore protected collection/monitoring where required and review scope-specific recovery before resuming the scheduler.
