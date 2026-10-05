# Stack: Frontend

> This guide is for `synkro-front` (the host) and the four domain portals.
> Three portals and the host are React 19 with Vite and Module Federation
> (ADR-008 Decision 4). `synkro-customers-portal` is Angular 21, mounted
> inside the host as a custom element (ADR-011) — not as a second
> container with its own client, and not through Native Federation. Both
> run on Node 22 LTS.
>
> The concepts are in `05-architecture/hexagonal-architecture.md` and
> ADR-008/ADR-011; this guide gives the concrete folders, the contract
> between host and portal, and the rules every screen follows.

---

## The rule both frameworks implement

**The HTTP client and the session live in the host, and only there.** A
portal consumes them; it never creates its own. A portal with its own
client duplicates the hardest part of the interface — and is the most
common mistake when splitting one application into micro-frontends: the
system ends up with as many token handlers as screens.

| | React portals | Angular portal (Customers) |
|---|---|---|
| Mechanism | The host **exposes** its client through Module Federation; the portal imports it as `shell/apiClient` | The host passes a `ShellContract` object as a property on the custom element; the portal wraps it in an Angular service |
| Verifiable rule | The portal never calls `fetch` against the API | The portal never calls `provideHttpClient()` and never imports Angular's `HttpClient` |
| If broken | A second client that knows neither the gateway nor the token | A second client with no interceptor: its requests go out unauthenticated, silently |

There is no "Angular container" in this project. Anexo H's Angular
example (a full Angular stack with Native Federation) describes a
different scenario — a team that chose Angular for everything — and does
not apply here: ADR-011 mounts exactly one Angular portal inside the
React host, by a different mechanism (a custom element, not Native
Federation), precisely because mixing two frameworks under one container
needs it.

---

## Folder structure

### React — host

```
synkro-front/   (React)
├── .github/                              # common to every code repository
├── deploy/
│   ├── compose.yml
│   ├── Dockerfile
│   └── nginx.conf
├── src/
│   ├── app/
│   │   └── App.tsx
│   ├── core/
│   │   ├── auth/
│   │   │   ├── RequireAuth.tsx
│   │   │   └── session.ts
│   │   ├── errors/
│   │   │   └── RemoteBoundary.tsx
│   │   └── http/
│   │       └── apiClient.ts
│   ├── layout/
│   │   └── Shell.tsx
│   ├── remotes/
│   │   ├── registry.ts                   # every portal's entry, React and Angular alike
│   │   └── remotes.d.ts
│   ├── shared/
│   │   └── ui/
│   │       └── Button.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.tsbuildinfo
└── vite.config.ts
```

### React — domain portal (`synkro-auth-portal`, `synkro-products-portal`, `synkro-sales-portal`)

```
synkro-<domain>-portal/   (React)
├── .github/                              # common to every code repository
├── deploy/
│   ├── compose.yml
│   ├── Dockerfile
│   └── nginx.conf
├── src/
│   ├── <domain>/
│   │   ├── api/
│   │   │   └── <domain>Api.ts            # uses shell/apiClient
│   │   ├── components/
│   │   │   └── <Domain>Form.tsx
│   │   ├── model/
│   │   │   ├── money.ts
│   │   │   └── <domain>.ts
│   │   └── pages/
│   │       └── <Domain>Page.tsx
│   ├── shell.d.ts
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.tsbuildinfo
└── vite.config.ts
```

### Angular — Customers portal (custom element, zoneless, ADR-011)

```
synkro-customers-portal/   (Angular)
├── .github/                              # common to every code repository
├── deploy/
│   ├── compose.yml
│   ├── Dockerfile                        # Node 22, npm ci, builds, serves the stable entry file uncached
│   └── nginx.conf
├── src/
│   ├── app/
│   │   ├── customers/
│   │   │   ├── components/
│   │   │   │   └── customer-form.component.ts
│   │   │   ├── data/
│   │   │   │   └── customers-api.service.ts   # wraps ShellContract.api.request — never HttpClient
│   │   │   ├── model/
│   │   │   │   ├── money.ts
│   │   │   │   └── customer.ts
│   │   │   ├── pages/
│   │   │   │   └── customers-page.component.ts
│   │   │   └── customers.routes.ts
│   │   ├── app.component.ts                    # root: reads the contract via ngOnChanges, not only ngOnInit (ADR-011 Decision 2)
│   │   ├── app.config.ts                        # provideZonelessChangeDetection(), provideRouter(routes) — no provideHttpClient()
│   │   └── shell-contract.ts                    # identical type to the host's copy
│   ├── bootstrap.ts                              # createApplication() + createCustomElement() + customElements.define()
│   ├── index.html
│   └── main.ts
├── scripts/
│   └── rename-entry.cjs                          # copies the hashed build output to a stable entry filename (ADR-011 Decision 2)
├── .env.example
├── .gitignore
├── angular.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
└── tsconfig.json
```

