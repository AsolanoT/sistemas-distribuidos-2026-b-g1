# Navigation Map

> Defines the screen structure of the system, how screens connect to each other, and what routes
> exist. It is the reference when frontend and backend discuss what endpoints exist
> or how to reach a feature.

---

## Scope note

This map reconciles the **delivered distributed system** at the frozen owner revisions listed in the [release record](../10-devops/releases/2.0.0.md). The React Host owns routing/session/transport; three React remotes and Angular Customers custom element own screens. Implemented API, implemented screen, author runtime evidence and complete platform acceptance are separate labels.

`synkro-tech` and the UI PDF/Figma draft describe the historical Corte 1 monolith. They are not current JWT, route, port or service evidence. Reports are implemented Sales endpoints, while reporting/dashboard business UI is unfinished. Auth login is delivered; Users/Service tokens still render a placeholder, despite supporting create/known-ID APIs. No absent UI establishes a PO scope decision.

---

## Frontend route structure

```text
/ -> /dashboard                   Host redirect; session gate applies
/login                           Auth Login through Host authentication capability
/dashboard                       Host signed-in placeholder, no business widgets
/customers                       Angular list (ADMIN, SALESPERSON)
/customers/new                   Angular create
/customers/:id                   Angular detail
/customers/:id/edit              Angular replacement edit
/products                        React catalog/categories/stock adjustment (ADMIN, INVENTORY)
/stock                           React read-only stock (SALESPERSON)
/stock-alerts                    React read-only alert view (ADMIN, INVENTORY)
/sales                           React history plus registration panel (ADMIN, SALESPERSON)
/sales/:id                       React composed detail
/users, /service-tokens          Auth App placeholder (ADMIN), not administration forms
unknown Host path                Host NotFound; nested remote behavior is owner-specific
```

Customers unmatched child routes show its own not-found view. Products accepts its exact three paths (optional trailing slash); Sales accepts history or one detail segment and returns no screen for unmatched nested paths. Host route-prefix ownership does not invent a remote page. All roles land on `/dashboard`; an authorized local requested route can be restored after login. Access denial redirects to dashboard before mounting the unauthorized remote.

---

## Route ownership

| Owner | Routes | Responsibility |
|---|---|---|
| Host | /, /login routing, /dashboard, unknown Host paths and portal prefixes | BrowserRouter, navigation/guards, session/HTTP, lazy asset loading and failure boundary |
| Auth portal | Login component; App mounted at /users and /service-tokens | Login form uses shell/authentication; App remains “Esta función aún no está disponible.” |
| Customers portal | Four routes under /customers | Angular Router/custom element with exact ShellContract v1; Host navigation, no second transport/token store |
| Products portal | /products, /stock, /stock-alerts | Catalog/category dialogs, manual delta adjustments, lookup and read-only alert list |
| Sales portal | /sales, /sales/:id | History, one registration intent, bounded saga observation and detail metadata composition |

