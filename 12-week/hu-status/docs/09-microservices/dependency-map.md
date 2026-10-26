# Dependency Map

> Which service depends on which, at two levels: the calls made while the
> system is running, and the repositories that must exist before each one
> can start. A cycle in either graph would mean two components cannot both
> be the first to come up — this map exists to catch that before it
> happens.

---

## Runtime call graph

```text
Browser/Host shared client -> Gateway -> Auth, Customers, Products, Sales, Workflow
Workflow -> Customers (validate) / Products (reserve, release) / Sales (register)
Worker = scheduler placeholder; future Products edge is intended, not executed
```

| Service | Calls (outgoing) | Called by (incoming) |
|---|---|---|
| Host shared client | Gateway; Auth public login/refresh and protected domain routes | Mounted React/Angular portals via Host capability |
| Gateway | Four APIs and Workflow, lazily resolved upstreams | Browser through Host-owned client |
| Auth API | No domain HTTP calls | Gateway; validates credentials/issues tokens |
| Customers API | No domain HTTP calls | Gateway, Workflow |
| Products API | No domain HTTP calls | Gateway, Workflow; Worker intended only |
| Sales API | No domain HTTP calls | Gateway, Workflow |
| Workflow | Customers, Products, Sales | Gateway |
| Worker | No implemented business HTTP call | Scheduler only, no inbound listener |

The request graph is a directed acyclic graph with shared sinks, **not a tree**: Gateway and Workflow both reach domain APIs. Configured RS256 public keys are provisioning dependencies, not runtime Auth calls. Portal asset loading is a separate Host-to-remote dependency and must not be confused with browser API routing. Background Workflow execution may outlive an HTTP response; individual participant calls remain REST.

---

## Why this shape, not a mesh

A naive implementation of the register-sale flow could have had
`synkro-sales-api` call `synkro-customers-api` and `synkro-products-api`
directly to validate and reserve before writing the sale. That shape was
rejected (ADR-007): it makes Sales both a domain service and an
orchestrator, and it has no natural place to persist "which step did
this saga reach" if the process is interrupted. Centralizing the
cross-domain calls in `synkro-workflow` keeps every domain service a
sink, and keeps the one place that needs to coordinate also being the
one place that remembers how far it got.

---

## Repository-level dependency (what must exist to build/run each one)

This inventory distinguishes build inputs, operational prerequisites and root assembly; combining them into one “acyclic build graph” would create misleading loops. The 18 code repositories are the four APIs, four database owners, four portals, Host, Gateway, Workflow, Worker and two infrastructure owners. Docs is a separate nineteenth repository.

| Repository | Depends on | Why |
|---|---|---|
| PostgreSQL Infra | Locked sibling Compose/source deliveries for full assembly | Owns PostgreSQL/bootstrap/network/observability. main/qa scaffold is not full assembly; develop/open candidates contain executable composition |
| Mongo Infra | Own engine/bootstrap; exact Sales DB revision for owner acceptance/recovery | Owns authenticated rs0 and sales_app provisioning. Published pin conflict remains in release record |
| Auth/Customers/Products DB | Healthy PostgreSQL plus migration administrator credential | Explicit own runner/history/grants, never own engine or cross-schema writes |
| Sales DB | Healthy authenticated Mongo plus migration credential | Explicit Sales Liquibase history/validator/indexes/roles; no own engine |
| Workflow | PostgreSQL with own db/ migrations; issued SERVICE token; participant APIs for execution | Four domain schemas do not imply four PostgreSQL instances; bounded recovery/evidence rules apply |
| Auth/Customers/Products APIs | Own migrated store and restricted user; Auth signing key or validator public key | Missing store/schema/credential is a failed prerequisite, not an accepted runtime configuration |
| Sales API | Sales migrations/restricted sales_app URI and RS256 public key | Root maps app URI separately from runner admin URI; current owner exact-pin gate still fails |
| Worker | Required SERVICE_TOKEN for startup | Current placeholder does not need Products to complete “work”; the missing real job will require its API, never DB access |
| Gateway | Own configuration/image; upstream DNS at request time | Can start before a remote; route failure stays bounded. Health does not establish downstream health |
| Host | Own build/remote-entry configuration; on-demand portal assets | Session/guards/router/client; dashboard and Auth administration remain placeholders |
| Four portals | Own package lock/build and Host capabilities; real APIs for business operation | No independent token/transport. Customers ShellContract v1; other remotes use federated capabilities |

Both infrastructure repositories exist under their final names. Use the [release record](../10-devops/releases/2.0.0.md) for root/lock SHAs, excluded tag content, candidates and failed/unexecuted checks. A buildable component or read access does not prove full startup, private integration or persistent environment provisioning.

---

## Correlations

- Full startup sequence and exact commands → `05-architecture/deployment.md` §9
- Service responsibilities behind each node → `09-microservices/service-catalog.md`
- Why the calls are shaped this way → `09-microservices/service-boundary-rules.md`, Rule 4
- The saga this graph implements → ADR-007
- Shared instance and schema ownership → ADR-009
- Sales domain on MongoDB and infra repository naming → ADR-010
- Angular Customers portal → ADR-011
