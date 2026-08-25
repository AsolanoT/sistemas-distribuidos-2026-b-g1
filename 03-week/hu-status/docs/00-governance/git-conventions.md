# Git Conventions

> **Read this document before making your first commit on the project.**

## Branch strategy

```
main        ← Production. Merge from qa only. Always stable.
  └── qa    ← Pre-production validation (staging). Merge from dev.
        └── dev   ← Continuous integration. Merge from features.
              └── feat/[description]    ← One branch per feature/user story
              └── fix/[description]     ← One branch per bugfix
              └── chore/[description]   ← Infrastructure, docs, dependency changes
              └── hotfix/[description]  ← Urgent fixes directly to main
```

**SynkroTech team rules:**
- Nobody commits directly to `main`, `qa`, or `dev`.
- Every task (TASK, SPIKE, or HU) = one branch + one Pull Request.
- One branch = one task (do not mix different features).
- Branches are deleted after merge.
- All 4 backend repositories, all frontend repositories, and the database repository follow this same `main/qa/dev/feat-fix-chore-hotfix` scheme.
- `dev` feeds the Development environment; `qa` feeds the Staging environment; `main` feeds Production (if it comes to exist).

### Exception: the `docs` repository

The `docs` repository **does NOT follow the `main/qa/dev` flow**. Only the `main` branch exists — no `qa`, `dev`, or intermediate `feat/*` branches.

**How to contribute:** each team member works from their own fork's `main` branch and opens a Pull Request directly against the base repository's `main` (`code-corhuila/synkro-docs` or the team's repo).

**Why this exception exists:** documentation must always be readable from `main` without ambiguity. If intermediate branches (`dev`, `qa`) existed, anyone reading the documentation (a team member, the instructor, an evaluator) would risk seeing outdated information by looking at the wrong branch, or not knowing which branch holds the current version. With a single branch, `main` is always the sole source of truth, no exceptions.

**What stays the same as in the other repos:** each task (TASK or SPIKE) should go in a separate PR when possible, with at least 1 reviewer and green CI before merging — the only difference is the target branch.

---

## Branch naming format

```
[type]/[description-in-kebab-case]

Examples:
feat/auth-jwt-login
fix/sales-stock-discount
chore/docs-adr-001-correction
hotfix/auth-token-null-expiration
```

---

## Commit format (Conventional Commits)

```
[type]([scope]): [lowercase description, imperative mood, no trailing period]

[optional body — explain WHY, not what]

[optional footer — task/HU reference]
```

**Types:**
| Type | When to use |
|------|-------------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code refactoring without behavior change |
| `test` | Add or modify tests |
| `chore` | Tooling, dependencies, CI |
| `perf` | Performance improvement |

**Examples applied to the project:**
```
feat(auth): implement JWT login

fix(sales): correct stock validation before confirming a sale
Closes SPIKE-ARQ-03

docs(adr): correct ADR-001 to single database with schemas

chore(deps): upgrade Spring Boot to 3.2.0
```

---

## Pull Request policy

- **Size:** maximum 400 lines of code (excluding tests). If larger, split it.
- **Reviewers:** minimum 1 approval before merging.
- **Review time:** reviewer has a maximum of 24 business hours.
- **Green CI:** merge only proceeds if all pipeline checks pass.

---

## Merge policy

- Use **Squash and Merge** for features into `dev` (keeps the history clean).
- Use **Merge Commit** for `dev → qa` and `qa → main` promotions (preserves full history for release traceability).
- **Do not** use Rebase & Merge (creates confusion in shared history).

---

## Tags and versioning

Follow [SemVer](https://semver.org/): `MAJOR.MINOR.PATCH`

```bash
# When releasing to production
git tag -a v1.0.0 -m "Release v1.0.0: SynkroTech sales management MVP"
git push origin v1.0.0
```
