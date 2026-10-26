# synkro-sales-api

> Real SynkroTech service record, Week 12 — 2026-10-25.
> Component delivery is distinct from an accepted/deployed full platform.

---

## Responsibility

Own Sale/SaleDetail aggregate with frozen integer amounts, saga-authorized creation, ownership-scoped reads and derived reports.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 04 |
| Local port | 8080 internal; internal service ports are not localhost bindings |
| Repository | [synkro-sales-api](https://github.com/code-corhuila/synkro-sales-api) |
| Frozen inspected main | [f163eb60552e72f2f5716dd91cb227ae23aa8683](https://github.com/code-corhuila/synkro-sales-api/commit/f163eb60552e72f2f5716dd91cb227ae23aa8683) |
| Owner team | Development team, as recorded in domain-map.md and context contacts; no fixed domain service owner is invented |
| Coordination / contact | [AsolanoT](https://github.com/AsolanoT), existing technical lead and DOCS-97 assignee; JordanRG420 requested peer reviewer. This is not a fabricated review or staffed on-call assignment |
| DB engine | MongoDB sales database, sale collection / sales_app authenticated in admin |
| Communicates with | No domain HTTP calls; Sales is a domain call-graph sink |
| Consumed by | Workflow register-sale step; Gateway history/detail/report requests |
| Status | Delivered v2.0.0 component; exact owner Sales DB pin conflict and TD-012 remain |

---

## Responsibilities (what this service DOES)

Browser reads and derived daily/monthly/top-products reports; POST /sales is Workflow SERVICE-only. Customer/Product display metadata is composed by the portal, never cross-store read.

## Out of scope (what it does NOT do)

This service owns only its documented responsibility/store; it does not write another domain store or introduce another business context. No broker/event contract is adopted. See [consequences and unresolved implementation](decisions.md#consequences-and-unresolved-implementation) for the service-specific gaps; the [runbook](runbook.md) gives the applicable operational actions.

---

## How to run it locally

Use [Local setup](../../../10-devops/local-setup.md) against the exact [release/candidate lock](../../../10-devops/releases/2.0.0.md), protected inputs, owning migrations and initial ADMIN procedure. PostgreSQL Infra main/qa is scaffold; use the documented open candidate rather than a plain all-main checkout. From that reviewed root:

```bash
python scripts/synkro.py up dev
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-sales-api --format '{{.ID}} {{.Status}}'
```

These are supported candidate operation/status commands, not executions performed by this documentation change. status checks the selected engine; container state alone is not synkro-sales-api business acceptance. The [runbook](runbook.md) gives diagnostic context and recovery boundaries.

---

## Related documents

- [Data model](data-model.md), [events](events.md), [decisions](decisions.md), [runbook](runbook.md)
- [Public contract](../../../07-api/contracts/openapi/synkro-sales-api.yaml)
- [Domain map](../../../02-domain/domain-map.md), [canonical data](../../../06-data/models.md), [catalog](../../service-catalog.md)
- [Navigation and portal scope](../../../12-ux-ui/navigation-map.md), [release evidence](../../../10-devops/releases/2.0.0.md)
