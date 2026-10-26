# Design Decisions — synkro-auth-api

> Index of existing accepted decisions and their implementation boundaries.
> This record creates no new ADR or service-local DEC identifier.

---

## Accepted architecture references

| Source | Effect in this service |
|---|---|
| [ADR-001](../../../05-architecture/decisions/records/ADR-001-architecture.md), [ADR-006](../../../05-architecture/decisions/records/ADR-006-token-validation-per-service.md), [ADR-012](../../../05-architecture/decisions/records/ADR-012-instance-bootstrap-and-environments.md), [ADR-013](../../../05-architecture/decisions/records/ADR-013-identity-as-cross-cutting-security.md), [ADR-014](../../../05-architecture/decisions/records/ADR-014-admin-only-registration-and-initial-administrator.md), [ADR-016](../../../05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md), [ADR-017](../../../05-architecture/decisions/records/ADR-017-refresh-reuse-and-jwt-revocation-boundaries.md) | Own internal user identity, credentials, refresh/logout, ADMIN-only registration/creation audit and scoped SERVICE-token issuance. |
| [Decision register](../../../05-architecture/decisions/README.md) | Acceptance, modifications and exact predecessor sections; Accepted texts are immutable |
| [Hexagonal architecture](../../../05-architecture/hexagonal-architecture.md) | Domain/application ports remain separate from I/O adapters where applicable; NGINX is declarative configuration |
| [Release record](../../../10-devops/releases/2.0.0.md) | Frozen owner revisions, actual tag/CI/review state, root candidate and failed/unexecuted gates |

## Consequences and unresolved implementation

Issued person/service JWTs are stateless and not immediately revoked by refresh reuse/logout (ADR-017). InitialAdminCli is initialization only; TD-009 recovery and Q-006 list-all scope remain pending. Auth portal login is delivered, administration screens are placeholders.

No existing design choice is reopened by this catalog. A later change to an Accepted decision uses a new modifying ADR with its own alternatives/criterion/cost, not an edit here. [Technical backlog](../../../15-project-control/technical-backlog.md) owns precise closing evidence and responsible coordination; listing a defect never accepts/defers required product behavior.

## Review and ownership boundary

Development team ownership comes from [domain map](../../../02-domain/domain-map.md); actual contacts are [context contacts](../../../01-context/overview.md#project-contacts). AsolanoT coordinates this HU and JordanRG420 is its requested reviewer. Neither assignment nor a tag/issue closure invents a permanent on-call rota, actual approval or full-root acceptance.
