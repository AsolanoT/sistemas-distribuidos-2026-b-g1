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
           /    [25%]      \  ← Adapters against real DB (Testcontainers / dockertest)
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

**Java (3-module Maven, ADR-008):**

```
synkro-auth-api/
├── domain/src/test/java/com/synkro/auth/domain/
│   ├── SystemUserTest.java
│   └── RefreshTokenTest.java
├── application/src/test/java/com/synkro/auth/application/
│   ├── RegisterUserUseCaseTest.java
│   └── LoginUseCaseTest.java
└── infrastructure/src/test/java/com/synkro/auth/infrastructure/
    └── (integration tests — see Tier 2)
```

**Go (`cmd/internal/pkg`, ADR-008):**

```
synkro-products-api/
├── internal/domain/
│   ├── product_test.go
│   ├── category_test.go
│   └── stock_adjustment_test.go
├── internal/application/
│   ├── create_product_test.go
│   └── adjust_stock_test.go
└── internal/infrastructure/
    └── (integration tests — see Tier 2)
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
// domain/src/test/java/com/synkro/auth/domain/SystemUserTest.java
@Test
void should_reject_creation_when_role_is_SERVICE() {
    assertThatThrownBy(() -> SystemUser.create("Alice", "alice@test.com", "hash", "SERVICE"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("SERVICE is not a valid person role");
}
```

**Go (products domain):**

```go
// internal/domain/product_test.go
func TestNewProduct_RejectsZeroPrice(t *testing.T) {
    _, err := domain.NewProduct("Mouse", 0, categoryID)
    require.Error(t, err)
    assert.Contains(t, err.Error(), "price must be positive")
}
```

### Example — application unit test with port fake

**Java (auth application):**

```java
// application/src/test/java/com/synkro/auth/application/RegisterUserUseCaseTest.java
@Test
void should_hash_password_and_persist_user() {
    var userRepo = new InMemoryUserRepository();
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
// internal/application/create_product_test.go
func TestCreateProduct_PersistsWithZeroStock(t *testing.T) {
    repo := fake.NewProductRepository()
    uc := application.NewCreateProductUseCase(repo)

    product, err := uc.Execute("Mouse", 4599_00, categoryID)

    require.NoError(t, err)
    assert.Equal(t, int64(4599_00), product.PriceCents)
    assert.Equal(t, 0, product.Stock)
    assert.True(t, repo.Exists(product.ID))
}
```

---

## Tier 2 — Integration tests

**Objective:** verify that adapters work correctly with real systems
(PostgreSQL, HTTP clients).

| Aspect | Java (Spring Boot) | Go |
|--------|-------------------|-----|
| Framework | `@SpringBootTest` + Testcontainers | `dockertest` or Testcontainers for Go |
| Database | Testcontainers PostgreSQL | Same |
| Speed | 1–5 s per test | 1–5 s per test |
| When they run | In CI on every PR | Same |

### What to test

- Repository adapters: CRUD against a real PostgreSQL schema
- HTTP adapters (controllers): request → response with real Spring context or Go HTTP test server
- Flyway migrations: the CI rebuild check (drop, rebuild, rollback, rebuild)

### What NOT to test here

- Domain logic (covered by unit tests)
- Other services (use mocks or WireMock for outgoing HTTP)

### Folder structure

**Java:**

```
infrastructure/src/test/java/com/synkro/auth/infrastructure/
├── persistence/
│   └── SystemUserRepositoryIT.java
└── web/
    └── AuthControllerIT.java
```

**Go:**

```
internal/infrastructure/
├── persistence/
│   └── product_repository_test.go    // uses build tag //go:build integration
└── http/
    └── product_handler_test.go       // uses httptest.NewServer
```

### Example — repository integration test

**Java:**

```java
// infrastructure/src/test/java/.../SystemUserRepositoryIT.java
@SpringBootTest
@Testcontainers
class SystemUserRepositoryIT {
    @Container
    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private SystemUserRepository repo;

    @Test
    void should_persist_and_find_by_email() {
        var user = SystemUser.create("Alice", "alice@test.com", "hash", "ADMIN");
        repo.save(user);

        var found = repo.findByEmail("alice@test.com");
        assertThat(found).isPresent();
        assertThat(found.get().role()).isEqualTo("ADMIN");
    }
}
```

**Go:**

```go
// internal/infrastructure/persistence/product_repository_test.go
//go:build integration

func TestProductRepository_SaveAndFindByID(t *testing.T) {
    db := testutil.NewTestDB(t) // starts Testcontainers PostgreSQL
    repo := persistence.NewProductRepository(db)

    product, _ := domain.NewProduct("Mouse", 4599_00, categoryID)
    err := repo.Save(context.Background(), product)
    require.NoError(t, err)

    found, err := repo.FindByID(context.Background(), product.ID)
    require.NoError(t, err)
    assert.Equal(t, "Mouse", found.Name)
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
  unit-tests:
    steps:
      - run: ./mvnw test -pl domain,application    # Java
      # or: go test ./internal/domain/... ./internal/application/...  # Go

  integration-tests:
    services:
      postgres:
        image: postgres:16-alpine
    steps:
      - run: ./mvnw verify -pl infrastructure      # Java (Testcontainers)
      # or: go test -tags=integration ./internal/infrastructure/...  # Go

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
application/src/test/java/com/synkro/auth/
├── fake/
│   ├── InMemoryUserRepository.java      // implements UserRepository port
│   └── FakePasswordHasher.java          // implements PasswordHasher port
└── fixture/
    └── SystemUserFixture.java           // builder for test SystemUser instances
```

**Go:**

```
internal/testutil/
├── fake_product_repository.go           // implements ProductRepository port
├── fake_idempotency_store.go
└── fixtures.go                          // builder functions for test entities
```

### Test database

Integration tests use Testcontainers (Java) or `dockertest` (Go) to
spin up an ephemeral PostgreSQL instance. The test applies the domain's
Flyway migrations before each test suite and rolls back between tests.
No test uses the environment's shared instance.

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
