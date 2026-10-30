<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       13-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 13

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: synkro-tech
- SPRINT_GOAL: Model the Gateway-to-Auth trust boundary, turn the main risks into security stories, prepare a CI proposal and review a teammate's STRIDE analysis.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-AUTH-15 | Limit login attempts against the same account across IP addresses | todo | [STRIDE PR #277](https://github.com/code-corhuila/synkro-docs/pull/277); [backlog issue #278](https://github.com/code-corhuila/synkro-docs/issues/278) |
| HU-AUTH-16 | Bound concurrent authentication work in synkro-auth-api | todo | [STRIDE PR #277](https://github.com/code-corhuila/synkro-docs/pull/277); [backlog issue #279](https://github.com/code-corhuila/synkro-docs/issues/279) |
| HU-AUTH-17 | Verify that only ADMIN can register users through the gateway | doing | [CP4 commit](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/2d205ca931d1601fa9823fa7ddf97a0640359338); [backlog issue #280](https://github.com/code-corhuila/synkro-docs/issues/280) |

The first two stories are in the backlog; their controls have not been implemented. For HU-AUTH-17, the Auth module test passes, but verification through Gateway is still pending.

## 2. My individual contribution
- CP0: claimed `synkro-api-gateway -> synkro-auth-api` in [issue #268](https://github.com/code-corhuila/synkro-docs/issues/268) and filled in the workshop CONFIG.
- CP1: mapped the real services and data flows, marked the trust boundaries and highlighted my Gateway-to-Auth boundary. Added the asset inventory and its entry points in [01-attack-surface.md](../workshop/01-attack-surface.md).
- CP2: opened [PR #277](https://github.com/code-corhuila/synkro-docs/pull/277) with six concrete STRIDE threats, existing controls, proposed mitigations, risk ranking and residual risk. Used Pressman's security controls from section 20.8, page 473, for the rows marked [B].
- CP3: created [#278](https://github.com/code-corhuila/synkro-docs/issues/278), [#279](https://github.com/code-corhuila/synkro-docs/issues/279) and [#280](https://github.com/code-corhuila/synkro-docs/issues/280), with testable acceptance criteria. They have the `security` label, priorities P1, P2 and P3 respectively, and are assigned to me.
- CP4: prepared [security.yml](../workshop/04-security-ci/security.yml) with secret scanning, dependency audit and authorization testing for the Java/Maven stack. This is a proposal kept in the workshop folder.
- CP4: added `SynkroAuthRegisterAuthorizationTest` for `POST /api/v1/auth/register`. With a valid SALESPERSON token requesting an ADMIN account, it checks HTTP 403 and no calls to persistence collaborators. The local run finished with 1 test, 0 failures, 0 errors and BUILD SUCCESS.
- CP4: recorded the commands, actual output and remaining checks in [HOW-TO-RUN.md](../workshop/04-security-ci/HOW-TO-RUN.md). Actionlint passed; Gitleaks found no leaks in the three workshop files scanned at that time.
- CP5: reviewed [Jordan's PR #276](https://github.com/code-corhuila/synkro-docs/pull/276) against the Customers contract and authorization code. Left a [review comment](https://github.com/code-corhuila/synkro-docs/pull/276#pullrequestreview-5717534575) about the missing SERVICE-token case in row E: Workflow may read a customer by ID, but must not list, create, update or deactivate customers. Asked to document the existing controls and retain their negative tests in CI. Submitted a Comment review without approving or merging.

## 3. Blockers and risks
- The updated hu-status still needs my manual commit and push, followed by submission of the required links.
- The passing Auth test covers the module with mocked persistence. It does not prove the complete Gateway-to-Auth path, PostgreSQL effects or registration-key replay behavior.
- The full dependency vulnerability audit and an actual GitHub Actions run are pending. The workflow proposal is outside `.github/workflows/`, so it is not active in this fork.
- Confirm that all three security issues appear in the team's Project backlog. Also check that the reflection document opens with the required Editor access and contains my checkpoint entries.

## 4. Plan for next week
- Complete the remaining workshop actions before the final delivery deadline: commit and push this status update manually, then submit the required links.
- Address the [review received on PR #277](https://github.com/code-corhuila/synkro-docs/pull/277#issuecomment-6523592234), especially the feasibility of protecting the internal HTTP hop.
- Refine the three security stories, confirm their Project status and keep the same PR and issues for the final delivery.
- Complete the pending integration and dependency checks, record reproducible evidence, and write my own implementation plan in the reflection document.

## 5. Compliance self-check
- [x] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Testable acceptance criteria
- [x] Tests added/updated (unit / integration)
- [x] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

The branch/environment item does not apply to the workshop proposal: the STRIDE documentation PR targets `main` in `synkro-docs`; no production-code promotion was performed. The test check refers to the Auth module test, not a full integration run. The secret-scan result covers the inspected workshop files, not repository history.

## 6. Evidence links
- Workshop folder: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/tree/main/13-week/workshop
- Attack surface map: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/blob/main/13-week/workshop/01-attack-surface.md
- STRIDE Pull Request: https://github.com/code-corhuila/synkro-docs/pull/277
- Boundary claim: https://github.com/code-corhuila/synkro-docs/issues/268
- Security story HU-AUTH-15: https://github.com/code-corhuila/synkro-docs/issues/278
- Security story HU-AUTH-16: https://github.com/code-corhuila/synkro-docs/issues/279
- Security story HU-AUTH-17: https://github.com/code-corhuila/synkro-docs/issues/280
- Teammate's STRIDE PR reviewed: https://github.com/code-corhuila/synkro-docs/pull/276
- My peer review comment URL: https://github.com/code-corhuila/synkro-docs/pull/276#pullrequestreview-5717534575
- Review received on my STRIDE PR: https://github.com/code-corhuila/synkro-docs/pull/277#issuecomment-6523592234
- Reflection document: https://corhuilaeduco-my.sharepoint.com/:w:/g/personal/agsolano-2023a_corhuila_edu_co/IQBmdWCPnYWPSpKkONfPXtQXARpZB7QkMktBsjVSPsugURA?e=5JTzSG
- CP0 commit: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/e69aada00e1bb3ad4d6311172c20fc272588c191
- CP1 commit: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/7f9dc9d88869f9cb90f7024f40e96b789cc5d916
- CP2 completion commit: https://github.com/code-corhuila/synkro-docs/commit/5ca20488d3a06db77cb1fa0fb77ff61a531964f7
- CP3 commit: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/873b05051198064b6d9c2bb20b2884bf9410e072
- CP4 commit: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/2d205ca931d1601fa9823fa7ddf97a0640359338
- CP4 test and validation evidence: [HOW-TO-RUN.md](../workshop/04-security-ci/HOW-TO-RUN.md)
- CP5 status commit: pending manual commit and push.

