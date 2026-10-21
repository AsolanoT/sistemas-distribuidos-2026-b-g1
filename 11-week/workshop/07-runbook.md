# CP8 - Runbook: fast sale-submission availability burn

## Alert, scope and activation prerequisites

**Alert:** SynkroSaleSubmissionFastBurn; **severity:** critical; **team:** synkro-tech; **service:** synkro-api-gateway.
The 99.5% technical availability SLO is burning above 14.4x when BOTH 1h and 5m error ratios exceed 7.2%; evaluations run every 30 seconds, with no additional hold.
Scope: POST /api/v1/sagas/register-sale -> Workflow -> Customers validation -> Products stock reservation -> Sales registration.
This is a prepared operating procedure, not evidence that an incident occurred. CP3 is an isolated probe; CP4 Gateway instrumentation and CP7 operational deployment remain prerequisites.
Before activation, confirm the deployed revision emits the CP4 metrics/environment labels and the CP2 logs; missing telemetry means unknown, not healthy.
The alert annotation links to this file. Use only the alerted environment and the exact Compose project, manifests and protected configuration from its deployment record.

## Symptoms and first response

- Sales staff see technical errors, delayed submissions or uncertainty about whether a sale exists; Workflow may show RUNNING, COMPENSATED or FAILED.
- The alert identifies Gateway submission failure, not necessarily its root cause. A Products timeout is the CP1 dependency to investigate; also check Customers, Sales and the workflow store.
- A correct 422 insufficient-stock rejection alone is not this alert. A 201 response alone is not proof that a Sale was completed.
- Record incident start in UTC, environment, alert labels, current revision, failed operation, correlation ID, W3C trace ID and known saga ID; keep credentials and personal data out.
- Acknowledge through the existing team channel and appoint one coordinator. Ask the salesperson to retain the original sale intention and key; never submit a new key for an uncertain sale.

## Confirm the alert with PromQL

The following copyable queries target qa. Replace ONLY the environment value with the alert's dev/qa/prod label; keep route, method and eligibility aligned with CP6/CP7.
First inspect eligible volume; zero/missing data cannot confirm recovery:

```promql
sum(increase(synkro_gateway_requests_total{environment="qa",route="/api/v1/sagas/register-sale",method="POST",outcome=~"success|technical_failure"}[5m]))
```

Five-minute burn rate:

```promql
sum(rate(synkro_gateway_requests_total{environment="qa",route="/api/v1/sagas/register-sale",method="POST",outcome="technical_failure"}[5m])) / sum(rate(synkro_gateway_requests_total{environment="qa",route="/api/v1/sagas/register-sale",method="POST",outcome=~"success|technical_failure"}[5m])) / 0.005
```

One-hour burn rate:

```promql
sum(rate(synkro_gateway_requests_total{environment="qa",route="/api/v1/sagas/register-sale",method="POST",outcome="technical_failure"}[1h])) / sum(rate(synkro_gateway_requests_total{environment="qa",route="/api/v1/sagas/register-sale",method="POST",outcome=~"success|technical_failure"}[1h])) / 0.005
```

Both burn results must be >14.4 to confirm this alert. Check scrape health/history as well; short-window spikes or a missing exporter must not be presented as the same condition.
Review the rolling availability budget consumed (1.0 = 100%, 0.75 = 75%, 0.5 = 50%):

```promql
sum(increase(synkro_gateway_requests_total{environment="qa",route="/api/v1/sagas/register-sale",method="POST",outcome="technical_failure"}[30d])) / (0.005 * sum(increase(synkro_gateway_requests_total{environment="qa",route="/api/v1/sagas/register-sale",method="POST",outcome=~"success|technical_failure"}[30d])))
```

## Find the failing hop in logs and saga state

Existing project log access is Docker Compose stdout; no Loki/LogQL deployment is assumed.
From the deployed root composition directory (synkro-infra-postgres), copy the actual project/file/config paths from its deployment record into these placeholders.
The configuration file is an already approved private runtime file, not an example file. Do not print its contents or dump full Compose configuration.

