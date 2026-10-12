# Wireframes

> Low/medium-fidelity designs of the main screens, built in Figma. The
> focus is structure and flow — not the final design system (that lives in
> `design-system.md`, Crimson Circuit palette).
>
> **Important note on color:** the screenshots in this document and in the
> attached PDF use the **pre-Crimson-Circuit** blue/copper palette (the
> same one currently in the real code, `tokens.css`, before HU-FE-02
> replaces it). Ignore color when reviewing this — what matters here is
> what information each screen carries and how navigation flows between
> them.
>
> **Note on the four screens added in this revision** (Stock alerts, Sale
> detail, Users, Service tokens): none of these has a Figma frame yet —
> they are described here structurally, in the same text format as every
> other screen, so implementation is not blocked on visual design. Whoever
> does the Figma pass next should add frames for these four and keep this
> document's structure/behavior/states as the source of truth for what
> each one must contain.

**Figma (editable, live version):**
https://www.figma.com/design/zjOfbYmvVakzjIAyh7rdPA/SynkroTech-%E2%80%94-MVP-UI-Draft

**Exported PDF (stable version, uploaded in this same folder):**
`12-ux-ui/SynkroTech-MVP-UI-Draft.pdf` — so this file stays reviewable even
if the Figma link's permissions change or it expires.

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

Every screen below that shows a list or a record follows the same four
states (`navigation-map.md`'s screens are all either a list, a detail, or
a form over one of those). Rather than repeat the generic description four
times per screen, this section defines the pattern once; each screen's
own **States** entry only says what is specific to it.

| State | Generic behavior |
|---|---|
| Loading | Skeleton rows (lists) or a skeleton card (detail), matching the shape of the real content — never a blank screen or a spinner alone |
| Error, with retry | A banner or toast with a short message and a "Retry" button that repeats the same request; the page's static chrome (header, navigation) stays visible and usable |
| Empty | A short message naming the entity ("No customers yet") plus the primary action for that screen, when the role has one (e.g. "New customer") |
| Data | The populated list or record, as described in that screen's own Structure |

---

## Screen: Production Login

**Route:** `/login` · **Access:** public · **Owner:** `synkro-auth-portal`; the host routes and loads it without a session.

