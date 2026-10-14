# HU-INF-02: pending owner deliveries and access gate

Latest refresh: [exact results and blockers](../final-acceptance-refresh.md). Reviewed Customers API/Auth Portal/Host deliveries are pinned. Complete Mongo lifecycle and real WKF-16 revalidations passed. Portal outage suite FAILED twice; Customers Portal and private access/policy approval remain pending. Earlier assessments below are historical. **NOT READY; principal remains draft.**


Current approved-delivery refresh: [Customers DB and Workflow integration](../approved-domain-integration.md). Their approved resulting merge pins/runners replace the earlier missing-owner assessment retained below as historical evidence. Auth/Customers Portal packages still block full composition; Customers API blocks fully real saga acceptance. The historical mongo-lifecycle failure remains FAILED; two successful targeted bootstrap observations do not supersede it. Principal infrastructure remains draft pending full acceptance, Mongo lifecycle revalidation, policy review and documentation.


Latest method update: [local validation](../local-validation.md) now supplies exact isolated integration without an Actions secret or repository ownership. This supersedes the earlier local-only publication/access instructions below for executing validation. Root automatic checks and explicitly dispatched private integration are separate; local evidence does not waive the unchanged full-HU acceptance requirement. The four owner handoffs remain available; only Customers adds the next reserved HU-CLI-02 scope/refinement handoff. The published/private historical evidence below is retained as history.

Checked 2026-10-12, starting root SHA `19a14e3426ea72fa026cd2fd3b3c575ef7cef356`, existing branch `feat/postgres-bootstrap-and-root-composition`. Local and remote checkpoint matched; initial working tree was clean. Six complementary merges/pins are already reconciled and have not been re-audited or replaced. `dependencies.lock.json` and protected baselines remain unchanged.

## Independent handoffs

| Owner repository | Current published develop SHA | Handoff / integration dependency |
|---|---|---|
| synkro-customers-db | `a098042426f259270d9ba28728212872fd2c1b4f` | [Customers DB](customers-db.md): approved migrations, tooling and real database tests |
| synkro-workflow | `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37` | [Workflow persistence](workflow-persistence.md): approved store/adapter, migrations, tooling and tests |
| synkro-auth-portal | `d478fba7344f3a778da4f122dd5aefe481a1d32a` | [Auth Portal](auth-portal.md): executable package/deployment and coordinated Host public login capability |
| synkro-customers-portal | `875b269d217f17568b8125c4fd805e825f01867d` | [Customers Portal](customers-portal.md): executable Angular package/deployment and accepted property contract delivery in Host |

These four remote refs are unchanged after fresh retrieval. Current all-state owner PR inventories contain only existing common-file/base/guard merges, no newer approved executable delivery. There is nothing new to integrate. Documentation main remains `61056c93e6e0783a9199bf56778e9494739bc458`, equal to the existing pin. Each handoff distinguishes available design, verified related issues, unverified implementation-story mapping, concrete contracts, proposed decisions and required evidence. No placeholder or domain functionality is added.

## Private Mongo access remains absent

Fresh root Actions secret metadata returns `[]`. Required workflow uses `secrets.SYNKRO_DEPENDENCY_READ_TOKEN` in both mandatory retrieval jobs through the bounded askpass helper. No secret value was requested, read, copied or logged. Workstation access would not prove Actions authorization.

Owner action: **synkro-infra-postgres → Settings → Secrets and variables → Actions → New repository secret**. Name **SYNKRO_DEPENDENCY_READ_TOKEN**. Supply an approved fine-grained credential: resource owner `code-corhuila`, **Only select repositories: synkro-infra-mongo**, **Contents: Read-only**, automatic Metadata read, and organization approval/SSO authorization when applicable. Enter the value only in the Actions interface, never chat/files/logs. No write/admin permission or workstation credential copy is required.

No root CI was relaunched: the same access prerequisite remains absent. No credential workaround, optional prerequisite, skip directive or relaxed check was introduced. This documentation-only update is committed locally and deliberately not pushed: the existing workflow runs on every push to this branch. Resume publication/required CI when access becomes available. The final response records the local commit SHA and unchanged remote SHA.

## Existing exact-SHA CI: read-only refresh

