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
| Current sprint | Sprint 10 — Week 10 of the project (16 weeks total) |
| Estimated capacity | Point estimation starts in Sprint 10 |

> **On "Estimated capacity" starting now:** the Estimation section below
> already states point estimation applies "from the first real product
> HUs" — Sprint 10, with the first Cut 6 code stories, is that sprint.
> The table cell above states the fact; this note is where the reasoning
> for it lives.

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

## Story identifiers

Every story is `HU-<PREFIX>-NN`. Each prefix has one sequence shared by the whole team; it never restarts by person, sprint or cut.

| Prefix | Scope | Next number |
|--------|-------|-------------|
| `DOCS` | Documents of `synkro-docs` | 94 |
| `ARQ` | Architecture decisions (ADR) and their spikes | 28 |
| `PDR`, `ADR`, `DOM` | Discovery stories of Cut 1; closed, no new numbers | — |
| `AUTH` | Auth domain: `synkro-auth-db`, `synkro-auth-api`, `synkro-auth-portal` | 03 |
| `CLI` | Customers domain: its database repository, service and portal | 03 |
| `PRO` | Products domain: its database repository, service and portal | 05 |
| `VEN` | Sales domain: its database repository, service and portal | 04 |
| `FE` | `synkro-front`, the frontend host | 05 |
| `INF` | `synkro-infra-postgres`, `synkro-infra-mongo` and work that touches every repository | 04 |
| `GTW` | `synkro-api-gateway` | 02 |
| `WKF` | `synkro-workflow` | 02 |
| `WRK` | `synkro-worker` | 02 |

### Identifier reconciliation after HU-DOCS-92 creation

This is the single repository register for the reconciled identifiers below. The verification record references this register rather than maintaining a second ledger.

