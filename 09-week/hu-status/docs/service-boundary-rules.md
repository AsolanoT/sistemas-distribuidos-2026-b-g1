# Service Boundary Rules

> The rules the team actually used to decide what belongs to which
> service, and the rule for the cases that come up when a new
> responsibility needs a home. These are not aspirational — every rule
> below is illustrated with a real boundary already drawn in this system.

---

## Rule 1 — A boundary follows the bounded context, not a team or a table

Each service owns exactly one bounded context from `02-domain/domain-map.md`:
Auth, Customers, Products and Inventory, or Sales. A responsibility
belongs to the context whose business language already names it.

**Example already applied:** stock reservations and stock alerts belong
to Products, not to Sales or to the workflow, because "how much of a
product is available" and "is a product running low" are both questions
about the product itself — the ubiquitous language of Products, not of
Sales (`01-context/glossary.md`).

**Counter-example avoided:** the sale-registration saga does not belong
to Sales. Orchestrating a multi-step business process across Customers,
Products and Sales is not itself a business concept that any single
context owns — it is cross-cutting coordination, which is why it lives
in `synkro-workflow`, a dedicated orchestrator with no business entity of
its own (ADR-007; see also "Rule 4" below).

---

## Rule 2 — The schema rule: one writer per entity, always

**If two services need to write to the same entity, the boundary is
wrong — not the plan to share it.**

Every entity in `data-ownership-matrix.md` has exactly one owner. When a
second service needs that data, it gets a plain identifier and resolves
it through the owner's API — it never gets write access, and it never
gets a cached copy of fields beyond what a specific business rule
requires.

**Adapted for the shared instance (ADR-009):** before ADR-009, "its own
database" was a physical guarantee — a different instance made a
cross-schema write impossible. Now that four domains share one
PostgreSQL instance, "its own schema" is a logical guarantee instead: no
service has `GRANT` on another domain's schema (`<domain>_writer` grants
access only to `<domain>_schema`). The rule's intent — one writer per
entity — did not change; only the mechanism that enforces it did (from
"different instance" to "different credentials"). A reviewer verifies
this the same way regardless: by checking the migration's `GRANT`
statements, not by checking which instance a table lives in.

**The one documented exception, and why it is not a violation:**
`SaleDetail.unitPriceCents` is a value copied from Products into Sales.
This looks like it breaks the rule, but it does not, because Sales does
not have write access to `Product.priceCents` — it stores a frozen
historical fact ("what this customer paid"), not a live copy of the
product's current price. The two fields are allowed to diverge; a cached
copy is not (`entities-and-rules.md`, SaleDetail invariants).

---

## Rule 3 — External data is a reference, never a replica

A service refers to another domain's entity by UUID only
(`customer_id`, `product_id`). It is never allowed to pre-populate a
`customer_name` or a `product_name` column "for convenience" — that
would be rule 2 violated silently, because the moment two services each
hold a copy of a business fact, nothing guarantees they agree.

**What to do instead, at the two moments this comes up:**

- **At write time**, if a cross-domain fact must be validated before
  committing (does this customer exist and is it active?), make it a
  saga step — a real, synchronous call that can fail the whole operation
  (ADR-007 Decision 2).
- **At read time**, if the UI needs to display both an identifier and
  its human-readable form (a customer's name next to their sale), the
  **composing side is the frontend**, not the backend: the portal makes
  one call per domain it needs and assembles the view
  (`entities-and-rules.md`, "At read time — the portal composes").

---

## Rule 4 — Orchestration across contexts is its own thing, not a feature of one context

When a business process needs to coordinate three contexts in one
logical operation, that coordination gets its own service — it does not
get bolted onto whichever context happens to run last. `synkro-workflow`
exists for exactly this reason: it owns no business entity (it is not in
`domain-map.md`'s list of bounded contexts), only the execution state of
the sagas it runs (`workflow_schema`, internal to the orchestrator).

**How to recognize when this rule applies:** a single business action
needs more than one domain to agree, in order, with the possibility of
undoing an earlier step if a later one fails. If undoing is never
needed, a direct call from the acting service may be enough; if undoing
is needed, it is a saga, and the saga lives in the orchestrator, not in
either domain.

**The same reasoning extends to scheduled, cross-cutting work:**
`synkro-worker`'s low-stock job reads Products on a timer and decides
when to open or resolve an alert. It is not part of Products because
"run this check every 15 minutes regardless of any request" is an
infrastructure concern, not a business rule Products itself enforces —
Products only knows how to open and resolve one alert when asked.

---

## What to do when something "could go in either one"

1. **Name the entity it changes.** Find it in `data-ownership-matrix.md`.
   Whoever owns that entity owns the responsibility — there is no
   negotiation once the entity is identified.
2. **If no entity exists yet,** write the business rule in one sentence
   and find which context's ubiquitous language already contains its
   nouns (`01-context/glossary.md`). The context whose vocabulary names
   the concept owns it.
3. **If the responsibility spans more than one context's vocabulary,**
   it is not a feature of either one — apply Rule 4: it is orchestration,
   and it gets a new coordinating component only if undoing a step
   matters; otherwise, the calling side composes the result at read time
   (Rule 3).
4. **If after 1–3 it is still unclear,** raise it as an open question
   (`15-project-control/open-questions.md`) rather than guessing — a
   wrong boundary is expensive to undo once two `-db` repositories have
   migrations built on it.

---

## Correlations

- Bounded contexts this document assumes → `02-domain/domain-map.md`
- Entity ownership, one row per entity → `09-microservices/data-ownership-matrix.md`
- How services call each other once the boundary is drawn → `09-microservices/communication-patterns.md`
- Schema-per-domain isolation and its enforcement → ADR-009, ADR-005 Decision 3
- Saga and orchestration decision → ADR-007
- Open questions this process produces → `15-project-control/open-questions.md`