No `federation.config.js` and no federation manifest: this portal is not
built with Native Federation. Its only non-standard build step is the
rename script that gives its compiled entry a stable, unhashed filename,
because Angular's default build output is content-hashed and the host
needs to import the same URL across versions.

---

## What goes where

| Piece | Host (React) | React portal | Angular portal (Customers) |
|---|---|---|---|
| The single client (gateway address, token, correlation, timeout, errors) | `src/core/http/apiClient.ts` | consumed as `shell/apiClient`, never redefined | received as `contract.api.request` on the custom element's property, wrapped in `customers-api.service.ts` |
| The session | `src/core/auth/session.ts` | consumed through the host | received as `contract.session.user()` |
| Route guard and development sign-in | `src/core/auth/RequireAuth.tsx` | n/a — the host decides before mounting any portal | n/a — same |
| Per-portal isolation | `src/core/errors/RemoteBoundary.tsx`, with import failures re-thrown during render so the boundary catches them | n/a | n/a — the host's boundary covers this portal too |
| Which portals exist and how each one mounts | `src/remotes/registry.ts` — a Module Federation entry for each React portal, a custom-element entry (with the `whenDefined` wait) for Customers | — | — |
| Navigation, 404 | `src/layout/`, `src/app/App.tsx` | — | — |
| Contract types | — | `src/shell.d.ts` | `src/app/shell-contract.ts` — same shape, duplicated by necessity (no shared package between a Vite and an Angular build) |
| Typed API calls | — | `src/<domain>/api/` | `src/app/customers/data/customers-api.service.ts` |
| Pages and components | — | `src/<domain>/pages/`, `components/` | `src/app/customers/pages/`, `components/` |
| Deployment | `deploy/Dockerfile` (Node 22, `npm ci`), `deploy/nginx.conf` | same | same |

---

## What the host's client does for every portal, React or Angular

| Aspect | Behavior |
|---|---|
| Destination | Only the host knows the gateway's address; every portal requests a relative path (`/api/v1/...`) |
| Credential | The client attaches the token; a `401` closes the session |
| Correlation | A fresh `X-Correlation-Id` on every request |
| Timeout | 10 seconds per request; past it, a `TIMEOUT` error |
| Errors | Every failure reaches the portal in the common envelope plus the message for the person, decided **in one place** by status code, with the `traceId` reference |

For the Angular portal specifically, this means `contract.api.request` —
not Angular's `HttpClient` with an interceptor, because there is no
Angular container here to register an interceptor in. The contract
object itself carries the already-wired behavior above.

---

## What every screen does, in either framework

