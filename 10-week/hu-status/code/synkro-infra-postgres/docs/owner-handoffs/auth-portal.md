# Owner handoff: Auth executable portal and production integration

Current delivery: approved merged Auth Portal PR #2 at 02e71fcab39a98aa14a082c68957e750c35347c0 and Host PR #9/#10/#11 through a1fecc671ada1384dcaeeec5f59dff3c13a35e26 are pinned. The missing-delivery assessment below is historical. Latest acceptance evidence is recorded in final-acceptance-refresh.md; approval of packages does not replace actual root/public-login/Gateway tests.

## Preserved original design handoff


Checked 2026-10-12. Recipients: `code-corhuila/synkro-auth-portal` maintainers, coordinating public authentication capabilities with the Host owner. Related to [HU-INF-02 #239](https://github.com/code-corhuila/synkro-docs/issues/239); no Auth functionality is implemented by this handoff.

## Published evidence and verified history

`origin/develop` remains `d478fba7344f3a778da4f122dd5aefe481a1d32a`. [PR #1](https://github.com/code-corhuila/synkro-auth-portal/pull/1) delivers common files and `.env.example`; there is no executable package, lockfile, source build, Dockerfile or deployment. No later delivery was found in its PR inventory.

[HU-DOCS-92 #223](https://github.com/code-corhuila/synkro-docs/issues/223) is CLOSED and verifies login ownership/session documentation, explicitly without implementation. No executable Auth Portal implementation story was verified in the current all-state synkro-docs issue inventory. Confirm its owner story before work; do not reuse the documentation issue as evidence of a shipped application.

## Available design

At published documentation main `61056c93e6e0783a9199bf56778e9494739bc458`:

- [Frontend stack](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/_stacks/frontend.md) and [ADR-008](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/05-architecture/decisions/records/ADR-008-cross-cutting-stack.md): React/Vite federation, one host-owned client/session, separate owning package and build.
- [Authentication](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/07-api/authentication.md), [Auth OpenAPI](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/07-api/contracts/openapi/synkro-auth-api.yaml), [navigation](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/12-ux-ui/navigation-map.md), [wireframes](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/12-ux-ui/wireframes.md) and [testing strategy](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/11-quality/testing-strategy.md): portal collects credentials; host performs authentication, consumes tokens and returns identity/common errors.
- [ADR-014](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/05-architecture/decisions/records/ADR-014-admin-only-registration-and-initial-administrator.md): user registration is an ADMIN operation; initial administrator creation is a separate approved backend/operator CLI, never a public portal bootstrap.
- [Technical backlog TD-010/011](https://github.com/code-corhuila/synkro-docs/blob/61056c93e6e0783a9199bf56778e9494739bc458/15-project-control/technical-backlog.md): renewal policy still needs ratification and broad revocation scope remains unresolved. Merged guidance is not an Accepted ADR or executed implementation.

## Required delivery and Host dependency

Provide real `package.json`, versioned lockfile, source/type declarations, build/test scripts, owning `deploy/Dockerfile`, `deploy/nginx.conf` and `deploy/compose.yml`. Service DNS `synkro-auth-portal`, internal HTTP 80, external `platform`, no root published portal port; preserve owner context. Entry is uncached, CORS allows the configured browser host without credential cookies, all compiled JS/CSS resolve through the agreed delivery base. Host shell-entry/origin URLs must be browser-accessible. No DB credentials, service tokens or private signing key in portal build/environment/mounts.

Preserve federation `authPortal/App` default React component for the existing protected `/users` and `/service-tokens` registry; production `/login` must load publicly without an existing session. Agree the login export/capability contract with Host before implementation. React/react-dom compatibility must match the actual locked Host runtime. Consume shared `shell/apiClient` and identity-only `shell/session`; Auth login must use a separate host-owned authentication capability returning identity/error, not raw token ownership.

The approved Host pin `3cd1e19e5127726e5bc73862fdcf132d901bd3de` currently exposes only `./apiClient` and `./session`. Its production `/login` renders `LoginUnavailable`; Auth remote address is hardcoded `http://localhost:5174/assets/remoteEntry.js`. There is no production `VITE_AUTH_PORTAL_ENTRY` consumer or Auth proxy route. These are concrete Host owner dependencies, not solved by supplying the portal alone. Coordinate reviewed Host/root configuration changes when delivery exists; do not recreate approved Products/Sales corrections or enable `VITE_DEV_SIGN_IN` to conceal the gap.

## Evidence required before root integration

1. Red-before-green owner build/deployment regressions and full existing suite/coverage gate on an exact published SHA; install/build from the real lockfile with `npm ci`.
2. Real owning image plus compiled remote entry/JS/CSS through Host; verify internal 80/platform, base paths, cache/CORS and browser shell imports, shared React and production development-sign-in exclusion. The general design deployment table still lists portals at 8080: root's already validated HTTP-80 delivery is the concrete integration contract; reconcile that stale table in the separate documentation handoff.
3. Browser/component integration: public credential form without a session; success updates the single host session and returns to a permitted requested route; bad login shows generic credentials error with no refresh/retry loop; outage shows unavailability; 403 shows denied. No portal token storage/client/refresh timer.
4. Prove remote unavailable does not break shell/other portals and supported recovery works; preserve Products/Sales isolation tests. Verify ADMIN-only registration and no public self-registration or initial-admin form.
5. For lifecycle behavior included by the agreed Host owner scope, test only the adopted policy: concurrent refresh/late response after logout/tab recovery require explicit policy ratification first. Do not assert immediate revocation of issued stateless JWTs without resolving TD-011.
6. Supply approved PR URL/resulting full merge SHA and exact CI steps for portal and coordinated Host changes; root then pins actual approved revisions and validates full delivery. Documentation completion and common-file CI are not application evidence.

## Decisions pending

Host/Auth owners must agree the public login export, typed authentication capability and coordinated route/build inputs. Proposed `/remotes/auth/` needs approval and matching compiled base/proxy tests; it is not an implemented route. Confirm owner story/screen scope. TD-010 ratification (including renewal margin) and TD-011 revocation boundary need design-owner decisions, not invented mechanisms/ADR IDs. Keep existing token lifetimes/storage policy and backend authority; architecture ownership is established even though its complete production implementation is missing.

Clears Auth Portal's portion of INF-PG-09/10/12 only after the coordinated executable delivery passes; principal infrastructure remains draft meanwhile.