```powershell
$incidentProject = '<actual deployed Compose project>'
$incidentComposeFile = '<actual root Compose manifest>'
$incidentEnvFile = '<approved runtime environment file>'
$incidentCompose = @('--project-name', $incidentProject, '--file', $incidentComposeFile, '--env-file', $incidentEnvFile)
docker compose @incidentCompose config --services
docker compose @incidentCompose ps
$traceId = '4bf92f3577b34da6a3ce929d0e0e4736'
$incidentServices = @('synkro-api-gateway','synkro-workflow','synkro-customers-api','synkro-products-api','synkro-sales-api')
docker compose @incidentCompose logs --since 1h --no-color --no-log-prefix @incidentServices |
  ForEach-Object {
    try {
      $entry = $_ | ConvertFrom-Json -ErrorAction Stop
      if ($entry.trace_id -eq $traceId) { $entry }
    } catch {}
  } | Sort-Object timestamp |
  Select-Object timestamp,level,service,event,span_id,correlation_id,saga_id,step,duration_ms,message
```

Replace the example trace ID with the incident's real ID and confirm service keys using config --services; adjust only keys actually deployed.
If only an API error traceId is available, it is X-Correlation-Id, NOT the W3C trace_id. First locate the Workflow entry by correlation_id or legacy correlationId, then read its trace_id.
If logs lack W3C fields, investigate using correlation and saga IDs and record the instrumentation gap; do not invent a connected trace.
Look for stock.reservation.timeout/rejected/failed, failedStep, participant latency and whether a reservation or sale was actually recorded.
Read GET /api/v1/sagas/{id} through the Gateway with an authorized ADMIN/SALESPERSON session. Check status, completedSteps, failedStep and saleId.
Only the authorized participant operator should inspect internal reservation/idempotency evidence; a human token is not a workflow service token.
A lost Sales response does not prove no sale exists. Confirm the original idempotent result before any decision that could release its stock.

## First three mitigations, in increasing risk order

Apply only the step supported by the evidence. Record operator, time, revision and result; verify after each change before continuing.

| Order / risk | Action | Execution and constraints |
|---|---|---|
| 1 - Lowest: operational containment | Pause new sale submissions | Coordinator asks ADMIN/SALESPERSON staff to stop creating new sale intentions temporarily; keep permitted read-only saga/status access available. Retain original keys and existing saga records. This is a manual operating pause, not an invented feature flag. |
| 2 - Moderate: targeted process recovery | Restore only the failing participant/process | Infra operator confirms a stopped/unhealthy process, its own dependency health and mounted configuration. Start the stopped service with its existing artifact; use one controlled restart only if justified. Keep all stores/volumes intact and observe normal persisted recovery. A healthy process with a slow database needs investigation, not repeated restarts. |
| 3 - Higher: application rollback | Revert the identified deployment regression | Only with a correlated recent change and a verified known-good artifact/revision compatible with current APIs, saga state and schemas. Use the established release/Compose procedure to redeploy only the affected component. Do not downgrade migrations or roll back PostgreSQL/MongoDB data. If no compatible artifact is established, escalate instead. |

For step 2, after confirming the affected key, the operator can use ONE applicable command with the deployment parameters above:

```powershell
$incidentService = 'synkro-products-api'
docker compose @incidentCompose up -d --no-deps --no-build $incidentService
# For a justified restart of an existing unhealthy process, use this instead:
docker compose @incidentCompose restart --no-deps $incidentService
```

These are operating instructions, not commands executed to prepare this runbook. Select the actual failing service rather than automatically restarting Products.
The shared PostgreSQL instance serves several schemas; restarting it has a wider impact and is not one of these initial participant-process actions.
Retain workflow_schema, Products reservations and Sales documents. Do not run compose down -v, reset attempt counts, edit saga rows ad hoc or manually create a replacement sale.

## Supported recovery and controls deliberately excluded

