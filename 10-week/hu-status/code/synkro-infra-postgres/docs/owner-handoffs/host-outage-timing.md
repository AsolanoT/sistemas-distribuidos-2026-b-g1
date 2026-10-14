# Host owner handoff: full-suite unavailable-remote timing

## Latest: approved merge pinned and revalidated

[Host PR #12](https://github.com/code-corhuila/synkro-front/pull/12) is merged into develop at `0e4b8ac7768a1416bdf9513f78a21054e4c22e69`, with PR/merge CI SUCCESS. The lock now selects that exact reviewed merge, not a later branch tip. [Approved integration evidence](../approved-host-integration.md): complete portal suite PASSED on root `72c1645f124eaf0245a009af7e8d5a2495d18bab`; owned resources/snapshots cleaned, but strict global audit FAILED due shared-daemon inventory changing during concurrent Customers browser testing. That audit is not counted as passed.

HU-CLI-04 is in implementation by Jordan; no candidate pin/branch is integrated. Order now: approved coordinated Customers Portal/Host PR merges → verify the new Host preserves PR #12's correction → pin exact resulting approved SHAs → affected delivery/ShellContract checks → complete root acceptance in an isolated validation window → method-policy/manual review and separate documentation. The local-method proposal remains pending. Historical candidate preparation below is retained.

## Current: confirmed cause, published correction awaiting review

[Confirmed diagnosis, TDD and complete candidate suite](../sales-outage-resolution.md) supersede the unresolved assessment below without erasing its evidence. Warm-cache TCP SYN_SENT targets the stopped Sales address on port 80; default nginx connection wait exceeds the unchanged 15s client contract. Host review branch `fix/sales-upstream-timeout`, candidate `24d53684fece340968b8dccf466177416b1f5169`, passes the real-image regression (502 in 2.031s), unchanged complete portal suite and [exact owning CI](https://github.com/code-corhuila/synkro-front/actions/runs/38334353482). The previous branch `codex/sales-upstream-timeout` is retained at exactly the same SHA; no amend/rebase/force-push/deletion occurred. Infrastructure's approved Host pin remains `a1fecc671ada1384dcaeeec5f59dff3c13a35e26`.

Prepared PR — not created:

- Title: `fix(host): bound connection timeout for unavailable Sales portal`
- Base: `develop`; head: `fix/sales-upstream-timeout`.
- Compare: [review branch against develop](https://github.com/code-corhuila/synkro-front/compare/develop...fix/sales-upstream-timeout).
- Copy-ready description and verified controls: [prepared PR](../prepared-pr-host-sales-upstream-timeout.md).
- Summary: After Sales stops with its address cached, nginx waits on a TCP handshake longer than the client delivery deadline. Set 2s connection/resolution bounds in the Sales proxy and return controlled 502/no-store on upstream timeout. Preserve routes, compiled assets, Gateway and business behavior.
- Validation: failing owning contract and actual warm-cache regression before fix; green actual 502 within unchanged 15s, accessible shell/Products, actual Sales recovery; complete four-package build/coverage/HTTP chain/standalone suite passes on exact candidate. Owning CI succeeds, 46 test files and 94.75% statements; component navigation retains the same shell DOM. Real-browser federation E2E was NOT RUN.
- TDD, pipeline and no-credential checks complete; team approval/merge remains unchecked. Related to code-corhuila/synkro-docs#239 (non-closing).

Verified current base: `develop` remains `a1fecc671ada1384dcaeeec5f59dff3c13a35e26`; candidate is two commits ahead, zero behind. Four changed files; diff whitespace check passes. No new concurrent base changes; owning workflow/CODEOWNERS unchanged. Existing successful CI is workflow_dispatch on the identical SHA under the preserved prior branch. Push to the new fix branch does not match the workflow push filter; actual pull_request CI is NOT RUN because no PR exists. Opening a PR toward develop triggers the unchanged common/deployment, lint, build/production and coverage jobs on its effective PR merge context. Recheck base/merge ref then; do not relabel existing standalone CI as PR CI.

Read-only server checks: develop is protected with enforce_admins enabled; required_status_checks is null and required approving review count is zero. Effective rules require a pull request, resolved review threads and prohibit deletion/non-fast-forward updates. Code-owner review is not server-required; unchanged CODEOWNERS identifies @ariel5253. These observations do not waive the team's manual review or establish approval. No settings changed.

Integration order: (1) authorized owner opens the prepared PR, checks its then-current develop base/effective merge ref and completes PR CI/manual review; (2) approved owner merges and records full resulting merge SHA/CI; (3) infrastructure updates only the approved Host pin; (4) revalidate affected portal delivery; (5) continue complete-composition gates and separate documentation handoff. Correction is ready for manual review; whole HU remains NOT READY. Customers Portal and acceptance-method approval are separate gates. No PR creation/merge or issue mutation occurred here.

## Historical unresolved handoff (retained)

Selected reviewed Host a1fecc671ada1384dcaeeec5f59dff3c13a35e26 (PR #11); no later head is selected or modified. Complete tests/portal_delivery.py failed twice at the GET /remotes/sales/assets/remoteEntry.js after stopping actual Sales; TimeoutError exceeded the existing 15-second client limit. Normal Auth/Products/Sales actual compiled chains and owning package suites passed. Remainder after that failure is NOT RUN, not passed.

[Full failure evidence](../evidence/final-acceptance-2026-10-12/portal-complete.json). [Focused diagnostic](../evidence/final-acceptance-2026-10-12/host-outage-diagnostic.json) with the same compiled images returned 502 in 2.578s, shell/Products remained 200 and Sales recovered 200. This focused pass does not substitute for the complete failure. A timing/cache/context-sensitive runtime branch is not yet confirmed. Failing-instance raw logs were removed during guarded cleanup; no speculative root workaround or assertion/deadline relaxation was applied.

Reviewed nginx.conf has lazy 127.0.0.11 resolver valid=10s and no explicit resolver_timeout. Nginx documents default resolver_timeout 30s, larger than the test budget: [official directive](https://nginx.org/en/docs/http/ngx_http_core_module.html#resolver_timeout). This is a configuration risk/hypothesis, not proven causal attribution of the two observed timeouts; check stale-IP proxy connection timeout as well. Do not assert PR #11 introduced the gap merely because it is observed at that pin.

Concrete owner action: reproduce full package/asset/outage suite from an exact isolated sibling layout, with all Auth/Products/Sales dependencies; record safe resolver/connect phase timings (no request bodies/tokens/env). Test cold DNS, warm cache and expired cache, absent/stopped upstream, shell/Products navigation and restored assets. Agree explicit server resolver/connect budgets below the preserved 15-second acceptance deadline and implement the smallest owning nginx/config correction with regression before fix if the cause is confirmed. Preserve public /login, /api Gateway forwarding, compiled prefixes/cache/shared exports and production identity restrictions. Publish reviewed merge evidence; infrastructure then updates only its resulting pin and revalidates this scenario. No owner implementation is copied into infrastructure.

Until the complete suite passes, this acceptance check remains FAILED. All owned cleanup passed and original Host/Sales business sources remain unchanged.
