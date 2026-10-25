# ADR-016 — Host Session Renewal and Operation Recovery

| Field | Value |
|-------|-------|
| **ID** | ADR-016 |
| **Date** | 2026-10-25 |
| **Proposal date** | 2026-10-24 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — HU-ARQ-28 owner |
| **Reviewers** | Sergio Andrés Ordóñez Díaz; Fredman Santiago Plazas Artunduaga — security/operation; individual PR approvals recorded separately |
| **Modifies** | None: specifies lifecycle inside the existing Host ownership boundary; ADR-008 Decision 4 and ADR-011 remain unchanged |
| **Traced to** | HU-ARQ-28/#254; FR-005/010; NFR-004/005/007/009; TD-010 |
| **Acceptance evidence** | Architectural acceptance was explicitly communicated by the project user on 2026-10-25 during HU-ARQ-28 preparation. This records that project decision, not individual GitHub review approvals, an instructor response, a successful CI run or a merged PR. PR review/publication remain separate evidence to attach. |

---

## Context

Auth issues credentials; the Host owns the browser session and shared transport; portals consume capabilities. The released Host already renews credentials proactively and exposes sessionId()/subscribe() to support Sales operation recovery. Earlier documentation recorded a 60-second policy proposal without an accepted decision. A merged implementation or documentation story does not ratify that policy.

Subject-only ownership cannot distinguish two logins by the same person; token-derived ownership changes on rotation and leaks credential relationships. Browser recovery must also avoid silently starting another sale when the prior outcome is unknown.

**Constraints:**
- No portal owns tokens, refresh timers, authentication state or a second HTTP client. Customers retains its existing custom-element ShellContract v1; this record does not add properties to that interface.
- Backend signature/authorization/idempotency remain authoritative. Client JWT decoding and session metadata grant no authority.
- Keep access token memory, rotating refresh credential in tab-scoped sessionStorage, existing lifetimes and 10-second shared request timeout.
- Protected 401 ends the session; never refresh and replay that operation automatically.

---

## Options

### Option A — Require login again at expiration; keep recovery in memory

Do not renew proactively. Retain operation state only while the page lives and use explicit backend reconciliation after reload or session loss.

- **Pros:** fewer timers, stored metadata and rotation races; one credential owner remains.
- **Cons:** interrupted valid work and no same-tab reload recovery; more manual reconciliation for uncertain submissions.

### Option B — Host-coordinated renewal and a session-scoped Sales journal

Renew before expiry within the Host, expose token-free session identity/notifications and let Sales retain its own bounded intent journal for explicit recovery.

- **Pros:** preserves work across successful renewal/reload; distinguishes login instances; uses existing backend saga/idempotency contracts.
- **Cons:** generation checks, one-flight coordination, protected storage writes and consumer subscriptions need careful testing. Cross-tab recovery remains outside the guarantee.

---

## Decision

**We decided: Option B.** The project explicitly accepted this Host lifecycle and 60-second renewal policy on 2026-10-25, within the existing credential ownership boundary.

### Renewal and cancellation

- Use a 60-second margin before access exp, checked after establishment/renewal, before protected requests and on focus/visible reactivation. The timer is an optimization; the margin is not a guarantee that any network or background timer will finish in time.
- Share one in-flight refresh among callers of the same Host session. Login/refresh bypass that protected gate. Canceling one wait must not create a second refresh or transfer ownership of the rotating credential.
- Consume the persisted rotating refresh credential and descriptor before transmission so reload cannot blindly replay an in-flight rotation. On success store the new pair/descriptor and publish one consistent snapshot.
- Refresh 401 requires sign-in. Timeout, network failure, malformed or lost rotation response is indeterminate and also requires fresh sign-in, with unavailability/indeterminacy wording rather than invalid-password wording. No automatic resubmission loop.
- Logout clears the local session, timers and Host-owned storage before any best-effort remote logout. Increment/invalidate generation so late login, refresh or protected replies cannot restore an old session. Failure to revoke remotely must not prevent local invalidation.
- Protected 401 ends the session without refresh-and-replay; protected 403 keeps it and shows access denied. Login credential 401 remains distinct from service failure or rate limiting.

### Token-free capability lifecycle

The federated shell/session object retains the following signatures:

```ts
user(): { sub: string; role: string } | null
sessionId(): string | null
subscribe(listener: () => void): () => void
```

The Host generates a cryptographic UUID that is not a credential, token hash, token-family identifier or authorization claim. A successful real login creates a new value, even for the same subject. Renewal and successful same-subject reload restoration retain it when valid metadata exists. Missing/corrupt/mismatched metadata causes a new ID only after successful credential restoration; a stored descriptor alone never authenticates.

