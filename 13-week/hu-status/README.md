<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       13-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 13

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Angel Gustavo Solano Trujillo
- GITHUB_USER: AsolanoT
- TEAM: synkro-tech
- SPRINT_GOAL: Complete the Gateway-to-Auth threat model, refine its security backlog, run the negative module test, address peer feedback and consolidate the workshop evidence.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-AUTH-15 | Limit login attempts against the same account across IP addresses | todo | [STRIDE PR #277](https://github.com/code-corhuila/synkro-docs/pull/277); [CP7 refinement](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/610c6c3e3f82ffddb04192e509002b146955177c); [issue #278](https://github.com/code-corhuila/synkro-docs/issues/278) |
| HU-AUTH-16 | Bound concurrent authentication work in synkro-auth-api | todo | [STRIDE PR #277](https://github.com/code-corhuila/synkro-docs/pull/277); [CP7 refinement](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/610c6c3e3f82ffddb04192e509002b146955177c); [issue #279](https://github.com/code-corhuila/synkro-docs/issues/279) |
| HU-AUTH-17 | Verify that only ADMIN can register users through the gateway | doing | [CP8 execution evidence](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/fc29b7418330290c86f1bcc211155cfc1da6aef2); [issue #280](https://github.com/code-corhuila/synkro-docs/issues/280) |

HU-AUTH-15 and HU-AUTH-16 remain proposed implementation work. HU-AUTH-17 has passing module-level evidence; its full Gateway/Auth/PostgreSQL verification is still pending. The workshop deliverables do not close these implementation stories.

## 2. My individual contribution
- CP0: claimed `synkro-api-gateway -> synkro-auth-api` in [issue #268](https://github.com/code-corhuila/synkro-docs/issues/268) and filled in the workshop CONFIG.
- CP1: mapped the real services, data stores and flows, marked trust boundaries and highlighted TB4. Added the asset inventory and entry points in [01-attack-surface.md](../workshop/01-attack-surface.md).
- CP2: opened [PR #277](https://github.com/code-corhuila/synkro-docs/pull/277) with six STRIDE threats, existing controls, proposed mitigations, risk ranking, residual risk and library references. Pressman, section 20.8, p. 473, supports the rows marked [B].
- CP3: created security stories [#278](https://github.com/code-corhuila/synkro-docs/issues/278), [#279](https://github.com/code-corhuila/synkro-docs/issues/279) and [#280](https://github.com/code-corhuila/synkro-docs/issues/280). They retain the `security` label, priorities P1/P2/P3 and assignment to me.
- CP4: prepared the Java/Maven [workflow proposal](../workshop/04-security-ci/security.yml) with secret scanning, dependency auditing and authorization testing. Added `SynkroAuthRegisterAuthorizationTest` for `POST /api/v1/auth/register`.
- CP5: reviewed [Jordan's PR #276](https://github.com/code-corhuila/synkro-docs/pull/276) and left a [Comment review](https://github.com/code-corhuila/synkro-docs/pull/276#pullrequestreview-5717534575) about the missing SERVICE-token misuse scenario. The review links existing Customers authorization controls and tests. I did not approve or merge the PR.
- CP6: [answered the review](https://github.com/code-corhuila/synkro-docs/pull/277#issuecomment-6531792207) on my STRIDE PR. Separated the proposed network restriction from pending TLS protection, explained the limits of a plain body hash, and completed the residual-risk and References sections. The changes are published in the same PR branch.
- CP7: refined deterministic acceptance criteria for cooldown, concurrency and registration authorization. Linked #279 with #282 and #280 with #283 in both directions. #280 also links the delivered registration work in #234, so it reuses existing controls and tests. I confirmed that my three issues are in the team's Project backlog.
- CP8: reran the negative test with real Auth components and mocked persistence on 2026-10-30, from 15:35:46 to 15:36:34 America/Bogota. Result: 1 test, 0 failures, 0 errors, 0 skipped; Maven exit 0 and BUILD SUCCESS.
- CP8: validated `security.yml` with actionlint 1.7.12 at 15:36:14 America/Bogota: exit 0, no diagnostics. Recorded the real console excerpt, commands, file hashes and scope in [HOW-TO-RUN.md](../workshop/04-security-ci/HOW-TO-RUN.md).
- CP9: consolidated the final status and checkpoint commit links. Prepared a proposed implementation sequence for sprints 14 and 15 to adapt in my personal reflection. The closing commit, personal reflection completion and Moodle submission remain manual steps.

## 3. Blockers and risks
- The passing test verifies SALESPERSON denial in the Auth module. Gateway, PostgreSQL, INVENTORY/SERVICE callers and registration-key replay are outside this single run.
- The complete OWASP dependency audit and an actual GitHub Actions run remain pending. The workflow is a proposal outside `.github/workflows/`; it has not been adopted into the team's pipeline.
- Internal HTTP still permits tampering and disclosure if the connection is intercepted. The STRIDE proposes accepting this exposure only for controlled local exercises with synthetic credentials; network restrictions and TLS remain proposed work.
- The personal implementation plan must be adapted and added to the reflection document. Its Editor access and final contents still need my check.
- The CP9 closing commit and Moodle delivery are not published by this status update. Commit timestamps in the evidence table do not establish push times; the required delivery rhythm needs separate confirmation.

## 4. Plan for next week
- Proposed sprint 14: discuss and estimate HU-AUTH-15 with the team, agree the cooldown policy and contract change, write failing tests first, then implement and verify account-based login protection.
- Proposed sprint 15: address HU-AUTH-16 with a measured concurrency budget and complete missing integrated HU-AUTH-17 regression cases by reusing #234.
- Coordinate the infrastructure restriction and certificate-lifecycle design before extending the deployment beyond controlled local exercises. Keep the gateway declarative and authentication/authorization inside Auth.
- Before final submission: adapt the implementation plan in the reflection document, verify its access, commit/push this status manually and submit the final commit URL with the other evidence links.

These sprint assignments are a proposal for team planning, not an agreed commitment.

## 5. Compliance self-check
- [x] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Testable acceptance criteria
- [x] Tests added/updated (unit / integration)
- [x] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

The branch/environment item does not apply to the workshop proposal: the STRIDE documentation PR targets `main` in `synkro-docs`; no production-code promotion was performed. The test check refers to the Auth module test. CP4's Gitleaks result covered the workshop files inspected at that time; no new full-history secret scan or dependency-audit pass is claimed for CP8.

## 6. Evidence links
- Workshop folder: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/tree/main/13-week/workshop
- Attack surface map: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/blob/main/13-week/workshop/01-attack-surface.md
- STRIDE Pull Request: https://github.com/code-corhuila/synkro-docs/pull/277
- Boundary claim: https://github.com/code-corhuila/synkro-docs/issues/268
- Security story HU-AUTH-15: https://github.com/code-corhuila/synkro-docs/issues/278
- Security story HU-AUTH-16: https://github.com/code-corhuila/synkro-docs/issues/279
- Security story HU-AUTH-17: https://github.com/code-corhuila/synkro-docs/issues/280
- My peer review comment: https://github.com/code-corhuila/synkro-docs/pull/276#pullrequestreview-5717534575
- Review received on my STRIDE PR: https://github.com/code-corhuila/synkro-docs/pull/277#issuecomment-6523592234
- My response to the review: https://github.com/code-corhuila/synkro-docs/pull/277#issuecomment-6531792207
- Reflection document: https://corhuilaeduco-my.sharepoint.com/:w:/g/personal/agsolano-2023a_corhuila_edu_co/IQBmdWCPnYWPSpKkONfPXtQXARpZB7QkMktBsjVSPsugURA?e=5JTzSG
- Test execution and workflow-validation output: https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/blob/main/13-week/workshop/04-security-ci/HOW-TO-RUN.md
- Final CP9 commit URL for Moodle: pending my manual closing commit and push. Copy its actual permalink from the fork's commit history after publishing.

| Checkpoint | Published commit evidence |
|---|---|
| CP0 - Setup and claim | [Start workshop](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/e69aada00e1bb3ad4d6311172c20fc272588c191) |
| CP1 - Attack surface | [Map flows and trust boundaries](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/7f9dc9d88869f9cb90f7024f40e96b789cc5d916) |
| CP2 - STRIDE | [Complete STRIDE and risk ranking](https://github.com/code-corhuila/synkro-docs/commit/5ca20488d3a06db77cb1fa0fb77ff61a531964f7) |
| CP3 - Security backlog | [Link the three security stories](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/873b05051198064b6d9c2bb20b2884bf9410e072) |
| CP4 - CI proposal and test | [Add security gates and negative test](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/2d205ca931d1601fa9823fa7ddf97a0640359338) |
| CP5 - Peer review and status | [Update workshop status](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/edc4b1e4b8e8b85e040a150d9f8550796ada6a0d) |
| CP6 - Review response | [Address STRIDE review](https://github.com/code-corhuila/synkro-docs/commit/c21df1d69450845857d6942107484d03630eb17e) |
| CP7 - Backlog refinement | [Refine security backlog stories](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/610c6c3e3f82ffddb04192e509002b146955177c) |
| CP8 - Executed test and validation | [Record actual test output](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/fc29b7418330290c86f1bcc211155cfc1da6aef2) |
| CP9 - Implementation plan and close | Pending manual commit and push; the closing commit does not exist yet. |

The CP2 and CP6 commits belong to `code-corhuila/synkro-docs`; the other published checkpoint commits belong to my course fork. The current published course commit at this verification is [CP8](https://github.com/AsolanoT/sistemas-distribuidos-2026-b-g1/commit/fc29b7418330290c86f1bcc211155cfc1da6aef2). For Moodle D2, use the later CP9 closing commit once it exists.

