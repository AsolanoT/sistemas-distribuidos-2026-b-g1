# synkro-worker

> Real SynkroTech service record, Week 12 — 2026-10-25.
> Component delivery is distinct from an accepted/deployed full platform.

---

## Responsibility

Current sequential scheduler runs a logging placeholder; the required low-stock Products job remains unfinished.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 07 |
| Local port | None; internal service ports are not localhost bindings |
| Repository | [synkro-worker](https://github.com/code-corhuila/synkro-worker) |
| Frozen inspected main | [8ccef730f849807809c5b11c135bc7cae3ce6342](https://github.com/code-corhuila/synkro-worker/commit/8ccef730f849807809c5b11c135bc7cae3ce6342) |
| Owner team | Development team, as recorded in domain-map.md and context contacts; no fixed domain service owner is invented |
| Coordination / contact | [AsolanoT](https://github.com/AsolanoT), existing technical lead and DOCS-97 assignee; JordanRG420 requested peer reviewer. This is not a fabricated review or staffed on-call assignment |
| DB engine | None |
| Communicates with | No implemented business call; intended Products SERVICE consumer |
| Consumed by | Scheduler ticks and SIGINT/SIGTERM; no HTTP listener |
| Status | Partial scheduler foundation merged on main, no v2.0.0 tag |

---

## Responsibilities (what this service DOES)

Sequential ticks (15m default) and cooperative run timeout (2m), safe signal shutdown when the job observes context. No business API effect is claimed.

## Out of scope (what it does NOT do)

This component has no own business store or migration runner. No broker/event contract is adopted. See [consequences and unresolved implementation](decisions.md#consequences-and-unresolved-implementation) for the service-specific gaps; the [runbook](runbook.md) gives the applicable operational actions.

---

## How to run it locally

Use [Local setup](../../../10-devops/local-setup.md) against the exact [release/candidate lock](../../../10-devops/releases/2.0.0.md), protected inputs, owning migrations and initial ADMIN procedure. PostgreSQL Infra main/qa is scaffold; use the documented open candidate rather than a plain all-main checkout. From that reviewed root:

```bash
python scripts/synkro.py up dev
python scripts/synkro.py status dev
docker ps --filter label=com.docker.compose.project=synkro-dev --filter label=com.docker.compose.service=synkro-worker --format '{{.ID}} {{.Status}}'
```

These are supported candidate operation/status commands, not executions performed by this documentation change. status checks the selected engine; container state alone is not synkro-worker business acceptance. The [runbook](runbook.md) gives diagnostic context and recovery boundaries.

---

## Related documents

- [Data model](data-model.md), [events](events.md), [decisions](decisions.md), [runbook](runbook.md)
- [API guidelines](../../../07-api/guidelines.md) and owning repository configuration; no new public contract
- [Domain map](../../../02-domain/domain-map.md), [canonical data](../../../06-data/models.md), [catalog](../../service-catalog.md)
- [Navigation and portal scope](../../../12-ux-ui/navigation-map.md), [release evidence](../../../10-devops/releases/2.0.0.md)
