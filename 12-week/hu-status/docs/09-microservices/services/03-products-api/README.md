# synkro-products-api

> Real SynkroTech service record, Week 12 — 2026-10-25.
> Component delivery is distinct from an accepted/deployed full platform.

---

## Responsibility

Own categories/catalog, available inventory, manual adjustment receipts, atomic all-line reservation/release and alert state.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 03 |
| Local port | 8080 internal; internal service ports are not localhost bindings |
| Repository | [synkro-products-api](https://github.com/code-corhuila/synkro-products-api) |
| Frozen inspected main | [8c04934ae5b51417a0b88506cc59734ef7913e64](https://github.com/code-corhuila/synkro-products-api/commit/8c04934ae5b51417a0b88506cc59734ef7913e64) |
| Owner team | Development team, as recorded in domain-map.md and context contacts; no fixed domain service owner is invented |
| Coordination / contact | [AsolanoT](https://github.com/AsolanoT), existing technical lead and DOCS-97 assignee; JordanRG420 requested peer reviewer. This is not a fabricated review or staffed on-call assignment |
| DB engine | PostgreSQL products_schema / products_app |
| Communicates with | No domain HTTP calls |
| Consumed by | Gateway and Workflow; Worker alert calls remain intended only |
| Status | Delivered v2.0.0 component; TD-017/018 and legacy stock receipt limit remain |

---

## Responsibilities (what this service DOES)

Products/categories CRUD, person-authorized manual adjustments, SERVICE reservation/release and SERVICE-only alert open/resolve; person alert screen is read-only.

## Out of scope (what it does NOT do)

This service owns only its documented responsibility/store; it does not write another domain store or introduce another business context. No broker/event contract is adopted. See [consequences and unresolved implementation](decisions.md#consequences-and-unresolved-implementation) for the service-specific gaps; the [runbook](runbook.md) gives the applicable operational actions.

---

## How to run it locally

Use [Local setup](../../../10-devops/local-setup.md) against the exact [release/candidate lock](../../../10-devops/releases/2.0.0.md), protected inputs, owning migrations and initial ADMIN procedure. PostgreSQL Infra main/qa is scaffold; use the documented open candidate rather than a plain all-main checkout. From that reviewed root:

```bash
python scripts/synkro.py up dev
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-products-api --format '{{.ID}} {{.Status}}'
```

These are supported candidate operation/status commands, not executions performed by this documentation change. status checks the selected engine; container state alone is not synkro-products-api business acceptance. The [runbook](runbook.md) gives diagnostic context and recovery boundaries.

---

## Related documents

- [Data model](data-model.md), [events](events.md), [decisions](decisions.md), [runbook](runbook.md)
- [Public contract](../../../07-api/contracts/openapi/synkro-products-api.yaml)
- [Domain map](../../../02-domain/domain-map.md), [canonical data](../../../06-data/models.md), [catalog](../../service-catalog.md)
- [Navigation and portal scope](../../../12-ux-ui/navigation-map.md), [release evidence](../../../10-devops/releases/2.0.0.md)
