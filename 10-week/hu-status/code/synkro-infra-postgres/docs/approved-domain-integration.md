# Approved Customers DB and Workflow integration — 2026-10-12

Starting branch feat/postgres-bootstrap-and-root-composition at 2a8a486e0e7d4a81d4e20cc7d2e59ce8ec04952a. Actual affected engine/service run tests committed root **1e9ed4b7d788b6b983d8cff7f39d537538ce4623**. The later independent Auth fixture is tested at 121639d9c854deec30467616cf9b06ca19fd797c; startup sequencing and local-plan prerequisites have separate targeted regressions. Database runner contracts, selected lock and real PostgreSQL/Workflow test implementation are unchanged since the recorded engine run. Do not relabel that run as final-HEAD evidence. See [sanitized manifest](evidence/approved-domains-2026-10-12/manifest.json). No entire-platform or Mongo lifecycle rerun was performed.

## Approved provenance and immutable lock

| Delivery | Approved merged PR | Resulting SHA | Current integration |
|---|---|---|---|
| Customers DB | [#3](https://github.com/code-corhuila/synkro-customers-db/pull/3) | a23ba04f94ff0f150c5bafd9801cc0c6d9e98bd7 | PASSED: owning runner, 7 versions and no-op, shared-engine permissions |
| Workflow | [#4](https://github.com/code-corhuila/synkro-workflow/pull/4) | 45aa244251851fda46212c5b6338668daaa683be | PASSED: owning runner, 5 versions/no-op, restricted real service/database health |

Both PRs merged into develop at 20:00:16Z and 20:01:54Z respectively. PR heads were 9d6cc0dc85a3b3cd43eb07e355c500ecb7fc2811 and 0afd8cde592c3efa5b44b63026001b0c262d4b2b; neither is substituted for its resulting merge. PR CI passed: Customers common/migration-rebuild, Workflow common/build-test-architecture/real-process-recovery. Exact resulting merge CI also completed SUCCESS: [Customers run 38301369226](https://github.com/code-corhuila/synkro-customers-db/actions/runs/38301369226) and [Workflow run 38301556708](https://github.com/code-corhuila/synkro-workflow/actions/runs/38301556708). Approval is stated by the user; reviews API returned [] for both, so formal GitHub review records are not claimed. Merged status alone is not presented as recorded reviewer approval.

Only those two pins changed. The six previous Auth DB, Products DB, Products Portal, Sales API, Host and Sales Portal approved merge pins remain identical. Previous protected baseline entries are unchanged; new committed Customers/Workflow migrations and controlled rollbacks are added to the protected inventory. No owner source, historical migration or CODEOWNERS was edited.

## Integration contract and reproducible execution

Partial compose.pg-migrations.yml includes the owning Customers and Workflow deploy contracts alongside PostgreSQL/Auth/Products. Explicit migration dispatch accepts all four PostgreSQL domains. It still starts only synkro-db when selected; migrations and Workflow app startup are deliberate separate operations. Full compose includes remain mandatory, with no placeholders/optional delivery bypass.

```sh
python scripts/synkro.py migrate dev --mode postgres-migrations --domain customers
python scripts/synkro.py migrate dev --mode postgres-migrations --domain workflow
python scripts/verify_local.py --source-workspace /absolute/sibling/workspace --scope available
```

Provide the protected env/dev.env inputs before operational commands; use disposable environments for regressions, not persistent databases. Because the owner Workflow include is configured, even runner-only model loading requires its SERVICE token, app-password path and public-key path. Root derives administrator Flyway credentials in memory for tooling only. Workflow receives restricted workflow_app credentials, Auth public key and Auth-issued SERVICE token; no database administrator/Flyway inputs or private signing key. WORKFLOW_DATABASE_URL targets shared synkro-db:5432/synkro with bounded timeouts. Service remains internal HTTP 8080 on external platform. Published participant DNS defaults are retained. App migrations remain disabled.

Real affected check command was `python tests/integration.py` from the exact independent root snapshot, using all 17 locally pinned snapshots, task-exclusive PostgreSQL/Workflow image, containers, network and volumes. Temporary RSA public key and token fixture are used solely for service startup; no participant/business calls or controlled saga acceptance occur. Existing guards and timeout bounds remain intact.

## Verification and TDD

Two new root regressions first FAILED: absent includes and rejected customers/workflow partial-mode dispatch. After the fix both PASSED. Three further regressions exposed missing local-plan prerequisites, unwanted Workflow credentials in the Auth fixture, and implicit Workflow startup during migration-only preparation. All five new tests and all 19 existing operation tests PASSED on the final code revision c16588384f7588ad0c9b6bfaa3c1725504edf8f2. Migration-only up now targets synkro-db; Workflow startup stays deliberate after migrations. The Auth fixture uses only the actual PostgreSQL/Auth owning include, not an invented service. Initial sandbox-only temporary-directory restrictions produced errors in the existing unit invocation; rerunning the same tests in the authorized normal temporary environment passed without assertion/code weakening.

| Affected check | Result | Evidence |
|---|---|---|
| Protected baselines | PASSED, exit 0 | All selected owner/root blobs, including new approved inventory |
| Real first migration | PASSED | Auth 17, Products 17, Customers 7, Workflow 5 successful versions |
| Second migration | PASSED | Zero additional versions for every domain |
| Independent histories | PASSED | Each owner schema history count verified; no public history; legacy/checksum rejection retained |
| Effective permissions | PASSED | Four real app logins: own INSERT/UPDATE/SELECT; every cross-domain SELECT/UPDATE denied; own DELETE/TRUNCATE/DDL denied; audit append-only |
| Workflow contract/startup | PASSED | Owning image built, internal 8080/platform, restricted secret input, no Flyway administrator app environment; real PostgreSQL health returned ok |
| Existing PostgreSQL safeguards | PASSED | Bootstrap/no-op/failures, bounded bad-auth/down-engine, persistence/environment isolation, disposable backup/restore |
| Independent Auth initialization | PASSED, exit 0 | Exact root 121639d9c854deec30467616cf9b06ca19fd797c: packaged CLI, full owner Maven/coverage/initialization/concurrency/rollback suite; guarded cleanup passed; [evidence](evidence/approved-domains-2026-10-12/auth-fixture.json) |
| Complete prerequisites | NON-SUCCESS, exit 1 | Original execution status FAILED retained; delivery assessment BLOCKED by Auth/Customers Portal, confirmed from exact locked Git objects |
| Full saga with all actual services | BLOCKED / NOT RUN | Locked Customers API still structural lookup; no real Customers acceptance |
| Complete platform | BLOCKED / NOT RUN | Auth/Customers executable portal packages absent |
| Mongo complete lifecycle | HISTORICAL FAILED / NOT RUN here | Two successful diagnostic bootstraps do not supersede the failure |

Guarded cleanup **PASSED**: all task-owned containers/networks/volumes and snapshots/private diagnostics removed; preexisting resource identities preserved. Build images/cache retained. Sanitized manifest remains; no source snapshot, temporary secret or raw child logs are committed.

## Separate blockers and next actions

| Boundary | Status | Next action |
|---|---|---|
| Customers DB integration | READY FOR REVIEW | Review this exact root integration evidence and approved pin; do not recreate Customers migrations |
| Workflow infrastructure integration | READY FOR REVIEW | Review runner/shared-engine/runtime configuration and evidence; preserve owner behavior |
| Fully real register-sale saga | BLOCKED | Customers API owner delivers approved authenticated customers:read active/inactive/missing lookup; then Workflow owner verifies real normal/compensation/recovery against all actual participants |
| Complete composition | BLOCKED | Auth Portal and Customers Portal owners deliver executable packages/deployment/Host contracts; approved resulting pins then trigger complete acceptance |
| Mongo complete lifecycle | UNRESOLVED historical FAILED | When a stable isolated test context and safe owner phase diagnostics are available, rerun the complete published lifecycle at approved pins; retain nonzero failure if it recurs. No timeout increase or bootstrap-only substitution |
| Validation policy/private CI | PENDING REVIEW | Approve local-method substitution explicitly or provide effective approved private access and complete remote integration; green root-only CI is not full integration |
| Principal review/documentation | DRAFT | Resolve required acceptance gates, review principal change and separate synkro-docs handoff; no external documentation edit or issue closure here |

No PR was created/merged, no issue closed, no branch promoted, and synkro-docs remains read-only. HU-INF-02 is incomplete.
