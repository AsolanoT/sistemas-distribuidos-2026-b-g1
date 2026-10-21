# CP6 - SLIs, SLOs and error budget

## Journey, scope and status

Journey: an ADMIN or SALESPERSON submits a sale through Gateway; Workflow validates Customer, reserves Product stock and registers Sale with its frozen prices.
These are proposed internal reliability objectives, not a claim of a production SLA or measured compliance. Availability 99.5% is an initial single-instance MVP target; latency follows the proposed NFR default, and 99% timely resolution prioritizes a clear sale outcome.
All three windows are rolling 30 days in one environment. Use the environment-scoped datasource from [CP4](04-metrics.md); never combine dev, qa and prod.
The availability and latency SLIs use CP4's Gateway metric names for POST /api/v1/sagas/register-sale.
The third uses the explicitly proposed Workflow domain counter added to CP4 in this checkpoint; existing HTTP counters alone cannot distinguish COMPLETED, RUNNING and COMPENSATED.
CP3 exports only a local Workflow probe: production Gateway metrics, the 0.3-second bucket and the domain counter are not implemented there.
PromQL below is the exact target contract, not a query executed against a live Prometheus server.

## SLO 1 - Technical availability of sale submission

**Objective:** at least 99.5% over rolling 30 days.
**Valid events:** observed Gateway POST responses classified success or technical_failure. **Good events:** success. **Bad events:** technical_failure.
**SLI:** good eligible HTTP attempts / all eligible HTTP attempts.
Authentication/validation 4xx and rate-limiting policy rejections are excluded by CP4's business_rejected category; they must be tracked separately.
This deliberately scoped technical SLI does not promise admission under throttling. If 429 affects legitimate normal traffic, revise its classification before treating this as full user availability.

```promql
sum(increase(synkro_gateway_requests_total{route="/api/v1/sagas/register-sale",method="POST",outcome="success"}[30d])) / sum(increase(synkro_gateway_requests_total{route="/api/v1/sagas/register-sale",method="POST",outcome=~"success|technical_failure"}[30d]))
```

A 201 response is good for submission availability even when the saga is pending; SLO 3 evaluates the actual transaction resolution.
A Gateway outage that prevents observation is not measurable from these server counters alone. Independent client/synthetic monitoring is required before claiming complete user-visible availability.
Timeouts reaching an instrumented Gateway must be recorded as technical_failure, including its own upstream failures.

## SLO 2 - Sale-submission response latency

**Objective:** at least 95% of observed sale-submission HTTP responses finish in at most 0.3 seconds over rolling 30 days.
**Valid events:** every observation of the named POST in the Gateway latency histogram. **Good events:** duration <= 0.3 seconds. **Bad events:** duration > 0.3 seconds.
**SLI:** responses in the cumulative le="0.3" bucket / all observations in _count.

```promql
sum(increase(synkro_gateway_request_duration_seconds_bucket{route="/api/v1/sagas/register-sale",method="POST",le="0.3"}[30d])) / sum(increase(synkro_gateway_request_duration_seconds_count{route="/api/v1/sagas/register-sale",method="POST"}[30d]))
```

This response-time SLI includes HTTP rejections because CP4's histogram has no outcome label; it is not a success-conditioned latency SLI.
It follows NFR-001's proposed critical-endpoint 300 ms default; load tests must establish whether it is realistic for this sequential saga.
It measures the initial response, not time until a RUNNING saga completes. SLO 3 covers that product concern.
The 0.3 bucket is mandatory before this query works; CP3 currently has 0.25 and 0.5 only. Do not estimate this SLI by averaging percentiles or interpolating those buckets.

## SLO 3 - Safe, timely resolution of an accepted sale saga

**Objective:** at least 99% of classified sale sagas reach a qualifying resolution within 10 seconds over rolling 30 days.
**Valid events:** one persisted classification per new accepted register-sale saga, recorded at its terminal result or 10-second deadline.
**Good events:** completed, or business_rejected with all required stock compensation confirmed, within the deadline.
**Bad events:** technical_failure, including FAILED or compensation after a technical failure, and deadline_exceeded. A RUNNING saga at the deadline is bad.
**SLI:** (completed + business_rejected decisions) / all four resolution decisions.

```promql
sum(increase(synkro_workflow_sale_resolutions_total{resolution=~"completed|business_rejected"}[30d])) / sum(increase(synkro_workflow_sale_resolutions_total[30d]))
```

The 10-second target matches the documented SAGA_REQUEST_TIMEOUT; it is a provisional product target, not the CP3 client's 3-second timeout.
The decision window uses decision timestamps; sagas younger than 10 seconds are pending until resolved or due. Later recovery never erases a deadline miss.
Use the CP4 extension's durable, deduplicated classification contract; replaying the same Idempotency-Key must not inflate good events.
This objective protects the salesperson from an uncertain sale and stranded stock without treating a correct insufficient-stock rejection as an outage.
Stock must never be negative; sale effects and reservation release must not be duplicated. Those are hard invariants, with zero tolerated violations, independent of this SLO's budget.

## Traffic estimate and justification

