# ADR-017 — Refresh Reuse and JWT Revocation Boundaries

| Field | Value |
|-------|-------|
| **ID** | ADR-017 |
| **Date** | 2026-10-25 |
| **Proposal date** | 2026-10-24 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — HU-ARQ-28 owner |
| **Reviewers** | Fredman Santiago Plazas Artunduaga — security/operation; Sergio Andrés Ordóñez Díaz — contract consistency; individual PR approvals recorded separately |
| **Modifies** | None: clarifies token-class effects within ADR-006 Decisions 1 and 2; no runtime revocation lookup or replacement of those decisions |
| **Traced to** | HU-ARQ-28/#254; FR-010; NFR-004/009; TD-011 |
| **Acceptance evidence** | Architectural acceptance was explicitly communicated by the project user on 2026-10-25 during HU-ARQ-28 preparation. This records that project decision, not individual GitHub review approvals, an instructor response, a successful CI run or a merged PR. PR review/publication remain separate evidence to attach. |

---

## Context

Before this reconciliation, the security policy used the broad phrase that reuse invalidates all active tokens. The mutable policy now distinguishes the observed token classes and links this record, accepted by the explicit project decision on 2026-10-25. The former phrase mixed server-stored rotating refresh credentials, one-hour person JWTs and independent 30-day service JWTs. The delivered Auth adapter can invalidate refresh rows; receiving services validate signed JWTs locally and do not query Auth or a revocation list. The logout contract explicitly leaves an issued access token valid until expiry.

RefreshUseCase and JdbcRefreshTokenStore already rotate atomically and serialize rotation/reuse invalidation by owner. An inactive, unexpired known row identifies reuse; an unknown or expired value does not identify a user whose credentials may all be invalidated. The accepted policy describes these effects without promising an unbuilt enforcement path.

**Constraints:** retain local RS256 verification, one-hour access and seven-day refresh lifetimes, 30-day service credentials, hash-only refresh storage and current public endpoints. No raw token in logs, denylist, token-family/version column, introspection endpoint or new infrastructure is introduced.

---

## Options

### Option A — Invalidate stored refresh credentials and retain bounded JWT validity

On detected refresh reuse, invalidate the owner's currently active stored refresh rows. Issued signed person/service JWTs remain subject to local signature/expiry/permission checks until their normal expiry.

- **Pros:** matches current contracts and ownership, has no Auth lookup on every service request, and stops renewal using known compromised refresh credentials.
- **Cons:** already-issued access credentials retain a residual validity window; a compromised service credential requires controlled replacement and is not revoked through person refresh reuse.

### Option B — Adopt coordinated immediate JWT revocation

Add an explicit mechanism such as a per-subject token version checked by every receiver or a distributed denylist/introspection policy, with defined propagation and failure behavior for both person and service tokens.

- **Pros:** can reject issued credentials before expiry after a revocation event.
- **Cons:** new state, contracts, service dependencies and availability/caching choices; requires a modifying decision for ADR-006, implementation in every receiving service and propagation/failure tests. It is not delivered.

---

## Decision

**We decided: Option A.** The token-class table below is the accepted policy from 2026-10-25. It records the residual risk and does not imply that Option B exists.

| Trigger / credential class | Effect | Enforcement boundary |
|---|---|---|
| Successful refresh | Consume the submitted usable hash and persist its replacement atomically | Auth-owned refresh store; one use per credential |
| Reuse of a known inactive, unexpired refresh row | Reject with 401 and invalidate all currently active refresh rows of that owner | Auth use case and owner-serialized committed revocation; no table deletion |
| Unknown or expired refresh value | Reject with 401 | Do not infer an owner or revoke another person's credentials |
| Logout | Invalidate only the supplied usable refresh credential when owned by the validated caller; uniform idempotent success hides existence/owner | Auth store; best-effort request is separate from unconditional local Host logout |
| Already-issued person access JWT | No immediate revocation through refresh-row mutation or local browser logout | Receiver validates signature, claims, permission and expiry; nominal lifetime one hour, subject to the documented clock-skew allowance |
| Service JWT | Person refresh reuse/logout does not revoke it | Its own local validation/expiry and scoped permissions; controlled replacement before 30-day expiry |
| Password or role change | Do not infer immediate revocation of issued JWTs | Password-change refresh invalidation remains a security requirement if that flow is introduced; its implementation is not claimed. Any broader trigger needs explicit endpoint, policy and evidence; this ADR invents none |

