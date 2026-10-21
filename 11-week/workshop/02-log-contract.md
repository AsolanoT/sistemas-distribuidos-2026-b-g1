# CP2 - Structured log contract

## Scope and compatibility

Journey: register a sale through `synkro-api-gateway`, `synkro-workflow`, `synkro-customers-api`, `synkro-products-api` and, when stock is reserved, `synkro-sales-api`.
This contract extends the CP1 instrumentation design; the examples are synthetic, not captured runtime evidence.
Emit one UTF-8 JSON object per line to stdout. Use the same schema in Java and Go, with a logger enriched from the active request context.
The workshop uses snake_case. Keep the existing `correlationId` field as an equal-valued compatibility alias; existing log queries must continue to work.
The API response's `traceId` remains the value of `X-Correlation-Id`. It does not become the W3C `trace_id`.

## Required common fields

| Field | JSON type | Required/optional | Example | Why it exists |
|---|---|---|---|---|
| `timestamp` | string | Required | `2026-10-21T00:30:00.000Z` | UTC ISO-8601 timestamp with milliseconds for ordering events |
| `level` | string enum | Required | `WARN` | Severity: DEBUG, INFO, WARN or ERROR |
| `service` | string | Required | `synkro-workflow` | Identifies the emitting component using its repository name |
| `version` | string | Required | `0.1.0-workshop` | Deployed build/release identifier for comparing failures across releases |
| `environment` | string enum | Required | `qa` | Separates dev, qa and prod runtime environments; not a Git branch name |
| `trace_id` | string | Required | `4bf92f3577b34da6a3ce929d0e0e4736` | W3C trace ID: 32 lowercase hexadecimal characters, not all zero |
| `span_id` | string | Required | `4444444444444444` | Active span ID: 16 lowercase hexadecimal characters, not all zero |
| `correlation_id` | string | Required | `4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90` | Preserves the original request's X-Correlation-Id across services |
| `event` | string | Required | `stock.reservation.timeout` | Stable lowercase dotted event name for filtering without parsing message text |
| `message` | string | Required | `Products did not answer before the client deadline` | Short English description without secrets or raw user input |
| `duration_ms` | number | Required | `3000` | Nonnegative elapsed milliseconds for the operation described; 0 at its start |
| `correlationId` | string | Required compatibility alias | Same as `correlation_id` | Preserves the team's existing camelCase logging contract |

Use a monotonic clock for durations and a UTC wall clock for timestamps. Duration fields are overlapping measurements, not values to sum across logs.
Inject trace fields from the active span; never accept IDs from a JSON body or use a business ID as a trace ID.
A new span gets a new ID; multiple logs inside the same span reuse its ID.
Validate incoming context as described in CP1. Standalone startup/jobs need their own local trace context instead of invented all-zero identifiers.

## Domain and diagnostic fields

Log fields map to domain identifiers without renaming the API's camelCase attributes or adding attributes to domain entities.
Optional fields are omitted until their values are known; do not emit placeholder IDs.

| Field | JSON type | Required/optional | Example | Why it exists |
|---|---|---|---|---|
| `saga_id` | string UUID | Required once allocated | `15920dc9-bd55-41a0-8e41-5832377383e5` | Maps the log to the persisted register-sale saga, including later recovery |
| `customer_id` | string UUID | Optional, when validating customer | `7c9e6679-7425-40de-944b-e07fc1f90ae7` | Identifies Customer without recording their contact or identity document |
| `product_id` | string UUID | Optional, for a specific line | `550e8400-e29b-41d4-a716-446655440000` | Identifies the Product whose stock is being evaluated |
| `quantity` | integer | Optional, when evaluating a line | `2` | Records requested units; maps to the reservation line quantity |
| `available_stock` | integer | Optional, on stock rejection | `1` | Snapshot of Product.stock at validation, explaining the insufficient-stock rule |
| `reservation_id` | string UUID | Optional, only after reservation exists | UUID returned by Products | Links StockReservation creation or release without claiming a failed reservation exists |
| `sale_id` | string UUID | Optional, only after sale exists | UUID returned by Sales | Links the registered Sale; absent in the failed example |
| `step` | string enum | Optional, for saga steps | `reserve-stock` | One of validate-customer, reserve-stock, register-sale or release-stock |
| `saga_status` | string enum | Optional, on state changes/responses | `COMPENSATED` | Persisted status: RUNNING, COMPLETED, COMPENSATED or FAILED |
| `attempt` | integer | Optional, on caller attempt logs | `1` | Positive local retry counter; not a new header or domain attribute |
| `downstream_service` | string | Optional, on outgoing calls | `synkro-products-api` | Names the dependency responsible for an observed call result |
| `http_status` | integer | Optional, only with an HTTP response | `422` | Separates transport response from business outcome; omit for a client timeout |
| `error_code` | string enum | Optional, on an application rejection | `BUSINESS_RULE_VIOLATION` | Uses the existing API error catalog; no invented application codes |
| `failure_kind` | string enum | Optional, on transport failure | `timeout` | Describes a client-side failure, not an HTTP status or API error code |
| `outcome` | string enum | Optional, on completion | `business_rejected` | Operation result: success, business_rejected or technical_failure |

