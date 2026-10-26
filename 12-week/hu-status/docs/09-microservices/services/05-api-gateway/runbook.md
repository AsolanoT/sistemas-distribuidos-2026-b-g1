# Runbook — synkro-api-gateway

> Operator procedure for the selected reviewed candidate, with explicit target
> and protected access. No hosted production URL/on-call automation is invented.

**Service:** synkro-api-gateway. **Repository:** [owner](https://github.com/code-corhuila/synkro-api-gateway). **Last updated:** 2026-10-25 — Week 12. **Inspected main:** 5e5c3d5bdd67ae8c20eba2eaf2241d43a67adcde.

---

## 1. Quick service information

| Field | Value |
|-------|-------|
| Local port | 8000 published |
| Production/Staging URL | Not established; environment definition/branch is not deployed URL |
| Dashboard | Candidate Grafana tooling only; complete instrumented service dashboard not established |
| Alert channel | Actual team coordination + GitHub incident record; no installed PagerDuty/Slack integration claimed |
| Escalation | Development team/affected owner; AsolanoT technical coordination, SantiagoPlazas2005 operations coordination, using existing project contacts |
| Target RTO/RPO | Not ratified or measured; persistent recovery remains TD-022 |
| Delivery state | Delivered v2.0.0 component; upstream/full-root acceptance remains separate |

---

## 2. Verify the service is healthy

Identify the root/lock/environment and keep the normal exposure/credential guards. From the reviewed Infra root:

```bash
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-api-gateway --format '{{.ID}} {{.Status}}'
```

Only the selected engine/container is established by those commands. For the diagnostic context explicitly described below:

```bash
curl --fail --max-time 10 http://localhost:8000/health
```

GET localhost:8000/health checks Gateway only; confirm actual routed owner behavior separately. A health response/file presence is not real business/role/ownership acceptance. Use the actual owner README and [release evidence](../../../10-devops/releases/2.0.0.md); no new runtime result is claimed.

---

## 3. Frequent alerts and what to do

### Alert: High 5xx error rate

Separate Gateway-generated failures from an upstream response. Check the selected NGINX configuration, request-time service DNS, route and upstream availability; preserve safe correlation. /health only proves the Gateway. Credential-presence checks, rate limits and CORS do not validate JWT signatures or grant domain authority.

Record safe UTC, available correlation, exact revisions and the last relevant change using restricted logs/evidence. Automated service instrumentation/notifications remain TD-006. Never publish expanded Compose, process environment, secrets or raw credential-bearing diagnostics. The [decision record](decisions.md#consequences-and-unresolved-implementation) centralizes unresolved implementation.

### Alert: High latency (p95 > SLO)

Inspect upstream timing, DNS resolution, selected route and configured transport limits. A 502/504 or lost upstream response may leave a write outcome unknown; do not automatically resubmit business writes. This component has no database pool or measured service SLO to tune.

### Alert: Container exits or restarts

Check only the target project/service process, exact configuration and restricted logs. Docker health may detect failure; it does not itself restart an unhealthy container. Preserve other users' containers/volumes/network; no broad prune/rebuild or Kubernetes procedure applies.

---

## 4. Procedures by component

### 4.1 Database

Not applicable: this component has no database, migration history, grants to verify or own data backup. Do not run another owner's migrations or data recovery from this runbook.

### 4.2 External dependencies

Routes to Auth, Customers, Products, Sales and Workflow using request-time DNS. Gateway checks credential presence where required; it does not verify JWT signatures, hold an Auth signing key or call Auth for validation on each request. Public login/refresh remain reachable without a prior bearer. Owning APIs/Workflow validate and authorize independently.

---

## 5. Maintenance operations

### 5.1 Scale the service

Review the actual traffic-entry arrangement, CORS configuration, routing and instance-local rate-limit state before adding proxies. This component has no store or application connection pool. No distributed rate-limit, load-balancer rollout or HA acceptance is established. Use the reviewed root/environment control; this record supplies no unvalidated scaling command.

### 5.2 Emergency deploy (hotfix)

Use the owner's protected hotfix/PR path, exact validated revision and [Git conventions](../../../00-governance/git-conventions.md). Main approval/check requirements remain; operator urgency is not their waiver. Candidate startup/update follows [local setup](../../../10-devops/local-setup.md), not scaffold main.

### 5.3 Rollback

Prefer a reviewed compatible forward fix. Use a reviewed compatible NGINX image/configuration revision and retain the correct upstream routes, public authentication exceptions, CORS, limits and correlation behavior. Gateway owns no database, migration or persistent business state to restore. Deployment rollback follows the protected owner/root path; there is no component database restore step.

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
