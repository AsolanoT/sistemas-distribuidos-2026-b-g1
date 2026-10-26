# Wireframes

> Structural screen guidance reconciled with delivered source in Week 12.
> Historical Figma/PDF frames remain reference artifacts; they are not current
> proof of a route, implemented screen, theme or runtime acceptance.
> Preserve the current design system and use the navigation map for route authority.

**Historical editable draft:** [Figma MVP UI Draft](https://www.figma.com/design/zjOfbYmvVakzjIAyh7rdPA/SynkroTech-%E2%80%94-MVP-UI-Draft). This previously recorded link is historical context, not a newly inspected live design.

**Historical exported PDF:** [MVP UI Draft](<SynkroTech — MVP UI Draft_compressed.pdf>). Its repository filename is used exactly; no new Figma frame/PDF export is claimed. The Corte 1 user-picker/monolith is distinct from current distributed Auth and portals.

---

## Reference design system (PDF page 1)

The PDF includes a "Style guide — draft v0.1" page with the earlier
palette (Ink `#1B2430`, Canvas `#F5F7FA`, Primary/Steel `#2F5D8A`,
Accent/Copper `#C97C3D`, Success `#2E8B67`, Error `#C1443C`) and base
components (buttons, stock badges). This page is kept as a historical
reference for what the MVP looked like when these screens were designed —
the current design system is `12-ux-ui/design-system.md`.

---

## The four states, as a shared convention

| State | Generic behavior |
|---|---|
| Loading | Retain route/context and accessible pending text/skeleton where implemented; do not claim identical skeletons in every component |
| Error, with retry | Safe error/correlation and an explicit appropriate retry. Distinguish a read retry from an uncertain write requiring its original intent key |
| Empty | Describe no records or no filter matches; only offer an action permitted by role and actually implemented |
| Data | Render authoritative fields; optional metadata can remain loading/unavailable without losing valid data |

Forms also distinguish validation, submitting, confirmed, rejected and uncertain outcomes. Abort/replacement guards prevent stale reads; cancel is not rollback of a committed request or a backend saga. Host 401 ends the session; route-level role denial returns to dashboard. [Actual route/flow evidence](navigation-map.md) governs availability labels below.

---

## Screen: Production Login

**Route:** /login. **Access:** public. **Owner:** delivered Auth Login, mounted by Host.

Email/password fields, associated validation and disabled pending submission use the Host authentication capability. Success restores an allowed local route or dashboard; portal never stores/reads credentials. Login 401 gives a generic credential error/password cleanup, not refresh/replay. Network/rate-limit failures require explicit retry according to the available response. Auth asset failure shows the Host unavailable state. Normal login is implemented; no new design frame is claimed. Canonical session policy remains [Browser session](../07-api/authentication.md#browser-session), Accepted ADR-016/017.

---

## Screen: Login (user picker) — Historical MVP

**Target route:** `/login` · **Current MVP route:** none (shown
conditionally, no route of its own) · **Access:** public

**Structure:**
- Logo + "Synkro Tech" centered, subtitle "Pick the user you want to work as"
- "Available users" card with a "Refresh" button
- List of available users, each with an avatar (initials), name, and a role badge (Administrator / Salesperson / Inventory)
- Bottom action button, whose label changes with state:
  - No selection: "Select a user to continue" (disabled)
  - With a selection: "Continue as [Name]" (enabled)

**Behavior:**
- Clicking a user row highlights it (border + background) and enables the button
- Login is simulated — there is no password or token yet (see `navigation-map.md`, Flow 2, MVP note)
- Confirming redirects to the selected role's default module

**States:**
- Loading: skeleton rows in the "Available users" card while the development user list loads
- Error, with retry: banner "No se pudo cargar la lista de usuarios" with "Reintentar", in place of the list
- Empty: should not occur in `develop` (the list is seeded), but shows "No hay usuarios disponibles" if it does
- Data: the populated picker described above

---

## Screen: Dashboard (Summary)

**Route:** /dashboard. **Access:** all signed-in roles. **Delivered:** DashboardPlaceholder with heading and subject.

The current Host does not render customer/product/sales totals, stock widgets or reports. Prior summary sketches are a target/historical reference, not delivered screens. Reporting APIs exist in Sales; reporting/dashboard business UI remains unfinished scope. No report cache/aggregate/service is added by this reconciliation.

---

## Screen: Customers

**Routes:** /customers, /customers/new, /customers/:id, /customers/:id/edit. **Access:** ADMIN/SALESPERSON. **Owner:** Angular custom element, ShellContract v1.

- List: paginated records, exact identityDocument and active filters; loading/error/retry/empty/data states.
- Create: labeled fields and server validation; persist/reuse one intent key and unchanged payload after an uncertain response. Pending submission blocks duplicate actions.
- Detail/edit: retrieve the authorized active resource; replacement PUT preserves ID/registrationDate and permits explicit nullable values per contract. Missing/inactive state is not an invented customer.
- Deactivate: confirm/cancel dialog; cancellation sends no write, success preserves historical document uniqueness, repeated server DELETE is a no-op for an already-inactive record.
- Navigation: Host owns history; Angular synchronizes without a second BrowserRouter/history owner. Destroyed/replaced application and reads reject stale completion. Inventory cannot mount the element.

The [R-008 evidence map](navigation-map.md#customers-routing-evidence-and-r-008) identifies real R8 route/refresh/Back/Forward coverage and remaining limits; no new screenshots or browser execution are claimed.

---

## Screen: Products

**Route:** /products. **Access:** ADMIN/INVENTORY. **Owner:** ProductsPage.

Catalog list/search/page controls, categories section and create/edit/deactivate dialogs are delivered inside this route. Manual stock uses a delta and reason with an intent key; replay keeps its receipt semantics, including the explicitly documented pre-V017 receipt limitation. Category/product mutations follow API validation and confirmation. Do not invent a /categories route or represent an inactive category as assignable. Loading/error/retry/empty/data, per-field errors, pending disabled buttons and focus return are documented by owner tests; optional alert/name failures do not authorize catalog mutation or claim Worker production.

---

## Screen: Stock lookup

**Route:** /stock. **Access:** SALESPERSON only in the Host table. **Delivered:** StockLookupPage, read-only.

Read/filter/page available products and quantities with loading/error/empty/data handling. No edit/stock-adjustment action appears. Preview availability is not a stock reservation or a continuously live guarantee; Q-003 retains optional live-check scope. Actual reservation and final amounts belong to Workflow/Products/Sales, not this display.

---

## Screen: Stock alerts

**Route:** /stock-alerts. **Access:** ADMIN/INVENTORY. **Delivered:** read-only list/filter/pagination.

Alert records show their authoritative identifiers/status/timestamps. Optional product names are loaded per distinct visible ID; failure keeps raw product ID and confines the missing name. A product link returns to the Products context. No human open/resolve button or claimed background scan exists: the API supports SERVICE writes, but Worker remains a placeholder (TD-019). Empty alerts cannot be used as proof that stock is healthy or that the scheduler completed its business function.

---

## Screen: Sales

**Route:** /sales. **Access:** ADMIN/SALESPERSON. **Delivered:** SalesPage, history plus NewSalePanel.

History has its own filters/pages/loading/error/empty/data; server enforces salesperson ownership. Registration selectors read Customer/Product metadata through the Host client, show validation and advisory totals, then send identifiers/quantities only to Workflow. Store original key/fingerprint/deadline before explicit POST; no automatic creation retry. Completed/compensated/failed/uncertain states retain distinct copy and permitted actions.

RUNNING observes 1/2/3/5-second waits then 5, a 120-second observation budget checked before each next GET and at most three consecutive poll failures. Observation timeout is unresolved, not failed/compensated. Explicit known-saga resume is GET. A same-intent uncertain retry reuses its key; changed draft or expired original 24-hour window blocks a new submission until reconciliation. Reload restores local metadata without automatic POST/GET. Logout/new session invalidates local ownership without cancelling backend work.

History remains mounted/inactive behind detail once opened, preserving draft/filter/page on Back. Inactive/unmounted observation aborts locally; late results cannot mutate the wrong session/view. Completion loads the real Sale and refreshes history; a failed confirmation lookup must not create another Sale. See [Flow 1](navigation-map.md#flow-1--register-a-sale) and Accepted ADR-016.

### Insufficient-stock rejection — exact message shown

A proven reserve-stock rejection is displayed as the failed step/business message supplied by the validated workflow projection. Do not turn an arbitrary timeout/malformed response into “insufficient stock”, COMPENSATED or success. The form keeps relevant inputs and a later explicit corrected attempt follows the state machine; an uncertain original submission remains bound to its original key/fingerprint. Screenshots/draft wording are not an authority to replace real error semantics. Accepted ADR-015 governs when stock may be released.

---

## Screen: Sale detail

**Route:** /sales/:id. **Access:** ADMIN or owning SALESPERSON. **Delivered:** SaleDetailPage.

Load Sale first; show date, sale ID, frozen total and detail quantities/unitPriceCents/subtotals. Then resolve Customer and distinct Product metadata independently, at maximum concurrency four. Loading names use placeholders; failed metadata retains raw IDs, valid amounts and a partial-data notice. Reintentar información requests only failed metadata; it never re-registers or reprices the Sale. Missing/invalid ID shows not-found; forbidden redirects to history with an ownership notice; transport error offers a read retry/correlation. Abort old route reads on navigation. The inactive Sale UI branch does not resolve the known storage restoration discrepancy TD-012.

---

## Screen: Users

**Route:** /users. **Access:** ADMIN. **Delivered:** Auth App placeholder, not the proposed create/known-ID form.

The supporting register/known-ID APIs exist and require server authorization. No users table, creation form, browser audit input or first-ADMIN screen is claimed. List-all scope remains Q-006. Keep ADMIN-only ordinary registration distinct from protected operator initialization and unresolved TD-009 recovery.

### Users screen — ADR-014 behavior

The API policy is Accepted: ordinary registration is ADMIN-only with creation audit and idempotency. The future UI must obtain authority from Host/receiving Auth, never a public sign-up route or manually entered operator role. Current source does not render that UI. InitialAdminCli runs outside browser navigation, after owner migrations and grants; it is not administrator recovery.

---

## Screen: Service tokens

**Route:** /service-tokens. **Access:** ADMIN. **Delivered:** same Auth App placeholder.

Issue/known-ID metadata APIs exist; no implemented issue/lookup form or list-all browser exists. Do not put live SERVICE credentials in this documentation or imply they are recoverable from stored metadata. Tokens and their stateless validity limits remain ADR-006/017. Q-006 records unconfirmed browse/list scope; no absent screen establishes a PO decision.

---

## Correlations

- Route map, roles, flows, and endpoints per screen → `12-ux-ui/navigation-map.md`
- Final color tokens and components (Crimson Circuit) → `12-ux-ui/design-system.md`
- Business rules behind these screens (soft delete, stock validation) → `02-domain/entities-and-rules.md`
- Sale registration saga and its outcomes → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`
- Sales domain on MongoDB → `05-architecture/decisions/records/ADR-010-sales-on-mongodb.md`
- Angular Customers portal → `05-architecture/decisions/records/ADR-011-angular-customers-portal.md`
- Frontend screen-state rules (loading, error, empty, data as a cross-cutting pattern) → `_stacks/frontend.md`
- Distributed implementation → [Host](https://github.com/code-corhuila/synkro-front/blob/c43d024790cfc6345ddd266c04e6967a8d035702/src/app/App.tsx), [Auth Login](https://github.com/code-corhuila/synkro-auth-portal/blob/15f7334d33822aaace24ec25fa1a1097a43dbad0/src/Login.tsx), [Customers routes](https://github.com/code-corhuila/synkro-customers-portal/blob/4208839dad3ccfb8eeb4feff12352c8e4cd73695/src/app/customers/customers.routes.ts), [Products routes](https://github.com/code-corhuila/synkro-products-portal/blob/b407475b363b9ac7fcbe3512852ba4146a96dadf/src/routes.tsx), [Sales routes](https://github.com/code-corhuila/synkro-sales-portal/blob/179dcf5a3bdd2b5fa09d4602cacf61c3a41e761e/src/routes.tsx); current ownership/flows in [navigation](navigation-map.md). The synkro-tech monolith remains historical Corte 1 context.
