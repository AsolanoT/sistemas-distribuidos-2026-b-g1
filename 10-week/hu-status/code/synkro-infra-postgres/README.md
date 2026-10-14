# Synkro PostgreSQL and root infrastructure

Latest refresh: [exact results and blockers](docs/final-acceptance-refresh.md). Reviewed Customers API/Auth Portal/Host deliveries are pinned. Complete Mongo lifecycle and real WKF-16 revalidations passed. Portal outage suite FAILED twice; Customers Portal and private access/policy approval remain pending. Earlier assessments below are historical. **NOT READY; principal remains draft.**


Current approved-delivery refresh: [Customers DB and Workflow integration](docs/approved-domain-integration.md). Their approved resulting merge pins/runners replace the earlier missing-owner assessment retained below as historical evidence. Auth/Customers Portal packages still block full composition; Customers API blocks fully real saga acceptance. The historical mongo-lifecycle failure remains FAILED; two successful targeted bootstrap observations do not supersede it. Principal infrastructure remains draft pending full acceptance, Mongo lifecycle revalidation, policy review and documentation.


Current approved-delivery refresh: [Customers DB and Workflow integration](docs/approved-domain-integration.md). Their approved resulting merge pins/runners replace the earlier missing-owner assessment retained below as historical evidence. Auth/Customers Portal packages still block full composition; Customers API blocks fully real saga acceptance. The historical mongo-lifecycle failure remains FAILED; two successful targeted bootstrap observations do not supersede it. Principal infrastructure remains draft pending full acceptance, Mongo lifecycle revalidation, policy review and documentation.


