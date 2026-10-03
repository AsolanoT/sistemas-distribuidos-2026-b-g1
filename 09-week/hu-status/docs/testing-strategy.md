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
> their respective stacks (ADR-008).

---

## Testing pyramid

```
                 /\
                /  \
               / E2E \       ← Few, slow — critical flows only (post-MVP)
              / [5%]  \
             /──────────\
            / Integration \
           /    [25%]      \  ← HTTP adapter in memory; persistence adapter on PostgreSQL
          /────────────────\
         /  Contract Tests   \
        /      [20%]          \  ← OpenAPI contract compliance (synkro-products-api.yaml, etc.)
       /──────────────────────\
      /       Unit Tests        \
     /          [50%]            \  ← Domain + application layer, no I/O
    /────────────────────────────\
```

**Rule:** more tests at the bottom = more maintainable system at lower
cost. Inverting the pyramid makes CI slow and fragile.

---

## Coverage thresholds

| Layer | Minimum coverage | Measured by |
|-------|-----------------|-------------|
| Domain (`domain/`) | ≥ 90% lines | JaCoCo (Java) / `go test -coverprofile` (Go) |
| Application (`application/`) | ≥ 80% lines | Same |
| Infrastructure (`infrastructure/`) | ≥ 60% lines | Same — adapters are tested by integration tests, not unit tests |
| Global (all layers) | ≥ 80% lines | Same |

**Coverage rule:** if a PR lowers the global coverage, CI fails.
Coverage cannot go down — uncovered code requires tests in the same PR.

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
- SQL queries, repository implementations
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

---

## Tier 2 — HTTP and integration tests

**Objective:** verify the adapters. The HTTP adapter is tested in memory; the
persistence adapter is tested against a real PostgreSQL. A fake repository only
proves that the fake was called: it does not prove that the SQL is valid, that
the mapping keeps the types or that the migration exists.

| Level | What it verifies | What it needs |
|-------|------------------|---------------|
| HTTP | every variant of `401`, the error envelope and correlation, field validation, idempotent retry, page limit | the server in memory, with the in-memory repository |
| Integration | round trip, rollback of the idempotency key, update and page | PostgreSQL with the schema of the `-db` repository, through `TEST_DATABASE_URL` |

| Aspect | Java (Spring Boot) | Go |
|--------|-------------------|-----|
| HTTP tests | `@SpringBootTest(webEnvironment = RANDOM_PORT)` in `<domain>-app`, with the in-memory repository | `net/http/httptest` in `internal/adapter/in/httpapi/` |
| Integration tests | `<Class>IntegrationTest` in `<domain>-adapters`, enabled only when `TEST_DATABASE_URL` is defined | `postgres_integration_test.go`, skipped with `t.Skip` when `TEST_DATABASE_URL` is empty |
| Speed | 1–5 s per test | 1–5 s per test |
| When they run | HTTP: on every push; integration: in CI on every PR, where PostgreSQL and the `-db` migrations are available | Same |

### What to test

- The HTTP behavior of every service, which is verified by HTTP and not by language: `/health` without a token, `401` for a missing, expired, badly signed or non-RS256 token, the error envelope with the same `traceId` as the received `X-Correlation-Id`, `400` with one `details` entry per invalid field, `201` with `Location` and `200` with the same id on a repeated `Idempotency-Key`, a bounded page (`limit` above 100 is `400`)
- Repository adapters: CRUD against a real PostgreSQL schema
- Flyway migrations: the CI rebuild check (drop, rebuild, rollback, rebuild), in the `-db` repository

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

**Go:**

```
internal/adapter/
├── in/httpapi/handler_test.go                       // httptest.NewServer + in-memory repository
└── out/persistence/postgres_integration_test.go     // skipped when TEST_DATABASE_URL is not set
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

**Go:**

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
- Database state (covered by integration tests)

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

### Database repositories (`-db`)

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
      - run: npm run test -- --coverage  # if unit tests exist
```

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

### Test database

Integration tests run against the PostgreSQL that `TEST_DATABASE_URL` points to,
with the schema created by the migrations of the `-db` repository. In CI it is a
service container to which the migrations are applied before the tests; locally it
can be the instance of `synkro-infra` (`deployment.md` §9) or any PostgreSQL with
that schema. Each test uses its own data (unique values) and no test uses the `qa`
or `main` instances. Without `TEST_DATABASE_URL`, the integration tests are
skipped instead of failing.

### Money in tests

All money values in tests use minor units (`priceCents = 4599_00`),
consistent with ADR-005 Decision 3. The underscore separator improves
readability without changing the value.

---

## Correlations

- TDD process (red → green → refactor) → `11-quality/tdd-guide.md`
- Hexagonal layer structure → `05-architecture/hexagonal-architecture.md`
- OpenAPI contracts to validate → `07-api/contracts/openapi/`
- Coverage threshold in the DoD → `00-governance/definition-of-done.md`
- CI pipeline configuration → `10-devops/README.md` (not yet created)
- Migration rebuild check → `05-architecture/deployment.md` §5
- Gateway and frontend stack → ADR-008
