# Mongo lifecycle validation diagnosis â€” pending owner investigation

Exact root: `e8ce612ee43e52e5b0cf778fc8f9a547844abd7d`. Exact Mongo dependency: `a19e2d564f938298c057d41ca7a6f6e456e22637`. Run: `run-b59f0bbb17c04b4e9f714c3e9a58bda1`; scope available; suite exit 1.

The published `tests/integration.mjs` passed its initial, unauthenticated, wrong-admin and wrong-app probe phases. Its next `cli(source.file, 'bootstrap')` invocation failed: the nested Node process exceeded the outer `execFileSync` deadline of 180000 ms with `ETIMEDOUT`.

Failing command, with private path represented generically:

```text
node scripts/mongo.mjs bootstrap --env-file <owned disposable source.env>
```

The bootstrap CLI calls `prepareSecrets(values, root)` and then Compose exec of `bash /opt/synkro/bootstrap.sh` in `synkro-mongo`. The configured startup bound was 60 seconds, giving that inner Compose call a 65-second deadline. Available evidence does not locate the stall within secret preparation, process/Compose invocation or the bootstrap script. Local process/Docker/secret-protection timing is a pending hypothesis, not a confirmed cause. No authentication error was identified. Dependency retrieval and the other real Mongo configuration/Sales/recovery suites succeeded; this is not evidence of missing local private access or a new Host defect.

Private diagnostics were inspected only to extract these safe facts and removed during successful guarded cleanup. The retained [manifest](../evidence/local-validation-2026-10-12/manifest.json) and [suite report](../evidence/local-validation-2026-10-12/report.md) record failure, exact revisions and cleanup; raw logs are no longer available.

Next owner action: investigate this exact published lifecycle bootstrap against an explicitly disposable target, add safe phase/timing diagnostics without secrets, identify the stalled child operation, and provide a regression plus approved correction if needed. Infrastructure may then revalidate the affected scenario; no entire-suite retry is authorized for this cut. Mongo sources remain read-only and their approved pin is unchanged. No speculative correction or timeout increase was applied.

## Targeted follow-up — 2026-10-12

Continuation began at `b2fbfbd9ea3f81b451d66ba85465d0c5a4f8656f`. Two protected disposable layouts used the same tested root `e8ce612ee43e52e5b0cf778fc8f9a547844abd7d` and Mongo `a19e2d564f938298c057d41ca7a6f6e456e22637`. Source checkouts and approved pins were not changed. Root snapshot HEAD/clean verification preceded execution. Owner scripts remained byte-identical; a temporary targeted copy of the published lifecycle prelude stopped after its first bootstrap/unchanged-snapshot assertion. A diagnostic preload recorded child operation names, deadlines and durations only. No complete lifecycle or platform suites were rerun.

Both bootstrap calls completed successfully at the unchanged 180000-ms outer bound: **1486 ms** and **1590 ms**. Their inner Compose exec calls took **1021 ms** and **1177 ms**, well within 65000 ms. All five secret-protection whoami/icacls pairs returned status 0. No stalled internal operation appeared in either attempt. The first targeted harness exited 0; the second completed the observed bootstrap, but its wrapper's global resource audit then failed and is not reported as a fully successful diagnostic run.

Authenticated before/after observations in the second attempt both returned `set=rs0`, `myState=1`, `isWritablePrimary=true`, `primary=synkro-mongo:27017`; the sole member had `stateStr=PRIMARY` and `health=1`. Those observations were taken synchronously at the bootstrap boundary. Late asynchronous polling overlapped teardown, failed, and is excluded from replica-state evidence.

**Cause remains unconfirmed; precise blocker: the historical 180-second child timeout is not reproducible in either targeted attempt, and its original phase/timing trace no longer exists.** Passing observations do not establish whether the historical stall was Mongo, secret preparation, Compose, the Node child or the outer executor. An intermittent process/host effect remains a hypothesis only. No code correction or timeout increase is justified by this evidence.

[Sanitized observations](../evidence/mongo-bootstrap-diagnosis-2026-10-12/observations.json) retain timings, deadlines, replica states and cleanup. Raw child output, generated credentials and source snapshots were deleted. First cleanup/global preservation PASSED. In the second run, global preservation was BLOCKED because preexisting resource identities changed externally; the guard refused cleanup of unrelated resources. A separate ownership audit found **zero** containers/networks/volumes bearing the exclusive run labels. Marker-verified snapshots, secret fixtures and private diagnostics were then removed. This is successful owned-resource cleanup, not a claim that the global inventory remained unchanged.

### Concrete owning-repository proposal

For `synkro-infra-mongo`, add opt-in safe phase start/end/duration diagnostics around `prepareSecrets` and Compose exec, then bootstrap connection/authentication/replica/role verification. Capture executable category, status and timeout class without argv, environment, URIs, credentials or raw child errors. Persist only those sanitized events when the owning lifecycle executor times out; capture authenticated read-only replica status before cleanup. Add owning tests proving each injected blocked phase is identified, the existing 180-second cap remains bounded, and descendant/owned-resource cleanup is verified after timeout. Reproduce under the affected Windows/Docker context with concurrent daemon changes excluded. Implement an actual fix only after the stuck phase is confirmed and reviewed. No Mongo implementation is copied into infrastructure.

The historical lifecycle result stays FAILED; full acceptance stays pending. Customers DB and Workflow remain candidates pending review; their work is not an approved lock update. No HU closure, owner implementation or persistent database operation was performed.

## Complete-suite refresh

Full published lifecycle at unchanged Mongo a19e2d564f938298c057d41ca7a6f6e456e22637 PASSED with root 5d43de43dd12117424f603889c718270cabe7ede; see final-acceptance-refresh.md and its safe phase/result evidence. Initial instrumentation failed before bootstrap due to Windows child-path loading; a failing real child regression preceded the infrastructure-only correction. Original 180-second limits and Mongo source were unchanged. This current complete pass is distinct from bootstrap-only evidence. Historical timeout/cause uncertainty remain; no causal Mongo fix is claimed. If it recurs, retain safe phase evidence and investigate the owner operation. Cleanup/global preservation passed.
