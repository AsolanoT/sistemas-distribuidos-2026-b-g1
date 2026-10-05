# Testing Strategy

> Defines what, how much, and with which tools to test at each layer.
> This document is the project's quality contract. TDD (red → green →
> refactor) is Pillar 2 of the project: the test is always written
> before the code it validates.
>
> The project has two backend stacks: Java (Spring Boot) for
> `synkro-auth-api` and `synkro-customers-api`, and Go for
> `synkro-products-api` and `synkro-sales-api`. `synkro-workflow`
> (Java) and `synkro-worker` (Go) follow the same conventions as
> their respective stacks (ADR-008). The frontend has two frameworks,
> React 19 (the host and three portals) and Angular 21
> (`synkro-customers-portal`, ADR-011); its own tier is below. Two
> database engines are in play: PostgreSQL for Auth, Customers,
> Products and the saga store, and MongoDB for Sales (ADR-010) — each
> has its own integration-testing convention, in Tier 2.

---

## Testing pyramid

```
                 /\
                /  \
               / E2E \       ← Few, slow — critical flows only (post-MVP)
              / [5%]  \
             /──────────\
            / Integration \
           /    [25%]      \  ← HTTP adapter in memory; persistence adapter on PostgreSQL or MongoDB
          /────────────────\
         /  Contract Tests   \
        /      [20%]          \  ← OpenAPI contract compliance (synkro-products-api.yaml, etc.)
       /──────────────────────\
      /       Unit Tests        \
     /          [50%]            \  ← Domain + application layer, no I/O
    /────────────────────────────\
```

**Rule:** more tests at the bottom = more maintainable system at lower
cost. Inverting the pyramid makes CI slow and fragile. The frontend has
its own, separate pyramid-shaped tier below — a portal's tests are not
"integration tests" against a backend, they are unit-equivalent tests
against a double of the host's client.

---

## Coverage thresholds (backend)

| Layer | Minimum coverage | Measured by |
|-------|-----------------|-------------|
| Domain (`domain/`) | ≥ 90% lines | JaCoCo (Java) / `go test -coverprofile` (Go) |
| Application (`application/`) | ≥ 80% lines | Same |
| Infrastructure (`infrastructure/`) | ≥ 60% lines | Same — adapters are tested by integration tests, not unit tests |
| Global (all layers) | ≥ 80% lines | Same |

**Coverage rule:** if a PR lowers the global coverage, CI fails.
Coverage cannot go down — uncovered code requires tests in the same PR.
This applies identically to `synkro-sales-api`: its domain and
application layers are tested exactly like `synkro-products-api`'s; only
its persistence adapter (Tier 2) and its coverage-report tool differ by
driver, not by threshold.

Frontend coverage thresholds are separate — see "Frontend tests" below.

---

## Tier 1 — Unit tests

**Objective:** test business logic in complete isolation — no DB, no
HTTP, no framework.

| Aspect | Java (Spring Boot) | Go |
|--------|-------------------|-----|
| Framework | JUnit 5 | `testing` (standard library) |
| Mocking | Mockito | testify/mock or hand-written fakes |
| Assertions | AssertJ | testify/assert + testify/require |
| Speed | < 5 ms per test | < 5 ms per test |
| When they run | On every push and in CI | Same |

### What to test

- Domain entities: invariants, state transitions, value calculations
- Value objects: equality, validation
- Application use cases: orchestration logic with port fakes/mocks

### What NOT to test here

- Framework annotations (`@RestController`, HTTP router)
- SQL queries, document operations, repository implementations
- External HTTP calls

### Folder structure

**Java (three Maven modules, ADR-008):**

```
synkro-auth-api/
├── auth-core/src/test/java/co/edu/corhuila/synkro/auth/
│   ├── domain/model/SystemUserTest.java
│   └── application/usecase/
│       ├── RegisterUserUseCaseTest.java
│       └── FakeUserRepository.java                  # hand-written fake of the port
├── auth-adapters/src/test/java/…/adapter/out/persistence/
│   └── JdbcUserRepositoryIntegrationTest.java       # Tier 2
└── auth-app/src/test/java/…/app/
    └── AuthHttpTest.java                            # Tier 2
```

**Go:**

```
synkro-products-api/
├── internal/domain/model/product_test.go
├── internal/application/usecase/products_test.go    # with a hand-written fake of the ports
└── internal/adapter/
    ├── in/httpapi/handler_test.go                   # Tier 2: httptest and the in-memory repository
    └── out/persistence/postgres_integration_test.go # Tier 2: TEST_DATABASE_URL
```

