# Diagram Index

> The registry of all system diagrams.
> Diagrams go in `08-uml/diagrams/source/` (draw.io `.drawio` XML files).
> Exported renders go in `08-uml/diagrams/exports/` (`.svg`).

---

## When to create a diagram?

```
✓ When the flow involves 3+ services or actors
✓ When the architecture needs to be communicated to a non-technical stakeholder
✓ When data modeling is complex (ER diagram)
✓ When a bug took more than 2 hours to understand (retroactive sequence diagram)

✗ For simple 2-element flows — code describes them better
✗ To "document for documentation's sake" — an outdated diagram is worse than none
```

---

## Tool: draw.io

Editable sources remain draw.io XML in diagrams/source; matching SVGs are in diagrams/exports. C4 shows logical responsibility/topology, while BPMN views show responsibility lanes, tasks, decisions and outcomes; these draw.io files are not executable BPMN 2.0 process definitions or runtime acceptance reports.

**How to export a diagram as SVG:** open its draw.io source, edit the model and export the same base name to diagrams/exports. For this prepared delivery, each XML/SVG pair was produced from one checked geometry/label model; the SVG metadata records the SHA-256 of its source bytes. XML structure, node/edge labels/endpoints, view bounds and the source hash are verified together. PNG previews were rendered for visual inspection; they are preparation artifacts outside the upload set, not new screenshots of the application.

**Keep source and export together in every PR.** A later source edit requires a fresh matching export/hash; SVG file existence alone does not establish parity. The C4 Mermaid versions in overview.md and affected context diagram retain the same semantics. Generic c4-container-example.md and historical Corte 1 UI artifacts are not current system views.

---

## File naming

```
[type-prefix]-[descriptive-name].drawio

Examples:
  c4-01-context.drawio
  c4-02-containers.drawio
  bpmn-auth-login.drawio
  bpmn-sales-registration.drawio
```

---

## Diagram registry

### Architecture diagrams (C4)

| ID | Name | Type | Tool | Source file | Description |
|----|------|------|------|-------------|-------------|
| C4-01 | System Context | C4 L1 | draw.io | [Source](diagrams/source/c4-01-context.drawio), [SVG](diagrams/exports/c4-01-context.svg) | Three employee roles, one SynkroTech system, no external business provider; pending UI remains explicit |
| C4-02 | Container Diagram | C4 L2 | draw.io | [Source](diagrams/source/c4-02-containers.drawio), [SVG](diagrams/exports/c4-02-containers.svg) | Twelve application components, own schemas in one PostgreSQL instance and Sales in one MongoDB instance; Worker edge is intended-only, dashboard/admin UI partial |

Logical counts are distinct from repository/container counts: 18 code repositories include four DB migration owners and two Infra owners; candidate Compose also has explicit runners/monitoring. Do not count each schema as a database instance or claim each rectangle is a separately approved deployment. The architecture overview's Mermaid and these pairs share Host/portal, Gateway, domain, saga and store ownership. The exact executable root/tag/pin states remain in the [release record](../10-devops/releases/2.0.0.md), not inferred from a diagram.

### Process diagrams (BPMN)

| ID | Name | Type | Tool | Source file | Description |
|----|------|------|------|-------------|-------------|
| BPMN-01 | Authentication (Login) | BPMN view | draw.io | [Source](diagrams/source/bpmn-auth-login.drawio), [SVG](diagrams/exports/bpmn-auth-login.svg) | Auth portal collects; Host owns credential transport/session; Gateway rate limit; Auth validates/issues. Administration UI stays pending |
| BPMN-02 | Register Customer | BPMN view | draw.io | [Source](diagrams/source/bpmn-customers-register.drawio), [SVG](diagrams/exports/bpmn-customers-register.svg) | ADMIN/SALESPERSON, original creation intent, document uniqueness and own-store write/replay |
| BPMN-03 | Update Customer | BPMN view | draw.io | [Source](diagrams/source/bpmn-customers-update.drawio), [SVG](diagrams/exports/bpmn-customers-update.svg) | Authorized active target, replacement semantics, preserved ID/date; no silent recreate |
| BPMN-04 | Deactivate Customer | BPMN view | draw.io | [Source](diagrams/source/bpmn-customers-deactivate.drawio), [SVG](diagrams/exports/bpmn-customers-deactivate.svg) | Confirm/cancel and logical deactivation; repeated inactive target is successful no-op |
| BPMN-05 | Register Product | BPMN view | draw.io | [Source](diagrams/source/bpmn-products-register.drawio), [SVG](diagrams/exports/bpmn-products-register.svg) | ADMIN/INVENTORY, active category, valid integer amount/stock and own creation intent |
| BPMN-06 | Update Product | BPMN view | draw.io | [Source](diagrams/source/bpmn-products-update.drawio), [SVG](diagrams/exports/bpmn-products-update.svg) | Catalog update is distinct from stock delta/reason receipt; frozen Sale prices are unchanged |
| BPMN-07 | Deactivate Product | BPMN view | draw.io | [Source](diagrams/source/bpmn-products-deactivate.drawio), [SVG](diagrams/exports/bpmn-products-deactivate.svg) | Preserve history, no physical deletion/cross-domain cascade, owner no-op repeat contract |
| BPMN-08 | Sale Registration | BPMN view | draw.io | [Source](diagrams/source/bpmn-sales-registration.drawio), [SVG](diagrams/exports/bpmn-sales-registration.svg) | Accepted ADR-015/016: validated rejection versus uncertainty, retained stock/original identity, distinct outcomes and local observation/recovery |

