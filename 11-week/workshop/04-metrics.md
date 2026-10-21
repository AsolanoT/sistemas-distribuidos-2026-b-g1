# CP4 - Golden signals and metric catalog

## Scope, status and measurement rules

Journey: register a sale through Gateway, Workflow, Customers, Products and Sales, as mapped in [CP1](01-journey.md).
The sales portal and synkro-front initiate the request in the browser; the five HTTP services below form the backend journey. Browser rendering is outside this server catalog.
Only the CP3 Workflow probe currently exports the two named counter/histogram families. Other service metrics, production route labels, the 0.3-second bucket and all saturation gauges are proposals.
The source requirements describe P95 < 300 ms for critical endpoints as a proposed default, not a measured or accepted guarantee.

Names use snake_case, seconds for latency and _total for counters. Errors reuse the request counter with a bounded outcome label.
Use one environment-scoped Prometheus datasource for these examples; if environments share a server, filter every query by its target environment label.
Every query uses a 5-minute rate window; rates are requests/second, latency is seconds, error output is percent, and saturation is a fraction.
Calculate rate before aggregating replicas. histogram_quantile retains le when aggregating classic histogram buckets.
For each observed route/method, export all three outcome series, initialized to zero. The error denominator includes all results; zero traffic is undefined/NaN, not proof of health.
Do not replace missing telemetry with zero: distinguish missing target, no observations and a genuinely measured zero.

## Per-service dashboard catalog

Each table selects the critical journey operation, excluding health, polling and unrelated routes from latency/traffic/error panels.
Saturation is per service instance across admitted business requests, not a domain/database saturation measurement.

### synkro-api-gateway

External entry: sale submission and saga polling. NGINX instrumentation/adapter is proposed.

| Signal | Metric name | Type | Application labels | Dashboard PromQL |
|---|---|---|---|---|
| Latency (P95) | `synkro_gateway_request_duration_seconds` | Classic histogram | route, method; le on buckets | `histogram_quantile(0.95, sum by (le) (rate(synkro_gateway_request_duration_seconds_bucket{route="/api/v1/sagas/register-sale",method="POST"}[5m])))` |
| Traffic | `synkro_gateway_requests_total` | Counter | route, method, outcome | `sum(rate(synkro_gateway_requests_total{route="/api/v1/sagas/register-sale",method="POST"}[5m]))` |
| Errors (technical %) | `synkro_gateway_requests_total` | Counter filtered by outcome | route, method, outcome | `100 * sum(rate(synkro_gateway_requests_total{route="/api/v1/sagas/register-sale",method="POST",outcome="technical_failure"}[5m])) / sum(rate(synkro_gateway_requests_total{route="/api/v1/sagas/register-sale",method="POST"}[5m]))` |
| Saturation | `synkro_gateway_requests_in_flight` and `synkro_gateway_request_concurrency_limit` | Two gauges, request counts | None | `max(synkro_gateway_requests_in_flight / synkro_gateway_request_concurrency_limit)` |

### synkro-workflow

Sale orchestration. CP3 implements the counter/histogram names for its local probe; production routes and saturation gauges remain proposed.

| Signal | Metric name | Type | Application labels | Dashboard PromQL |
|---|---|---|---|---|
| Latency (P95) | `synkro_workflow_request_duration_seconds` | Classic histogram | route, method; le on buckets | `histogram_quantile(0.95, sum by (le) (rate(synkro_workflow_request_duration_seconds_bucket{route="/api/v1/sagas/register-sale",method="POST"}[5m])))` |
| Traffic | `synkro_workflow_requests_total` | Counter | route, method, outcome | `sum(rate(synkro_workflow_requests_total{route="/api/v1/sagas/register-sale",method="POST"}[5m]))` |
| Errors (technical %) | `synkro_workflow_requests_total` | Counter filtered by outcome | route, method, outcome | `100 * sum(rate(synkro_workflow_requests_total{route="/api/v1/sagas/register-sale",method="POST",outcome="technical_failure"}[5m])) / sum(rate(synkro_workflow_requests_total{route="/api/v1/sagas/register-sale",method="POST"}[5m]))` |
| Saturation | `synkro_workflow_requests_in_flight` and `synkro_workflow_request_concurrency_limit` | Two gauges, request counts | None | `max(synkro_workflow_requests_in_flight / synkro_workflow_request_concurrency_limit)` |

### synkro-customers-api

Saga step validate-customer. All entries below are proposed.