Latest existing run: [38209447458](https://github.com/code-corhuila/synkro-infra-postgres/actions/runs/38209447458), root `19a14e3426ea72fa026cd2fd3b3c575ef7cef356`, overall **failure**. This is retained remote evidence, not a new execution.

| Job | Actual steps / outcome |
|---|---|
| check-common-files | Checkout and common-file/protected-primary verification succeeded. SUCCESS. |
| contracts | Checkout, Python setup/dependency install, unit/Git suite, Bash syntax/ShellCheck and governance/whitespace guard succeeded. SUCCESS. |
| real-engines-and-delivery | Checkout, Python/Node setup and test installation succeeded; immutable retrieval FAILED. Protected files, PostgreSQL, Auth DB regression, Products DB regression, Mongo/Sales runner, published Mongo lifecycle, ADMIN CLI, Sales runtime, observability and Host/Products/Sales delivery were all SKIPPED. FAILURE. |
| full-composition-prerequisites | Checkout/Python setup succeeded; immutable retrieval FAILED; required-deliveries gate SKIPPED. FAILURE. |

Cleanup success does not turn skipped acceptance checks into passes. Four missing contracts are confirmed by fresh published-file inspection, not by the prerequisite step skipped in this run. No fresh engine/runtime/portal acceptance is claimed for this documentation change.

## INF-PG-01…12: retained status, not freshly executed

| Scenario | Status | Evidence scope / remaining gate |
|---|---|---|
| INF-PG-01 | PASSED, retained | Prior real restricted bootstrap. |
| INF-PG-02 | PASSED, retained | Prior repeated create-only bootstrap. |
| INF-PG-03 | PASSED, retained | Prior prerequisite/failure tests; fresh files confirm four missing contracts. Current remote prerequisite check was skipped. |
| INF-PG-04 | PASSED, retained | Prior persistent stop/start and disposable portal recovery. |
| INF-PG-05 | BLOCKED | Customers/Workflow approved migrations/runners and full no-op replay missing. |
| INF-PG-06 | PASSED, retained | Prior history/checksum/protected checks; no baseline/historical file changed here. |
| INF-PG-07 | BLOCKED | Customers/Workflow own/cross-schema privilege acceptance missing. |
| INF-PG-08 | PASSED, retained | Prior bounded unhealthy/invalid-auth failures. |
| INF-PG-09 | BLOCKED | Four deliveries and coordinated Auth/Customers Host contracts; no complete platform build/start. |
| INF-PG-10 | BLOCKED | Full-platform secrets/exposure/production identity need actual four-owner integration. |
| INF-PG-11 | PASSED, retained | Prior disposable PG/Mongo data/authorization recovery; not rerun. |
| INF-PG-12 | BLOCKED | Mongo Actions access absent; required checks skipped and owner deliveries missing. |

See [verification](../verification.md) for previous detailed evidence. Metadata/design alone upgrades no accepted result.

## Principal draft exit and next execution

The principal handoff remains draft. #239 is verified OPEN; no issue state/body/comment, PR or synkro-docs file is changed here.

1. When access exists, publish the authorized branch without force and run/retry required root CI on the exact published SHA/current approved lock. Confirm actual Mongo retrieval/checkout at `a19e2d564f938298c057d41ca7a6f6e456e22637`; name presence is insufficient. Investigate failed permissions/org authorization without exposing the credential; retain later owner prerequisite failures.
2. Receive approved owner deliveries and coordinated Host corrections identified in portal handoffs. Record reviewed PR URLs/resulting full merge SHAs; update pins/protected inventory only for real approved files, never unrelated/unreviewed tips. Customers API business endpoints remain owner work; structural health/501 responses cannot certify customer business E2E.
3. With access and all deliveries available, execute actual complete build/start; all first migrations and zero-change repetitions; own/cross-domain rights; four portal entries/all assets and identity/error isolation; secrets/exposure; volume-preserving restart and disposable data/authorization recovery. Extend affected real tests rather than equating files with acceptance.
4. Record every required exact-SHA CI step, resolve failures/review-package blockers, then make the principal eligible for manual review. Principal review and the [separate documentation handoff](../synkro-docs-handoff.md) remain required before completion. No PR creation/merge, permanent promotion or #239 closure is performed here.
