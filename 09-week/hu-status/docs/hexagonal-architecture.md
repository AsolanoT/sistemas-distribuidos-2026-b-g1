# Hexagonal Architecture (Ports and Adapters)

> This document closes Pillar 7. Until now, "hexagonal architecture" was
> only mentioned in passing in `overview.md` and cited by name from
> `CONTRIBUTING.md` and `technical-onboarding.md` — but the file itself
> never existed. This is that file.
>
> **Note on the example used:** sale registration is orchestrated by
> `synkro-workflow`'s saga (ADR-007). Inside `synkro-sales-api`, what
> remains is a clean single-domain example: receiving an
> already-validated sale (customer confirmed, stock reserved with frozen
> prices) from the saga's step 3, and persisting it with its details in
> one transaction. There is no outbox — events were deferred out of the
> MVP (ADR-007 Decision 5). That is the use case used below.
>
> **On language:** the walkthrough below uses Go, since `synkro-sales-api`
> is Go in production (ADR-001). For the equivalent in Java — used by
> `synkro-auth-api` and `synkro-customers-api` — see the Appendix at the
> end of this document, and `_stacks/java-spring.md` for Java-specific
> conventions beyond this one example.

---

## Why this separation exists

Pillar 7 requires that domain code **never import a framework**. The
reason isn't dogma — it's that business rules (can a sale's `totalCents`
differ from the sum of its lines? can stock go negative?) shouldn't stop
compiling just because the team decides to switch from Spring Boot to a
different framework, or from one relational database to another.

If the domain imports JPA's `@Entity`, or a Go `sql.DB` directly, the
business rules become tied to an infrastructure decision that has
nothing to do with the business itself.

---

## The 3 layers

```
┌─────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                        │
│   (the only place that touches I/O: HTTP, SQL, queues)    │
│                                                             │
│   REST Controllers · Repositories · HTTP Clients            │
│   ┌───────────────────────────────────────────────┐       │
│   │                 APPLICATION                     │       │
│   │   (orchestrates the domain, defines what it needs) │    │
│   │                                                  │       │
│   │   Use Cases · Ports (interfaces)                │       │
│   │   ┌─────────────────────────────────────┐      │       │
│   │   │              DOMAIN                   │      │       │
│   │   │  (business rules, nothing else)       │      │       │
│   │   │                                        │      │       │
│   │   │   Entities · Invariants               │      │       │
│   │   └─────────────────────────────────────┘      │       │
│   └───────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘

Dependency rule: import arrows only point inward.
Infrastructure → Application → Domain.  Never the other way around.
```

### Domain

Contains the entities and their invariants — exactly what is already
documented in `02-domain/entities-and-rules.md`, now expressed as code.
**It imports nothing external**: no web framework, no database driver,
no HTTP library. If `synkro-sales-api`'s domain can compile without
PostgreSQL or Gin/Echo installed, it's done right.

### Application

Contains the **use cases** — the orchestration of a complete operation —
and defines the **ports**: interfaces that state *what* the use case
needs, without saying *how* it's implemented. An outbound port
(`SaleRepository`) says "I need to be able to save a sale", without
knowing whether that means PostgreSQL, a file, or memory.

### Infrastructure

The **adapters** — the only classes/structs that actually touch I/O.
They split into two directions:

- **Inbound adapters**: receive something from outside and call the use
  case. Example: a REST controller.
- **Outbound adapters**: implement a port the use case needs. Example: a
  PostgreSQL repository that implements `SaleRepository`.

---

## Ports and adapters, in code

> In the examples the package names are shortened (`application`, `postgres`, `domain`). In a
> repository each folder is its own package (`out`, `usecase`, `persistence`, `model`), as the table
> in "Where each layer lives in the repository" shows; the comment above each example gives its real file.

A **port** is an interface defined in the Application layer:

```go
// internal/application/port/out/ports.go
package application

type SaleRepository interface {
    Save(ctx context.Context, sale *domain.Sale) error
}
```

An **adapter** implements that port, in the Infrastructure layer:

```go
// internal/adapter/out/persistence/postgres.go
package postgres

type PostgresSaleRepository struct {
    db *sql.DB
}

func (r *PostgresSaleRepository) Save(ctx context.Context, sale *domain.Sale) error {
    // the only place in the service that writes real SQL
    tx, err := r.db.BeginTx(ctx, nil)
    // ...
}
```

**The rule this enforces:** the use case (Application) never mentions
`sql.DB` or any PostgreSQL detail — it only knows the `SaleRepository`
interface. A use-case test can be written with an in-memory
`FakeSaleRepository`, with no database running. This is what makes
Pillar 2 (TDD) possible: testing business logic without real
infrastructure.

