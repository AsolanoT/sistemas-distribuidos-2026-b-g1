# CP9 - Incident drill and blameless postmortem

## Scope and explicit assumptions

**Status:** analytical tabletop drill; no fault was injected, service restarted or live telemetry collected. Logs and spans below are synthetic.
Journey: sale submission through synkro-api-gateway -> synkro-workflow -> Customers -> Products -> Sales, as defined in [CP1](01-journey.md).
Affected dependency: hop 4, POST /api/v1/stock-reservations on synkro-products-api.
Fault: that dependency takes 3000 ms for 25% of first reservation calls during a 40-minute business-hours interval; other calls are healthy.
Use CP6's 12 new intentions/hour: 8 valid, authenticated submissions at minutes 0, 5, 10, 15, 20, 25, 30 and 35. The two slow calls start from submissions at minutes 5 and 25.
Each intention creates one saga; there are no retries, replays, business rejections, missing responses or duplicate effects in this model.
Healthy submissions take 150 ms; affected ones take 3130 ms at Gateway and complete their saga in 3120 ms, including the 3000 ms Products call.

This selects CP1's synchronous completion path and the architecture deployment profile: HTTP_TIMEOUT=5s, SAGA_REQUEST_TIMEOUT=10s; assume Gateway waits long enough for the response.
Products therefore returns 201 before the deadline; Workflow returns a COMPLETED saga with saleId, and Gateway records success.
These are model assumptions from the design, not verified settings of the current executable delivery.
CP3 instead uses a 3000 ms client timeout, and the current Workflow recovery contract uses a 3000 ms participant response limit and a default 1000 ms initial HTTP deadline.
At an exact 3000 ms boundary, success versus timeout depends on timing; a 1000 ms initial deadline can return RUNNING before completion.
Consequently, this model cannot be reused as evidence for those configurations. Test their actual boundary behavior separately; do not assume a 25% HTTP failure rate from latency alone.

## One slow request: span tree

Example submission begins at minute 5, 2026-10-21T15:05:00.000Z; times below are offsets from Workflow entry.
All spans share trace_id=4bf92f3577b34da6a3ce929d0e0e4736; each span has its own ID.
Gateway is the transparent context carrier described in CP1, not an invented tracing span.

- SERVER Workflow POST /api/v1/sagas/register-sale: 3120 ms [0,3120], span_id=1111111111111111 (root).
  - CLIENT Workflow validate-customer: 40 ms [20,60], span_id=2222222222222222.
    - SERVER Customers GET /api/v1/customers/{id}: 35 ms [22,57], span_id=3333333333333333.
  - CLIENT Workflow reserve-stock: 3000 ms [70,3070], span_id=4444444444444444.
    - SERVER Products POST /api/v1/stock-reservations: 2990 ms [75,3065], span_id=5555555555555555.
  - CLIENT Workflow register-sale: 40 ms [3075,3115], span_id=6666666666666666.
    - SERVER Sales POST /api/v1/sales: 35 ms [3077,3112], span_id=7777777777777777.

The 3000 ms caller duration includes transport; the Products server span is slightly shorter. Parent and child durations overlap and must not be summed.
Workflow spends 3080 ms in participant CLIENT spans and 40 ms in local work/gaps; Gateway adds 10 ms, for 3130 ms total.
Each outgoing traceparent carries the same trace ID and that call's CLIENT span ID; its receiver creates the corresponding SERVER child.
This is synchronous HTTP, with no broker or asynchronous consumer span. Successful stock reservation needs no release/compensation.

## Four CP2-format log lines

Synthetic qa events, one JSON object per line; version identifies an illustrative drill profile, not an actual deployed release.
correlationId equals correlation_id; domain UUIDs are examples. No tokens, personal data, raw payloads or idempotency keys are recorded.
Products and Workflow have already allocated their saga/reservation IDs when the corresponding completion events are emitted.