SynkroTech is a fictional academic company; its product framing explicitly has no real staff count or traffic measurements.
Use a transparent planning scenario: 3 active salespeople x 4 new sale intentions/hour x 8 hours/business day x 26 trading days in a representative 30-day window (an assumed six-day retail schedule).
That is 12 intentions/hour, 96/day, and **2496 new intentions per window**. One intention per salesperson every 15 minutes is a plausible electronics-sale planning assumption, not observed evidence.
Assume valid authenticated input and no frontend replay in this baseline. Actual HTTP-attempt counts and accepted-saga counts can differ; compute each real budget from its own observed eligible denominator.
Working time = 26 x 8 x 60 = **12480 minutes**; uniform working-time arrival rate = 2496 / 12480 = **0.2 intentions/minute**.
Do not multiply this user volume by the five service hops. Exclude health checks, saga GET polling, fixture/load traffic and unrelated operations from the production journey estimate.
Validate the model with counted Gateway submissions and durable saga decisions in a representative pilot; include authorized ADMIN submissions if present.

## Error-budget calculations

For each SLO: allowed bad fraction b = 1 - target; bad-event budget B = b x eligible events; consumed fraction = observed bad / B.
Using the 2496-event planning baseline independently for each SLO:

| SLO | Target | Bad fraction | Fractional budget B | Largest whole bad count still meeting target | Full-breach equivalent working minutes: B / 0.2 |
|---|---|---|---|---|---|
| Submission availability | 99.5% | 0.005 | 12.48 requests | 12 | 62.4 |
| Submission <= 300 ms | 95% | 0.05 | 124.8 requests | 124 | 624 |
| Safe saga resolution <= 10 s | 99% | 0.01 | 24.96 sagas | 24 | 124.8 |

For example, availability allows 12/2496 failures; the 13th breaches 99.5%. Never round 12.48 up to 13 permitted failures.
Calendar window = 30 x 24 x 60 = 43200 minutes. Under a DIFFERENT uniform 24x7 arrival assumption, equivalent full-breach times would be 216, 2160 and 432 minutes respectively.
Use 62.4 working minutes as the primary availability equivalent for this business-hours scenario, not 216 actual operating minutes.
All minute figures are traffic-weighted full-breach equivalents, not guaranteed downtime allowances or sums of individual response delays.
During a peak, the same number of failures burns budget faster; an outage with no arrivals cannot be inferred from a request ratio.
The observed denominators replace the forecast at runtime. The three budgets are independent and cannot be traded or added; the strictest triggered policy applies.
Prometheus increase can return fractional estimates because of extrapolation; whole-event examples above illustrate exact counts, not rounding rules for PromQL.

## Proposed team policy at 50%, 75% and 100% consumed

Apply these bands independently to each rolling budget; missing data never authorizes a release.

| Consumed budget | Team action |
|---|---|
| Below 50% | Continue planned work under existing checks; review SLI coverage and recent failures before releases. |
| 50% to below 75% | Assign an incident/reliability owner, investigate the traces and saga decisions, prioritize a corrective task, and limit rollout scope. |
| 75% to below 100% | Defer optional feature releases touching Gateway, Workflow or saga participants; focus on timeout, idempotency, recovery and compensation fixes, and verify them before rollout. |
| 100% or more | Freeze feature releases for the affected journey. Allow only incident restoration and urgent security fixes through existing controls; record impact, root cause and corrective actions. |

In the availability forecast, the 50% / 75% / 100% boundaries are 6.24 / 9.36 / 12.48 bad events; exact integer counts first cross them at 7 / 10 / 13.
At a freeze, the technical lead coordinates the responsible component owners. Resume feature releases only when every SLO is back within budget, corrective checks pass and the lead records the recovery review.
Do not reset counters, shorten the window or reclassify real failures to manufacture a new budget. As a rolling window advances, old events naturally leave it.
Any negative stock, duplicate sale effect or unsafe release triggers immediate investigation and suspension of the affected write path regardless of percentages.
These are proposed team conventions for review; they do not bypass existing branch protections or required approvals.

## Measurement prerequisites and project references

Use the same eligibility/label definitions for counters and panels, initialize bounded outcome series at zero, and retain at least 35 days to evaluate a complete 30-day window.
A zero denominator, missing bucket/series, scrape gap or incomplete history means unknown, not 100% compliance; verify coverage independently.
Neither the domain SLI nor the complete journey is measurable with the CP3 fixture alone. No live SLI or budget-consumption result is asserted here.
- [CP1 journey](01-journey.md), [CP4 catalog and domain extension](04-metrics.md).
- [Domain invariants](https://github.com/code-corhuila/synkro-docs/blob/main/02-domain/entities-and-rules.md), [ADR-007](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md), [deployment](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/deployment.md).
- [Product framing](https://github.com/code-corhuila/synkro-docs/blob/main/03-product/problem-framing.md), [NFR-001/NFR-005](https://github.com/code-corhuila/synkro-docs/blob/main/04-requirements/non-functional.md).
- [Google SRE: SLOs](https://sre.google/workbook/implementing-slos/), [error-budget policy](https://sre.google/workbook/error-budget-policy/), [Prometheus increase](https://prometheus.io/docs/prometheus/latest/querying/functions/#increase).