| Assigned ID | Issue | Work |
|---|---|---|
| HU-DOCS-89 | [#207](https://github.com/code-corhuila/synkro-docs/issues/207) | Products portal stories in traceability. |
| HU-DOCS-90 | [#215](https://github.com/code-corhuila/synkro-docs/issues/215) | Modal/button tokens and API wording. |
| HU-DOCS-91 | [#221](https://github.com/code-corhuila/synkro-docs/issues/221) | ADR-014 tracking reconciliation. |
| HU-DOCS-92 | [#223](https://github.com/code-corhuila/synkro-docs/issues/223) | Production login ownership/session documentation. |
| HU-DOCS-93 | [#227](https://github.com/code-corhuila/synkro-docs/issues/227) | Auth reconciliation and policy-proposal traceability using existing documents. |
| HU-ARQ-27 | [#219](https://github.com/code-corhuila/synkro-docs/issues/219) | ADR-014. |

**Assignment and next-number rules:** a proposal is a candidate story without a created issue assigning its internal ID. An ID is assigned (consumed) when such an issue exists, regardless of whether its work is open, in progress, closed or cancelled; assigned IDs are never reused. `Next number` is the next unassigned number in that prefix sequence, not the next completed story.

The prior DOCS 89→92 correction reconciled three existing issues, not three stories delivered in PR #222. Creation of #223 assigned DOCS-92; creation of #227 now assigns DOCS-93, so the next DOCS number is 94. ARQ remains 28; no ARQ issue or ADR record is created by this documentation reconciliation. Reconcile this register and the counter when another issue assigns an ID.

**Lifecycle authority:** the linked GitHub issue is authoritative for its current open/closed state. A PR's `Closes #223` is an instruction to close the issue when that PR merges into main; it does not declare completion before merge. This register tracks assignment, not a duplicate lifecycle status. The catalog and board must follow actual review and merge evidence.

**Why the prefixes mix languages:** `AUTH`, `CLI`, `PRO` and `VEN` were
fixed by the course's own norm before this project defined this table —
`CLI` (Clientes), `PRO` (Productos) and `VEN` (Ventas) come from the
domain's Spanish name; `AUTH` reads the same in both languages, so it
drew no distinction at the time. They are kept as-is for continuity with
issues already filed under them, not renamed to match the rest. Every
prefix this table adds beyond those four (`FE`, `INF`, `GTW`, `WKF`,
`WRK`) follows English, consistent with `documentation-rules.md`'s rule
that everything committed to this repository is written in English. A
domain not yet listed here gets an English-rooted prefix, unless it
extends one of the four inherited ones above.

A story belongs to the prefix of the repository it changes. A code pull request references its story as `code-corhuila/synkro-docs#<issue>`; a story that needs changes in two domains is split into one story per domain.

---

## Backlog tool

**Tool:** GitHub Projects
**Board URL:** [Synkro Tech — Backlog](https://github.com/orgs/code-corhuila/projects/24)

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
| Sprint 4 (week 4) | 5 HU | Service catalog, user-stories.md/NFRs formalization, panoramic MVP (Cut 2) |
| Sprint 5-6 (weeks 5-6) | 3 HU | ADR-001 publication, deployment + threat model, ADR-002 sale authorship (HU-04) |
| Sprint 7 (week 7) | 10 HU | FR/NFR unification and traceability matrix (HU-DOCS-25, 26, 27), git-conventions alignment (HU-DOCS-28), ADR-003 + downstream and hexagonal architecture guide (HU-ARQ-14, 15), domain events and UML diagrams (HU-DOCS-29, 30), and the first two review corrections — PR #17 citation and C4 sync note (HU-DOCS-31, 33) |
| Sprint 8 (week 8) | 26 HU | HU-08 remaining corrections (HU-DOCS-32, 34, 41 and HU-ARQ-16); HU-09 first-pass contracts (7 HU); HU-10 architecture decisions — ADR-005 to ADR-008 and downstream documents (15 HU) |
| Sprint 9 (week 9) | 19 HU | HU-11 DB topology correction (ADR-009) and contract rewrites (9 HU); HU-12 governance, context, requirements and architecture alignment (10 HU). HU-13 (9 HU: Auth and Customers contracts, DDL prefixes, domain map, context sweep, backlog closure, stack guides, ⭐ documents, developer documents) confirmed Done against the board |
| Sprint 10 (week 10) | — | Two database engines and the Angular Customers portal (ADR-010 to ADR-012, HU-14: 13 HU). First code sprint starts in parallel: common repository files across all 17 code repositories (HU-INF-01, done), the base structure of `synkro-products-api` and the gateway/host pieces that depend on no pending ADR. Filled in when the sprint closes |
| Average | — | Will be calculated once implementation starts (story points) |

> **Note:** sprint labels/week mapping above follow the pattern already
> established by the Sprint 0/Sprint 3 rows (1 sprint ≈ 1 week, with
> occasional 2-week or split sprints). Confirm these labels match the
> team's actual sprint calendar before merging — this file infers them
> from work already delivered, not from an authoritative sprint log.

> **Cuts and sprints:** `04-requirements/user-stories.md` groups HUs by cut, not by
> calendar week, so its totals differ from the rows above. They reconcile: Cut 4 (52) =
> Sprint 8 (26) − 2 HUs that stay in Cut 3 (HU-DOCS-32, HU-ARQ-16) + Sprint 9 (19 done
> + 9 of HU-13, confirmed Done against the board). HU-14 (13 HU: ADR-010 to ADR-012 and
> their downstream documents) is a new cut, Cut 5 below, counted separately since it
> belongs to the two-engine/Angular correction, not the original Cut 4 themes.
> Cut 6 holds the code-phase stories, counted in story points from Sprint 10.

---

## Related documents

- Definition of Ready → `00-governance/definition-of-ready.md`
- Definition of Done → `00-governance/definition-of-done.md`
- Risk management → `15-project-control/risks.md`
- Technical debt backlog → `15-project-control/technical-backlog.md`
