# ADR-015 — Sale Saga Execution Safety

| Field | Value |
|-------|-------|
| **ID** | ADR-015 |
| **Date** | 2026-10-25 |
| **Proposal date** | 2026-10-24 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — HU-ARQ-28 owner |
| **Reviewers** | Sergio Andrés Ordóñez Díaz — saga/contracts; Fredman Santiago Plazas Artunduaga — security/operation; individual PR approvals recorded separately |
| **Modifies** | ADR-007 Decision 2, POST same-key replay and retry/business-4xx compensation bullets; Decision 1, automatic startup resumption of every RUNNING saga; Decision 4, failure-record interpretation for suspended uncertain execution |
| **Traced to** | HU-ARQ-28/#254; FR-005/006/007; NFR-004/005/007/009; TD-013/014/016 |
| **Acceptance evidence** | Architectural acceptance was explicitly communicated by the project user on 2026-10-25 during HU-ARQ-28 preparation. This records that project decision, not individual GitHub review approvals, an instructor response, a successful CI run or a merged PR. PR review/publication remain separate evidence to attach. |

---

## Context

ADR-007 makes the persisted saga and participant idempotency authoritative. Its Decision 2 also treats a business 4xx as a trigger for compensation. Implementation revealed that a received error can be malformed, belong to another trace, or follow a prior attempt whose sale committed before its response was lost. Releasing stock in those cases can leave a valid sale without its reservation. A changed or foreign replay can also disclose another caller's stored operation unless authorization precedes lookup/return.

HU-DOCS-95 reconciled the delivered code and contracts and left this change explicitly unaccepted. Its incorporation through PR #258 and the closure of #253 do not accept an architectural modification. The explicit 2026-10-25 project decision accepts the modification recorded here; PR review and integration remain separate evidence.

**Constraints:**
- Keep the existing three participants, step order, frozen prices, integer totals, service credentials and public resource paths.
- Preserve the four public statuses RUNNING, COMPLETED, COMPENSATED and FAILED. Private diagnostics are not public states.
- Keep workflow_schema in the shared PostgreSQL instance; no new store or database instance.
- Preserve ADR-007 and all other Accepted record files unchanged.
- A status code alone cannot prove that an earlier write did not commit.

---

## Options

### Option A — Add authoritative participant reconciliation operations

Add explicit participant lookups/recovery contracts keyed by the original operation, with reviewed authorization, retention and evidence rules. The coordinator resolves ambiguous effects through those contracts before continuing or compensating.

- **Pros:** more uncertain executions can recover automatically; operators obtain a supported evidence path.
- **Cons:** new participant contracts, implementations and tests; a lookup's absence still needs an explicit consistency/retention guarantee before it proves no effect. This capability is not delivered today.

### Option B — Validate existing receipts and rejections; suspend uncertainty

Use the existing idempotent operations, require trustworthy rejection evidence, persist attempts before dispatch, and retain the reservation whenever a possible write cannot be resolved safely. A responsible operator reconciles evidence without an undocumented row reset.

- **Pros:** preserves current participant boundaries and prevents unsafe stock release without adding an unbuilt recovery API.
- **Cons:** some stock remains unavailable pending investigation; automatic startup recovery intentionally excludes suspended executions; recovery needs an owner and later approved procedure.

---

## Decision

**We decided: Option B.** The rules below replace the named ADR-007 clauses. The project acceptance is dated 2026-10-25; it does not accept the existing implementation deviations or assert their correction.

### Replay authorization and public projection

Authenticate the person and authorize ADMIN/SALESPERSON before processing a creation replay. Canonicalize validated UUIDs and line order; reject duplicate products. For the same key:

| Condition | Response | Effects |
|---|---|---|
| Same caller and equivalent normalized input | 200, existing saga | No new row or participant dispatch |
| Same caller and different validated input | 400 VALIDATION_ERROR, generic message | No stored input disclosure or mutation |
| Another caller | 403 FORBIDDEN, generic message | No stored owner/input/saga identifier disclosure or effects |

