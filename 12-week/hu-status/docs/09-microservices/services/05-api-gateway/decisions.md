# Design Decisions — synkro-api-gateway

> Index of existing accepted decisions and their implementation boundaries.
> This record creates no new ADR or service-local DEC identifier.

---

## Accepted architecture references

| Source | Effect in this service |
|---|---|
| [ADR-003](../../../05-architecture/decisions/records/ADR-003-gateway-saga-async.md), [ADR-004](../../../05-architecture/decisions/records/ADR-004-api-contract-extensions.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-008](../../../05-architecture/decisions/records/ADR-008-cross-cutting-stack.md) | Own the single public API entry: declarative routing, credential-presence filtering, CORS, rate limits and correlation. |
| [Decision register](../../../05-architecture/decisions/README.md) | Acceptance, modifications and exact predecessor sections; Accepted texts are immutable |
| [Hexagonal architecture](../../../05-architecture/hexagonal-architecture.md) | Domain/application ports remain separate from I/O adapters where applicable; NGINX is declarative configuration |
| [Release record](../../../10-devops/releases/2.0.0.md) | Frozen owner revisions, actual tag/CI/review state, root candidate and failed/unexecuted gates |

## Consequences and unresolved implementation

Gateway does not validate RS256 or grant business authority. Public login/refresh must remain reachable without a prior person JWT. /health only proves Gateway, not stores/participants. Internal Workflow calls bypass it and validate locally.

No existing design choice is reopened by this catalog. A later change to an Accepted decision uses a new modifying ADR with its own alternatives/criterion/cost, not an edit here. [Technical backlog](../../../15-project-control/technical-backlog.md) owns precise closing evidence and responsible coordination; listing a defect never accepts/defers required product behavior.

## Review and ownership boundary

Development team ownership comes from [domain map](../../../02-domain/domain-map.md); actual contacts are [context contacts](../../../01-context/overview.md#project-contacts). AsolanoT coordinates this HU and JordanRG420 is its requested reviewer. Neither assignment nor a tag/issue closure invents a permanent on-call rota, actual approval or full-root acceptance.
