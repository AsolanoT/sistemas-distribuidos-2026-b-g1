# synkro-auth-db — Week 10 evidence

HU-AUTH-02 — Flyway skeleton; HU-INF-02 migration-history correction.

Source snapshot: [f14fb8c0eb14bba6d92d987fcdd0f62eb3050606](https://github.com/code-corhuila/synkro-auth-db/commit/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606). Files: 13. Personal original commits in the interval: 7.

[Individual commit evidence](../week-10-commit-evidence.md) · [Original snapshot ZIP](https://github.com/code-corhuila/synkro-auth-db/archive/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606.zip)

The original snapshot ZIP contains the complete repository. The evidence folder contains selected changed files. Source files may include earlier contributions by teammates; use the individual commit diffs to attribute the changes.

| Evidence file | Original download | Category |
|---|---|---|
| [.env.example](./.env.example) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/.env.example) | Configuration / deployment |
| [.github/workflows/ci.yml](./.github/workflows/ci.yml) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/.github/workflows/ci.yml) | Configuration / deployment |
| [.github/workflows/db-ci.yml](./.github/workflows/db-ci.yml) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/.github/workflows/db-ci.yml) | Configuration / deployment |
| [01_ddl/01_schemas/V001__create_schema_auth.sql](./01_ddl/01_schemas/V001__create_schema_auth.sql) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/01_ddl/01_schemas/V001__create_schema_auth.sql) | Source / migrations |
| [03_dcl/00_roles/V002__create_roles.sql](./03_dcl/00_roles/V002__create_roles.sql) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/03_dcl/00_roles/V002__create_roles.sql) | Source / migrations |
| [03_dcl/01_grants/V003__grants.sql](./03_dcl/01_grants/V003__grants.sql) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/03_dcl/01_grants/V003__grants.sql) | Source / migrations |
| [05_rollbacks/01_ddl/01_schemas/U001__create_schema_auth.sql](./05_rollbacks/01_ddl/01_schemas/U001__create_schema_auth.sql) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/05_rollbacks/01_ddl/01_schemas/U001__create_schema_auth.sql) | Source / migrations |
| [05_rollbacks/03_dcl/00_roles/U002__create_roles.sql](./05_rollbacks/03_dcl/00_roles/U002__create_roles.sql) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/05_rollbacks/03_dcl/00_roles/U002__create_roles.sql) | Source / migrations |
| [05_rollbacks/03_dcl/01_grants/U003__grants.sql](./05_rollbacks/03_dcl/01_grants/U003__grants.sql) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/05_rollbacks/03_dcl/01_grants/U003__grants.sql) | Source / migrations |
| [README.md](./README.md) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/README.md) * | Documentation |
| [deploy/compose.yml](./deploy/compose.yml) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/deploy/compose.yml) | Configuration / deployment |
| [flyway.toml](./flyway.toml) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/flyway.toml) | Configuration / deployment |
| [tests/test_history_contract.py](./tests/test_history_contract.py) | [Download](https://raw.githubusercontent.com/code-corhuila/synkro-auth-db/f14fb8c0eb14bba6d92d987fcdd0f62eb3050606/tests/test_history_contract.py) | Tests / checks |

* The local documentation copy removes internal-guide citations without changing the technical decision. The original download retains the original text. See [editorial adjustments](../editorial-adjustments.md).
