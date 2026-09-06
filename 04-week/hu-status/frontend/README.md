# HU-FE-01 — Frontend MVP

React + Vite client for the Synkro Tech MVP. It talks to the real backend
(HU-ARQ-02) — there is no mock data anywhere.

- React 19, Vite 8, React Router 7
- Dev server: `http://localhost:5173`
- API base URL: `http://localhost:8080/api` (override with `VITE_API_URL`)

## Running it

The backend must be up first, or every screen shows a connection error:

```bash
curl http://localhost:8080/api/auth/users
```

That should return the three seeded users. Then:

```bash
npm --prefix frontend install
```

```bash
npm --prefix frontend run dev
```

## How it is put together

```
src/
  api/
    client.js       fetch wrapper + ApiError (status, fieldErrors)
    useResource.js  load / reload hook every list screen uses
    format.js       es-CO money, number and date formatting
  components/       Sidebar, Icon, PageHeader, and the ui.jsx primitives
  features/
    auth/           session Context, login picker, role→module map
    customers/
    products/       products, categories, and the read-only stock lookup
    sales/          sale builder, history, detail
    dashboard/      admin summary
  styles/
    tokens.css      the approved palette and fonts
    global.css      everything else
```

### Session

Auth is simulated. `GET /api/auth/users` fills the picker, `POST /api/auth/login`
echoes the chosen user back, and that object *is* the session — held in a React
Context, in memory. There is no token and nothing is persisted, so reloading the
page returns to the picker by design.

### Roles

[`features/auth/roles.js`](src/features/auth/roles.js) is the single source of
truth: one list maps each module to the roles allowed to see it, and it drives
both the sidebar and the route guards. A role can never reach a screen its nav
does not offer.

| Role | Modules | Lands on |
| ---- | ------- | -------- |
| `ADMIN` | Summary, Customers, Sales, Products | Summary |
| `SALESPERSON` | Customers, Sales, Stock lookup (read-only) | Customers |
| `INVENTORY` | Products (with categories) | Products |

### Errors

`api/client.js` turns every non-2xx response into an `ApiError` carrying the
backend's `status`, `message` and `fieldErrors`. Screens then split them:

- **400** — `fieldErrors` is mapped onto the matching inputs, so the message
  lands under the field that caused it (including `items[0].quantity` on a sale).
- **409** — the backend's own sentence is shown as a banner: a duplicate tax id
  in the customer form, or an insufficient-stock rejection above the sale form.
- **network failure** — a single message telling the person to check that the
  backend is running.

The backend writes those messages to be read by a person, so they are shown
verbatim rather than reworded here.

### Design

Tokens live in [`styles/tokens.css`](src/styles/tokens.css), taken from the
Figma style guide ("SynkroTech — MVP UI Draft" → Style guide). A handful of
neutrals the guide does not name (surface, border, muted text) are derived in
the same file so they stay consistent.

- **Space Grotesk** headings, **Inter** body and forms
- **JetBrains Mono** for every numeric value — prices, stock, quantities, tax
  ids, dates and totals. This is the deliberate signature; the `.num` class
  applies it.
- Copper (`--color-accent-copper`) is reserved for the single primary action on
  each screen. Everything else is steel or a plain secondary button.
- Green marks in-stock, red marks out-of-stock and rejected states.

## Notes for whoever picks this up

- Lists load everything and filter client-side. That is fine at MVP scale; if
  the catalogue grows, paginate on the server before this becomes a problem.
- The sale form previews a total locally, but the sale that gets saved is
  always priced by the backend, which freezes each unit price at that moment.
  The preview is a convenience, never the source of truth.
- UI copy is in English, matching the API's own error messages. If the demo
  should be in Spanish, both sides need translating together — otherwise a
  Spanish screen would surface English rejection messages.
