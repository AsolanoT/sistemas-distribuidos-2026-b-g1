# Design Decisions — synkro-customers-api

> Index of existing accepted decisions and their implementation boundaries.
> This record creates no new ADR or service-local DEC identifier.

---

## Accepted architecture references

| Source | Effect in this service |
|---|---|
| [ADR-005](../../../05-architecture/decisions/records/ADR-005-data-isolation-per-domain.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-009](../../../05-architecture/decisions/records/ADR-009-shared-instance-schema-per-domain.md), [ADR-011](../../../05-architecture/decisions/records/ADR-011-angular-customers-portal.md), [ADR-012](../../../05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md) | Own Customer lifecycle, unique identity documents, exact lookup and idempotent creation while preserving operational history. |
| [Decision register](../../../05-architecture/decisions/README.md) | Acceptance, modifications and exact predecessor sections; Accepted texts are immutable |
| [Hexagonal architecture](../../../05-architecture/hexagonal-architecture.md) | Domain/application ports remain separate from I/O adapters where applicable; NGINX is declarative configuration |
| [Release record](../../../10-devops/releases/2.0.0.md) | Frozen owner revisions, actual tag/CI/review state, root candidate and failed/unexecuted gates |

## Consequences and unresolved implementation

Published component lacks complete correlated request/error logs (owner #15), although responses carry correlation. The Angular portal is a separate repository with exact ShellContract v1; API is Java and has no frontend/session ownership.

No existing design choice is reopened by this catalog. A later change to an Accepted decision uses a new modifying ADR with its own alternatives/criterion/cost, not an edit here. [Technical backlog](../../../15-project-control/technical-backlog.md) owns precise closing evidence and responsible coordination; listing a defect never accepts/defers required product behavior.

## Review and ownership boundary

Development team ownership comes from [domain map](../../../02-domain/domain-map.md); actual contacts are [context contacts](../../../01-context/overview.md#project-contacts). AsolanoT coordinates this HU and JordanRG420 is its requested reviewer. Neither assignment nor a tag/issue closure invents a permanent on-call rota, actual approval or full-root acceptance.
