# Prepared Host PR — not created

Historical preparation: the user subsequently created/approved/merged [PR #12](https://github.com/code-corhuila/synkro-front/pull/12) into develop at `0e4b8ac7768a1416bdf9513f78a21054e4c22e69`. [Current approved integration](approved-host-integration.md). No duplicate PR is to be created; original text below is preserved.

Title: `fix(host): bound connection timeout for unavailable Sales portal`

Base: `develop`. Head: `fix/sales-upstream-timeout`.
Exact head: `24d53684fece340968b8dccf466177416b1f5169`.
Current verified base: `a1fecc671ada1384dcaeeec5f59dff3c13a35e26`.
[Comparison](https://github.com/code-corhuila/synkro-front/compare/develop...fix/sales-upstream-timeout).

## Copy-ready description

### Summary

When Sales stops after nginx has cached its address, the Host proxy can wait for a TCP handshake beyond the 15-second remote-asset deadline. Bound connection and resolution in the Sales location to 2 seconds and preserve controlled 502/no-store delivery for unavailable Sales.

### Changes

- Add failing-before-fix real-image warm-cache outage and owning deployment-contract regressions.
- Bound the Sales upstream connection and resolution, mapping upstream timeout to the existing unavailable-remote 502 response.
- Preserve asset routes, Gateway forwarding, frontend business behavior and the existing client deadline.

### Validation

- Before correction: the unavailable remoteEntry request times out in **15.031s**; TCP state is **SYN_SENT to the stopped Sales container on port 80**.
- After correction: the same regression receives controlled **502 in 2.031s**; Host/Products stay 200 and Sales returns 200 after restart.
- The unchanged complete portal suite passes with exact candidate Host and approved Auth/Products/Sales packages: real builds/coverage, complete JS/CSS chains, Sales available/unavailable, Host/Products isolation, recovery and standalone/prefixed Sales delivery. [Sanitized complete manifest](https://github.com/code-corhuila/synkro-infra-postgres/blob/b5a7213f667b4124197ba8f7312dd2b492f6863b/docs/evidence/sales-outage-2026-10-12/complete-portals-candidate.json).
- Owning component navigation regression retains the same shell/navigation DOM through Sales failure, Products navigation and recovered Sales without a reload. Its loaders are mocked; **real-browser federation E2E was not executed**.
- [Existing exact-SHA CI](https://github.com/code-corhuila/synkro-front/actions/runs/38334353482) succeeds: common/deployment contract, lint, build/production checks and coverage; 46 test files passed, 94.75% statements. This run is workflow_dispatch, not PR CI.
- Disposable cleanup passed; preexisting resources preserved. No timeout increase, failure retries or skipped acceptance assertions.

### Definition of Done

- [x] Tests written before implementation; red and green evidence retained.
- [x] Existing owning pipeline passes on exact candidate SHA.
- [x] No credentials, private keys or runtime environment values added.
- [ ] Actual PR CI passes on the then-effective develop merge context.
- [ ] Manual review and approval complete before merge.

Related to code-corhuila/synkro-docs#239.

## Preparation checks and integration boundary

Remote develop is unchanged at the verified base above; candidate is two commits ahead, zero behind. Diff contains only `deploy/nginx.conf`, `docs/sales-outage-validation.md`, `tests/proxy_outage.py` and `tests/test_root_deploy.py`; whitespace check passes. Workflow and CODEOWNERS unchanged. Previous `codex/sales-upstream-timeout` branch and both existing commits are preserved at the identical head.

No open PR exists for this correction at preparation time. The unchanged workflow runs pull_request checks against develop/qa/main. The new branch is outside its push filter, so no push CI is expected for this alias. No actual PR merge ref or PR CI exists yet; once the owner opens it, verify its effective base and merge ref and require the relevant checks rather than assuming the old head-only run suffices.

Read-only GitHub controls: develop protected; enforce_admins true; zero mandatory approving reviews; required_status_checks null. Effective rules require a PR and resolved review threads and prevent branch deletion/non-fast-forward updates. Code-owner review is not server-required; CODEOWNERS remains @ariel5253. Team manual review remains pending; no repository controls were changed.

Order: owner opens prepared PR → confirm current base/effective merge context and PR CI → manual review/approved merge → record full resulting merge SHA → infrastructure updates only that approved Host pin → revalidate affected portals → remaining full-platform gates/documentation. Infrastructure currently retains approved Host `a1fecc671ada1384dcaeeec5f59dff3c13a35e26`; no candidate substitution. Customers Portal and local-integration policy approval remain separate blockers. This task creates no PR, performs no merge and closes no issue.