Customer UUIDs remain linkable identifiers, not anonymous data. Use them only in access-controlled operational logs; do not enrich them with personal data.
An attempt counter is local to the caller; the downstream server need not know it.
Saga creation can return 201 while the saga itself is COMPENSATED: HTTP resource creation and business success are different outcomes.

## Never log and masking policy

Use an allowlist of the fields above. Redact before serialization, including nested objects, messages and exception text.
Never dump request/response bodies, headers, JWT claims, database rows or connection strings.
For these categories, masking means replacing the entire value with `[REDACTED]` if an unavoidable diagnostic wrapper contains it; ordinary events omit the field entirely.

| Never record | Project-specific source | Masking/handling |
|---|---|---|
| Customer/employee name, identityDocument, email, phone, address | Customer records and Auth User | Omit; replace the full value with [REDACTED] before any diagnostic serialization; use customer_id when needed |
| Password and passwordHash | Auth login/registration and stored bcrypt hash | Omit completely; redact both plaintext and hash, never keep a prefix |
| Access, refresh and service tokens, including stored refresh-token hashes | Authorization header, Auth responses and workflow service credential | Omit; redact the whole header/value, never token fragments or decoded claims |
| Cookies and session credentials | Browser requests | Omit; redact entire Cookie and Set-Cookie values |
| Private signing keys, database passwords and credentials in URLs | Runtime configuration and exception messages | Omit; redact entire secret/configuration value; never dump the environment |
| Raw Idempotency-Key or arbitrary client correlation text | Incoming headers | Omit the raw idempotency key; derive keys internally as documented; validate correlation IDs and use safe JSON serialization to prevent injected log lines |
| Card number, CVV, bank account and payment credentials | No payment integration in the current sale model | Never collect or log; redact the entire value if unexpectedly received |
| Health information | Not part of SynkroTech's domain | Never collect or log; redact the entire value if unexpectedly received |
| Free-text user input and unfiltered driver/exception messages | Validation failures and SQL/HTTP diagnostics | Log a fixed safe message and approved fields; redact sensitive values before any restricted diagnostic output |

Configure the logger's redaction layer centrally in the infrastructure adapter. Domain entities must not depend on logging libraries.

## Seven example JSON lines

Scenario: the customer is active, but the requested quantity is 2 and stock is 1.
Attempt 1 to Products times out at 3000 ms. For this example, that attempt never reaches a committed stock change.
After 100 ms backoff, attempt 2 reuses the same reservation idempotency key and reaches Products, which rejects it with 422 and reserves nothing.
Workflow ends the saga as COMPENSATED with failedStep reserve-stock; no side effect needs undoing, no release call is made, and Sales is never called.
Both failures belong to the same initial request and trace, not to two unrelated user attempts.
The DEBUG entry illustrates diagnostics enabled in qa; production normally disables DEBUG.
The version is illustrative; a real logger must inject the actual deployed version.