| Signal | Metric name | Type | Application labels | Dashboard PromQL |
|---|---|---|---|---|
| Latency (P95) | `synkro_customers_request_duration_seconds` | Classic histogram | route, method; le on buckets | `histogram_quantile(0.95, sum by (le) (rate(synkro_customers_request_duration_seconds_bucket{route="/api/v1/customers/{id}",method="GET"}[5m])))` |
| Traffic | `synkro_customers_requests_total` | Counter | route, method, outcome | `sum(rate(synkro_customers_requests_total{route="/api/v1/customers/{id}",method="GET"}[5m]))` |
| Errors (technical %) | `synkro_customers_requests_total` | Counter filtered by outcome | route, method, outcome | `100 * sum(rate(synkro_customers_requests_total{route="/api/v1/customers/{id}",method="GET",outcome="technical_failure"}[5m])) / sum(rate(synkro_customers_requests_total{route="/api/v1/customers/{id}",method="GET"}[5m]))` |
| Saturation | `synkro_customers_requests_in_flight` and `synkro_customers_request_concurrency_limit` | Two gauges, request counts | None | `max(synkro_customers_requests_in_flight / synkro_customers_request_concurrency_limit)` |

### synkro-products-api

Reserve-stock and its release compensation. All entries below are proposed.

| Signal | Metric name | Type | Application labels | Dashboard PromQL |
|---|---|---|---|---|
| Latency (P95) | `synkro_products_request_duration_seconds` | Classic histogram | route, method; le on buckets | `histogram_quantile(0.95, sum by (le) (rate(synkro_products_request_duration_seconds_bucket{route="/api/v1/stock-reservations",method="POST"}[5m])))` |
| Traffic | `synkro_products_requests_total` | Counter | route, method, outcome | `sum(rate(synkro_products_requests_total{route="/api/v1/stock-reservations",method="POST"}[5m]))` |
| Errors (technical %) | `synkro_products_requests_total` | Counter filtered by outcome | route, method, outcome | `100 * sum(rate(synkro_products_requests_total{route="/api/v1/stock-reservations",method="POST",outcome="technical_failure"}[5m])) / sum(rate(synkro_products_requests_total{route="/api/v1/stock-reservations",method="POST"}[5m]))` |
| Saturation | `synkro_products_requests_in_flight` and `synkro_products_request_concurrency_limit` | Two gauges, request counts | None | `max(synkro_products_requests_in_flight / synkro_products_request_concurrency_limit)` |

### synkro-sales-api

Saga step register-sale, persisting Sale and its details in MongoDB. All entries below are proposed.

| Signal | Metric name | Type | Application labels | Dashboard PromQL |
|---|---|---|---|---|
| Latency (P95) | `synkro_sales_request_duration_seconds` | Classic histogram | route, method; le on buckets | `histogram_quantile(0.95, sum by (le) (rate(synkro_sales_request_duration_seconds_bucket{route="/api/v1/sales",method="POST"}[5m])))` |
| Traffic | `synkro_sales_requests_total` | Counter | route, method, outcome | `sum(rate(synkro_sales_requests_total{route="/api/v1/sales",method="POST"}[5m]))` |
| Errors (technical %) | `synkro_sales_requests_total` | Counter filtered by outcome | route, method, outcome | `100 * sum(rate(synkro_sales_requests_total{route="/api/v1/sales",method="POST",outcome="technical_failure"}[5m])) / sum(rate(synkro_sales_requests_total{route="/api/v1/sales",method="POST"}[5m]))` |
| Saturation | `synkro_sales_requests_in_flight` and `synkro_sales_request_concurrency_limit` | Two gauges, request counts | None | `max(synkro_sales_requests_in_flight / synkro_sales_request_concurrency_limit)` |
## Outcome and saturation semantics

Outcomes match CP3: success = HTTP < 400; business_rejected = 4xx; technical_failure = 5xx or an unhandled exception.
The business_rejected label is an HTTP classification that also includes authentication/validation failures; a 422 insufficient-stock rejection is not a server outage.
Gateway-generated 429 belongs to business_rejected and should be examined separately from technical failures.
A 201 saga resource can contain RUNNING or COMPENSATED, so these HTTP counters do not establish that a sale completed; a future business SLI must inspect saga outcomes.
Never add gateway/workflow/participant counts together to estimate user traffic: one sale fans out into several requests.
For saturation, requests_in_flight counts active admitted business HTTP requests; increment on entry and decrement in finally, including failures.
request_concurrency_limit must report a positive, configured admission limit for that same instance and scope. No limit value is invented here.
Both gauges have identical scrape labels; their ratio is computed per instance, then max exposes the hottest replica rather than hiding it in an average.
Do not substitute a database pool size or NGINX connection count for an HTTP request limit. Until matching gauges and admission limits exist, display saturation as unavailable.
The four non-Workflow services need adapters/exporters for these proposed names; NGINX does not emit the custom Gateway metrics automatically.

## Label cardinality and forbidden labels

The estimates below cover only this journey's catalog; additional routes require a reviewed budget.

| Label | Maximum distinct values | Allowed values / source |
|---|---|---|
| route | 3-5 per service, listed below | Fixed matched templates plus /health and other; never the incoming raw path |
| method | 3 | GET, POST, OTHER, matching CP3 |
| outcome | 3 | success, business_rejected, technical_failure |
| le | 14 proposed; 13 currently in CP3 | 13 proposed finite boundaries plus +Inf; current CP3 has 12 finite boundaries |
| job | 5 across the journey | One scrape job per listed service; not another multiplicative factor on the summed service totals |
| instance | 1 per service for this estimate | One local replica; additional targets multiply that service's series count |
| environment | 1 in this datasource; 3 if centralized | dev, qa, prod; attach as a bounded scrape label, not an arbitrary request value |

