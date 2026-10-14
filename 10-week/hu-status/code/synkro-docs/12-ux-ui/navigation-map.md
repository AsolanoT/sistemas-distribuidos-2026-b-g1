# Navigation Map

> Defines the screen structure of the system, how screens connect to each other, and what routes
> exist. It is the reference when frontend and backend discuss what endpoints exist
> or how to reach a feature.

---

## Scope note

This map documents the navigation design for the **target system**: the 4
microservices defined in ADR-001, with real JWT (RS256) authentication
validated locally by each service, a React host with three React portals
and one Angular portal (ADR-011), and Sales on MongoDB (ADR-010). It is
not scoped down to match any single MVP delivery.

The `synkro-tech` repository (Corte 1) is a **separate, temporary artifact**:
a monolithic build with a reduced scope that does not yet reach real
login/JWT — it stands a user in via a simple picker instead. Where a screen
or flow below is already implemented in that MVP, a short note says so; where
it says nothing, assume it is designed here but not built yet (e.g.,
reporting screens — FR-008/FR-009: daily/monthly sales, top
products — have no implementation in any repo yet). The "Target microservice"
column in the screen map shows where each module's backend belongs once
ADR-001's split is realized.

---

## Frontend route structure

```
/login                          → Auth portal credential screen; host owns routing/loading/session. Auth issues RS256 tokens; development sign-in is temporary (ADR-008 Decision 4).
/dashboard                      → Landing screen, content scoped by role (ADMIN, SALESPERSON, INVENTORY). Host-owned
/customers                      → Customer list + create/edit (role: ADMIN, SALESPERSON)
/products                       → Product & category catalogue, stock edit (role: ADMIN, INVENTORY)
/stock                          → Read-only stock lookup (role: SALESPERSON only)
/stock-alerts                   → Low-stock alert list, resolved by the worker (role: ADMIN, INVENTORY)
/sales                          → Sale history (role: ADMIN, SALESPERSON)
/sales/{id}                     → Sale detail (role: ADMIN, SALESPERSON)
/users                          → Register a user, look up one by ID — no list (role: ADMIN only)
/service-tokens                 → Issue a service token, look up one by ID — no list (role: ADMIN only)
```

There is no `/admin` or `/profile` route in this design — it stays flat on
purpose because each role only ever sees 2-5 modules, so a nested admin
section would add a click without adding clarity. `/dashboard` is shared by
all three roles rather than being an ADMIN-only screen, so each role gets a
landing point instead of only two of them arriving straight into a work list.

**What each role sees on `/dashboard`:**

| Role | Dashboard content |
|------|--------------------|
| ADMIN | Full business snapshot: totals across customers, products, and sales — same content as today's Summary |
| SALESPERSON | Their own sales today/this month, recently attended customers — this is what covers the "reportes propios" (own reports) already named for this role |
| INVENTORY | Low-stock and out-of-stock alerts, recently modified products |

This also gives FR-008/FR-009 (daily/monthly sales report, top-selling
products) a natural home: their widgets belong inside the relevant
dashboard(s) rather than floating as an unowned, disconnected screen — the
full report views are still pending scope, only the entry point is placed
here.

*MVP note:* `synkro-tech` does not have a `/login` route today — it renders a
user picker conditionally instead of a real page, and there is no password or
token yet. That is a Corte 1 simplification, not the target design above.
Likewise, this shared `/dashboard` does not exist in the Corte 1 MVP: it only
has `/summary` for ADMIN, and SALESPERSON/INVENTORY still land directly on
`/customers` and `/products` respectively (see the MVP table below).

**Default landing route per role — target design:** all three roles land on
`/dashboard`; the content shown there is what differs (see table above).

**Default landing route per role — current MVP behavior**
(`defaultPathFor()` in `synkro-tech`'s `roles.js`, first module the role is
allowed to see):

| Role | Default route today (MVP) |
|------|---------------------------|
| ADMIN | `/summary` |
| SALESPERSON | `/customers` |
| INVENTORY | `/products` |

---

## Route ownership

