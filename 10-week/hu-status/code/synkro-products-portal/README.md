# synkro-products-portal

> products bounded context: web UI (remote)

Part of the **SynkroTech SAS Sales Management System** — organization `code-corhuila`.
Governance and documentation live in [`synkro-docs`](https://github.com/code-corhuila/synkro-docs).

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `synkro-docs`.

## What this repository is

A React 19 + Vite **remote** loaded by the `synkro-front` host through
`@originjs/vite-plugin-federation`. It does not run on its own: the host mounts it.

| | |
|---|---|
| Remote name | `productsPortal` |
| Exposed module | `./App` (default export: a React component without props) |
| Entry file | `http://localhost:5175/assets/remoteEntry.js` |
| Host routes | `/products`, `/stock`, `/stock-alerts` |

### Screens

| Route | Screen | Roles (enforced by the host) | What it reads |
|---|---|---|---|
| `/products` | Catalogue, management and categories | ADMIN, INVENTORY | products, categories, open stock alerts |
| `/stock` | Stock lookup, read-only | SALESPERSON | active products, categories |
| `/stock-alerts` | Stock alerts, read-only | ADMIN, INVENTORY | stock alerts, products by id |

`routes.tsx` serves exactly these three paths (an optional trailing slash is accepted) and nothing for any other.
Access by role belongs to the host: it redirects a role away from a route it may not see, so a screen never checks
the role and `/stock` never asks for alerts, which a salesperson may not read (403).

### HTTP client and session

The host owns the single HTTP client and the session; this portal only consumes them
as federated modules (typed in `src/shell.d.ts`):

- `shell/apiClient` — `apiClient.request(path, { method, body, headers, query, idempotencyKey, signal })`
- `shell/session` — `session.user()` (declared in `src/shell.d.ts`; no screen reads it yet: the host decides who sees what)

The portal requests relative paths (`/api/v1/...`). It never calls `fetch`/`axios`
and never stores a token. The lint config rejects `fetch`, `XMLHttpRequest`, `axios`,
`localStorage` and `sessionStorage`, and `src/httpGuard.test.ts` proves it.

### Folder layout

```
src/
├── App.tsx            # module exposed to the host; renders the screen for the current location
├── routes.tsx         # path → screen; the only place that knows the portal's routes
├── navigation.ts      # navigateTo(path): History API push + popstate, for links between screens
├── federation.config.ts
├── shell.d.ts         # types of the modules the host exposes
├── products/
│   ├── api/           # typed calls through shell/apiClient
│   ├── components/    # presentation only
│   ├── model/         # types, money formatting, mapping to view rows
│   └── pages/         # the screen, and the hooks that hold its state
└── test-doubles/      # fakes for shell/apiClient and shell/session, and shared fixtures
deploy/                # Dockerfile, nginx.conf.template, compose.yml (see "Deployment")
scripts/               # check-compiled.mjs: the compiled-code check CI and the image run
.github/               # CODEOWNERS, pull request template, ci.yml
```

## Products list (`/products`)

A header with "Nuevo producto", three summary tiles, and the "Catálogo" card: filters above a table of
20 products a page, and its pagination. Access by role (ADMIN, INVENTORY) belongs to the host. Everything
the user reads is Spanish and lives in `model/listCopy.ts` (the registration form's is in
`model/registrationCopy.ts`); code, tests and comments stay in English.

- **Columns:** Producto, Categoría (badge), Precio, Stock (number and badge), Estado (badge) and Acciones
  (right-aligned, see "Managing products and categories"), in the wireframe's order.
  `model/tableColumns.ts` lists them once, so the table and its skeleton always have the same shape.
- **Stock state:** only *En stock* (`stock > 0`) and *Agotado* (`stock === 0`), in
  `model/stockState.ts`. *Stock bajo* needs the worker's threshold and belongs to the stock alerts.
- **Badges never rely on colour.** The design system pairs `-700` text with a `-50` background, which
  measures 4.16:1 (success) and 3.90:1 (error) in the light theme, below the 4.5:1 minimum. So the label
  keeps the ink colour, the tone lives in the background and in a dot (hollow for inactive), and the label
  always says the state in words. The stock number is always next to its badge.
- **Summary tiles:** *Productos activos* is `GET /products?active=true&limit=1` and *Agotados* is
  `...&stockAtMost=0&limit=1`, both read from `meta.total`; *Categorías activas* counts the active
  categories the page already loads, with no request of its own. Each tile loads and fails on its own:
  a skeleton while loading, `—` with a retry named after the tile ("Reintentar: Agotados") on failure.
  After a product is registered the two product tiles reload. A tile failing never affects the table, and
  the table failing never affects the tiles (`pages/useSummary.ts`).
- **States:** loading shows skeleton tiles and skeleton rows with the table's columns, and a hidden
  `role="status"` says "Cargando productos…". The shimmer stops under `prefers-reduced-motion`. The
  table failing is an inline alert with "Reintentar". An empty catalogue says "Aún no hay productos
  registrados" with a "Nuevo producto" button; filters that match nothing say "Ningún producto coincide
  con estos filtros" and offer no button. The empty-state button is *secondary*: the header's action
  is the view's one primary, and it stays visible, so nothing moves when data arrives.
- **Table:** Precio and Stock are right-aligned, mono, with tabular numerals. The table scrolls inside a
  labelled, focusable region, so a narrow screen never scrolls the page sideways. Sorting by header and
  row selection are in the design system but the API has no sorting and there are no bulk actions yet.
- **Filters:** Nombre (partial, submitted with **Buscar** or Enter), Categoría and Estado (applied on
  change). They reuse `Field` with `required={false}`: a filter is not a required field.
- **Categories:** `ProductResponse` carries only `categoryId`. The categories list loads once when the
  screen opens and names each product's category. It is a separate request, so the table keeps its
  rows when categories fail; the category column then shows `Cargando…` or `No disponible`, and
  `Categoría desconocida` for an id the list does not contain.
- **Newest request wins:** a new request aborts the one in flight, and an answer that arrives after
  it was superseded is ignored. Leaving the screen aborts the request too (`pages/useLoad.ts`). The
  tiles use the same hook.
- **Money:** `priceCents` is an integer count of minor units of COP (1/100). `model/money.ts`
  formats it with integer arithmetic only, as `COP 1.234,56` (Colombian separators).

The list also tells *Stock bajo* (see "Low stock"); the stock lookup and the stock alerts are separate screens below.

## Registering a product (`/products`)

"Nuevo producto" opens the registration form as a panel inside the list page (registration has no
route of its own, `navigation-map.md`). It posts `{ name, priceCents, categoryId }` to
`POST /api/v1/products` through `shell/apiClient`; stock is never sent, a new product starts at 0.
All user-facing text is in Spanish.

- **Price:** `model/price.ts` reads the typed text with string splitting and `BigInt`, never a float.
  Accepted: digits with at most one `.` or `,` followed by one or two digits (`0.07` is 7, `12,5` is
  1250, `1234` is 123400). Rejected, with a message on the field and nothing sent: empty, zero, negative,
  letters, more than two decimals (so `1.234` is rejected as ambiguous between a thousand and a fraction),
  and anything above `Number.MAX_SAFE_INTEGER` minor units.
- **Idempotency:** one `Idempotency-Key` (`crypto.randomUUID()`) per intent (`pages/useRegistrationIntent.ts`).
  Sending the same data (trimmed name, price in minor units, category) again after a failure reuses the key;
  changed data, or a success, starts a new key. Only the last intent is remembered, and the key lives as long
  as the open form. A `201` and a replayed `200` are both success.
- **Errors:** the host's error is recognized by its shape (`status` and `body`), because the portal cannot
  import the host's class. `400` with `details` shows each message next to its field (`priceCents` is the
  price field); `404` is the category field; `422`, status `0` and anything else are a form alert that
  keeps the data and allows a retry. Focus goes to the first invalid field, or to the alert.
