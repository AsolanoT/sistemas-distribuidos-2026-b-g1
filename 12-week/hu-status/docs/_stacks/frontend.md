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

Customers is the Angular custom-element portal inside the React Host. ADR-011 defines that boundary and its existing ShellContract v1; no second container, Native Federation client or token owner is introduced.

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
| Route guard and development sign-in | `src/core/auth/RequireAuth.tsx` | n/a — the host guards protected routes; production login mounts publicly | n/a — same |
| Per-portal isolation | `src/core/errors/RemoteBoundary.tsx`, with import failures re-thrown during render so the boundary catches them | n/a | n/a — the host's boundary covers this portal too |
| Which portals exist and how each one mounts | `src/remotes/registry.ts` — a Module Federation entry for each React portal, a custom-element entry (with the `whenDefined` wait) for Customers | — | — |
| Navigation, 404 | `src/layout/`, `src/app/App.tsx` | — | — |
| Contract types | — | `src/shell.d.ts` | `src/app/shell-contract.ts` — same shape, duplicated by necessity (no shared package between a Vite and an Angular build) |
| Typed API calls | — | `src/<domain>/api/` | `src/app/customers/data/customers-api.service.ts` |
| Pages and components | — | `src/<domain>/pages/`, `components/` | `src/app/customers/pages/`, `components/` |
| Deployment | `deploy/Dockerfile` (Node 22, `npm ci`), `deploy/nginx.conf` | same | same |

---

### Production login boundary

The Auth portal owns `LoginScreen`; the host owns the public `/login` route, remote loading and the authentication operation consumed by that screen. That operation uses the existing shared client and consumes the token response inside the host, returning user/session state or the common error. Portals never receive token-management responsibility.

The existing Angular Customers `ShellContract` remains unchanged: it exposes user state, navigation and the shared client, not raw tokens. The Auth portal's authentication operation is a host-owned capability, not a second session or a proposed change to the accepted ADR-011 contract.

Session timing, tab recovery, refresh coordination and error policy have one source: [Browser session](../07-api/authentication.md#browser-session). Public login and refresh bypass the protected-request renewal gate. Other protected requests use that gate before transport; a received protected `401` is never refreshed and replayed automatically.

### Session capabilities and Sales recovery

The federated shell/session API, observed in Front and accepted in [ADR-016](../05-architecture/decisions/records/ADR-016-host-session-renewal-and-operation-recovery.md), is:

| Capability | Signature | Boundary |
|---|---|---|
| user | user(): {sub: string; role: string} \| null | Fresh token-free identity fields, not a live internal session object |
| sessionId | sessionId(): string \| null | Host-generated noncredential cryptographic UUID; new login rotates it, successful renewal/reload retains it when metadata is valid |
| subscribe | subscribe(listener: () => void): () => void | Synchronous notification after the consistent snapshot; isolated listener failures; idempotent unsubscribe |

Production identity is published only after successful Auth login/refresh; a descriptor alone grants nothing. Logout/invalidation publishes both nulls before notification. Late replies are rejected through the Host generation. This contract applies to the federated object; Angular Customers keeps its exact ShellContract v1 identity adapter and is not assigned new methods by this guide.

Sales owns synkro.sales.intent.v1, never the Host. The owner pair is (subject, sessionId), not the subject alone. Persist the original key, canonical UUID/quantity fingerprint, optional saga ID and original 24-hour deadline before POST; never store credentials, personal details, prices or totals. An older Host missing the recovery capabilities disables registration; it may still support history/detail. Storage errors block a new submission.

Reload does not automatically submit or observe. Explicit GET can recover a known saga; otherwise the person reconstructs the same request for explicit same-key retry before its original deadline. Expiry requires reconciliation; it does not prove backend expiry or allow a replacement sale. COMPLETED with saleId and COMPENSATED clear the journal; FAILED requires attention. A pending journal retains its Host subscription across screen unmount; logout/new login clears local references and observation only, without cancelling or compensating Workflow.

There is no cross-tab refresh coordination or deduplication. Cloned tabs, storage deletion and tab closure are outside this recovery guarantee. One local 24-hour ceiling is not an operational backend retention contract. [Authentication](../07-api/authentication.md#session-identity-and-operation-recovery) owns the common lifecycle; ADR-016 is Accepted from 2026-10-25; runtime coverage and PR publication remain separate evidence.

## What the host's client does for every portal, React or Angular

| Aspect | Behavior |
|---|---|
| Destination | Only the host knows the gateway's address; every portal requests a relative path (`/api/v1/...`) |
| Credential | Protected calls attach the token after the session gate; protected `401` closes the session. Public login/refresh outcomes follow `07-api/authentication.md`. |
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
| Result | Only that portal area shows unavailable; other modules remain usable. Current React retry has a known reload limitation | Customers explicit module retry/remount is covered by real author browser evidence |

With Module Federation's default strategy (`version-first`), the host
would download **every** remote at startup to compare versions — a
single downed portal would blank the whole application. `loaded-first`
avoids this for the React portals; the Angular portal avoids it by
construction, since it is only imported on entering its own route.

---

## Internal routing inside the Angular portal — delivered evidence and remaining limits

The original routing risk is no longer supported only by a mounting spike. Delivered Customers has four routes and a fresh application/router per mount. Host owns browser history; the v1 navigate capability drives inner transitions, while Customers synchronizes the current path without a competing browser-history write. Application generation/destruction and AbortSignal guards reject late replies after replacement/unmount.

The [route/evidence map](../12-ux-ui/navigation-map.md#customers-routing-evidence-and-r-008) names current Host/portal SHAs, owner route/bootstrap tests and real-browser R8 root 217dacf3577b2ec12a4e838b655bf0bea527f561. It reports initial login return, new/detail/edit journey, detail refresh and list↔detail Back/Forward. Edit deep refresh and every lifecycle permutation are not inferred from those checks. Infra adapted locked owner snapshots and TCP readiness; source/unit tests are not newly executed browser evidence. R-008 is mitigated within that scope, with independent current-root review still required; full Infra acceptance remains separate.

---

## Development sign-in

Real Auth Login and Host authentication are delivered. The guarded VITE_DEV_SIGN_IN path remains development tooling; root examples set it false and non-dev activation is refused by the candidate configuration. A promoted source branch containing guarded tooling is not permission to use simulated identity in qa/main. Portals receive token-free identity/capabilities, never bearer ownership. [Authentication](../07-api/authentication.md) and [deployment](../05-architecture/deployment.md) own lifecycle/configuration rules.

---

Delivered UI inventory: Auth Login; Customers four routes; Products three views with category/catalog/stock dialogs; Sales registration/history/detail. Host dashboard and Auth administration remain placeholders; reporting UI and Worker business automation remain unfinished. See [navigation](../12-ux-ui/navigation-map.md) and [wireframes](../12-ux-ui/wireframes.md) for states, metadata failure, cancellation and evidence.

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
- [ ] Protected requests carry `Authorization` after the session gate; every request has a fresh `X-Correlation-Id`; login, refresh and protected `401` outcomes follow the authentication policy
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
