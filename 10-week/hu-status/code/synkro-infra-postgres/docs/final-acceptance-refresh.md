# HU-INF-02 — final acceptance refresh, 2026-10-12 (America/Bogota)

Current delivery split: [verified partial scope, isolated audit and review cuts](partial-delivery-review.md). Delivery 1 is coherent but PR #2 exceeds the 400-code-line gate; no exception is authorized. Portal suite and strict isolated-daemon audit passed. Delivery 2 retains Customers Portal/coordinated Host, full acceptance and unapproved local-method adoption. Original results/statements below are historical. HU-INF-02 must remain OPEN; no full-platform acceptance.

Current continuation: [approved Host PR #12 pin and exact portal revalidation](approved-host-integration.md). Delivered portal suite PASSED, scoped cleanup verified, global shared-daemon audit FAILED during concurrent resource changes. HU-CLI-04 and [method adoption](local-integration-approval-proposal.md) remain pending. Previous candidate, failure and backend evidence below is preserved, not freshly rerun.

Latest continuation: [confirmed Sales outage resolution](sales-outage-resolution.md). The corrected Host candidate passes the complete portal suite and owning CI; approved lock stays unchanged pending review/merge. Customers Portal and acceptance-method approval remain separate blockers. This original report and all historical failures/results below are retained; **NOT READY for full HU acceptance**.

**NOT READY.** Starting branch feat/postgres-bootstrap-and-root-composition at 1d4f99b4d394c81a19f61723f93c75ca87278065. No PR/issue/promotion action or synkro-docs edit was performed. Final published SHA and automatic CI are recorded in the standalone close-out report. Real tests use the exact revisions below; they are not relabeled as tests of a later documentation commit.

## Reviewed merges and executed dependencies

Customers API [PR #3](https://github.com/code-corhuila/synkro-customers-api/pull/3), [#4](https://github.com/code-corhuila/synkro-customers-api/pull/4), [#5](https://github.com/code-corhuila/synkro-customers-api/pull/5), [#6](https://github.com/code-corhuila/synkro-customers-api/pull/6), [#7](https://github.com/code-corhuila/synkro-customers-api/pull/7) culminate in 58a0ef9f6fc05b788b2e65002468cd9c14783540, with [exact merge CI success](https://github.com/code-corhuila/synkro-customers-api/actions/runs/38325695474).

Auth Portal [PR #2](https://github.com/code-corhuila/synkro-auth-portal/pull/2): 02e71fcab39a98aa14a082c68957e750c35347c0, [merge CI success](https://github.com/code-corhuila/synkro-auth-portal/actions/runs/38316727481). Host [PR #9](https://github.com/code-corhuila/synkro-front/pull/9): b0388570818c0bb031248bc65177c88a87dbf678; [#10](https://github.com/code-corhuila/synkro-front/pull/10): 5b5d18e8f26a847a55ea1bd5bab593b57fbe933e; [#11](https://github.com/code-corhuila/synkro-front/pull/11): a1fecc671ada1384dcaeeec5f59dff3c13a35e26, [merge CI success](https://github.com/code-corhuila/synkro-front/actions/runs/38317487523). GitHub compare confirms prior approved Host is an ancestor: ahead 8, behind 0. Later original checkout heads were not selected. Only these three pins changed; all other approved pins/protected migrations/CODEOWNERS remain unchanged.

| Selected repository | Full executed/selected revision |
|---|---|
| synkro-infra-mongo | `a19e2d564f938298c057d41ca7a6f6e456e22637` |
| synkro-auth-db | `5e481dba156db6f2febb00427efba637002d9a0c` |
| synkro-products-db | `0beae79920d9af83865bdebaf6b316a2b2a57592` |
| synkro-customers-db | `a23ba04f94ff0f150c5bafd9801cc0c6d9e98bd7` |
| synkro-sales-db | `9cfbde7db4bea7bacad70370c60f91f8eb917c04` |
| synkro-auth-api | `04ae6ab92daf474fb5c38ae37842d1690e7584b0` |
| synkro-customers-api | `58a0ef9f6fc05b788b2e65002468cd9c14783540` |
| synkro-products-api | `b6b379b314716e201833be0d854953a69452559f` |
| synkro-sales-api | `70bdbaba3783bfb974c338b8a460e6e9b7e5c8dd` |
| synkro-workflow | `45aa244251851fda46212c5b6338668daaa683be` |
| synkro-worker | `7827aa160d34c9ba1f70aa0481b2bf32accb42f0` |
| synkro-api-gateway | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` |
| synkro-front | `a1fecc671ada1384dcaeeec5f59dff3c13a35e26` |
| synkro-auth-portal | `02e71fcab39a98aa14a082c68957e750c35347c0` |
| synkro-customers-portal | `875b269d217f17568b8125c4fd805e825f01867d` |
| synkro-products-portal | `31f1dc235e50c69030c60f5d5faca5d2c1786270` |
| synkro-sales-portal | `d88babf9cd5a95bd7fb6cbae3a0db642c8df285f` |

Selected is distinct from executed: Worker/Customers Portal complete-root startup is NOT RUN because the mandatory full composition is unavailable; Customers Portal has no executable delivery. Main manifest records all immutable snapshots and per-suite prerequisites. Actual functional joint evidence records the backends and DB runners it executed.

## Exact execution and results

[Initial manifest](evidence/final-acceptance-2026-10-12/initial-manifest.json) tests b17a805a5e377a1e02cace71f43507515e1945c8: 13 PASSED, 3 FAILED, 2 BLOCKED. All original results are preserved. [Latest assessment](evidence/final-acceptance-2026-10-12/latest-assessment.json) references later targeted results without rewriting that initial failure.

PASSED initially: 69 unit/Git tests, Bash syntax, ShellCheck, all protected blobs, PostgreSQL integration, owning Auth/Products DB regressions, Mongo/Sales, published Mongo configuration and owner Sales, packaged Auth ADMIN/Maven suites, Sales runtime/Go and observability. Fresh PG migration histories: Auth 17, Products 17, Customers 7, Workflow 5; repeat 0 additional versions each. Real app users prove own operations, cross-domain read/write denial, forbidden deletion/truncate/DDL and append-only Auth audit. Persistence, environmental isolation, guarded backup/restore, bad-auth/down-engine bounds and qa/main identity/volume/backup guards pass.

The initial preparation guard rejected CRLF bytes differing from the committed LF verifier before any engine mutation. Normalizing the working verifier to committed bytes retained the exact-code safeguard; its result was not represented as passing engine evidence.

### Mongo complete lifecycle

Initial instrumented lifecycle FAILED before bootstrap: Windows child NODE_OPTIONS could not load the tracer path. A real subprocess/sentinel regression failed first; slash-normalized quoted path correction passed. This was an infrastructure diagnostic defect, not the historical Mongo stall.

[Full lifecycle revalidation](evidence/final-acceptance-2026-10-12/mongo-complete.json) PASSED at root 5d43de43dd12117424f603889c718270cabe7ede and unchanged Mongo a19e2d564f938298c057d41ca7a6f6e456e22637. It ran the entire published tests/integration.mjs: repeat bootstrap/grant preservation, authenticated rs0 PRIMARY probes, stop/start/restart persistence, independent backup/restore, step-down/non-PRIMARY health and bounded waits, wrong-password/admin/key/drift rejection, secrets absent from logs/args. [Safe child phase trace](evidence/final-acceptance-2026-10-12/mongo-complete-phases.jsonl) records executable categories/deadlines/durations only. No 180-second child limit or owner implementation changed. The historical timeout remains preserved with cause unconfirmed; this fresh complete pass, unlike two bootstrap-only passes, supplies current full-lifecycle evidence. Monitor/diagnose exact phase if it recurs; do not claim a causal Mongo fix.

### Fully real Workflow and public login

Initial normal actual sale PASSED; replay/restart extension FAILED. Random host port assignments changed after Docker restart; the fixture refreshed its endpoint without changing assertions or the service. Revalidation records restartEndpointChanged=true and PASSED at root 4a4d976ac57868c2a7e4935ee7820d388e996cc3.

[Joint real evidence](evidence/final-acceptance-2026-10-12/workflow-real.json): actual Auth-issued human/SERVICE tokens; actual Customers/Products/Sales/Workflow packages and owner DB migrations; no substitute participant HTTP server. Active customer: stock 20→18, one sale/reservation. Replay: same saga, no extra effects. Inactive and missing customers: failed validate-customer, stock/sales/reservation unchanged. Confirmed real Sales overflow rejection: real Products compensation, stock 18/sales 1/released 1. Pause actual Sales after durable reservation, kill actual Workflow, unpause/restart: completed with stock 17, sales 2 and exactly one reservation for recovered saga. Completed-state restart also retains sale identity. This proves functional interoperability; the selected Products revision's bearer-shape authentication limitation is explicitly retained and is not platform-security approval.

Actual Host /login and internal Auth remote entry are served; Host /api routes through actual Gateway to actual Auth: valid credentials 200 with real pair, wrong password 401. No token values are evidence. Root-owned include overlays render separate restricted users/password files and bounded JDBC URLs; only Auth receives its private signing key. [Delivered application model](evidence/final-acceptance-2026-10-12/initial-application-model.json) uses dummy inspection inputs. Legacy SPRING_DATASOURCE_URL remains an owning interpolation prerequisite even though overlays assign separate Auth/Customers URLs. Actual Auth Portal service is auth-portal, DNS alias synkro-auth-portal, internal HTTP 80. Production dev sign-in is false.

[WKF-16 owner reconciliation handoff](workflow-WKF-16-handoff.md) supplies these facts for existing OPEN #243; no owner story/issue was closed or changed.

### Portal outage remains failed

All four real package build/regression/coverage steps and normal compiled asset chains PASSED: Auth 10 JS/1 CSS, Products 8 JS/1 CSS, Sales 8 JS/1 CSS. Public Auth/Gateway login passed separately. The complete portal suite FAILED twice at unavailable Sales: urllib TimeoutError after 15 seconds, before controlled-error/recovery/standalone remainder could execute. [Complete targeted rerun](evidence/final-acceptance-2026-10-12/portal-complete.json) preserves failure and those unexecuted steps; no deadline/assertion was weakened.

[Focused outage timing diagnosis](evidence/final-acceptance-2026-10-12/host-outage-diagnostic.json), using the same approved compiled images, PASSED its observed case: missing Sales 502 in 2.578 seconds, shell 200/0.016s, Products 200/0.031s and Sales recovery 200/0.031s. It does NOT supersede two full-suite failures. Exact failing runtime branch is still unconfirmed; the Host has lazy DNS with no explicit resolver_timeout or proxy connection budget. [Host owner handoff](owner-handoffs/host-outage-timing.md) proposes safe diagnosis and explicit reviewed budgets with cold/warm cache regression. No Host source/pin was replaced or changed to an unreviewed candidate.

## Cleanup and acceptance policy

Every completed run reported guarded cleanup PASSED: no task-owned containers/networks/volumes remain, private diagnostics/snapshot/secret directories removed, preexisting identities preserved. Build images/cache can remain deliberately; no shared environment/volume deletion occurred. Only sanitized manifests/traces/model fields are committed.

Automatic CI validates primary common/unit/static/protected safeguards. Private workflow_dispatch retains authentication prerequisite and applicable real checks, now including actual saga/login. Actions secret name inventory is empty; no failing private dispatch/retry was launched. Owner action if remote integration remains required: synkro-infra-postgres Settings → Secrets and variables → Actions → New repository secret, SYNKRO_DEPENDENCY_READ_TOKEN; approved fine-grained credential scoped to synkro-infra-mongo Contents: Read-only plus organization authorization when required. Never supply its value in chat or artifacts.

DoD at documentation 61056c93e6e0783a9199bf56778e9494739bc458 requires all acceptance criteria, real HTTP integration, local Docker Compose, green applicable CI, team review and documentation. Live #239 remains OPEN; checked boxes in its body are not fresh execution or an approved local-method exception. No comments record approval of local evidence replacing INF-PG-12's original integration-CI requirement. Team/governance must approve that adjustment or satisfy the retained remote requirement. Missing/failed/not-run cases are not passes. Full root build/start is NOT RUN because Customers Portal remains mandatory and absent; this is not a full browser business E2E or complete platform-security certification.

## Remaining blockers and next actions

| Blocker | Responsible | Concrete action |
|---|---|---|
| Customers Portal absent | Customers Portal owner, coordinating Host | Publish approved executable Angular custom element/deploy/assets/ShellContract evidence; coordinate VITE_CUSTOMERS_PORTAL_ENTRY/root prefix; merge approved Host consumer if needed; then infrastructure pins resulting SHAs and tests real full startup |
| Full portal unavailable-Sales scenario fails | Host owner + infrastructure test maintainer | Reproduce complete suite with cold/warm cache and safe DNS/connect diagnostics, agree server/client budgets preserving 15-second acceptance; reviewed owner correction if needed; root reruns affected suite only |
| Original private CI/local-method requirement | Infra repository owner + team/governance | Approve recorded validation-method adjustment or configure minimum approved private read access and prove actual retrieval/integration; automatic green is insufficient |
| Principal review/full documentation | Team reviewer/documentation owners | After full acceptance, review principal change and publish separate deployment/local setup/story/NFR handoff; no automatic waiver/promotion/closure |

Current Mongo complete lifecycle and real Customers/WKF functional scenarios are resolved current-execution gates. Historical failures stay visible. HU-INF-02 remains incomplete.
