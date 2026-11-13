# ADR-C3-01: Multi-AZ RDS for PostgreSQL to remove the single point of failure in `synkro-db`

## Status

Proposed

## Context

Our team's own architecture documentation records, as accepted technical debt, that the single PostgreSQL instance behind `synkro-db` is a single point of failure for four of our five bounded contexts — Auth, Customers, Products and the saga store managed by `synkro-workflow` (`05-architecture/overview.md` §9, AT-002; decided in `ADR-009-shared-instance-schema-per-domain.md`). ADR-009 accepted that risk deliberately, because the MVP runs on one developer's Docker Compose instance and a multi-instance topology was not worth the added operational cost at that scale. Section 4 of this certification's design note ("Disaster recovery") sets a target of RTO ≤ 5 minutes and RPO ≤ 1 minute for exactly this data store — a target the current single-instance topology cannot meet, since restoring from any backup-based process takes longer than 5 minutes and loses more than 1 minute of transactions.

## Decision

We will run `synkro-db` on Huawei Cloud RDS for PostgreSQL in Multi-AZ mode: one primary instance in AZ1 and one synchronously-replicated standby in AZ2, with RDS monitoring the primary and promoting the standby automatically if AZ1 fails, while ELB health checks move application traffic away from the failed AZ. Every schema that exists today (`auth_schema`, `customers_schema`, `products_schema`, `workflow_schema`) keeps the same per-domain credential and `GRANT` isolation already decided in ADR-009 and ADR-005 Decision 3 — this ADR only changes where and how the instance runs, not the schema-per-domain model itself.

## Alternatives considered

- **Keep a single RDS instance, no standby:** rejected because it only moves today's single point of failure from a local container to a cloud instance, without closing AT-002 or meeting the RTO/RPO target in §4 of the design note.
- **Cold-standby DR (scheduled backups to a stopped standby):** rejected because its RPO depends on the backup interval (typically much more than 1 minute) and its RTO includes the time to start and warm up a stopped server, which cannot reliably fit inside 5 minutes.

## Consequences

- Positive: closes AT-002 for the three schemas that matter most to revenue (`products_schema` for stock/price checks, `workflow_schema` for in-flight sagas) without having to split the shared instance back into four, which ADR-009 already rejected for cost reasons.
- Negative: Multi-AZ RDS costs roughly double a single-AZ instance of the same size, and it introduces a new operational dependency (failover testing, connection retry settings in every service) that the current Docker Compose setup does not have to manage.
