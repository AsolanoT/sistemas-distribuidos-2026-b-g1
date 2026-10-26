# synkro-api-gateway

> Real SynkroTech service record, Week 12 — 2026-10-25.
> Component delivery is distinct from an accepted/deployed full platform.

---

## Responsibility

Own the single public API entry: declarative routing, credential-presence filtering, CORS, rate limits and correlation.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 05 |
| Local port | 8000 published; internal service ports are not localhost bindings |
| Repository | [synkro-api-gateway](https://github.com/code-corhuila/synkro-api-gateway) |
| Frozen inspected main | [5e5c3d5bdd67ae8c20eba2eaf2241d43a67adcde](https://github.com/code-corhuila/synkro-api-gateway/commit/5e5c3d5bdd67ae8c20eba2eaf2241d43a67adcde) |
| Owner team | Development team, as recorded in domain-map.md and context contacts; no fixed domain service owner is invented |
| Coordination / contact | [AsolanoT](https://github.com/AsolanoT), existing technical lead and DOCS-97 assignee; JordanRG420 requested peer reviewer. This is not a fabricated review or staffed on-call assignment |
| DB engine | None |
| Communicates with | Auth, Customers, Products, Sales APIs and Workflow |
| Consumed by | Browser via the Host-owned shared API/authentication transport |
| Status | Delivered v2.0.0 component; upstream/full-root acceptance remains separate |

---

## Responsibilities (what this service DOES)

Declarative owner NGINX route/config files, lazy request-time upstream DNS and bounded route failure; no business orchestration or custom authentication service.

## Out of scope (what it does NOT do)

This component has no own business store or migration runner. No broker/event contract is adopted. See [consequences and unresolved implementation](decisions.md#consequences-and-unresolved-implementation) for the service-specific gaps; the [runbook](runbook.md) gives the applicable operational actions.

---

## How to run it locally

Use [Local setup](../../../10-devops/local-setup.md) against the exact [release/candidate lock](../../../10-devops/releases/2.0.0.md), protected inputs, owning migrations and initial ADMIN procedure. PostgreSQL Infra main/qa is scaffold; use the documented open candidate rather than a plain all-main checkout. From that reviewed root:

```bash
python scripts/synkro.py up dev
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-api-gateway --format '{{.ID}} {{.Status}}'
```

These are supported candidate operation/status commands, not executions performed by this documentation change. status checks the selected engine; container state alone is not synkro-api-gateway business acceptance. The [runbook](runbook.md) gives diagnostic context and recovery boundaries.

---

## Related documents

- [Data model](data-model.md), [events](events.md), [decisions](decisions.md), [runbook](runbook.md)
- [API guidelines](../../../07-api/guidelines.md) and owning repository configuration; no new public contract
- [Domain map](../../../02-domain/domain-map.md), [canonical data](../../../06-data/models.md), [catalog](../../service-catalog.md)
- [Navigation and portal scope](../../../12-ux-ui/navigation-map.md), [release evidence](../../../10-devops/releases/2.0.0.md)
