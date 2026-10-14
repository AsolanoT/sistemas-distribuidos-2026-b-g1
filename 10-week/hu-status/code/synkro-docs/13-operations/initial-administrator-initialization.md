# Initial Administrator Initialization

> ADR-014 operational design. This runbook defines the required behavior; the
> manual CLI in synkro-auth-api and its database migrations are not supplied by
> this documentation change. Do not execute until those deliverables pass their tests.

## Authorization and preconditions

- The deployment operator assigned to the target environment records their deployment-session identity and an execution correlation identifier.
- The environment is in its first initialization and is closed to normal user traffic. If normal operation has begun, stop: this runbook does not authorize recovery.
- Auth migrations, including user_creation_audit and its grants, have completed. Verify auth_app has access only to auth_schema and cannot update/delete/truncate audit records.
- Use the release's documented initialization CLI and auth_app connection configuration on the platform network. Neither PostgreSQL administrator credentials nor a new HTTP endpoint is used.
- Verify the target environment, database and release before entering secrets. The operator must not rely on development identity scripts.

## Inputs and command contract

The CLI accepts initial administrator name, email and password through protected
interactive input or a deployment-managed secret file. Operator identity comes
from the controlled deployment session; the CLI records it with the execution
correlation identifier. No password is passed in command-line arguments, echoed,
logged, committed or assigned a default. Operator identity is bounded as specified
in the data dictionary; names and email follow the ordinary registration rules.

The CLI hashes the password using Auth's existing policy. It fixes the created
user's role to ADMIN and active to true. It does not call ordinary register with
an invented application caller. No Idempotency-Key is required: retries use the
locked existence check. The command name and invocation must be documented in
synkro-auth-api's README when the CLI is implemented; this runbook defines its
behavior without presenting a nonexistent executable as operational evidence.

## Transaction protocol

1. Connect to the target database as auth_app and begin explicit READ COMMITTED.
2. Apply a finite lock-wait timeout and acquire the single-bigint pg_advisory_xact_lock key reserved in 06-data/models.md.
3. After the lock statement completes, issue a separate query for any system_user with role ADMIN, without filtering active.
4. If found, commit without changing users, passwords or creation audit records; report `already initialized` and log the no-op with the execution identity.
5. Otherwise, insert one ADMIN and its INITIAL_ADMIN_CREATED audit record in the same transaction, with the trusted operator identity.
6. Commit and report `created` with user ID and correlation identifier, never the password. Release the lock automatically at transaction end.

All steps use one connection and transaction. Use a 10-second lock-wait timeout
for this manual operation. A timeout or database error rolls back and reports
failure; it never falls back to an unlocked insert. If the commit response is
lost, an authorized retry observes the existing ADMIN and makes no changes.

## Verification and cleanup

- Confirm the reported user is ADMIN and active and has exactly one corresponding initialization audit record. A no-op creates no new record.
- Verify login through the normal gateway with the operator-supplied initial credentials. Keep all tokens and passwords out of the execution report.
- Preserve the execution identity, target environment, release, outcome and correlation identifier in the deployment record. Investigate audit discrepancies before enabling normal traffic.
- Remove temporary secret inputs and restrict routine access to the initialization CLI. Subsequent administrators are created by an authenticated ADMIN through register.

## Failure and recovery boundary

Audit insertion failure rolls back user insertion. Invalid input fails without a
user or success record; log the reason without exposing inputs. Do not loop
indefinitely on lock failures. Confirm the target and inspect the active lock
holder before an authorized retry.

An inactive ADMIN still causes a no-op. If every ADMIN is later deactivated,
reassigned or exceptionally removed, do not use this command as recovery.
The check cannot detect former roles and the lock is cooperative, not a durable
initialization marker. Follow the separate recovery decision when approved;
the outstanding gap is recorded in 15-project-control/technical-backlog.md.

## References

- [Architecture decision](../05-architecture/decisions/records/ADR-014-admin-only-registration-and-initial-administrator.md)
- [Transaction and lock-key specification](../06-data/models.md)
- [Audit meanings](../06-data/data-dictionary.md)
- [Deployment sequence](../05-architecture/deployment.md)
- [Evidence handling](observability.md)