- Email and password fields have labels and accessible validation messages. The submit button is disabled while pending; credentials are sent through the host-owned authentication operation, not a portal-owned client.
- Success establishes the host session and returns to the requested authorized local route or default dashboard. The portal does not store tokens.
- Login `401`: show “Correo o contraseña incorrectos”, clear the password and remain on the form. Do not refresh, retry automatically or reveal account existence.
- Network/service failure: show “No se pudo iniciar sesión. Inténtalo de nuevo.” Rate limiting follows the supplied wait; the next login submission is explicit.
- Auth remote load failure uses the host's unavailable notice; the surrounding layout remains usable.
- Session expiration/recovery belongs to [Browser session](../07-api/authentication.md#browser-session), not to this component. Implementation and a production design frame remain pending.

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

**Target route:** `/dashboard` (shared by role) · **Current MVP route:** `/summary`, ADMIN only · **Target access:** ADMIN, SALESPERSON, INVENTORY (different content per role, see `navigation-map.md`)

**Structure (ADMIN view, the only one implemented today):**
- 3 stat tiles on top: Active customers, Active products, Out of stock
- 2 stat tiles below: Sales registered, Total revenue
- "Recent sales" table: date, customer, lines, total
- "Lowest stock" table: product, category, price, stock (with a colored badge)
- Footnote clarifying the sample figures are illustrative

**Behavior:**
- Read-only view, no actions — it's a snapshot, not a form
- The SALESPERSON and INVENTORY views (own sales / stock alerts) are still pending design in Figma — this PDF screen only covers the ADMIN view
- Each stat tile and table is a separate widget, owned by the portal of the domain it reads from (`navigation-map.md`, "Dashboard ownership") — one widget's failure does not blank the rest of the dashboard

**States (per widget, not per page):**
- Loading: each stat tile shows a skeleton number; each table shows skeleton rows, independently of the others
- Error, with retry: a widget that fails shows a small inline message ("No se pudo cargar") with "Reintentar" scoped to that one tile or table — the rest of the dashboard keeps whatever it already loaded
- Empty: a table widget with no rows shows "Sin datos para este periodo" instead of an empty table
- Data: the populated tiles and tables described above

---

## Screen: Customers

**Route:** `/customers` · **Access:** ADMIN, SALESPERSON · **Portal:** `synkro-customers-portal` (Angular)

**Structure:**
- Header "Customers" + subtitle "Deactivating never deletes — past sales keep resolving"
- "New customer" button (top right)
- Table: Name (+ address as subtext), Tax ID, Email, Phone, Status (Active/Inactive badge), Actions (Edit, Deactivate)

**Behavior:**
- "Deactivate" does not delete the record — consistent with the soft-delete rule (`active` flag) already fixed in `models.md`
- The subtitle communicates that business rule explicitly to the user, not just to the developer
- Identical view for ADMIN and SALESPERSON — the role difference is which other modules appear in the sidebar, not this screen

**States:**
- Loading: skeleton rows in the table
- Error, with retry: banner above the table, table area empty until retried
- Empty: "No customers registered yet" + "New customer" button
- Data: the populated table described above

---

## Screen: Products

**Route:** `/products` · **Access:** ADMIN, INVENTORY · **Portal:** `synkro-products-portal` (React)

**Structure:**
- 3 stat tiles: Active products, Out of stock, Active categories
- "Catalogue" table: Product, Category (badge), Price, Stock (colored badge), Status, Actions (Edit, Deactivate)
- "Categories" section below: chips for existing categories + "New category" button
- "New product" button top right

**Behavior:**
- Same soft-delete pattern as Customers
- Stock badges use color to reinforce state (green = in stock), but the number is always visible next to the badge — it never depends on color alone
- The "Categories" section calls `GET`/`POST /api/v1/products/categories` independently of the catalogue table above it, so one can show data while the other is still loading or has failed

**States:**
- Loading: skeleton stat tiles, skeleton catalogue rows, skeleton category chips — independently, since they are separate requests
- Error, with retry: the catalogue table and the categories section each show their own inline retry if their own request fails; the stat tiles show "—" with a small retry icon
- Empty: catalogue shows "No products registered yet" + "New product"; categories section shows "No categories yet" + "New category"
- Data: the populated screen described above

---

## Screen: Stock lookup

**Route:** `/stock` · **Access:** SALESPERSON only · **Portal:** `synkro-products-portal` (React)

**Structure:**
- 3 stat tiles: Sellable products, In stock, Out of stock
- "Search by name or category..." field
- Read-only table: Product, Category, Price, Stock — **no Actions column**

**Behavior:**
- Unlike Products, this screen has no "Edit" or "Deactivate" — intentional (see `navigation-map.md`: "a salesperson can check what is available to sell without being able to edit the catalogue")
- Confirms in the real design what was already documented in the navigation map

**States:**
- Loading: skeleton rows
- Error, with retry: banner above the table
- Empty: "No products match your search" when a filter returns nothing; "No products registered yet" with no filter applied
- Data: the populated read-only table described above

---

## Screen: Stock alerts

**Route:** `/stock-alerts` · **Access:** ADMIN, INVENTORY · **Portal:** `synkro-products-portal` (React) · **New screen, no Figma frame yet**

**Structure:**
- Header "Stock alerts" + subtitle "Opened automatically when a product's stock drops to or below the threshold"
- Filter: status (`OPEN` / `RESOLVED` / all)
- Table: Product, Stock at opening, Status (badge), Opened at, Resolved at (blank if still open) — **no manual actions**: alerts are opened and resolved only by `synkro-worker`, never by a person clicking a button here (`navigation-map.md`, Flow 5)

**Behavior:**
- Read-only, same spirit as Stock lookup: this screen shows what the worker has already decided, it does not let a person resolve an alert by hand
- Clicking a row's product name navigates to that product in `/products`, for the person to act on it there (adjust stock)
- Calls `GET /api/v1/stock-alerts`, with the `status` filter as a query parameter

**States:**
- Loading: skeleton rows
- Error, with retry: banner above the table
- Empty: "No open alerts right now" (when filtered to `OPEN`) or "No alerts recorded yet" (unfiltered)
- Data: the populated table described above

---

## Screen: Sales

**Route:** `/sales` · **Access:** ADMIN, SALESPERSON · **Portal:** `synkro-sales-portal` (React)

**Structure:**
- "New sale" section: customer selector, product lines (product + quantity + calculated subtotal + remove-line button), "+ Add line" button
- Highlighted "Estimated total", with "Clear" and "Register sale" buttons
- "History" section below: date, customer, lines, total, "View" action (navigates to `/sales/{id}`)

**Behavior:**
- The total is a **client-side estimate** while filling the form — matches what's already documented in `navigation-map.md`, Flow 1: the real total and stock validation happen on the backend at submit
- The customer selector and the product-line picker each call Customers and Products through the host's client while the form is being filled, before any saga call happens (`navigation-map.md`, Flow 1)
- "Register sale" is disabled while a submission is pending (no double-click), and reuses the same `Idempotency-Key` if the submission is retried after a network failure

**States (New sale form):**
- Loading: "Register sale" shows a spinner in place of its label while the saga call is pending or being polled (`status: RUNNING`)
- Error, with retry: an inline alert above the form, **naming the failed step and its message**, for a rejected sale — see "Insufficient-stock rejection," below. The form stays filled; "Register sale" is re-enabled so the person can correct and resubmit
- Empty: not applicable — the form always starts with the customer selector and one empty line
- Data (success): a confirmation toast "Venta registrada" and the new sale appears at the top of the History section below

**States (History section):**
- Loading: skeleton rows
- Error, with retry: banner above the table
- Empty: "No sales registered yet"
- Data: the populated table described above

### Insufficient-stock rejection — exact message shown

When the saga ends in `COMPENSATED` because `reserve-stock` rejected a
line for insufficient stock (`navigation-map.md`, Flow 1), the inline
alert on the New sale form reads:

```
No se pudo completar la venta
Paso fallido: reserva de stock
No hay stock suficiente para uno o más productos de la venta.
Ajusta las cantidades e inténtalo de nuevo.
```

The three parts are deliberate and always shown together: a plain-language
headline, the **failed step** (`reserve-stock`, shown in Spanish as "reserva
de stock" — matching `SagaResponse.failedStep`'s enum value translated for
display, never the raw enum string), and the specific reason. If the
rejection is for a different failed step (`validate-customer`, an inactive
customer), the headline and failed-step line stay the same shape, only the
third line's message changes, taken from the saga's own rejection message
rather than invented per step. This is the real-design equivalent of the
409-style rejection sketch referenced in the earlier draft of this
document — the backend's actual outcome is `COMPENSATED` with a
`failedStep`, not an HTTP `409`, since the registration request itself
succeeded in starting the saga; the rejection is a saga outcome, read from
a later `GET /api/v1/sagas/{id}`, not the `POST`'s own status code.

---

## Screen: Sale detail

**Route:** `/sales/{id}` · **Access:** ADMIN, SALESPERSON · **Portal:** `synkro-sales-portal` (React) · **New screen (new route), no Figma frame yet — the monolith shows this inline in the history table instead**

**Structure:**
- Header with the sale's date and total
- Customer section: name and identity document, resolved by a separate call to Customers (`navigation-map.md`, "read time" resolution — the sale itself holds only `customerId`)
- Lines table: product name (resolved the same way, per line), quantity, unit price, subtotal
- "Back to history" link

**Behavior:**
- A SALESPERSON opening a sale that is not their own (`createdBy` does not match their `sub`) never reaches this screen: `GET /api/v1/sales/{id}` answers `403` and the portal redirects to `/sales` with a message, consistent with the access rule already defined for the Sales screen
- Product and customer names are resolved with their own requests, through the host's client, exactly as described in `entities-and-rules.md`, "Resolving external references between services"

**States:**
- Loading: skeleton header, skeleton customer line, skeleton line-item rows
- Error, with retry: full-area message with "Reintentar" in place of the whole screen (a sale detail has no sensible partial-data state to fall back to)
- Empty: not applicable — a `404` from the endpoint is a distinct case, shown as "Venta no encontrada" with a link back to `/sales`
- Data: the populated detail described above

---

## Screen: Users

**Route:** `/users` · **Access:** ADMIN only · **Portal:** `synkro-auth-portal` (React) · **New screen, no Figma frame yet. No list endpoint exists — see the note below**

**Structure:**
- "Register user" form: name, email, password, role (ADMIN / SALESPERSON / INVENTORY)
- Separate "Find user" section: an ID field and a "Look up" button, showing that one user's name, email, role and active status when found

**Behavior:**
- This screen is **not** a browsable table of every user, unlike every other list screen in this map — `synkro-auth-api.yaml` has no "list users" endpoint, only `POST /api/v1/auth/register` (create) and `GET /api/v1/auth/users/{id}` (look up one by ID). The design here works within that limit rather than assuming a list that does not exist
- Registering a user requires `Idempotency-Key`; a repeated email answers a business-rule rejection shown inline on the email field
- The `SERVICE` role is never offered in the role selector — it exists only inside service tokens, never assigned to a person (ADR-006)

**States (Register user form):**
- Loading: "Register" shows a spinner in place of its label while pending
- Error, with retry: inline field errors (e.g. duplicate email); a network failure shows a banner with "Reintentar" that resubmits with the same `Idempotency-Key`
- Empty: not applicable — this is a form, not a list
- Data (success): confirmation message with the new user's name and role; the form clears

**States (Find user section):**
- Loading: the result area shows a skeleton line while the lookup is pending
- Error, with retry: "No se pudo buscar el usuario" with "Reintentar"
- Empty: "Usuario no encontrado" when the ID does not exist (`404`)
- Data: the found user's details, as described above

**Open gap:** if the team wants a real, browsable user-management table,
that needs a new endpoint the current contract does not have. Recorded for
`15-project-control/open-questions.md` (HU-DOCS-88); not added to the
contract in this document.

---

### Users screen — ADR-014 behavior

The Register user form is ADMIN-only and sends credentials through the host's
shared client. No public sign-up form or initial-administrator screen is added.
Keep the same Idempotency-Key when retrying a network failure. A 401 follows the
host's session-expiry flow; a 403 shows access denied and disables automatic retry.
The success view requires no audit inputs: the server records attribution from
the trusted caller. Do not display or retain the password after submission.
The first administrator is created through the operational runbook, not this form.

## Screen: Service tokens

**Route:** `/service-tokens` · **Access:** ADMIN only · **Portal:** `synkro-auth-portal` (React) · **New screen, no Figma frame yet. No list endpoint exists — see the note below**

**Structure:**
- "Issue service token" form: service (`synkro-workflow` / `synkro-worker`), with a visible, read-only note of which fixed permissions that service receives (ADR-006) — the permissions are never an editable field
- A one-time reveal panel: shown only immediately after issuing, with the signed token and a "Copy" button, and an explicit warning that it will not be shown again
- Separate "Find token" section: an ID (`jti`) field and a "Look up" button, showing that token's service, permissions and dates — **never the token value itself**

**Behavior:**
- Same shape as Users: `POST /api/v1/auth/service-tokens` (issue) and `GET /api/v1/auth/service-tokens/{id}` (metadata only) — no list endpoint exists
- Issuing requires `Idempotency-Key`; a retried issuance with the same key returns the existing token's **metadata**, never the token again — the UI must make clear that a retried issuance will not re-reveal the secret

**States (Issue token form):**
- Loading: "Issue" shows a spinner in place of its label while pending
- Error, with retry: banner with "Reintentar"; no field-level errors expected since the service picker is a closed set
- Empty: not applicable — this is a form, not a list
- Data (success): the one-time reveal panel described above, replacing the form until dismissed

**States (Find token section):**
- Loading: skeleton line in the result area
- Error, with retry: "No se pudo buscar el token" with "Reintentar"
- Empty: "Token no encontrado" when the ID does not exist (`404`)
- Data: the found token's metadata, as described above — never the signed value

**Open gap:** same as Users — a browsable list of every issued service
token would need a new endpoint. Recorded for
`15-project-control/open-questions.md` (HU-DOCS-88); not added to the
contract in this document.

---

## Correlations

- Route map, roles, flows, and endpoints per screen → `12-ux-ui/navigation-map.md`
- Final color tokens and components (Crimson Circuit) → `12-ux-ui/design-system.md`
- Business rules behind these screens (soft delete, stock validation) → `02-domain/entities-and-rules.md`
- Sale registration saga and its outcomes → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`
- Sales domain on MongoDB → `05-architecture/decisions/records/ADR-010-sales-on-mongodb.md`
- Angular Customers portal → `05-architecture/decisions/records/ADR-011-angular-customers-portal.md`
- Frontend screen-state rules (loading, error, empty, data as a cross-cutting pattern) → `_stacks/frontend.md`
- Real implementation → `synkro-tech` repo, `src/features/`

