# ADR-NNN — [Decision Title]

> [!NOTE] INSTRUCTIONS
> Copy this file to `records/ADR-NNN-short-title.md`, where NNN is the next sequential number.
> Each block marked INSTRUCTIONS explains what goes in the section below it. Delete these blocks once the ADR is complete.
> An ADR records a decision only when it states its dominant criterion and its accepted cost. Without them it is a statement, not a decision, and the team does not accept it.
> If the ADR groups several related decisions, write one `## Decision N — [title]` section per decision, and inside it use `###` headings for Options, Decision, Dominant criterion and Accepted cost. Context, Consequences, Affected documents, Immutability rule and References appear once for the whole ADR.

| Field | Value |
|-------|-------|
| **ID** | ADR-NNN |
| **Date** | YYYY-MM-DD |
| **Status** | Proposed |
| **Authors** | [Full name — role], [Full name] |
| **Reviewers** | [Full names] |
| **Modifies** | [ADR-NNN §N (section name)], or "None" |

---

## Context

> [!NOTE] INSTRUCTIONS
> The problem and the constraints that force a decision now. Cite the documents or findings where the problem shows up, and state what happens if nothing is decided.

[Context]

**Constraints:**
- [Constraint]

---

## Options

> [!NOTE] INSTRUCTIONS
> At least two real options: each one must be something the team could actually build. An option that exists only to lose, such as "do nothing" when doing nothing is not viable, does not count.

### Option A — [name]

[What it is, in two or three sentences.]

- **Pros:** [advantages]
- **Cons:** [disadvantages]

### Option B — [name]

[What it is, in two or three sentences.]

- **Pros:** [advantages]
- **Cons:** [disadvantages]

---

## Decision

**We decided:** [Option X, in one sentence that states what is decided.]

[What the decision fixes concretely: names, values and rules the implementation must follow.]

---

## Dominant criterion

> [!NOTE] INSTRUCTIONS
> The single factor that tipped the decision, for example team knowledge, required consistency, operating cost, latency, security or delivery time. Explain why it weighs more than the other factors in this context.

[Criterion, and why it dominates.]

---

## Accepted cost

> [!NOTE] INSTRUCTIONS
> What the chosen option sacrifices, stated plainly. If the chosen option seems to cost nothing, the other options were not real.

- [Cost]

---

## Consequences

**What changes in the system:**
- [Change]

**What must be watched:**
- [Risk or signal that would reopen this decision, and how it is mitigated]

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| [path] | [change] |

---

## Immutability rule

Once this ADR is `Accepted`, it is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

---

## References

- [Links to documentation, RFCs, articles that support the decision]
- Related to: [other ADRs]