Keep rotation and owner-wide revocation serialized under Auth's existing owner lock so a concurrent replacement cannot escape a completed reuse-invalidation transaction. The invalidation must commit despite the request returning 401; authentication failure must not roll it back. Preserve historical inactive rows for reuse detection, without turning them into a token-family model.

Single-flight Host renewal reduces accidental duplicate rotation within one tab but does not serialize cloned tabs. A lost rotating response requires fresh login under the separate Accepted ADR-016. Clearing an opaque browser session ID invalidates local ownership only; it cannot revoke a JWT accepted by another service.

Administrator recovery remains TD-009. Reissuing an initial administrator or rotating a person refresh token is not a workaround for missing recovery authority. A leaked service credential, required immediate revocation or unacceptable residual access window reopens this decision through a new record with enforceable alternatives.

---

## Dominant criterion

**Make every revocation claim match an enforcement mechanism that the system owns and can test.** Local validation avoids a new per-request dependency, but its residual credential window must be visible to reviewers and operators.

---

## Accepted cost

The project accepts the following costs:

- A signed person JWT may remain usable until expiry even after refresh invalidation, logout or a role change; the configured validation skew can extend acceptance near that boundary.
- Owner-wide refresh invalidation affects other tabs/devices of the same user. A newly issued session after the event is not permanently barred by a historical invalidation.
- Service tokens are scoped and manually replaced; there is no immediate per-token revocation facility. Emergency key replacement is not silently adopted as a targeted revocation protocol.
- Historical refresh rows and concurrency tests remain necessary. A smaller future residual window or immediate revocation needs its own architectural change and rollout.

---

## Consequences

**What changes with this decision:** security policy, authentication guidance and threat S-3 describe refresh invalidation precisely instead of claiming all JWTs are immediately revoked. TD-011's policy question is resolved by the explicit 2026-10-25 acceptance; runtime guarantees still require the relevant tests.

**What remains open:** no immediate revocation mechanism, token family, new admin recovery or changed service permissions. This record does not replace ADR-006 or claim instructor confirmation of ADR-013's identity classification.

**Acceptance and publication evidence:** Architectural acceptance was explicitly communicated by the project user on 2026-10-25 during HU-ARQ-28 preparation. This records that project decision, not individual GitHub review approvals, an instructor response, a successful CI run or a merged PR. PR review/publication remain separate evidence to attach. See the [acceptance entry](../../../15-project-control/documentation-verification.md#hu-arq-28-acceptance-entry--2026-10-25).

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| [ADR register](../README.md) | Register the independent accepted decision and its unchanged ADR-006 context |
| [Authentication](../../../07-api/authentication.md#refresh-token-flow) | Explicit credential classes and reuse/logout effects |
| [Security policy](../../../00-governance/security-policy.md), [rules](../../../00-governance/security-rules.md), [threat model](../../security-threat-model.md) | Remove unsupported immediate-revocation readings and retain residual exposure |
| [Testing](../../../11-quality/testing-strategy.md#hu-arq-28-decision-verification) | Rotation/reuse race, owner-scoped logout and JWT-after-logout cases |
| [Backlog](../../../15-project-control/technical-backlog.md#td-011--clarify-reuse-detection-and-stateless-jwt-revocation) | Policy acceptance recorded; runtime and publication evidence remain distinct |

---

## Immutability rule

This record is Accepted from 2026-10-25 and is not edited after acceptance. A later change requires a new ADR naming the replaced sections. Accepted ADR-006 remains unchanged.

---

## References

- [ADR-006](ADR-006-token-validation-per-service.md), [ADR-014 scope](ADR-014-admin-only-registration-and-initial-administrator.md), [HU-ARQ-28](https://github.com/code-corhuila/synkro-docs/issues/254).
- Auth source/test mapping in the [ARQ-28 verification entry](../../../15-project-control/documentation-verification.md#hu-arq-28-verification-entry--2026-10-24). The policy's explicit acceptance and existing implementation evidence remain distinct.
