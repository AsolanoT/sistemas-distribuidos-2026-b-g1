# Local integration evidence

Root SHA: `e8ce612ee43e52e5b0cf778fc8f9a547844abd7d`
Scope: available
Overall: NOT READY — blockers listed

| Suite | Status | Exit | Reason |
|---|---|---|---|
| unit-git-regressions | PASSED | 0 | Owning suite completed |
| bash-syntax | PASSED | 0 | Owning suite completed |
| shellcheck | PASSED | 0 | Owning suite completed |
| protected-baselines | PASSED | 0 | Owning suite completed |
| postgres-integration | PASSED | 0 | Owning suite completed |
| auth-db-regressions | PASSED | 0 | Owning suite completed |
| products-db-regressions | PASSED | 0 | Owning suite completed |
| mongo-sales | PASSED | 0 | Owning suite completed |
| mongo-configuration | PASSED | 0 | Owning suite completed |
| mongo-lifecycle | FAILED | 1 | Suite returned nonzero; private diagnostics suppressed |
| mongo-owner-sales | PASSED | 0 | Owning suite completed |
| auth-initialization | PASSED | 0 | Owning suite completed |
| sales-runtime | PASSED | 0 | Owning suite completed |
| observability | PASSED | 0 | Owning suite completed |
| portal-delivery | PASSED | 0 | Owning suite completed |
| full-prerequisites | BLOCKED | 1 | Mandatory owner deliveries absent: synkro-customers-db, synkro-auth-portal, synkro-customers-portal, synkro-workflow |
| full-platform-acceptance | BLOCKED | None | Requires approved missing owners and actual complete root acceptance suite |

Cleanup: PASSED
Local evidence does not waive unchanged INF-PG-12/DoD remote-integration acceptance.
