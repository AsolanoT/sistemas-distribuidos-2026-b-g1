# ADR-001 — Sales Management System Architecture

| Field | Value |
|-------|-------|
| **ID** | ADR-001 |
| **Date** | 2026-08 |
| **Status** | Accepted |
| **Authors** | Angel Gustavo Solano Trujillo — Tech Lead, Fredman Santiago Plazas Artunduaga |
| **Reviewers** | Jordan Ramirez Gallego, Sergio Andrés Ordóñez Díaz — Development team |

---

## Context

SynkroTech SAS needs to centralize the management of customers, products, inventory, and sales, which are currently scattered across manual tools. The bounded context analysis identified 4 business contexts with low coupling between them: **Authentication and Users**, **Customers**, **Products and Inventory**, and **Sales**. The latter includes Reports because they are part of the same business context.

The Distributed Systems course requires, as an architectural requirement, a distributed architecture composed of:

* 4 backend repositories, using Java and Go.
* 4 frontend repositories.
* **1 database repository**, with a single logical database shared by the 4 microservices.
* 1 documentation repository (`docs`), with no code, serving as the source of truth for architecture, ADRs, and backlog.

---

## Evaluated Alternatives

### Alternative A — Independent microservices with a single shared database instance (CHOSEN)

4 microservices, one per bounded context, each using Hexagonal Architecture (Ports and Adapters), communicating through REST/HTTP, with persistence on a single physical PostgreSQL database organized into independent schemas per service.

- **Pros:** Clear separation of responsibilities by bounded context; complies with the requirement for a single logical database without sacrificing data independence; balanced distribution of 2 services in Java and 2 in Go; each service owns its own schema and migrations
- **Cons:** Isolation between schemas depends on correct `GRANT` configuration; Sales concentrates more responsibility than ideal; synchronous communication introduces temporal coupling; no ACID transactions across services; single PostgreSQL instance is a single point of failure at the infrastructure level

### Alternative B — 4 physically independent databases, one per microservice

Each microservice would have its own dedicated PostgreSQL instance.

- **Pros:** Strongest possible data isolation; independent scaling and backup per service
- **Cons:** Does not comply with the course requirement of a single logical database; for SynkroTech SAS's current volume, maintaining 4 separate database instances introduces operational complexity without providing a significant real benefit

### Alternative C — 5 complete microservices (Auth, Customers, Products, Sales, Reports)

Reports separated from Sales as an independent service with its own repository.

- **Pros:** Reduces the responsibility concentrated in Sales; each service would be smaller
- **Cons:** Exceeds the limit of 4 backend repositories; Reports is not a separate bounded context from Sales, as established in the context map; separating it would violate the principle that each service should represent a real business context rather than an arbitrary technical division

### Alternative D — Modular monolith

A single deployable application with internal module boundaries.

- **Pros:** Simpler deployment; ACID transactions across modules; no network overhead between components
- **Cons:** Does not satisfy the course's educational objective, which includes communication between distributed services, multiple programming languages, and multiple repositories

### Alternative E — Embedded Auth inside Customers, without a dedicated service

Authentication and user management would live inside the Customers service.

- **Pros:** One fewer service to maintain; simpler deployment
- **Cons:** Mixes two distinct bounded contexts — internal system users and purchasing customers — making role and permission management more difficult

---

## Decision

**Alternative A:** Independent microservices with a single shared database instance, using Hexagonal Architecture (Ports and Adapters).

### 1. The 4 Microservices

| Service | Technology | Responsibility |
|---------|-----------|----------------|
| **Auth** | Java (Spring Boot) | System user registration/login, JWT issuance and validation, role and permission management |
| **Customers** | Java (Spring Boot) | Registration, updating, searching, and deactivation of SynkroTech SAS customers |
| **Products** | Go | Product catalog, categories, and stock/inventory management |
| **Sales** | Go | Sales and sales detail registration, orchestration with Customers and Products, and report generation, including daily, monthly, and top-product reports |

### 2. Database: One Instance, One Schema per Service

The system uses **a single physical PostgreSQL instance** as the only database repository, with **one independent schema per microservice**:

```text
PostgreSQL Instance (1 physical instance)

└── Database: synkrotech_db

    ├── schema: auth        → tables: users, refresh_tokens

    ├── schema: customers   → table: customers

    ├── schema: products    → tables: products, categories

    └── schema: sales       → tables: sales, sale_details, sales_summary
```

