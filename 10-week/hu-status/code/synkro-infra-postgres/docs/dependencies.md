# Current immutable dependencies â€” HU-INF-02

Approved refresh, 2026-10-12 America/Bogota. Six approved resulting merge pins are selected; original branches/commits remain preserved.

| Repository | Selected full SHA | Status |
|---|---|---|
| synkro-infra-mongo | `a19e2d564f938298c057d41ca7a6f6e456e22637` | merged develop: PR #1 |
| synkro-auth-db | `5e481dba156db6f2febb00427efba637002d9a0c` | approved merged develop: PR #7 |
| synkro-products-db | `0beae79920d9af83865bdebaf6b316a2b2a57592` | approved merged develop: PR #7 |
| synkro-customers-db | `a23ba04f94ff0f150c5bafd9801cc0c6d9e98bd7` | approved merged develop: PR #3 |
| synkro-sales-db | `9cfbde7db4bea7bacad70370c60f91f8eb917c04` | merged develop: PR #5 |
| synkro-auth-api | `04ae6ab92daf474fb5c38ae37842d1690e7584b0` | merged develop: PR #10 |
| synkro-customers-api | `58a0ef9f6fc05b788b2e65002468cd9c14783540` | approved merged develop: PR #7 |
| synkro-products-api | `b6b379b314716e201833be0d854953a69452559f` | published-develop |
| synkro-sales-api | `70bdbaba3783bfb974c338b8a460e6e9b7e5c8dd` | approved merged develop: PR #7 |
| synkro-workflow | `45aa244251851fda46212c5b6338668daaa683be` | approved merged develop: PR #4 |
| synkro-worker | `7827aa160d34c9ba1f70aa0481b2bf32accb42f0` | published-develop |
| synkro-api-gateway | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` | published-develop |
| synkro-front | `0e4b8ac7768a1416bdf9513f78a21054e4c22e69` | approved merged develop: PR #12 (preserves prior merges) |
| synkro-auth-portal | `02e71fcab39a98aa14a082c68957e750c35347c0` | approved merged develop: PR #2 |
| synkro-customers-portal | `875b269d217f17568b8125c4fd805e825f01867d` | published-develop: deployment missing |
| synkro-products-portal | `31f1dc235e50c69030c60f5d5faca5d2c1786270` | approved merged develop: PR #9 |
| synkro-sales-portal | `d88babf9cd5a95bd7fb6cbae3a0db642c8df285f` | approved merged develop: PR #3 |

## Approved merge provenance

| Repository | Approved PR | Resulting merge SHA |
|---|---|---|
| synkro-auth-db | [#7](https://github.com/code-corhuila/synkro-auth-db/pull/7) | `5e481dba156db6f2febb00427efba637002d9a0c` |
| synkro-products-db | [#7](https://github.com/code-corhuila/synkro-products-db/pull/7) | `0beae79920d9af83865bdebaf6b316a2b2a57592` |
| synkro-products-portal | [#9](https://github.com/code-corhuila/synkro-products-portal/pull/9) | `31f1dc235e50c69030c60f5d5faca5d2c1786270` |
| synkro-sales-api | [#7](https://github.com/code-corhuila/synkro-sales-api/pull/7) | `70bdbaba3783bfb974c338b8a460e6e9b7e5c8dd` |
| synkro-front | [#7](https://github.com/code-corhuila/synkro-front/pull/7) | `3cd1e19e5127726e5bc73862fdcf132d901bd3de` |
| synkro-sales-portal | [#3](https://github.com/code-corhuila/synkro-sales-portal/pull/3) | `d88babf9cd5a95bd7fb6cbae3a0db642c8df285f` |

Both new merge trees equal reviewed candidates; affected actual portal delivery was freshly executed on approved snapshots. Four prior approved pins remain unchanged.

## Configuration consumers and owner boundaries

Root keeps one PostgreSQL, Mongo ownership in synkro-infra-mongo and domain-owned migrations. Five protected PG files, separate application versus migration identities, Auth-only private signing key, Sales application-only URI and public-key mount, bounded Mongo options, backup gates and observability contracts remain unchanged.

Host adds VITE_SALES_PORTAL_ENTRY (production build) alongside VITE_PRODUCTS_PORTAL_ENTRY, gateway input and VITE_DEV_SIGN_IN=false. Sales adds VITE_BASE_PATH through Compose/Docker/Vite, standalone / and Compose /remotes/sales/; VITE_SHELL_ENTRY_URL is a browser-accessible build input and HOST_ORIGIN is browser-origin runtime CORS. Internal Sales HTTP 80/platform has no published port or credential mounts. Products remains internal HTTP 80 at /remotes/products/. No Docker-internal DNS is used as a browser entry.

Customers API remains a structural placeholder at its locked revision. Customers DB and Workflow persistence/runners are now approved merged deliveries; this does not establish fully real saga acceptance. Auth/Customers executable portal packages remain absent. See approved-domain-integration.md for current evidence and separate blockers. No fake migration/container or optional include was introduced. Sales Portal's prior root compatibility defect is fixed in approved merged d88babf9cd5a95bd7fb6cbae3a0db642c8df285f; original cab684e remains unchanged.

Private Mongo CI requires the approved repository Actions secret SYNKRO_DEPENDENCY_READ_TOKEN, fine-grained Contents: Read-only limited to synkro-infra-mongo with organization authorization. Values are never requested in chat or copied from local credentials. Actual required root retrieval must pass before subsequent mandatory gates can execute.

## Local retrieval without repository administration

The current local method uses authorized sibling Git objects through scripts/verify_local.py. All 17 locked objects were available even where source branches point elsewhere. No source branch/index/working tree/remotes are reset; immutable copies are independent object stores. dependencies.lock.json and protected-files.lock.json remain byte-for-byte unchanged. The private Mongo token requirement above applies only to explicitly dispatched remote integration, not local execution or automatic root checks. Available checks do not approve missing owner deliveries or waive unchanged INF-PG-12. See local-validation.md for commands, scope/exits, evidence and policy review.

## Approved Customers and Workflow refresh

- Customers DB [PR #3](https://github.com/code-corhuila/synkro-customers-db/pull/3): resulting merge a23ba04f94ff0f150c5bafd9801cc0c6d9e98bd7.
- Workflow [PR #4](https://github.com/code-corhuila/synkro-workflow/pull/4): resulting merge 45aa244251851fda46212c5b6338668daaa683be.

Both merged into develop; PR CI passed. Approval is confirmed by this continuation's user instruction; GitHub reviews API returned no formal review records, so formal reviewer approval is not inferred. The six previous approved pins remain unchanged. New SQL/rollback baseline entries record only approved committed blobs; historical baseline entries are retained unchanged.

Partial postgres-migrations mode now includes both owning deploy/compose.yml contracts and permits explicit customers/workflow migration. Workflow SERVICE token/public-key/app-password inputs are required even while configuring its owning include; do not replace these with administrator credentials. Workflow uses one shared synkro-db, internal HTTP 8080, external platform, a read-only application password and public key, and no app-start migrations. The runner remains tooling-only with administrator inputs. Default published participant DNS is synkro-customers-api/synkro-products-api/synkro-sales-api:8080. No participant stub is included by root.

## Latest reviewed APIs and public login

Customers API PR #3 through #7 culminate in reviewed documentary merge 58a0ef9f6fc05b788b2e65002468cd9c14783540, not a later unreviewed checkout head. Auth Portal PR #2 selects 02e71fcab39a98aa14a082c68957e750c35347c0. Host PR #9/#10/#11 selects a1fecc671ada1384dcaeeec5f59dff3c13a35e26, eight commits ahead with zero behind the prior approved Host pin. Exact merge CI is green for all three; previous resulting merge provenance remains historical and is not erased. All other pins, including Customers DB/Workflow and the historical Mongo baseline, remain unchanged.

Root-owned include overlays separate Auth and Customers JDBC URLs, application users and protected password files; Customers receives only Auth's public key. The owning Auth signing-key mount is preserved. Auth Portal's actual service name is auth-portal, with DNS alias synkro-auth-portal and internal HTTP 80. Host serves /login and /remotes/auth/, forwards /api/ through the shipped Gateway, and keeps development identity disabled. Customers Portal is still absent and required by full compose; no optional include or placeholder replaces it. See final-acceptance-refresh.md for exact executed results and pending acceptance-method review.
