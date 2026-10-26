# Contributing Guide

> Welcome to the team. This guide explains how to make your first contribution
> and the rules that apply to all changes in this repository.

---

## Before you start

1. Read `00-governance/README.md` — team rules
2. Read `00-governance/git-conventions.md` — how to work with Git
3. Make sure your local environment is set up: `10-devops/local-setup.md`
4. Understand the system domain: `02-domain/domain-map.md`
5. Read your stack's guide: `_stacks/java-spring.md` or `_stacks/go.md`

---

## Workflow

```
1. Pick a User Story from the sprint (status: Ready)
2. Create your branch from develop
3. Implement using TDD (Red → Green → Refactor)
4. Update affected documentation
5. Open a Pull Request using the template
6. PR is reviewed and merged by the Tech Lead
```

### Branch naming

The branch name describes the change — it never carries the HU's ID
(`00-governance/git-conventions.md`, "Branch Naming Format"):

```
[type]/[description-in-kebab-case]
```

| Type | When to use it |
|------|----------------|
| `feat/` | New functionality |
| `fix/` | Bug fix |
| `chore/` | Infrastructure, dependencies, tooling |
| `docs/` | Documentation only (the `synkro-docs` repository, branched from `main`) |

Examples:
```
feat/auth-jwt-login
fix/sales-stock-rollback-on-compensation
chore/upgrade-spring-boot
docs/align-git-conventions
```

Reference the HU in the **commit** or the **PR description**, not in the branch
name — see "Commit Format" below and `00-governance/git-conventions.md`.

---

## Pull Request process

1. **Open the PR** against `develop` (never directly against `main`)
2. **Fill in the PR template** completely (`/.github/pull_request_template.md`)
3. **Assign reviewers:** at least 1 (preferably the Tech Lead or service owner)
4. **CI must be green** — do not request review with a failing pipeline, once the pipeline exists (`10-devops/ci-cd.md`); until then, verify manually and say so in the PR
5. **Do not force-push** to a branch whose PR already has comments — create new commits

### What blocks a merge

- Failing CI pipeline (lint, tests, build), once it exists
- Fewer than 1 approval
- Documentation not updated (API contract, data model, domain)
- Test coverage below the project minimum (see `11-quality/tdd-guide.md`)

---

## Code style

- Follow the conventions in your stack guide: `_stacks/java-spring.md` (Java services) or `_stacks/go.md` (Go services). Do not modify linter configuration without an ADR.
- Conventional Commits are mandatory: `type(scope): description`
- One commit = one logical unit of change. Do not commit "wip" or "fixing stuff"

### Commit types

| Type | When to use |
|------|-------------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Code improvement without behavior change |
| `test` | Add or improve tests |
| `docs` | Documentation only |
| `chore` | Build, CI, dependencies, config |
| `perf` | Performance improvement |

**Commit format** (`00-governance/git-conventions.md`):

```
type(scope): lowercase description, imperative mood, no final period

optional body — explains WHY, not what

optional footer — reference to the HU
```

**Examples applied to the project:**
```
feat(auth): implement JWT login
Closes HU-AUTH-001

fix(sales): roll back stock reservation when registration fails
Closes HU-VEN-014

docs(requirements): unify FR/NFR identifiers and remove PDR dependency
```

---

## TDD — Test-Driven Development

**Team rule:** User Stories are implemented using TDD. No exceptions.

```
1. Write the test that describes the behavior (RED — fails)
2. Write the minimum code to pass the test (GREEN — passes)
3. Refactor without breaking tests (REFACTOR)
```

See the full cycle and the test-double taxonomy: `11-quality/tdd-guide.md`.
See which tests to write at which layer, with which tool, and the coverage
thresholds: `11-quality/testing-strategy.md`.

---

## Documentation

If your change:
- Adds/modifies an endpoint → update the OpenAPI contract in `07-api/contracts/openapi/`
- Changes a table or a column → add the migration to the domain's `-db` repository, and update `06-data/models.md` for that schema
- Makes an architecture decision → write an ADR (`05-architecture/decisions/records/`)
- Changes a service's responsibility, port or dependencies → update `09-microservices/service-catalog.md`

---

## User Story prefixes

Code implementation HUs use one of these prefixes
(`04-requirements/traceability-matrix.md`):

| Prefix | Domain |
|--------|--------|
| `AUTH` | Authentication and Users (`synkro-auth-api`) |
| `CLI` | Customers (`synkro-customers-api`) |
| `PRO` | Products and Inventory (`synkro-products-api`) |
| `VEN` | Sales, including portal/read-model flows; historical saga-related IDs remain assigned |
| `WKF` | Workflow orchestration |
| `WRK` | Worker |
| `GTW` | API Gateway |
| `INF` | Infrastructure/common delivery |
| `FE` | Host/cross-portal frontend |
| `DOCS`, `ARQ` | Documentation and architectural work; register supplies next unassigned number |

---

## Questions?

- Check the documentation in this repo — it's probably already answered there
- Ask in the daily stand-up or in the team channel
- If you think something is missing from the documentation, document it yourself (that is the spirit of this project)
