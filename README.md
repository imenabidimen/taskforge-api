# TaskForge API

![CI](https://github.com/imenabidimen/taskforge-api/actions/workflows/ci.yml/badge.svg)

TaskForge is a NestJS API for user-owned tasks and a small production-order workflow. The task endpoints support the two frontends in this portfolio; the production-order endpoints are a separate example of enforcing a business process in the backend instead of trusting the UI.

It also powers two frontends:
- [WorkBoard](https://github.com/imenabidimen/workboard-vue) — a Vue 3 task list with a short create-and-complete flow.
- [ClientHub](https://github.com/imenabidimen/clienthub-react) — a React deliverables view with title search, status filters and a completion summary.

[Foody](https://github.com/imenabidimen/Abid_Araari_Trabelsi_lglsi2c) is an earlier university group project built with a different stack.

## Stack

- NestJS and TypeScript
- PostgreSQL with Prisma migrations
- JWT bearer authentication and bcrypt password hashing
- Request validation with class-validator / class-transformer
- Swagger/OpenAPI
- Jest and GitHub Actions

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a token |
| GET | `/api/health/live` | Check that the process responds |
| GET | `/api/health/ready` | Check database readiness |
| GET | `/api/tasks` | List the signed-in user's tasks |
| POST | `/api/tasks` | Create a task |
| POST | `/api/tasks/:id/complete` | Complete a task |
| GET | `/api/production-orders` | List the signed-in user's production orders and history |
| POST | `/api/production-orders` | Create a production order |
| PATCH | `/api/production-orders/:id/status` | Apply an allowed status transition |

Task listing uses bounded offset pagination: `limit` is 1–100 (default 20), and `offset` is non-negative (default 0). Task and production-order access is scoped to the authenticated account; the API does not trust an owner ID supplied by the client.

## Production-order case study

This is a fictional manufacturing example for the portfolio, not a copy of an employer's proprietary system.

```text
CREATED -> RELEASED -> RUNNING -> COMPLETED
    |          |          |
    +----------+----------+-> CANCELLED (only before RUNNING)
```

The status endpoint rejects skipped transitions and attempts to change a terminal order. A successful transition stores the actor, timestamp and optional reason alongside the state change. Both are written in one database transaction so the history cannot claim a transition that failed to save. Each order also has a version; if two requests try to update the same version, the stale request is rejected rather than silently overwriting the first update.

See [the workflow notes](docs/production-order-workflow.md) and [ADR 0002](docs/adr/0002-production-order-state-transitions.md) for the rules and trade-offs.

## Run locally

Requirements: Node.js 22+, Docker, and npm.

```bash
docker compose up -d postgres
cp .env.example .env
# Set JWT_SECRET to a random value of at least 32 UTF-8 bytes.
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

Swagger UI: http://localhost:3000/docs

The example database credentials are for local development only. Do not reuse them or a development JWT secret in a deployed environment.

## Source layout

```text
src/
  app.module.ts
  main.ts
  auth.controller.ts
  auth.service.ts
  auth.guard.ts
  health.controller.ts
  request-logging.middleware.ts
  tasks.controller.ts
  tasks.service.ts
  production-orders.controller.ts
  production-orders.service.ts
  prisma.module.ts
  prisma.service.ts
prisma/
  schema.prisma
  migrations/
test/
  unit and database integration tests
```

## Verification

The GitHub Actions workflow installs from the lockfile, starts PostgreSQL, generates the Prisma client, applies migrations, runs type-checking and tests, builds the API, and opens Swagger in a browser. It saves the browser capture as a workflow artifact.

![TaskForge Swagger API](docs/screenshots/swagger-api.png)

## Design notes

- [Architecture and current boundaries](docs/architecture.md)
- [ADR 0001: modular monolith](docs/adr/0001-modular-monolith.md)
- [ADR 0002: production-order state transitions](docs/adr/0002-production-order-state-transitions.md)
- [Production-order workflow](docs/production-order-workflow.md)
- [Operational runbook](docs/operations/runbook.md)
- [Roadmap](docs/roadmap.md)

This repository is an API and a testable workflow example, not a deployed production service. It does not claim a live deployment, measured load results, or a production monitoring stack.
