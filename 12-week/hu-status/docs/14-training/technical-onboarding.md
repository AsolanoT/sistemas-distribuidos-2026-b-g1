# Technical Onboarding

> Welcome to the team. This document is your guide for the first days.
> Goal: you can make your first commit in 3 days.
> If anything in this document is unclear or outdated, fix it yourself — that is your first contribution.

---

## Day 1 — Setup and context

### Morning: Access and environment

- [ ] Get access to the `code-corhuila` GitHub organization (confirm with the Tech Lead)
- [ ] Get access to the team's chat channel and the GitHub Project board
- [ ] Configure your local environment following `10-devops/local-setup.md`
- [ ] Verify the selected root/lock and environment; check Gateway `/health`, then real authorized domain behavior. A gateway response is not all-store readiness.
- [ ] Read `10-devops/releases/2.0.0.md`: PostgreSQL Infra main/qa are scaffold, two tags are absent, and candidate/failed/unexecuted evidence remains explicit.
- [ ] Provision protected inputs without printing them; complete owner migrations and the real InitialAdminCli sequence before normal use.

### Afternoon: Read core documentation

Read in this order — each builds on the previous:

1. `00-sdd-guide.md` — How the team works (30 min)
2. `01-context/overview.md` — What we are building (20 min)
3. `02-domain/domain-map.md` — The business domain (30 min)
4. `05-architecture/overview.md` — How it is built (30 min)
5. `00-governance/git-conventions.md` — How we manage code (20 min)

### Day 1 meetings

- [ ] Meet & greet with the team
- [ ] 1:1 with the Tech Lead (30 min) — project context and your responsibilities
- [ ] Product demo (if there is a recording, watch it beforehand)

---

## Day 2 — Understand the domain

### Read domain and requirements documentation

- [ ] `02-domain/entities-and-rules.md` — Entities and business rules
- [ ] `04-requirements/user-stories.md` — HUs for the current sprint
- [ ] `01-context/glossary.md` — Project terms

### Explore the code

- [ ] Clone the repository for the service you will work on, as a sibling of
      `synkro-infra-postgres` (`05-architecture/deployment.md` §9); use the reviewed lock instead of assuming every main tag composes
- [ ] Read `09-microservices/service-catalog.md` for your service's card — the seven numbered per-service README/data/events/decisions/runbook records now exist under `09-microservices/services/`; `_example-*` folders are not adopted services
- [ ] Follow the folder structure — it should match
      `05-architecture/hexagonal-architecture.md` and your stack guide
      (`_stacks/java-spring.md` or `_stacks/go.md`)
- [ ] Run the owning repository's documented test/build checks for its selected Java, Go, frontend or declarative stack; applicable checks must pass.
- [ ] Follow its numbered service runbook and exposure prerequisites. HTTP health has the component-specific limits recorded there; Worker has no HTTP endpoint, so inspect process/scheduler state without treating it as completed low-stock automation.

### Day 2 meeting

- [ ] Domain walkthrough session with the Tech Lead or a senior developer (1 hour)
  - Ask them to explain the register-sale saga (ADR-007 as modified by Accepted ADR-015), per-tab session lifecycle (ADR-016) and refresh/JWT limits (ADR-017). The changed lock allocation and retry corrections remain implementation follow-up.
  - Take notes on terms you do not know — add them to the glossary

---

## Day 3 — First contribution

### Your first task

The Tech Lead will assign you a small task labeled `good-first-issue`:
- It should be a small bug fix or documentation improvement
- The goal is to learn the workflow, not the complexity of the task

### TDD workflow for your first task

1. Read the HU and its acceptance criteria
2. Write the test that verifies the criterion (`🔴 RED`)
3. Implement the minimum code to make the test pass (`🟢 GREEN`)
4. Refactor if necessary (`♻️ REFACTOR`)
5. Create the PR following the conventions in `00-governance/git-conventions.md`

### Checklist before opening the PR