- **Submitting:** the submit button is disabled while the request is pending and a ref guards the double
  click, so a double click sends one request. Cancel is disabled meanwhile, so an answer is never left without a form.
  On success the form closes, focus returns to "Nuevo producto", the list reloads from its first page with
  the filters kept (the newest request still wins) and a polite live region says "Producto registrado" for 4 seconds.
- **Categories:** the form reuses the list's categories and offers only the active ones. If they failed to
  load, the category field says so and offers a retry.

## Managing products and categories (`/products`)

Editing, adjusting stock, deactivating, and the categories section. Everything the user reads is in
`model/managementCopy.ts` and `model/categoriesCopy.ts` (`src/copy.test.ts` fails on Spanish text anywhere else).

- **One panel at a time.** `model/panel.ts` is the page's one state: `none | register | edit(product) |
  adjust(product) | deactivate(product) | createCategory | renameCategory(category) | deactivateCategory(category)`.
  While one is open, "Nuevo producto" and the empty-state button are not rendered, and the row actions and the
  category controls are disabled (not hidden, so the table does not reflow). Closing a panel gives the focus back to
  the control that opened it, found again by its `data-opener` mark because a reload replaces the rows; if it no
  longer exists (a deactivated row has no actions, a chip is gone) the focus goes to the table region or to the
  "Categorías" heading (`pages/useFocusReturn.ts`).
- **Actions column.** Active rows offer ghost *Editar*, ghost *Ajustar stock* and danger *Desactivar*, each named after the
  product ("Editar Teclado mecánico"); inactive rows offer none, since the contract has no reactivation. `Button` gained the
  `ghost` and `danger` variants; the compact size is at least 24 × 24 CSS px.
- **Shared form.** Registering and editing are one `ProductForm` (fields, rules, error placement, focus) with two thin
  wrappers that only decide how the data is sent. `FormShell` (panel), `useFormFeedback` (errors and focus) and
  `useSingleFlight` (one request at a time, ignored once closed) serve every form of the page, including the category and
  stock forms. `useSubmissionIntent` is the generic "send once per intent with a reusable `Idempotency-Key`": registration,
  stock adjustment and category creation use it.
- **Edit.** `PUT /products/{id}` with `{ name, priceCents, categoryId }`, never stock, no key. The price opens as typed text
  (`model/priceText.ts`, integer arithmetic only: `1250050` is `12500,50`, `700` is `7`, `7` is `0,07`). A category that is
  inactive or unknown is not kept: the field starts empty and says why.
- **The two 404s of `PUT /products/{id}`.** The contract's `NotFound` has no field telling a missing product from a missing
  or inactive category, and the real service answers both `404 NOT_FOUND` with no `details`. Only its message differs
  (`Product not found` / `Category not found or not active`), so `api/productFailures.ts` blames the category field when the
  message names a category and treats anything else, including the contract's generic `Resource not found`, as the product.
- **Adjust stock.** `Cantidad a ajustar` is a signed whole number (`5`, `+5`, `-3`; never 0, no decimals) and `Motivo` is 1–255
  characters. The form shows the resulting stock as the user types and refuses at once a withdrawal larger than the stock;
  a `422` (the stock changed meanwhile) lands on the quantity field and reloads the list, so the stock shown follows. The
  intent is `(product, delta, trimmed reason)`: the same data after a failure reuses the key, changed data or a success starts
  a new one; `201` and the idempotent `200` are both success.
- **Deactivate.** `components/ConfirmDialog.tsx` is a hand-built modal, not `<dialog>.showModal()`: jsdom does not implement it, so
  its behaviour could not be tested. It is labelled and described, `aria-modal`, traps Tab, closes with Escape (not while
  pending), starts on *Cancelar*, gives the focus back, keeps the page behind `inert` and unscrollable, and uses `--color-bg-overlay`.
  `DeactivationDialog` wraps it for products and categories: on a failure it stays open with the message and the confirm button retries.
- **Categories.** The section reads the page's one categories state but has its own loading (skeleton chips), error
  ("No se pudieron cargar las categorías" and *Reintentar*) and empty states (`components/CategoriesSection.tsx`). Creating
  uses a key per intent; renaming is a `PUT`; deactivating a category that still has active products is a `422` explained in Spanish.
  After any change the categories reload, so the filter and every product form see it. The filter keeps listing inactive
  categories on purpose: inactive products can still belong to one.
- **Reloading.** Success reloads the page the user is on with its filters (`reload` in `useProductList`), the summary tiles, and
  announces it for 4 seconds; a failure that shows the list is stale (`outdated` in `FormFailure`: a 404, a stale-stock 422)
  also reloads it.

## Stock lookup (`/stock`)

A salesperson checks what is available to sell, and cannot change anything. It is the catalogue's list parametrized,
not a copy: the same `useProductList`, `useSummary`, `useCategories`, `ProductFilterBar`, `ProductListBody` and
`ProductsTable`, with a different column set (`model/tableColumns.ts`: `lookupColumns` has Producto, Categoría, Precio
and Stock; no status, no actions). Copy is in `model/stockCopy.ts`.

- **Always active.** The list and both counts ask for `active=true`; there is no status filter. The category select offers
  active categories only. The search is by name with *Buscar*.
- **Tiles.** *Productos vendibles* (active products), *En stock* (active minus out of stock) and *Agotados*. *En stock*
  needs both counts, so a failing count shows `—` with its named retry only on the tiles that need it (`model/summary.ts`).
- **States.** Skeleton rows, error with *Reintentar*, empty ("Aún no hay productos disponibles", no call to action), no match
  ("Ningún producto coincide con la búsqueda") and pagination of 20.
- **Stock state.** Only *En stock* and *Agotado*: the screen never requests alerts.

## Stock alerts (`/stock-alerts`)

What the worker has decided, read-only: alerts are opened and resolved only by `synkro-worker`, so there are no actions.
Copy is in `model/alertsCopy.ts`.

- **Filter.** *Estado*: *Abiertas* (default, `status=OPEN`), *Resueltas* (`RESOLVED`) and *Todas* (no status). Changing it
  returns to the first page (`pages/useStockAlerts.ts`); the newest request wins (`useLoad`).
- **Table.** Producto, Stock al abrir, Estado (*Abierta* in the warning tone, *Resuelta* in the success tone, with a dot and
  the label in ink), Abierta el, Resuelta el (`—` while open). Pagination of 20, newest first as the service gives them.
  Dates use `Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })`; `model/dateFormat.ts` takes the time
  zone as a parameter, so tests are deterministic (the page takes an optional `timeZone`). The browser's zone is the default.
- **Names.** `GET /stock-alerts` answers only `productId`. `pages/useProductNames.ts` reads `GET /products/{id}` for the ids of the
  page that are not cached, in parallel; they are aborted when the page changes and cached for the life of the screen.
  A name loading says *Cargando…*; a product that cannot be loaded says *Producto no disponible* (no link) and affects nothing else.
- **Link.** The name is a `PortalLink` to `/products?name=<encoded name>`, where the person adjusts the stock.
- **States.** Skeleton rows, an error banner with *Reintentar*, and the empty message by filter: *No hay alertas abiertas por ahora*
  for *Abiertas*, *Aún no hay alertas registradas* otherwise.

## Low stock (`/products`)

The worker's threshold is global and the portal does not know it, so a product is *Stock bajo* when it has an **open alert and
stock above zero**; stock zero is always *Agotado* (`model/stockState.ts`).

- **Source.** `pages/useOpenAlerts.ts` reads every open alert once (`status=OPEN`, `limit=100`, every page, like the categories) into
  a set of product ids. The table renders at once with *En stock* / *Agotado* and upgrades to *Stock bajo* when the alerts arrive.
- **Failure.** If the alerts fail, a `role="status"` notice above the table says *No se pudo comprobar el stock bajo. La lista sigue
  disponible.* with *Reintentar*; nothing else changes, and the last known set is kept while it reloads.
- **Reload.** The alerts are read again after a stock adjustment. **The worker lags**: it runs every 15 minutes
  (`LOW_STOCK_EVERY`), so after restocking above the threshold the alert stays open, and the product stays *Stock bajo*, until its next run.
- Only `/products` (ADMIN, INVENTORY) asks for alerts.

## Navigation between screens

The portal does not share the host's router. `navigation.ts` has `navigateTo(path)`: it pushes the URL with the History API and
dispatches a `popstate` event. `components/PortalLink.tsx` is a real `<a href>`: a plain left click is intercepted and uses
`navigateTo`; a click with Ctrl, Meta, Shift or Alt, or a middle click, is the browser's (a new tab).

- **The coupling.** This works because the host (`synkro-front`) uses a history-based router (React Router's `BrowserRouter`), which
  listens to `popstate` and re-renders the portal. The portal reads the location when it renders (`App.tsx`) and does not listen
  to history itself. This was checked in the real host: the menu switches screens and each one re-renders, with and without the
  portal subscribing to `popstate`, so the portal does not.
- **The failure mode.** If the host stops listening to `popstate` (a hash or memory router, or a rewrite of its outlet), a link
  changes the URL but not the screen. The `href` keeps the link usable (Ctrl-click, or a reload at the new URL), but the fix belongs in the host.
- **Initial filter.** `/products` reads an optional `name` query parameter once, when it mounts (trimmed; empty is ignored), as the
  initial name filter (`model/initialFilters.ts`). This is what the alert links use.

## Other behaviour worth knowing

- **Empty last page.** After a reload, if the current page is greater than `totalPages` (and there are pages), the list goes to the
  last valid page (`lastValidPage` in `model/page.ts`): deactivating the only product on the last page under *Activos*.
- **Inactive categories** in the list filter read `{name} (inactiva)`; product forms still offer only active ones.
- **Links** are drawn from the tokens (`PortalLink.module.css`): the secondary action colour and an underline.

## Deployment

`deploy/` holds the image of this portal alone; the composition of the whole system lives in `synkro-infra`.

```bash
cp .env.example .env   # then uncomment what you change; .env is never committed
docker compose --env-file .env -f deploy/compose.yml up --build   # http://localhost:5175
```

- **`deploy/Dockerfile`**: multi-stage. Node 22 alpine runs `npm ci`, builds, and runs `npm run check:compiled` (the build fails if the
  compiled portal has a gateway address or token handling); `nginx:1.27-alpine` serves `dist/`. Build argument `VITE_SHELL_ENTRY_URL`
  (default `http://localhost:5173/assets/remoteEntry.js`) is the host's federation entry, the only thing the portal knows about where it runs.