**Isolation mechanism, which ensures that this remains a microservices architecture rather than a data monolith:**

* Each microservice connects using a **different database user** (`auth_user`, `customers_user`, `products_user`, `sales_user`), with `GRANT` permissions restricted exclusively to its own schema. No service has read or write permissions on another service's schema.

* Each service defines its `search_path` to its own schema and manages its own migrations, using Flyway for Java and `golang-migrate` for Go, without depending on the migrations of the other services.

* **There are no actual foreign keys between schemas.** The `customer_id` field in Sales and the `product_id` field in Sales are not foreign keys. They are validated through HTTP calls to the Customers and Products services respectively, just as they would be if the databases were physically separate.

### 3. Internal Architectural Pattern — Hexagonal Architecture

Each microservice is organized into 3 layers:

* **Domain:** pure business entities and business rules, with no dependencies on external frameworks.

* **Application (use cases):** orchestrates business logic and defines **ports**, which are interfaces declaring what the domain needs or exposes.

* **Infrastructure (adapters):**
  * **Inbound adapters:** REST controllers.
  * **Outbound adapters:** repositories, responsible for persistence in the service's own PostgreSQL schema, and HTTP clients used to communicate with other services.

### 4. Architecture Diagram

```mermaid
graph TB
    subgraph frontend["Frontend — React SPAs"]
        direction LR
        FE_AUTH["Auth UI"]
        FE_CUST["Customers UI"]
        FE_PROD["Products UI"]
        FE_SALE["Sales UI"]
    end

    subgraph services["Microservices — Hexagonal Architecture"]
        direction LR

        subgraph auth_svc["Auth · Java / Spring Boot"]
            AUTH_RESP["Authentication\nJWT Issuance (RS256)\nUser Management"]
        end

        subgraph cust_svc["Customers · Java / Spring Boot"]
            CUST_RESP["Customer Management\nCustomer CRUD\nCommercial Information"]
        end

        subgraph prod_svc["Products · Go"]
            PROD_RESP["Product Catalog\nProduct CRUD\nInventory Control"]
        end

        subgraph sale_svc["Sales + Reports · Go"]
            SALE_RESP["Sales Management\nReports & Statistics\nBusiness Queries"]
        end
    end

    subgraph database["PostgreSQL — synkrotech_db · 1 instance"]
        direction LR
        SCH_AUTH[("schema: auth")]
        SCH_CUST[("schema: customers")]
        SCH_PROD[("schema: products")]
        SCH_SALE[("schema: sales")]
    end

    %% Frontend to Services
    FE_AUTH -->|REST| auth_svc
    FE_CUST -->|REST| cust_svc
    FE_PROD -->|REST| prod_svc
    FE_SALE -->|REST| sale_svc

    %% JWT validation
    auth_svc -."public key".-> cust_svc
    auth_svc -."public key".-> prod_svc
    auth_svc -."public key".-> sale_svc

    %% Service-to-service calls
    sale_svc -->|"validate customer"| cust_svc
    sale_svc -->|"validate stock & deduct"| prod_svc

    %% Services to Database
    auth_svc -->|auth_user| SCH_AUTH
    cust_svc -->|customers_user| SCH_CUST
    prod_svc -->|products_user| SCH_PROD
    sale_svc -->|sales_user| SCH_SALE

    %% Styling
    classDef feBox fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef javaBox fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    classDef goBox fill:#FFF3E0,stroke:#E65100,color:#BF360C
    classDef dbBox fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C

    class FE_AUTH,FE_CUST,FE_PROD,FE_SALE feBox
    class auth_svc,cust_svc javaBox
    class prod_svc,sale_svc goBox
    class SCH_AUTH,SCH_CUST,SCH_PROD,SCH_SALE dbBox
```

### 5. Communication Between Services

* **Sales → Customers:** validates that the customer exists before creating a sale.

* **Sales → Products:** validates stock and price and updates stock after the sale.

* **Customers, Products, Sales → Auth:** locally validate the JWT by verifying its signature using Auth's public key, without making a synchronous request to Auth for every request.

* **Advanced phase (optional):** asynchronous communication through events using RabbitMQ to further decouple the services.

### 6. Auth, JWT, and Roles

Auth is the only service responsible for issuing JWT tokens, using the RS256 algorithm. The other services only validate the tokens locally using Auth's public key.

