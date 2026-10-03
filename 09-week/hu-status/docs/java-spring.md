# Stack: Java + Spring Boot

> This guide is for the Java services of SynkroTech SAS: `synkro-auth-api`,
> `synkro-customers-api` and `synkro-workflow`. They use Java 21, Spring Boot 3.5
> and Maven (ADR-008).
>
> The example is the Customers service. The concepts are in
> `05-architecture/hexagonal-architecture.md`; this guide gives the concrete
> modules, commands and code.

---

## Tools and minimum versions

| Tool | Version | Verify with |
|------|---------|------------|
| JDK | 21 LTS | `java --version` |
| Maven | 3.9+ | `mvn --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |

---

## Microservice folder structure (Hexagonal, three Maven modules)

Every Java service has three modules (ADR-008): `-core`, `-adapters` and `-app`.
The root package is `co.edu.corhuila.synkro.<domain>`.

```
synkro-customers-api/
├── .github/                              # common to every code repository
├── deploy/
│   ├── compose.yml                       # declares this service; the database instance belongs to synkro-infra (ADR-009)
│   └── Dockerfile
├── customers-adapters/                   # module: depends on customers-core and on Spring
│   ├── pom.xml
│   └── src/
│       ├── main/java/co/edu/corhuila/synkro/customers/adapter/
│       │   ├── in/http/                  # inbound adapter: REST
│       │   │   ├── ApiError.java
│       │   │   ├── AuthFilter.java       # requires the token
│       │   │   ├── CorrelationFilter.java
│       │   │   ├── CustomerController.java
│       │   │   ├── ErrorHandler.java     # the only place that maps a domain error to a status
│       │   │   ├── HealthController.java
│       │   │   └── Rs256Verifier.java    # closed list of algorithms: RS256 only
│       │   └── out/persistence/          # outbound adapter: PostgreSQL
│       │       ├── InMemoryCustomerRepository.java    # used by the HTTP tests
│       │       ├── JdbcCustomerRepository.java
│       │       └── UuidGenerator.java
│       └── test/java/…/adapter/out/persistence/
│           └── JdbcCustomerRepositoryIntegrationTest.java
├── customers-app/                        # module: the composition root
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/co/edu/corhuila/synkro/customers/app/
│       │   │   ├── CustomersApplication.java
│       │   │   └── CustomersConfiguration.java        # creates the use cases and wires the ports
│       │   └── resources/application.yml
│       └── test/java/…/app/CustomersHttpTest.java
├── customers-core/                       # module: NO framework dependency
│   ├── pom.xml
│   └── src/
│       ├── main/java/co/edu/corhuila/synkro/customers/
│       │   ├── application/
│       │   │   ├── port/
│       │   │   │   ├── in/CustomerUseCases.java
│       │   │   │   └── out/
│       │   │   │       ├── CustomerRepository.java
│       │   │   │       └── IdGenerator.java
│       │   │   └── usecase/CustomerService.java
│       │   └── domain/model/
│       │       ├── Customer.java
│       │       └── DomainException.java
│       └── test/java/…/application/usecase/CustomerServiceTest.java
├── .env.example
├── .gitignore
├── pom.xml                               # parent: lists the three modules
└── README.md
```

**Dependency rule:** the core module declares no framework in its `pom.xml`, so a
`@Service`, an `@Entity` or a Spring import in the domain or in a use case **does
not compile**. The rule is enforced by the build, not by memory. The use case is
a plain class; `customers-app` creates it.

| Piece | Module and package |
|---|---|
| Domain | `customers-core` → `…/domain/model/` |
| Inbound ports | `customers-core` → `…/application/port/in/` |
| Outbound ports | `customers-core` → `…/application/port/out/` |
| Use cases | `customers-core` → `…/application/usecase/` |
| REST adapter | `customers-adapters` → `…/adapter/in/http/` |
| Persistence adapter | `customers-adapters` → `…/adapter/out/persistence/` |
| Composition root | `customers-app` |

---

## Dependencies by module

```xml
<!-- pom.xml (parent) -->
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.5.x</version> <!-- pin the exact 3.5 patch -->
</parent>
<groupId>co.edu.corhuila.synkro</groupId>
<artifactId>synkro-customers-api</artifactId>
<packaging>pom</packaging>
<properties><java.version>21</java.version></properties>
<modules>
  <module>customers-core</module>
  <module>customers-adapters</module>
  <module>customers-app</module>
