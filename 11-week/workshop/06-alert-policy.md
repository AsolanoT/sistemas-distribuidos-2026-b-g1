# CP7 - Availability burn-rate alert policy

## Project scope and contract

Protect the CP6 technical availability SLO for sale submission: 99.5% over rolling 30 days, allowed bad fraction 0.005.
The measured entry is Gateway POST /api/v1/sagas/register-sale, which starts the Workflow path through Customers, Products and Sales.
Use synkro_gateway_requests_total with technical_failure as bad and success|technical_failure as eligible, exactly matching CP6.
The business_rejected category, including the scoped policy rejection 429, remains excluded; these rules do not redefine the SLO.
This alerts on failed submissions, not directly on latency or saga completion. A 201 RUNNING/COMPENSATED response needs the separate CP6 domain SLI.
The Gateway metrics remain proposed in CP4; CP3's Workflow fixture cannot supply this Gateway counter. Rules are prepared and tested, not deployed.

## Multiwindow rules

For any window w: error_ratio(w) = bad request rate / eligible request rate; burn_rate(w) = error_ratio(w) / 0.005.
The expression checks both windows with AND, independently for each environment. Apply rate before summing replicas.

| Alert | Long window | Confirming short window | Burn threshold | Equivalent error-ratio threshold | severity |
|---|---|---|---|---|---|
| SynkroSaleSubmissionFastBurn | 1h | 5m | >14.4 | >0.072 = 7.2% in BOTH windows | critical |
| SynkroSaleSubmissionSlowBurn | 6h | 30m | >6 | >0.03 = 3% in BOTH windows | warning |

The 5m/30m windows check that the burn is still active; they are not extra waiting periods after the long-window condition.
The explicit for: 0m adds no hold time. It must not be changed to 5m/30m while still claiming the same detection behavior.
A lookback window does not require waiting that entire duration after an incident starts. Firing occurs at the next 30-second evaluation where both comparisons are true.
Actual timing also depends on scrape cadence, prior history, traffic, counter samples and notification routing.
Short-window recovery clears the expression even while older failures remain in the long window.
Both rules label team=synkro-tech and service=synkro-api-gateway; environment is retained from aggregation.
Fast requires immediate investigation of the failed sale-submission trace and its Workflow/participant calls; slow requires prompt investigation of sustained degradation.
If both fire, handle one incident and prioritize the critical signal. Alertmanager grouping/inhibition and notification delivery are not configured by this file.
runbook_url points to the fork's 11-week/workshop/07-runbook.md, reserved for CP8; create and publish that runbook before operational activation.

## Budget represented by the thresholds

CP6 forecasts 2496 eligible new intentions and an availability budget B=2496 x 0.005=12.48 bad requests.
For a uniform 24x7 workload, nominal budget fraction = burn_rate x long_window_hours / 720 hours.

| Alert | Calendar-normalized calculation | Nominal budget fraction | Portion of B |
|---|---|---|---|
| Fast | 14.4 x 1 / 720 | 0.02 = 2% | 0.2496 failures |
| Slow | 6 x 6 / 720 | 0.05 = 5% | 0.624 failures |

These familiar 2%/5% figures assume request volume is proportional to calendar time. They are not guaranteed amounts spent before every firing.
SynkroTech's PRIMARY CP6 scenario is different: 26 trading days x 8 hours = 208 working hours, with 12 intentions/hour during operation.
Under that uniform WORKING-HOUR scenario, fraction = burn_rate x long_window_hours / 208, when the whole lookback lies inside trading hours.

| Alert | Eligible requests in long window | Failures at continuous threshold | Fraction of CP6 monthly budget | Illustrative integer crossing |
|---|---|---|---|---|
| Fast | 12 | 12 x 0.072 = 0.864 | 0.864 / 12.48 = 6.923% | 1/12 errors = 8.333%; 1 failure spends 8.013% of B |
| Slow | 72 | 72 x 0.03 = 2.16 | 2.16 / 12.48 = 17.308% | 3/72 errors = 4.167%; 3 failures spend 24.038% of B |

Equality is the threshold; the rules use strict >. Integer crossing also needs the short-window condition, not just the long-window count.
At full-failure intensity, the continuous thresholds represent 4.32 and 10.8 working minutes respectively, against CP6's 62.4 working-minute availability equivalent.
Counts of 0.2496, 0.624, 0.864 and 2.16 are mathematical equivalents, not fractional real requests.
There is no fixed firing minute or guaranteed consumed fraction; compute actual bad events against the actual rolling eligible denominator.
Low traffic makes each request significant. No arbitrary minimum-request gate is added, since it could hide every failure at this volume.
Inspect trace evidence and the cumulative budget before deciding severity changes; do not dilute the user SLI with fixture or synthetic success traffic.

## Two cause-based alerts we will not create

| Rejected standalone alert | Why it does not justify a user-impact alert |
|---|---|
| Gateway/Workflow CPU >80% | A brief CPU spike can coexist with healthy sale submissions; CPU alone does not show failed requests or budget burn. Keep it as diagnostic context. |
| PostgreSQL connection-pool utilization >80% | Busy Auth/Customers/Products/Workflow pools can still serve requests normally; saturation is a possible cause, not proof that this sale journey violates its SLO. Investigate it alongside trace latency and failures. |

## Prerequisites and validation

Attach one bounded environment scrape label (dev, qa or prod), initialize eligible outcome series at zero, and warm up the target history for the windows before operational use.
Missing environment labels are excluded by the selector; missing counters, zero traffic and 0/0 do not produce a firing burn alert, but do not establish healthy availability.
A fully unreachable Gateway can emit no events: independent reachability and telemetry-coverage monitoring are still required, as stated in CP6.
Revalidate the submitted rules from 11-week/workshop with the indicated Docker image available locally:

```powershell
docker run --rm --pull never --network none --mount "type=bind,source=$PWD,target=/workshop,readonly" --workdir /workshop --entrypoint /bin/promtool prom/prometheus:v3.2.1 check rules /workshop/06-alerts.yml
```

Actual validation output from promtool v3.2.1: SUCCESS: 2 rules found.
During preparation, seven temporary synthetic test scenarios also passed: firing thresholds, short-window recovery, short spikes, 4xx exclusion, environment isolation, zero traffic and missing telemetry. That temporary fixture is not included in the submission.
The CP7 submission contains only 06-alerts.yml and 06-alert-policy.md. Validation did not deploy rules or send notifications.

References: [CP4](04-metrics.md), [CP6](05-slo.md), [rules](06-alerts.yml), [Google SRE multiwindow alerts](https://sre.google/workbook/alerting-on-slos/), [Prometheus alert rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/).