| Owner | What it owns | Why |
|---|---|---|
| **Host** (`synkro-front`) | Public `/login` route (a URL, not a Git branch or an environment selector) and Auth remote loading; `/dashboard` route/layout; session, guards, shared HTTP client, navigation, route-not-found and remote isolation | Shared platform behavior; the production credential screen belongs to Auth. Development sign-in remains temporary. |
| **`synkro-customers-portal`** (Angular, ADR-011) | `/customers` | Mounted inside the host as a custom element; see `_stacks/frontend.md` |
| **`synkro-products-portal`** (React) | `/products` (catalogue and categories), `/stock` (read-only lookup), `/stock-alerts` | All three read or write `synkro-products-api`; categories are a section inside `/products`, not a separate route — the contract's `/products/categories` endpoints are called from the same screen |
| **`synkro-sales-portal`** (React) | `/sales` (history **and** the new-sale form — no separate route for registration), `/sales/{id}` | Both read `synkro-sales-api`; the new-sale form embedded in `/sales` also reads Customers and Products through the host's client (see Flow 1) |
| **`synkro-auth-portal`** (React) | Production `/login` screen, `/users`, `/service-tokens` | Owns Auth UI, using the host's authentication operation and shared client. Until it exists, development identity remains provisional (ADR-008 Decision 4). |