</modules>
```

```xml
<!-- customers-core/pom.xml -->
<dependencies>
  <!-- no compile dependency: the core does not know Spring -->
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

```xml
<!-- customers-adapters/pom.xml -->
<dependencies>
  <dependency>
    <groupId>co.edu.corhuila.synkro</groupId>
    <artifactId>customers-core</artifactId>
    <version>${project.version}</version>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
  </dependency>
</dependencies>
```

`customers-app` depends on the two modules, on `spring-boot-starter` and, in tests,
on `spring-boot-starter-test`; it also holds the `spring-boot-maven-plugin`. JSON
logs use `logstash-logback-encoder` (`05-architecture/cross-cutting.md` §2).

- **Input validation:** `jakarta.validation` (`@Valid`, `@NotNull`, `@Email`) in the request
  objects of each controller, before the use case is invoked (`00-governance/security-rules.md`).
- **JDBC, not JPA:** the persistence adapter uses `JdbcTemplate` and the domain
  model is a plain class, so there is no second `@Entity` model to keep in sync.
- **Flyway is not a dependency of the service.** Migrations live in the `-db`
  repository and run from its runner (`deployment.md` §5). If Flyway ever reaches
  the classpath, `SPRING_FLYWAY_ENABLED=false`. The only repository with its own
  `db/` folder is `synkro-workflow`, which migrates `workflow_schema`
  (ADR-007, ADR-009); even there, the application never migrates at startup.

---

## Configuration and explicit limits

Variables of this service (`05-architecture/deployment.md` §6):
`SPRING_DATASOURCE_URL=jdbc:postgresql://synkro-db:5432/synkro?currentSchema=customers_schema`,
`SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` (`CUSTOMERS_APP_*`),
`SPRING_FLYWAY_ENABLED=false`, `JWT_PUBLIC_KEY`, `SERVER_PORT=8080`.

```yaml
# customers-app/src/main/resources/application.yml (limits explained in cross-cutting.md §8)
server:
  port: ${SERVER_PORT:8080}
  shutdown: graceful
  tomcat:
    connection-timeout: 5s
    keep-alive-timeout: 60s
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    hikari:
      maximum-pool-size: 10
      connection-timeout: 5000
      connection-init-sql: SET statement_timeout = 5000
  flyway:
    enabled: false
```

---

## Example: create a customer

The use case builds the entity (which applies its invariants) and asks the
repository to save the customer and its idempotency key in **one transaction**.
If the key was already used, it returns the original customer.

**Domain — `customers-core/…/domain/model/Customer.java`**

```java
package co.edu.corhuila.synkro.customers.domain.model;

public record Customer(String id, String name, String identityDocument, boolean active) {

    // The compact constructor applies the invariants of 02-domain/entities-and-rules.md.
    public Customer {
        if (name == null || name.isBlank() || name.length() > 150) {
            throw new DomainException("name must have 1 to 150 characters");
        }
        if (identityDocument == null || identityDocument.isBlank() || identityDocument.length() > 30) {
            throw new DomainException("identityDocument must have 1 to 30 characters");
        }
    }

    public static Customer register(String id, String name, String identityDocument) {
        return new Customer(id, name, identityDocument, true);
    }
}
```

```java
package co.edu.corhuila.synkro.customers.domain.model;

public class DomainException extends RuntimeException {
    public DomainException(String message) {
        super(message);
    }
}
```

**Ports — `customers-core/…/application/port/`**

```java
package co.edu.corhuila.synkro.customers.application.port.in;

public interface CustomerUseCases {

    CreateResult create(CreateCustomerCommand command);

    record CreateCustomerCommand(String idempotencyKey, String name, String identityDocument) {}

    record CreateResult(String customerId, boolean created) {} // created = false when the key was already used
}
```

