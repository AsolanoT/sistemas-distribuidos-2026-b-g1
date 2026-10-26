# synkro-workflow

> Real SynkroTech service record, Week 12 — 2026-10-25.
> Component delivery is distinct from an accepted/deployed full platform.

---

## Responsibility

Own durable register-sale coordination, caller/input replay privacy, attempts/receipts and evidence-based recovery/compensation.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 06 |
| Local port | 8080 internal; internal service ports are not localhost bindings |
| Repository | [synkro-workflow](https://github.com/code-corhuila/synkro-workflow) |
| Frozen inspected main | [09a193866f05f3714a0bd1ad6d7559a9f00b3611](https://github.com/code-corhuila/synkro-workflow/commit/09a193866f05f3714a0bd1ad6d7559a9f00b3611) |
| Owner team | Development team, as recorded in domain-map.md and context contacts; no fixed domain service owner is invented |
| Coordination / contact | [AsolanoT](https://github.com/AsolanoT), existing technical lead and DOCS-97 assignee; JordanRG420 requested peer reviewer. This is not a fabricated review or staffed on-call assignment |
| DB engine | PostgreSQL workflow_schema / workflow_app |
| Communicates with | Customers validate; Products reserve/release; Sales register, each with Workflow SERVICE authority |
| Consumed by | Gateway person-authenticated POST/GET saga operations |
| Status | Delivered v2.0.0 component; TD-014/015/016 and exact-root acceptance remain |

---

## Responsibilities (what this service DOES)

POST /sagas/register-sale and authorized GET /sagas/{id}; completion/compensation/failure projections, durable attempts and safe uncertain-outcome handling.

## Out of scope (what it does NOT do)

This service owns only its documented responsibility/store; it does not write another domain store or introduce another business context. No broker/event contract is adopted. See [consequences and unresolved implementation](decisions.md#consequences-and-unresolved-implementation) for the service-specific gaps; the [runbook](runbook.md) gives the applicable operational actions.

---

## How to run it locally

Use [Local setup](../../../10-devops/local-setup.md) against the exact [release/candidate lock](../../../10-devops/releases/2.0.0.md), protected inputs, owning migrations and initial ADMIN procedure. PostgreSQL Infra main/qa is scaffold; use the documented open candidate rather than a plain all-main checkout. From that reviewed root:

```bash
python scripts/synkro.py up dev
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-workflow --format '{{.ID}} {{.Status}}'
```

These are supported candidate operation/status commands, not executions performed by this documentation change. status checks the selected engine; container state alone is not synkro-workflow business acceptance. The [runbook](runbook.md) gives diagnostic context and recovery boundaries.

---

## Related documents

- [Data model](data-model.md), [events](events.md), [decisions](decisions.md), [runbook](runbook.md)
- [Public contract](../../../07-api/contracts/openapi/synkro-workflow.yaml)
- [Domain map](../../../02-domain/domain-map.md), [canonical data](../../../06-data/models.md), [catalog](../../service-catalog.md)
- [Navigation and portal scope](../../../12-ux-ui/navigation-map.md), [release evidence](../../../10-devops/releases/2.0.0.md)
