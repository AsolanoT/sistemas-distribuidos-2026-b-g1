# System Overview

## System Name

**Sales Management System — SynkroTech SAS**

## Description

The sales management system is a distributed system developed for SynkroTech SAS, a medium-sized company that commercializes technology products and electronic accessories (desktop computers, laptops, peripherals, components, storage devices, and networking equipment). The system centralizes customer, product, inventory, and sales information under a single source of truth, replacing the spreadsheets, physical records, and isolated tools currently used to operate the business.

## What Problem Does It Solve

**Before (current process):** Sales and inventory control are managed through scattered tools and manual processes. Sales staff check product availability through physical inspection or outdated spreadsheets, sales are recorded in notebooks or isolated files not connected to inventory, stock levels are manually adjusted (sometimes days later), and there is no consolidated way to determine how much was sold during a given period or to review customer purchase history.

**With the system:** A system user logs in with a validated role, searches for or registers a customer, selects products, and the system validates stock availability in real time. Once the sale is confirmed, the system calculates the total, automatically deducts inventory, and records the transaction with full traceability. Authorized users can access daily sales reports, monthly sales reports, and best-selling product reports generated from real-time, up-to-date data at any time.

## Main Users

| User | System Role | Main Need |
|---------|------------------|---------------------|
| Sales Staff | `SALESPERSON` | Register sales, check stock, manage customers |
| Inventory Staff | `INVENTORY` | Manage products, categories, and stock |
| Business Administrator | `ADMIN` | Full access: users, customers, products, sales, and reports |

## Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Backend — Auth | Java (Spring Boot) | Issues and validates JWTs (RS256), manages system users and roles |
| Backend — Customers | Java (Spring Boot) | Owns the Customers bounded context; balances the Java/Go distribution required by the course |
| Backend — Products | Go | High-frequency reads (stock verification on every sale) benefit from Go's performance |
| Backend — Sales | Go | Orchestrates Customers and Products and generates reports from transactional data |
| Frontend | React | Course requirement; modern SPA consuming the 4 REST APIs |
| Database | PostgreSQL (single physical instance, one schema per service: `auth`, `customers`, `products`, `sales`) | Meets the course requirement of a single logical database while maintaining true data isolation through service-specific database users and `GRANT` permissions |
| Communication | REST/HTTP between services; JWT (RS256) validated locally by each service | Standard interoperability requirement (NFR-07); avoids a synchronous call to Auth on every request |
| Internal Architecture | Hexagonal Architecture (Ports and Adapters) per microservice | Keeps domain logic independent from frameworks; supports NFR-03 (independent evolution of each component) |
| Infrastructure | Docker / Docker Compose | Makes it easy to run the 4 services + PostgreSQL reproducibly in the Local environment |

> Advanced/optional phase: asynchronous communication through RabbitMQ to further decouple services (see ADR-001).

## Alternatives Considered

*This section responds to the HU-01 requested by the professor. It does not reopen any decision — the "Technology Stack" table above already reflects
the final stack; this documents the comparison against real alternatives that supports it.*

### Frontend: React vs. Vue.js

| **HU-DOCS-19** | Fredman |

### Java Backend: Spring Boot vs. Quarkus (Auth and Customers)

| **HU-DOCS-20**| Sergio |

### Go Backend: Go vs. Node.js (Products and Sales)

| **HU-DOCS-20 Sergio |

### Database: PostgreSQL vs. MongoDB

| **HU-DOCS-21** | Jordan |

### Final decision and technology architecture diagram

With the three sections above, the stack is confirmed as follows:

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend — Auth, Customers | Java + Spring Boot |
| Backend — Products, Sales | Go |
| Database | PostgreSQL — 1 instance, 1 schema per service |
| Authentication | JWT (RS256), validated locally by each service |
| Migrations | Flyway (Java services), golang-migrate (Go services) |

```mermaid
flowchart TB
    FE["React SPA"]

    subgraph BACKEND["Backend — 4 independent microservices"]
        AUTH["Auth Service<br/>Java · Spring Boot"]
        CUST["Customers Service<br/>Java · Spring Boot"]
        PROD["Products Service<br/>Go"]
        SALES["Sales Service<br/>Go"]
    end

    subgraph DATA["PostgreSQL — 1 instance, 1 schema per service"]
        SAUTH[("auth")]
        SCUST[("customers")]
        SPROD[("products")]
        SSALES[("sales")]
    end

    FE -->|REST + JWT| AUTH
    FE -->|REST + JWT| CUST
    FE -->|REST + JWT| PROD
    FE -->|REST + JWT| SALES

    SALES -->|HTTP: validates active customer| CUST
    SALES -->|HTTP: validates stock and price| PROD

    AUTH -.->|RS256 public key<br/>configured on each service| CUST
    AUTH -.->|RS256 public key| PROD
    AUTH -.->|RS256 public key| SALES

    AUTH --> SAUTH
    CUST --> SCUST
    PROD --> SPROD
    SALES --> SSALES
```

The dotted line toward Auth is intentional: it represents that each service already has the public key configured to validate the JWT on its own — **not** a real-time call to Auth on every request — exactly as ADR-001 fixes it.

## Current Status

| Field | Value |
|-------|-------|
| Phase | In development (documentation in the `docs` repository) |
| Current Version | v0.1.0 (pre-implementation) |
| Current Stage | Week 3 of 16 — documentation phase (`docs` repository) |
| Latest Delivery | Week 3 — PDR and ADR revision |
| Next Milestone | Complete `05-architecture` and `06-data` before starting code implementation |

## Environments

| Environment | Source Branch | Status |
|---------|----------------------|--------|
| Local | — (each developer's `feat/*` branch) | Active |
| Development | `dev` | Active |
| Staging | `qa` | **Planned** — pending decision based on project progress during the second half of the semester |
| Production | `main` | Active (academic project, no real end users) |

## Project Contacts

| Role | Name | GitHub |
|------|--------|--------|
| Technical Lead | Angel Gustavo Solano Trujillo | [@AsolanoT](https://github.com/AsolanoT) |
| Development Team | Jordan Ramirez Gallego | [@JordanRG420](https://github.com/JordanRG420) |
| Development Team | Sergio Andrés Ordóñez Díaz | [@SergioAndres17](https://github.com/SergioAndres17) |
| Development Team | Fredman Santiago Plazas Artunduaga | [@SantiagoPlazas2005](https://github.com/SantiagoPlazas2005) |
| Product Owner | Course Professor (Distributed Systems) | [@ariel5253](https://github.com/ariel5253) |

## References

- MVP Scope → `01-context/scope.md`
- Business and Technical Glossary → `01-context/glossary.md`
- Context Map → `02-domain/domain-map.md`
- Architecture Decision → `05-architecture/decisions/records/ADR-001-architecture.md`