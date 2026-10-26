# Design Decisions — synkro-workflow

> Index of existing accepted decisions and their implementation boundaries.
> This record creates no new ADR or service-local DEC identifier.

---

## Accepted architecture references

| Source | Effect in this service |
|---|---|
| [ADR-003](../../../05-architecture/decisions/records/ADR-003-gateway-saga-async.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-007](../../../05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md), [ADR-008](../../../05-architecture/decisions/records/ADR-008-cross-cutting-stack.md), [ADR-009](../../../05-architecture/decisions/records/ADR-009-shared-instance-schema-per-domain.md), [ADR-012](../../../05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md), [ADR-015](../../../05-architecture/decisions/records/ADR-015-sale-saga-execution-safety.md), [ADR-016](../../../05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md) | Own durable register-sale coordination, caller/input replay privacy, attempts/receipts and evidence-based recovery/compensation. |
| [Decision register](../../../05-architecture/decisions/README.md) | Acceptance, modifications and exact predecessor sections; Accepted texts are immutable |
| [Hexagonal architecture](../../../05-architecture/hexagonal-architecture.md) | Domain/application ports remain separate from I/O adapters where applicable; NGINX is declarative configuration |
| [Release record](../../../10-devops/releases/2.0.0.md) | Frozen owner revisions, actual tag/CI/review state, root candidate and failed/unexecuted gates |

## Consequences and unresolved implementation

Accepted ADR-015 modifies ADR-007 Decisions 1/2/4; ambiguity retains reservations and can suspend execution. Fixed lock partition rollout is TD-014, Circuit Breaker TD-015 and HTTP408/full-jitter mismatch TD-016. Never imply all RUNNING work resumes or every 4xx compensates.

No existing design choice is reopened by this catalog. A later change to an Accepted decision uses a new modifying ADR with its own alternatives/criterion/cost, not an edit here. [Technical backlog](../../../15-project-control/technical-backlog.md) owns precise closing evidence and responsible coordination; listing a defect never accepts/defers required product behavior.

## Review and ownership boundary

Development team ownership comes from [domain map](../../../02-domain/domain-map.md); actual contacts are [context contacts](../../../01-context/overview.md#project-contacts). AsolanoT coordinates this HU and JordanRG420 is its requested reviewer. Neither assignment nor a tag/issue closure invents a permanent on-call rota, actual approval or full-root acceptance.
