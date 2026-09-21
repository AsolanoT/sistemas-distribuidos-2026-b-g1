# Deployment Topology

> Defines how the 4 microservices and the database run in each
> environment. Any developer must be able to start the complete system
> by following only this document and the `docker-compose.yml` in the
> `database` repository.

---

## 1. Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Developer Machine                           │
│                                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│  │ Auth UI    │ │ Customers  │ │ Products   │ │ Sales UI   │        │
│  │ :5173      │ │ UI :5174   │ │ UI :5175   │ │ :5176      │        │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘        │
│        └──────────────┴──────────────┴──────────────┘               │
│                              │                                        │
│                    ┌─────────▼──────────┐                            │
│                    │   api-gateway      │  JWT validation ·          │
│                    │   port TBD         │  routing · rate limiting   │
│                    └──┬───────┬────┬────┘                            │
│           /api/auth/* │  /api/customers/*, /api/products/*           │
│                       │       │    │ /api/sales (GET)                │
│                       ▼       ▼    ▼           /api/sales (POST)     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐        │              │
│  │ auth-      │ │ customers- │ │ products-  │        ▼              │
│  │ service    │ │ service    │ │ service    │  ┌────────────┐       │
│  │ Java :8081 │ │ Java :8082 │ │ Go   :8083 │  │  workflow  │       │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘  │  port TBD  │       │
│        │              │              │          │ (stateless)│      │
│        │              │◄─────────────┼──────────┴──┬────┬────┘      │
│        │              │◄─────────────┤ internal    │    │           │
│        │         auth_user      customers_user     ▼    ▼           │
│        │              │              │ products_user  ┌────────────┐│
│        │              │              │                │ sales-     ││
│        │              │              │                │ service    ││
│        │              │              │                │ Go   :8084 ││
│        │              │              │                └─────┬──────┘│
│        │              │              │                sales_user   │
│        └──────────────┴──────────────┴──────────────────────┘      │
│                              │                                       │
│                    ┌─────────▼──────────┐      ┌─────────────────┐ │
│                    │   PostgreSQL       │      │    RabbitMQ     │ │
│                    │   :5432            │      │    :5672        │ │
│                    │  synkrotech_db     │      └────────┬────────┘ │
│                    │  schema: auth      │               │          │
│                    │  schema: customers │      sales.outbox relay  │
│                    │  schema: products  │               │          │
│                    │  schema: sales     │               ▼          │
│                    │   (+ outbox)       │      ┌─────────────────┐ │
│                    └────────────────────┘      │  synkro-worker  │ │
│                                                 │  port: none     │ │
│                                                 │  (no HTTP)      │ │
│                                                 └─────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Reserved Ports

| Port | Service | Description |
|------|---------|-------------|
| 5432 | PostgreSQL | Database (single instance) |
| 8081 | auth-service | Authentication and JWT |
| 8082 | customers-service | Customer management |
| 8083 | products-service | Catalog, categories, and inventory |
| 8084 | sales-service | Sales, details, and reports |
| 5173 | Auth UI (React dev server) | Authentication frontend |
| 5174 | Customers UI (React dev server) | Customers frontend |
| 5175 | Products UI (React dev server) | Products frontend |
| 5176 | Sales UI (React dev server) | Sales frontend |
| — | api-gateway | Single entry point (port assigned when code phase begins) |
| — | synkro-workflow | Saga orchestrator, no fixed port yet |
| 5672 | RabbitMQ | AMQP protocol |
| 15672 | RabbitMQ | Management UI (dev only) |

---

## 3. Migration Ownership

This resolves the question ADR-001 left open: whether migrations live in the `database` repository or in each service. The answer is **both, with distinct responsibilities**:

| Responsibility | Where It Lives | When It Runs |
|----------------|---------------|--------------|
| Create the `synkrotech_db` database | `database` repository → init script | Once, on first PostgreSQL startup |
| Create the 4 schemas (`auth`, `customers`, `products`, `sales`) | `database` repository → init script | Once |
| Create the 4 database users and their `GRANT`s | `database` repository → init script | Once |
| Create `auth` tables (`users`, `refresh_tokens`) | auth-service → Flyway | On service startup |
| Create `customers` tables (`customers`) | customers-service → Flyway | On service startup |
| Create `products` tables (`products`, `categories`) | products-service → golang-migrate | On service startup |
| Create `sales` tables (`sales`, `sale_details`, `sales_summary`) | sales-service → golang-migrate | On service startup |

**Principle:** the `database` repository owns the **infrastructure** (instance, schemas, users, permissions). Each service owns its **data model** (tables, indexes, constraints). This is consistent with ADR-001 §2: "each service defines its `search_path` to its own schema and manages its own migrations."

---

## 4. Docker Compose (`database` Repository)

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: synkrotech-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: synkrotech_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_ROOT_PASSWORD:-synkro_dev_2026}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d synkrotech_db"]
      interval: 5s
      timeout: 3s
      retries: 5

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    container_name: synkro-rabbitmq
    ports:
      - "5672:5672"     # AMQP protocol
      - "15672:15672"   # Management UI (dev only)
    environment:
      RABBITMQ_DEFAULT_USER: synkro
      RABBITMQ_DEFAULT_PASS: synkro_dev_2026
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_running"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  rabbitmq_data:
```

The `./init/` directory contains scripts that PostgreSQL executes automatically the first time the volume is created. They run in alphabetical order.

---

## 5. Initialization Script

**File:** `database/init/01-create-schemas-and-users.sql`

```sql
-- =============================================================
-- SynkroTech SAS — Database Initialization
-- Executed once by PostgreSQL on first container startup.
-- =============================================================

-- 1. Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS customers;
CREATE SCHEMA IF NOT EXISTS products;
CREATE SCHEMA IF NOT EXISTS sales;

-- 2. Create per-service users
CREATE USER auth_user      WITH PASSWORD 'auth_pass_dev';
CREATE USER customers_user WITH PASSWORD 'customers_pass_dev';
CREATE USER products_user  WITH PASSWORD 'products_pass_dev';
CREATE USER sales_user     WITH PASSWORD 'sales_pass_dev';

-- 3. Grant schema-level access (each user can only use its own schema)
GRANT USAGE, CREATE ON SCHEMA auth      TO auth_user;
GRANT USAGE, CREATE ON SCHEMA customers TO customers_user;
GRANT USAGE, CREATE ON SCHEMA products  TO products_user;
GRANT USAGE, CREATE ON SCHEMA sales     TO sales_user;

-- 4. Grant table-level access (on all current and future tables in the schema)
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO auth_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA customers
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO customers_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA products
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO products_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA sales
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sales_user;

-- 5. Grant sequence usage (for gen_random_uuid() and serial columns)
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT USAGE, SELECT ON SEQUENCES TO auth_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA customers
  GRANT USAGE, SELECT ON SEQUENCES TO customers_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA products
  GRANT USAGE, SELECT ON SEQUENCES TO products_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA sales
  GRANT USAGE, SELECT ON SEQUENCES TO sales_user;

-- 6. Set the default search_path for each user
ALTER USER auth_user      SET search_path TO auth;
ALTER USER customers_user SET search_path TO customers;
ALTER USER products_user  SET search_path TO products;
ALTER USER sales_user     SET search_path TO sales;

-- 7. Explicitly revoke cross-schema access
-- (PostgreSQL does not grant cross-schema access by default,
--  but this makes the isolation explicit and auditable)
REVOKE ALL ON SCHEMA auth      FROM customers_user, products_user, sales_user;
REVOKE ALL ON SCHEMA customers FROM auth_user, products_user, sales_user;
REVOKE ALL ON SCHEMA products  FROM auth_user, customers_user, sales_user;
REVOKE ALL ON SCHEMA sales     FROM auth_user, customers_user, products_user;
```

### Isolation Verification

After running the script, a developer can verify that the isolation works:

```bash
# Connect as products_user and try to read from the sales schema
psql -U products_user -d synkrotech_db -c "SELECT * FROM sales.sales;"
# Expected result: ERROR: permission denied for schema sales
```

---

## 6. Environment Variables per Service

Each service requires the following variables. The values shown are for the local environment.

### auth-service (Java / Spring Boot)

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/synkrotech_db?currentSchema=auth
SPRING_DATASOURCE_USERNAME=auth_user
SPRING_DATASOURCE_PASSWORD=auth_pass_dev

# JWT
JWT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
JWT_ACCESS_TOKEN_EXPIRATION=3600
JWT_REFRESH_TOKEN_EXPIRATION=604800

# Flyway
SPRING_FLYWAY_SCHEMAS=auth
SPRING_FLYWAY_DEFAULT_SCHEMA=auth

# Server
SERVER_PORT=8081
```

### customers-service (Java / Spring Boot)

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/synkrotech_db?currentSchema=customers
SPRING_DATASOURCE_USERNAME=customers_user
SPRING_DATASOURCE_PASSWORD=customers_pass_dev

# Trusted headers (forwarded by api-gateway, ADR-003 §2)
# No JWT validation here — see 05-architecture/deployment.md
# "Network Guarantee" section for why this is safe

# Flyway
SPRING_FLYWAY_SCHEMAS=customers
SPRING_FLYWAY_DEFAULT_SCHEMA=customers

# Server
SERVER_PORT=8082
```

### products-service (Go)

```env
# Database
DATABASE_URL=postgresql://products_user:products_pass_dev@localhost:5432/synkrotech_db?search_path=products&sslmode=disable

# Trusted headers (forwarded by api-gateway, ADR-003 §2)
# No JWT validation here — see 05-architecture/deployment.md
# "Network Guarantee" section for why this is safe

# Server
SERVER_PORT=8083
```

### sales-service (Go)

```env
# Database
DATABASE_URL=postgresql://sales_user:sales_pass_dev@localhost:5432/synkrotech_db?search_path=sales&sslmode=disable

# Trusted headers (forwarded by api-gateway, ADR-003 §2)
# No JWT validation here — see "Network Guarantee" section below

# Outbox relay (ADR-003 §5)
RABBITMQ_URL=amqp://synkro:synkro_dev_2026@localhost:5672/
OUTBOX_RELAY_INTERVAL=2s

# Server
SERVER_PORT=8084
```

### api-gateway

```env
# JWT validation (the only service that still validates it)
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----

# Routing targets
AUTH_SERVICE_URL=http://localhost:8081
CUSTOMERS_SERVICE_URL=http://localhost:8082
PRODUCTS_SERVICE_URL=http://localhost:8083
SALES_SERVICE_URL=http://localhost:8084
WORKFLOW_SERVICE_URL=http://localhost:PORT_TBD

# Rate limiting (values are placeholders — tune once real traffic is observed)
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Server
SERVER_PORT=PORT_TBD
```

### synkro-workflow

```env
# No database — stateless orchestrator (ADR-003 §4)

# Saga step targets
CUSTOMERS_SERVICE_URL=http://localhost:8082
PRODUCTS_SERVICE_URL=http://localhost:8083
SALES_SERVICE_URL=http://localhost:8084

# Timeouts (moved here from sales-service, pattern-guide.md §5)
HTTP_TIMEOUT_READ=3s
HTTP_TIMEOUT_WRITE=5s

# Server
SERVER_PORT=PORT_TBD
```

### synkro-worker

```env
# No database, no HTTP server (ADR-003 §4)

# RabbitMQ consumer
RABBITMQ_URL=amqp://synkro:synkro_dev_2026@localhost:5672/
RABBITMQ_QUEUE=sale-events

# For jobs that call back into domain services (e.g., re-check a sale)
SALES_SERVICE_URL=http://localhost:8084
```

## Network Guarantee — JWT Header Trust (ADR-003 §2)

ADR-003 moved JWT validation from each domain service to the API
Gateway, which forwards trusted headers (`X-User-Id`, `X-User-Roles`)
to downstream services. **This is secure only if no external traffic
can reach a domain service without passing through the Gateway.**

In the local development environment (Docker Compose), this is enforced
by network configuration:

```yaml
networks:
  synkro-internal:
    driver: bridge
    internal: true     # no external access
  synkro-external:
    driver: bridge

services:
  api-gateway:
    networks:
      - synkro-external   # reachable from outside (frontends)
      - synkro-internal   # can reach domain services

  auth-service:
    networks:
      - synkro-internal   # NOT on synkro-external → unreachable from outside
  customers-service:
    networks:
      - synkro-internal
  products-service:
    networks:
      - synkro-internal
  sales-service:
    networks:
      - synkro-internal
  workflow:
    networks:
      - synkro-internal
  worker:
    networks:
      - synkro-internal
  rabbitmq:
    networks:
      - synkro-internal
```

**The `internal: true` flag on `synkro-internal`** prevents Docker from
creating a default route to the host network — containers on that
network can only talk to each other, never to the outside. The Gateway
is the only service on both networks, making it the only external door.

**Accepted risk (documented in ADR-003 §2):** if this network
configuration is bypassed (e.g., by exposing a domain service's port
directly in docker-compose with `ports:`), any forged `X-User-Id`
header would be accepted as valid. This is a configuration error, not
a design flaw — the mitigation is to never expose domain service ports
on the host, only the Gateway's port.

---

## 7. How to Start Everything from Scratch

```bash
# 1. Clone the database repository and start PostgreSQL + RabbitMQ
cd database/
docker compose up -d
# Wait for both healthchecks to pass (~10 seconds)
docker compose ps  # Both services: healthy

# 2. Verify that schemas and users exist
docker exec synkrotech-db psql -U postgres -d synkrotech_db \
  -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('auth','customers','products','sales');"
# Expected result: 4 rows

# 3. Start each service (in separate terminals)
# auth-service (Java)
cd auth-service/
cp .env.example .env
./mvnw spring-boot:run

# customers-service (Java)
cd customers-service/
cp .env.example .env
./mvnw spring-boot:run

# products-service (Go)
cd products-service/
cp .env.example .env
go run ./cmd/server/

# sales-service (Go)
cd sales-service/
cp .env.example .env
go run ./cmd/server/

# 3b. Start the new services (in separate terminals)
# api-gateway
cd api-gateway/
cp .env.example .env
[run command depends on chosen technology]

# synkro-workflow
cd workflow/
cp .env.example .env
[run command depends on chosen technology]

# synkro-worker
cd worker/
cp .env.example .env
[run command depends on chosen technology]

# 4. Verify health for each service
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
curl http://localhost:8084/health
curl http://localhost:PORT_TBD/health  # api-gateway
curl http://localhost:PORT_TBD/health  # synkro-workflow
# synkro-worker has no HTTP endpoint — verify via RabbitMQ management
# UI (http://localhost:15672) that it appears as a connected consumer
# All should respond: {"status":"ok", ...}
```

---

## Correlations

* Architecture decision → `05-architecture/decisions/records/ADR-001-architecture.md`
* Timeout and retry configuration → `05-architecture/pattern-guide.md` §5
* RS256 public key distribution → `05-architecture/cross-cutting.md` §5
* Schema isolation verification → see §5 above
* Complete local setup (including frontends) → `10-devops/local-setup.md`
* Data model per schema → `06-data/models.md`
* Gateway, Saga, and RabbitMQ decisions → `05-architecture/decisions/records/ADR-003-gateway-saga-async.md`