Publish user and session ID before synchronous notification; invalidation publishes both null. Isolate failing listeners and make unsubscribe idempotent. Portals receive fresh user fields, not the live token-bearing session object. A retained Sales subscription must observe logout even while its screen is unmounted.

This is a per-tab lifecycle. sessionStorage can be cloned when a tab is duplicated; separate copies do not coordinate refresh rotation. No BroadcastChannel, shared worker, cookie authority, cross-tab deduplication or guaranteed recovery after storage deletion/tab closure is adopted.

### Sales journal and backend boundary

Sales alone owns synkro.sales.intent.v1. Store owner=(subject, sessionId), original key, canonical customer/product UUIDs and quantities fingerprint, optional sagaId and original expiresAt. Store no credential, customer document, personal name/address, price or total. Persist before POST; if storage is inaccessible, malformed or cannot be written, block registration rather than send an unrecoverable operation.

There is one unresolved intent per tab. Reload/mount makes no automatic POST and no automatic status request. With a known saga, offer explicit GET; without one, require reconstruction of the same request for explicit same-key retry. Keep the original 24-hour deadline without extending it on retries. After it expires, block unknown-result POST and require reconciliation; a known saga can still be read. Do not delete an uncertain key merely to permit another sale.

COMPLETED with saleId and COMPENSATED clear the journal; FAILED retains the known saga for attention. Session replacement/logout clears local references and aborts local observation, including through the retained subscription. It does not cancel a persisted saga, release stock or compensate a sale.

The 24-hour ceiling is a browser policy, not a backend retention guarantee. Current Workflow stores keys without age-based deletion, but this is not an indefinite operational SLA. Before a cleanup/restore policy can remove authoritative keys within the retry window, disable unknown-result POST retries or publish and implement a compatible retention decision. No backend TTL, endpoint or public saga state is introduced here.

---

## Dominant criterion

**Keep one credential owner and preserve the identity of an uncertain operation across one authenticated session.** The portal must not solve uncertainty by replaying credentials, changing a sale key or treating local state as backend truth.

---

## Accepted cost

The project accepts the following costs:

- More Host lifecycle state, timing/cancellation tests, earlier renewals and a fresh login after an indeterminate rotating response.
- XSS can still read browser-accessible state; the opaque ID is not a security boundary. Storage failure blocks recoverable registration.
- Closing/cloning a tab or deleting storage has no cross-tab recovery guarantee. Logout does not prove the backend saga ended.
- Browser intent state lasts at most its local retry window, while backend retention/reconciliation remains separately owned.

---

## Consequences

**What changes with this decision:** TD-010's former proposal is resolved by this accepted architectural record, with unchanged credential ownership and backend validation. The Host capability contract and Sales journal gain an explicit lifecycle decision.

**What remains open:** cross-tab coordination is not implemented/adopted; operational retention and authoritative recovery require separate evidence/decisions if introduced. The independent saga and token-revocation decisions are recorded separately in ADR-015 and ADR-017 and does not change Customers v1.

**Acceptance and publication evidence:** Architectural acceptance was explicitly communicated by the project user on 2026-10-25 during HU-ARQ-28 preparation. This records that project decision, not individual GitHub review approvals, an instructor response, a successful CI run or a merged PR. PR review/publication remain separate evidence to attach. See the [acceptance entry](../../../15-project-control/documentation-verification.md#hu-arq-28-acceptance-entry--2026-10-25).

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| [ADR register](../README.md) | Register acceptance separately from saga and revocation |
| [Authentication](../../../07-api/authentication.md#browser-session) | Margin, one-flight coordination and noncredential identity lifecycle |
| [Frontend guide](../../../_stacks/frontend.md) | Exact capabilities, unchanged Angular v1 and Sales consumer ownership |
| [Security policy](../../../00-governance/security-policy.md), [rules](../../../00-governance/security-rules.md) | Storage, stale replies, 401/403 and logout boundaries |
| [Testing](../../../11-quality/testing-strategy.md#hu-arq-28-decision-verification), [backlog](../../../15-project-control/technical-backlog.md#td-010--formalize-the-browser-renewal-policy) | Actual test references, accepted policy and remaining execution/publication limits |

---

## Immutability rule

This record is Accepted from 2026-10-25 and is not edited after acceptance. A later change requires a new ADR naming the replaced sections. Accepted ADR-006/008/011 are untouched.

---

## References

- [ADR-006](ADR-006-token-validation-per-service.md), [ADR-011](ADR-011-angular-customers-portal.md), [HU-ARQ-28](https://github.com/code-corhuila/synkro-docs/issues/254).
- [Domain/context boundaries](../../../02-domain/domain-map.md).
- Frozen Host/Sales sources, tests and reported browser verification are mapped in the [ARQ-28 verification entry](../../../15-project-control/documentation-verification.md#hu-arq-28-verification-entry--2026-10-24). A fake-based portal test is not real Host acceptance.