```java
package co.edu.corhuila.synkro.customers.application.port.out;

import co.edu.corhuila.synkro.customers.domain.model.Customer;

public interface CustomerRepository {

    /**
     * Inserts the customer and the idempotency key in one transaction.
     * If the key already exists, nothing is kept and the original id is returned.
     */
    Created createOnce(String idempotencyKey, Customer customer);

    record Created(String customerId, boolean created) {}
}
```

```java
package co.edu.corhuila.synkro.customers.application.port.out;

public interface IdGenerator {
    String newId();
}
```

**Use case — `customers-core/…/application/usecase/CustomerService.java`**

```java
package co.edu.corhuila.synkro.customers.application.usecase;

import co.edu.corhuila.synkro.customers.application.port.in.CustomerUseCases;
import co.edu.corhuila.synkro.customers.application.port.out.CustomerRepository;
import co.edu.corhuila.synkro.customers.application.port.out.IdGenerator;
import co.edu.corhuila.synkro.customers.domain.model.Customer;

// No @Service here: this module has no Spring dependency. The wiring lives in customers-app.
public class CustomerService implements CustomerUseCases {

    private final CustomerRepository repository;
    private final IdGenerator ids;

    public CustomerService(CustomerRepository repository, IdGenerator ids) {
        this.repository = repository;
        this.ids = ids;
    }

    @Override
    public CreateResult create(CreateCustomerCommand command) {
        Customer customer = Customer.register(ids.newId(), command.name(), command.identityDocument());
        CustomerRepository.Created saved = repository.createOnce(command.idempotencyKey(), customer);
        return new CreateResult(saved.customerId(), saved.created());
    }
}
```

**Wiring — `customers-app/…/app/CustomersConfiguration.java`**

```java
@Configuration
class CustomersConfiguration {

    @Bean
    CustomerUseCases customerUseCases(CustomerRepository repository, IdGenerator ids) {
        return new CustomerService(repository, ids);
    }
}
```

**Persistence adapter — `customers-adapters/…/adapter/out/persistence/JdbcCustomerRepository.java`**

```java
@Repository
public class JdbcCustomerRepository implements CustomerRepository {

    private final JdbcTemplate jdbc;

    public JdbcCustomerRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public Created createOnce(String idempotencyKey, Customer customer) {
        // A customer has a unique identity document, so a retry would fail on the customer
        // insert before reaching the key. Look the key up first.
        List<String> original = jdbc.queryForList(
            "SELECT customer_id::text FROM customers_schema.idempotency_key WHERE key = ?",
            String.class, idempotencyKey);
        if (!original.isEmpty()) {
            return new Created(original.get(0), false);
        }

        jdbc.update(
            "INSERT INTO customers_schema.customer (customer_id, name, identity_document) VALUES (?::uuid, ?, ?)",
            customer.id(), customer.name(), customer.identityDocument());
        int claimed = jdbc.update(
            "INSERT INTO customers_schema.idempotency_key (key, customer_id) VALUES (?, ?::uuid) ON CONFLICT DO NOTHING",
            idempotencyKey, customer.id());

        if (claimed == 0) { // another request with the same key won the race: the new customer disappears
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            String winner = jdbc.queryForObject(
                "SELECT customer_id::text FROM customers_schema.idempotency_key WHERE key = ?",
                String.class, idempotencyKey);
            return new Created(winner, false);
        }
        return new Created(customer.id(), true);
    }
}
```

**Test written first — `customers-core/src/test/java/…/application/usecase/CustomerServiceTest.java`**

The test needs no server and no database: it uses a hand-written fake of the port.

```java
class CustomerServiceTest {

    private final AtomicInteger sequence = new AtomicInteger();
    private final CustomerService service =
        new CustomerService(new FakeCustomerRepository(), () -> "c-" + sequence.incrementAndGet());

    @Test
    void should_reject_a_blank_name() {
        assertThatThrownBy(() -> service.create(new CreateCustomerCommand("key-12345", " ", "900123")))
            .isInstanceOf(DomainException.class);
    }

    @Test
    void should_return_the_original_customer_when_the_key_is_repeated() {
        var command = new CreateCustomerCommand("key-67890", "Ana Ruiz", "900123");

        var first = service.create(command);
        var second = service.create(command);

        assertThat(second.created()).isFalse();
        assertThat(second.customerId()).isEqualTo(first.customerId());
    }
}
```