| Service | route allowlist | R | Counter series: R x 3 x 3 | Histogram series: R x 3 x 16 | Saturation gauges | Total per instance |
|---|---|---|---|---|---|---|
| `synkro-api-gateway` | `/api/v1/sagas/register-sale; /api/v1/sagas/{id}; /health; other` | 4 | 36 | 192 | 2 | 230 |
| `synkro-workflow` | `/api/v1/sagas/register-sale; /api/v1/sagas/{id}; /workshop/stock-reservations/{sagaId}; /health; other` | 5 | 45 | 240 | 2 | 287 |
| `synkro-customers-api` | `/api/v1/customers/{id}; /health; other` | 3 | 27 | 144 | 2 | 173 |
| `synkro-products-api` | `/api/v1/stock-reservations; /api/v1/stock-reservations/{id}/release; /health; other` | 4 | 36 | 192 | 2 | 230 |
| `synkro-sales-api` | `/api/v1/sales; /health; other` | 3 | 27 | 144 | 2 | 173 |

Each classic histogram label set creates 14 bucket series plus _sum and _count = 16 series. The two unlabelled application gauges each create one series per scrape target.
Proposed upper bound: 1093 series for five single-instance services in one environment; three identical environments would produce 3279. This conservative Cartesian bound excludes exporter/process metrics and target churn.
Current CP3 has R=3: its counter allows 27 series and its histogram 3 x 3 x 15 = 135, for at most 162 application series per instance.
CP3 emits a label set only after observing it, so its actual number can be lower; it implements no saturation gauge.

| Forbidden metric label | Replacement |
|---|---|
| user_id, customer_id, email, identityDocument, phone | Omit from metrics; use authorized CP2 logs with approved internal IDs, excluding direct personal data |
| product_id, saga_id, reservation_id, sale_id, trace_id, span_id | Keep in structured logs/traces only; dashboard links can open a trace search without making the ID a label |
| Raw URL/path, query string, raw HTTP method | Use the route allowlist and GET/POST/OTHER; unknown routes collapse to other |
| Raw error/exception message, token, Idempotency-Key | Use the three outcome values; never put secrets or free text in labels |

## Histogram buckets and user expectations

Keep seconds throughout. CP3 currently uses: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 10, +Inf.
For the catalog, choose: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.3, 0.5, 1, 2, 3, 5, 10, +Inf.
The sole proposed change is 0.3, making the documented provisional 300 ms expectation directly countable instead of interpolating between 0.25 and 0.5.
Sales staff need prompt customer validation, stock reservation and sale feedback; 5-100 ms buckets distinguish fast local operations, while 250/300/500 ms show deterioration near that expectation.
The 1/2-second buckets show visible delays; 3 seconds matches the CP3 client deadline, 5 seconds matches the documented deployment HTTP timeout, and 10 seconds matches the documented saga request timeout.
Timeouts are failure boundaries, not acceptable latency objectives. +Inf retains observations beyond 10 seconds.
Use identical boundaries across instances before aggregating them; change the code and roll out consistently before querying the new 0.3 bucket.
A whole sale makes several calls; participant P95s must not be added as an end-to-end P95. Use Gateway/Workflow measurements and traces to investigate the whole path.
Validate these provisional targets with representative load and the team before adopting an SLO; no real user timing study has established them.

## Queries usable with the existing CP3 probe

These use the names, route and buckets that CP3 actually exports; a Prometheus scrape target is still needed to execute PromQL.

- Traffic: `sum(rate(synkro_workflow_requests_total{route="/workshop/stock-reservations/{sagaId}",method="POST"}[5m]))`.
- P95: `histogram_quantile(0.95, sum by (le) (rate(synkro_workflow_request_duration_seconds_bucket{route="/workshop/stock-reservations/{sagaId}",method="POST"}[5m])))`.
- Technical error percent: `100 * sum(rate(synkro_workflow_requests_total{route="/workshop/stock-reservations/{sagaId}",method="POST",outcome="technical_failure"}[5m])) / sum(rate(synkro_workflow_requests_total{route="/workshop/stock-reservations/{sagaId}",method="POST"}[5m]))`.
No saturation query is currently executable against the CP3 exporter. CP4 reviewed query structure and cardinality; it did not run a live Prometheus dashboard.

## References

- [CP3 implementation and evidence](03-instrumentation/HOW-TO-RUN.md).
- [NFR-001 and NFR-005](https://github.com/code-corhuila/synkro-docs/blob/main/04-requirements/non-functional.md), [deployment](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/deployment.md) and [architecture](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/overview.md).
- [Prometheus naming](https://prometheus.io/docs/practices/naming/), [histograms](https://prometheus.io/docs/practices/histograms/) and [query functions](https://prometheus.io/docs/prometheus/latest/querying/functions/).