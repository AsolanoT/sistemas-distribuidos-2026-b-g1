# ADR-011 — Angular Customers Portal in the React Host

| Field | Value |
|-------|-------|
| **ID** | ADR-011 |
| **Date** | 2026-10-03 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — Tech Lead |
| **Reviewers** | Jordan Ramirez Gallego, Sergio Andrés Ordóñez Díaz, Fredman Santiago Plazas Artunduaga — Development team |
| **Modifies** | ADR-008 Decision 4 (every portal in React as a Module Federation remote) and its "Frontend" version row. ADR-001, frontend framework (section to be confirmed — see note in Decision 1) |
| **Traced to** | HU-ARQ-24 |

---

## Context

ADR-008 Decision 4 fixed React 19 with Vite and Module Federation for the whole frontend: `synkro-front` is the host, owner of navigation, session and the single HTTP client, and each portal is a remote that uses that client.

The course architecture requires the portals to use both React and Angular. No portal has been built yet.

An Angular portal inside a React host cannot receive anything from Angular's own dependency injection from the host: there is no shared injector. Without a decision on how it is mounted and how it receives the client, the portal would end up with its own HTTP client, its own token handling and its own gateway address — exactly what ADR-008 forbids.

This decision is made on the known technical characteristics of browser custom elements, of Angular's standalone bootstrap (`createApplication` plus `createCustomElement`), and of asynchronous module loading in general — not on a prototype built and verified inside this repository. The mounting mechanism below is therefore written as a set of explicit implementation requirements that `synkro-customers-portal` and `synkro-front` must satisfy, to be confirmed against real code the first time the portal is built, rather than as findings already demonstrated.

**Constraints:**
- ADR-008 and ADR-001 are immutable; this ADR replaces sections without editing them.
- The course's frontend frameworks are React 19 and Angular 21; at least one portal uses each.
- Still in force from ADR-008 Decision 4: one HTTP client and one session, in the host; a portal that fails to load does not affect the rest of the application; each portal is built and deployed separately.
- The host does not change framework: `synkro-front` is React.

---

## Decision 1 — Which portal uses Angular

### Options

**Option A — `synkro-customers-portal`.**
- **Pros:** it is a list-and-form portal, with no cross-domain flows; it is not part of session handling; it is not required for the first frontend demonstration, so it does not block the React portals.
- **Cons:** whoever builds Customers must learn Angular.

**Option B — `synkro-auth-portal`.**
- **Pros:** it is built last; until then it is replaced by the development sign-in.
- **Cons:** sign-in writes into the host's session: it is the portal with the most coupling between the two frameworks.

**Option C — `synkro-sales-portal`.**
- **Pros:** it is the most visible portal.
- **Cons:** it holds the most complex flow (starting the saga, reading its result, looking up customers and products); a mounting failure would compromise core functionality.

### Decision

**We decided: Option A.** `synkro-customers-portal` uses Angular 21 with TypeScript, without zone.js. `synkro-auth-portal`, `synkro-products-portal` and `synkro-sales-portal` stay on React 19 as Module Federation remotes (ADR-008).

> **Note on "Modifies":** this decision replaces whichever section of ADR-001 fixed the single frontend framework. The exact section number was not confirmed before this ADR was accepted; whoever merges the register update in `05-architecture/decisions/README.md` should locate it in ADR-001 and fill it in there, without editing this ADR.

### Dominant criterion

**The least possible coupling between the two frameworks.** The Angular portal is the one that depends least on the host: it only needs the client and to know who the user is.

### Accepted cost

- The team maintains two frontend frameworks, with two build and test toolchains.
- React components are not reused in Customers.

---

## Decision 2 — How the Angular portal mounts in the React host

### Options

**Option A — Custom element.** The Angular application registers a browser custom element (`<synkro-customers-portal>`). The host downloads its entry file on entering the route and places the element inside its error boundary.
- **Pros:** uses only browser standards; no two federation runtimes need to understand each other; host and portal share no library, so there are no cross-framework version pairs to keep compatible.
- **Cons:** an Angular portal does not register the same way a React remote does; the host needs a second kind of entry in its portal registry.

**Option B — Native Federation in the portal, loaded by the host with the Native Federation runtime.** The portal exposes a mount function; the host loads it with that runtime, alongside Module Federation for the React portals.
- **Pros:** the portal keeps the federation configuration an Angular portal would normally have.
- **Cons:** the host runs two federation runtimes at once; whether they coexist with Vite's Module Federation is unproven.

