# Week 11 — October 18 commit and source evidence

Contributor: **Angel Gustavo Solano Trujillo — AsolanoT**.

Scope: **October 18, 2026 only, America/Bogota (UTC−05:00)**, from `2026-10-18T05:00:00Z` to before `2026-10-19T05:00:00Z`. All timestamps in the tables use Colombia time. UTC commits after midnight on October 19 can therefore belong to October 18.

**41 selected original non-merge AsolanoT commits across five repositories**, excluding cherry-picks and teammates' authorship. This is a scoped PR inventory, not an exhaustive account-wide search or a count of unique features. Promotion timestamps are reported separately from original authorship.

The repository folders contain **219 actual source, test, migration and configuration files**, copied without edits from the immutable revisions identified below. They preserve repository-relative paths. These are selected files, not complete runnable repositories. Their Git blob hashes were compared with the upstream source trees. No application test suite was rerun to prepare this submission.

## Selection and attribution

- New behavior and test changes authored on October 18 are included.
- Code re-applied through `cherry-pick -x` on October 18 is included as a promotion, even when its original implementation predates that day. It is not counted again as new implementation.
- Products DB copies come from the October 18 main publication commit `043e485`; its earlier implementation is not presented as newly authored that day.
- PR creator and commit author are distinct: selected Front and Sales API source corrections are authored by `JordanRG420`, although `AsolanoT` opened the delivery PRs.
- Markdown indexes, CSV inventories, manifests and separate link/verification reports are not part of this submission. Links, provenance and verification summaries are consolidated here.
- The local copy scope is important changed code/tests/configuration; documentation-only changes remain visible in the commit tables but are not copied as additional repository reports.

## synkro-front

HU-VEN-12 / HU-INF-02.

