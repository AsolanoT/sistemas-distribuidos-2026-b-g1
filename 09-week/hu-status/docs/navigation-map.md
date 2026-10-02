# Navigation Map

> Defines the screen structure of the system, how screens connect to each other, and what routes
> exist. It is the reference when frontend and backend discuss what endpoints exist
> or how to reach a feature.

---

## Scope note

This map documents the navigation design for the **target system**: the 4
microservices defined in ADR-001, with real JWT (RS256) authentication
validated locally by each service. It is not scoped down to match any single
MVP delivery.

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
/login                          → Credentials → auth service issues a JWT (RS256)

/dashboard                      → Landing screen, content scoped by role (ADMIN, SALESPERSON, INVENTORY)
/customers                      → Customer list + create/edit (role: ADMIN, SALESPERSON)
/products                       → Product & category catalogue, stock edit (role: ADMIN, INVENTORY)
/stock                          → Read-only stock lookup (role: SALESPERSON only)
/sales                          → Register a sale, sale history, sale detail (role: ADMIN, SALESPERSON)
```

There is no `/admin` or `/profile` route in this design — it stays flat on
purpose because each role only ever sees 2-4 modules, so a nested admin
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

## Screen map

| Screen | Route | Component | Minimum role | Target microservice (ADR-001) | MVP status (Corte 1, `synkro-tech`) |
|--------|-------|-----------|--------------|-------------------------------|---------------------------------------|
| Login | `/login` | `LoginScreen` | Public | auth | Not implemented as designed — see MVP note above |
| Dashboard | `/dashboard` | `DashboardPage` | ADMIN, SALESPERSON, INVENTORY | — (cross-service aggregation, role-scoped) | Implemented for ADMIN only, as `/summary`. Not implemented for SALESPERSON/INVENTORY |
| Customers | `/customers` | `CustomersPage` | ADMIN, SALESPERSON | customers | Implemented on the monolith |
| Products | `/products` | `ProductsPage` | ADMIN, INVENTORY | products | Implemented on the monolith |
| Stock lookup | `/stock` | `StockLookupPage` | SALESPERSON | products | Implemented on the monolith (read-only) |
| Sales | `/sales` | `SalesPage` | ADMIN, SALESPERSON | sales | Implemented on the monolith |

**Access matrix**

| Screen | ADMIN | SALESPERSON | INVENTORY |
|--------|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ❌ |
| Products | ✅ | ❌ | ✅ |
| Stock lookup | ❌ | ✅ | ❌ |
| Sales | ✅ | ✅ | ❌ |

The Stock lookup / Products split is intentional: a salesperson can check
what is available to sell without being able to edit the catalogue, and an
inventory user manages stock directly inside Products, so they never need the
read-only lookup screen.

---

## Main user flows

### Flow 1 — Register a sale

\```
Sales (/sales)
    │
    ▼ Click "Nueva venta"
New sale form
    │  Pick customer + add product lines (product, quantity)
    │  The total shown is a client-side preview (no prices from the backend yet)
    │
    ▼ Submit (POST /api/v1/sagas/register-sale via the gateway)
synkro-workflow starts the register-sale saga (ADR-007):
    │  1. validate-customer → synkro-customers-api
    │  2. reserve-stock → synkro-products-api (freezes prices, decreases stock)
    │  3. register-sale → synkro-sales-api (persists sale with frozen prices)
    │
    ├── All steps succeed (COMPLETED) ──► Sale confirmed, toast "Venta registrada"
    │                                      Sale appears in history with its authoritative total
    │                                      (computed from frozen prices, not from the preview)
    │
    ├── A step fails (COMPENSATED) ────► Reserved stock released automatically
    │                                      Inline alert with the failed step's message
    │                                      (inactive customer, insufficient stock, etc.)
    │                                      Form stays filled for correction
    │
    └── Compensation fails (FAILED) ───► The saga ends in FAILED for a person to decide
                                          Visible in GET /api/v1/sagas/{id} and workflow logs
\```

**Notes:** the frontend sends only customerId and lines (productId + quantity) — never prices. The saga resolves each product's current price during step 2 (reserve-stock) and freezes it in the reservation. The authoritative total is computed by `synkro-sales-api` from the frozen prices, not from any client-side calculation. An `Idempotency-Key` header prevents duplicate submissions (ADR-005 Decision 4).

**Related HUs:** HU-ARQ-07 (Corte 1 monolith backend), HU-FE-02 (Corte 1 monolith frontend). The saga flow above is what `HU-VEN-NN` will implement once the code phase begins on `synkro-workflow` and `synkro-sales-api`. 

### Flow 2 — Authentication

```
Login (/login)
    │
    ▼ Enter credentials, submit
Auth service validates credentials
    │
    ├── Valid ──► Issues a JWT (RS256), frontend stores it and attaches it
    │             to every subsequent request; user lands on their default
    │             module (see table above)
    │
    └── Invalid ► Inline error on the login form, credentials cleared,
                  no redirect
    │
    ▼ On every later request
Every service that receives requests validates the JWT locally with the shared public key (ADR-006) — no call back to synkro-auth-api per request. The gateway checks that a credential is present but does not validate it.
    │
    ├── Valid, not expired ──► Request proceeds
    │
    └── Expired / invalid ───► 401 → frontend clears the session and
                                returns to /login
```

This is the target design and what `HU-AUTH-NN` will build: the auth
microservice, RS256 key handling, and the services' local validation.

**MVP note:** `synkro-tech` does not implement this flow. It simulates a
session by letting the user pick a name from a list, with no password and no
token — a Corte 1 scope reduction, separate from the design above, and it
should not be read as a preview of how login will actually work.

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
    └── Needs to check sales activity ──► /sales → history, sale detail
```

**Notes:** ADMIN is the only role with full read/write reach across all 4
modules. There is no dedicated "reports" screen yet (FR-008/FR-009 pending
scope) — the dashboard's snapshot is the closest thing today.

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
    ├── Alert shows low stock ──► /products → adjust stock for that item
    │
    ├── New product line arrives ──► /products → register product,
    │                                assign category (create category if needed)
    │
    └── Product discontinued ──► /products → deactivate (soft delete)
```

**Notes:** unlike SALESPERSON, INVENTORY's dashboard alerts are meant to drive action directly on `/products` — there is no separate read-only screen for this role, since editing the catalogue is exactly their job. The alerts are opened and resolved by `synkro-worker`, which runs a scheduled low-stock check every 15 minutes (configurable via `LOW_STOCK_EVERY`). A product has at most one OPEN alert at a time (partial unique index in `products_schema`). When INVENTORY restocks the product above the threshold, the worker resolves the alert on its next run (ADR-007 Decision 6).

---

## Navigation rules

| Rule | Description |
|------|--------------|
| Authentication | Any route redirects to `/login` if there is no valid JWT or it has expired |
| Authorization | `RequireModule` checks `canAccess(role, path)`; if the role cannot see that path, it redirects to that role's own default module (see table above) — there is no separate "403 screen" today |
| Unmatched route | Redirects to the user's default module (`path="*"` in `App.jsx`) rather than a 404 page |
| Confirmation | Destructive actions (deactivate product/customer) show a confirmation dialog before executing |

---

## Correlations

- Design system (visual components, tokens) → `12-ux-ui/design-system.md`
- Wireframes → `12-ux-ui/wireframes.md`
- Domain entities behind these screens → `02-domain/entities-and-rules.md`
- Roles and permissions source of truth → `00-governance/security-policy.md` and `src/features/auth/roles.js` in `synkro-tech`
- Sale registration saga and stock alerts → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`
- Token validation per service → ADR-006