- [ ] `mvn test` (Java) or `go test ./...` (Go) passes
- [ ] Linting passes (`mvn verify` with checkstyle, or `go vet ./...`)
- [ ] The commit title follows `type(scope): description`
- [ ] Code work uses `feat/short-description` or `fix/short-description` from develop; documentation uses `docs/short-description` from docs main. No HU ID in the branch name. Promotion uses destination branches and `cherry-pick -x`; required CI/main approval remain separate gates.

---

## Week 1 — Go deeper

| Day | Activity |
|-----|----------|
| 4 | Code review (participate in the team's code review — observe first) |
| 5 | Participate in the Daily Standup with something concrete to report |
| 5 | Read `05-architecture/pattern-guide.md` — the patterns we use |
| 5 | Read `11-quality/tdd-guide.md` and `11-quality/testing-strategy.md` in full |

---

## Week 2 — Guided independence

- [ ] Complete your first HU independently
- [ ] Actively participate in a code review
- [ ] Read `07-api/guidelines.md` and understand an OpenAPI contract for a service you use
- [ ] Participate in the sprint Retrospective

---

## Architecture: The 5 concepts you must understand first

Before writing code, understand these 5 concepts from the project's architecture:

### 1. Bounded Contexts
Each domain service corresponds to a Bounded Context of the domain.
See: `02-domain/domain-map.md`

### 2. Hexagonal Architecture
The domain is the center. Nothing from the framework enters the domain or the
application layer — only the adapters touch I/O.
See: `05-architecture/hexagonal-architecture.md`

### 3. Ports and Adapters
Interfaces (ports) live in the application layer. Implementations (adapters)
live in infrastructure.
See: `05-architecture/hexagonal-architecture.md`, "Where each layer lives in the repository"

### 4. The flow of a request
```
HTTP Request
  → [Controller / Handler] (inbound adapter)
  → [Use Case] (application)
  → [Entity] (domain — business logic lives here)
  → [Repository] (port → outbound adapter)
  → own store (PostgreSQL own schema; Sales uses MongoDB sales only)
```

### 5. The saga, not events
Services do not communicate through domain events — there is no message
broker in the MVP (ADR-007 Decision 5). The one process that crosses
domains, registering a sale, is coordinated by `synkro-workflow` with persisted
saga state and bounded request/background execution. Ambiguous outcomes retain
reservations for evidence-backed recovery; no blanket automatic resume is promised.
See: `02-domain/entities-and-rules.md`, "Resolving external references between services"

---

## Frequently asked questions (FAQ)

**Can I commit directly to `main` or `develop`?**
No. Everything goes through a PR with at least 1 approval
(`00-governance/git-conventions.md`).

**Can I change the database schema directly?**
No. PostgreSQL changes use the owning Flyway repository (Workflow owns `db/`); Sales uses its own Liquibase changesets. Apply through explicit tooling, preserve historical migrations/checksums and back up qa/main first. See `06-data/models.md` and `13-operations/backup-and-recovery.md`.

**How do I know if my API change breaks consumers?**
Update the owning OpenAPI/downstream contracts, run applicable owner/consumer checks and obtain consumer review. Actual configured coverage varies; file presence or local units do not prove Pact or a real browser/integration gate. `11-quality/testing-strategy.md`, `10-devops/ci-cd.md` and the release record distinguish the evidence levels.

**My service needs data from another domain — can I query its schema?**
No. Every domain's schema is isolated by `GRANT` in the shared instance
(ADR-009); call that domain's API instead.

**Where do I ask for help if I am stuck?**
1. Search this documentation first
2. Ask in the team's channel
3. Do not wait more than 1 hour before asking for help — the team's time is valuable

**What do I do if I find incorrect or outdated documentation?**
Fix it and open a PR. Documentation is code.

---

## Correlations

- Local environment setup → `10-devops/local-setup.md`
- Branch and commit conventions → `00-governance/git-conventions.md`, `CONTRIBUTING.md`
- Testing tools and thresholds → `11-quality/testing-strategy.md`
- TDD cycle → `11-quality/tdd-guide.md`
- Your stack's folder layout and commands → `_stacks/java-spring.md`, `_stacks/go.md`