Candidate implementation of [HU-INF-02](https://github.com/code-corhuila/synkro-docs/issues/239). **Complete platform acceptance is blocked.** See [verification](docs/verification.md), [dependencies](docs/dependencies.md) and the [documentation handoff](docs/synkro-docs-handoff.md).

Part of the **SynkroTech SAS Sales Management System** â€” organization `code-corhuila`.
Governance and documentation live in [`synkro-docs`](https://github.com/code-corhuila/synkro-docs).

## Branching

Three permanent branches. **None of them accepts a direct commit** â€” you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `synkro-docs`.

## Configuration and prerequisites

Use Linux containers, Docker Compose 2.24.4+ (include and test overrides), Python 3.11+, Node.js 22+ for the Mongo owner, and Bash for optional wrappers. Native Windows PowerShell is supported through Python. Local evidence used Docker Engine 29.3.1 and Compose 5.1.1. Install test dependencies with `python -m pip install -r requirements-test.txt`.

Repositories must be siblings. `dependencies.lock.json` records immutable published/candidate revisions used by CI; candidates need manual review/merge before approved pinning. `python scripts/fetch_dependencies.py` retrieves each absent sibling into a task-owned staging directory, verifies its exact HEAD and clean state, then publishes it. Interrupted retrieval removes only that staging directory so retry is possible. Dirty or different existing checkouts are refused. Failures identify the repository, Git operation and sanitized category, retain nonzero status and never publish raw Git diagnostics.

Both infrastructure repositories are private. Automatic CI now runs only root common-file, unit/Git, static and primary-protection checks. The separately dispatched `private-integration` workflow preserves all real cross-repository suites and explicitly fails if approved private read access is absent. The root GITHUB_TOKEN does not authorize private siblings; permissions are not broadened. The team can instead run the real suites using existing authorized local Git objects, without repository ownership or new Actions secrets. See [local validation and acceptance policy](docs/local-validation.md). Automatic green does not prove private integration or replace INF-PG-12.

Copy the selected `env/<environment>.env.example` to its ignored `.env` file. Every command selects `dev`, `qa` or `main` explicitly. Projects are `synkro-dev`, `synkro-qa`, `synkro-main`; operate them sequentially on shared `platform` DNS. Data volumes are `<project>_postgres-data`. Startup creates `platform` only if absent and refuses another environment's database aliases. Shutdown preserves volumes and the shared network.

Provide five distinct, nonempty PostgreSQL password files at absolute paths. Auth and bootstrap consume the same `AUTH_APP_PASSWORD_PATH`; trailing CR/LF handling matches Auth's reader. The administrator file must be UTF-8 with LF. Files require owner-only POSIX permissions (0600) or Windows ACLs limited to the current user, SYSTEM and local Administrators. Missing/publicly readable files fail before startup. Protect the Mongo environment file because the owner's CLI reads its secrets and creates protected `.runtime/<project>` files. Do not print expanded Compose configuration.

The PostgreSQL administrator differs from all application users. Flyway credentials and the Sales migration administrator URI are derived in memory. `SALES_APP_MONGODB_URI` is a separate complete URI using `sales_app`, `authSource=admin`, `replicaSet=rs0` and bounded timeouts. Administrator credentials must never be used there. The variable inventory documents actual consumers, including current placeholders that do not yet consume planned Workflow/Customers settings.

Keep real env files, PEMs, generated tokens, runtime secrets and backups out of Git. They are ignored. Supply secrets through protected files/input, avoiding process arguments and shell history. Sales mounts `JWT_PUBLIC_KEY_PATH` read-only as `/run/secrets/sales_jwt_public_key`; its composition clears the inline `JWT_PUBLIC_KEY` and selects `JWT_PUBLIC_KEY_FILE` exclusively. Products retains its own inline public-key contract. Sales consumes `MONGODB_TIMEOUT` (default `5s`) and `MONGODB_MAX_POOL_SIZE` (default `10`). Only Auth receives the private signing key.

## Preparation and complete startup

Compose profile/file controls are reserved to the operation. Environment files may set only `COMPOSE_PROJECT_NAME` among `COMPOSE_*` keys; inherited/default profile activation is disabled so ordinary startup cannot implicitly run migration tooling.

Default `full` mode includes both engines, all required runners, APIs, Workflow, Worker, Gateway, host, four portals and observability from their owners. Missing deliveries fail clearly; no service is silently omitted or substituted. Full startup is blocked at the recorded revisions.

| Explicit preparation mode | Contents |
|---|---|
| `postgres` | PostgreSQL and instance bootstrap |
| `postgres-migrations` | PostgreSQL and real Auth/Products tooling runners |
| `mongo-migrations` | Published Mongo owner and secure Sales tooling runner |
| `observability` | Collector, Prometheus, Grafana |

Examples from this repository:

```sh
python scripts/synkro.py up dev --mode postgres-migrations
python scripts/synkro.py status dev --mode postgres-migrations
python scripts/synkro.py bootstrap dev --mode postgres-migrations
python scripts/synkro.py migrate dev --mode postgres-migrations --domain auth
python scripts/synkro.py migrate dev --mode postgres-migrations --domain products
python scripts/synkro.py down dev --mode postgres-migrations
python scripts/synkro.py up dev --mode mongo-migrations
python scripts/synkro.py migrate dev --mode mongo-migrations --domain sales
python scripts/synkro.py bootstrap dev --mode mongo-migrations --engine mongo
python scripts/synkro.py down dev --mode mongo-migrations
python scripts/synkro.py up dev --mode observability
python scripts/synkro.py status dev --mode observability
python scripts/synkro.py down dev --mode observability
```

Replace `dev` explicitly with `qa`/`main` when intended. `scripts/<operation>.sh` uses the same Python entrypoint; set `PYTHON` when Python is not named `python3`. Set `SYNKRO_NODE` to the Node executable if necessary. Arbitrary Docker flags are rejected; `down --volumes`, `down -v` and unknown environments fail everywhere. Tooling profiles stay stopped on ordinary startup. Readiness/subprocess waits are bounded and errors return nonzero with sensitive diagnostics suppressed.

`python scripts/synkro.py privileges dev --mode postgres-migrations` deliberately fails full privilege acceptance until Customers/Workflow migrations exist. Status verifies the selected engine, not business endpoint behavior. Once dependencies and full integration are ready, complete startup is `python scripts/synkro.py up dev`. Preparation never satisfies full-startup acceptance.

## PostgreSQL and migration ownership

Manual bootstrap first waits for the authenticated PostgreSQL server itself, then creates missing users and verifies full health. An incomplete login set may fail ordinary health while still allowing that explicit create-only operation; it must not block adding the missing user.

`synkro-db` uses `postgres:16.15-alpine3.23`, a scoped persistent volume, read-only bootstrap mounts, no host database port and bounded authenticated TCP health. Bootstrap creates only missing restricted `auth_app`, `customers_app`, `products_app`, `workflow_app` logins and their domain search paths. Existing passwords, memberships and configuration stay intact. SQL literal/identifier quoting treats credentials as data; transaction/advisory locking propagates errors without partially successful SQL bootstrap.

Domain schemas, tables, roles and grants belong to migrations. Bootstrap creates no ADMIN, business seed or extension. Auth/Products candidates set `environments.default.schemas` and `flyway.defaultSchema`, producing separate `auth_schema.flyway_schema_history` and `products_schema.flyway_schema_history`. Historical SQL is unchanged. Validation is enabled and no repair/checksum reset is used.

An existing `public.flyway_schema_history` stops migration. Obtain a backup and an owner-reviewed reconciliation procedure; no automatic history relocation/deletion is provided. Migration operations share an exclusive per-environment lock under `~/.synkro-operations`. Overlap fails; investigate stale locks manually after interruption rather than removing an active lock.

## Backup and disposable restoration

Real backups must be outside the whole sibling repository workspace, in operator-protected storage. PostgreSQL bundles contain globals with credential hashes/memberships, a custom database dump and completion metadata. Incomplete bundles never count as successful backups. PostgreSQL 16 restoration retains the original bootstrap-superuser identity and recorded grantors, omitting only its duplicate CREATE ROLE.

```sh
python scripts/synkro.py backup qa --mode postgres-migrations --destination /absolute/protected/backups
python scripts/synkro.py restore qa --backup /absolute/protected/backups/SELECT_COMPLETED_BUNDLE
python scripts/synkro.py backup qa --mode mongo-migrations --engine mongo --destination /absolute/protected/backups
```

Use absolute Windows paths in PowerShell. Every `qa`/`main` migration first obtains a successful backup of the affected engine. A failed backup prevents the runner from starting.

PostgreSQL restore automatically creates an exclusively labeled new disposable target, verifies restoration, then verifies ownership/mounts before removing its container and volume. It never overwrites an existing environment. Mongo operations delegate to `synkro-infra-mongo/scripts/mongo.mjs`; bootstrap remains owned there. Mongo archives exclude identities/grants. Published Sales recovery first bootstraps a fresh independent target and applies all ten changesets with the real Sales runner, establishing its own users, roles, grants, schema and history. The owner then imports only `sales.sale` documents, retaining the target's authentication, indexes, validator and independently created history. Importing source history or relying on its no-op update is not the recovery procedure.

Mongo restore requires an already prepared empty disposable target from the owner's recorded lifecycle:

```sh
python scripts/synkro.py restore qa --engine mongo --backup /absolute/protected/backups/SELECT_COMPLETED_MONGO_BUNDLE --target-env-file /absolute/protected/disposable-restore.env --manifest /absolute/protected/disposable-manifest.json
```

Prepare the target through the owner's disposable lifecycle and supported runner; retain its recorded runner image and manifest. Root dispatches `restore-sales-disposable` with that manifest and the selected Sales checkout. The owner checks exact project/test-run/container/network/volume identities, the ten-change baseline and empty `sale`; persistent targets are refused. Use its manifest-based cleanup guard, never shared-network deletion or broad pruning. Real authorization recovery must check allowed read/insert/update and denied deletion/cross-database access as the target's `sales_app`.

## Identity and observability

`python scripts/synkro.py dev-identity dev` exclusively creates ignored owner-protected RSA keys and fixed SERVICE tokens for Workflow/Worker. It refuses existing outputs and `qa`/`main` before reading configuration. SERVICE claims do not create human ADMIN users. Real signing belongs to Auth; only Auth mounts its private key. All examples use `VITE_DEV_SIGN_IN=false`; non-dev settings other than false fail.

Initial ADMIN sequence: start PostgreSQL, complete Auth migrations, verify domain privileges and append-only audit, keep normal traffic closed, then run the packaged Auth CLI from published PR #10 with protected operator input and correlation identity. Follow the owning README's service-image invocation: replace the HTTP entrypoint with `java`, select `co.edu.corhuila.synkro.auth.app.InitialAdminCli` through Spring's `PropertiesLauncher`, connect as `auth_app` with `SPRING_DATASOURCE_PASSWORD_FILE`, and provide `--password-file`, `SYNKRO_INIT_OPERATOR` and `--correlation-id`. Mount both inputs read-only and readable by the image's non-root `synkro` user. Remove temporary initialization material after execution. The first invocation creates ADMIN and its OPERATOR audit atomically; the second returns `already_initialized` with no additional rows. Infrastructure implements no alternative initializer, SQL seed or default password. `tests/auth_initialization.py` verifies the shipped CLI and existing guarded Auth suite exclusively in a disposable database.

Collector `0.123.0`, Prometheus `3.2.1` and Grafana `11.6.0` are explicit versions. Grafana reads a password file. Prometheus/Grafana publish only loopback 9090/3000; OTLP stays internal. Tests validated configuration, healthy startup, Collector health and Grafana/Prometheus connectivity. Service instrumentation and end-to-end traces are not established.

## Verification commands

From a reviewed dependency snapshot:

```sh
python -m unittest discover -s tests -p 'test_*.py'
python scripts/verify_protected.py
python tests/integration.py
python tests/db_regressions.py auth
python tests/db_regressions.py products
node tests/mongo_sales.mjs
# From ../synkro-infra-mongo, run owner suites using the selected Sales sibling:
# node tests/configuration.test.mjs
# node tests/integration.mjs
# node tests/sales-integration.mjs --sales-checkout ../synkro-sales-db
python tests/auth_initialization.py
python tests/sales_runtime.py
python tests/observability.py
python tests/portal_delivery.py
python tests/dependencies.py
```

The last command fails until required external deliveries exist. Explicit private integration runs these checks unchanged; automatic CI is root-only. The local verifier runs all applicable delivered checks and reports full prerequisites independently, without converting failures or skipped checks into passes. Full platform build/start remains blocked and is not claimed by subset jobs. Destructive regression/rollback tests use only exclusive labeled disposable resources. Cleanup checks execution, project, mounts and volumes before deletion. Existing data and shared `platform` are preserved. This task creates no PR, PR merge, issue closure or promotion; published develop was merged only into the authorized Sales working branch.

## Reproducible local integration

```sh
python scripts/verify_local.py --source-workspace /absolute/sibling/workspace --scope available
python scripts/verify_local.py --source-workspace /absolute/sibling/workspace --scope full
```

Use the workspace containing all synkro-* repositories, not one repository. Keep their current branches and user changes: independent temporary snapshots use the exact committed root/lock SHAs. Default storage is a unique protected run directory under the system temporary directory; `--output-parent` must be outside the source workspace. No desktop path is hardcoded. Missing local objects block only dependent suites; `--allow-fetch` explicitly permits retrieval into the isolated copy using existing approved access. No Actions secret is needed or inherited by integration children.

Exit 1 means test/execution/cleanup failure, exit 2 means incomplete full acceptance (including successful available subsets), exit 130 means handled interruption. Exit 0 is reserved for actual full-platform acceptance, never synthesized from successful subsets or file presence. Currently no complete platform acceptance suite can run without the four missing owners; the verifier reports that gate BLOCKED. See the contract for tools, deadlines, evidence, cleanup safeguards and the policy review needed before local evidence can replace a remote-CI requirement.