| Rule | Why |
|---|---|
| Four designed states: loading, error with retry, empty, and data | A view that only designs the happy path goes blank the first time one of the other three happens |
| A newer request replaces the previous one | Without this, a slow response overwrites a fast one and the table shows the wrong filter |
| A label per field and the error next to it (`aria-describedby` in React, Angular's own label association) | A screen reader needs to know which field failed, not only that something failed |
| The button is disabled while a submission is pending | Double-click is the most common cause of duplicate records |
| `Idempotency-Key` per intent, reused on retry | If the connection drops the response, retrying does not create a second request |
| Money from typed text, never by multiplying a float | `0.07 * 100` is `7.000000000000001` |

---

## A portal that fails does not take down the application

| | React portals | Angular portal (Customers) |
|---|---|---|
| Remote loading | `shareStrategy: 'loaded-first'`: a portal downloads only on entering its route | `import()` of the stable entry file, then `customElements.whenDefined('synkro-customers-portal')`, both on entering `/customers/*` |
| Containment | `RemoteBoundary`: one error boundary per portal | The host stores a failed import in state and re-throws it during render, so the same `RemoteBoundary` catches it |
| Result | Only that portal's area shows the unavailable notice; the rest of the application keeps working | Same |

With Module Federation's default strategy (`version-first`), the host
would download **every** remote at startup to compare versions — a
single downed portal would blank the whole application. `loaded-first`
avoids this for the React portals; the Angular portal avoids it by
construction, since it is only imported on entering its own route.

---

## Internal routing inside the Angular portal — open, not solved

ADR-011 flags this explicitly: the Angular router's initial navigation
under the host-owned base path (`/customers/*`), a deep link to an inner
route, and the interaction with the host's history on Back are not
guaranteed by Angular's defaults when bootstrapping outside the ordinary
`bootstrapApplication` flow. This must be verified — and, if needed,
fixed with an explicit base-href or initial-navigation strategy — as part
of the acceptance criteria of `synkro-customers-portal`'s first routed
screens, not assumed because the mounting mechanism works.

---

## Development sign-in

Exists only in `synkro-front`, only in `develop`. A pasted development
token starts a session the same way for every portal — React or Angular
— because a portal never handles a token itself; it only ever receives
`contract.session.user()` already resolved. The development sign-in
never reaches `main`; it is replaced once `synkro-auth-portal` is real.

---

## Versions

Pinned by ADR-008 (React 19, Vite, Node 22 LTS) and ADR-011 (Angular 21,
no zone.js). `package-lock.json` is versioned in every repository and
every Dockerfile uses `npm ci`: what gets installed is exactly what was
tested, never a newer resolved version.

---

## Rules

1. One portal per domain, named by channel: `-portal` for web.
2. A portal's types mirror the API contract's field names exactly, including `Page<T>` with `data` and `meta`.
3. A portal requests relative paths (`/api/v1/<domain>`); only the host knows the gateway's address.
4. The host never defines its own color, typography or spacing — it reads the tokens published in `12-ux-ui/design-system.md` as CSS custom properties, and so does the Angular portal; see ADR-011 Decision 4.
5. A portal's remote entry file is never cached: it decides which version of that portal the browser loads. For the Angular portal this means the renamed, stable-filename output, served with `Cache-Control: no-store` or equivalent.
6. The development sign-in never reaches `main`; it is replaced by the identity domain's own portal.

---

## How this is verified

- [ ] Every repository compiles with strict TypeScript, and `npm ci` installs from the versioned `package-lock.json`
- [ ] Without a session, a protected route redirects to sign-in and returns to the requested route afterward
- [ ] A portal mounts inside the host and, checked against its compiled code, contains no gateway URL and no token handling
- [ ] Every request carries `Authorization` and a fresh `X-Correlation-Id`; a `401` closes the session
- [ ] Every screen shows its four states: loading, error with retry, empty, and data
- [ ] A form shows the error next to each field, from the client and from the server
- [ ] The submit button is disabled while a submission is pending
- [ ] Creation sends `Idempotency-Key` and reuses it on retry
- [ ] An amount typed as `0.07` reaches the API as `7`
- [ ] A nonexistent route shows the 404 page
- [ ] With one portal's server stopped, the host still starts and only that portal's area shows the unavailable notice
- [ ] **Angular portal only:** the host waits for `customElements.whenDefined('synkro-customers-portal')` before handing over the contract; the root component reads the contract through `ngOnChanges` or an input setter, not only `ngOnInit`; the build produces a stable (unhashed) entry filename
- [ ] **Angular portal only:** initial navigation, a deep link into an inner route, and Back have been verified under the host's base path (see "Internal routing," above) — not assumed

---

## Correlations

- Host/portal contract and mounting mechanism → `05-architecture/decisions/records/ADR-011-angular-customers-portal.md`
- Frontend stack and versions → `05-architecture/decisions/records/ADR-008-cross-cutting-stack.md`
- Design tokens, published once and read by both frameworks → `12-ux-ui/design-system.md`
- Development sign-in and route guard → `05-architecture/deployment.md` §6, "Development identity"
- Frontend test tier, coverage thresholds, test doubles → `11-quality/testing-strategy.md`, "Frontend tests"
- Screens per portal and their four states → `12-ux-ui/navigation-map.md`, `12-ux-ui/wireframes.md`
- Service catalog entry for each portal → `09-microservices/service-catalog.md`