- **`deploy/nginx.conf.template`**, rendered by the image's template mechanism with one variable, `HOST_ORIGIN` (default
  `http://localhost:5173`; `NGINX_ENVSUBST_FILTER=^HOST_ORIGIN$` leaves nginx's own `$variables` alone):
  `/assets/remoteEntry.js` is `Cache-Control: no-store` (it decides which version of the portal the browser loads); the other
  `/assets/*` are `public, max-age=31536000, immutable` (hashed names); both carry `Access-Control-Allow-Origin: $HOST_ORIGIN` and
  `Vary: Origin`, because the host imports them from another origin. `add_header` is not inherited into a location that sets its own,
  so each block repeats what it needs. `index.html` is `no-cache`; gzip is on.
- **No gateway address, token or secret in the image.** The portal asks for relative paths and only the host knows the gateway;
  `scripts/compiledCheck.mjs` enforces it (patterns anchored so React's own `fetchPriority` and `prefetchDNS` do not trip it: a call
  is a `fetch(` that is not part of a longer name and not a method).
- **CI** (`.github/workflows/ci.yml`) keeps its jobs and adds `container-image`: it builds the image without pushing it and runs
  `nginx -t` against the rendered configuration; the build job also runs `npm run check:compiled`.

## Notes on the real service

- **`PUT /products/{id}` and 404.** The contract's `NotFound` cannot tell a missing product from a missing or inactive category. The
  real service answers both `404 NOT_FOUND` without `details`; only the message differs (`Product not found` /
  `Category not found or not active`). `api/productFailures.ts` blames the category field when the message names a category, and
  treats any other 404 (including the generic `Resource not found`) as the product.