`synkro-sales-api` follows the same Go layout; only its
`out/persistence/` package differs — `mongo_integration_test.go`
instead of `postgres_integration_test.go` — because its domain and
application layers import nothing beyond the standard library and the
engine behind the repository port, same as every other Go service
(`_stacks/go.md`, "Sales: the same shape, a different persistence
adapter").

### Naming conventions

**Java:**

```java
// Class: <ClassUnderTest>Test.java
// Method: should_<expectedBehavior>_when_<condition>

class SystemUserTest {
    @Test
    void should_reject_creation_when_email_is_empty() { ... }

    @Test
    void should_default_to_active_on_creation() { ... }
}
```

**Go:**

```go
// File: <module>_test.go in the same package
// Function: Test<Function>_<condition>

func TestNewProduct_RejectsZeroPrice(t *testing.T) { ... }

func TestAdjustStock_RejectsNegativeResult(t *testing.T) { ... }
```

### Example — domain unit test

**Java (auth domain):**

```java
// auth-core/src/test/java/co/edu/corhuila/synkro/auth/domain/model/SystemUserTest.java
@Test
void should_reject_creation_when_role_is_SERVICE() {
    assertThatThrownBy(() -> SystemUser.create("Alice", "alice@test.com", "hash", "SERVICE"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("SERVICE is not a valid person role");
}
```

**Go (products domain):**

```go
// internal/domain/model/product_test.go
func TestNewProduct_RejectsZeroPrice(t *testing.T) {
    _, err := model.NewProduct("p-1", "Mouse", 0, "c-1")
    require.ErrorIs(t, err, model.ErrPriceNotPositive)
}
```

### Example — application unit test with port fake

**Java (auth application):**

```java
// auth-core/src/test/java/co/edu/corhuila/synkro/auth/application/usecase/RegisterUserUseCaseTest.java
@Test
void should_hash_password_and_persist_user() {
    var userRepo = new FakeUserRepository();
    var hasher = new FakePasswordHasher();
    var useCase = new RegisterUserUseCase(userRepo, hasher);

    var result = useCase.execute("Alice", "alice@test.com", "plaintext", "ADMIN");

    assertThat(result.email()).isEqualTo("alice@test.com");
    assertThat(userRepo.findById(result.userId())).isPresent();
    assertThat(hasher.lastHashed()).isEqualTo("plaintext");
}
```

**Go (products application):**

```go
// internal/application/usecase/products_test.go
func TestCreate_ReturnsTheOriginalProductWhenTheKeyIsRepeated(t *testing.T) {
    uc := NewProducts(newFakeProducts(), &sequentialIDs{})
    cmd := in.CreateProductCommand{IdempotencyKey: "key-12345", Name: "Mouse", PriceCents: 45_990_00, CategoryID: "c-1"}

    first, _ := uc.Create(context.Background(), cmd)
    second, err := uc.Create(context.Background(), cmd)

    require.NoError(t, err)
    assert.False(t, second.Created)
    assert.Equal(t, first.ProductID, second.ProductID)
}
```

A hand-written fake of `synkro-sales-api`'s `SaleRepository` port is
written exactly the same way — it holds sales in a map, keyed by
`idempotencyKey`, and needs nothing from MongoDB to exist.

---

## Tier 2 — HTTP and integration tests

**Objective:** verify the adapters. The HTTP adapter is tested in memory; the
persistence adapter is tested against a real store. A fake repository only
proves that the fake was called: it does not prove that the query is valid, that
the mapping keeps the types or that the migration or validator exists.

| Level | What it verifies | What it needs |
|-------|------------------|---------------|
| HTTP | every variant of `401`, the error envelope and correlation, field validation, idempotent retry, page limit | the server in memory, with the in-memory repository |
| Integration (PostgreSQL domains) | round trip, rollback of the idempotency key, update and page | PostgreSQL with the schema of the `-db` repository, through `TEST_DATABASE_URL` |
| Integration (Sales, MongoDB) | round trip, the unique-index rejection on a repeated `idempotencyKey`, the validator's rejection of a malformed document | a MongoDB replica set with the `sale` collection and its validator applied by `synkro-sales-db`'s migrations, through `TEST_MONGODB_URI` |

| Aspect | Java (Spring Boot) | Go (PostgreSQL) | Go (Sales, MongoDB) |
|--------|-------------------|-----|-----|
| HTTP tests | `@SpringBootTest(webEnvironment = RANDOM_PORT)` in `<domain>-app`, with the in-memory repository | `net/http/httptest` in `internal/adapter/in/httpapi/` | Same as Go (PostgreSQL) — the HTTP adapter does not know which engine backs it |
| Integration tests | `<Class>IntegrationTest` in `<domain>-adapters`, enabled only when `TEST_DATABASE_URL` is defined | `postgres_integration_test.go`, skipped with `t.Skip` when `TEST_DATABASE_URL` is empty | `mongo_integration_test.go`, skipped with `t.Skip` when `TEST_MONGODB_URI` is empty |
| Speed | 1–5 s per test | 1–5 s per test | 1–5 s per test |
| When they run | HTTP: on every push; integration: in CI on every PR, where PostgreSQL and the `-db` migrations are available | Same | HTTP: on every push; integration: in CI on every PR, where the MongoDB replica set and `synkro-sales-db`'s Liquibase migrations are available |

### What to test

- The HTTP behavior of every service, which is verified by HTTP and not by language: `/health` without a token, `401` for a missing, expired, badly signed or non-RS256 token, the error envelope with the same `X-Correlation-Id`, `400` with one `details` entry per invalid field, `201` with `Location` and `200` with the same id on a repeated `Idempotency-Key`, a bounded page (`limit` above 100 is `400`)
- Repository adapters: CRUD against a real PostgreSQL schema, or in Sales' case, insert/find against the real `sale` collection
- Flyway migrations: the CI rebuild check (drop, rebuild, rollback, rebuild), in each PostgreSQL `-db` repository
- Liquibase changesets: the equivalent rebuild check for `synkro-sales-db` — see "CI pipeline per repository type" below

### What NOT to test here

- Domain logic (covered by unit tests)
- Other services: the outgoing client is a port, so it is replaced by a fake

### Folder structure

**Java:**

```
auth-adapters/src/test/java/co/edu/corhuila/synkro/auth/adapter/out/persistence/
└── JdbcUserRepositoryIntegrationTest.java

auth-app/src/test/java/co/edu/corhuila/synkro/auth/app/
└── AuthHttpTest.java
```

**Go (PostgreSQL domains):**

```
internal/adapter/
├── in/httpapi/handler_test.go                       // httptest.NewServer + in-memory repository
└── out/persistence/postgres_integration_test.go     // skipped when TEST_DATABASE_URL is not set
```

**Go, `synkro-sales-api` (MongoDB):**

```
internal/adapter/
├── in/httpapi/handler_test.go                       // identical pattern — httptest + in-memory repository
└── out/persistence/mongo_integration_test.go         // skipped when TEST_MONGODB_URI is not set
```

### Example — repository integration test

**Java:**

```java
// auth-adapters/src/test/java/…/adapter/out/persistence/JdbcUserRepositoryIntegrationTest.java
@EnabledIfEnvironmentVariable(named = "TEST_DATABASE_URL", matches = ".+")
class JdbcUserRepositoryIntegrationTest {

    @Test
    void should_persist_and_find_by_email() {
        var repository = repositoryOver(System.getenv("TEST_DATABASE_URL")); // JdbcTemplate over that URL (helper omitted)
        var user = SystemUser.create("Alice", uniqueEmail(), "hash", "ADMIN");
        repository.save(user);

        var found = repository.findByEmail(user.email());
        assertThat(found).isPresent();
        assertThat(found.get().role()).isEqualTo("ADMIN");
    }
}
```

**Go (PostgreSQL):**

```go
// internal/adapter/out/persistence/postgres_integration_test.go
func TestCreateOnce_ReturnsTheOriginalProductWhenTheKeyIsRepeated(t *testing.T) {
    url := os.Getenv("TEST_DATABASE_URL")
    if url == "" {
        t.Skip("TEST_DATABASE_URL is not set")
    }
    repo := NewPostgres(openDB(t, url)) // the schema comes from synkro-products-db (helper omitted)

    first, created, err := repo.CreateOnce(context.Background(), "key-12345", newProduct(t))
    require.NoError(t, err)
    require.True(t, created)

    again, created, err := repo.CreateOnce(context.Background(), "key-12345", newProduct(t))
    require.NoError(t, err)
    assert.False(t, created)
    assert.Equal(t, first, again)
}
```

**Go, `synkro-sales-api` (MongoDB):**

```go
// internal/adapter/out/persistence/mongo_integration_test.go
func TestCreateOnce_ReturnsTheOriginalSaleWhenTheKeyIsRepeated(t *testing.T) {
    uri := os.Getenv("TEST_MONGODB_URI")
    if uri == "" {
        t.Skip("TEST_MONGODB_URI is not set")
    }
    repo := NewMongo(openDatabase(t, uri)) // the "sales" database comes from synkro-sales-db (helper omitted)

    first, created, err := repo.CreateOnce(context.Background(), "key-12345", newSale(t))
    require.NoError(t, err)
    require.True(t, created)

    again, created, err := repo.CreateOnce(context.Background(), "key-12345", newSale(t))
    require.NoError(t, err)
    assert.False(t, created)
    assert.Equal(t, first, again)
}

func TestCreateOnce_RejectsADocumentTheValidatorDoesNotAccept(t *testing.T) {
    uri := os.Getenv("TEST_MONGODB_URI")
    if uri == "" {
        t.Skip("TEST_MONGODB_URI is not set")
    }
    repo := NewMongo(openDatabase(t, uri))

    sale := newSale(t)
    sale.Details = append(sale.Details, make([]SaleDetail, 100)...) // 101 lines total

    _, _, err := repo.CreateOnce(context.Background(), "key-67890", sale)
    require.Error(t, err) // rejected by the collection's $jsonSchema validator (ADR-010 Decision 2)
}
```

---

## Tier 3 — Contract tests

**Objective:** verify that the service's HTTP responses match its
OpenAPI contract in `07-api/contracts/openapi/`.

| Aspect | Java (Spring Boot) | Go |
|--------|-------------------|-----|
| Tool | Spring MockMvc + openapi-diff or Schemathesis | Schemathesis (runs against the test server) |
| What they verify | Response shapes, status codes, required fields match the YAML | Same |
| When they run | In CI on every PR | Same |

### What to verify

- Every endpoint declared in the contract returns the documented status codes
- Response bodies match the declared schemas (required fields, types)
- Error responses use the closed catalog from `_shared.yaml`

### What NOT to verify here

- Business logic (covered by unit tests)
- Database or document-store state (covered by integration tests)

---

## Tier 4 — E2E tests (post-MVP)

**Status:** 🔮 deferred to post-MVP. The MVP validates flows manually
following `deployment.md` §9.

**Priority E2E flows (when implemented):**

| # | Flow | Services involved |
|---|------|------------------|
| 1 | Login and token refresh | `synkro-auth-api` |
| 2 | Sale registration saga (happy path) | `synkro-workflow` → `synkro-customers-api` → `synkro-products-api` → `synkro-sales-api` |
| 3 | Sale registration saga (compensation) | Same — stock released after sales-api failure |
| 4 | Low-stock alert job | `synkro-worker` → `synkro-products-api` |

---

## Frontend tests

**Objective:** the same test-first discipline as the backend, applied to
`synkro-front` (the host) and the four portals — three React remotes and
one Angular custom element (`synkro-customers-portal`, ADR-011). A
portal's tests never make a real network call and never start the
backend: they run against a double of the contract the host hands the
portal (`ShellContract`), the same type whether the portal is React or
Angular.

| Aspect | React (host, 3 portals) | Angular (Customers portal) |
|---|---|---|
| Test runner | Vitest | Angular's own test runner — the exact tool is fixed in `_stacks/frontend.md` (HU-DOCS-85); these rules apply regardless of which one it ends up being |
| Component tests | Testing Library | Angular's component testing utilities |
| Doubles | A hand-written fake implementing `ShellContract`'s `api.request`, `session.user()` and `navigate()` | Same fake, injected as the Angular service that wraps the contract |
| Speed | < 50 ms per test | < 50 ms per test |
| When they run | On every push and in CI | Same |

### What a portal's tests cover

- **The four view states** of every screen that lists or shows data: loading, error with retry, empty, and data — exercised by resolving or rejecting the `ShellContract` fake's `api.request` call differently per test.
- **Form behavior:** a required field left empty blocks submission without calling `api.request`; a field-level error returned in `details` renders next to its field; the idempotency key sent on the first attempt is reused verbatim on a retry after a failure (never regenerated).
- **Money conversion:** typed text (`"0.07"`) becomes integer minor-unit cents (`7`) before it reaches `api.request` — never a multiplied decimal.
- **Newest-request-wins:** two calls fired in quick succession (e.g. a fast search) resolve with the UI reflecting only the result of the one started last.

### What the host's tests cover

- **`apiClient`:** every outgoing call carries a fresh `X-Correlation-Id` and the gateway address from configuration; a `401` response closes the session; a request past its timeout fails as a `TIMEOUT` error; every failed response is mapped to one message, decided in exactly one place.
- **Session:** no session redirects a protected route to sign-in and returns to the original route afterward; in `develop`, pasting a valid development token starts a session with its `sub` and `role`, and an expired or malformed one is rejected with no session created.
- **Remote isolation:** a portal whose remote entry file fails to load renders `RemoteBoundary`'s "not available" notice, and the rest of the host's layout keeps working — exercised with a mocked failing `import()`, not a real stopped portal server.

Both the host's and a portal's tests run against **simulated HTTP
responses** (constructed in the test, or through a fetch double), never
against a running backend service and never against the `develop`
mock-server profile described in `deployment.md` §10 — that profile is
for manual and visual verification while a backend doesn't exist yet,
not for the automated test suite.

### No fixed data in production code

Exactly one place is allowed to hold data that stands in for a real
answer: the test file itself. A portal's or the host's non-test source
never contains a hardcoded list of customers, products or sales "to make
the screen show something" — if a screen needs to render during manual
development before its backend or the mock profile is up, that is what
the empty state is for.

### Frontend coverage thresholds

| Scope | Minimum coverage | Measured by |
|---|---|---|
| Host's `apiClient` and session modules | ≥ 85% statements | Vitest coverage (`v8` provider) |
| A portal's components and hooks/services | ≥ 70% statements | Same tool as the portal's framework |
| Global, per frontend repository | ≥ 70% statements | Same |

These are proposed defaults, set lower than the backend's line-coverage
thresholds because UI composition code has a different risk profile than
domain logic; the host's client and session code get the backend-like
85% because a bug there affects every portal at once. The team can
revise these once the first portal's real test suite exists.

---

## Development-time verification against simulated services

While a backend service does not exist yet, a portal is exercised two
ways, and neither substitutes for the tiers above:

1. **Its own tests** (this section), against a `ShellContract` fake — these are what CI runs and what the coverage gate measures.
2. **Manual, visual verification in `develop`**, against the contract-driven mock servers behind the gateway (`deployment.md` §10) — useful to see a screen with realistic-shaped data before the real service exists, but not automated and not part of this strategy's coverage or CI gates.

A mock server is removed from `develop` in the same pull request that
delivers the real service (`deployment.md` §10); nothing here changes
when that happens, since the portal's tests never depended on the mock
in the first place.

---

## CI pipeline per repository type

### Domain services (`-api`, `synkro-workflow`, `synkro-worker`)

```yaml
# .github/workflows/ci.yml (simplified)
jobs:
  unit-and-http-tests:
    steps:
      - run: mvn -B test        # Java; the integration tests are skipped
      # or: go test ./...       # Go; the integration tests are skipped

  integration-tests:
    services:
      postgres:
        image: postgres:16-alpine
    steps:
      - run: # apply the migrations of the -db repository to the CI instance (Flyway runner)
      - run: TEST_DATABASE_URL=… mvn -B test      # Java
      # or: TEST_DATABASE_URL=… go test ./...     # Go

  contract-tests:
    steps:
      - run: schemathesis run --validate-schema synkro-products-api.yaml

  coverage-gate:
    steps:
      - run: # fail if global < 80% or domain < 90%
```

`synkro-sales-api`'s pipeline follows the same four jobs, with one
difference in `integration-tests`: the service container is `mongo`
instead of `postgres`, the migrations applied beforehand are
`synkro-sales-db`'s Liquibase changesets instead of Flyway, and the test
run exports `TEST_MONGODB_URI` instead of `TEST_DATABASE_URL`. The
`unit-and-http-tests`, `contract-tests` and `coverage-gate` jobs are
unchanged, because they never touch the database engine.

### Database repositories (`-db`) — Auth, Customers, Products (Flyway)

```yaml
jobs:
  migration-rebuild:
    services:
      postgres:
        image: postgres:16-alpine
    steps:
      - run: flyway migrate          # build from V001
      - run: flyway undo -target=0   # rollback all U scripts
      - run: flyway migrate          # rebuild — must apply zero changes
      - run: flyway validate         # checksums match
```

### Database repository (`-db`) — Sales (Liquibase, MongoDB)

```yaml
jobs:
  migration-rebuild:
    services:
      mongo:
        image: mongo:7.0
    steps:
      - run: liquibase update                       # build from empty
      - run: liquibase update                        # apply again — must apply zero changesets
      - run: liquibase rollback-count --count=999999  # roll back every changeset
      - run: liquibase update                        # rebuild from empty again
      - run: # insert one document matching the sale schema — must succeed
      - run: # attempt an undeclared-field document, an out-of-range value, and a 101-line sale — each must be rejected by the $jsonSchema validator
```

The same "build, repeat with zero changes, roll back, rebuild" shape as
the Flyway check above; the last two steps are specific to Sales,
because only a document store has a validator to confirm, separately
from the migration tool itself (ADR-010 Decision 5).

### Gateway (`synkro-api-gateway`)

```yaml
jobs:
  smoke-test:
    steps:
      - run: docker compose up -d synkro-api-gateway
      - run: curl -f http://localhost:8000/health
      - run: # verify route config syntax (nginx -t)
```

### Frontend (`synkro-front`, portals)

```yaml
jobs:
  build-and-lint:
    steps:
      - run: npm ci
      - run: npm run lint
      - run: npm run build           # a portal that doesn't build is a broken portal

  unit-tests:
    steps:
      - run: npm run test -- --coverage   # required — see "Frontend tests" above

  coverage-gate:
    steps:
      - run: # fail if the repository's coverage is below the thresholds in "Frontend tests"
```

A frontend repository's pipeline is no longer allowed to skip its test
job: every portal and the host carry real tests from their first
implementation story, per "Frontend tests" above.

---

## Test data conventions

### Fixtures

Each service keeps its test fixtures alongside the tests:

**Java:**

```
auth-core/src/test/java/co/edu/corhuila/synkro/auth/application/usecase/
├── FakeUserRepository.java              // implements the UserRepository port
├── FakePasswordHasher.java              // implements the PasswordHasher port
└── SystemUserFixture.java               // builder for test SystemUser instances
```

**Go:**

```
internal/application/usecase/products_test.go   // fakeProducts and sequentialIDs, next to the test
internal/adapter/out/persistence/memory.go      // in-memory repository, shared by the HTTP tests
```

`synkro-sales-api` follows the identical Go pattern: its fake and its
`memory.go` hold `Sale` structs in a map, with no reference to MongoDB.

**Frontend:**

```
src/apiClient.ts                                 // production code — no fixed data
src/apiClient.test.ts                            // the ShellContract fake lives here, next to its test
src/__fixtures__/customers.ts                     // sample data shapes, imported only by *.test.ts files
```

### Test database

Integration tests against the PostgreSQL domains run against the
instance that `TEST_DATABASE_URL` points to, with the schema created by
the migrations of the `-db` repository. Integration tests against Sales
run against the MongoDB replica set that `TEST_MONGODB_URI` points to,
with the `sale` collection and its validator created by
`synkro-sales-db`'s migrations. In CI both are service containers to
which the migrations are applied before the tests; locally they can be
the instances `synkro-infra-postgres` and `synkro-infra-mongo` start
(`deployment.md` §9) or any instance with that schema or collection.
Each test uses its own data (unique values) and no test uses the `qa` or
`main` instances. Without the matching environment variable, the
integration tests are skipped instead of failing.

### Money in tests

All money values in tests use minor units (`priceCents = 4599_00` in
PostgreSQL domains, `unitPriceCents` as a `long` in Sales), consistent
with ADR-005 Decision 3. The underscore separator improves readability
without changing the value.

---

## Correlations

- TDD process (red → green → refactor), including the frontend → `11-quality/tdd-guide.md`
- Hexagonal layer structure → `05-architecture/hexagonal-architecture.md`
- OpenAPI contracts to validate → `07-api/contracts/openapi/`
- Coverage threshold in the DoD → `00-governance/definition-of-done.md`
- CI pipeline configuration → `10-devops/ci-cd.md`
- Migration rebuild check (PostgreSQL) → `05-architecture/deployment.md` §5; Sales' Liquibase check → ADR-010 Decision 5
- Development-time mock servers → `05-architecture/deployment.md` §10
- Gateway and frontend stack → ADR-008
- Sales domain on MongoDB → ADR-010
- Angular Customers portal → ADR-011
- Frontend structure and tooling (once written) → `_stacks/frontend.md`