[Local source folder](./synkro-front/) · [Immutable source revision `49eb6d1a5ea1b27e561d854b76009e3a297ce019`](https://github.com/code-corhuila/synkro-front/tree/49eb6d1a5ea1b27e561d854b76009e3a297ce019)

**Reported result:** 360 passing tests + 3 existing todo; 95.29% statement coverage; 12 real-browser scenarios reported on the session-recovery candidate.

**Limits and attribution:** Session extension is unmerged. PR #36 does not contain it. Front commits in this selection are authored by JordanRG420; AsolanoT opened the PRs. CI failed before executing steps.

### October 18 original AsolanoT commits (0)

No new original AsolanoT implementation commit is counted for this repository in the selected PRs.

### October 18 teammate source commits — not counted as AsolanoT implementation

| timestamp | Commit | Author | PR | Change |
|---|---|---|---|---|
| 2026-10-18 17:04 | [167f0bf](https://github.com/code-corhuila/synkro-front/commit/167f0bf22400027bb8f4f2bcf89ee02dd561c262) | JordanRG420 | [#37](https://github.com/code-corhuila/synkro-front/pull/37) | test(host): reproduce unbounded Auth and Products upstream outage |
| 2026-10-18 17:04 | [94c4d05](https://github.com/code-corhuila/synkro-front/commit/94c4d05b8e4c26266278affca5c1e2a7b6da45dc) | JordanRG420 | [#37](https://github.com/code-corhuila/synkro-front/pull/37) | fix(host): bound Auth and Products upstream outage in delivery |
| 2026-10-18 20:07 | [91dae24](https://github.com/code-corhuila/synkro-front/commit/91dae246bb06d9708b91647485f770d11bc848e5) | JordanRG420 | [#41](https://github.com/code-corhuila/synkro-front/pull/41) | test(session): specify host recovery ownership before implementation |
| 2026-10-18 20:10 | [338d2b5](https://github.com/code-corhuila/synkro-front/commit/338d2b5acb3ff7da3019abeb68f1092e5220df2f) | JordanRG420 | [#41](https://github.com/code-corhuila/synkro-front/pull/41) | feat(session): expose stable host recovery identity and notifications |
| 2026-10-18 20:14 | [49eb6d1](https://github.com/code-corhuila/synkro-front/commit/49eb6d1a5ea1b27e561d854b76009e3a297ce019) | JordanRG420 | [#41](https://github.com/code-corhuila/synkro-front/pull/41) | test(session): assert absence of renewal work after observer logout |

### October 18 promotion commits — not counted as new implementation

Timestamps below show re-application. The originating source can predate October 18.

| timestamp | Commit | Author | PR | Source SHA(s) |
|---|---|---|---|---|
| 2026-10-18 20:20 | [021c096](https://github.com/code-corhuila/synkro-front/commit/021c09642f8906eb5692e0284705f7a30db2f131) | JordanRG420 | [#42](https://github.com/code-corhuila/synkro-front/pull/42) | [91dae24](https://github.com/code-corhuila/synkro-front/commit/91dae246bb06d9708b91647485f770d11bc848e5) |
| 2026-10-18 20:20 | [684df69](https://github.com/code-corhuila/synkro-front/commit/684df69688e07cf01b20555cbbafe0201a0c214b) | JordanRG420 | [#42](https://github.com/code-corhuila/synkro-front/pull/42) | [338d2b5](https://github.com/code-corhuila/synkro-front/commit/338d2b5acb3ff7da3019abeb68f1092e5220df2f) |
| 2026-10-18 20:20 | [046e293](https://github.com/code-corhuila/synkro-front/commit/046e293805bd8a3d6f6cae70e4b5b00cadcdbfa8) | JordanRG420 | [#42](https://github.com/code-corhuila/synkro-front/pull/42) | [49eb6d1](https://github.com/code-corhuila/synkro-front/commit/49eb6d1a5ea1b27e561d854b76009e3a297ce019) |
| 2026-10-18 20:21 | [e98d6ef](https://github.com/code-corhuila/synkro-front/commit/e98d6ef22a31d5f441b5396de496b0bdead56e6f) | JordanRG420 | [#43](https://github.com/code-corhuila/synkro-front/pull/43) | [91dae24](https://github.com/code-corhuila/synkro-front/commit/91dae246bb06d9708b91647485f770d11bc848e5), [021c096](https://github.com/code-corhuila/synkro-front/commit/021c09642f8906eb5692e0284705f7a30db2f131) |
| 2026-10-18 20:21 | [cf8ecaf](https://github.com/code-corhuila/synkro-front/commit/cf8ecaf72f0b7937ff80a6a6acb0bb599d564c4a) | JordanRG420 | [#43](https://github.com/code-corhuila/synkro-front/pull/43) | [338d2b5](https://github.com/code-corhuila/synkro-front/commit/338d2b5acb3ff7da3019abeb68f1092e5220df2f), [684df69](https://github.com/code-corhuila/synkro-front/commit/684df69688e07cf01b20555cbbafe0201a0c214b) |
| 2026-10-18 20:21 | [673212b](https://github.com/code-corhuila/synkro-front/commit/673212be85f2aae273f8793b22fa749bab4e4b37) | JordanRG420 | [#43](https://github.com/code-corhuila/synkro-front/pull/43) | [49eb6d1](https://github.com/code-corhuila/synkro-front/commit/49eb6d1a5ea1b27e561d854b76009e3a297ce019), [046e293](https://github.com/code-corhuila/synkro-front/commit/046e293805bd8a3d6f6cae70e4b5b00cadcdbfa8) |

### Copied source files (9)

These files are taken from `49eb6d1a5ea1b27e561d854b76009e3a297ce019`, rather than combining conflicting versions from individual commits. The source revision is an October 18 candidate/publication. The changed-file lists were checked against the relevant PRs.

| Actual local file | Immutable upstream file |
|---|---|
| [deploy/nginx.conf](./synkro-front/deploy/nginx.conf) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/deploy/nginx.conf) |
| [src/core/auth/authentication.test.ts](./synkro-front/src/core/auth/authentication.test.ts) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/src/core/auth/authentication.test.ts) |
| [src/core/auth/authentication.ts](./synkro-front/src/core/auth/authentication.ts) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/src/core/auth/authentication.ts) |
| [src/core/auth/session.ts](./synkro-front/src/core/auth/session.ts) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/src/core/auth/session.ts) |
| [src/core/auth/sessionRecovery.test.ts](./synkro-front/src/core/auth/sessionRecovery.test.ts) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/src/core/auth/sessionRecovery.test.ts) |
| [src/core/http/protectedLifecycle.test.ts](./synkro-front/src/core/http/protectedLifecycle.test.ts) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/src/core/http/protectedLifecycle.test.ts) |
| [src/shell/session.test.ts](./synkro-front/src/shell/session.test.ts) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/src/shell/session.test.ts) |
| [src/shell/session.ts](./synkro-front/src/shell/session.ts) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/src/shell/session.ts) |
| [tests/test_root_deploy.py](./synkro-front/tests/test_root_deploy.py) | [Source](https://github.com/code-corhuila/synkro-front/blob/49eb6d1a5ea1b27e561d854b76009e3a297ce019/tests/test_root_deploy.py) |

### Delivery status recorded for this cut

- [#41 — feat(session): expose host recovery identity for HU-VEN-12](https://github.com/code-corhuila/synkro-front/pull/41): open, target `develop`, head `49eb6d1`.
- [#42 — feat(session): prepare qa recovery contract for HU-VEN-12](https://github.com/code-corhuila/synkro-front/pull/42): open, target `qa`, head `046e293`.
- [#43 — feat(session): prepare release recovery contract for HU-VEN-12](https://github.com/code-corhuila/synkro-front/pull/43): open, target `release/2.0.0`, head `673212b`.
- [#36 — chore(release): synkro-front 2.0.0 host with shared session, remote isolation and four portals](https://github.com/code-corhuila/synkro-front/pull/36): open, target `main`, head `00b7e16`.

## synkro-sales-portal

HU-VEN-12.

[Local source folder](./synkro-sales-portal/) · [Immutable source revision `40f38ce7d2315f437d79d4d1020a2ee3487577d3`](https://github.com/code-corhuila/synkro-sales-portal/tree/40f38ce7d2315f437d79d4d1020a2ee3487577d3)

**Reported result:** 242 tests; 96.43% statements; seven additional real-browser scenarios and separately reused Front 12-scenario evidence.

**Limits and attribution:** Stacked PRs remain open. Tested executable revision is 7794cbffbe777c1d9acde359fdf1204be56f61d7; current head adds documentation/merge changes. Old Hosts disable registration. Billing prevents CI execution.

### October 18 original AsolanoT commits (30)

| timestamp | Commit | PR | Change |
|---|---|---|---|
| 2026-10-18 19:02 | [75dbf4e](https://github.com/code-corhuila/synkro-sales-portal/commit/75dbf4ec6700068c309b561913c669d5d717f0c8) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): specify durable intent recovery and isolation |
| 2026-10-18 19:03 | [f32744c](https://github.com/code-corhuila/synkro-sales-portal/commit/f32744c4731dc2e868a88784d8bcfc578a92bc35) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): specify proposed host session lifecycle contract |
| 2026-10-18 19:04 | [4f8f822](https://github.com/code-corhuila/synkro-sales-portal/commit/4f8f822b0fbd64d7177013e39525a4f0cdbafd40) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): guard loading announcements and unique notice styles |
| 2026-10-18 19:06 | [2b24dcb](https://github.com/code-corhuila/synkro-sales-portal/commit/2b24dcb011d21508d9d8d1c03906db404a329d5e) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): retain uncertain and failed operations until reconciled |
| 2026-10-18 19:07 | [6e6ec9b](https://github.com/code-corhuila/synkro-sales-portal/commit/6e6ec9b3cc6e4363774e852b5264aa8bc1fb7247) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): restrict compiled storage access to intent journal |
| 2026-10-18 19:08 | [bdc104c](https://github.com/code-corhuila/synkro-sales-portal/commit/bdc104c7a7fb1363fbd569108027f2b13a4d8cd6) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | fix(sales-portal): recover intents only within the proposed host session |
| 2026-10-18 19:09 | [6413044](https://github.com/code-corhuila/synkro-sales-portal/commit/6413044089398054e53c8036068297d791808b0f) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | fix(sales-portal): verify emitted recovery storage and clarify unavailable registration |
| 2026-10-18 19:10 | [a22d4c8](https://github.com/code-corhuila/synkro-sales-portal/commit/a22d4c84be797556e0590a7be2fbcfb07b4fbcde) | [#5](https://github.com/code-corhuila/synkro-sales-portal/pull/5) | test(sales-portal): specify HU-VEN-12 increment 1 |
| 2026-10-18 19:10 | [0ff83f3](https://github.com/code-corhuila/synkro-sales-portal/commit/0ff83f3e64cda3f2c10681a7ab3efbc343ef87ec) | [#5](https://github.com/code-corhuila/synkro-sales-portal/pull/5) | feat(sales-portal): prepare HU-VEN-12 lookups increment |
| 2026-10-18 19:10 | [f3e54f2](https://github.com/code-corhuila/synkro-sales-portal/commit/f3e54f2fedb7f23a654583c9c6f7a903cbc1c754) | [#6](https://github.com/code-corhuila/synkro-sales-portal/pull/6) | test(sales-portal): specify HU-VEN-12 increment 2 |
| 2026-10-18 19:10 | [1d24ee0](https://github.com/code-corhuila/synkro-sales-portal/commit/1d24ee0649c2d26cb38d013a6a6fecc5e2154257) | [#6](https://github.com/code-corhuila/synkro-sales-portal/pull/6) | feat(sales-portal): prepare HU-VEN-12 form increment |
| 2026-10-18 19:10 | [bc5ad13](https://github.com/code-corhuila/synkro-sales-portal/commit/bc5ad13c40adec93dacc960e42eadd8b7fe12269) | [#7](https://github.com/code-corhuila/synkro-sales-portal/pull/7) | test(sales-portal): specify HU-VEN-12 increment 3 |
| 2026-10-18 19:10 | [212ca07](https://github.com/code-corhuila/synkro-sales-portal/commit/212ca07a706a8ddf88840f70438d2f78891ee6ea) | [#7](https://github.com/code-corhuila/synkro-sales-portal/pull/7) | feat(sales-portal): prepare HU-VEN-12 saga-contract increment |
| 2026-10-18 19:10 | [3e2715a](https://github.com/code-corhuila/synkro-sales-portal/commit/3e2715a17451df938cf21c2e612a06b4d8b44ab9) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): specify HU-VEN-12 increment 4 |
| 2026-10-18 19:10 | [f0f2b51](https://github.com/code-corhuila/synkro-sales-portal/commit/f0f2b5161c19dcff6117cb9757669be200826ca3) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | feat(sales-portal): prepare HU-VEN-12 session-recovery increment |
| 2026-10-18 19:10 | [571fed7](https://github.com/code-corhuila/synkro-sales-portal/commit/571fed76b26d8e7194bafd2323a196598658ce43) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): specify HU-VEN-12 increment 5 |
| 2026-10-18 19:10 | [faa07b5](https://github.com/code-corhuila/synkro-sales-portal/commit/faa07b51d0cee8165f8ab4b859db11c0b22a5610) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | feat(sales-portal): prepare HU-VEN-12 detail increment |
| 2026-10-18 19:10 | [684191e](https://github.com/code-corhuila/synkro-sales-portal/commit/684191ec7cb67c82e7223eed386540fb0aa46308) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): specify HU-VEN-12 increment 6 |
| 2026-10-18 19:10 | [4a3b541](https://github.com/code-corhuila/synkro-sales-portal/commit/4a3b54111c902bb09ed5c2d3c4be653fd0e67d31) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | feat(sales-portal): prepare HU-VEN-12 registration increment |
| 2026-10-18 19:11 | [e8faa62](https://github.com/code-corhuila/synkro-sales-portal/commit/e8faa6298eaaf575a2951e1f23d32412d6ed46f6) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): stop saga observation when history becomes hidden |
| 2026-10-18 19:12 | [2d3df20](https://github.com/code-corhuila/synkro-sales-portal/commit/2d3df20281a204537f3edb831293a700456e66e8) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | fix(sales-portal): suspend hidden saga observation without discarding recovery |
| 2026-10-18 19:12 | [435cd5a](https://github.com/code-corhuila/synkro-sales-portal/commit/435cd5a59261d743b63b45494c749af14eb4289d) | [#8](https://github.com/code-corhuila/synkro-sales-portal/pull/8) | test(sales-portal): specify independent detail increment |
| 2026-10-18 19:12 | [dcaaafb](https://github.com/code-corhuila/synkro-sales-portal/commit/dcaaafba93d2524fefab2653ae4d01d0e6ed1f08) | [#8](https://github.com/code-corhuila/synkro-sales-portal/pull/8) | feat(sales-portal): prepare independent detail increment |
| 2026-10-18 19:12 | [dfdb9bb](https://github.com/code-corhuila/synkro-sales-portal/commit/dfdb9bb56a1a4c9f14cf265a08ce1a13662e5439) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | test(sales-portal): specify independent registration increment |
| 2026-10-18 19:12 | [22a5c8f](https://github.com/code-corhuila/synkro-sales-portal/commit/22a5c8f801fb784afa852b5dff1c13f6b33cec37) | [#9](https://github.com/code-corhuila/synkro-sales-portal/pull/9) | test(sales-portal): specify independent session-recovery increment |
| 2026-10-18 19:12 | [edf5af1](https://github.com/code-corhuila/synkro-sales-portal/commit/edf5af1a368e45118aa7be85903e9962587e810d) | [#9](https://github.com/code-corhuila/synkro-sales-portal/pull/9) | feat(sales-portal): prepare independent session-recovery increment |
| 2026-10-18 19:12 | [e017db0](https://github.com/code-corhuila/synkro-sales-portal/commit/e017db0746c123778f314ddce1528d21eceaff6d) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | feat(sales-portal): prepare independent registration increment |
| 2026-10-18 19:15 | [7794cbf](https://github.com/code-corhuila/synkro-sales-portal/commit/7794cbffbe777c1d9acde359fdf1204be56f61d7) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | docs(sales-portal): record split verification and actual integration gates |
| 2026-10-18 20:40 | [1a87395](https://github.com/code-corhuila/synkro-sales-portal/commit/1a873951c78d22098294697e9d5e4d1137cd5ffe) | [#9](https://github.com/code-corhuila/synkro-sales-portal/pull/9) | docs(sales-portal): verify front candidate and workflow replay retention |
| 2026-10-18 20:41 | [40f38ce](https://github.com/code-corhuila/synkro-sales-portal/commit/40f38ce7d2315f437d79d4d1020a2ee3487577d3) | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | docs(sales-portal): record real candidate acceptance and reused front evidence |

### October 18 publication / merge

| timestamp | Commit | Author | PR | Change |
|---|---|---|---|---|
| 2026-10-18 19:10 | [6a2c5ae](https://github.com/code-corhuila/synkro-sales-portal/commit/6a2c5ae2107e5055418cb17c662e97963f56d7cd) | AsolanoT | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | Merge commit '6413044' into codex/hu-ven12-06-registration |
| 2026-10-18 19:12 | [30f49d2](https://github.com/code-corhuila/synkro-sales-portal/commit/30f49d22d3da3df10182a9a699acec5543287734) | AsolanoT | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | Merge commit '2d3df20' into codex/hu-ven12-06-composition |
| 2026-10-18 20:40 | [1f7ceff](https://github.com/code-corhuila/synkro-sales-portal/commit/1f7ceffc41de39865ed70dfb02b16b4011c73d42) | AsolanoT | [#4](https://github.com/code-corhuila/synkro-sales-portal/pull/4) | Merge branch 'codex/hu-ven12-05-session-recovery' into codex/hu-ven12-06-composition |

### Copied source files (58)

These files are taken from `40f38ce7d2315f437d79d4d1020a2ee3487577d3`, rather than combining conflicting versions from individual commits. The source revision is an October 18 candidate/publication. The changed-file lists were checked against the relevant PRs.

| Actual local file | Immutable upstream file |
|---|---|
| [scripts/compiledCheck.mjs](./synkro-sales-portal/scripts/compiledCheck.mjs) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/scripts/compiledCheck.mjs) |
| [src/App.tsx](./synkro-sales-portal/src/App.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/App.tsx) |
| [src/compiledRecovery.test.ts](./synkro-sales-portal/src/compiledRecovery.test.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/compiledRecovery.test.ts) |
| [src/navigation.regression.test.tsx](./synkro-sales-portal/src/navigation.regression.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/navigation.regression.test.tsx) |
| [src/navigation.test.tsx](./synkro-sales-portal/src/navigation.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/navigation.test.tsx) |
| [src/navigation.ts](./synkro-sales-portal/src/navigation.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/navigation.ts) |
| [src/remote.test.tsx](./synkro-sales-portal/src/remote.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/remote.test.tsx) |
| [src/routes.tsx](./synkro-sales-portal/src/routes.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/routes.tsx) |
| [src/sales/api/customersApi.ts](./synkro-sales-portal/src/sales/api/customersApi.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/api/customersApi.ts) |
| [src/sales/api/lookupApi.test.ts](./synkro-sales-portal/src/sales/api/lookupApi.test.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/api/lookupApi.test.ts) |
| [src/sales/api/productsApi.ts](./synkro-sales-portal/src/sales/api/productsApi.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/api/productsApi.ts) |
| [src/sales/api/salesApi.test.ts](./synkro-sales-portal/src/sales/api/salesApi.test.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/api/salesApi.test.ts) |
| [src/sales/api/salesApi.ts](./synkro-sales-portal/src/sales/api/salesApi.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/api/salesApi.ts) |
| [src/sales/api/workflowApi.test.ts](./synkro-sales-portal/src/sales/api/workflowApi.test.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/api/workflowApi.test.ts) |
| [src/sales/api/workflowApi.ts](./synkro-sales-portal/src/sales/api/workflowApi.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/api/workflowApi.ts) |
| [src/sales/components/CustomerPicker.tsx](./synkro-sales-portal/src/sales/components/CustomerPicker.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/CustomerPicker.tsx) |
| [src/sales/components/NewSalePanel.module.css](./synkro-sales-portal/src/sales/components/NewSalePanel.module.css) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/NewSalePanel.module.css) |
| [src/sales/components/NewSalePanel.test.tsx](./synkro-sales-portal/src/sales/components/NewSalePanel.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/NewSalePanel.test.tsx) |
| [src/sales/components/NewSalePanel.tsx](./synkro-sales-portal/src/sales/components/NewSalePanel.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/NewSalePanel.tsx) |
| [src/sales/components/PortalLink.module.css](./synkro-sales-portal/src/sales/components/PortalLink.module.css) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/PortalLink.module.css) |
| [src/sales/components/PortalLink.tsx](./synkro-sales-portal/src/sales/components/PortalLink.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/PortalLink.tsx) |
| [src/sales/components/SagaStatus.module.css](./synkro-sales-portal/src/sales/components/SagaStatus.module.css) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/SagaStatus.module.css) |
| [src/sales/components/SagaStatus.test.tsx](./synkro-sales-portal/src/sales/components/SagaStatus.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/SagaStatus.test.tsx) |
| [src/sales/components/SagaStatus.tsx](./synkro-sales-portal/src/sales/components/SagaStatus.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/SagaStatus.tsx) |
| [src/sales/components/SaleForm.module.css](./synkro-sales-portal/src/sales/components/SaleForm.module.css) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/SaleForm.module.css) |
| [src/sales/components/SaleForm.test.tsx](./synkro-sales-portal/src/sales/components/SaleForm.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/SaleForm.test.tsx) |
| [src/sales/components/SaleForm.tsx](./synkro-sales-portal/src/sales/components/SaleForm.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/SaleForm.tsx) |
| [src/sales/components/SaleLineRow.tsx](./synkro-sales-portal/src/sales/components/SaleLineRow.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/SaleLineRow.tsx) |
| [src/sales/components/SalesTable.tsx](./synkro-sales-portal/src/sales/components/SalesTable.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/SalesTable.tsx) |
| [src/sales/components/useSearch.ts](./synkro-sales-portal/src/sales/components/useSearch.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/components/useSearch.ts) |
| [src/sales/model/customer.ts](./synkro-sales-portal/src/sales/model/customer.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/customer.ts) |
| [src/sales/model/identifier.ts](./synkro-sales-portal/src/sales/model/identifier.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/identifier.ts) |
| [src/sales/model/intentJournal.ts](./synkro-sales-portal/src/sales/model/intentJournal.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/intentJournal.ts) |
| [src/sales/model/product.ts](./synkro-sales-portal/src/sales/model/product.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/product.ts) |
| [src/sales/model/saga.ts](./synkro-sales-portal/src/sales/model/saga.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/saga.ts) |
| [src/sales/model/sagaMachine.test.ts](./synkro-sales-portal/src/sales/model/sagaMachine.test.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/sagaMachine.test.ts) |
| [src/sales/model/sagaMachine.ts](./synkro-sales-portal/src/sales/model/sagaMachine.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/sagaMachine.ts) |
| [src/sales/model/saleForm.test.ts](./synkro-sales-portal/src/sales/model/saleForm.test.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/saleForm.test.ts) |
| [src/sales/model/saleForm.ts](./synkro-sales-portal/src/sales/model/saleForm.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/model/saleForm.ts) |
| [src/sales/pages/SaleDetailPage.module.css](./synkro-sales-portal/src/sales/pages/SaleDetailPage.module.css) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/SaleDetailPage.module.css) |
| [src/sales/pages/SaleDetailPage.test.tsx](./synkro-sales-portal/src/sales/pages/SaleDetailPage.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/SaleDetailPage.test.tsx) |
| [src/sales/pages/SaleDetailPage.tsx](./synkro-sales-portal/src/sales/pages/SaleDetailPage.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/SaleDetailPage.tsx) |
| [src/sales/pages/SalesPage.module.css](./synkro-sales-portal/src/sales/pages/SalesPage.module.css) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/SalesPage.module.css) |
| [src/sales/pages/SalesPage.registration.test.tsx](./synkro-sales-portal/src/sales/pages/SalesPage.registration.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/SalesPage.registration.test.tsx) |
| [src/sales/pages/SalesPage.test.tsx](./synkro-sales-portal/src/sales/pages/SalesPage.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/SalesPage.test.tsx) |
| [src/sales/pages/SalesPage.tsx](./synkro-sales-portal/src/sales/pages/SalesPage.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/SalesPage.tsx) |
| [src/sales/pages/registrationRecovery.test.tsx](./synkro-sales-portal/src/sales/pages/registrationRecovery.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/registrationRecovery.test.tsx) |
| [src/sales/pages/useRegisterSale.test.tsx](./synkro-sales-portal/src/sales/pages/useRegisterSale.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/useRegisterSale.test.tsx) |
| [src/sales/pages/useRegisterSale.ts](./synkro-sales-portal/src/sales/pages/useRegisterSale.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/useRegisterSale.ts) |
| [src/sales/pages/useSaleDetail.test.tsx](./synkro-sales-portal/src/sales/pages/useSaleDetail.test.tsx) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/useSaleDetail.test.tsx) |
| [src/sales/pages/useSaleDetail.ts](./synkro-sales-portal/src/sales/pages/useSaleDetail.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/useSaleDetail.ts) |
| [src/sales/pages/useSalesHistory.ts](./synkro-sales-portal/src/sales/pages/useSalesHistory.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sales/pages/useSalesHistory.ts) |
| [src/shell.d.ts](./synkro-sales-portal/src/shell.d.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/shell.d.ts) |
| [src/sourceContract.test.ts](./synkro-sales-portal/src/sourceContract.test.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/sourceContract.test.ts) |
| [src/test-doubles/fixtures.ts](./synkro-sales-portal/src/test-doubles/fixtures.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/test-doubles/fixtures.ts) |
| [src/test-doubles/shellSession.ts](./synkro-sales-portal/src/test-doubles/shellSession.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/test-doubles/shellSession.ts) |
| [src/test-setup.ts](./synkro-sales-portal/src/test-setup.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/test-setup.ts) |
| [src/visualContract.test.ts](./synkro-sales-portal/src/visualContract.test.ts) | [Source](https://github.com/code-corhuila/synkro-sales-portal/blob/40f38ce7d2315f437d79d4d1020a2ee3487577d3/src/visualContract.test.ts) |

### Delivery status recorded for this cut

- [#4 — feat(sales-portal): compose sale registration and recovery (6/6)](https://github.com/code-corhuila/synkro-sales-portal/pull/4): open, target `codex/hu-ven12-05-session-recovery`, head `40f38ce`.
- [#5 — feat(sales-portal): add typed sale lookups and draft validation (1/6)](https://github.com/code-corhuila/synkro-sales-portal/pull/5): open, target `develop`, head `0ff83f3`.
- [#6 — feat(sales-portal): add HU-VEN-12 form (2/6)](https://github.com/code-corhuila/synkro-sales-portal/pull/6): open, target `codex/hu-ven12-01-lookups`, head `1d24ee0`.
- [#7 — feat(sales-portal): add HU-VEN-12 saga-contract (3/6)](https://github.com/code-corhuila/synkro-sales-portal/pull/7): open, target `codex/hu-ven12-02-form`, head `212ca07`.
- [#8 — feat(sales-portal): add HU-VEN-12 detail (4/6)](https://github.com/code-corhuila/synkro-sales-portal/pull/8): open, target `codex/hu-ven12-03-saga-contract`, head `dcaaafb`.
- [#9 — feat(sales-portal): add HU-VEN-12 session-recovery (5/6)](https://github.com/code-corhuila/synkro-sales-portal/pull/9): open, target `codex/hu-ven12-04-detail`, head `1a87395`.

## synkro-products-api

Security and release support for HU-INF-02 / HU-WKF-03 / HU-VEN-12.

[Local source folder](./synkro-products-api/) · [Immutable source revision `285fedce5a79bf097a89a4689f6be6370f6ca2f4`](https://github.com/code-corhuila/synkro-products-api/tree/285fedce5a79bf097a89a4689f6be6370f6ca2f4)

**Reported result:** 192 real-stack checks reported; global coverage 89.8%; updated toolchain/dependencies; source and binary scans reported no detected vulnerabilities.

**Limits and attribution:** Release PR #19 is open. Security changes and dependency update were promoted, but main/tag acceptance is pending. Reported results belong to their identified runs, not a new weekly execution.

### October 18 original AsolanoT commits (5)

| timestamp | Commit | PR | Change |
|---|---|---|---|
| 2026-10-18 15:46 | [fcc3d89](https://github.com/code-corhuila/synkro-products-api/commit/fcc3d8946898e478f3b0f7216bfe7ea739138073) | [#6](https://github.com/code-corhuila/synkro-products-api/pull/6) | test(httpapi): reproduce acceptance of unsigned, forged and expired JWTs |
| 2026-10-18 15:53 | [dbdc4eb](https://github.com/code-corhuila/synkro-products-api/commit/dbdc4ebfc20df809e860df4a445050bc6713d6bf) | [#6](https://github.com/code-corhuila/synkro-products-api/pull/6) | feat(config): require the RS256 public key of synkro-auth-api |
| 2026-10-18 15:53 | [c242f71](https://github.com/code-corhuila/synkro-products-api/commit/c242f7102a9e6887c60009fc697f127f9a1cb237) | [#6](https://github.com/code-corhuila/synkro-products-api/pull/6) | fix(httpapi): verify the RS256 signature and exp before trusting any claim |
| 2026-10-18 15:53 | [136c325](https://github.com/code-corhuila/synkro-products-api/commit/136c3251a2e3a4ebdc6102a70d67fb2c0fce618b) | [#6](https://github.com/code-corhuila/synkro-products-api/pull/6) | docs: document JWT validation and the required public key |
| 2026-10-18 17:33 | [41a3ec2](https://github.com/code-corhuila/synkro-products-api/commit/41a3ec2da074cb268c2f551602b24f7db8625722) | [#20](https://github.com/code-corhuila/synkro-products-api/pull/20) | fix(deps): move to Go 1.26.9, pgx 5.9.2 and x/text 0.41.0 for reachable vulnerabilities |

### Copied source files (17)

These files are taken from `285fedce5a79bf097a89a4689f6be6370f6ca2f4`, rather than combining conflicting versions from individual commits. The source revision is an October 18 candidate/publication. The changed-file lists were checked against the relevant PRs.

| Actual local file | Immutable upstream file |
|---|---|
| [.github/workflows/ci.yml](./synkro-products-api/.github/workflows/ci.yml) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/.github/workflows/ci.yml) |
| [cmd/products-api/main.go](./synkro-products-api/cmd/products-api/main.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/cmd/products-api/main.go) |
| [deploy/Dockerfile](./synkro-products-api/deploy/Dockerfile) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/deploy/Dockerfile) |
| [deploy/compose.yml](./synkro-products-api/deploy/compose.yml) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/deploy/compose.yml) |
| [go.mod](./synkro-products-api/go.mod) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/go.mod) |
| [go.sum](./synkro-products-api/go.sum) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/go.sum) |
| [internal/adapter/in/httpapi/auth_http_test.go](./synkro-products-api/internal/adapter/in/httpapi/auth_http_test.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/auth_http_test.go) |
| [internal/adapter/in/httpapi/catalog_test.go](./synkro-products-api/internal/adapter/in/httpapi/catalog_test.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/catalog_test.go) |
| [internal/adapter/in/httpapi/handler.go](./synkro-products-api/internal/adapter/in/httpapi/handler.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/handler.go) |
| [internal/adapter/in/httpapi/jwt.go](./synkro-products-api/internal/adapter/in/httpapi/jwt.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/jwt.go) |
| [internal/adapter/in/httpapi/jwt_test.go](./synkro-products-api/internal/adapter/in/httpapi/jwt_test.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/jwt_test.go) |
| [internal/adapter/in/httpapi/jwt_testkit_test.go](./synkro-products-api/internal/adapter/in/httpapi/jwt_testkit_test.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/jwt_testkit_test.go) |
| [internal/adapter/in/httpapi/middleware.go](./synkro-products-api/internal/adapter/in/httpapi/middleware.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/middleware.go) |
| [internal/adapter/in/httpapi/stock_alert_test.go](./synkro-products-api/internal/adapter/in/httpapi/stock_alert_test.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/stock_alert_test.go) |
| [internal/adapter/in/httpapi/stock_test.go](./synkro-products-api/internal/adapter/in/httpapi/stock_test.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/adapter/in/httpapi/stock_test.go) |
| [internal/config/config.go](./synkro-products-api/internal/config/config.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/config/config.go) |
| [internal/config/config_test.go](./synkro-products-api/internal/config/config_test.go) | [Source](https://github.com/code-corhuila/synkro-products-api/blob/285fedce5a79bf097a89a4689f6be6370f6ca2f4/internal/config/config_test.go) |

### Delivery status recorded for this cut

- [#6 — fix(products-api): verify RS256 JWT signature and expiry before authorizing](https://github.com/code-corhuila/synkro-products-api/pull/6): merged, target `develop`, head `136c325`.
- [#20 — fix(deps): move to Go 1.26.9, pgx 5.9.2 and x/text 0.41.0 for reachable vulnerabilities](https://github.com/code-corhuila/synkro-products-api/pull/20): merged, target `develop`, head `41a3ec2`.
- [#19 — release(products-api): publish 2.0.0 with RS256 JWT validation](https://github.com/code-corhuila/synkro-products-api/pull/19): open, target `main`, head `285fedc`.

## synkro-sales-api

Release support; minimal launcher backport related to HU-INF-02.

[Local source folder](./synkro-sales-api/) · [Immutable source revision `1bdd32dce7921fdfebc82cc28fd8864ae3697477`](https://github.com/code-corhuila/synkro-sales-api/tree/1bdd32dce7921fdfebc82cc28fd8864ae3697477)

**Reported result:** 34 real-MongoDB scenarios; 84 Auth/Gateway checks reported in the final update; zero reachable vulnerabilities in the recorded scan.

**Limits and attribution:** New toolchain/launcher commits are authored by JordanRG420, not AsolanoT. PR #23 remains open. This minimal backport does not incorporate all of root-composition PR #7. Historical 167-check run is separate from the reported 84-check update.

### October 18 original AsolanoT commits (0)

No new original AsolanoT implementation commit is counted for this repository in the selected PRs.

### October 18 teammate source commits — not counted as AsolanoT implementation

| timestamp | Commit | Author | PR | Change |
|---|---|---|---|---|
| 2026-10-18 15:50 | [018e312](https://github.com/code-corhuila/synkro-sales-api/commit/018e312dff66de3346e191cc552724201a7ffe9d) | JordanRG420 | [#24](https://github.com/code-corhuila/synkro-sales-api/pull/24) | fix(sales-api): update Go toolchain and x/net, x/text to clear reachable advisories |
| 2026-10-18 16:09 | [db8976b](https://github.com/code-corhuila/synkro-sales-api/commit/db8976babb2fc0b17da42fc465245706600cad49) | JordanRG420 | [#27](https://github.com/code-corhuila/synkro-sales-api/pull/27) | test(sales-api): add launcher pin, directory and guard regressions |
| 2026-10-18 16:09 | [862a516](https://github.com/code-corhuila/synkro-sales-api/commit/862a5168179e5bc407ba0a0561e3045ddaa20161) | JordanRG420 | [#27](https://github.com/code-corhuila/synkro-sales-api/pull/27) | fix(sales-api): pin launcher and CI to Sales DB v2.0.0 |

### October 18 promotion commits — not counted as new implementation

Timestamps below show re-application. The originating source can predate October 18.

| timestamp | Commit | Author | PR | Source SHA(s) |
|---|---|---|---|---|
| 2026-10-18 15:51 | [951e799](https://github.com/code-corhuila/synkro-sales-api/commit/951e7996dc05d779f7ce2a1a28f9c7d45fed47ba) | JordanRG420 | [#25](https://github.com/code-corhuila/synkro-sales-api/pull/25) | [018e312](https://github.com/code-corhuila/synkro-sales-api/commit/018e312dff66de3346e191cc552724201a7ffe9d) |
| 2026-10-18 15:55 | [c33e0b1](https://github.com/code-corhuila/synkro-sales-api/commit/c33e0b1d1ca6a19d9c0812d618a9608fff8a4ad4) | JordanRG420 | [#26](https://github.com/code-corhuila/synkro-sales-api/pull/26) | [018e312](https://github.com/code-corhuila/synkro-sales-api/commit/018e312dff66de3346e191cc552724201a7ffe9d), [951e799](https://github.com/code-corhuila/synkro-sales-api/commit/951e7996dc05d779f7ce2a1a28f9c7d45fed47ba) |
| 2026-10-18 16:16 | [b097843](https://github.com/code-corhuila/synkro-sales-api/commit/b09784361d8feb4e049241dac5bad4d3993483d9) | AsolanoT | [#28](https://github.com/code-corhuila/synkro-sales-api/pull/28) | [859c8f7](https://github.com/code-corhuila/synkro-sales-api/commit/859c8f79a437d5cb1e19cf48a9d124966d221508) |
| 2026-10-18 16:16 | [3c5c2f4](https://github.com/code-corhuila/synkro-sales-api/commit/3c5c2f4ac22807e7c437177532e0499dd42e5e0a) | AsolanoT | [#28](https://github.com/code-corhuila/synkro-sales-api/pull/28) | [7c8f2ec](https://github.com/code-corhuila/synkro-sales-api/commit/7c8f2eca02f4c4f159dab17d0165c5155aa2609a) |
| 2026-10-18 16:16 | [b03b1d4](https://github.com/code-corhuila/synkro-sales-api/commit/b03b1d40f1a7f66825009a8c755745a8c5ec31a6) | JordanRG420 | [#28](https://github.com/code-corhuila/synkro-sales-api/pull/28) | [db8976b](https://github.com/code-corhuila/synkro-sales-api/commit/db8976babb2fc0b17da42fc465245706600cad49) |
| 2026-10-18 16:17 | [03c8ebd](https://github.com/code-corhuila/synkro-sales-api/commit/03c8ebd2557cae23622ec06b05304c2e4c3a03d8) | JordanRG420 | [#28](https://github.com/code-corhuila/synkro-sales-api/pull/28) | [862a516](https://github.com/code-corhuila/synkro-sales-api/commit/862a5168179e5bc407ba0a0561e3045ddaa20161) |
| 2026-10-18 16:21 | [4140b8d](https://github.com/code-corhuila/synkro-sales-api/commit/4140b8d6090656cfc881289241e1dbba1a2a5de5) | AsolanoT | [#29](https://github.com/code-corhuila/synkro-sales-api/pull/29) | [859c8f7](https://github.com/code-corhuila/synkro-sales-api/commit/859c8f79a437d5cb1e19cf48a9d124966d221508), [b097843](https://github.com/code-corhuila/synkro-sales-api/commit/b09784361d8feb4e049241dac5bad4d3993483d9) |
| 2026-10-18 16:21 | [97defa3](https://github.com/code-corhuila/synkro-sales-api/commit/97defa38a0cf48ad1b95cd7c0d397fd3e2263db8) | AsolanoT | [#29](https://github.com/code-corhuila/synkro-sales-api/pull/29) | [7c8f2ec](https://github.com/code-corhuila/synkro-sales-api/commit/7c8f2eca02f4c4f159dab17d0165c5155aa2609a), [3c5c2f4](https://github.com/code-corhuila/synkro-sales-api/commit/3c5c2f4ac22807e7c437177532e0499dd42e5e0a) |
| 2026-10-18 16:21 | [be5271c](https://github.com/code-corhuila/synkro-sales-api/commit/be5271c57cf12354f709d9c224ea9611222410c0) | JordanRG420 | [#29](https://github.com/code-corhuila/synkro-sales-api/pull/29) | [db8976b](https://github.com/code-corhuila/synkro-sales-api/commit/db8976babb2fc0b17da42fc465245706600cad49), [b03b1d4](https://github.com/code-corhuila/synkro-sales-api/commit/b03b1d40f1a7f66825009a8c755745a8c5ec31a6) |
| 2026-10-18 16:21 | [5583152](https://github.com/code-corhuila/synkro-sales-api/commit/5583152b585ba95a41f7643eebf491f30bed1577) | JordanRG420 | [#29](https://github.com/code-corhuila/synkro-sales-api/pull/29) | [862a516](https://github.com/code-corhuila/synkro-sales-api/commit/862a5168179e5bc407ba0a0561e3045ddaa20161), [03c8ebd](https://github.com/code-corhuila/synkro-sales-api/commit/03c8ebd2557cae23622ec06b05304c2e4c3a03d8) |

### Copied source files (7)

These files are taken from `1bdd32dce7921fdfebc82cc28fd8864ae3697477`, rather than combining conflicting versions from individual commits. The source revision is an October 18 candidate/publication. The changed-file lists were checked against the relevant PRs.

| Actual local file | Immutable upstream file |
|---|---|
| [.github/workflows/ci.yml](./synkro-sales-api/.github/workflows/ci.yml) | [Source](https://github.com/code-corhuila/synkro-sales-api/blob/1bdd32dce7921fdfebc82cc28fd8864ae3697477/.github/workflows/ci.yml) |
| [deploy/Dockerfile](./synkro-sales-api/deploy/Dockerfile) | [Source](https://github.com/code-corhuila/synkro-sales-api/blob/1bdd32dce7921fdfebc82cc28fd8864ae3697477/deploy/Dockerfile) |
| [deploy/ci/mongo-integration.sh](./synkro-sales-api/deploy/ci/mongo-integration.sh) | [Source](https://github.com/code-corhuila/synkro-sales-api/blob/1bdd32dce7921fdfebc82cc28fd8864ae3697477/deploy/ci/mongo-integration.sh) |
| [go.mod](./synkro-sales-api/go.mod) | [Source](https://github.com/code-corhuila/synkro-sales-api/blob/1bdd32dce7921fdfebc82cc28fd8864ae3697477/go.mod) |
| [go.sum](./synkro-sales-api/go.sum) | [Source](https://github.com/code-corhuila/synkro-sales-api/blob/1bdd32dce7921fdfebc82cc28fd8864ae3697477/go.sum) |
| [tests/test_launcher_guards.py](./synkro-sales-api/tests/test_launcher_guards.py) | [Source](https://github.com/code-corhuila/synkro-sales-api/blob/1bdd32dce7921fdfebc82cc28fd8864ae3697477/tests/test_launcher_guards.py) |
| [tests/test_owner_launcher.py](./synkro-sales-api/tests/test_owner_launcher.py) | [Source](https://github.com/code-corhuila/synkro-sales-api/blob/1bdd32dce7921fdfebc82cc28fd8864ae3697477/tests/test_owner_launcher.py) |

### Delivery status recorded for this cut

- [#24 — fix(sales-api): clear reachable Go vulnerabilities (Go 1.26.9, x/net 0.60.0, x/text 0.42.0)](https://github.com/code-corhuila/synkro-sales-api/pull/24): merged, target `develop`, head `018e312`.
- [#25 — fix(sales-api): clear reachable Go vulnerabilities in qa (Go 1.26.9, x/net 0.60.0, x/text 0.42.0)](https://github.com/code-corhuila/synkro-sales-api/pull/25): merged, target `qa`, head `951e799`.
- [#26 — fix(sales-api): clear reachable Go vulnerabilities in release 2.0.0](https://github.com/code-corhuila/synkro-sales-api/pull/26): merged, target `release/2.0.0`, head `c33e0b1`.
- [#27 — fix(sales-api): pin launcher and CI to Sales DB v2.0.0 with launcher regressions](https://github.com/code-corhuila/synkro-sales-api/pull/27): merged, target `develop`, head `862a516`.
- [#28 — fix(sales-api): launcher compatible with Sales DB v2.0.0 in qa (minimal backport)](https://github.com/code-corhuila/synkro-sales-api/pull/28): merged, target `qa`, head `03c8ebd`.
- [#29 — fix(sales-api): launcher compatible with Sales DB v2.0.0 in release 2.0.0 (minimal backport)](https://github.com/code-corhuila/synkro-sales-api/pull/29): merged, target `release/2.0.0`, head `5583152`.
- [#23 — release(sales-api): 2.0.0 — seven user stories without develop PR #7](https://github.com/code-corhuila/synkro-sales-api/pull/23): open, target `main`, head `1bdd32d`.

## synkro-auth-db

HU-AUTH-12 / HU-INF-02 support.

[Local source folder](./synkro-auth-db/) · [Immutable source revision `cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4`](https://github.com/code-corhuila/synkro-auth-db/tree/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4)

**Reported result:** Audit constraints/grants, migration-history isolation and transactional Auth API integration reported on the release candidate.

**Limits and attribution:** HU-AUTH-12 issue #232 is already closed; Auth DB release PR #25 remains open. Schema completion and main publication are different states. Historical audit implementation is not counted again as original weekly work.

### October 18 original AsolanoT commits (2)

| timestamp | Commit | PR | Change |
|---|---|---|---|
| 2026-10-18 15:50 | [f45ffef](https://github.com/code-corhuila/synkro-auth-db/commit/f45ffef4b1ede0a7dd4ae44415f87f41634db7c9) | [#8](https://github.com/code-corhuila/synkro-auth-db/pull/8) | docs(readme): replace the internal course reference with the team layout convention |
| 2026-10-18 15:50 | [cafea68](https://github.com/code-corhuila/synkro-auth-db/commit/cafea68709e82e1076515527347ad294ab103270) | [#8](https://github.com/code-corhuila/synkro-auth-db/pull/8) | docs(readme): point the manual rebuild at the history table inside auth_schema |

### October 18 promotion commits — not counted as new implementation

Timestamps below show re-application. The originating source can predate October 18.

| timestamp | Commit | Author | PR | Source SHA(s) |
|---|---|---|---|---|
| 2026-10-18 16:25 | [3871fb3](https://github.com/code-corhuila/synkro-auth-db/commit/3871fb3d679a2f0b82f981377df7d32fd2a32028) | JordanRG420 | [#14](https://github.com/code-corhuila/synkro-auth-db/pull/14) | [af32135](https://github.com/code-corhuila/synkro-auth-db/commit/af32135bc7f71b0b1bc5aebb9551e064a798cc66) |
| 2026-10-18 16:25 | [0848ef9](https://github.com/code-corhuila/synkro-auth-db/commit/0848ef992723fb392db84538310ab1e6bd811c3b) | JordanRG420 | [#14](https://github.com/code-corhuila/synkro-auth-db/pull/14) | [407a3dc](https://github.com/code-corhuila/synkro-auth-db/commit/407a3dcde48d31812b95804dd087fa6c949dbc64) |
| 2026-10-18 16:25 | [7a29819](https://github.com/code-corhuila/synkro-auth-db/commit/7a298197820389ccc9cb0b2b3b74b2751f89c68e) | JordanRG420 | [#14](https://github.com/code-corhuila/synkro-auth-db/pull/14) | [af13860](https://github.com/code-corhuila/synkro-auth-db/commit/af13860d14d840380a4006ef184425b99e1ee5e1) |
| 2026-10-18 16:25 | [dc979eb](https://github.com/code-corhuila/synkro-auth-db/commit/dc979ebe2b71e9a80d8dff616fe455c3ffe5b231) | JordanRG420 | [#14](https://github.com/code-corhuila/synkro-auth-db/pull/14) | [7c4f927](https://github.com/code-corhuila/synkro-auth-db/commit/7c4f9273412a22c44ebfd5ad0e83f6d805e1b7e8) |
| 2026-10-18 16:25 | [8de8aa6](https://github.com/code-corhuila/synkro-auth-db/commit/8de8aa6d42c5ec759ac572261faf1f7d7dce73c4) | JordanRG420 | [#14](https://github.com/code-corhuila/synkro-auth-db/pull/14) | [a6911d2](https://github.com/code-corhuila/synkro-auth-db/commit/a6911d229f4957e7ae6978decc4ad3e30f387a07) |
| 2026-10-18 16:25 | [289cd0a](https://github.com/code-corhuila/synkro-auth-db/commit/289cd0a0c0868e463e36f4ed60243048996979ea) | JordanRG420 | [#14](https://github.com/code-corhuila/synkro-auth-db/pull/14) | [3eaae5e](https://github.com/code-corhuila/synkro-auth-db/commit/3eaae5ed19d907ca8ed0678ced295b83862b8d65) |
| 2026-10-18 16:25 | [c494064](https://github.com/code-corhuila/synkro-auth-db/commit/c49406434097af96c8c0783cef4646870aa2eb50) | JordanRG420 | [#14](https://github.com/code-corhuila/synkro-auth-db/pull/14) | [05be69d](https://github.com/code-corhuila/synkro-auth-db/commit/05be69d071b13cfcbbf3836dd88a7867cae8f6b2) |
| 2026-10-18 16:42 | [edb2f14](https://github.com/code-corhuila/synkro-auth-db/commit/edb2f14266604bbc53edcb4c415a8010bf4186b8) | JordanRG420 | [#22](https://github.com/code-corhuila/synkro-auth-db/pull/22) | [af32135](https://github.com/code-corhuila/synkro-auth-db/commit/af32135bc7f71b0b1bc5aebb9551e064a798cc66), [3871fb3](https://github.com/code-corhuila/synkro-auth-db/commit/3871fb3d679a2f0b82f981377df7d32fd2a32028) |
| 2026-10-18 16:42 | [ae35091](https://github.com/code-corhuila/synkro-auth-db/commit/ae35091559b7a1dd5eb883dd0f2b8456182c23e1) | JordanRG420 | [#22](https://github.com/code-corhuila/synkro-auth-db/pull/22) | [407a3dc](https://github.com/code-corhuila/synkro-auth-db/commit/407a3dcde48d31812b95804dd087fa6c949dbc64), [0848ef9](https://github.com/code-corhuila/synkro-auth-db/commit/0848ef992723fb392db84538310ab1e6bd811c3b) |
| 2026-10-18 16:42 | [678a858](https://github.com/code-corhuila/synkro-auth-db/commit/678a8580815f0aeeffd1a7712901fcb6eb141e16) | JordanRG420 | [#22](https://github.com/code-corhuila/synkro-auth-db/pull/22) | [af13860](https://github.com/code-corhuila/synkro-auth-db/commit/af13860d14d840380a4006ef184425b99e1ee5e1), [7a29819](https://github.com/code-corhuila/synkro-auth-db/commit/7a298197820389ccc9cb0b2b3b74b2751f89c68e) |
| 2026-10-18 16:42 | [2b32585](https://github.com/code-corhuila/synkro-auth-db/commit/2b325850633bb93b587efa2f9326a7d8b40bdcfb) | JordanRG420 | [#22](https://github.com/code-corhuila/synkro-auth-db/pull/22) | [7c4f927](https://github.com/code-corhuila/synkro-auth-db/commit/7c4f9273412a22c44ebfd5ad0e83f6d805e1b7e8), [dc979eb](https://github.com/code-corhuila/synkro-auth-db/commit/dc979ebe2b71e9a80d8dff616fe455c3ffe5b231) |
| 2026-10-18 16:42 | [11dc6e3](https://github.com/code-corhuila/synkro-auth-db/commit/11dc6e32689688a996910296f2977afa4bc604d3) | JordanRG420 | [#22](https://github.com/code-corhuila/synkro-auth-db/pull/22) | [a6911d2](https://github.com/code-corhuila/synkro-auth-db/commit/a6911d229f4957e7ae6978decc4ad3e30f387a07), [8de8aa6](https://github.com/code-corhuila/synkro-auth-db/commit/8de8aa6d42c5ec759ac572261faf1f7d7dce73c4) |
| 2026-10-18 16:42 | [5aff31f](https://github.com/code-corhuila/synkro-auth-db/commit/5aff31f6caa969d3078d4883bc9d30047c066d7d) | JordanRG420 | [#22](https://github.com/code-corhuila/synkro-auth-db/pull/22) | [3eaae5e](https://github.com/code-corhuila/synkro-auth-db/commit/3eaae5ed19d907ca8ed0678ced295b83862b8d65), [289cd0a](https://github.com/code-corhuila/synkro-auth-db/commit/289cd0a0c0868e463e36f4ed60243048996979ea) |
| 2026-10-18 16:43 | [3b12aba](https://github.com/code-corhuila/synkro-auth-db/commit/3b12abaec2d270ae5e1d320d1890617b5069eda2) | JordanRG420 | [#22](https://github.com/code-corhuila/synkro-auth-db/pull/22) | [05be69d](https://github.com/code-corhuila/synkro-auth-db/commit/05be69d071b13cfcbbf3836dd88a7867cae8f6b2), [c494064](https://github.com/code-corhuila/synkro-auth-db/commit/c49406434097af96c8c0783cef4646870aa2eb50) |

### Copied source files (39)

These files are taken from `cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4`, rather than combining conflicting versions from individual commits. The source revision is an October 18 candidate/publication. The changed-file lists were checked against the relevant PRs.

| Actual local file | Immutable upstream file |
|---|---|
| [.github/scripts/db-checks.sh](./synkro-auth-db/.github/scripts/db-checks.sh) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/.github/scripts/db-checks.sh) |
| [.github/workflows/db-ci.yml](./synkro-auth-db/.github/workflows/db-ci.yml) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/.github/workflows/db-ci.yml) |
| [01_ddl/01_schemas/V001__create_schema_auth.sql](./synkro-auth-db/01_ddl/01_schemas/V001__create_schema_auth.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/01_schemas/V001__create_schema_auth.sql) |
| [01_ddl/03_tables/V006__create_system_user.sql](./synkro-auth-db/01_ddl/03_tables/V006__create_system_user.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/03_tables/V006__create_system_user.sql) |
| [01_ddl/03_tables/V007__create_refresh_token.sql](./synkro-auth-db/01_ddl/03_tables/V007__create_refresh_token.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/03_tables/V007__create_refresh_token.sql) |
| [01_ddl/03_tables/V010__create_service_token.sql](./synkro-auth-db/01_ddl/03_tables/V010__create_service_token.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/03_tables/V010__create_service_token.sql) |
| [01_ddl/03_tables/V011__create_idempotency_key.sql](./synkro-auth-db/01_ddl/03_tables/V011__create_idempotency_key.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/03_tables/V011__create_idempotency_key.sql) |
| [01_ddl/03_tables/V014__create_user_creation_audit.sql](./synkro-auth-db/01_ddl/03_tables/V014__create_user_creation_audit.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/03_tables/V014__create_user_creation_audit.sql) |
| [01_ddl/04_alter/V008__add_refresh_token_foreign_key.sql](./synkro-auth-db/01_ddl/04_alter/V008__add_refresh_token_foreign_key.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/04_alter/V008__add_refresh_token_foreign_key.sql) |
| [01_ddl/04_alter/V012__add_service_token_foreign_key.sql](./synkro-auth-db/01_ddl/04_alter/V012__add_service_token_foreign_key.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/04_alter/V012__add_service_token_foreign_key.sql) |
| [01_ddl/04_alter/V015__add_user_creation_audit_foreign_keys.sql](./synkro-auth-db/01_ddl/04_alter/V015__add_user_creation_audit_foreign_keys.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/04_alter/V015__add_user_creation_audit_foreign_keys.sql) |
| [01_ddl/10_indexes/V009__create_refresh_token_indexes.sql](./synkro-auth-db/01_ddl/10_indexes/V009__create_refresh_token_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/10_indexes/V009__create_refresh_token_indexes.sql) |
| [01_ddl/10_indexes/V013__create_service_token_indexes.sql](./synkro-auth-db/01_ddl/10_indexes/V013__create_service_token_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/10_indexes/V013__create_service_token_indexes.sql) |
| [01_ddl/10_indexes/V016__create_user_creation_audit_indexes.sql](./synkro-auth-db/01_ddl/10_indexes/V016__create_user_creation_audit_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/01_ddl/10_indexes/V016__create_user_creation_audit_indexes.sql) |
| [03_dcl/00_roles/V002__create_roles.sql](./synkro-auth-db/03_dcl/00_roles/V002__create_roles.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/03_dcl/00_roles/V002__create_roles.sql) |
| [03_dcl/00_roles/V004__create_auth_reader_role.sql](./synkro-auth-db/03_dcl/00_roles/V004__create_auth_reader_role.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/03_dcl/00_roles/V004__create_auth_reader_role.sql) |
| [03_dcl/01_grants/V003__grants.sql](./synkro-auth-db/03_dcl/01_grants/V003__grants.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/03_dcl/01_grants/V003__grants.sql) |
| [03_dcl/01_grants/V005__grant_auth_reader.sql](./synkro-auth-db/03_dcl/01_grants/V005__grant_auth_reader.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/03_dcl/01_grants/V005__grant_auth_reader.sql) |
| [03_dcl/01_grants/V017__grant_user_creation_audit.sql](./synkro-auth-db/03_dcl/01_grants/V017__grant_user_creation_audit.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/03_dcl/01_grants/V017__grant_user_creation_audit.sql) |
| [05_rollbacks/01_ddl/01_schemas/U001__create_schema_auth.sql](./synkro-auth-db/05_rollbacks/01_ddl/01_schemas/U001__create_schema_auth.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/01_schemas/U001__create_schema_auth.sql) |
| [05_rollbacks/01_ddl/03_tables/U006__create_system_user.sql](./synkro-auth-db/05_rollbacks/01_ddl/03_tables/U006__create_system_user.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/03_tables/U006__create_system_user.sql) |
| [05_rollbacks/01_ddl/03_tables/U007__create_refresh_token.sql](./synkro-auth-db/05_rollbacks/01_ddl/03_tables/U007__create_refresh_token.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/03_tables/U007__create_refresh_token.sql) |
| [05_rollbacks/01_ddl/03_tables/U010__create_service_token.sql](./synkro-auth-db/05_rollbacks/01_ddl/03_tables/U010__create_service_token.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/03_tables/U010__create_service_token.sql) |
| [05_rollbacks/01_ddl/03_tables/U011__create_idempotency_key.sql](./synkro-auth-db/05_rollbacks/01_ddl/03_tables/U011__create_idempotency_key.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/03_tables/U011__create_idempotency_key.sql) |
| [05_rollbacks/01_ddl/03_tables/U014__create_user_creation_audit.sql](./synkro-auth-db/05_rollbacks/01_ddl/03_tables/U014__create_user_creation_audit.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/03_tables/U014__create_user_creation_audit.sql) |
| [05_rollbacks/01_ddl/04_alter/U008__add_refresh_token_foreign_key.sql](./synkro-auth-db/05_rollbacks/01_ddl/04_alter/U008__add_refresh_token_foreign_key.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/04_alter/U008__add_refresh_token_foreign_key.sql) |
| [05_rollbacks/01_ddl/04_alter/U012__add_service_token_foreign_key.sql](./synkro-auth-db/05_rollbacks/01_ddl/04_alter/U012__add_service_token_foreign_key.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/04_alter/U012__add_service_token_foreign_key.sql) |
| [05_rollbacks/01_ddl/04_alter/U015__add_user_creation_audit_foreign_keys.sql](./synkro-auth-db/05_rollbacks/01_ddl/04_alter/U015__add_user_creation_audit_foreign_keys.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/04_alter/U015__add_user_creation_audit_foreign_keys.sql) |
| [05_rollbacks/01_ddl/10_indexes/U009__create_refresh_token_indexes.sql](./synkro-auth-db/05_rollbacks/01_ddl/10_indexes/U009__create_refresh_token_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/10_indexes/U009__create_refresh_token_indexes.sql) |
| [05_rollbacks/01_ddl/10_indexes/U013__create_service_token_indexes.sql](./synkro-auth-db/05_rollbacks/01_ddl/10_indexes/U013__create_service_token_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/10_indexes/U013__create_service_token_indexes.sql) |
| [05_rollbacks/01_ddl/10_indexes/U016__create_user_creation_audit_indexes.sql](./synkro-auth-db/05_rollbacks/01_ddl/10_indexes/U016__create_user_creation_audit_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/01_ddl/10_indexes/U016__create_user_creation_audit_indexes.sql) |
| [05_rollbacks/03_dcl/00_roles/U002__create_roles.sql](./synkro-auth-db/05_rollbacks/03_dcl/00_roles/U002__create_roles.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/03_dcl/00_roles/U002__create_roles.sql) |
| [05_rollbacks/03_dcl/00_roles/U004__create_auth_reader_role.sql](./synkro-auth-db/05_rollbacks/03_dcl/00_roles/U004__create_auth_reader_role.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/03_dcl/00_roles/U004__create_auth_reader_role.sql) |
| [05_rollbacks/03_dcl/01_grants/U003__grants.sql](./synkro-auth-db/05_rollbacks/03_dcl/01_grants/U003__grants.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/03_dcl/01_grants/U003__grants.sql) |
| [05_rollbacks/03_dcl/01_grants/U005__grant_auth_reader.sql](./synkro-auth-db/05_rollbacks/03_dcl/01_grants/U005__grant_auth_reader.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/03_dcl/01_grants/U005__grant_auth_reader.sql) |
| [05_rollbacks/03_dcl/01_grants/U017__grant_user_creation_audit.sql](./synkro-auth-db/05_rollbacks/03_dcl/01_grants/U017__grant_user_creation_audit.sql) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/05_rollbacks/03_dcl/01_grants/U017__grant_user_creation_audit.sql) |
| [deploy/compose.yml](./synkro-auth-db/deploy/compose.yml) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/deploy/compose.yml) |
| [flyway.toml](./synkro-auth-db/flyway.toml) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/flyway.toml) |
| [tests/test_history_contract.py](./synkro-auth-db/tests/test_history_contract.py) | [Source](https://github.com/code-corhuila/synkro-auth-db/blob/cf63c0e743f985b1dc729d4f72151d2e2f0eb5b4/tests/test_history_contract.py) |

### Delivery status recorded for this cut

- [#14 — feat(qa): HU-AUTH-12 user creation audit and restricted grants (cherry-pick -x)](https://github.com/code-corhuila/synkro-auth-db/pull/14): merged, target `qa`, head `c494064`.
- [#22 — feat(release): HU-AUTH-12 user creation audit and restricted grants (cherry-pick -x)](https://github.com/code-corhuila/synkro-auth-db/pull/22): merged, target `release/2.0.0`, head `3b12aba`.
- [#25 — release(auth-db): publish 2.0.0](https://github.com/code-corhuila/synkro-auth-db/pull/25): open, target `main`, head `cf63c0e`.
- [#8 — docs(auth-db): replace internal course reference in README with the team layout convention](https://github.com/code-corhuila/synkro-auth-db/pull/8): merged, target `develop`, head `cafea68`.

## synkro-products-db

HU-INF-02 support / Products DB component release.

[Local source folder](./synkro-products-db/) · [Immutable source revision `043e485d16018fc4fb4cd60694c2a521c143ddbd`](https://github.com/code-corhuila/synkro-products-db/tree/043e485d16018fc4fb4cd60694c2a521c143ddbd)

**Reported result:** Annotated v2.0.0 published on main 043e485d16018fc4fb4cd60694c2a521c143ddbd; official runner checked from a clean tag copy. Earlier 108-check report is historical, not a new run.

**Limits and attribution:** Tag object d480c88e41659396670bfd7e1a593c3f7e4ab611 is distinct from the commit. Main CI did not run due to billing. Global Docker inventory limitation remains; restore requires cluster roles to exist.

### October 18 original AsolanoT commits (0)

No new original AsolanoT implementation commit is counted for this repository in the selected PRs.

### October 18 publication / merge

| timestamp | Commit | Author | PR | Change |
|---|---|---|---|---|
| 2026-10-18 15:20 | [043e485](https://github.com/code-corhuila/synkro-products-db/commit/043e485d16018fc4fb4cd60694c2a521c143ddbd) | AsolanoT | [#22](https://github.com/code-corhuila/synkro-products-db/pull/22) | release(products-db): publish 2.0.0 (#22) |

### Copied source files (38)

These files are taken from `043e485d16018fc4fb4cd60694c2a521c143ddbd`, rather than combining conflicting versions from individual commits. The source revision is an October 18 candidate/publication. The changed-file lists were checked against the relevant PRs.

| Actual local file | Immutable upstream file |
|---|---|
| [.github/workflows/db-ci.yml](./synkro-products-db/.github/workflows/db-ci.yml) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/.github/workflows/db-ci.yml) |
| [01_ddl/01_schemas/V001__create_schema_products.sql](./synkro-products-db/01_ddl/01_schemas/V001__create_schema_products.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/01_schemas/V001__create_schema_products.sql) |
| [01_ddl/03_tables/V004__create_category.sql](./synkro-products-db/01_ddl/03_tables/V004__create_category.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/03_tables/V004__create_category.sql) |
| [01_ddl/03_tables/V005__create_product.sql](./synkro-products-db/01_ddl/03_tables/V005__create_product.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/03_tables/V005__create_product.sql) |
| [01_ddl/03_tables/V008__create_idempotency_key.sql](./synkro-products-db/01_ddl/03_tables/V008__create_idempotency_key.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/03_tables/V008__create_idempotency_key.sql) |
| [01_ddl/03_tables/V009__create_stock_adjustment.sql](./synkro-products-db/01_ddl/03_tables/V009__create_stock_adjustment.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/03_tables/V009__create_stock_adjustment.sql) |
| [01_ddl/03_tables/V010__create_stock_reservation.sql](./synkro-products-db/01_ddl/03_tables/V010__create_stock_reservation.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/03_tables/V010__create_stock_reservation.sql) |
| [01_ddl/03_tables/V011__create_stock_reservation_line.sql](./synkro-products-db/01_ddl/03_tables/V011__create_stock_reservation_line.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/03_tables/V011__create_stock_reservation_line.sql) |
| [01_ddl/03_tables/V014__create_stock_alert.sql](./synkro-products-db/01_ddl/03_tables/V014__create_stock_alert.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/03_tables/V014__create_stock_alert.sql) |
| [01_ddl/04_alter/V006__add_foreign_keys.sql](./synkro-products-db/01_ddl/04_alter/V006__add_foreign_keys.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/04_alter/V006__add_foreign_keys.sql) |
| [01_ddl/04_alter/V012__add_foreign_keys.sql](./synkro-products-db/01_ddl/04_alter/V012__add_foreign_keys.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/04_alter/V012__add_foreign_keys.sql) |
| [01_ddl/04_alter/V015__add_foreign_keys.sql](./synkro-products-db/01_ddl/04_alter/V015__add_foreign_keys.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/04_alter/V015__add_foreign_keys.sql) |
| [01_ddl/04_alter/V017__add_stock_after_to_stock_adjustment.sql](./synkro-products-db/01_ddl/04_alter/V017__add_stock_after_to_stock_adjustment.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/04_alter/V017__add_stock_after_to_stock_adjustment.sql) |
| [01_ddl/10_indexes/V007__create_indexes.sql](./synkro-products-db/01_ddl/10_indexes/V007__create_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/10_indexes/V007__create_indexes.sql) |
| [01_ddl/10_indexes/V013__create_indexes.sql](./synkro-products-db/01_ddl/10_indexes/V013__create_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/10_indexes/V013__create_indexes.sql) |
| [01_ddl/10_indexes/V016__create_indexes.sql](./synkro-products-db/01_ddl/10_indexes/V016__create_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/01_ddl/10_indexes/V016__create_indexes.sql) |
| [03_dcl/00_roles/V002__create_roles.sql](./synkro-products-db/03_dcl/00_roles/V002__create_roles.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/03_dcl/00_roles/V002__create_roles.sql) |
| [03_dcl/01_grants/V003__grants.sql](./synkro-products-db/03_dcl/01_grants/V003__grants.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/03_dcl/01_grants/V003__grants.sql) |
| [05_rollbacks/01_ddl/01_schemas/U001__create_schema_products.sql](./synkro-products-db/05_rollbacks/01_ddl/01_schemas/U001__create_schema_products.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/01_schemas/U001__create_schema_products.sql) |
| [05_rollbacks/01_ddl/03_tables/U004__create_category.sql](./synkro-products-db/05_rollbacks/01_ddl/03_tables/U004__create_category.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/03_tables/U004__create_category.sql) |
| [05_rollbacks/01_ddl/03_tables/U005__create_product.sql](./synkro-products-db/05_rollbacks/01_ddl/03_tables/U005__create_product.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/03_tables/U005__create_product.sql) |
| [05_rollbacks/01_ddl/03_tables/U008__create_idempotency_key.sql](./synkro-products-db/05_rollbacks/01_ddl/03_tables/U008__create_idempotency_key.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/03_tables/U008__create_idempotency_key.sql) |
| [05_rollbacks/01_ddl/03_tables/U009__create_stock_adjustment.sql](./synkro-products-db/05_rollbacks/01_ddl/03_tables/U009__create_stock_adjustment.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/03_tables/U009__create_stock_adjustment.sql) |
| [05_rollbacks/01_ddl/03_tables/U010__create_stock_reservation.sql](./synkro-products-db/05_rollbacks/01_ddl/03_tables/U010__create_stock_reservation.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/03_tables/U010__create_stock_reservation.sql) |
| [05_rollbacks/01_ddl/03_tables/U011__create_stock_reservation_line.sql](./synkro-products-db/05_rollbacks/01_ddl/03_tables/U011__create_stock_reservation_line.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/03_tables/U011__create_stock_reservation_line.sql) |
| [05_rollbacks/01_ddl/03_tables/U014__create_stock_alert.sql](./synkro-products-db/05_rollbacks/01_ddl/03_tables/U014__create_stock_alert.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/03_tables/U014__create_stock_alert.sql) |
| [05_rollbacks/01_ddl/04_alter/U006__add_foreign_keys.sql](./synkro-products-db/05_rollbacks/01_ddl/04_alter/U006__add_foreign_keys.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/04_alter/U006__add_foreign_keys.sql) |
| [05_rollbacks/01_ddl/04_alter/U012__add_foreign_keys.sql](./synkro-products-db/05_rollbacks/01_ddl/04_alter/U012__add_foreign_keys.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/04_alter/U012__add_foreign_keys.sql) |
| [05_rollbacks/01_ddl/04_alter/U015__add_foreign_keys.sql](./synkro-products-db/05_rollbacks/01_ddl/04_alter/U015__add_foreign_keys.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/04_alter/U015__add_foreign_keys.sql) |
| [05_rollbacks/01_ddl/04_alter/U017__add_stock_after_to_stock_adjustment.sql](./synkro-products-db/05_rollbacks/01_ddl/04_alter/U017__add_stock_after_to_stock_adjustment.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/04_alter/U017__add_stock_after_to_stock_adjustment.sql) |
| [05_rollbacks/01_ddl/10_indexes/U007__create_indexes.sql](./synkro-products-db/05_rollbacks/01_ddl/10_indexes/U007__create_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/10_indexes/U007__create_indexes.sql) |
| [05_rollbacks/01_ddl/10_indexes/U013__create_indexes.sql](./synkro-products-db/05_rollbacks/01_ddl/10_indexes/U013__create_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/10_indexes/U013__create_indexes.sql) |
| [05_rollbacks/01_ddl/10_indexes/U016__create_indexes.sql](./synkro-products-db/05_rollbacks/01_ddl/10_indexes/U016__create_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/01_ddl/10_indexes/U016__create_indexes.sql) |
| [05_rollbacks/03_dcl/00_roles/U002__create_roles.sql](./synkro-products-db/05_rollbacks/03_dcl/00_roles/U002__create_roles.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/03_dcl/00_roles/U002__create_roles.sql) |
| [05_rollbacks/03_dcl/01_grants/U003__grants.sql](./synkro-products-db/05_rollbacks/03_dcl/01_grants/U003__grants.sql) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/05_rollbacks/03_dcl/01_grants/U003__grants.sql) |
| [deploy/compose.yml](./synkro-products-db/deploy/compose.yml) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/deploy/compose.yml) |
| [flyway.toml](./synkro-products-db/flyway.toml) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/flyway.toml) |
| [tests/test_history_contract.py](./synkro-products-db/tests/test_history_contract.py) | [Source](https://github.com/code-corhuila/synkro-products-db/blob/043e485d16018fc4fb4cd60694c2a521c143ddbd/tests/test_history_contract.py) |

### Delivery status recorded for this cut

- [#22 — release(products-db): publish 2.0.0](https://github.com/code-corhuila/synkro-products-db/pull/22): merged, target `main`, head `6cca535`.

## synkro-workflow

HU-WKF-03.

[Local source folder](./synkro-workflow/) · [Immutable source revision `b3ecbe6c75f7038b9b8fe11d396bf00a642bb248`](https://github.com/code-corhuila/synkro-workflow/tree/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248)

**Reported result:** 43 Maven tests; global coverage 91.30%; real-participant registration, compensation, idempotent replay, restart and interruption recovery reported.

**Limits and attribution:** Separate controlled-process suite: 43 passed / 1 blocked. Not a fully real browser run. PR #13 remains open and dependencies include untagged release candidates. HU-WKF-03 remains open.

### October 18 original AsolanoT commits (1)

| timestamp | Commit | PR | Change |
|---|---|---|---|
| 2026-10-18 17:34 | [5c80cf1](https://github.com/code-corhuila/synkro-workflow/commit/5c80cf123778b6bc8cdb084d5ff6004ef9239ad4) | [#14](https://github.com/code-corhuila/synkro-workflow/pull/14) | docs(readme): remove obsolete Customers GET 501 claim |

### October 18 promotion commits — not counted as new implementation

Timestamps below show re-application. The originating source can predate October 18.

| timestamp | Commit | Author | PR | Source SHA(s) |
|---|---|---|---|---|
| 2026-10-18 16:01 | [a8b48c8](https://github.com/code-corhuila/synkro-workflow/commit/a8b48c88166c4d432b363984fff6608fe0234c5c) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [8fe92fb](https://github.com/code-corhuila/synkro-workflow/commit/8fe92fb5fbb3bee789310a75e3dd06d184d2bdab) |
| 2026-10-18 16:01 | [e9ce2d2](https://github.com/code-corhuila/synkro-workflow/commit/e9ce2d298707a369529ba7f7091bf358a63c00e2) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [ee9bf41](https://github.com/code-corhuila/synkro-workflow/commit/ee9bf41440a748d72d7cab5542218ec70c39e621) |
| 2026-10-18 16:01 | [1b0bce2](https://github.com/code-corhuila/synkro-workflow/commit/1b0bce227a52ae95e5f21b0853cc9c9c53ce3f1b) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [c5118e8](https://github.com/code-corhuila/synkro-workflow/commit/c5118e899819ddddf7410d4bcd1438a50db3b7c7) |
| 2026-10-18 16:01 | [19511c8](https://github.com/code-corhuila/synkro-workflow/commit/19511c8417f4a3ce19bfd79cf3971e85a9b80fe2) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [260a747](https://github.com/code-corhuila/synkro-workflow/commit/260a747ff68a43ae2232b5b0e28d65a407682b7e) |
| 2026-10-18 16:01 | [b71d9c3](https://github.com/code-corhuila/synkro-workflow/commit/b71d9c30e5cc745fd5b6e845c4616e2e3a2ef7a8) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [78442ea](https://github.com/code-corhuila/synkro-workflow/commit/78442ea702d98c619500d4031cbea0aee545040b) |
| 2026-10-18 16:01 | [00d240f](https://github.com/code-corhuila/synkro-workflow/commit/00d240f3191ddcabd654abd35f28da3c217063ce) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [0dfdcd0](https://github.com/code-corhuila/synkro-workflow/commit/0dfdcd07c52d0c0f614b64ca3e08ada9623a964a) |
| 2026-10-18 16:01 | [ecf45e9](https://github.com/code-corhuila/synkro-workflow/commit/ecf45e9bb0e3d094c795139e9e913b8b21d08428) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [e3379fc](https://github.com/code-corhuila/synkro-workflow/commit/e3379fc178b6b90f8354160a8d936ab4a514c1e4) |
| 2026-10-18 16:01 | [aa53e03](https://github.com/code-corhuila/synkro-workflow/commit/aa53e0383a51fb319c678f89a254b2d2418effd7) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [972143b](https://github.com/code-corhuila/synkro-workflow/commit/972143b4cb898ee6a6858d8af6eb7e2d097b5278) |
| 2026-10-18 16:01 | [e84d6e2](https://github.com/code-corhuila/synkro-workflow/commit/e84d6e264ba87d915226c413ffe2fbbcfd0e1e28) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [57ebf47](https://github.com/code-corhuila/synkro-workflow/commit/57ebf478d305ca3f47c4eae2588dfd2570dec2fc) |
| 2026-10-18 16:01 | [5e63174](https://github.com/code-corhuila/synkro-workflow/commit/5e631744d900479ae6285b0ca0bd9e7809737ecf) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [cd25740](https://github.com/code-corhuila/synkro-workflow/commit/cd25740be8e75183003be85b43f793954a6d2f74) |
| 2026-10-18 16:01 | [9280689](https://github.com/code-corhuila/synkro-workflow/commit/92806898024be459e69397019f3a3b6172a8efc7) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [4a5b240](https://github.com/code-corhuila/synkro-workflow/commit/4a5b2401dcd86a4ddc03e266b69036fe2d00f4e6) |
| 2026-10-18 16:01 | [de94950](https://github.com/code-corhuila/synkro-workflow/commit/de94950267d574ce94f5fba34b6ea97b118314df) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [28a9ac9](https://github.com/code-corhuila/synkro-workflow/commit/28a9ac95bb01f3af1b9540489e8920517b4c4595) |
| 2026-10-18 16:01 | [2c3f1b8](https://github.com/code-corhuila/synkro-workflow/commit/2c3f1b89d8300ecd3d3b3d723dded1edd70493e1) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [beee27d](https://github.com/code-corhuila/synkro-workflow/commit/beee27dc183bc4cd9f4b9a2ffb2ee980dcb80966) |
| 2026-10-18 16:01 | [a5d20c6](https://github.com/code-corhuila/synkro-workflow/commit/a5d20c66a0db538c3eda8dc6648e52e09c18f47f) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [9dd0013](https://github.com/code-corhuila/synkro-workflow/commit/9dd00133e2a85cabb94c4ab9dcdea8dc8ac8b3f2) |
| 2026-10-18 16:01 | [4b1580b](https://github.com/code-corhuila/synkro-workflow/commit/4b1580b40216b6e8c0c2be84b09d438726086eaf) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [a1ea528](https://github.com/code-corhuila/synkro-workflow/commit/a1ea5289a156edefde449da72de671fb2942346b) |
| 2026-10-18 16:01 | [46fdb5e](https://github.com/code-corhuila/synkro-workflow/commit/46fdb5ee776f26f91354769dd7b006ab29a8225c) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [e695509](https://github.com/code-corhuila/synkro-workflow/commit/e6955091f03c59a6370761f4ba8c0091714d64b6) |
| 2026-10-18 16:01 | [2c19d94](https://github.com/code-corhuila/synkro-workflow/commit/2c19d9429a7da74db93fb49794e285a711d358b6) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [bff87bc](https://github.com/code-corhuila/synkro-workflow/commit/bff87bcb038e2b23d64c0da65c1f7d39614d6d68) |
| 2026-10-18 16:01 | [79bb2bb](https://github.com/code-corhuila/synkro-workflow/commit/79bb2bb12b127759d34cd2c7fd1c4a0ed9b517a7) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [a6b31bd](https://github.com/code-corhuila/synkro-workflow/commit/a6b31bdba17812cd61c8cead3bb9b269a82868f2) |
| 2026-10-18 16:01 | [6c17a66](https://github.com/code-corhuila/synkro-workflow/commit/6c17a66d27a4141a7599bda6f00a3b54000abb64) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [220233f](https://github.com/code-corhuila/synkro-workflow/commit/220233f06922cd7dfba2be51eea12e08c3f784db) |
| 2026-10-18 16:01 | [f076e85](https://github.com/code-corhuila/synkro-workflow/commit/f076e85823c343e664f3a36959e0149de533ab3f) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [287cb84](https://github.com/code-corhuila/synkro-workflow/commit/287cb84923718b6466478437780b043de161b097) |
| 2026-10-18 16:01 | [0c8bf40](https://github.com/code-corhuila/synkro-workflow/commit/0c8bf40836132b8aed7965cd2cb5b814d586d57b) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [81b75a5](https://github.com/code-corhuila/synkro-workflow/commit/81b75a56fa612c6cd39f5c591c752fc0c42a8802) |
| 2026-10-18 16:01 | [62339c2](https://github.com/code-corhuila/synkro-workflow/commit/62339c21a98ebe19bf72ccfbc384abfb28e83668) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [462644e](https://github.com/code-corhuila/synkro-workflow/commit/462644e0e79bbfffdefdcdfb8ae6e25ac0122358) |
| 2026-10-18 16:01 | [0056f74](https://github.com/code-corhuila/synkro-workflow/commit/0056f74702224452000490a5b2e714a2f7532049) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [efe0656](https://github.com/code-corhuila/synkro-workflow/commit/efe06565f93e6e56b7010dfd9bf5451f14a03d26) |
| 2026-10-18 16:01 | [08ca187](https://github.com/code-corhuila/synkro-workflow/commit/08ca187395289c78c3ea5a5ce561515ca674a887) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [0f4e005](https://github.com/code-corhuila/synkro-workflow/commit/0f4e00545a439a8b5ba32cb2e13fcb903084b97c) |
| 2026-10-18 16:01 | [bcaa8fb](https://github.com/code-corhuila/synkro-workflow/commit/bcaa8fb5b313d81df3af8a63385b2741eba0cbab) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [6f94777](https://github.com/code-corhuila/synkro-workflow/commit/6f947778bfd795b163ef34cf7f900c12ed3aa864) |
| 2026-10-18 16:01 | [ef74fd2](https://github.com/code-corhuila/synkro-workflow/commit/ef74fd2792efa243417cf936728037de9c8f56c8) | AsolanoT | [#8](https://github.com/code-corhuila/synkro-workflow/pull/8) | [0afd8cd](https://github.com/code-corhuila/synkro-workflow/commit/0afd8cde592c3efa5b44b63026001b0c262d4b2b) |
| 2026-10-18 16:09 | [7d4b958](https://github.com/code-corhuila/synkro-workflow/commit/7d4b958c237d64516c75df9977837b2e9ced3276) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [8fe92fb](https://github.com/code-corhuila/synkro-workflow/commit/8fe92fb5fbb3bee789310a75e3dd06d184d2bdab), [a8b48c8](https://github.com/code-corhuila/synkro-workflow/commit/a8b48c88166c4d432b363984fff6608fe0234c5c) |
| 2026-10-18 16:09 | [248513d](https://github.com/code-corhuila/synkro-workflow/commit/248513d80cf6fb08e32111945b8c2c8474b1433c) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [ee9bf41](https://github.com/code-corhuila/synkro-workflow/commit/ee9bf41440a748d72d7cab5542218ec70c39e621), [e9ce2d2](https://github.com/code-corhuila/synkro-workflow/commit/e9ce2d298707a369529ba7f7091bf358a63c00e2) |
| 2026-10-18 16:09 | [c860133](https://github.com/code-corhuila/synkro-workflow/commit/c8601330b20ec9468d54a62589b64bea5dee099c) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [c5118e8](https://github.com/code-corhuila/synkro-workflow/commit/c5118e899819ddddf7410d4bcd1438a50db3b7c7), [1b0bce2](https://github.com/code-corhuila/synkro-workflow/commit/1b0bce227a52ae95e5f21b0853cc9c9c53ce3f1b) |
| 2026-10-18 16:09 | [84787ac](https://github.com/code-corhuila/synkro-workflow/commit/84787accba84880c5368a5e91c3c92f18503c59f) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [260a747](https://github.com/code-corhuila/synkro-workflow/commit/260a747ff68a43ae2232b5b0e28d65a407682b7e), [19511c8](https://github.com/code-corhuila/synkro-workflow/commit/19511c8417f4a3ce19bfd79cf3971e85a9b80fe2) |
| 2026-10-18 16:09 | [55d57f6](https://github.com/code-corhuila/synkro-workflow/commit/55d57f60c33116d14da67e48e8aa583f6053d23f) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [78442ea](https://github.com/code-corhuila/synkro-workflow/commit/78442ea702d98c619500d4031cbea0aee545040b), [b71d9c3](https://github.com/code-corhuila/synkro-workflow/commit/b71d9c30e5cc745fd5b6e845c4616e2e3a2ef7a8) |
| 2026-10-18 16:09 | [b1de63a](https://github.com/code-corhuila/synkro-workflow/commit/b1de63a5d25fc1fad1a3430d5939ee42747bc6f3) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [0dfdcd0](https://github.com/code-corhuila/synkro-workflow/commit/0dfdcd07c52d0c0f614b64ca3e08ada9623a964a), [00d240f](https://github.com/code-corhuila/synkro-workflow/commit/00d240f3191ddcabd654abd35f28da3c217063ce) |
| 2026-10-18 16:09 | [5fb50e6](https://github.com/code-corhuila/synkro-workflow/commit/5fb50e66e56874787e6d2340a078da3023b7dea7) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [e3379fc](https://github.com/code-corhuila/synkro-workflow/commit/e3379fc178b6b90f8354160a8d936ab4a514c1e4), [ecf45e9](https://github.com/code-corhuila/synkro-workflow/commit/ecf45e9bb0e3d094c795139e9e913b8b21d08428) |
| 2026-10-18 16:09 | [c7f1b5a](https://github.com/code-corhuila/synkro-workflow/commit/c7f1b5a4f444cc9e27ec2f0d95cb9f3c7f77243f) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [972143b](https://github.com/code-corhuila/synkro-workflow/commit/972143b4cb898ee6a6858d8af6eb7e2d097b5278), [aa53e03](https://github.com/code-corhuila/synkro-workflow/commit/aa53e0383a51fb319c678f89a254b2d2418effd7) |
| 2026-10-18 16:09 | [e0d9e81](https://github.com/code-corhuila/synkro-workflow/commit/e0d9e81802a1122a4f0075fb0a9a48fb338b1396) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [57ebf47](https://github.com/code-corhuila/synkro-workflow/commit/57ebf478d305ca3f47c4eae2588dfd2570dec2fc), [e84d6e2](https://github.com/code-corhuila/synkro-workflow/commit/e84d6e264ba87d915226c413ffe2fbbcfd0e1e28) |
| 2026-10-18 16:09 | [b935643](https://github.com/code-corhuila/synkro-workflow/commit/b935643a4a8af1f991215c5e921b990612344bc1) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [cd25740](https://github.com/code-corhuila/synkro-workflow/commit/cd25740be8e75183003be85b43f793954a6d2f74), [5e63174](https://github.com/code-corhuila/synkro-workflow/commit/5e631744d900479ae6285b0ca0bd9e7809737ecf) |
| 2026-10-18 16:09 | [4ab7c17](https://github.com/code-corhuila/synkro-workflow/commit/4ab7c174548b62af5c01806943a5d221eca9afbb) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [4a5b240](https://github.com/code-corhuila/synkro-workflow/commit/4a5b2401dcd86a4ddc03e266b69036fe2d00f4e6), [9280689](https://github.com/code-corhuila/synkro-workflow/commit/92806898024be459e69397019f3a3b6172a8efc7) |
| 2026-10-18 16:09 | [a087368](https://github.com/code-corhuila/synkro-workflow/commit/a087368649206907d325d1d456b0bb8fb1418329) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [28a9ac9](https://github.com/code-corhuila/synkro-workflow/commit/28a9ac95bb01f3af1b9540489e8920517b4c4595), [de94950](https://github.com/code-corhuila/synkro-workflow/commit/de94950267d574ce94f5fba34b6ea97b118314df) |
| 2026-10-18 16:09 | [61ce026](https://github.com/code-corhuila/synkro-workflow/commit/61ce026da29f2bbf20c2cb88cec9f1569751d6ea) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [beee27d](https://github.com/code-corhuila/synkro-workflow/commit/beee27dc183bc4cd9f4b9a2ffb2ee980dcb80966), [2c3f1b8](https://github.com/code-corhuila/synkro-workflow/commit/2c3f1b89d8300ecd3d3b3d723dded1edd70493e1) |
| 2026-10-18 16:09 | [42a1e36](https://github.com/code-corhuila/synkro-workflow/commit/42a1e36d51f1470209f6fed4b6dee8f39fa7e991) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [9dd0013](https://github.com/code-corhuila/synkro-workflow/commit/9dd00133e2a85cabb94c4ab9dcdea8dc8ac8b3f2), [a5d20c6](https://github.com/code-corhuila/synkro-workflow/commit/a5d20c66a0db538c3eda8dc6648e52e09c18f47f) |
| 2026-10-18 16:09 | [b512616](https://github.com/code-corhuila/synkro-workflow/commit/b5126161f78f5e9cb734a9cef7168229cc4eaa35) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [a1ea528](https://github.com/code-corhuila/synkro-workflow/commit/a1ea5289a156edefde449da72de671fb2942346b), [4b1580b](https://github.com/code-corhuila/synkro-workflow/commit/4b1580b40216b6e8c0c2be84b09d438726086eaf) |
| 2026-10-18 16:09 | [b7551d7](https://github.com/code-corhuila/synkro-workflow/commit/b7551d7019403f29a661f6487c7fa65f725ff6e6) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [e695509](https://github.com/code-corhuila/synkro-workflow/commit/e6955091f03c59a6370761f4ba8c0091714d64b6), [46fdb5e](https://github.com/code-corhuila/synkro-workflow/commit/46fdb5ee776f26f91354769dd7b006ab29a8225c) |
| 2026-10-18 16:09 | [de9190f](https://github.com/code-corhuila/synkro-workflow/commit/de9190f3409f2265fc5acce639c22393980c599b) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [bff87bc](https://github.com/code-corhuila/synkro-workflow/commit/bff87bcb038e2b23d64c0da65c1f7d39614d6d68), [2c19d94](https://github.com/code-corhuila/synkro-workflow/commit/2c19d9429a7da74db93fb49794e285a711d358b6) |
| 2026-10-18 16:09 | [3846873](https://github.com/code-corhuila/synkro-workflow/commit/3846873a69e20b9414f837569dd346ada66e907d) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [a6b31bd](https://github.com/code-corhuila/synkro-workflow/commit/a6b31bdba17812cd61c8cead3bb9b269a82868f2), [79bb2bb](https://github.com/code-corhuila/synkro-workflow/commit/79bb2bb12b127759d34cd2c7fd1c4a0ed9b517a7) |
| 2026-10-18 16:09 | [5232e9e](https://github.com/code-corhuila/synkro-workflow/commit/5232e9e6d3e3c4721f146d3d8469681cb55361e9) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [220233f](https://github.com/code-corhuila/synkro-workflow/commit/220233f06922cd7dfba2be51eea12e08c3f784db), [6c17a66](https://github.com/code-corhuila/synkro-workflow/commit/6c17a66d27a4141a7599bda6f00a3b54000abb64) |
| 2026-10-18 16:09 | [60b176b](https://github.com/code-corhuila/synkro-workflow/commit/60b176bb621a31a5e4169968d411bcd845065590) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [287cb84](https://github.com/code-corhuila/synkro-workflow/commit/287cb84923718b6466478437780b043de161b097), [f076e85](https://github.com/code-corhuila/synkro-workflow/commit/f076e85823c343e664f3a36959e0149de533ab3f) |
| 2026-10-18 16:09 | [33b0271](https://github.com/code-corhuila/synkro-workflow/commit/33b0271caab9a46b8b07d6f1f75f7c1ac89e5204) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [81b75a5](https://github.com/code-corhuila/synkro-workflow/commit/81b75a56fa612c6cd39f5c591c752fc0c42a8802), [0c8bf40](https://github.com/code-corhuila/synkro-workflow/commit/0c8bf40836132b8aed7965cd2cb5b814d586d57b) |
| 2026-10-18 16:09 | [e4a6ec1](https://github.com/code-corhuila/synkro-workflow/commit/e4a6ec148c714ab791a094fed78b1fefd7074b61) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [462644e](https://github.com/code-corhuila/synkro-workflow/commit/462644e0e79bbfffdefdcdfb8ae6e25ac0122358), [62339c2](https://github.com/code-corhuila/synkro-workflow/commit/62339c21a98ebe19bf72ccfbc384abfb28e83668) |
| 2026-10-18 16:09 | [6966bd9](https://github.com/code-corhuila/synkro-workflow/commit/6966bd932fc66e8867ca52b0912a150b22c48172) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [efe0656](https://github.com/code-corhuila/synkro-workflow/commit/efe06565f93e6e56b7010dfd9bf5451f14a03d26), [0056f74](https://github.com/code-corhuila/synkro-workflow/commit/0056f74702224452000490a5b2e714a2f7532049) |
| 2026-10-18 16:09 | [dd51ec7](https://github.com/code-corhuila/synkro-workflow/commit/dd51ec7f378f7d2b898863d146378e9ffa0918d2) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [0f4e005](https://github.com/code-corhuila/synkro-workflow/commit/0f4e00545a439a8b5ba32cb2e13fcb903084b97c), [08ca187](https://github.com/code-corhuila/synkro-workflow/commit/08ca187395289c78c3ea5a5ce561515ca674a887) |
| 2026-10-18 16:09 | [89beb41](https://github.com/code-corhuila/synkro-workflow/commit/89beb413c612df201e6a4220a8300d8340e913d2) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [6f94777](https://github.com/code-corhuila/synkro-workflow/commit/6f947778bfd795b163ef34cf7f900c12ed3aa864), [bcaa8fb](https://github.com/code-corhuila/synkro-workflow/commit/bcaa8fb5b313d81df3af8a63385b2741eba0cbab) |
| 2026-10-18 16:09 | [5c13dc1](https://github.com/code-corhuila/synkro-workflow/commit/5c13dc196a73c7f35faba7664f0ac68dfa69b820) | AsolanoT | [#12](https://github.com/code-corhuila/synkro-workflow/pull/12) | [0afd8cd](https://github.com/code-corhuila/synkro-workflow/commit/0afd8cde592c3efa5b44b63026001b0c262d4b2b), [ef74fd2](https://github.com/code-corhuila/synkro-workflow/commit/ef74fd2792efa243417cf936728037de9c8f56c8) |
| 2026-10-18 17:35 | [28e105f](https://github.com/code-corhuila/synkro-workflow/commit/28e105f26c5b4b50be73845eff21ce4050026b82) | AsolanoT | [#15](https://github.com/code-corhuila/synkro-workflow/pull/15) | [5c80cf1](https://github.com/code-corhuila/synkro-workflow/commit/5c80cf123778b6bc8cdb084d5ff6004ef9239ad4) |
| 2026-10-18 17:35 | [7d91deb](https://github.com/code-corhuila/synkro-workflow/commit/7d91deb6f4d268d6fc62063f1a004e9d1113bb90) | AsolanoT | [#16](https://github.com/code-corhuila/synkro-workflow/pull/16) | [5c80cf1](https://github.com/code-corhuila/synkro-workflow/commit/5c80cf123778b6bc8cdb084d5ff6004ef9239ad4), [28e105f](https://github.com/code-corhuila/synkro-workflow/commit/28e105f26c5b4b50be73845eff21ce4050026b82) |

### Copied source files (49)

These files are taken from `b3ecbe6c75f7038b9b8fe11d396bf00a642bb248`, rather than combining conflicting versions from individual commits. The source revision is an October 18 candidate/publication. The changed-file lists were checked against the relevant PRs.

| Actual local file | Immutable upstream file |
|---|---|
| [db/01_ddl/01_schemas/V001__create_workflow_schema.sql](./synkro-workflow/db/01_ddl/01_schemas/V001__create_workflow_schema.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/01_ddl/01_schemas/V001__create_workflow_schema.sql) |
| [db/01_ddl/03_tables/V002__create_saga_instance.sql](./synkro-workflow/db/01_ddl/03_tables/V002__create_saga_instance.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/01_ddl/03_tables/V002__create_saga_instance.sql) |
| [db/01_ddl/10_indexes/V003__create_indexes.sql](./synkro-workflow/db/01_ddl/10_indexes/V003__create_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/01_ddl/10_indexes/V003__create_indexes.sql) |
| [db/03_dcl/V004__create_roles.sql](./synkro-workflow/db/03_dcl/V004__create_roles.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/03_dcl/V004__create_roles.sql) |
| [db/03_dcl/V005__grant_permissions.sql](./synkro-workflow/db/03_dcl/V005__grant_permissions.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/03_dcl/V005__grant_permissions.sql) |
| [db/05_rollbacks/01_ddl/01_schemas/U001__drop_workflow_schema.sql](./synkro-workflow/db/05_rollbacks/01_ddl/01_schemas/U001__drop_workflow_schema.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/05_rollbacks/01_ddl/01_schemas/U001__drop_workflow_schema.sql) |
| [db/05_rollbacks/01_ddl/03_tables/U002__drop_saga_instance.sql](./synkro-workflow/db/05_rollbacks/01_ddl/03_tables/U002__drop_saga_instance.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/05_rollbacks/01_ddl/03_tables/U002__drop_saga_instance.sql) |
| [db/05_rollbacks/01_ddl/10_indexes/U003__drop_indexes.sql](./synkro-workflow/db/05_rollbacks/01_ddl/10_indexes/U003__drop_indexes.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/05_rollbacks/01_ddl/10_indexes/U003__drop_indexes.sql) |
| [db/05_rollbacks/03_dcl/U004__drop_roles.sql](./synkro-workflow/db/05_rollbacks/03_dcl/U004__drop_roles.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/05_rollbacks/03_dcl/U004__drop_roles.sql) |
| [db/05_rollbacks/03_dcl/U005__revoke_permissions.sql](./synkro-workflow/db/05_rollbacks/03_dcl/U005__revoke_permissions.sql) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/05_rollbacks/03_dcl/U005__revoke_permissions.sql) |
| [db/flyway.toml](./synkro-workflow/db/flyway.toml) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/db/flyway.toml) |
| [deploy/compose.yml](./synkro-workflow/deploy/compose.yml) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/deploy/compose.yml) |
| [pom.xml](./synkro-workflow/pom.xml) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/pom.xml) |
| [tests/check_coverage.py](./synkro-workflow/tests/check_coverage.py) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/tests/check_coverage.py) |
| [tests/controlled_participants.py](./synkro-workflow/tests/controlled_participants.py) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/tests/controlled_participants.py) |
| [tests/hybrid_acceptance.py](./synkro-workflow/tests/hybrid_acceptance.py) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/tests/hybrid_acceptance.py) |
| [tests/process_acceptance.py](./synkro-workflow/tests/process_acceptance.py) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/tests/process_acceptance.py) |
| [tests/test_deployment.py](./synkro-workflow/tests/test_deployment.py) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/tests/test_deployment.py) |
| [tests/test_process_support.py](./synkro-workflow/tests/test_process_support.py) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/tests/test_process_support.py) |
| [workflow-adapters/pom.xml](./synkro-workflow/workflow-adapters/pom.xml) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/pom.xml) |
| [workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/CorrelationFilter.java](./synkro-workflow/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/CorrelationFilter.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/CorrelationFilter.java) |
| [workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/ErrorAdvice.java](./synkro-workflow/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/ErrorAdvice.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/ErrorAdvice.java) |
| [workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/HttpErrors.java](./synkro-workflow/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/HttpErrors.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/HttpErrors.java) |
| [workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/SagaController.java](./synkro-workflow/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/SagaController.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/SagaController.java) |
| [workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/SecurityConfiguration.java](./synkro-workflow/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/SecurityConfiguration.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/SecurityConfiguration.java) |
| [workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/StoreHealthController.java](./synkro-workflow/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/StoreHealthController.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/in/http/StoreHealthController.java) |
| [workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/out/http/HttpSaleParticipants.java](./synkro-workflow/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/out/http/HttpSaleParticipants.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/out/http/HttpSaleParticipants.java) |
| [workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/out/persistence/JdbcSagaStore.java](./synkro-workflow/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/out/persistence/JdbcSagaStore.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/main/java/co/edu/corhuila/synkro/workflow/adapter/out/persistence/JdbcSagaStore.java) |
| [workflow-adapters/src/test/java/co/edu/corhuila/synkro/workflow/adapter/out/http/HttpSaleParticipantsTest.java](./synkro-workflow/workflow-adapters/src/test/java/co/edu/corhuila/synkro/workflow/adapter/out/http/HttpSaleParticipantsTest.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/test/java/co/edu/corhuila/synkro/workflow/adapter/out/http/HttpSaleParticipantsTest.java) |
| [workflow-adapters/src/test/java/co/edu/corhuila/synkro/workflow/adapter/out/persistence/JdbcSagaStoreTest.java](./synkro-workflow/workflow-adapters/src/test/java/co/edu/corhuila/synkro/workflow/adapter/out/persistence/JdbcSagaStoreTest.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-adapters/src/test/java/co/edu/corhuila/synkro/workflow/adapter/out/persistence/JdbcSagaStoreTest.java) |
| [workflow-app/pom.xml](./synkro-workflow/workflow-app/pom.xml) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-app/pom.xml) |
| [workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/BackgroundExecution.java](./synkro-workflow/workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/BackgroundExecution.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/BackgroundExecution.java) |
| [workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/WorkflowApiApplication.java](./synkro-workflow/workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/WorkflowApiApplication.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/WorkflowApiApplication.java) |
| [workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/WorkflowComposition.java](./synkro-workflow/workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/WorkflowComposition.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-app/src/main/java/co/edu/corhuila/synkro/workflow/app/WorkflowComposition.java) |
| [workflow-app/src/main/resources/application.properties](./synkro-workflow/workflow-app/src/main/resources/application.properties) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-app/src/main/resources/application.properties) |
| [workflow-app/src/test/java/co/edu/corhuila/synkro/workflow/app/WorkflowHttpTest.java](./synkro-workflow/workflow-app/src/test/java/co/edu/corhuila/synkro/workflow/app/WorkflowHttpTest.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-app/src/test/java/co/edu/corhuila/synkro/workflow/app/WorkflowHttpTest.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ExecutionCoordinator.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ExecutionCoordinator.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ExecutionCoordinator.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ExecutionScheduler.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ExecutionScheduler.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ExecutionScheduler.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/Identifiers.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/Identifiers.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/Identifiers.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ParticipantFailure.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ParticipantFailure.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/ParticipantFailure.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/RetryDelay.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/RetryDelay.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/RetryDelay.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/SagaStore.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/SagaStore.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/SagaStore.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/SaleParticipants.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/SaleParticipants.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/port/out/SaleParticipants.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/usecase/RegisterSale.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/usecase/RegisterSale.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/application/usecase/RegisterSale.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/Reservation.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/Reservation.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/Reservation.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/Saga.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/Saga.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/Saga.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/SaleInput.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/SaleInput.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/SaleInput.java) |
| [workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/WorkflowError.java](./synkro-workflow/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/WorkflowError.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/main/java/co/edu/corhuila/synkro/workflow/domain/model/WorkflowError.java) |
| [workflow-core/src/test/java/co/edu/corhuila/synkro/workflow/RegisterSaleTest.java](./synkro-workflow/workflow-core/src/test/java/co/edu/corhuila/synkro/workflow/RegisterSaleTest.java) | [Source](https://github.com/code-corhuila/synkro-workflow/blob/b3ecbe6c75f7038b9b8fe11d396bf00a642bb248/workflow-core/src/test/java/co/edu/corhuila/synkro/workflow/RegisterSaleTest.java) |

### Delivery status recorded for this cut

- [#13 — feat(workflow): release 2.0.0 persistent register-sale orchestration](https://github.com/code-corhuila/synkro-workflow/pull/13): open, target `main`, head `b3ecbe6`.
- [#8 — feat(workflow): promote persistent sale orchestration to qa](https://github.com/code-corhuila/synkro-workflow/pull/8): merged, target `qa`, head `ef74fd2`.
- [#12 — feat(workflow): add persistent sale orchestration to release 2.0.0](https://github.com/code-corhuila/synkro-workflow/pull/12): merged, target `release/2.0.0`, head `5c13dc1`.
- [#14 — docs(readme): remove obsolete Customers GET 501 claim](https://github.com/code-corhuila/synkro-workflow/pull/14): merged, target `develop`, head `5c80cf1`.
- [#15 — docs(readme): promote Customers GET status correction to qa](https://github.com/code-corhuila/synkro-workflow/pull/15): merged, target `qa`, head `28e105f`.
- [#16 — docs(readme): add Customers GET status correction to release 2.0.0](https://github.com/code-corhuila/synkro-workflow/pull/16): merged, target `release/2.0.0`, head `7d91deb`.

## synkro-infra-postgres

HU-INF-02.

[Local source folder](./synkro-infra-postgres/) · [Immutable source revision `4e9ff248caf6b0a20001cd1bad46cbc54eb4ae44`](https://github.com/code-corhuila/synkro-infra-postgres/tree/4e9ff248caf6b0a20001cd1bad46cbc54eb4ae44)

**Reported result:** PostgreSQL/observability evidence, five production builds and 13 real-browser candidate scenarios; direct final-store audit: 5 sales, stock 100 to 90.

**Limits and attribution:** PR #12 is open; approved lock unchanged; final integrated pins and independent reproduction pending. Candidate runs do not newly certify literal persistent platform mode, Worker or engine-restart persistence. Actions startup_failure has zero jobs and UNKNOWN cause; do not attribute this failure to billing.

### October 18 original AsolanoT commits (3)

| timestamp | Commit | PR | Change |
|---|---|---|---|
| 2026-10-18 19:22 | [fc63129](https://github.com/code-corhuila/synkro-infra-postgres/commit/fc63129e21aa3f57bbb8992dd5f264763a0f4d5a) | [#12](https://github.com/code-corhuila/synkro-infra-postgres/pull/12) | fix(test): provision Grafana fixture secret for its container user |
| 2026-10-18 19:27 | [d2f59ac](https://github.com/code-corhuila/synkro-infra-postgres/commit/d2f59ac4441efe13e5dd67407ac4ff8e96928768) | [#12](https://github.com/code-corhuila/synkro-infra-postgres/pull/12) | docs(infra): reconcile HU-INF-02 evidence dependencies and acceptance gates |
| 2026-10-18 21:04 | [4e9ff24](https://github.com/code-corhuila/synkro-infra-postgres/commit/4e9ff248caf6b0a20001cd1bad46cbc54eb4ae44) | [#12](https://github.com/code-corhuila/synkro-infra-postgres/pull/12) | docs: prepare Front and Sales candidate evidence for HU-INF-02 |

### Copied source files (2)

These files are taken from `4e9ff248caf6b0a20001cd1bad46cbc54eb4ae44`, rather than combining conflicting versions from individual commits. The source revision is an October 18 candidate/publication. The changed-file lists were checked against the relevant PRs.

| Actual local file | Immutable upstream file |
|---|---|
| [tests/observability.py](./synkro-infra-postgres/tests/observability.py) | [Source](https://github.com/code-corhuila/synkro-infra-postgres/blob/4e9ff248caf6b0a20001cd1bad46cbc54eb4ae44/tests/observability.py) |
| [tests/test_observability_fixture.py](./synkro-infra-postgres/tests/test_observability_fixture.py) | [Source](https://github.com/code-corhuila/synkro-infra-postgres/blob/4e9ff248caf6b0a20001cd1bad46cbc54eb4ae44/tests/test_observability_fixture.py) |

### Delivery status recorded for this cut

- [#12 — Prepare HU-INF-02 Front/Sales candidate validation and acceptance evidence](https://github.com/code-corhuila/synkro-infra-postgres/pull/12): open, target `develop`, head `4e9ff24`.

## Recorded verification and pending acceptance

The results above are published owner reports tied to the named revisions, not executions performed while assembling these copies. Counts from different suites, stacks and stores must not be added together.

- **Front:** 360 tests plus three existing todo, 95.29% statements and 12 real-browser scenarios belong to the session candidate `49eb6d1`. #41 → #42 → #43 remain unmerged; main PR #36 lacks the extension.
- **Sales Portal:** 242 tests and 96.43% statements, with seven complementary real-browser cases. Front's 12 cases are separately reused evidence, not 12 additional portal executions. Executable source was tested at `7794cbf`; `40f38ce` adds documentation/merge changes. Integration order is #5 → #6 → #7 → #8 → #9 → #4.
- **Products API:** [final-head report](https://github.com/code-corhuila/synkro-products-api/pull/19#issuecomment-6256064078) records 192 real-stack checks, 89.8% global coverage and source/binary scans reporting no detected vulnerabilities on `285fedc`. This supersedes the earlier candidate's reachable findings.
- **Sales API:** [PR #23 updates 2–3](https://github.com/code-corhuila/synkro-sales-api/pull/23) records 34 real-MongoDB scenarios and a separate 84-check Auth/Gateway run on final release `1bdd32d`. The historical 167-check run is different. Zero reachable vulnerabilities does not hide the two disclosed uncalled advisories.
- **Workflow:** [PR #13](https://github.com/code-corhuila/synkro-workflow/pull/13) records 43 Maven tests, global coverage 91.30% and real-participant registration, compensation, replay and interruption recovery. The controlled-process suite separately reports 43 passed / 1 blocked.
- **Infra:** [PR #12](https://github.com/code-corhuila/synkro-infra-postgres/pull/12) records five production builds and 13 candidate browser cases, with five sales and stock 100 → 90. The actual October 18 code correction copied here is the Grafana observability fixture and its regression test. Root-composition source changes from earlier dates are not copied. Approved lock unchanged; final integrated pins and independent reproduction remain pending.
- **Auth DB:** [PR #25](https://github.com/code-corhuila/synkro-auth-db/pull/25) reports audit constraints, restricted grants and transactional integration, including rollback on an audit-write failure. Story #232 is closed; component main publication is still pending.
- **Products DB:** [post-tag runner report](https://github.com/code-corhuila/synkro-products-db/pull/22#issuecomment-6255022680) records verification from a clean annotated `v2.0.0` copy. Tag object `d480c88e41659396670bfd7e1a593c3f7e4ab611` resolves to main `043e485d16018fc4fb4cd60694c2a521c143ddbd`. The earlier 108-check report is historical; the global Docker inventory limitation remains disclosed, and restore requires the cluster roles to exist first.

Normal transactions, deliberate response loss/service pauses and test doubles remain distinct. The four backdated 48-hour Workflow fixtures do not establish an elapsed 48-hour soak or an indefinite retention guarantee. Different stores' final sale/stock counts must not be combined.

Front/Sales Portal and several components report explicit billing-lock annotations before any test step. Infra reports startup_failure with zero jobs and UNKNOWN cause; no billing cause is inferred there. Unexecuted checks are not passing CI. Component-specific local-evidence decisions do not automatically authorize other components or main/tag publication.

HU-VEN-12, HU-INF-02 and HU-WKF-03 remain open. Main PRs and final-head reviews remain pending for the unmerged components. These source copies do not imply platform acceptance. No issue, board, branch, PR or tag was changed while correcting this submission.