- **Alerts are read by ADMIN and INVENTORY only.** A salesperson gets 403, so `/stock` never asks.
- **The worker lags** up to 15 minutes (see "Low stock").
- **Idempotency.** `201` the first time, `200` with the same resource when the key repeats; both are success. Registration, stock
  adjustment and category creation use `useSubmissionIntent`; updates are `PUT` and carry no key.

## Conformance with the front-end convention

Against "How this is verified" of `_stacks/frontend.md` in `synkro-docs`:

| Item | Result | Evidence |
|---|---|---|
| Compiles with strict TypeScript; `npm ci` from the versioned lockfile | met | `tsconfig.app.json` is `strict`; `npm ci && npm run build` in the CI job and the image; `package-lock.json` is versioned (`src/deploy.test.ts`, "has package-lock.json") |
| Without a session, a protected route goes to sign-in and back | not applicable to a portal | The host's `RequireAuth` does it; the portal never reads a session |
| Mounts in the host; compiled code has no gateway URL and no token handling | met | `npm run check:compiled`, `src/compiledCheck.test.ts`, the image build; mounted in the real host on `:5173` from `:5175` and from the container |
| Every request carries `Authorization` and a fresh `X-Correlation-Id`; a `401` closes the session | not applicable to a portal | The host's client does it; the portal reaches the API only through `shell/apiClient` (`src/httpGuard.test.ts`, oxlint rules) |
| Every screen shows loading, error with retry, empty and data | met | "its four states" in `StockLookupPage.test.tsx` and `StockAlertsPage.test.tsx`; `ProductsPage.layout.test.tsx` for the list; observed in the real host |
| A form shows the error next to each field, from the client and from the server | met | `ProductEditForm.test.tsx`, `ProductRegistrationForm.test.tsx`, `StockAdjustmentForm.test.tsx` ("when the service refuses"), `CategoryForms.test.tsx` |
| The submit button is disabled while a submission is pending | met | "blocks a second request while one is in flight" in the form tests; `ConfirmDialog.test.tsx` |
| Creation sends `Idempotency-Key` and reuses it on retry | met | `useSubmissionIntent.test.ts`; observed against the real service (`201`, then `200` with the same key) |
| An amount typed as `0.07` reaches the API as `7` | met | `price.test.ts`, `productForm.test.ts`, `priceText.test.ts` (`0,07` ⇄ `7`) |
| A nonexistent route shows the 404 page | not applicable to a portal | The host shows it; the portal renders nothing for a path it does not own (`routes.test.ts`) |
| With one portal's server stopped, the host still starts and only that area shows the notice | not applicable to a portal | Host behaviour (`RemoteBoundary`); not re-verified in this repository |
| Angular only: `customElements.whenDefined`, input setter, stable entry name | not applicable | This is a React remote |
| Angular only: initial navigation, deep link and Back under the host's base path | not applicable | This is a React remote; for this one, a deep link and Back were checked in the real host (see "Navigation") |