Source: [Host App](https://github.com/code-corhuila/synkro-front/blob/c43d024790cfc6345ddd266c04e6967a8d035702/src/app/App.tsx), [registry](https://github.com/code-corhuila/synkro-front/blob/c43d024790cfc6345ddd266c04e6967a8d035702/src/remotes/registry.ts), [Customers routes](https://github.com/code-corhuila/synkro-customers-portal/blob/4208839dad3ccfb8eeb4feff12352c8e4cd73695/src/app/customers/customers.routes.ts), [Products routes](https://github.com/code-corhuila/synkro-products-portal/blob/b407475b363b9ac7fcbe3512852ba4146a96dadf/src/routes.tsx), [Sales routes](https://github.com/code-corhuila/synkro-sales-portal/blob/179dcf5a3bdd2b5fa09d4602cacf61c3a41e761e/src/routes.tsx).

### Dashboard ownership

The Host owns the route and currently renders a heading plus signed-in subject. Domain widgets, own-sales totals and low-stock dashboard summaries are **not delivered UI**. The earlier portal-widget composition is a design direction, not executed behavior. Report APIs do not make that dashboard complete, and the Worker placeholder cannot produce automated alerts. Preserve required reporting scope; schedule its implementation through the team's backlog, without inventing a new aggregate/context or treating an unfinished screen as a PO exclusion.

---

## Screen map

| Screen | Route | Component | Portal | Framework | Minimum role | Target microservice (ADR-001, ADR-010) | Delivery status — Week 12 |
|--------|-------|-----------|--------|-----------|--------------|--------------------------------------|--------------------------|
| Login | /login | Login | Auth, mounted by Host | React | Public | Auth | Delivered; Host owns authentication/session |
| Dashboard | /dashboard | DashboardPlaceholder | Host | React | Signed in | None | Placeholder; business widgets/reporting UI missing |
| Customer list | /customers | CustomersPageComponent list | Customers | Angular | ADMIN, SALESPERSON | Customers | Delivered; real R8 routing evidence |
| Customer create | /customers/new | CustomersPageComponent new | Customers | Angular | ADMIN, SALESPERSON | Customers | Delivered; uncertain retry preserves key/payload |
| Customer detail/edit | /customers/:id; /customers/:id/edit | CustomersPageComponent detail/edit | Customers | Angular | ADMIN, SALESPERSON | Customers | Delivered; inactive/missing resource handling |
| Products/categories | /products | ProductsPage | Products | React | ADMIN, INVENTORY | Products | Delivered; modals inside route, no separate category route |
| Stock lookup | /stock | StockLookupPage | Products | React | SALESPERSON | Products | Delivered, read-only |
| Stock alerts | /stock-alerts | StockAlertsPage | Products | React | ADMIN, INVENTORY | Products | Delivered read-only UI/API; automatic producer/resolver missing |
| Sales history/registration | /sales | SalesPage/NewSalePanel | Sales | React | ADMIN, SALESPERSON | Sales plus Workflow/lookup APIs | Delivered source and bounded author evidence; root/E2E-02 gates remain |
| Sale detail | /sales/:id | SaleDetailPage | Sales | React | ADMIN, SALESPERSON | Sales; optional Customers/Products metadata | Delivered, frozen amounts survive metadata failure |
| Users | /users | Auth App placeholder | Auth | React | ADMIN | Supporting Auth APIs exist | Form/UI not delivered; Q-006 list-all scope unconfirmed |
| Service tokens | /service-tokens | Auth App placeholder | Auth | React | ADMIN | Supporting Auth APIs exist | Form/UI not delivered; no list-all API promised |

**Access matrix**

| Screen | ADMIN | SALESPERSON | INVENTORY |
|--------|:---:|:---:|:---:|
| Dashboard placeholder | Yes | Yes | Yes |
| Customers four routes | Yes | Yes | No |
| Products/categories | Yes | No | Yes |
| Stock lookup | No | Yes | No |
| Stock alerts | Yes | No | Yes |
| Sales/history/detail | Yes | Own sales | No |
| Users/service-token placeholder routes | Yes | No | No |

The [Host access table](https://github.com/code-corhuila/synkro-front/blob/c43d024790cfc6345ddd266c04e6967a8d035702/src/layout/navigation.ts) drives menus and guards; each API still authorizes independently. A visible placeholder/menu entry is not implemented business UI. Sales ownership comes from the server, never a browser filter alone.

---

## Endpoints per screen

| Screen | Endpoint(s) | Contract |
|---|---|---|
| Login/session | POST /api/v1/auth/login, /refresh, /logout through Host capability/client | Auth |
| Customers | GET/POST /api/v1/customers; GET/PUT/DELETE /api/v1/customers/{id}; exact identityDocument filter | Customers |
| Products/categories | GET/POST /api/v1/products; GET/PUT/DELETE /api/v1/products/{id}; GET/POST /api/v1/products/categories; PUT/DELETE /api/v1/products/categories/{id} | Products |
| Manual stock | POST /api/v1/products/{id}/stock-adjustments, delta/reason with one intent key | Products |
| Stock lookup | GET /api/v1/products, read-only | Products |
| Stock alerts | GET /api/v1/stock-alerts with status/page filters; no human create/resolve action | Products |
| New sale | GET Customer/Product selectors, POST /api/v1/sagas/register-sale, GET /api/v1/sagas/{id} | Customers/Products/Workflow |
| History/detail | GET /api/v1/sales and /api/v1/sales/{id}; optional owning metadata GETs | Sales/Customers/Products |
| Reports — no screen | GET /api/v1/sales/reports/daily, /monthly, /top-products | Sales endpoints delivered; reporting UI unfinished |
| Administration — no form | POST /api/v1/auth/register, GET /api/v1/auth/users/{id}; POST /api/v1/auth/service-tokens, GET /api/v1/auth/service-tokens/{id} | Auth supporting APIs only; Q-006 remains |

Exact fields/statuses/security remain canonical in [OpenAPI](../07-api/contracts/openapi/) and [authentication](../07-api/authentication.md); no endpoint is created here. Sales POST is a SERVICE-authorized saga step, never the browser's sale-creation call. Worker alert writes are intended SERVICE calls, not buttons on the alert screen. The three report endpoints do not imply a separate reporting service/store. Users/token list-all endpoints remain unsupported and unconfirmed, not inferred from a bot review or missing UI.

---

## Main user flows

### Flow 1 — Register a sale

1. Authorized ADMIN/SALESPERSON enters `/sales`. History has loading/error/empty/data states; SALESPERSON reads only own sales. Opening NewSalePanel adds no route.
2. Select active Customer and Product identifiers through the shared Host client. Client-side quantity/amount preview is advisory; request contains customerId and productId/quantity lines, never trusted prices/totals. There is no continuously live stock guarantee while editing (Q-003).
3. Before explicit POST, Sales persists original key, canonical fingerprint and original 24-hour deadline, scoped to subject/sessionId. Missing capabilities or storage failure blocks submission. Double submit is prevented; no automatic POST retry occurs.
4. Workflow validates the person, preserves caller/input replay privacy, then uses its SERVICE token for Customer validation, atomic stock reservation/frozen prices and Sale registration. Only validated permitted rejection can justify compensation; ambiguity retains stock under Accepted ADR-015.
5. RUNNING starts bounded observation while this screen is active: waits 1/2/3/5 seconds (then 5), a 120-second observation budget checked before each next GET and at most three consecutive polling failures. Timeout/401/403/404 stops observation into an unresolved/attention path; it does not prove failure or cancel backend work. Known saga retry resumes GET, not another POST.
6. COMPLETED with saleId refreshes history and loads the authoritative Sale; amounts are frozen integer cents. Sale lookup failure does not undo completion or submit a replacement. COMPENSATED explains the rejected step; FAILED requires responsible review. A malformed/uncertain response preserves original identity and blocks a changed intent.
7. Reload restores local intent only, never automatically POSTs/observes. Explicit known-ID GET resumes; otherwise reconstruct the same request and retry the original key before its original deadline. Expiry requires reconciliation, not an assumption of server expiry/new sale permission.
8. Detail navigation keeps the existing history/draft mounted but inactive. Leaving/aborting observation does not cancel/compensate Workflow. Logout/new login clears local ownership; renewal/reload within the same valid Host identity preserves it. Per-tab only; canonical lifecycle is [ADR-016](../05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md).

Detail first loads Sale, then one GET per distinct optional metadata ID with maximum concurrency four. If names fail, retain customerId/productId, quantities, frozen unitPriceCents/subtotals/total and a partial-data notice. Retry only failed metadata, not Sale creation. Abort/stale-generation checks prevent replaced route replies from changing the current view. Detail 403 returns to history with a safe ownership notice; invalid/missing ID shows not-found. [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/179dcf5a3bdd2b5fa09d4602cacf61c3a41e761e/src/sales/pages/useRegisterSale.ts); [detail source](https://github.com/code-corhuila/synkro-sales-portal/blob/179dcf5a3bdd2b5fa09d4602cacf61c3a41e761e/src/sales/pages/useSaleDetail.ts).

Existing author evidence is scoped in the release record; the real-browser RUNNING case E2E-02 remains NOT EXECUTED. Source/unit recovery checks and different successful subsets are not a newly executed full-head browser acceptance.

### Flow 2 — Authentication

1. Host lazily loads Auth Login at public `/login` and supplies its authentication capability. Auth portal collects/validates credentials and never owns tokens.
2. The Host shared transport invokes public Auth login and consumes the returned credential pair. It restores an allowed local requested route or dashboard. Login 401 stays on the form with a generic message/password cleanup and no refresh/retry.
3. Host coordinates the Accepted ADR-016 proactive renewal policy and single-flight refresh before protected requests. Session metadata is token-free for portals, and Angular Customers keeps the exact v1 adapter.
4. Each receiving API/Workflow validates/authorizes the token locally; Gateway presence checking is not signature validation. Public login/refresh do not require a prior person bearer.
5. Protected 401/failed renewal ends the session without automatic refresh/replay. 403 is access denial without logout. Refresh response loss may already have rotated credentials and is not blindly retried. Issued JWT validity/revocation limits follow Accepted ADR-017.

This login exists in Auth/Host source and author evidence; the Corte 1 user picker is historical. A dev-sign-in flag remains guarded tooling and candidate examples set it false; the presence of that code on a promoted branch is not production sign-in authorization. See [Browser session](../07-api/authentication.md#browser-session), [Login source](https://github.com/code-corhuila/synkro-auth-portal/blob/15f7334d33822aaace24ec25fa1a1097a43dbad0/src/Login.tsx) and [Host authority](https://github.com/code-corhuila/synkro-front/blob/c43d024790cfc6345ddd266c04e6967a8d035702/src/shell/session.ts).

### Flow 3 — A typical ADMIN session

Login restores an allowed route or `/dashboard`, whose current content is a placeholder. ADMIN can manage Customer routes, Products/categories/adjustments, read stock alerts and register/read sales. Users/service-token menu routes exist but show unavailable functionality; no delivered form or browsable user/token list is promised. Initial administrator creation is the separate operator CLI, not a browser route. Business reporting/dashboard UI remains unfinished even though Sales report APIs exist.

### Flow 4 — A typical SALESPERSON session

Login → Customer list/create/detail/edit as permitted → `/stock` read-only availability preview → `/sales` registration and own history/detail. Customer creation maintains an intent key for uncertain explicit retry. The preview does not reserve stock; only Workflow's reservation commits availability. A competitor may win stock before submission and a proven reserve rejection is shown without claiming a completed sale. Own-sale authorization stays server-side. Dashboard contains no delivered own-sales widgets.

### Flow 5 — A typical INVENTORY session

Login → dashboard placeholder → `/products` for category/catalog/stock-delta work or `/stock-alerts` for read-only list/filter. Category and product create/edit/deactivate dialogs stay in Products; mutation buttons disable pending work and confirmation cancellation makes no write. Alerts retain raw product IDs if optional names fail. The Products alert API/view exists, but automatic creation/resolution by Worker does not: do not promise that restocking resolves alerts on a next run. INVENTORY cannot mount Customers/Sales/administration routes; direct API authorization still applies.

---

## User registration authorization (ADR-014)

Ordinary registration is ADMIN-only in the Auth API, with its own audited/idempotent contract. The delivered `/users` route still renders Auth's placeholder; no register form, role selector or public sign-up screen is delivered. Future UI must use the Host client, expose only permitted roles and preserve one intent key on explicit retry. InitialAdminCli is an operator-only initialization procedure, not browser administration or administrator recovery (TD-009). Q-006 retains the unconfirmed list-all scope separately from existing create/known-ID endpoints.

## Navigation rules

| Rule | Description |
|------|-------------|
| Authentication | Host RequireAuth restores/checks the session and redirects to login; approved local requested route may be restored |
| Authorization | Host canAccess/RequireRole redirects denial to dashboard before mounting the remote; APIs remain authoritative |
| Unmatched route | Host NotFound for unknown top-level paths; remote-specific child handling as described above |
| Confirmation | Customer/Product deactivation asks confirmation; cancel produces no mutation |
| Navigation/cancellation | Host owns browser history; Customers synchronizes its inner router without writing competing history; stale/aborted reads cannot replace current data |
| Remote outage | Keep Host/other modules usable. Customers explicit module retry can remount; current React module retry has a known reload requirement, so do not promise it always recovers without reload |
| Metadata outage | A valid Sale/alert record survives missing optional names; retain raw IDs and frozen data, with bounded independent retry where implemented |

### Customers routing evidence and R-008

| Required behavior | Implementation/test | Reported real-browser evidence / limit |
|---|---|---|
| Initial /customers with no session, return after login | Host route/guard + Angular list route | R8 loginRestore PASS; exact Host/portal/API/Gateway revisions in [result](https://github.com/code-corhuila/synkro-infra-postgres/blob/8139a43e786f3ab7adf6367065a6165d8d83c15e/docs/evidence/composition-2026-10-22/runs/R8-customers/customers-browser-result.json) |
| /customers/new | Customers new route, explicit navigation | ADMIN and SALESPERSON create through real service; uncertain same-key retry PASS |
| /customers/:id and /customers/:id/edit | Detail/edit modes and replacement handling | R8 detailAndReplacement PASS; edit is exercised by button navigation, not independently claimed refresh for every edit route |
| Detail refresh/deep entry | Host history + Angular synchronization | R8 deepLinkRefresh PASS at created detail; not proof of all arbitrary nested routes |
| Back/Forward and exit/reentry | Host navigation, router lifecycle/unit tests | R8 backForward PASS list↔detail; bootstrap/page tests cover stale completion and application destroy |
| Role denial and remote outage | Host guard, v1 adapter, lazy element boundary | R8 inventoryDenied and browserPortalRecovery PASS; no unauthorized Customers element mounted |

R8 root `217dacf3577b2ec12a4e838b655bf0bea527f561` selected the current tagged Host/Customers revisions and used an Infra-adapted owner harness (locked snapshots plus TCP database readiness). Inner scope was available, exit 2: successful Customers subset, not full platform acceptance. Earlier R7/B7 Customers browser failures remain in the release record. R-008 is mitigated for this evidenced route set; independent current-root review and uncovered route/lifecycle permutations remain explicit, not closed merely by four routes existing. No new browser test ran for DOCS-97.

---

## Correlations

- Design system (visual components, tokens) → `12-ux-ui/design-system.md`
- Wireframes, including the four states per screen → `12-ux-ui/wireframes.md`
- Domain entities behind these screens → `02-domain/entities-and-rules.md`
- Roles and permissions source of truth → `00-governance/security-policy.md`, current Host navigation table and receiving API authorization; Corte 1 roles.js is historical
- Sale registration saga → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`, as modified by Accepted ADR-015; low-stock target → ADR-007 Decision 6, with missing Worker job TD-019
- Sales domain on MongoDB → `05-architecture/decisions/records/ADR-010-sales-on-mongodb.md`
- Angular Customers portal, host/portal contract → `05-architecture/decisions/records/ADR-011-angular-customers-portal.md`, `_stacks/frontend.md`
- Token validation per service → ADR-006
- Missing list endpoints for Users and Service tokens → `15-project-control/open-questions.md` (HU-DOCS-88)
