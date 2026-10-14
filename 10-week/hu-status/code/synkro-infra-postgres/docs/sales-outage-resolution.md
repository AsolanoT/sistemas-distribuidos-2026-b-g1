# HU-INF-02 — confirmed Sales outage diagnosis and candidate validation

Current review reference: `fix/sales-upstream-timeout` at the unchanged candidate SHA. Prior `codex/sales-upstream-timeout` remains preserved. [Prepared title/description and base/CI checks](prepared-pr-host-sales-upstream-timeout.md); no PR created, approved lock unchanged. The original execution provenance below is retained.

Continuation starts at infrastructure `02643d5c52042f61c67f101a394ca11ff6049efa`, existing `feat/postgres-bootstrap-and-root-composition`. **NOT READY for full HU acceptance.** Host correction is ready for owner manual review; infrastructure lock remains unchanged until an approved resulting merge exists.

## Confirmed cause and comparison

The two historical complete-suite failures remain in [initial evidence](evidence/final-acceptance-2026-10-12/initial-manifest.json) and [complete rerun](evidence/final-acceptance-2026-10-12/portal-complete.json). They fail in `tests/portal_delivery.py` at Python `urllib.request.urlopen(.../remotes/sales/assets/remoteEntry.js, timeout=15)` immediately after stopping the actual Sales container. No HTTP response headers arrive before the client socket deadline. The browser, federation import execution and remote recovery are not yet reached in that HTTP scenario; they did not consume those 15 seconds.

The previous [focused diagnostic](evidence/final-acceptance-2026-10-12/host-outage-diagnostic.json) made a normal entry request but did not load the complete chain/warm all nginx workers. It received 502 in 2.578s with a DNS resolution error. That path is different from attempting a TCP connection to an address already in a worker's resolver cache. No claim is made about a specific worker identity in the old evidence.

[Warm diagnostic](evidence/sales-outage-2026-10-12/warm-tcp-diagnostic.json) reproduces the timeout, with SYN_SENT still present at 2/10/14s and no DNS error. The [owning red regression](evidence/sales-outage-2026-10-12/red-warm-cache.json) further matches SYN_SENT's destination to the stopped Sales container's IPv4 address and port 80, without publishing that address. After 80 successful warmup requests, exactly one unavailable request times out in 15.031s; shell and Products remain 200, restart restores Sales 200. Warmup requests exercise successful cache state; they are not retries of a failed acceptance request.

**Confirmed defect belongs to Host's nginx configuration:** its cached upstream TCP connection attempt outlives the client contract. Nginx's [default proxy_connect_timeout is 60s](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_connect_timeout). The resolver's 10s cache lifetime does not cancel an already-started connection. The evidence does not show a frontend boundary/reset bug or a test bug, nor establish which historical PR introduced the configuration gap. No root-owned nginx implementation or assertion relaxation is introduced.

## Owning correction and TDD