The first valid creation remains 201 with Location. A replay does not obtain a fresh retry budget. GET authorization remains the existing ADMIN/SALESPERSON contract; the POST ownership rule does not silently introduce an owner-only GET rule.

The public projection remains sagaId, sagaType, status, completedSteps, optional failedStep/saleId, createdAt and updatedAt. Never expose input, initiatedBy, raw receipts, execution, attempts, pendingStep, correlation metadata or error_detail as additional response fields.

### Rejection evidence and safe compensation

Validate the complete response before calling it a rejection: operation-permitted status; application/json media type; exactly one JSON object without duplicate keys/trailing values; nonempty message/error/traceId; matching original trace; compatible status/error; and valid optional field/message detail entries.

| Participant operation | Permitted rejection statuses | Additional meaning |
|---|---|---|
| Read customer | 404 | A valid successful customer representation with active=false also rejects this read-only step |
| Reserve stock | 400, 422 | Does not prove a previous ambiguous reservation attempt had no effect |
| Register sale | 400, 422 | Does not disprove a possibly committed sale from an earlier attempt |
| Read/release reservation during compensation | 404 | Does not turn failed release into successful compensation |

400 requires VALIDATION_ERROR; 404 requires NOT_FOUND; 422 permits BUSINESS_RULE_VIOLATION or INVALID_STATUS_TRANSITION for its operation. A response outside this allow-list, or an invalid envelope, is not proof of a business rejection. Likewise, 401/403 are authorization failures, not permission to release stock.

Confirmed rejection with no prior ambiguous mutating attempt can begin reverse compensation. If an earlier mutating attempt may have committed, a later valid rejection alone is insufficient: retain the reservation and record unresolved execution. The read-only customer step has no mutating effect to retain. Validate successful participant representations too, including reserved products/quantities, frozen integer prices, creator and sale totals.

### Durable execution and failure classification

- Persist original correlationId, pendingStep and per-step attempts under private step_results.execution before dispatch. Persist each successful step before the next; resume with the original saga/step key and correlation, without resetting attempts on restart.
- Keep the current composition's maximum of three attempts per step, including release-stock. A completed step clears its pending attempt metadata; a new POST or process does not replenish the budget.
- Retry only classified transient transport I/O/request timeouts, 429 and the documented transient 5xx responses (500/502/503/504). Do not blindly retry all IOException subclasses: TLS, DNS/address/configuration, serialization/programming, protocol and response-size failures require their own local/protocol classification.
- 408 is not adopted as an additional HTTP retry category. The delivered classifier includes it; TD-016 remains open until corrected. Preserve exponential backoff with full jitter; the delivered bound + random(0..bound/2) formula is a second TD-016 discrepancy, not the target policy.
- Exhausted or untrustworthy forward outcomes stay RUNNING with private error_detail=OUTCOME_UNRESOLVED. The startup scan excludes that marker. RUNNING with failed_step identifies compensation; failed/exhausted compensation ends FAILED.
- These changes replace the unconditional "resume every RUNNING" interpretation, while keeping all four statuses and the schema intact. Operators must distinguish execution, compensation and suspension from private evidence.

No UI timeout, logout, local journal expiry or absence of a final response proves a backend failure. None authorizes another sale key, cancellation or compensation. TD-009 is administrator recovery and is not a saga-repair mechanism. A saga recovery procedure requires reviewed participant evidence; this decision authorizes no manual row edits, counter resets or automatic repair of FAILED.

### Exclusive execution and advisory locks

Use one session-level PostgreSQL lease on a dedicated connection across committed transitions; a transaction-only lock would expire between steps. Loss of that connection invalidates the executor's authority to save further transitions. Participant idempotency remains necessary for an in-flight effect whose response was lost.

The delivered Workflow folds the UUID into an unrestricted two-int pair. Auth refresh already uses the same pair space with first key 0x52544F4B; Auth initialization uses the separate bigint overload. Schemas do not isolate these locks.

**Accepted target allocation — implementation pending:** reserve first key 0x57464C4B (1464224843, WFLK) for Workflow; derive the second signed 32-bit key deterministically by XOR of the UUID's four 32-bit words. Auth refresh keeps 0x52544F4B. Same-namespace hash collisions may serialize unrelated sagas but must never alias their database identities. This is the accepted target correction, not the algorithm in released Workflow.