*(The same port, and the same rule, expressed in Java — see the
Appendix.)*

---

## Complete example: `RegisterSaleUseCase`

Walks through the 3 layers for the use case that remains in
`synkro-sales-api` after ADR-007 — receiving a sale already validated by
`synkro-workflow` (saga step 3) and persisting it with its details in
one transaction.

### 1. Domain — the `Sale` entity with its invariants

```go
// internal/domain/model/sale.go
package domain

import "errors"

type Sale struct {
    ID         string
    CustomerID string
    CreatedBy  string
    Details    []SaleDetail
    TotalCents int64 // minor units, 1/100 COP (ADR-005 Decision 3)
}

// NewSale applies the invariants from entities-and-rules.md when constructing.
func NewSale(customerID, createdBy string, details []SaleDetail) (*Sale, error) {
    if len(details) == 0 {
        return nil, errors.New("a sale must have at least 1 detail line")
    }
    var totalCents int64
    for _, d := range details {
        if d.Quantity <= 0 {
            return nil, errors.New("quantity must be greater than 0")
        }
        expectedSubtotal := d.UnitPriceCents * int64(d.Quantity)
        if d.SubtotalCents != expectedSubtotal {
            return nil, errors.New("subtotalCents must equal quantity * unitPriceCents")
        }
        totalCents += d.SubtotalCents
    }
    return &Sale{CustomerID: customerID, CreatedBy: createdBy, Details: details, TotalCents: totalCents}, nil
}
```

**Why this is pure domain:** it imports nothing from HTTP, SQL, or a
framework — only the Go standard library's `errors` package.

### 2. Application — the use case and the port

```go
// internal/application/usecase/sales.go
package application

type RegisterSaleUseCase struct {
    repo SaleRepository // port, not the concrete implementation
}

func (uc *RegisterSaleUseCase) Execute(ctx context.Context, cmd RegisterSaleCommand) (*domain.Sale, error) {
    sale, err := domain.NewSale(cmd.CustomerID, cmd.CreatedBy, cmd.Details)
    if err != nil {
        return nil, err // domain error, propagated as-is
    }
    if err := uc.repo.Save(ctx, sale); err != nil {
        return nil, err
    }
    return sale, nil
}
```

**What this layer does, and does NOT do:** it orchestrates (creates the entity, calls the repository) but contains no business rule of its own — those were already applied inside `domain.NewSale(...)`. If a future requirement needs to publish an event (post-MVP, see `technical-backlog.md` TD-002), a second port (`EventPublisher`) is added and called here, without touching the domain.

### 3. Infrastructure — the inbound adapter (REST) and the outbound adapter (Postgres)

```go
// internal/adapter/in/httpapi/handler.go
package http

func (h *SaleHandler) RegisterSale(w http.ResponseWriter, r *http.Request) {
    var req registerSaleRequest
    json.NewDecoder(r.Body).Decode(&req)

    cmd := application.RegisterSaleCommand{
        CustomerID: req.CustomerID,
        CreatedBy:  req.CreatedBy, // sub of the validated service token (ADR-006)
        Details:    req.toDomainDetails(),
    }

    sale, err := h.useCase.Execute(r.Context(), cmd)
    if err != nil {
        writeError(w, err) // maps the domain error to an HTTP status code
        return
    }
    writeJSON(w, http.StatusCreated, sale)
}
```

```go
// internal/adapter/out/persistence/postgres.go
package postgres

func (r *PostgresSaleRepository) Save(ctx context.Context, sale *domain.Sale) error {
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    if _, err := tx.ExecContext(ctx,
        `INSERT INTO sales_schema.sale (sale_id, customer_id, created_by, total_cents) VALUES ($1, $2, $3, $4)`,
        sale.ID, sale.CustomerID, sale.CreatedBy, sale.TotalCents); err != nil {
        return err
    }

    // No outbox write — events are deferred out of the MVP (ADR-007 Decision 5).
    // When a consumer exists, an EventPublisher port will be added to the use case.

    return tx.Commit()
}
```

**What makes this "infrastructure":** it's the only code in this whole
walkthrough that mentions `sql.DB`, `http.ResponseWriter`, or JSON —
everything that touches the outside world lives here, and nowhere else.

*(The same 3 layers, in Java — see the Appendix.)*

---

## How this enables TDD (Pillar 2)

The use case can be tested without PostgreSQL, using a fake repository
that only lives in memory:

```go
type fakeSaleRepository struct {
    saved *domain.Sale
}

func (f *fakeSaleRepository) Save(ctx context.Context, sale *domain.Sale) error {
    f.saved = sale
    return nil
}

func TestRegisterSaleUseCase_RejectsEmptyDetails(t *testing.T) {
    uc := RegisterSaleUseCase{repo: &fakeSaleRepository{}}
    _, err := uc.Execute(context.Background(), RegisterSaleCommand{
        CustomerID: "c1", CreatedBy: "u1", Details: []domain.SaleDetail{},
    })
    if err == nil {
        t.Fatal("expected error for empty details, got nil")
    }
}
```

