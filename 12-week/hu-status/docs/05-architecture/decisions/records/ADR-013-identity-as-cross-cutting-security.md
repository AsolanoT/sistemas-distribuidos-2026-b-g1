# ADR-013 — Identity Service as the Cross-Cutting Security Service

> **Accepted project decision:** Option A retains Auth as the cross-cutting identity/token service.
> Instructor/course confirmation is tracked separately in Q-005 and is not asserted by this acceptance.

| Field | Value |
|-------|-------|
| **ID** | ADR-013 |
| **Date** | 2026-10-25 |
| **Status** | Accepted |
| **Authors** | Sergio Andrés Ordóñez Díaz |
| **Reviewers** | Angel Gustavo Solano Trujillo — Tech Lead, Jordan Ramirez Gallego, Fredman Santiago Plazas Artunduaga — Development team |
| **Modifies** | — (with Option A, replaces no decision) |
| **Traced to** | HU-ARQ-26; acceptance recorded in HU-ARQ-28/#254 |
| **Acceptance evidence** | Architectural acceptance was explicitly communicated by the project user on 2026-10-25 during HU-ARQ-28 preparation. This records that project decision, not individual GitHub review approvals, an instructor response, a successful CI run or a merged PR. PR review/publication remain separate evidence to attach. |

---

## Context

The course architecture requires, besides one service per domain, a cross-cutting security service that manages identity and issues tokens.

The system already has a component that does exactly that. `synkro-auth-api` manages users and their roles, is the only holder of the RS256 private key, issues the tokens of people and the service tokens of `synkro-workflow` and `synkro-worker`, and every other service validates with its public key without calling it (ADR-006). `09-microservices/service-catalog.md` already classifies it as a cross-cutting identity support service, and `02-domain/domain-map.md` places it upstream of every bounded context.

What is not written is whether that component **is** the cross-cutting security service or whether a separate one is required. Its repositories are named after a domain (`synkro-auth-db`, `synkro-auth-api`, `synkro-auth-portal`), not after a cross-cutting repository. The decision records the existing identity/token responsibility without creating a duplicate issuer. Confirmation of its course classification remains a separate external question.

