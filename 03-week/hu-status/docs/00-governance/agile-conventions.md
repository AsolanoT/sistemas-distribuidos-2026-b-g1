# Agile Team Conventions

> Defines how the team works through its development cycles. Agreed on with the
> entire team. Update when the team decides to change something.

---

## Sprint structure

| Field | Value |
|-------|-------|
| Duration | 1 week |
| Sprint start | Monday |
| Sprint end | Sunday |
| Current sprint | Sprint 3 — Week 3 of the project (16 weeks total) |
| Estimated capacity | No point estimation yet (see note below) |

> **Note:** The team uses **HU (User Story) as the only work item type**, without distinguishing Task/Spike/HU — this includes both product features and documentation/research tasks (PDR, ADR, context map, governance, etc.). Point estimation (see scale below) starts once real product feature HUs (code) exist; it does not apply to documentation HUs.

---

## Ceremonies

### Sprint Planning
- **When:** first day of the sprint (Monday)
- **Duration:** maximum 1 hour
- **Who:** entire team
- **Goal:** select and commit to the sprint's tasks/HUs, break them down into technical tasks
- **Output artifact:** GitHub Project updated with the sprint's items

### Daily Stand-up
- **When:** asynchronous, via each member's weekly README (`NN-week/hu-status/README.md`)
- **Format:**
  1. What did I do?
  2. What will I do?
  3. Is anything blocking me?
- **Rule:** technical discussions are resolved outside this report, not inside it

### Sprint Review
- **When:** last day of the sprint (Sunday)
- **Duration:** maximum 30 minutes
- **Who:** team only (no Product Owner)
- **Goal:** internally show what was built/documented that week before presenting it to the Product Owner

### Weekly (with Product Owner)
- **When:** Wednesday of each week, reviewing the previous week's work (e.g. Wednesday of week 4 reviews what was done in week 3)
- **Duration:** maximum 1 hour
- **Who:** team + Product Owner (the course instructor)
- **Goal:** present what was built/documented the previous week, collect feedback from the Product Owner, and use the same session to refine and detail the following week's tasks/HUs (merges the function of a PO-facing Sprint Review and Backlog Refinement into a single ceremony, since both depend on the instructor's weekly availability)
- **Exit criterion:** the following week's task/HU meets the Definition of Ready (DoR)

### Sprint Retrospective
- **When:** last day of the sprint (Sunday), after the internal Sprint Review
- **Duration:** maximum 30 minutes
- **Who:** team only (no Product Owner)
- **Format:** What went well / What to improve / Action commitments
- **Rule:** each retro produces at least 1 improvement action with an owner

---

## Estimation

### Scale
| Points | Meaning |
|--------|---------|
| 1 | Trivial — done in hours |
| 2 | Small — done in one day |
| 3 | Medium — takes 2–3 days |
| 5 | Large — takes almost a full sprint |
| 8 | Very large — should be split |
| 13 | Epic — MUST be split before the sprint |

**Technique:** Informal Planning Poker (team discussion, no dedicated tool)
**Applies from:** the first real product HUs (implementation Sprint 1)

### Estimation rule
- If there is disagreement of 2+ levels, discuss before voting again.
- If a story is estimated at 8 or 13, it must be split into smaller sub-tasks.

---

## Backlog tool

**Tool:** GitHub Projects
**Board URL:** *(pending — the instructor will provide the official board template)*

### Board columns
| Column | Meaning |
|--------|---------|
| What did I do? | Record of what was completed in the period |
| Up Next | Next planned tasks |
| Blockers | Impediments or dependencies |
| In Review | Under review by another team member |
| Done | Meets the Definition of Done (DoD) and is closed |

---

## Team velocity

| Sprint | Items completed | Notes |
|--------|----------------------|-------|
| Sprint 0 (weeks 1-2) | 8 HU | Discovery documentation (PDR, ADR-001) |
| Sprint 3 (week 3) | 22 HU | PDR/ADR correction + context map + populating `00-governance`, `01-context`, and `02-domain` |
| Average | — | Will be calculated once implementation starts (story points) |

---

## Related documents

- Definition of Ready → `00-governance/definition-of-ready.md`
- Definition of Done → `00-governance/definition-of-done.md`
- Risk management → `15-project-control/risks.md`
- Technical debt backlog → `15-project-control/tech-backlog.md`