```jsonl
{"timestamp":"2026-10-21T15:05:00.000Z","level":"INFO","service":"synkro-workflow","version":"drill-design-1","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","span_id":"1111111111111111","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","event":"saga.started","message":"Sale registration saga started","duration_ms":0,"saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","saga_status":"RUNNING"}
{"timestamp":"2026-10-21T15:05:00.057Z","level":"INFO","service":"synkro-customers-api","version":"drill-design-1","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","span_id":"3333333333333333","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","event":"customer.validated","message":"Customer is active","duration_ms":35,"customer_id":"7c9e6679-7425-40de-944b-e07fc1f90ae7","http_status":200,"outcome":"success"}
{"timestamp":"2026-10-21T15:05:03.065Z","level":"INFO","service":"synkro-products-api","version":"drill-design-1","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","span_id":"5555555555555555","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","event":"stock.reservation.completed","message":"Stock reserved after delayed processing","duration_ms":2990,"reservation_id":"6f1a42c8-12b0-4e58-92c4-8f94a06e7342","product_id":"550e8400-e29b-41d4-a716-446655440000","quantity":2,"http_status":201,"outcome":"success"}
{"timestamp":"2026-10-21T15:05:03.120Z","level":"INFO","service":"synkro-workflow","version":"drill-design-1","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","span_id":"1111111111111111","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","event":"saga.completed","message":"Sale registered with one stock reservation","duration_ms":3120,"saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","sale_id":"8ce835ef-45f3-452b-a905-17069e4c41e8","saga_status":"COMPLETED","http_status":201,"outcome":"success"}
```

## SLIs, budgets and first alert

Apply [CP6](05-slo.md) formulas to exact synthetic event counts after all eight submissions finish; these are not live PromQL results.
Gateway POST counter deltas: success=8, technical_failure=0, business_rejected=0.
Gateway POST histogram deltas: le="0.3" bucket=6, _count=8. Workflow resolution counter deltas: completed=8, all other resolution values=0.
Assume a complete, otherwise healthy 30-day window with 2496 eligible submissions and 2496 classified sagas, including these eight.

| SLI | Incident-cohort result | Rolling 30-day result | Incident bad events / monthly budget | Budget consumed | Equivalent working minutes consumed |
|---|---|---|---|---|---|
| Submission availability >=99.5% | 8/8 = 100% | 2496/2496 = 100% | 0 / 12.48 requests | 0% | 0 |
| Submission latency <=300 ms, >=95% | 6/8 = 75% | 2494/2496 = 99.9199% | 2 / 124.8 requests | 1.6026% | 2/0.2 = 10 |
| Safe resolution <=10 s, >=99% | 8/8 = 100% | 2496/2496 = 100% | 0 / 24.96 sagas | 0% | 0 |

The incident-cohort latency result misses 95%; the actual 30-day objective still holds under the stated healthy-history assumption.
The 10 minutes are a latency-budget full-breach equivalent at 0.2 arrivals/minute, not 10 minutes of downtime or the sum of waits.
Forty minutes x 25% = 10 equivalent minutes here because the assumed arrivals and affected share match the CP6 working-time model.
Budgets are independent: no availability budget is consumed by a slow successful response in this profile.

**First CP7 alert and firing minute: neither; not applicable throughout minutes 0-40.**
With initialized zero-error series and positive eligible traffic, both availability burn ratios are 0, below fast 14.4 and slow 6.
No extra alert appears at minute 5 or 30: those are confirmation lookbacks, not firing timers. Empty short windows mean no evidence, not recovery.
The first slow submission is observable around minute 5 + 3.13 seconds; manual latency review can detect it, but CP7 has no latency alert.
This exposes an alert-coverage gap. A low-traffic incident does not automatically breach the monthly SLO, and a latency fault does not automatically breach availability.
If deployment deadlines turn the delay into timeouts, outcomes and windows must be recalculated from that profile; no exact alternative alert minute is asserted without its event history.

## Containment and recovery decision

Use [CP8](07-runbook.md), mitigation 1: the coordinator temporarily pauses new sale intentions while staff retain original keys and read-only saga access.
That stops exposing additional new submissions; it does not cancel an in-flight reservation, remove the injected delay or restore spent budget.
CP8 can be invoked manually for user-visible degradation even when its availability alert is silent.
The eight-request table is the full unmitigated reference scenario. A pause before minute 25 would prevent the second slow submission; it is a counterfactual, not an action performed in this drill.
Do not restart a healthy but slow Products process or roll back without evidence of a regression. No feature flag, manual circuit-breaker switch or autoscaler is assumed.
After the delay ends, verify each original saga is COMPLETED with a saleId, a single stock deduction and no duplicate Sale; gradually resume legitimate submissions.
Follow CP8's positive-traffic checks and 15-minute observation; also verify submission latency <=300 ms and the CP6 budgets. A healthy /health alone is insufficient.

## Blameless postmortem

**Impact:** two of eight new sale intentions wait 3130 ms instead of 150 ms; all eight sales finish within 10 seconds.
No lost sale, negative stock, duplicate effect or unsafe release is assumed. Six intentions experience normal latency.
The modeled interval consumes two latency bad events / 10 equivalent working minutes, with zero availability or resolution-budget consumption.