**Option C — Module Federation in the Angular portal too.** The portal is built with a Module Federation-compatible bundler and exposes a mount function, like a React remote.
- **Pros:** one mechanism, one registry in the host.
- **Cons:** takes the portal out of Angular 21's default build system, with configuration the team would have to maintain on its own.

### Decision

**We decided: Option A.**

- `synkro-customers-portal` registers the custom element `synkro-customers-portal` when its entry file loads. That file must have a stable name across builds; Angular's default build output is content-hashed, so the portal's build pipeline must include an explicit step that produces a fixed-name file (for example `remoteEntry.js`) from the hashed bundle, or set `outputHashing: none` for this entry point. The portal's server serves that file uncached, since it decides which version of the portal the browser loads.
- `synkro-front` adds the portal to its registry with that file's address, from configuration. On opening `/customers/*`, it imports it on demand and places the element inside `RemoteBoundary`.
- **Contract delivery must account for asynchronous bootstrap.** `createApplication()` and the `customElements.define(...)` that follows it are asynchronous, so the custom element is not guaranteed to be upgraded the instant its module import resolves. The host must wait for `customElements.whenDefined('synkro-customers-portal')` before rendering the element with the contract of Decision 3 as a property. On the portal side, the root component must read the contract through `ngOnChanges` or an input setter — not only in `ngOnInit` — so initialization does not depend on the exact order in which the browser upgrades the element relative to when its property is set.
- **A failed import must reach the host's error boundary.** A rejection inside a `Promise`'s `.catch()` is not, by itself, visible to a React error boundary. The host's loading code must store the failure in component state and re-throw it during render, which `RemoteBoundary` does catch, showing that area's notice while leaving the rest of the application unaffected.
- The host owns the route `/customers/*` and passes the portal its base route. The portal navigates within that base with its own router; to leave it, it calls the contract's `navigate` function. **This internal routing behavior — the router's initial navigation under a host-owned base path, a deep link into an inner route, and the interaction between the host's and the portal's history when the user presses Back — is a known risk of mounting a second router inside a host-controlled route, and is not guaranteed by Angular's defaults when bootstrapping outside the ordinary `bootstrapApplication` flow.** It must be built and verified explicitly as part of `synkro-customers-portal`'s first routed screens, with its own acceptance criteria covering direct entry, a deep link and Back — not assumed to work because the mounting mechanism does.
- On leaving the route, the host removes the element, which must trigger Angular's normal teardown (`ngOnDestroy`) with no lingering subscriptions or timers; this is a requirement on the portal's components, verified the same way any other cleanup bug would be — through its own tests — not something this ADR asserts as already demonstrated.

### Dominant criterion

**A portal that fails to load does not affect the rest of the application**, with the mechanism that adds the fewest pieces between the two frameworks.

### Accepted cost

- Two ways to register a portal in the host: Module Federation remote (React) and custom element (Angular).
- Angular's runtime is downloaded whole on opening Customers; it is shared with no one.
- The portal's structure does not include federation configuration.
- The host's loading code is more involved than a plain dynamic import: it must wait for the element's definition and re-throw asynchronous failures during render.
- Internal routing inside the Angular portal carries open technical risk that the team accepts as something to resolve during the portal's implementation, not before.

---

## Decision 3 — How the portal receives the client and the session

### Options

**Option A — A contract between host and portal.** The host hands over an object with its client, the user's data and navigation; the portal wraps it in an Angular service.
- **Pros:** one client and one session across the whole frontend; the portal never sees the token or the gateway address.
- **Cons:** the contract's type exists in two repositories and can drift.

**Option B — The portal uses Angular's HTTP client with its own interceptor**, which reads the token from the host's session.
- **Pros:** conventional Angular code.
- **Cons:** a second client, with its own token handling, correlation, timeout and errors; if the interceptor is missing, requests go out unauthenticated with no warning.

### Decision

**We decided: Option A.** The contract, in `src/app/shell-contract.ts` in the portal and in the host:

```ts
export interface ShellContract {
  contractVersion: 1;
  basePath: string;
  api: {
    request<T>(
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      path: string,
      options?: { query?: Record<string, string>; body?: unknown; idempotencyKey?: string; signal?: AbortSignal },
    ): Promise<T>;
  };
  session: { user(): { sub: string; role: 'ADMIN' | 'SALESPERSON' | 'INVENTORY' } | null };
  navigate(path: string): void;
}
```

