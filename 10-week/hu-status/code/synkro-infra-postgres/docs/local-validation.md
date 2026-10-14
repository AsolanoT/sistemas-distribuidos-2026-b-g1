# Local validation contract â€” HU-INF-02

Current delivery split: [verified partial scope, isolated audit and review cuts](partial-delivery-review.md). Delivery 1 is coherent but PR #2 exceeds the 400-code-line gate; no exception is authorized. Portal suite and strict isolated-daemon audit passed. Delivery 2 retains Customers Portal/coordinated Host, full acceptance and unapproved local-method adoption. Original results/statements below are historical. HU-INF-02 must remain OPEN; no full-platform acceptance.

Latest refresh: [approved Host merge/portal revalidation](approved-host-integration.md). Current portal suite PASSED; global shared-daemon audit FAILED during concurrent disposable activity, scoped cleanup completed. [Concrete method-adoption proposal](local-integration-approval-proposal.md) specifies the pending decision, controls, peer evidence and limitations. It is not approved; root automatic CI does not replace private acceptance. HU-CLI-04/full acceptance remain pending. Earlier assessments below are historical. **NOT READY; principal stays draft.**


Current approved-delivery refresh: [Customers DB and Workflow integration](approved-domain-integration.md). Their approved resulting merge pins/runners replace the earlier missing-owner assessment retained below as historical evidence. Auth/Customers Portal packages still block full composition; Customers API blocks fully real saga acceptance. The historical mongo-lifecycle failure remains FAILED; two successful targeted bootstrap observations do not supersede it. Principal infrastructure remains draft pending full acceptance, Mongo lifecycle revalidation, policy review and documentation.


## Interface and acceptance boundary

```sh
python scripts/verify_local.py --source-workspace /absolute/sibling/workspace --scope available
python scripts/verify_local.py --source-workspace /absolute/sibling/workspace --scope full
```

Explicit source siblings are read-only Git object sources, never copied working trees. The default output parent is the system temporary directory's `synkro-local`; each invocation exclusively creates `run-<UUID>`. Optional `--output-parent` selects another non-colliding parent; existing run directories are never reused/overwritten. Root revision defaults to the source root's committed HEAD; `--root-revision` accepts a full SHA. Root lock bytes and all selected full dependency SHAs define the tested layout. Independent Git fetches from local repositories transfer objects without shared Git directories, alternates or hardlinks. No source branch reset/index/remotes change is allowed. Optional `--allow-fetch` may retrieve a locally missing object into its isolated copy from the canonical owner URL using existing authorized Git access, never substituting a tip or requiring new credentials.

The verifier records missing objects/files and continues independent suites. It never requires an Actions secret. Tools are checked before resource mutation: Python 3.11+ with requirements-test.txt, Git, Bash, Node 22+, Docker Linux engine and Compose 2.24.4+. ShellCheck uses the existing pinned Docker image. Each suite has a bounded deadline; suites run sequentially to preserve existing guards. Ctrl-C is handled by allowing the active bounded disposable suite to finish its guarded cleanup, then recording unexecuted suites. Forceful process termination cannot promise cleanup: residual resource verification must fail visibly. Original persistent environments/shared platform are outside this execution.

Evidence consists of sanitized `manifest.json` and `report.md`: run/timestamps/OS/tools, full root SHA, SHA-256 of committed lock bytes, selected SHAs, suite status/exit codes, full prerequisite result and cleanup. Raw child output is never published. Private execution snapshots/temp files are removed after guarded cleanup; evidence contains no environment values, secret inputs, raw errors, expanded Compose configuration or private source. Owner-only temporary storage is required. Each existing suite retains its exclusive project/run labels and destructive guards; the orchestrator audits disposable resource cleanup and refuses unrelated resources.

Aggregate exits: **0** only for complete full-platform acceptance; **1** for a failed test, unsafe cleanup or invalid execution; **2** for blocked/incomplete acceptance with applicable tests passing; **130** for handled interruption. Available-scope successes never mean full-platform passed. Full scope requires every actual owner delivery and full-platform acceptance evidence; file presence alone is insufficient.

