# Local repository inventory

Initial inspection found clean local develop checkouts; no user changes were discarded, stashed or overwritten. The primary develop revision was unchanged from the earlier review. Remote refs were fetched before selecting evidence revisions. Modified sibling branches were created from the freshly fetched published develop, while unmodified original checkouts stayed in place. The retained local develop refs identify the original starting checkouts below. Candidate/published evidence revisions are separately recorded in dependencies.lock.json.

| Repository | Original local develop SHA | Fetched published develop SHA |
|---|---|---|
| synkro-infra-postgres | `22ddd80bbd5c781190e79cca19ae864c1f297633` | `22ddd80bbd5c781190e79cca19ae864c1f297633` |
| synkro-infra-mongo | `9396d45cafce58b0c2d6e2bb4b3c6f2d65ee640b` | `9396d45cafce58b0c2d6e2bb4b3c6f2d65ee640b` |
| synkro-auth-db | `bafe396ee0c0d544c478a4372839417df02791bd` | `c338bf95190fc20cbff55c13bb83c279a1febdf9` |
| synkro-products-db | `7eb5bb0ff4ea787669f0c65ea43e7898cbd4a079` | `7eb5bb0ff4ea787669f0c65ea43e7898cbd4a079` |
| synkro-customers-db | `df59971ea5c109e4b8e8af34221884e8c6f47b3d` | `a098042426f259270d9ba28728212872fd2c1b4f` |
| synkro-sales-db | `f509f2694389067d5485bba248c1c259dafaf53c` | `ffdc24b9ce7c84b745b30bb1e85b76b07d029475` |
| synkro-auth-api | `45e2fff95f386ec0d7195944e742e658481583ee` | `58e775867edbca2086c3c00df35cf506b9843af4` |
| synkro-customers-api | `5dddfc84f885db8932e4e3a567ed83c83612cfe9` | `5dddfc84f885db8932e4e3a567ed83c83612cfe9` |
| synkro-products-api | `b6b379b314716e201833be0d854953a69452559f` | `b6b379b314716e201833be0d854953a69452559f` |
| synkro-sales-api | `fc92d7da95413bb14b96fe964cc0dbafb81e99f2` | `d2cfe0cfba5f395b7f7e4beec6494b20e8ef12fb` |
| synkro-workflow | `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37` | `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37` |
| synkro-worker | `c4ba2852210e8af274599e49c698a84887be191a` | `7827aa160d34c9ba1f70aa0481b2bf32accb42f0` |
| synkro-api-gateway | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` |
| synkro-front | `24d781af3ccea07131ae01d75c561da7827c0306` | `24d781af3ccea07131ae01d75c561da7827c0306` |
| synkro-auth-portal | `9cd9f1cfadfde422ae18b9549c0b517cc667f044` | `d478fba7344f3a778da4f122dd5aefe481a1d32a` |
| synkro-customers-portal | `dc70217d9f119427164585e552b97b2d6ca04255` | `875b269d217f17568b8125c4fd805e825f01867d` |
| synkro-products-portal | `8d7140318d9273821142510b60bb92f478576604` | `8d7140318d9273821142510b60bb92f478576604` |
| synkro-sales-portal | `7e58f3e0ea010b846dc90da0dc0178abedbdf152` | `1c26b211c175f7c16f90bb525bea652f0e30e4e1` |

Primary working branch: `feat/postgres-bootstrap-and-root-composition`. Five modified sibling branches: `fix/root-composition-integration`. Every selected base and final sibling candidate is recorded in docs/dependencies.md; the final push report records final heads and chronological commits. Mongo/Sales candidate testing used ignored snapshots, without modifying either owning repository.

The published synkro-docs default branch was main at `61056c93e6e0783a9199bf56778e9494739bc458`. The read-only clone lives under ignored .work/docs; no documentation repository change or issue mutation was performed.

## Continuation inventory — 2026-10-11

All original working trees were clean. Current refs were fetched without switching or resetting read-only checkouts. Existing implementation branches and all commits were preserved. The initial primary checkpoint was `6cab35827a60b42615bd51c61b6f5b0056a7f88c`; Sales was `39c9e464f4c6717766dec027055769d4e44b31b2`. The complete branch/HEAD/remote inventory below is initial continuation evidence; selected tested snapshots are independently recorded in dependencies.lock.json.

| Repository / remote | Initial local branch | Initial HEAD | Initial working tree |
|---|---|---|---|
| [synkro-api-gateway](https://github.com/code-corhuila/synkro-api-gateway) | `develop` | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` | clean |
| [synkro-auth-api](https://github.com/code-corhuila/synkro-auth-api) | `develop` | `45e2fff95f386ec0d7195944e742e658481583ee` | clean |
| [synkro-auth-db](https://github.com/code-corhuila/synkro-auth-db) | `fix/root-composition-integration` | `f14fb8c0eb14bba6d92d987fcdd0f62eb3050606` | clean |
| [synkro-auth-portal](https://github.com/code-corhuila/synkro-auth-portal) | `develop` | `9cd9f1cfadfde422ae18b9549c0b517cc667f044` | clean |
| [synkro-customers-api](https://github.com/code-corhuila/synkro-customers-api) | `develop` | `5dddfc84f885db8932e4e3a567ed83c83612cfe9` | clean |
| [synkro-customers-db](https://github.com/code-corhuila/synkro-customers-db) | `develop` | `df59971ea5c109e4b8e8af34221884e8c6f47b3d` | clean |
| [synkro-customers-portal](https://github.com/code-corhuila/synkro-customers-portal) | `develop` | `dc70217d9f119427164585e552b97b2d6ca04255` | clean |
| [synkro-front](https://github.com/code-corhuila/synkro-front) | `fix/root-composition-integration` | `c445b53d3846eac4fe5c06da90d745b71dcc41fa` | clean |
| [synkro-infra-mongo](https://github.com/code-corhuila/synkro-infra-mongo.git) | `develop` | `9396d45cafce58b0c2d6e2bb4b3c6f2d65ee640b` | clean |
| [synkro-infra-postgres](https://github.com/code-corhuila/synkro-infra-postgres.git) | `feat/postgres-bootstrap-and-root-composition` | `6cab35827a60b42615bd51c61b6f5b0056a7f88c` | clean |
| [synkro-products-api](https://github.com/code-corhuila/synkro-products-api) | `develop` | `b6b379b314716e201833be0d854953a69452559f` | clean |
| [synkro-products-db](https://github.com/code-corhuila/synkro-products-db.git) | `fix/root-composition-integration` | `879f3e9fe80cadc6cd00afdb519cb0d78a0f3588` | clean |
| [synkro-products-portal](https://github.com/code-corhuila/synkro-products-portal) | `fix/root-composition-integration` | `b3780d9d8cb9fe28f59ec687393c42c93cfff339` | clean |
| [synkro-sales-api](https://github.com/code-corhuila/synkro-sales-api) | `fix/root-composition-integration` | `39c9e464f4c6717766dec027055769d4e44b31b2` | clean |
| [synkro-sales-db](https://github.com/code-corhuila/synkro-sales-db) | `develop` | `f509f2694389067d5485bba248c1c259dafaf53c` | clean |
| [synkro-sales-portal](https://github.com/code-corhuila/synkro-sales-portal) | `develop` | `7e58f3e0ea010b846dc90da0dc0178abedbdf152` | clean |
| [synkro-worker](https://github.com/code-corhuila/synkro-worker) | `develop` | `c4ba2852210e8af274599e49c698a84887be191a` | clean |
| [synkro-workflow](https://github.com/code-corhuila/synkro-workflow) | `develop` | `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37` | clean |

All 17 dependency snapshots were detached at exact selected SHAs in an ignored isolated sibling layout. New continuation commits affect only primary and Sales API. During execution, external work switched Sales Portal from its initial develop checkout to clean feat/sales-portal-history at d575d35411253e76762300c043917a561143354e and published that branch. It was preserved unchanged; a separate immutable snapshot verified its current deployment incompatibility. All other original read-only checkout branches/HEADs/contents remained unchanged. Protected baseline files were neither updated nor redefined. Final SHAs/commits, push and CI outcomes are in the continuation report.

## Fresh review inventory — 2026-10-12 UTC

Fetch only; no checkout switches/resets. All working trees were clean. Read-only local heads may lag published develop; only detached exact snapshots were used for delivery checks.

| Repository | Initial local HEAD | Published develop | Working branch | Behind / ahead |
|---|---|---|---|---|
| synkro-api-gateway | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` | `develop` | 0 / 0 |
| synkro-auth-api | `45e2fff95f386ec0d7195944e742e658481583ee` | `04ae6ab92daf474fb5c38ae37842d1690e7584b0` | `develop` | 84 / 0 |
| synkro-auth-db | `f14fb8c0eb14bba6d92d987fcdd0f62eb3050606` | `c338bf95190fc20cbff55c13bb83c279a1febdf9` | `fix/root-composition-integration` | 0 / 2 |
| synkro-auth-portal | `9cd9f1cfadfde422ae18b9549c0b517cc667f044` | `d478fba7344f3a778da4f122dd5aefe481a1d32a` | `develop` | 2 / 0 |
| synkro-customers-api | `5dddfc84f885db8932e4e3a567ed83c83612cfe9` | `5dddfc84f885db8932e4e3a567ed83c83612cfe9` | `develop` | 0 / 0 |
| synkro-customers-db | `df59971ea5c109e4b8e8af34221884e8c6f47b3d` | `a098042426f259270d9ba28728212872fd2c1b4f` | `develop` | 2 / 0 |
| synkro-customers-portal | `dc70217d9f119427164585e552b97b2d6ca04255` | `875b269d217f17568b8125c4fd805e825f01867d` | `develop` | 2 / 0 |
| synkro-front | `c445b53d3846eac4fe5c06da90d745b71dcc41fa` | `24d781af3ccea07131ae01d75c561da7827c0306` | `fix/root-composition-integration` | 0 / 3 |
| synkro-infra-mongo | `9396d45cafce58b0c2d6e2bb4b3c6f2d65ee640b` | `a19e2d564f938298c057d41ca7a6f6e456e22637` | `develop` | 10 / 0 |
| synkro-infra-postgres | `56de57a56fc30a5a62371336f1df1d3e32fbd6b5` | `22ddd80bbd5c781190e79cca19ae864c1f297633` | `feat/postgres-bootstrap-and-root-composition` | 0 / 24 |
| synkro-products-api | `b6b379b314716e201833be0d854953a69452559f` | `b6b379b314716e201833be0d854953a69452559f` | `develop` | 0 / 0 |
| synkro-products-db | `879f3e9fe80cadc6cd00afdb519cb0d78a0f3588` | `7eb5bb0ff4ea787669f0c65ea43e7898cbd4a079` | `fix/root-composition-integration` | 0 / 2 |
| synkro-products-portal | `b3780d9d8cb9fe28f59ec687393c42c93cfff339` | `8d7140318d9273821142510b60bb92f478576604` | `fix/root-composition-integration` | 0 / 2 |
| synkro-sales-api | `859c8f79a437d5cb1e19cf48a9d124966d221508` | `19748e167b7d5d143775d06185cc0809b1ff73b6` | `fix/root-composition-integration` | 0 / 7 |
| synkro-sales-db | `f509f2694389067d5485bba248c1c259dafaf53c` | `9cfbde7db4bea7bacad70370c60f91f8eb917c04` | `develop` | 34 / 0 |
| synkro-sales-portal | `d575d35411253e76762300c043917a561143354e` | `cab684ea2dc2e58a399a980a66c9188ac3487453` | `feat/sales-portal-history` | 1 / 0 |
| synkro-worker | `c4ba2852210e8af274599e49c698a84887be191a` | `7827aa160d34c9ba1f70aa0481b2bf32accb42f0` | `develop` | 12 / 0 |
| synkro-workflow | `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37` | `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37` | `develop` | 0 / 0 |

## Host/Sales continuation initial inventory — 2026-10-12 America/Bogota

Fresh fetch only, original clean checkouts preserved; known checkpoints matched.

| Repository | Original local HEAD | Fresh origin/develop | Behind / ahead |
|---|---|---|---|
| synkro-api-gateway | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` | `24a4ab157bb000e152e5e4567f16deb3ebadcf05` | 0 / 0 |
| synkro-auth-api | `45e2fff95f386ec0d7195944e742e658481583ee` | `04ae6ab92daf474fb5c38ae37842d1690e7584b0` | 84 / 0 |
| synkro-auth-db | `f14fb8c0eb14bba6d92d987fcdd0f62eb3050606` | `5e481dba156db6f2febb00427efba637002d9a0c` | 1 / 0 |
| synkro-auth-portal | `9cd9f1cfadfde422ae18b9549c0b517cc667f044` | `d478fba7344f3a778da4f122dd5aefe481a1d32a` | 2 / 0 |
| synkro-customers-api | `5dddfc84f885db8932e4e3a567ed83c83612cfe9` | `5dddfc84f885db8932e4e3a567ed83c83612cfe9` | 0 / 0 |
| synkro-customers-db | `df59971ea5c109e4b8e8af34221884e8c6f47b3d` | `a098042426f259270d9ba28728212872fd2c1b4f` | 2 / 0 |
| synkro-customers-portal | `dc70217d9f119427164585e552b97b2d6ca04255` | `875b269d217f17568b8125c4fd805e825f01867d` | 2 / 0 |
| synkro-front | `c445b53d3846eac4fe5c06da90d745b71dcc41fa` | `24d781af3ccea07131ae01d75c561da7827c0306` | 0 / 3 |
| synkro-infra-mongo | `9396d45cafce58b0c2d6e2bb4b3c6f2d65ee640b` | `a19e2d564f938298c057d41ca7a6f6e456e22637` | 10 / 0 |
| synkro-infra-postgres | `55faa95e7fff0806bf9385c091a7cd42e90c6964` | `22ddd80bbd5c781190e79cca19ae864c1f297633` | 0 / 25 |
| synkro-products-api | `b6b379b314716e201833be0d854953a69452559f` | `b6b379b314716e201833be0d854953a69452559f` | 0 / 0 |
| synkro-products-db | `879f3e9fe80cadc6cd00afdb519cb0d78a0f3588` | `0beae79920d9af83865bdebaf6b316a2b2a57592` | 1 / 0 |
| synkro-products-portal | `b3780d9d8cb9fe28f59ec687393c42c93cfff339` | `31f1dc235e50c69030c60f5d5faca5d2c1786270` | 1 / 0 |
| synkro-sales-api | `859c8f79a437d5cb1e19cf48a9d124966d221508` | `70bdbaba3783bfb974c338b8a460e6e9b7e5c8dd` | 1 / 0 |
| synkro-sales-db | `f509f2694389067d5485bba248c1c259dafaf53c` | `9cfbde7db4bea7bacad70370c60f91f8eb917c04` | 34 / 0 |
| synkro-sales-portal | `d575d35411253e76762300c043917a561143354e` | `cab684ea2dc2e58a399a980a66c9188ac3487453` | 1 / 0 |
| synkro-worker | `c4ba2852210e8af274599e49c698a84887be191a` | `7827aa160d34c9ba1f70aa0481b2bf32accb42f0` | 12 / 0 |
| synkro-workflow | `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37` | `32caf8dc6b4b8b0460b85ab9c0829a3fc974ed37` | 0 / 0 |