After participant recovery, the deployed workflow's normal durable scanner/startup recovery can resume eligible RUNNING sagas with their original sagaId:step keys.
Confirm that capability on the actual deployed revision. The CP3 probe has no durable saga store or recovery executor.
The current Workflow recovery contract can suspend ambiguous operations as RUNNING/OUTCOME_UNRESOLVED after bounded attempts; a restart does not clear that suspension.
FAILED compensation has no automatic repair endpoint. Route suspended/FAILED cases to participant owners and the lead; preserve reservations when a Sales outcome is uncertain.
Architecture documentation adopts a circuit breaker, but no manual force-open endpoint or switch was verified for this delivery. Do not invent an actuator call.
No sales feature-flag mechanism or autoscaling controller is documented. Do not depend on either, scale duplicate workflow executors or increase timeouts/retry bounds during diagnosis.
The deployed Workflow recovery contract may have different limits from architecture defaults; inspect the actual revision/configuration rather than assuming the workshop's deadline is its live value.

## Escalation and team roles

The following incident assignments are proposed for this four-person team and must be confirmed at incident start; they are not permanent service ownership or an invented on-call schedule.

| Role / person | Responsibility |
|---|---|
| Technical lead / incident coordinator - Angel Gustavo Solano Trujillo | Coordinates the response, assigns one change operator, reviews budget/integrity impact and records recovery or continued restrictions. |
| Frontend/session and trace support - Jordan Ramirez Gallego | Helps locate the user's original correlation/saga evidence, coordinates the temporary submission pause and verifies portal/session behavior after restoration. |
| Go participant/data support - Sergio Andres Ordonez Diaz | Investigates Products/Sales with their current assignees; verifies reservation, frozen lines, sale outcome and idempotency evidence. |
| Java/security support - Fredman Santiago Plazas Artunduaga | Assists Workflow/Auth investigation, credential/configuration checks and recovery review without disclosing token values. |
| Infrastructure operator - qualified team member assigned by the lead | Confirms Compose environment and artifact, performs the single scoped recovery/rollback, and verifies stores and runtime health. |

Escalate immediately to the lead and affected data owners for negative stock, duplicate effects, FAILED compensation or unresolved Sales evidence.
Proposed coordination thresholds: if no acknowledgement within 5 minutes, contact the whole team through its existing channel; if no safe mitigation within 10 minutes, request the relevant infrastructure and participant owners together.
Record a single timeline so two operators do not apply conflicting changes. Required main-branch approvals remain required; the instructor is involved when a formal project/release decision requires it.

## Verify recovery before closing

1. Verify the affected component's /health and its own store connectivity. Workflow /health covers its store, not participant availability; Gateway /health does not prove the journey.
2. Check the original saga through its read endpoint: COMPLETED must have a real saleId; a business rejection must have completed any required safe compensation. Keep ambiguous/FAILED cases open for owner review.
3. Resume new submissions gradually under the coordinator with legitimate authorized sales; verify one real sale effect and its single stock deduction. Keep fixture/synthetic traffic separate from the real SLI.
4. Confirm positive eligible traffic and normal logs. Five-minute burn should return <=1 (error ratio <=0.005); the fast AND expression must remain false during at least 15 minutes of observation. A quiet/no-traffic alert disappearance is not recovery evidence.
5. Recheck both CP7 alerts and the actual 30-day budgets, document remaining failures and resume conditions. Do not require the historical one-hour burn to instantly return to zero.
6. Record times, artifact, successful checks, outstanding sagas and follow-up work. A restored service does not automatically lift a CP6 feature-release freeze; follow its budget policy.

## References and verification status

[CP1](01-journey.md), [CP2](02-log-contract.md), [CP6](05-slo.md), [CP7 rules](06-alerts.yml), [CP7 policy](06-alert-policy.md).
[Pattern guide](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/pattern-guide.md), [deployment](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/deployment.md), [ADR-007](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md).
[Workflow's current recovery contract](https://github.com/code-corhuila/synkro-workflow/blob/main/docs/deployment-and-recovery.md), [team governance](https://github.com/code-corhuila/synkro-docs/blob/main/00-governance/documentation-rules.md).
Procedure reviewed against these sources and the local CP3/CP7 artifacts. The incident actions were not executed; the CP9 drill remains a separate checkpoint.