Automatic CI retains root-only common/unit/static/primary protection. Private cross-repository remote integration is preserved as an explicit separately dispatched workflow, which fails safely if its access prerequisite is absent. No repository settings/required-check rule is changed. Local evidence does not satisfy an unchanged remote-CI requirement in INF-PG-12; replacing that validation method requires explicit story/DoD/governance review.

## Required delivered-component checks

Reuse unit/Git discovery, Bash syntax/ShellCheck, full protected blobs, PostgreSQL integration, owner Auth/Products DB regressions, Mongo/Sales, published Mongo configuration/lifecycle/Sales suites, shipped ADMIN CLI, Sales runtime/Go suite, observability, real Host/Products/Sales portal delivery, and full prerequisites. Run each in its owning isolated directory. Missing Customers/Workflow runners and Auth/Customers packages block complete acceptance but must not suppress unrelated delivered checks.

This contract precedes implementation. Actual commands/evidence and limitations will be appended after real execution; no executed test is claimed by this design document.

## CI separation and policy review

`.github/workflows/ci.yml` remains automatic for existing push/PR branches with `check-common-files` and `contracts`. It preserves root unit/Git discovery, Bash syntax/ShellCheck, whitespace and primary protected blobs. `.github/workflows/private-integration.yml` preserves `real-engines-and-delivery` and `full-composition-prerequisites` under explicit `workflow_dispatch`. Both jobs first fail with a safe prerequisite message when approved private access is unavailable. Permissions remain contents:read; authenticated askpass retrieval remains intact. This task does not dispatch it with the known missing prerequisite.

Read-only protection queries showed `required_status_checks: null` for develop, qa and main. No setting changed. If owners later require the old private job contexts, they must explicitly approve how server-side requirements map to the separated method; local checks cannot bypass them.

Available scope evaluates full prerequisites and applicable suites. Full scope does not manufacture complete testing from file presence: an additional full-platform gate remains BLOCKED until approved owner deliveries and a real complete build/start/migration/privilege/all-portal/recovery acceptance suite exist. Existing tests provide delivered-component evidence. Later full acceptance must consume approved owners and retain disposable guards.

Authorization to implement local validation is recorded by this task; it is not acceptance of a changed institutional DoD. Propose an update to #239 INF-PG-12/Phase 6 so mandatory automatic checks plus reviewed immutable local evidence can become an approved method. Required team/instructor review, principal review, full owner delivery and separate documentation remain open; no waiver/approval is claimed.

## Windows temporary fixtures and diagnostics

Real isolated execution exposed a Python MAX_PATH fixture failure. Extended temporary paths were rejected by real Git fixtures and were replaced with an exclusively created short native system-temporary directory. It receives owner-only permissions and a run-specific .fixture-owner marker; its path is recorded privately inside the run. Cleanup verifies the temporary parent, short-name family and exact marker before removal. The original source workspace remains read-only. Raw suite output may be held only in the run's protected .tmp directory for investigation, never published as evidence; cleanup removes it. Sanitized reports retain exit/status and do not expose raw errors or environment values.

ShellCheck now receives an explicit synkro-shellcheck execution name and recorded disposable owner label, permitting the same ownership audit on interruption. Docker build images/cache may be retained; containers, networks and volumes are audited against existing identities.

Read-only effective-rule queries also returned no required_status_checks rules for develop, qa and main. This observation is not institutional approval of the proposed validation-policy change.

## Executed cut and close-out

The real available-scope run tested committed root e8ce612ee43e52e5b0cf778fc8f9a547844abd7d: 14 suites passed, Mongo lifecycle failed and two full gates were blocked; guarded cleanup passed. See [verification](verification.md) and its immutable sanitized evidence. The bootstrap timeout cause remains unconfirmed; no speculative owner fix was applied. This cut ends without restarting suites. **NOT READY — blockers listed**.