This test is written **before** the implementation (red → green →
refactor), does not depend on a running database, and runs in
milliseconds — exactly what Pillar 2 requires.

---

## Where each layer lives in the repository

The three layers of this document are folders and, in Java, Maven modules. The
dependency rule is the same in every language: the domain imports nothing
external, the application imports only the domain, and the adapters (the
"infrastructure" layer of this document) import both.

| Layer of this document | Go (`synkro-products-api`) | Java (`synkro-customers-api`) |
|---|---|---|
| Domain | `internal/domain/model/` | `customers-core/…/domain/model/` |
| Application — inbound ports | `internal/application/port/in/` | `customers-core/…/application/port/in/` |
| Application — outbound ports | `internal/application/port/out/` | `customers-core/…/application/port/out/` |
| Application — use cases | `internal/application/usecase/` | `customers-core/…/application/usecase/` |
| Infrastructure — HTTP adapter | `internal/adapter/in/httpapi/` | `customers-adapters/…/adapter/in/http/` |
| Infrastructure — persistence adapter | `internal/adapter/out/persistence/` | `customers-adapters/…/adapter/out/persistence/` |
| Composition root | `cmd/products-api/main.go` and `internal/config/` | `customers-app/` |

### Go (synkro-products-api, synkro-sales-api, synkro-worker)

```
synkro-products-api/
├── cmd/products-api/main.go                 # composition root
├── deploy/                                  # compose.yml (declares this service) and Dockerfile
├── internal/
│   ├── adapter/
│   │   ├── in/httpapi/                      # inbound: handlers, auth, error envelope, middleware
│   │   └── out/persistence/                 # outbound: PostgreSQL and in-memory repositories
│   ├── application/
│   │   ├── port/in/                         # use case interfaces
│   │   ├── port/out/                        # repository and id generator interfaces
│   │   └── usecase/
│   ├── config/                              # environment variables and explicit limits
│   └── domain/model/                        # entities, invariants, typed errors
├── .env.example
└── go.mod
```

### Java — three Maven modules (synkro-auth-api, synkro-customers-api, synkro-workflow)

```
synkro-customers-api/
├── customers-core/                          # domain and use cases — NO framework dependency
│   └── src/main/java/co/edu/corhuila/synkro/customers/
│       ├── domain/model/                    # Customer, DomainException
│       └── application/{port/in, port/out, usecase}
├── customers-adapters/                      # depends on customers-core and on Spring
│   └── src/main/java/co/edu/corhuila/synkro/customers/adapter/
│       ├── in/http/                         # controller, filters, error handler
│       └── out/persistence/                 # JdbcCustomerRepository, InMemoryCustomerRepository
├── customers-app/                           # Spring Boot application: wires everything together
├── deploy/                                  # compose.yml (declares this service) and Dockerfile
└── pom.xml                                  # parent: lists the three modules
```

**The core module's `pom.xml` declares no framework.** A `@Service`, an `@Entity`
or a Spring import in the domain or in a use case does not compile — the
dependency rule is enforced by the build, not by convention. The use case is a
plain class; `customers-app` creates it.

**The `-api` repositories hold no database and no migrations.** `deploy/compose.yml`
declares the service itself; the PostgreSQL instance belongs to `synkro-infra` and
the migrations to the `-db` repository (ADR-009, ADR-005 Decision 2).

**The worker and the workflow have the same shape** with another inbound adapter:
a scheduler for the worker, HTTP for the workflow. For the full trees, the
libraries, the configuration and a worked example per language, see
`_stacks/go.md` and `_stacks/java-spring.md`.

---

## Common mistakes this document prevents

| Mistake | Why it breaks the architecture |
|---|---|
| Annotating the domain entity with `@Entity` (JPA) | The domain becomes dependent on Hibernate — it can no longer be tested without an `EntityManager` |
| The use case runs a `SELECT` directly with SQL | It skips the port — the repository can no longer be swapped for a fake in tests |
| The controller contains business logic ("if total is greater than X, apply a discount") | That rule should live in the domain; the controller only translates HTTP ↔ command |
| The domain throws a Spring exception (`ResponseStatusException`) | The domain shouldn't know HTTP exists; it should throw its own exception, and the adapter translates it to an HTTP status code |

---

## Appendix: Java comparison

