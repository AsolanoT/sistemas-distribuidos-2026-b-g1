# TDD Guide — Test-Driven Development

> TDD is not about testing — it is about **design**. Writing the test first forces you to think
> about the interface before the implementation. The result: simpler, more decoupled code
> with a test suite that documents system behavior.

> **Stack note:** The principles and cycle described here apply to every
> stack this project uses — both backend languages and both frontend
> frameworks. Concrete tools and commands are in:
> - Java + Spring Boot → `_stacks/java-spring.md`
> - Go → `_stacks/go.md`
> - Frontend (React host and portals, Angular Customers portal) → `_stacks/frontend.md` (HU-DOCS-85)
>
> Coverage thresholds, the test pyramid and CI integration are in
> `11-quality/testing-strategy.md` — this guide is about the cycle and the
> technique, that document is about what to run and how much of it is
> required.

---

## The Red-Green-Refactor cycle

```
        ┌──────────────────────────────────────────────────────────┐
        │                                                          │
        ▼                                                          │
   ┌─────────┐                                                     │
   │   RED   │  Write the smallest test that can fail.             │
   │  🔴     │  Do NOT implement anything yet.                     │
   └────┬────┘  The test must fail for the right reason.           │
        │                                                          │
        ▼                                                          │
   ┌─────────┐                                                     │
   │  GREEN  │  Write the MINIMUM code to make the test pass.      │
   │  🟢     │  Do not aim for elegance here. Just make it pass.   │
   └────┬────┘                                                     │
        │                                                          │
        ▼                                                          │
   ┌──────────────┐                                                │
   │   REFACTOR   │  Improve code without changing behavior.       │
   │  ♻️          │  Tests must remain green.                      │
   └──────────────┘                                                │
        │                                                          │
        └──────────────────────────────────────────────────────────┘
```

**The rule of 3 moments:**
1. `RED`: The test fails — confirms the test can detect the bug
2. `GREEN`: The test passes — the code does the bare minimum needed
3. `REFACTOR`: The code is clean — no duplication, well named

---

## The 3 testing principles (FIRST)

Good tests are:

| Letter | Principle | Description |
|--------|-----------|-------------|
| **F** | Fast | Run in milliseconds, not seconds |
| **I** | Isolated | Do not depend on other tests or execution order |
| **R** | Repeatable | Same result every time, regardless of environment |
| **S** | Self-validating | Pass / Fail without manual interpretation |
| **T** | Timely | Written BEFORE the code, not after |

---

## Test Doubles: the complete taxonomy

When the application layer needs a collaborator through a port (a
repository, an HTTP client), we replace it in tests with a double. Not
all doubles are the same:

### 1. Dummy
Does nothing. Passed to satisfy a constructor but never called.

**Java:**
```java
IdGenerator dummyIds = null; // never invoked in this test path
var service = new CustomerService(repository, dummyIds);
```

**Go:**
```go
var dummyIDs out.IDGenerator // nil, never called in this test path
uc := NewProducts(repo, dummyIDs)
```

### 2. Stub
Returns a hardcoded response. No call verification.

**Java:**
```java
class StubPasswordHasher implements PasswordHasher {
    @Override
    public String hash(String plaintext) {
        return "stubbed-hash"; // always the same, controls the scenario
    }
}
```

**Go:**
```go
type stubIDGenerator struct{}

func (s stubIDGenerator) NewID() string { return "fixed-id" }
```

### 3. Fake
A real but simplified implementation. Has state, behaves correctly but
lightweight — this is the kind this project uses the most, because it is
the only double that can prove idempotent behavior (calling it twice with
the same key returns the same result).

### 4. Mock
Has pre-programmed expectations and fails the test if not called exactly
as expected. Used sparingly in this project — a Fake is almost always
clearer and more robust to refactoring, per the "Why Fakes over Mocks"
note below.

**Java (Mockito):**
```java
@Test
void should_call_the_repository_exactly_once() {
    CustomerRepository mockRepo = mock(CustomerRepository.class);
    when(mockRepo.createOnce(any(), any())).thenReturn(new Created("c-1", true));

    new CustomerService(mockRepo, () -> "c-1").create(someCommand);

    verify(mockRepo, times(1)).createOnce(any(), any());
}
```

**Go (testify/mock):**
```go
type mockRepository struct{ mock.Mock }

func (m *mockRepository) CreateOnce(ctx context.Context, key string, p model.Product) (string, bool, error) {
    args := m.Called(ctx, key, p)
    return args.String(0), args.Bool(1), args.Error(2)
}
```

**Why Fakes over Mocks in this project:** Mocks are fragile — they break
if you refactor the internal implementation (how many times a method is
called, in what order) rather than the observable behavior. A Fake only
breaks if the actual *behavior* changes, which is what TDD should protect.
`testing-strategy.md`'s examples use Fakes for exactly this reason. The
frontend follows the same preference: a portal's tests use a hand-written
fake of `ShellContract`, not a mock that asserts call counts.

---

## TDD by layer (with Hexagonal Architecture)

### Layer 1: Domain — Unit tests for entities

These are the most valuable tests. They test pure business logic.
**No port doubles. No database. No HTTP.**

**Java** (`auth-core/src/test/java/…/domain/model/SystemUserTest.java`):
```java
class SystemUserTest {

    @Test
    void should_reject_creation_when_role_is_SERVICE() {
        assertThatThrownBy(() ->
            SystemUser.create("Alice", "alice@test.com", "hash", "SERVICE"))
            .isInstanceOf(DomainException.class)
            .hasMessageContaining("SERVICE is not a valid person role");
    }

    @Test
    void should_default_to_active_on_creation() {
        var user = SystemUser.create("Alice", "alice@test.com", "hash", "ADMIN");
        assertThat(user.active()).isTrue();
    }
}
```