**Flow:** login → Auth validates credentials → signs JWT containing `sub`, `roles`, `permissions`, `iat`, and `exp` → the frontend sends the token through `Authorization: Bearer <token>` with each request → each service validates the token locally → when the access token expires, the `refresh_token` is sent to Auth.

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access: users/roles, customers, products, sales, and reports |
| **SALESPERSON** | Manages customers, creates sales, checks stock, and views reports for their own sales |
| **INVENTORY** | Manages products, categories, and stock; no access to customers, sales, or reports |

### 7. Data Model per Schema

**`auth`**: `users` (`user_id`, `name`, `email`, `password_hash`, `role`, `registration_date`, `active`), `refresh_tokens` (`token_id`, `user_id` FK, `token`, `expiration_date`, `active`).

**`customers`**: `customers` (`customer_id`, `name`, `identity_document`, `email`, `phone`, `address`, `registration_date`, `active`).

**`products`**: `products` (`product_id`, `name`, `price`, `stock`, `category_id` FK, `active`), `categories` (`category_id`, `name`, `active`).

**`sales`**: `sales` (`sale_id`, `customer_id` external reference, `date`, `total`, `active`), `sale_details` (`detail_id`, `sale_id` FK, `product_id` external reference, `quantity`, `unit_price`, `subtotal`, `active`), `sales_summary` (`date`, `daily_sales_total`, `monthly_sales_total`, `product_id`, `quantity_sold`, `active`).

All records use **soft deletion** through the `active` boolean field instead of physical deletion, in order to preserve traceability.

### 8. Main APIs

| Service | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Auth | `/api/auth/register` | POST | Register a system user |
| Auth | `/api/auth/login` | POST | Log in and obtain a JWT |
| Auth | `/api/auth/refresh` | POST | Refresh the access token |
| Customers | `/api/customers` | POST | Register a customer |
| Customers | `/api/customers/{id}` | GET/PUT/DELETE | Retrieve/update/delete a customer |
| Products | `/api/products` | POST | Register a product |
| Products | `/api/products/{id}/stock` | PATCH | Update stock |
| Sales | `/api/sales` | POST | Create a sale |
| Sales | `/api/sales/{id}` | GET | Retrieve sale details |
| Sales | `/api/sales/reports/daily` / `/monthly` / `/top-products` | GET | Reports |

All routes, except `/api/auth/register` and `/api/auth/login`, require `Authorization: Bearer <token>`.

---

## Consequences

**Positive:**

* Clear separation of responsibilities by bounded context, supported by domain analysis rather than simply by the repository constraint.
* Complies with the requirement for a single logical database without sacrificing actual data independence between services.
* Balanced distribution of 2 services in Java and 2 in Go, complying with the course requirements.
* Centralized Auth simplifies role and security management.

**Negative:**

* Isolation between schemas depends on the correct configuration of database permissions through `GRANT`. A configuration error could break the intended isolation without being immediately detected.
* Sales concentrates more responsibility than ideal because it orchestrates Customers and Products and also generates reports.
* Synchronous communication between services introduces temporal coupling. If Products is unavailable, Sales cannot create sales.
* There are no ACID transactions across services. Explicit handling of eventual consistency is therefore required.
* Because all 4 microservices share a single physical PostgreSQL instance, a performance problem or outage affecting that instance will affect all 4 microservices simultaneously. This represents a single point of failure at the infrastructure level, even though the data remains logically isolated.

**Mitigation:**

* Schema isolation will be verified with explicit `GRANT` statements documented in `05-architecture/deployment.md` and tested during local setup.
* The temporal coupling and eventual consistency risks will be addressed in `05-architecture/pattern-guide.md`, where Circuit Breaker, Saga, Outbox, and CQRS are evaluated against the MVP scope.
* The single point of failure is accepted for the MVP; the mitigation is operational (backups, monitoring) rather than architectural.

---

## Immutability Rule

Once this ADR has been accepted, **it must not be modified**.

Any change to this architectural decision must be documented in a new file, such as `adr-002-*.md`, which must explicitly reference ADR-001 as the decision being replaced. The new ADR must indicate **what changed and why**.

---

## References

* Context map → `02-domain/domain-map.md`
* Entities and business rules → `02-domain/entities-and-rules.md`
* Data model detail → `06-data/models.md`
* Service catalog → `09-microservices/service-catalog.md`
* Security policy and RBAC → `00-governance/security-policy.md`
* Deployment topology → `05-architecture/deployment.md`
* Distributed pattern evaluation → `05-architecture/pattern-guide.md`