```jsonl
{"timestamp":"2026-10-21T00:30:00.000Z","level":"INFO","service":"synkro-workflow","version":"0.1.0-workshop","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","span_id":"1111111111111111","event":"saga.started","message":"Sale registration started","duration_ms":0,"customer_id":"7c9e6679-7425-40de-944b-e07fc1f90ae7","step":"validate-customer"}
{"timestamp":"2026-10-21T00:30:00.020Z","level":"INFO","service":"synkro-customers-api","version":"0.1.0-workshop","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","span_id":"3333333333333333","event":"customer.validated","message":"Customer exists and is active","duration_ms":18,"customer_id":"7c9e6679-7425-40de-944b-e07fc1f90ae7","http_status":200}
{"timestamp":"2026-10-21T00:30:00.025Z","level":"DEBUG","service":"synkro-workflow","version":"0.1.0-workshop","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","span_id":"4444444444444444","event":"stock.reservation.requested","message":"Requesting stock reservation","duration_ms":0,"step":"reserve-stock","product_id":"550e8400-e29b-41d4-a716-446655440000","quantity":2,"attempt":1,"downstream_service":"synkro-products-api"}
{"timestamp":"2026-10-21T00:30:03.025Z","level":"WARN","service":"synkro-workflow","version":"0.1.0-workshop","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","span_id":"4444444444444444","event":"stock.reservation.timeout","message":"Products did not answer before the client deadline","duration_ms":3000,"step":"reserve-stock","attempt":1,"downstream_service":"synkro-products-api","failure_kind":"timeout"}
{"timestamp":"2026-10-21T00:30:03.137Z","level":"WARN","service":"synkro-products-api","version":"0.1.0-workshop","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","span_id":"bbbbbbbbbbbbbbbb","event":"stock.reservation.rejected","message":"Requested quantity exceeds available stock","duration_ms":12,"step":"reserve-stock","product_id":"550e8400-e29b-41d4-a716-446655440000","quantity":2,"available_stock":1,"http_status":422,"error_code":"BUSINESS_RULE_VIOLATION"}
{"timestamp":"2026-10-21T00:30:03.140Z","level":"INFO","service":"synkro-workflow","version":"0.1.0-workshop","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","span_id":"1111111111111111","event":"saga.compensated","message":"Saga ended without a sale or a stock reservation","duration_ms":3140,"step":"reserve-stock","saga_status":"COMPENSATED","error_code":"BUSINESS_RULE_VIOLATION","outcome":"business_rejected"}
{"timestamp":"2026-10-21T00:30:03.142Z","level":"INFO","service":"synkro-workflow","version":"0.1.0-workshop","environment":"qa","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","correlation_id":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","correlationId":"4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90","saga_id":"15920dc9-bd55-41a0-8e41-5832377383e5","span_id":"1111111111111111","event":"http.request.completed","message":"Saga creation response returned with its terminal state","duration_ms":3142,"http_status":201,"saga_status":"COMPENSATED","outcome":"business_rejected"}
```

Line 4 is the recoverable timeout; line 5 is the business rejection. A timeout alone never proves that the participant rolled back.
The caller's attempt-1 CLIENT span is `4444444444444444`; the second attempt uses a new CLIENT span `aaaaaaaaaaaaaaaa`, injected in traceparent.
Products' SERVER span `bbbbbbbbbbbbbbbb` has that second CLIENT span as parent. Its parent context need not be another log line.
The customer SERVER span is `3333333333333333`; the workflow root is `1111111111111111`.
All seven entries have the same trace and correlation IDs, increasing timestamps, and valid active span IDs.

## Severity policy

| Level | When to use it | SynkroTech example |
|---|---|---|
| ERROR | Technical failure that cannot recover within the bounded policy, unhandled failure or inconsistency requiring intervention | Workflow exhausts Products retries and cannot safely finish; a stock-release compensation fails and the saga becomes FAILED |
| WARN | Recoverable anomaly or a rejected operation that deserves visibility without implying the service crashed | Products client timeout followed by a retry; insufficient stock rejects reserve-stock with 422 |
| INFO | Normal lifecycle, successful steps and recorded terminal outcomes | Customer validated, saga started, or saga ended as COMPENSATED after the already-recorded rejection |
| DEBUG | Safe diagnostic detail for development/qa; disabled by default in production | Workflow begins reserve-stock attempt 1, including product_id and quantity but no token or raw payload |

Do not classify every 4xx as ERROR or every 2xx as business success.
An individual retry timeout is WARN; exhaustion is ERROR. Log the detailed cause at its boundary and use a summary at saga completion.

## References

- [CP1 journey](01-journey.md): service hops, trace propagation, retries and compensation boundaries.
- [Entities and business rules](https://github.com/code-corhuila/synkro-docs/blob/main/02-domain/entities-and-rules.md): Customer, Product, StockReservation and Sale.
- [Cross-cutting concerns](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/cross-cutting.md), sections 1-3: error catalog, JSON logs and X-Correlation-Id.
- [Products OpenAPI](https://github.com/code-corhuila/synkro-docs/blob/main/07-api/contracts/openapi/synkro-products-api.yaml): atomic reservation and insufficient-stock rejection.
- [ADR-007](https://github.com/code-corhuila/synkro-docs/blob/main/05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md): bounded retries, idempotent steps and saga outcomes.