**Go** (`internal/domain/model/product_test.go`):
```go
func TestNewProduct_RejectsZeroPrice(t *testing.T) {
    _, err := model.NewProduct("p-1", "Mouse", 0, "c-1")
    require.ErrorIs(t, err, model.ErrPriceNotPositive)
}

func TestNewProduct_StartsAtZeroStock(t *testing.T) {
    p, err := model.NewProduct("p-1", "Mouse", 45_990_00, "c-1")
    require.NoError(t, err)
    assert.Equal(t, 0, p.Stock)
}
```

**TDD step:**
1. 🔴 Write `should_reject_creation_when_role_is_SERVICE` — fails because the
   check does not exist yet
2. 🟢 Add the minimum validation inside the constructor
3. ♻️ Extract the list of valid roles into a named constant if it is
   checked in more than one place

`synkro-sales-api`'s domain follows this exact same layer, with the same
"no database" rule — whether the real adapter behind it will be
PostgreSQL or MongoDB (Sales, ADR-010) is invisible from here.

---

### Layer 2: Application — Use case tests

Test orchestration. Use Fakes for the ports (repositories, ID generators,
token issuers).

**Java:**
```java
class RegisterUserUseCaseTest {

    @Test
    void should_hash_password_and_persist_user() {
        var userRepo = new FakeUserRepository();
        var hasher = new SpyPasswordHasher();
        var useCase = new RegisterUserUseCase(userRepo, hasher);

        var result = useCase.execute("Alice", "alice@test.com", "plaintext", "ADMIN");

        assertThat(result.email()).isEqualTo("alice@test.com");
        assertThat(hasher.hashedValues).containsExactly("plaintext");
    }
}
```

**Go:**
```go
func TestCreate_ReturnsTheOriginalProductWhenTheKeyIsRepeated(t *testing.T) {
    uc := usecase.NewProducts(newFakeProducts(), &sequentialIDs{})
    cmd := in.CreateProductCommand{IdempotencyKey: "key-12345", Name: "Mouse", PriceCents: 45_990_00, CategoryID: "c-1"}

    first, _ := uc.Create(context.Background(), cmd)
    second, err := uc.Create(context.Background(), cmd)

    require.NoError(t, err)
    assert.False(t, second.Created)
    assert.Equal(t, first.ProductID, second.ProductID)
}
```

---

### Layer 3: Infrastructure — HTTP and integration tests

HTTP adapters are tested in memory, with the Fake repository; persistence
adapters are tested against a real store — PostgreSQL for the four
domains that share the instance, MongoDB for Sales. Both are Tier 2 of
`testing-strategy.md`, which has the full examples, the
`TEST_DATABASE_URL` convention for the PostgreSQL domains, and the
`TEST_MONGODB_URI` convention for Sales.

---

### Frontend: the same cycle, one more layer

The React host, the three React portals and the Angular Customers portal
(ADR-011) follow the identical Red-Green-Refactor cycle — only the
collaborator being faked changes. Where a backend use-case test fakes a
repository port, a portal's test fakes the `ShellContract` the host hands
it:

**Example — money conversion, written red first:**

```ts
// src/features/products/priceInput.test.ts
test('converts "0.07" to 7 cents before calling the contract', async () => {
  const contract = fakeShellContract(); // hand-written fake, see testing-strategy.md
  render(<ProductForm contract={contract} />);

  await userEvent.type(screen.getByLabelText('Price'), '0.07');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));

  expect(contract.api.request).toHaveBeenCalledWith(
    'POST', '/api/v1/products',
    expect.objectContaining({ body: expect.objectContaining({ priceCents: 7 }) }),
  );
});
```

1. 🔴 Write this test before `ProductForm` converts anything — it fails because `priceCents` is missing or wrong
2. 🟢 Add the minimum conversion logic (parse the typed text, multiply by 100, round) to make it pass
3. ♻️ Extract the conversion into a named helper once it is needed in a second form

The full list of what a portal's and the host's tests must cover — the
four view states, form and idempotency-key behavior, remote isolation,
coverage thresholds — is in `11-quality/testing-strategy.md`, "Frontend
tests". This guide only establishes that the cycle is the same one;
that document is the one to read for the complete list of cases and the
tooling per framework.

---

## Suggested order for a new use case

1. Write the domain test first (entity, invariant, typed error)
2. Implement the domain until the test passes
3. Write the use case test, with a Fake for each port
4. Implement the use case
5. Write the HTTP test, with the Fake repository behind it
6. Implement the HTTP adapter
7. Write the integration test against a real store (`TEST_DATABASE_URL`, or `TEST_MONGODB_URI` for Sales)
8. Implement the real persistence adapter
9. Refactor at any point while the tests are green

A new portal screen follows the frontend variant of the same order:
domain-equivalent logic first (a pure conversion or validation function,
if any), then the component test against the `ShellContract` fake, then
the component itself.

---

## Correlations

- Hexagonal Architecture (what makes a Fake possible) → `05-architecture/hexagonal-architecture.md`
- Test pyramid, tiers, tools, coverage thresholds and the full frontend tier → `11-quality/testing-strategy.md`
- Definition of Done (coverage is a merge requirement) → `00-governance/definition-of-done.md`
- Stack-specific test folder layout → `_stacks/java-spring.md`, `_stacks/go.md`, `_stacks/frontend.md`
- Sales domain on MongoDB → ADR-010
- Angular Customers portal → ADR-011