The temporary development-sign-in restriction concerns the Local/Development deployment environment; Git promotion rules are separate. See [Flow 2](#flow-2--authentication) for that distinction. The production login screen still belongs to the Auth portal.

### Dashboard ownership

**The host owns the `/dashboard` route and its layout; each portal exposes the widgets of its own domain**, which the host arranges according to the signed-in role. A widget is a small, self-contained component a portal exports — it fetches its own data through the same `apiClient`/`ShellContract` the rest of that portal uses, exactly like a full page would. The host never calls a domain endpoint directly for dashboard content: it only decides which widgets appear, in what order, for which role.

**Option discarded: a dashboard owned by one portal** (for example, bundling it inside `synkro-products-portal` since INVENTORY's view is stock-heavy). Rejected because the dashboard is the one screen every role lands on first, and no single domain's portal is the natural owner of a cross-domain snapshot — putting it inside one portal would mean that portal's failure takes down every role's landing page, and would quietly couple dashboard layout changes to that one portal's release cycle instead of the host's.

---

## Screen map

| Screen | Route | Component | Portal | Framework | Minimum role | Target microservice (ADR-001, ADR-010) | MVP status (Corte 1, `synkro-tech`) |
|--------|-------|-----------|--------|-----------|--------------|-------------------------------|---------------------------------------|
| Login | `/login` | `LoginScreen` | `synkro-auth-portal` (host routes/loads) | React | Public | auth | Not implemented as designed — see MVP note above |
| Dashboard | `/dashboard` | `DashboardPage` | Host (composes portal widgets) | React | ADMIN, SALESPERSON, INVENTORY | — (cross-service aggregation, role-scoped) | Implemented for ADMIN only, as `/summary`. Not implemented for SALESPERSON/INVENTORY |
| Customers | `/customers` | `CustomersPage` | `synkro-customers-portal` | **Angular** | ADMIN, SALESPERSON | customers | Implemented on the monolith |
| Products | `/products` | `ProductsPage` | `synkro-products-portal` | React | ADMIN, INVENTORY | products | Implemented on the monolith |
| Stock lookup | `/stock` | `StockLookupPage` | `synkro-products-portal` | React | SALESPERSON | products | Implemented on the monolith (read-only) |
| Stock alerts | `/stock-alerts` | `StockAlertsPage` | `synkro-products-portal` | React | ADMIN, INVENTORY | products | Not implemented — new screen, see below. Opened and resolved only by `synkro-worker`, the component ADR-007 Decision 6 names as the owner of the scheduled low-stock job — never by a person on this screen |
| Sales (new-sale form + history) | `/sales` | `SalesPage` | `synkro-sales-portal` | React | ADMIN, SALESPERSON | sales | Implemented on the monolith |
| Sale detail | `/sales/{id}` | `SaleDetailPage` | `synkro-sales-portal` | React | ADMIN, SALESPERSON | sales | Not implemented as a separate route — the monolith shows this inline in the history table |
| Users | `/users` | `UsersPage` | `synkro-auth-portal` | React | ADMIN | auth | Not implemented — new screen, see below |
| Service tokens | `/service-tokens` | `ServiceTokensPage` | `synkro-auth-portal` | React | ADMIN | auth | Not implemented — new screen, see below |

**New in this revision:** Stock alerts, Sale detail (as its own route), Users and Service tokens. The first three are fully supported by their contracts (see "Endpoints per screen" below). Users and Service tokens are supported only **partially** — see the note right after that table.

**Sale registration has no route of its own, by design.** It is a form embedded in `/sales`, alongside the history table — documented in Flow 1 below and in `wireframes.md`'s Sales screen. Splitting `/sales/{id}` into its own route in this revision did not remove registration from the map; it was never a separate route to begin with.

**Access matrix**

| Screen | ADMIN | SALESPERSON | INVENTORY |
|--------|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ❌ |
| Products | ✅ | ❌ | ✅ |
| Stock lookup | ❌ | ✅ | ❌ |
| Stock alerts | ✅ | ❌ | ✅ |
| Sales | ✅ | ✅ | ❌ |
| Sale detail | ✅ | ✅ | ❌ |
| Users | ✅ | ❌ | ❌ |
| Service tokens | ✅ | ❌ | ❌ |

The Stock lookup / Products split is intentional: a salesperson can check
what is available to sell without being able to edit the catalogue, and an
inventory user manages stock directly inside Products, so they never need the
read-only lookup screen.

---

## Endpoints per screen

Every endpoint below is taken directly from its service's OpenAPI contract.
Where this map names a general CRUD operation (customer update, for
example) without a confirmed exact path, that is noted instead of guessed.

| Screen | Endpoint(s) | Contract |
|---|---|---|
| Login | `POST /api/v1/auth/login` | `synkro-auth-api.yaml` |
| Dashboard | No endpoint of its own — each widget calls its own portal's endpoints (below) | — |
| Customers | `GET /api/v1/customers` (list, and lookup by `identityDocument`); create/update/deactivate exist per the contract's description (ADR-001 §8) but their exact paths were not independently confirmed for this map — see `synkro-customers-api.yaml`, "Customers" tag | `synkro-customers-api.yaml` |
| Products | `GET /api/v1/products` (list), `POST /api/v1/products` (create), `POST /api/v1/products/{id}/stock-adjustments` (adjust stock); update/deactivate exist per the contract but were not independently confirmed here — see "Products" tag | `synkro-products-api.yaml` |
| Products — Categories section | `GET /api/v1/products/categories` (list), `POST /api/v1/products/categories` (create) | `synkro-products-api.yaml` |
| Stock lookup | `GET /api/v1/products` (same list endpoint as Products, read-only) | `synkro-products-api.yaml` |
| Stock alerts | `GET /api/v1/stock-alerts` (list, filter `status`); `POST /api/v1/stock-alerts` and `POST /api/v1/stock-alerts/{id}/resolve` are worker-only (service token) — `synkro-worker` is the component ADR-007 Decision 6 names as the owner of these calls, never a person on this screen | `synkro-products-api.yaml` |
| Sales (new sale) | `POST /api/v1/sagas/register-sale`, `GET /api/v1/sagas/{id}` (poll while `RUNNING`) | `synkro-workflow.yaml` |
| Sales (history) | `GET /api/v1/sales` | `synkro-sales-api.yaml` |
| Sale detail | `GET /api/v1/sales/{id}` | `synkro-sales-api.yaml` |
| Users | `POST /api/v1/auth/register` (create), `GET /api/v1/auth/users/{id}` (lookup one) | `synkro-auth-api.yaml` |
| Service tokens | `POST /api/v1/auth/service-tokens` (issue), `GET /api/v1/auth/service-tokens/{id}` (lookup one) | `synkro-auth-api.yaml` |

**Known gap, not fixed in this document:** the Users and Service tokens
screens above have no list endpoint — only creation and lookup by a known
ID. A browsable table of all users or all service tokens is **not**
supported by the current contracts. These two screens are therefore
designed here as minimal (a creation form plus a lookup-by-ID field), not
as the kind of table every other screen in this map has. Whether a list
endpoint should be added is recorded as an open question for
`15-project-control/open-questions.md` (HU-DOCS-88) — it is not added to
either contract in this document, per this HU's own rule that a missing
endpoint is a question to record, not a contract to write here.

---

## Main user flows

### Flow 1 — Register a sale

```
Sales (/sales)
    │
    ▼ Click "Nueva venta"
New sale form
    │  Pick customer: GET /api/v1/customers?identityDocument=... through the host's client
    │  Add product lines: GET /api/v1/products through the host's client, for the picker
    │  (both calls are plain reads — not saga steps; the saga only starts on submit)
    │  The total shown is a client-side preview (no prices from the backend yet)
    │
    ▼ Submit (POST /api/v1/sagas/register-sale via the gateway)
synkro-workflow starts the register-sale saga (ADR-007 Decision 2):
    │  1. validate-customer → synkro-customers-api
    │  2. reserve-stock → synkro-products-api (freezes prices, decreases stock)
    │  3. register-sale → synkro-sales-api (persists the sale with frozen prices, ADR-010)
    │
    ├── Steps not finished at the request timeout (RUNNING) ──► Portal shows "Procesando venta…"
    │                                      and reads GET /api/v1/sagas/{id} until the saga
    │                                      ends in one of the three outcomes below
    │
    ├── All steps succeed (COMPLETED) ──► Sale confirmed, toast "Venta registrada"
    │                                      Sale appears in history with its authoritative total
    │                                      (computed from frozen prices, not from the preview)
    │
    ├── A step fails (COMPENSATED) ────► Reserved stock released automatically
    │                                      Inline alert naming the failed step and its message
    │                                      (inactive customer, insufficient stock, etc.)
    │                                      Form stays filled for correction
    │
    └── Compensation fails (FAILED) ───► The saga ends in FAILED for a person to decide
                                          Visible in GET /api/v1/sagas/{id} and workflow logs
```

**Notes:** the sales portal is the one making both kinds of calls here — plain reads to Customers and Products while the salesperson fills the form, and the saga call on submit — but it reads Customers and Products the same way every portal reads another domain's data: through the host's client, never with its own. The frontend sends only `customerId` and `lines` (`productId` + `quantity`) in the saga request — never prices. The saga resolves each product's current price during step 2 (reserve-stock) and freezes it in the reservation. The authoritative total is computed by `synkro-sales-api` from the frozen prices, not from any client-side calculation. An `Idempotency-Key` header prevents duplicate submissions: the same key returns the same saga and runs no step again (ADR-007 Decision 2, ADR-010 Decision 3).

**Related HUs:** HU-ARQ-07 (Corte 1 monolith backend), HU-FE-02 (Corte 1 monolith frontend). The saga flow above is what `HU-VEN-NN` will implement once the code phase begins on `synkro-workflow` and `synkro-sales-api`.

### Flow 2 — Authentication

1. The host mounts the Auth portal's public `/login` screen; the portal collects credentials.
2. The host-owned authentication operation uses the shared client to call public login and consumes the token pair on success. Navigate to the requested authorized local route or `/dashboard`.
3. Login `401` shows a generic credential error, clears the password and creates no session; it triggers neither refresh nor automatic retry.
4. The host schedules renewal and checks session readiness before protected requests and on tab reactivation; all triggers share one in-flight refresh.
5. Each receiving service validates the JWT locally; the gateway checks credential presence on protected routes (ADR-006).
6. Refresh rejection or a protected-operation `401` ends the session without refresh-and-replay. A `403` shows access denied without ending the session.
7. Network/service failures show unavailability. Refresh response loss is not blindly retried because rotation may already have committed.

Timing, storage and concurrency rules are defined once in [Browser session](../07-api/authentication.md#browser-session).

This is the target design and what `HU-AUTH-NN` will build: the auth microservice, RS256 key handling, and the services' local validation. Until then, `/login` is the host's development sign-in — available only when running the Local/Development deployment environment, not a rule about which git branch the code is on (`10-devops/environments.md`, ADR-008 Decision 4) — not this flow.

**MVP note:** `synkro-tech` does not implement this flow. It simulates a session by letting the user pick a name from a list, with no password and no token — a Corte 1 scope reduction, separate from the design above, and it should not be read as a preview of how login will actually work.

**Related HUs:** to be opened under `HU-AUTH-NN` once that prefix starts.

### Flow 3 — A typical ADMIN session

```
Login (/login)
    │
    ▼ Lands on /dashboard
Business snapshot: totals across customers, products, and sales
    │
    ├── Needs to check a customer's status ──► /customers → search/edit
    │
    ├── Needs to check or adjust the catalogue ──► /products → edit/deactivate
    │
    ├── Needs to check sales activity ──► /sales → history → /sales/{id} for detail
    │
    └── Needs to manage identity ──► /users (create/look up) or /service-tokens (issue/look up)
```

**Notes:** ADMIN is the only role with full read/write reach across all
modules, including Users and Service tokens. There is no dedicated "reports"
screen yet (FR-008/FR-009 pending scope) — the dashboard's snapshot is the
closest thing today.

### Flow 4 — A typical SALESPERSON session

```
Login (/login)
    │
    ▼ Lands on /dashboard
Own sales today/this month, recently attended customers
    │
    ├── A customer arrives ──► /customers → search by identity_document,
    │                          or register a new one if not found
    │
    ├── Needs to confirm an item is available ──► /stock → read-only lookup
    │                                              (cannot edit the catalogue)
    │
    └── Ready to sell ──► /sales → new sale (see Flow 1 above)
```

**Notes:** this is the role with the most linear, repetitive daily journey —
customer → stock check → sale — which is why `/stock` exists as a
lightweight, read-only detour instead of sending them into the full
`/products` screen they have no access to.

### Flow 5 — A typical INVENTORY session

```
Login (/login)
    │
    ▼ Lands on /dashboard
Low-stock alerts (produced by synkro-worker's scheduled job, ADR-007
Decision 6), recently modified products
    │
    ├── Alert shows low stock ──► /stock-alerts → see the full list, or
    │                             /products → adjust stock for that item directly
    │
    ├── New product line arrives ──► /products → register product,
    │                                assign category (create category if needed)
    │
    └── Product discontinued ──► /products → deactivate (soft delete)
```

**Notes:** unlike SALESPERSON, INVENTORY's dashboard alerts are meant to
drive action directly on `/products` — `/stock-alerts` exists for the case
where they want to see every open alert at once, filtered by status, rather
than reacting to the dashboard's own shortlist one at a time. The alerts are
opened and resolved by `synkro-worker`, which runs a scheduled low-stock
check every 15 minutes (configurable via `LOW_STOCK_EVERY`). A product has
at most one OPEN alert at a time (partial unique index in
`products_schema`). When INVENTORY restocks the product above the
threshold, the worker resolves the alert on its next run (ADR-007 Decision
6).

---

## User registration authorization (ADR-014)

The existing ADMIN-only /users route is the ordinary user-creation entry point.
There is no public sign-up route or first-administrator screen. The host's shared
HTTP client attaches the ADMIN token; the server remains the authorization authority.
Keep one Idempotency-Key per intent and reuse it on network retry. A 401 ends the
session; a 403 shows access denied without automatic retry or role switching.
Initial administrator creation is an operator procedure outside browser navigation.
The register form offers ADMIN, SALESPERSON and INVENTORY only; no audit field or
operator identity is requested from the browser.

## Navigation rules

| Rule | Description |
|------|--------------|
| Authentication | Protected routes use the host's session gate; missing/failed session restoration redirects to `/login`. `/login` remains public; expiration first follows the proactive renewal policy. |
| Authorization | `RequireModule` checks `canAccess(role, path)`; if the role cannot see that path, it redirects to that role's own default module (see table above) — there is no separate "403 screen" today |
| Unmatched route | Redirects to the user's default module (`path="*"` in `App.jsx`) rather than a 404 page |
| Confirmation | Destructive actions (deactivate product/customer) show a confirmation dialog before executing |

---

## Correlations

- Design system (visual components, tokens) → `12-ux-ui/design-system.md`
- Wireframes, including the four states per screen → `12-ux-ui/wireframes.md`
- Domain entities behind these screens → `02-domain/entities-and-rules.md`
- Roles and permissions source of truth → `00-governance/security-policy.md` and `src/features/auth/roles.js` in `synkro-tech`
- Sale registration saga → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`, Decisions 1 and 2; low-stock alerts → same record, Decision 6
- Sales domain on MongoDB → `05-architecture/decisions/records/ADR-010-sales-on-mongodb.md`
- Angular Customers portal, host/portal contract → `05-architecture/decisions/records/ADR-011-angular-customers-portal.md`, `_stacks/frontend.md`
- Token validation per service → ADR-006
- Missing list endpoints for Users and Service tokens → `15-project-control/open-questions.md` (HU-DOCS-88)