BPMN-08 no longer uses blanket “4xx compensates” or “all RUNNING resumes”. It follows Accepted ADR-015's exact modification of ADR-007 Decisions 1/2/4. A confirmed Sale receipt is different from an observation timeout; uncertain outcomes retain reservation/identity, and logout/abort does not cancel backend work. Drawings illustrate the accepted boundary; TD-014/015/016 and actual failed/unexecuted root/browser acceptance remain in the backlog/release record. Every ten existing source files and ten exports were reconciled together; none is a new execution of a business flow.

### Sequence diagrams

| ID | Name | Tool | Source file | Description |
|----|------|------|------|-------------|
| SEQ-01 | Login flow coverage | draw.io BPMN-01 | [Auth process source](diagrams/source/bpmn-auth-login.drawio), [SVG](diagrams/exports/bpmn-auth-login.svg) | The existing sequence registry entry is covered by BPMN-01; no absent standalone sequence file is claimed |

Detailed session/renewal and intent recovery remain canonical in [authentication](../07-api/authentication.md#browser-session), Accepted ADR-016/017 and [portal flows](../12-ux-ui/navigation-map.md). No second speculative sequence overrides those interfaces.

### State diagrams

The public saga status/projection and private recovery lifecycle are more complex than simple active/inactive. Their authority remains [Workflow contract](../07-api/contracts/openapi/synkro-workflow.yaml), [models](../06-data/models.md) and Accepted ADR-015. BPMN-08 shows the relevant outcome/uncertainty branches; this index does not claim a nonexistent separate state-machine export or treat browser unresolved as a new backend enum.

### ER diagrams (data)

| ID | Name | Tool | Source file | Service |
|----|------|------|------|---------|
| ERD-01 | Auth schema | Mermaid | `06-data/models.md`, "Domain: auth" | synkro-auth-api |
| ERD-02 | Customers schema | Mermaid | `06-data/models.md`, "Domain: customers" | synkro-customers-api |
| ERD-03 | Products schema | Mermaid | `06-data/models.md`, "Domain: products" | synkro-products-api |
| ERD-04 | Sales document model | Mermaid | `06-data/models.md`, "Domain: sales" | synkro-sales-api (MongoDB, ADR-010 — the `sale` collection with its lines embedded, not a relational schema) |

Note: removed "(incl. `outbox`)" — outbox was removed by ADR-007.

**Not converted to draw.io.** These stay as Mermaid inside `06-data/models.md`, right next to the actual table or document definitions they describe — moving them out would separate the diagram from the structure it documents.

---

## Correlations

- Architecture view (Mermaid originals) → `05-architecture/overview.md`
- Domain bounded contexts → `02-domain/domain-map.md`
- Data models per schema and per database → `06-data/models.md`
- Sale registration saga → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`, as modified by Accepted ADR-015 Decisions 1/2/4 boundaries (durable progress, rejection evidence and recovery). Retains the earlier replacement of ADR-003 stateless orchestration
- Sales domain on MongoDB → `05-architecture/decisions/records/ADR-010-sales-on-mongodb.md`
- Angular Customers portal → `05-architecture/decisions/records/ADR-011-angular-customers-portal.md`
