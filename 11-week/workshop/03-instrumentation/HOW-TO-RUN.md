# CP3 - Instrumentation: install, run and verify

## Scope and requirements

Module: `synkro-workflow/`, Java 21, Spring Boot 3.5.0 and Maven 3.9+.
This local workshop slice instruments one real CP1 hop: Workflow to Products, `POST /api/v1/stock-reservations`.
The local entry `POST /workshop/stock-reservations/{sagaId}` is a diagnostic wrapper, not the public sale-registration API or a persistent saga.
The supplied Products fixture returns a fixed response and changes no real inventory. It is not the production Products implementation.
All additions are infrastructure adapters; the real workflow's domain/core and its authentication are not replaced.
The HTTP participant client is an Adapter. The request filter is a Decorator around the incoming handler chain.

## Install and test

Install JDK 21 and Maven 3.9+, and configure JAVA_HOME if needed.
The launcher can also locate JDK 21 under Program Files and an existing Maven wrapper distribution in the user's cache.
From `11-week/workshop/03-instrumentation`, resolve dependencies, run tests and build:

```powershell
.\synkro-workflow\run.ps1 -Task test
.\synkro-workflow\run.ps1 -Task package
```

These commands install the required Maven dependencies automatically. Add `-Offline` if they are already cached.
Verified locally: `-Task package -Offline` passed all 19 tests and produced the executable under ignored `target/`.

## Run the demonstration

Terminal 1, from the same directory, starts the fixture at 127.0.0.1:18089:

```powershell
.\synkro-workflow\run.ps1 -Task stub
```

Terminal 2 starts Workflow at 127.0.0.1:8088; the token below is a public fixture placeholder, not a real credential:

```powershell
$env:WORKFLOW_SERVICE_TOKEN = 'test-only-token'
.\synkro-workflow\run.ps1 -Task run
```

Terminal 3 sends the documented reservation payload:

```powershell
$body = '{"lines":[{"productId":"550e8400-e29b-41d4-a716-446655440000","quantity":2}]}'
$headers = @{traceparent='00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'; 'X-Correlation-Id'='4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90'}
Invoke-WebRequest -Method Post -Uri 'http://127.0.0.1:8088/workshop/stock-reservations/15920dc9-bd55-41a0-8e41-5832377383e5' -ContentType 'application/json' -Headers $headers -Body $body
(Invoke-WebRequest 'http://127.0.0.1:8088/metrics').Content
```

Stop each foreground server with Ctrl+C. This demonstration sends one attempt, with a 3-second timeout and no automatic retry.
Products receives a fresh CLIENT span with the incoming trace ID/flags, the same correlation ID, the configured service token and Idempotency-Key `<sagaId>:reserve-stock`.
The caller's personal token and raw payload are never logged. Empty service-token configuration fails safely without sending a request.
Override PORT, PRODUCTS_URL, PRODUCTS_TIMEOUT_MS, APP_VERSION and APP_ENVIRONMENT through environment variables when needed.
WORKFLOW_SERVICE_TOKEN must be a valid workflow service credential to call the real Products service; the included fixture needs no real credential.
Invalid lines return 400 locally; a participant's 422 is returned unchanged; a timeout produces a safe 500 INTERNAL_ERROR response.
A timeout does not prove rollback. This slice does not implement the full saga's retry/recovery/compensation policy.

## Metrics contract

`/metrics` exposes Prometheus text format with two metric families:

- `synkro_workflow_requests_total{route,method,outcome}`: counter; outcomes success, business_rejected (4xx), technical_failure (5xx/unhandled exception).
- `synkro_workflow_request_duration_seconds{route,method}`: histogram, including _bucket, _sum and _count.
Buckets in seconds: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 10, +Inf.
The 3-second boundary matches the participant deadline; the smaller buckets distinguish ordinary local response times.
Routes are /health, /workshop/stock-reservations/{sagaId}, or other; methods are GET, POST or OTHER.
Identifiers, raw URLs, query strings and trace IDs are never metric labels. Scraping /metrics changes neither family.
The histogram measures incoming Workflow request latency, including the participant call; the client JSON log measures the outgoing call separately.
Metrics reset when the local process restarts. The probe's 201 confirms the participant response, not completion of the whole sale.

## Actual console evidence

Verified on 2026-10-20. Tests were written first: missing classes initially failed compilation; the first endpoint wiring test then failed because /metrics returned 404.
Registering the shared metrics recorder and endpoint fixed the wiring failure. Final test/build output:

```text
[INFO] Tests run: 19, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

The packaged Workflow and fixture were also run temporarily on ports 18098/18099, then stopped. Actual live verification output:

```text
HTTP 201
Workflow SERVER span: 43361d67c6dd6bbe
Products received traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-8c5d84eff1dc64cc-01
Products fixture received POST /api/v1/stock-reservations
synkro_workflow_requests_total{route="/workshop/stock-reservations/{sagaId}",method="POST",outcome="success"} 1
synkro_workflow_request_duration_seconds_count{route="/workshop/stock-reservations/{sagaId}",method="POST"} 1
synkro_workflow_request_duration_seconds_sum{route="/workshop/stock-reservations/{sagaId}",method="POST"} 0.3507867
```

The incoming trace ID was retained while the SERVER and CLIENT span IDs differed. Two consecutive scrapes returned identical metric samples.
Raw local logs, test reports and metrics evidence are under target and are excluded from Git.

## Traceability and commit batches

NFR-005 (observability), NFR-004 (safe logs), and HU-WKF-01 (workflow HTTP foundation) guide this CP3 workshop extension.
DownstreamPropagationTest proves received/sent trace equality over real HTTP, correlation, idempotency, timeout, 422 and validation.
RequestMetricsTest checks bounded labels and histogram buckets; ApplicationWiringTest checks real /metrics and scrape exclusion.
InstrumentationTest preserves the first increment's 12 context/logger checks.
For this second increment, use four commits before its single checkpoint push, each below 150 added lines:

1. DownstreamPropagationTest + ApplicationWiringTest (127 lines): `test(w11): cover downstream tracing and metrics endpoint`.
2. RequestMetrics + RequestMetricsTest + TraceContext + TraceContextFilter + WorkshopApplication + application.properties (132 added lines): `feat(w11): expose bounded workflow request metrics`.
3. ProductsClient + ReservationProbeController (104 lines): `feat(w11): propagate context downstream and expose metrics`.
4. ProductsStub + run.ps1 + this HOW-TO-RUN.md: `docs(w11): document instrumentation setup and verification`.
Keep target out of commits. No commits or pushes were performed while preparing this increment.

References: [CP1](../01-journey.md), [CP2](../02-log-contract.md), [Products OpenAPI](https://github.com/code-corhuila/synkro-docs/blob/main/07-api/contracts/openapi/synkro-products-api.yaml), [architecture](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/overview.md), [cross-cutting concerns](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/cross-cutting.md).