Host branch [`codex/sales-upstream-timeout`](https://github.com/code-corhuila/synkro-front/tree/codex/sales-upstream-timeout), based on reviewed develop `a1fecc671ada1384dcaeeec5f59dff3c13a35e26`, preserves the original checkout and its existing branch.

- `b0ac0464f0206e3f33f10df4e8f6f1f4475ae21c`: `test(host): reproduce warm-cache Sales upstream outage`. Automatic owning deployment-contract test and real-image executable regression fail before the correction.
- `24d53684fece340968b8dccf466177416b1f5169`: `fix(host): bound warm-cache Sales upstream failures`. Only Sales proxy gets 2s connection/resolution bounds and controlled timeout-to-502/no-store handling. Asset rewrites, cache lifetime, Gateway, frontend business behavior and read/send timeouts stay unchanged.

[Green warm-cache regression](evidence/sales-outage-2026-10-12/green-warm-cache.json): same deadline/request/assertions, 502 in 2.031s, shell/Products 200 and recovered Sales 200; cleanup PASSED. This initial green image was built from the correction tree before its commit and is not labeled exact-commit evidence. The subsequent complete run below built and tested the committed candidate.

Owner commands and prepared PR description: [Host review handoff](owner-handoffs/host-outage-timing.md). Runtime regression requires the real owning images and has no private-credential requirement. Original owner checkout, migrations and CODEOWNERS are unchanged; only the isolated owning clone was edited and pushed normally. No PR was created or merged.

## Exact complete-suite result

[Complete candidate manifest](evidence/sales-outage-2026-10-12/complete-portals-candidate.json): `run-a0e88d99c69f431c9d2b2f9fd1ee2ac9`, 2026-10-13 01:52:52–01:55:25 UTC. **PASSED, exit 0**. The unchanged complete infrastructure suite was executed from exact root `02643d5c52042f61c67f101a394ca11ff6049efa`, with explicit experimental Host candidate `24d53684fece340968b8dccf466177416b1f5169`; no approved lock was rewritten.

| Owning package actually executed | Exact revision |
|---|---|
| Host candidate — awaiting review/merge | `24d53684fece340968b8dccf466177416b1f5169` |
| Auth Portal approved | `02e71fcab39a98aa14a082c68957e750c35347c0` |
| Products Portal approved | `31f1dc235e50c69030c60f5d5faca5d2c1786270` |
| Sales Portal approved | `d88babf9cd5a95bd7fb6cbae3a0db642c8df285f` |

All four actual package builds and owning coverage suites passed. Actual compiled chains: Auth 10 JS/1 CSS; Products 8 JS/1 CSS; Sales 8 JS/1 CSS. Actual absent Sales returned 502 within the unchanged 15s client limit; `/sales` shell and Products chain remained accessible. Sales's complete chain recovered after its container restart, without restarting Host. Shell exports and production inputs passed. Sales standalone `/` build and prefixed `/remotes/sales/` build both passed. No step after the earlier failure was omitted in this complete run.

HTTP delivery exercises actual packages, not browser JavaScript evaluation. The owning `App.remoteIsolation.test.tsx` additionally passes, retaining the same navigation DOM while moving from controlled Sales error to Products and back to recovered Sales without reloading the shell; its remote loaders are mocked. A real-browser federation end-to-end session was **NOT RUN**, and is not inferred from the HTTP or component evidence.

[Host CI](https://github.com/code-corhuila/synkro-front/actions/runs/38334353482), explicitly dispatched on exact candidate, **SUCCESS**: common/deployment contract, lint, build/production identity check and coverage; 46 test files passed, statements 94.75%. [Sanitized per-step record](evidence/sales-outage-2026-10-12/host-ci.json). This is owning CI, not private root integration. Infrastructure's publication CI is recorded in the final close-out; backend/Mongo/Workflow suites are retained from the previous report, not falsely marked freshly rerun.

## Cleanup and remaining gates

All three diagnosis/regression runs removed their uniquely labeled containers/network after ownership checks. Complete-suite global resource audit PASSED, zero fallback removals, preexisting identities preserved. Exact snapshots, private fixture storage and raw diagnostics removed. Sanitized manifests retained; build images may remain as cache. No persistent database or shared platform network was modified.

| Remaining gate | Responsible / next action |
|---|---|
| Host candidate is not an approved pin | Host reviewers approve and merge the prepared correction into develop; record full resulting merge SHA and CI. Infrastructure then updates only that pin and reruns affected portal verification. Current approved lock's historical failure is not reclassified PASSED. |
| Customers Portal executable delivery | Customers Portal owner publishes approved package/deployment and coordinates its Host ShellContract/entry/assets. [Executable handoff](owner-handoffs/customers-portal.md); no implementation in this continuation. |
| Local integration acceptance-method approval / private CI | Team/governance records approval before substituting local evidence for unchanged remote-integration DoD. Optional authenticated private workflow remains NOT RUN; no credential-dependent retry or workflow/control change here. |
| Full composition/manual review/documentation | After approved owners/pins, execute remaining full-root acceptance and required review/documentation. No issue closure or synkro-docs modification. |

INF-PG-01…08 and 11 retain previous scoped PASS evidence, not rerun. INF-PG-09: experimental corrected delivered-portal suite PASSED, approved-lock acceptance and complete Customers Portal still BLOCKED. INF-PG-10 remains BLOCKED full composition. INF-PG-12 remains BLOCKED review/approved delivery/policy/full acceptance/documentation. The original Mongo timeout history is preserved alongside its later complete-suite PASS; migrations and fully real Workflow/WKF-16 evidence are unchanged.