- The portal requests relative paths (`/api/v1/customers`). The host adds the gateway address, the credential, the correlation id and the timeout, and decides each error's message.
- The contract does not expose the token.
- In the portal, a single Angular service wraps `api.request`; the `data/` services use it. The portal does not register Angular's HTTP client, does not call `fetch`, and stores nothing from the session.
- If `contractVersion` is not what the portal expects, the portal does not mount and the area shows the unavailable notice.
- The portal's CI fails if its compiled code contains the gateway address, `Authorization` handling, Angular's HTTP client registration, or a call to `fetch`.

### Dominant criterion

**One HTTP client and one session across the whole frontend**, regardless of a portal's framework.

### Accepted cost

- The contract file is duplicated across two repositories; a change requires bumping `contractVersion` and updating both in the same delivery.
- The portal's services work with the host's promises, not with Angular's HTTP client or its interceptors.

---

## Decision 4 — Visual consistency across frameworks

### Options

**Option A — Design tokens as CSS custom properties**, defined by the host and used by both frameworks.
- **Pros:** one source for color, typography and spacing; each framework builds its components its own way.
- **Cons:** components (button, table, form) are implemented twice.

**Option B — A web-component library shared by both frameworks.**
- **Pros:** one component for both.
- **Cons:** one more repository and one more technology, for a single Angular portal.

### Decision

**We decided: Option A.** `synkro-front` publishes the tokens of `12-ux-ui/design-system.md` as CSS custom properties on the document root. The Angular portal uses these tokens in its styles and defines no color, typography or spacing of its own.

### Dominant criterion

**No new component without a need that justifies it.**

### Accepted cost

- Customers' UI components are implemented apart from React's and may differ in detail; visual review is manual.

---

## Consequences

**What changes in the system:**
- The frontend has two frameworks: React 19 (host and three portals) and Angular 21 (Customers portal).
- `synkro-front` gains a second kind of portal in its registry, with loading code that waits for the custom element's definition and re-throws asynchronous failures during render.
- `synkro-customers-portal` is built, tested and deployed with Angular's tooling, including a build step that produces a stable entry-file name; its server and image follow the same pattern as the other portals.
- API contracts do not change.

**What must be watched:**
- **Internal routing is the main open technical risk of this decision.** It must be verified — initial navigation, a deep link, and Back with two routers active — as part of the acceptance criteria of `synkro-customers-portal`'s first routed screens, before the portal grows past a single screen.
- Contract drift between host and portal: detected by `contractVersion`.
- The stable-entry-file build step must be kept working across Angular upgrades.
- Customers' download size.

---

## Affected documents

| Document | Required change |
|----------|-----------------|
| `05-architecture/overview.md`, `01-context/overview.md`, `01-context/scope.md` | Frontend with two frameworks (HU-DOCS-82) |
| `09-microservices/service-catalog.md` | Technology of `synkro-customers-portal` (HU-DOCS-82) |
| `08-uml/diagrams/source/c4-02-containers.drawio`, `08-uml/diagram-index.md` | Customers portal in Angular, outside the group of Module Federation remotes (HU-DOCS-82) |
| `11-quality/testing-strategy.md` | Tests for the Angular portal, including initial navigation, deep link and Back under the host's base path (HU-DOCS-84) |
| `_stacks/frontend.md`, `12-ux-ui/design-system.md` | Angular portal structure, the contract with its `whenDefined` requirement, and tokens as CSS properties (HU-DOCS-85) |
| `12-ux-ui/navigation-map.md` | Portal and framework of each screen; ownership of `/customers/*` (HU-DOCS-86) |
| `15-project-control/risks.md` | Risk: internal routing of the Angular portal, open until verified during implementation (HU-DOCS-88) |
| `05-architecture/decisions/README.md` | ADR-011 row; ADR-001 and ADR-008 marked as modified (this PR) |
| ADR-001, ADR-008 | **Unchanged**: immutable |

---

## Immutability rule

Once `Accepted`, this ADR is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

---

## References

- Host, portals and single client → `05-architecture/decisions/records/ADR-008-cross-cutting-stack.md` Decision 4
- Original frontend framework → `05-architecture/decisions/records/ADR-001-architecture.md`
- Token validation and session → `05-architecture/decisions/records/ADR-006-token-validation-per-service.md`
- Customers contract → `07-api/contracts/openapi/synkro-customers-api.yaml`
- Design system → `12-ux-ui/design-system.md`
- Navigation map → `12-ux-ui/navigation-map.md`