TD-014 requires deterministic key/connection-loss/concurrency tests and a reviewed rollout. Quiesce legacy executors and in-flight ownership before switching algorithms: concurrent old/new algorithms could otherwise give two executors different locks for the same saga. Record this separately from the code's existing lease tests. No namespace-isolation guarantee is claimed until the change is implemented and verified.

---

## Dominant criterion

**Prevent a duplicate sale or an unsafe stock release when execution evidence is uncertain.** Holding stock for reconciliation costs availability, but inventing a negative outcome can violate the sale/stock invariant across domains.

---

## Accepted cost

The project accepts the following costs:

- Suspended RUNNING executions can hold stock until a responsible person obtains sufficient evidence; there is no new automatic recovery endpoint.
- Durable execution metadata, dedicated lease connections, stricter response validation and failure-boundary tests increase implementation and operational work.
- The accepted 32-bit namespace partition may serialize unrelated sagas after a hash collision and needs a coordinated rollout. TD-014 and TD-016 remain implementation work.
- A generic replay error deliberately gives the caller less diagnostic detail; authorized logs and private evidence carry the diagnosis without secrets.

---

## Consequences

**What changes with this decision:** the named ADR-007 clauses gain evidence-sensitive compensation, authorized replay, durable retry limits and explicit suspension. The register records the replacement in both directions; the original record stays byte-for-byte unchanged.

**What remains open:** TD-014 namespace rollout/tests, TD-015 Circuit Breaker delivery, TD-016 retry/jitter correction and an evidence-backed operational recovery procedure. Acceptance of this ADR does not close these implementation gaps, HU-INF-02, CI or production acceptance.

**Acceptance and publication evidence:** Architectural acceptance was explicitly communicated by the project user on 2026-10-25 during HU-ARQ-28 preparation. This records that project decision, not individual GitHub review approvals, an instructor response, a successful CI run or a merged PR. PR review/publication remain separate evidence to attach. See the [acceptance entry](../../../15-project-control/documentation-verification.md#hu-arq-28-acceptance-entry--2026-10-25).

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| [ADR register](../README.md) | Accepted reciprocal modification links, 2026-10-25 decision evidence and later PR publication |
| [REST Guidelines](../../../07-api/guidelines.md#saga-decision-status) | Canonical accepted decision and implementation boundary |
| [Workflow contract](../../../07-api/contracts/openapi/synkro-workflow.yaml) | Replay/privacy semantics linked to this Accepted record; implementation discrepancies retained |
| [Cross-cutting](../../cross-cutting.md), [patterns](../../pattern-guide.md) | Evidence-sensitive rejection, durable limits and unresolved execution |
| [Data models](../../../06-data/models.md#reserved-advisory-lock-keys) | Actual usage and separately marked accepted target awaiting implementation |
| [Threat model](../../security-threat-model.md), [testing](../../../11-quality/testing-strategy.md#hu-arq-28-decision-verification) | Unsafe compensation/replay/lock cases and actual versus required evidence |
| [Technical backlog](../../../15-project-control/technical-backlog.md) | Keep decision and implementation closure separate |

---

## Immutability rule

This record is Accepted from 2026-10-25 and is not edited after acceptance. A later change requires a new ADR naming the replaced sections. No Accepted predecessor is edited by this decision.

---

## References

- [ADR-007](ADR-007-persistent-saga-and-scheduled-work.md), Decisions 1, 2 and 4; [ADR-006](ADR-006-token-validation-per-service.md).
- [Domain invariants](../../../02-domain/entities-and-rules.md), [context boundaries](../../../02-domain/domain-map.md), [HU-ARQ-28](https://github.com/code-corhuila/synkro-docs/issues/254).
- Frozen implementation and test paths are enumerated in the [ARQ-28 verification entry](../../../15-project-control/documentation-verification.md#hu-arq-28-verification-entry--2026-10-24). Existing test evidence does not establish execution of the accepted, not-yet-delivered namespace correction.
