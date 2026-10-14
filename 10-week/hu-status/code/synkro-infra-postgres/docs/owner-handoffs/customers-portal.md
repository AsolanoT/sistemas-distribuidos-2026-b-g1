# Owner handoff: Customers executable Angular portal and integration

## Current executable handoff — pending owner delivery

Latest owner status supplied by user: **HU-CLI-04 in implementation by Jordan**, including coordinated Customers Portal and Host changes. No candidate branch is integrated or pinned here. Approved Host now includes PR #12 at `0e4b8ac7768a1416bdf9513f78a21054e4c22e69`; the next approved HU-CLI-04 Host merge must retain that correction. [Exact integration/gates](../approved-host-integration.md). Existing contract requirements below remain the owner handoff, not evidence of a delivered package.

Checked 2026-10-12: only merged PR #1 exists and no open PR is published. Locked develop remains 875b269d217f17568b8125c4fd805e825f01867d; no executable package/deployment was approved. Customers API is now approved through PR #7 at 58a0ef9f6fc05b788b2e65002468cd9c14783540; the prior placeholder assessment below is historical. Host is approved through PR #11 at a1fecc671ada1384dcaeeec5f59dff3c13a35e26. No owner functionality is implemented in infrastructure.

Owner action: publish a reviewed executable Angular custom-element package, build/test commands, Dockerfile and deploy/compose.yml. Preserve tag/DNS synkro-customers-portal, internal HTTP 80/platform, stable entry and actual complete asset URLs. Before approving an asset prefix, coordinate the published Host customersPortalEntryUrl and VITE_CUSTOMERS_PORTAL_ENTRY (currently defaults to http://localhost:5177/remoteEntry.js); Host currently has no delivered root Customers asset proxy, so that integration must be reviewed explicitly. Do not invent a route by serving a placeholder. Prove whenDefined ordering, property-injected ShellContract version 1, unsubscribe/unmount/reentry, deep links/back/refresh and remote failure isolation. Use the approved real Customers API via the Host client/Gateway for active/inactive/missing data, authorization and idempotency.

After approved owner/Host merges, infrastructure selects only their resulting SHAs, then runs `python scripts/verify_local.py --source-workspace /absolute/sibling/workspace --scope full` with protected inputs and all actual deliveries. Require real root build/start, no-op migrations, every portal asset/contract, permissions, health/recovery and clean disposal. File presence or a green subset is insufficient. Until then INF-PG-09/10/12 remain incomplete.

## Preserved original design handoff


Checked 2026-10-12. Recipients: `code-corhuila/synkro-customers-portal` maintainers, coordinating the accepted custom-element contract with the Host owner. Related to [HU-INF-02 #239](https://github.com/code-corhuila/synkro-docs/issues/239). Customers screens remain owner functionality, outside this continuation.

## Published evidence and verified history

`origin/develop` remains `875b269d217f17568b8125c4fd805e825f01867d`. [PR #1](https://github.com/code-corhuila/synkro-customers-portal/pull/1) only adds common files and `.env.example`; no `package.json`, Angular source/configuration, lockfile, owning Dockerfile or deployment exists. No later delivery was found in its PR inventory.

[HU-ARQ-24 #154](https://github.com/code-corhuila/synkro-docs/issues/154) is CLOSED and concerns the Angular-in-React spike/ADR. It does not publish this executable portal. The accepted ADR explicitly describes requirements to verify against real code rather than an implementation demonstrated in that documentation repository. Do not convert the issue's checked spike tasks into evidence of an owning build. No executable Customers Portal implementation issue was verified in the current all-state issue inventory; owner must confirm its story.

## Available design

Documentation published main is `61056c93e6e0783a9199bf56778e9494739bc458`:

- [ADR-011](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/05-architecture/decisions/records/ADR-011-angular-customers-portal.md), especially Decisions 2/3: Angular 21 zoneless custom element `synkro-customers-portal`, lazy stable entry, asynchronous registration, property-delivered `ShellContract` version 1, teardown and a documented open router risk.
- [Frontend stack](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/_stacks/frontend.md): executable owner layout, stable entry generation and one wrapped host client, no Angular HttpClient or Native Federation.
- [Customers OpenAPI](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/07-api/contracts/openapi/synkro-customers-api.yaml), [navigation](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/12-ux-ui/navigation-map.md), [wireframes](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/12-ux-ui/wireframes.md), [design system](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/12-ux-ui/design-system.md) and [testing strategy](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/11-quality/testing-strategy.md) define data/visual/test expectations. Historical MVP React screens are not this Angular package.

## Required delivery and Host dependency

Provide actual Angular source/configuration, strict TypeScript, versioned `package.json`/lockfile, build/test scripts, stable-entry generation, owner Dockerfile/server and `deploy/compose.yml`. Preserve DNS `synkro-customers-portal`, internal HTTP 80, external `platform`, no root published portal port and owning context. Serve the stable entry uncached with browser-host CORS; all compiled chunks/CSS/fonts must use the agreed asset base. The design deployment table's old 8080 portal row needs separate documentation reconciliation against the already validated root HTTP-80 portal contract.

Register the exact custom element; read its contract through `ngOnChanges`/input setter after asynchronous bootstrap. Mirror the accepted `ShellContract`: `contractVersion: 1`, `basePath`, `api.request(method, relativePath, {query, body, idempotencyKey, signal})`, identity-only `session.user()` and `navigate(path)`. No raw tokens, direct gateway URL, private key, database/service credential, direct fetch/HttpClient or second session. Fail controllably on unsupported contract version. Removing the element must destroy subscriptions/timers.

Approved Host `3cd1e19e5127726e5bc73862fdcf132d901bd3de` already lazy-loads the configured stable entry and waits for `whenDefined`, then mounts the tag in a portal-identity error boundary. Its `PortalOutlet` currently calls `createElement(tag)` without delivering `ShellContract` as a property. The runtime entry consumer is `VITE_CUSTOMERS_PORTAL_ENTRY`, default `http://localhost:5177/remoteEntry.js`; the owning Host build/Compose has not wired that production input or a Customers asset proxy. Coordinate those missing Host contracts/build inputs when the portal is delivered. Property injection is required by accepted ADR-011, not a new invented cross-framework interface.

## Evidence required before root integration

1. Red-before-green owner deployment/mounting tests, real locked package install/build, owner suite/coverage and actual image on its exact published SHA.
2. Browser delivery of stable entry and every compiled JS/CSS dependency through Host, production build input consumed, cache/CORS, internal port/platform and no secrets/client/token handling in the portal's application code. Inspect application output with tests that distinguish framework transport/runtime internals from forbidden direct API calls.
3. Delay custom-element registration and property assignment independently; prove `whenDefined` ordering and late setter initialization both work. Unsupported contract version fails only the portal. Mount/unmount/reenter without leaked subscriptions/timers or duplicate element definitions.
4. Verify one host client handles relative Customers calls, identity, common errors, correlation, idempotency and caller cancellation. No competing HTTP/session implementation. Use real approved Customers API for business E2E once available; a stub may verify the contract but cannot certify business integration. Current Customers API is still a structural placeholder.
5. Real first routed screens must prove direct `/customers/*` entry, inner deep link, refresh and Back/forward under the Host's history, plus leaving the base via host navigation. Verify designed loading/error/retry/empty/data states and accessible forms within the owner-approved screen scope.
6. Stop the portal, observe controlled error, navigate to Products/Sales without host reload and retry/reenter when available. Supply approved portal and coordinated Host PR URLs/resulting full merge SHAs plus exact CI evidence before root pinning/full composition.

## Decisions pending

Owner must confirm its executable story/screen scope, stable filename generation and compiled asset prefix. Proposed `/remotes/customers/` is a delivery proposal requiring coordinated build/proxy agreement, not an existing route. Resolve ADR-011's explicit router base-href/initial-navigation/history risk through real tests; do not assume Angular defaults solve it. Implement the already accepted contract delivery in the Host owner's scope; agree how duplicated versioned contract types stay synchronized. Existing schema/API/design sources constrain screens; no new customer model or HU ID is assigned here.

Clears Customers Portal's part of INF-PG-09/10/12 only after actual coordinated deployment evidence; other owner/access blockers remain independent.