| Relative time | Reference scenario / tabletop observation |
|---|---|
| Minute 0 | Forty-minute Products delay condition starts; first submission is healthy. |
| Minute 5 + 3.13 s | First slow submission returns successfully; its trace identifies reserve-stock as the dominant span. CP7 remains silent. |
| Minute 10 | Tabletop decision: recommend CP8 mitigation 1 after manual recognition. No pause is executed; the reference model continues unchanged. |
| Minute 25 + 3.13 s | Second slow submission completes in the unmitigated reference model. |
| Minute 40 | Assumed fault interval ends; all eight outcomes are known. Review histogram counts, saga results and budget calculations. |
| Minute 40-55 | Planned recovery observation with positive authorized traffic; additional observations are outside the eight-event calculation. |

**Root cause within the exercise:** the stipulated intermittent delay on the Products reservation response, propagated through the sequential sale-registration path.
A database lock, query defect, capacity shortage or deployment regression is not established by this tabletop evidence and must not be presented as a proven cause.
**Contributing factors:** sequential dependency on reservation before Sales, availability-only paging, and timeout/initial-response differences between design and executable profiles.
Sparse traffic makes short-window ratios sensitive to individual events. CP3 lacks the production Gateway 0.3-second bucket and durable resolution counter needed to measure all three real SLIs.
The contracts made these limitations visible; this is a gap in validation and coverage, not a failure attributed to an individual.

## Follow-up user stories

Proposed backlog drafts; the lead assigns sequential team HU IDs and confirms owners before board registration. No issue or implementation is created here.

### Action A - Detect successful but slow submissions
As the development team, I want Gateway latency coverage for sale submissions, so that slow successful sales are visible even when availability is healthy.
- [ ] Design: agree a latency-SLO alert threshold/window and document its sparse-traffic behavior.
- [ ] Implement: export CP4's exact 0.3-second bucket and add a separate latency rule after review.
- [ ] Happy-path criterion: a controlled sample of 100 successful submissions all <=300 ms yields latency SLI=100% and no latency alert.
- [ ] Degradation criterion: an otherwise identical sample with 25 responses at 3130 ms yields latency SLI=75%; the approved rule fires at the minute specified by its automated window test while CP7 availability alerts remain silent.
- Deliverable: Gateway instrumentation, reviewed latency rule and passing automated rule tests; proposed coordination: Angel with the Gateway assignee.

### Action B - Verify deadlines and safe replay
As the development team, I want automated reservation-delay and idempotency tests, so that timeout handling preserves one sale and one stock effect.
- [ ] Design: record the deployed participant deadline and initial-response deadline with their configuration sources.
- [ ] Implement: controlled Products delays and saga-result assertions using original sagaId:step keys.
- [ ] Happy-path criterion: a response below the configured participant deadline completes one sale with one stock deduction and unchanged trace_id on the outgoing call.
- [ ] Failure criterion: a response above the deadline follows bounded recovery; an unknown result never causes a new sale key or an unsafe release, and exhaustion follows the documented unresolved-outcome policy.
- [ ] Boundary criterion: repeated exact-3000 ms cases record success/timeout outcomes without assuming one deterministic ordering; the initial RUNNING response is checked separately from eventual resolution.
- Deliverable: published deadline profile and passing integration tests; proposed coordination: Santiago with Workflow and Sergio with Products/Sales.

### Action C - Rehearse safe manual containment
As a SALESPERSON, I want a clear pause-and-resume procedure for degraded sale submissions, so that I can preserve existing sale intentions without accidental duplicates.
- [ ] Design: agree coordinator, staff communication and original-key/saga evidence to retain.
- [ ] Rehearse: run CP8 mitigation 1 in an isolated environment and record observation times.
- [ ] Happy-path criterion: after verified recovery and coordinator approval, one retained intention completes with one saleId and one stock deduction.
- [ ] Failure criterion: while an original saga outcome is uncertain, staff create no replacement intention/key and preserve read-only status access; the lead receives unresolved evidence.
- Deliverable: dated rehearsal record with containment and recovery checks; proposed coordination: Jordan and Angel.

## References and verification

Contracts: [CP1](01-journey.md), [CP2](02-log-contract.md), [CP4](04-metrics.md), [CP6](05-slo.md), [CP7](06-alerts.yml), [CP8](07-runbook.md).
Profiles: [architecture deployment](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/deployment.md), [current Workflow recovery](https://github.com/code-corhuila/synkro-workflow/blob/main/docs/deployment-and-recovery.md), [CP3 instructions](03-instrumentation/HOW-TO-RUN.md).
Validation: JSON structure, mandatory fields, shared trace/correlation, timestamp/span timing and event/budget arithmetic checked locally; no live incident or production alert evaluation is claimed.
