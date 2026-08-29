# System Overview

## System name

**Sales Management System — SynkroTech SAS**

## Description

The sales management system is a distributed system developed for SynkroTech SAS, a mid-sized company that sells technology products and electronic accessories (computers, laptops, peripherals, components, storage devices, and connectivity equipment). The system centralizes client, product, inventory, and sales information under a single source of truth, replacing the spreadsheets, physical records, and isolated tools currently used to run the business.

## What problem it solves

**Before (current process):** Sales and inventory control is managed through scattered tools and manual processes. Salespeople check product availability through physical inspection or outdated spreadsheets, sales are recorded in notebooks or isolated files not connected to inventory, stock is corrected manually (sometimes days later), and there is no consolidated way to know how much was sold in a given period or to know a client's purchase history.

**With the system:** A system user logs in with a validated role, searches for or registers a client, selects products, and the system validates stock availability in real time. Once the sale is confirmed, the system calculates the total, automatically deducts inventory, and records the transaction with full traceability. Authorized users can query daily, monthly, and best-selling-product reports generated from real, up-to-date data at any time.

## Main users

| User | Role in the system | Main need |
|------|--------------------|-----------|
| Sales staff | `SALESPERSON` | Register sales, check stock, manage clients |
| Inventory staff | `INVENTORY` | Manage products, categories, and stock |
| Business administrator | `ADMIN` | Full access: users, clients, products, sales, and reports |

## Technology stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Backend — Auth | Java (Spring Boot) | Issues and validates JWT (RS256), manages system users and roles |
| Backend — Customers | Java (Spring Boot) | Owns the Customers bounded context; balances the Java/Go split required by the course |
| Backend — Products | Go | High-frequency reads (stock check on every sale) benefit from Go's performance |
| Backend — Sales | Go | Orchestrates Customers and Products and generates reports from transactional data |
| Frontend | React | Course requirement; modern SPA that consumes the 4 REST APIs |
| Database | PostgreSQL (one physical instance, one schema per service: `auth`, `customers`, `products`, `sales`) | Satisfies the course requirement of a single logical database while keeping real data isolation via per-service database users and `GRANT` permissions |
| Communication | REST/HTTP between services; JWT (RS256) validated locally by each service | Standard interoperability requirement (RNF-07); avoids a synchronous call to Auth on every request |
| Internal architecture | Hexagonal architecture (Ports and Adapters) per microservice | Keeps domain logic independent from frameworks; supports RNF-03 (independent evolution of each component) |
| Infrastructure | Docker / Docker Compose | Makes it easy to spin up the 4 services + PostgreSQL reproducibly in the Local environment |

> Advanced/optional phase: asynchronous communication via RabbitMQ to further decouple services (see ADR-001).

## Current status

| Field | Value |
|-------|-------|
| Phase | In development (documentation in the `docs` repository) |
| Current version | v0.1.0 (pre-implementation) |
| Current stage | Week 3 of 16 — documentation phase (`docs` repository) |
| Last delivery | Week 3 — PDR and ADR correction |
| Next milestone | Complete `05-architecture` and `06-data` before starting code implementation |

## Environments

| Environment | Branch that feeds it | Status |
|-------------|----------------------|--------|
| Local | — (each developer's `feat/*` branch) | Active |
| Development | `dev` | Active |
| Staging | `qa` | **Planned** — pending decision based on project progress in the semester's second term |
| Production | `main` | Active — validated final code lands here, although there are no real end users consuming it (academic project) |

## Project contacts

| Role | Name | GitHub |
|------|------|--------|
| Tech Lead | Angel Gustavo Solano Trujillo | [@AsolanoT](https://github.com/AsolanoT) |
| Development team | Jordan Ramirez Gallego | [@JordanRG420](https://github.com/JordanRG420) |
| Development team | Sergio Andrés Ordóñez Díaz | [@SergioAndres17](https://github.com/SergioAndres17) |
| Development team | Fredman Santiago Plazas Artunduaga | [@SantiagoPlazas2005](https://github.com/SantiagoPlazas2005) |
| Product Owner | Course instructor (Distributed Systems) | [@ariel5253](https://github.com/ariel5253) |

## Correlations

- MVP scope → `01-context/scope.md`
- Business and technical glossary → `01-context/glossary.md`
- Context map → `02-domain/domain-map.md`
- Architecture decision → `05-architecture/decisions/records/ADR-001-architecture.md`