Everything below is the same walkthrough as the body of this document,
written in Java (Spring Boot) instead of Go — shown for comparison
across the team's 2 languages, **not** because `synkro-sales-api` runs on
Java. `synkro-sales-api` is Go only, in production, per ADR-001. Use
`synkro-auth-api` or `synkro-customers-api` as the real reference if
you're building in Java.

### Port and adapter

```java
// <domain>-core/…/application/port/out/SaleRepository.java
public interface SaleRepository {
    void save(Sale sale);
}
```

```java
// <domain>-adapters/…/adapter/out/persistence/PostgresSaleRepository.java
@Repository
public class PostgresSaleRepository implements SaleRepository {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void save(Sale sale) {
        // the only place in the service that writes real SQL
    }
}
```

### 1. Domain — the `Sale` entity

```java
// <domain>-core/…/domain/model/Sale.java
public class Sale {
    private final String customerId;
    private final String createdBy;
    private final List<SaleDetail> details;
    private final long totalCents; // minor units, 1/100 COP (ADR-005 Decision 3)

    // The constructor applies the same invariants — throws a domain
    // exception, not a framework exception, if something doesn't hold.
    public Sale(String customerId, String createdBy, List<SaleDetail> details) {
        if (details.isEmpty()) {
            throw new InvalidSaleException("a sale must have at least 1 detail line");
        }
        long computedTotalCents = 0;
        for (SaleDetail d : details) {
            if (d.getQuantity() <= 0) {
                throw new InvalidSaleException("quantity must be greater than 0");
            }
            long expected = d.getUnitPriceCents() * d.getQuantity();
            if (d.getSubtotalCents() != expected) {
                throw new InvalidSaleException("subtotalCents must equal quantity * unitPriceCents");
            }
            computedTotalCents += d.getSubtotalCents();
        }
        this.customerId = customerId;
        this.createdBy = createdBy;
        this.details = details;
        this.totalCents = computedTotalCents;
    }
}
```

### 2. Application — the use case

```java
// <domain>-core/…/application/usecase/RegisterSaleUseCase.java
// No @Service: the core module has no Spring dependency; <domain>-app creates this class.
public class RegisterSaleUseCase {
    private final SaleRepository repository; // port, not the implementation

    public RegisterSaleUseCase(SaleRepository repository) {
        this.repository = repository;
    }

    public Sale execute(RegisterSaleCommand cmd) {
        Sale sale = new Sale(cmd.getCustomerId(), cmd.getCreatedBy(), cmd.getDetails());
        repository.save(sale);
        return sale;
    }
}
```

### 3. Infrastructure — inbound and outbound adapters

```java
// <domain>-adapters/…/adapter/in/http/SaleController.java
@RestController
@RequestMapping("/api/v1/sales")
public class SaleController {
    private final RegisterSaleUseCase useCase;

    @PostMapping
    public ResponseEntity<SaleResponse> registerSale(
            @RequestBody RegisterSaleRequest req,
            @AuthenticationPrincipal JwtPayload token) {
        // createdBy comes from the validated service token's payload (ADR-006),
        // not from an X-User-Id header
        RegisterSaleCommand cmd = req.toCommand(token.getCreatedBy());
        Sale sale = useCase.execute(cmd);
        return ResponseEntity.status(HttpStatus.CREATED).body(SaleResponse.from(sale));
    }

    @ExceptionHandler(InvalidSaleException.class)
    public ResponseEntity<ErrorResponse> handleInvalidSale(InvalidSaleException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
    }
}
```

```java
// <domain>-adapters/…/adapter/out/persistence/PostgresSaleRepository.java (full version)
@Repository
public class PostgresSaleRepository implements SaleRepository {
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void save(Sale sale) {
        jdbcTemplate.update(
            "INSERT INTO sales_schema.sale (sale_id, customer_id, created_by, total_cents) VALUES (?, ?, ?, ?)",
            sale.getId(), sale.getCustomerId(), sale.getCreatedBy(), sale.getTotalCents());

        // No outbox write — events are deferred out of the MVP (ADR-007 Decision 5).
        // When a consumer exists, an EventPublisher port will be added to the use case.
    }
}
```

For Java-specific conventions beyond this one example (naming, project
layout, testing setup), see `_stacks/java-spring.md`.

---

## Correlations

- Domain invariants this example implements → `02-domain/entities-and-rules.md`
- Saga that orchestrates sale registration → `05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md`
- Data model per schema → `06-data/models.md`
- Money in minor units → ADR-005 Decision 3
- Token validation per service → ADR-006
- General architectural principle (Pillar 7) → `05-architecture/overview.md`, Architectural Principles
- Go-specific conventions and folder structure → `_stacks/go.md`
- Java-specific conventions and folder structure → `_stacks/java-spring.md`
- Full testing strategy → `11-quality/testing-strategy.md`