## Repository readiness

`src/deploy.test.ts` checks the structure of a domain portal: `deploy/`, `src/products/{api,components,model,pages}`, `src/shell.d.ts`,
`src/vite-env.d.ts`, `.env.example`, `.gitignore` (with `coverage/`), `.nvmrc` and `engines` (Node 22), the versioned lockfile, README,
CODEOWNERS and the pull request template. The CI jobs run from a clean install (`npm ci`): lint, build, `check:compiled`, tests with coverage
(floor 70% statements, `vite.config.ts`) and the image build.

### Styling

Styles are CSS Modules (`*.module.css`) next to the component. They read the host's design tokens by name
(`var(--color-primary-500)`) and never carry a colour, spacing or type literal; `src/styles.test.ts` enforces
it. CSS Modules scope each class name, and a remote's stylesheet lands in the host's document, where a plain
global class could collide with the host's or another portal's. The host publishes the tokens and follows the
operating system's light or dark theme, so no component branches on the theme except the input background
the design system asks to sit on the page colour in dark. The host's `Button` is not shared: `components/Button.tsx` is
this portal's own (primary, secondary, ghost or danger; regular or small). The host publishes no border token, so the table's
row lines use `--color-text-disabled`. Text sits on a card (`--color-bg-card`), where the ink and the muted text
measure above 4.5:1 in both themes; error text stays on a card too, because `--color-error-700` on the canvas
is 4.34:1. `build.cssCodeSplit: false` keeps one stylesheet that the remote entry loads, and the
build test still fails on any unresolved `__v__css__` placeholder.

## Running locally

Requires Node 22 (`nvm use`).

```bash
npm ci
cp .env.example .env.local
npm run build && npm run preview   # serves assets/remoteEntry.js on port 5175
```

A federated remote's entry only exists in a build, so there is no dev server.

## Scripts

| Script | What it does |
|---|---|
| `npm run lint` | oxlint, including the HTTP/storage guard |
| `npm test` | Vitest; add `-- --coverage` for the report (floor: 70% statements) |
| `npm run build` | type-check and build the remote |
| `npm run check:compiled` | fails if `dist/` has a gateway address, token handling or a direct HTTP client (run it after the build) |

## Root composition delivery

The deployed Products remote is served through the host at
`http://localhost:5173/remotes/products/assets/remoteEntry.js`. Its container
publishes no host port and joins `platform`. Its Vite base is `/remotes/products/`;
the host proxies that prefix to the internal portal. Local Vite preview remains
a separate development command. The host build accepts `VITE_PRODUCTS_PORTAL_ENTRY`
for this route. Three other portal packages remain external dependencies.
Run `python3 tests/test_root_deploy.py` for deployment configuration checks.