[HU-ARQ-26/#156](https://github.com/code-corhuila/synkro-docs/issues/156) and [PR #163](https://github.com/code-corhuila/synkro-docs/pull/163) delivered the original proposal. Their closure comment reflects the earlier wait for instructor confirmation. On 2026-10-25 the project user explicitly chose Option A and requested acceptance in HU-ARQ-28. Before this Proposed record became Accepted, the project separated its technical decision from the external course assessment: the former is accepted here, while the latter remains Q-005. No instructor answer or naming exception approved by the instructor is inferred. See the [acceptance entry](../../../15-project-control/documentation-verification.md#hu-arq-28-acceptance-entry--2026-10-25).

**Constraints:**
- ADR-006 is immutable: `synkro-auth-api` is the only holder of the private key, and every service validates the token itself.
- Existing repository names do not change; a new repository is created only by the instructor.
- The `synkro-auth-api.yaml` contract already covers registration, login, refresh, logout, user lookup and service tokens.

---

## Decision — Which component is the cross-cutting security service

### Options

**Option A — `synkro-auth-api` is the cross-cutting security service.** It stays as it is, with its database and its portal.
- **Pros:** no new component; identity, credentials and token issuance have a single owner; no contract or ADR changes.
- **Cons:** the cross-cutting service carries a domain-style name; someone reading only the repository list would not recognize it as cross-cutting.

**Option B — A new cross-cutting repository issues the tokens; Auth keeps only users and roles.** The new service receives sign-in, asks `synkro-auth-api` to verify the credentials, and signs the token.
- **Pros:** the repository's name reflects its cross-cutting nature.
- **Cons:**
  - One more service to build, test and deploy, with its own store for refresh tokens.
  - A new contract on `synkro-auth-api` to verify credentials, which does not exist today.
  - The private key changes owner, which replaces an ADR-006 constraint.
  - A bootstrapping problem: the new service's call to Auth needs a service token, and the one who issues them is the new service itself.
  - Every sign-in now depends on two services instead of one.

### Decision

**We decided: Option A.** Keep the current Auth repositories and responsibility; create no additional cross-cutting security repository. Q-005 tracks external course confirmation separately from this accepted project architecture.

- `synkro-auth-api` is the system's cross-cutting security service. It is cross-cutting by what it does, not by its name: every service depends on it to trust a token, and it depends on none of them.
- Its three repositories keep their name and structure: `synkro-auth-db` (schema `auth_schema`), `synkro-auth-api` and `synkro-auth-portal`.
- No repository, contract or store is created.
- `02-domain/domain-map.md` describes it with that role explicitly.

**Resolution on repository naming.** Keep synkro-auth-db, synkro-auth-api and synkro-auth-portal with their existing history, ownership and protection. Auth is cross-cutting through identity and token issuance, not through an additional repository name. The project accepts the documentation/naming cost; this is not evidence of an instructor-approved course exception. If an external decision later requires another structure or name, request the required repository action and write a new modifying ADR before implementation. Do not edit this Accepted record.

### Dominant criterion

**No new component without a need that justifies it.** Separating token issuance from identity solves no problem in the system and adds a service to every sign-in's path.

### Accepted cost

- The existing auth names need explicit catalog/context documentation to make their cross-cutting responsibility clear. The team accepts that technical naming cost; course confirmation remains Q-005.
- If a later external requirement changes the arrangement, a new ADR evaluates the replacement and its migration cost. The present acceptance does not waive external course requirements.

---

## Consequences

**What changes in the system:**
- No new repository, contract, schema, credential issuer or runtime component is created.
- The context map and service catalog identify synkro-auth-api as the current cross-cutting identity/token service; existing validation boundaries remain ADR-006.
- Acceptance is dated 2026-10-25 from the explicit project decision communicated during HU-ARQ-28. Q-005 remains open only for external course classification/confirmation, not for choosing Option A internally.

**What must be watched:**
- Do not treat project acceptance as an instructor response, individual PR approval, successful CI or main integration.
- A later mandatory external change requires a new modifying ADR and the appropriate repository request; this Accepted record remains unchanged.

**Acceptance and publication evidence:** Architectural acceptance was explicitly communicated by the project user on 2026-10-25 during HU-ARQ-28 preparation. This records that project decision, not individual GitHub review approvals, an instructor response, a successful CI run or a merged PR. PR review/publication remain separate evidence to attach.


## Affected documents

| Document | Required change |
|----------|-----------------|
| `02-domain/domain-map.md` | Record Auth's accepted cross-cutting role; no additional repository |
| `15-project-control/open-questions.md`, `15-project-control/dependencies.md` | Separate the accepted project choice from Q-005's external course confirmation |
| `05-architecture/decisions/README.md` | ADR-013 row with its status (this PR) |
| `09-microservices/service-catalog.md` | **Unchanged**: already describes it as a cross-cutting identity support service |
| ADR-006 | **Unchanged**: immutable |

---

## Immutability rule

Once `Accepted`, this ADR is not edited. Any change is a new ADR that names this one, and the sections it replaces, in its **Modifies** field.

---

## References

- Token validation per service and service tokens → `05-architecture/decisions/records/ADR-006-token-validation-per-service.md`
- Identity and roles in the original architecture → `05-architecture/decisions/records/ADR-001-architecture.md`
- Development sign-in → `05-architecture/decisions/records/ADR-008-cross-cutting-stack.md` Decision 4
- Auth contract → `07-api/contracts/openapi/synkro-auth-api.yaml`
- Context map → `02-domain/domain-map.md`
- `synkro-auth-api` service card → `09-microservices/service-catalog.md`
