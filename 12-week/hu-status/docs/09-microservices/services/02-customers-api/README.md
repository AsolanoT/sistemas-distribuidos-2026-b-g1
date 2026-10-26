# synkro-customers-api

> Real SynkroTech service record, Week 12 — 2026-10-25.
> Component delivery is distinct from an accepted/deployed full platform.

---

## Responsibility

Own Customer lifecycle, unique identity documents, exact lookup and idempotent creation while preserving operational history.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 02 |
| Local port | 8080 internal; internal service ports are not localhost bindings |
| Repository | [synkro-customers-api](https://github.com/code-corhuila/synkro-customers-api) |
| Frozen inspected main | [28caff4f2d4c5e562416db7400061675e4b6766b](https://github.com/code-corhuila/synkro-customers-api/commit/28caff4f2d4c5e562416db7400061675e4b6766b) |
| Owner team | Development team, as recorded in domain-map.md and context contacts; no fixed domain service owner is invented |
| Coordination / contact | [AsolanoT](https://github.com/AsolanoT), existing technical lead and DOCS-97 assignee; JordanRG420 requested peer reviewer. This is not a fabricated review or staffed on-call assignment |
| DB engine | PostgreSQL customers_schema / customers_app |
| Communicates with | No domain HTTP calls |
| Consumed by | Gateway, Workflow validation step; Customers Angular and Sales selector through Host/Gateway |
| Status | Delivered v2.0.0 component; owner correlated request/error logging gap #15 |

---

## Responsibilities (what this service DOES)

GET/POST /customers, GET/PUT/DELETE /customers/{id}; inactive detail/update is not a normal active-resource response, identity document stays reserved and repeated deactivation is a no-op.

## Out of scope (what it does NOT do)

This service owns only its documented responsibility/store; it does not write another domain store or introduce another business context. No broker/event contract is adopted. See [consequences and unresolved implementation](decisions.md#consequences-and-unresolved-implementation) for the service-specific gaps; the [runbook](runbook.md) gives the applicable operational actions.

---

## How to run it locally

Use [Local setup](../../../10-devops/local-setup.md) against the exact [release/candidate lock](../../../10-devops/releases/2.0.0.md), protected inputs, owning migrations and initial ADMIN procedure. PostgreSQL Infra main/qa is scaffold; use the documented open candidate rather than a plain all-main checkout. From that reviewed root:

```bash
python scripts/synkro.py up dev
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-customers-api --format '{{.ID}} {{.Status}}'
```

These are supported candidate operation/status commands, not executions performed by this documentation change. status checks the selected engine; container state alone is not synkro-customers-api business acceptance. The [runbook](runbook.md) gives diagnostic context and recovery boundaries.

---

## Related documents

- [Data model](data-model.md), [events](events.md), [decisions](decisions.md), [runbook](runbook.md)
- [Public contract](../../../07-api/contracts/openapi/synkro-customers-api.yaml)
- [Domain map](../../../02-domain/domain-map.md), [canonical data](../../../06-data/models.md), [catalog](../../service-catalog.md)
- [Navigation and portal scope](../../../12-ux-ui/navigation-map.md), [release evidence](../../../10-devops/releases/2.0.0.md)