```java
// same test package
class FakeCustomerRepository implements CustomerRepository {

    private final Map<String, String> idByKey = new HashMap<>();

    @Override
    public Created createOnce(String idempotencyKey, Customer customer) {
        String existing = idByKey.get(idempotencyKey);
        if (existing != null) {
            return new Created(existing, false);
        }
        idByKey.put(idempotencyKey, customer.id());
        return new Created(customer.id(), true);
    }
}
```

The test is written **before** the use case (red → green → refactor,
`11-quality/tdd-guide.md`).

---

## `synkro-workflow`: the same three modules

The workflow follows the same shape; its inbound adapter starts and reads sagas,
and its outbound adapters call the participants with its service token and save
the saga after every step (ADR-007).

```
synkro-workflow/
├── workflow-core/        # domain/saga/, application/port/in/, application/port/out/ (participants and saga state), application/usecase/
├── workflow-adapters/    # adapter/in/http/, adapter/out/participants/ (HTTP clients), adapter/out/state/ (persistence in workflow_schema)
├── workflow-app/         # composition root and application.yml
├── db/                   # Flyway migrations of workflow_schema (ADR-007, ADR-009)
├── deploy/               # compose.yml and Dockerfile
└── pom.xml
```

Variables of the workflow (`deployment.md` §6): `SPRING_DATASOURCE_URL`
(`currentSchema=workflow_schema`), `SERVICE_TOKEN`, `CUSTOMERS_API_URL`,
`PRODUCTS_API_URL`, `SALES_API_URL`, `HTTP_TIMEOUT`, `HTTP_ATTEMPTS`,
`SAGA_REQUEST_TIMEOUT`.

---

## Project commands

Run them from the repository root.

| Task | Command |
|------|---------|
| Run locally | `mvn -pl customers-app -am spring-boot:run` |
| Unit and HTTP tests | `mvn test` |
| Tests of one module | `mvn -pl customers-core test` |
| Integration tests | `TEST_DATABASE_URL=jdbc:postgresql://… mvn test` — skipped when the variable is not set |
| Coverage | JaCoCo, configured in the parent `pom.xml`; the report is written by `mvn verify` |
| Package | `mvn package` |
| Vulnerability scan | the OWASP dependency-check plugin — before every release (`security-rules.md`, A06) |

`TEST_DATABASE_URL` points to a PostgreSQL that already has the schema of the
`-db` repository (`testing-strategy.md`, Tier 2). Starting the whole system is
described in `05-architecture/deployment.md` §9 and `10-devops/local-setup.md`.

---

## Naming conventions (Java)

| Artifact | Convention | Example |
|----------|-----------|---------|
| Classes and records | `PascalCase` | `CustomerService` |
| Interfaces | `PascalCase`, no `I` prefix | `CustomerRepository` |
| Use case interface | `<Entity>UseCases` | `CustomerUseCases` |
| Methods and variables | `camelCase` | `createOnce`, `idempotencyKey` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_NAME_LENGTH` |
| Packages | `lowercase`, `co.edu.corhuila.synkro.<domain>` | `…customers.application.usecase` |
| Modules | `<domain>-core`, `<domain>-adapters`, `<domain>-app` | `customers-core` |
| Tests | `<Class>Test`; methods `should_<behavior>_when_<condition>` | `CustomerServiceTest` |
| Integration tests | `<Class>IntegrationTest` | `JdbcCustomerRepositoryIntegrationTest` |
| Money | `long`, name ending in `Cents` | `priceCents` |

---

## Correlations

- Hexagonal concepts and where each layer lives → `05-architecture/hexagonal-architecture.md`
- Test levels, thresholds and CI → `11-quality/testing-strategy.md`
- TDD cycle → `11-quality/tdd-guide.md`
- Migrations and the database instance → `05-architecture/deployment.md` §4, §5, ADR-005 Decision 2, ADR-009
- Token validation and service tokens → ADR-006
- Saga and workflow → ADR-007
- Versions and stack → ADR-008
- Contract of this example → `07-api/contracts/openapi/synkro-customers-api.yaml`
