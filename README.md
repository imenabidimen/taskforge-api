# TaskForge API

![CI](https://github.com/imenabidimen/taskforge-api/actions/workflows/ci.yml/badge.svg)

TaskForge is the backend project in my full-stack portfolio. It exposes authenticated task endpoints consumed by two separate frontends: [WorkBoard (Vue)](https://github.com/imenabidimen/workboard-vue) and [ClientHub (React)](https://github.com/imenabidimen/clienthub-react). This makes it possible to compare two frontend implementations against one API contract.

**Portfolio projects**
- [WorkBoard — Vue 3 + TypeScript](https://github.com/imenabidimen/workboard-vue)
- [ClientHub — React + TypeScript](https://github.com/imenabidimen/clienthub-react)
- [Foody — earlier Angular/FastAPI university project](https://github.com/imenabidimen/Abid_Araari_Trabelsi_lglsi2c)


## Stack

- NestJS and TypeScript
- PostgreSQL with Prisma
- JWT bearer authentication and bcrypt password hashing (passwords are validated against bcrypt’s 72-byte UTF-8 input limit)
- class-validator / class-transformer request validation
- Swagger/OpenAPI
- Jest and GitHub Actions

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/health/live` | Liveness probe (HTTP process responds) |
| GET | `/api/health/ready` | Readiness probe (checks PostgreSQL connectivity) |
| GET | `/api/tasks` | List the signed-in user's tasks |
| POST | `/api/tasks` | Create a task |
| POST | `/api/tasks/:id/complete` | Mark a task complete |

Task ownership is enforced by the API. The owner ID comes from the verified JWT, not from a request-body field. A task belonging to another account is not returned or updated through these endpoints.

## Run locally

Requirements: Node.js 22+, Docker and npm.

```bash
docker compose up -d postgres
cp .env.example .env
# Replace JWT_SECRET with a long, random value before using the API.
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs)

The default database URL in `.env.example` is for local development only. Do not reuse its credentials or a development JWT secret in a deployed environment.

## Source layout

```text
src/
  app.module.ts       module wiring
  main.ts             app setup, validation, CORS, shutdown hooks and Swagger
  auth.controller.ts  registration and login routes
  auth.service.ts     password verification and token creation
  auth.guard.ts       bearer-token verification
  health.controller.ts liveness and database readiness probes
  tasks.controller.ts task routes and request validation
  tasks.service.ts    task queries and ownership checks
  prisma.module.ts    Prisma dependency registration
  prisma.service.ts   database client
prisma/
  schema.prisma       User and Task models
  migrations/         database migrations
test/                 unit and integration tests
```

CI runs type-checking, authentication and task-ownership tests, the Prisma migration and a production build. Authentication input tests cover email normalization and bcrypt’s byte-length limit. CI also captures the Swagger page in a browser and uploads the image as a workflow artifact.

![TaskForge Swagger API](docs/screenshots/swagger-api.png)

## Design decisions

- **The API owns authorization.** Task queries use the authenticated user's ID from the verified token. The client cannot choose which user's tasks it reads or changes by sending an owner ID.
- **Invalid input is rejected at the boundary.** Request DTO validation is kept close to the controllers so bad input does not become a database concern.
- **Database changes are versioned.** Prisma migrations run in CI against PostgreSQL, rather than relying on a developer's local schema.
- **The scope is intentionally small.** This repository demonstrates the API, authentication and persistence fundamentals; it is not presented as a production SaaS platform with a full roles/permissions model or deployment setup.

The main thing to review here is the API contract and its tests, not the number of endpoints.


## Engineering notes

The repository includes short, explicit engineering documents:

- [Architecture and current boundaries](docs/architecture.md) — request flow, data model, implemented controls, and known gaps.
- [ADR 0001: modular monolith](docs/adr/0001-modular-monolith.md) — why this project does not split a small domain into microservices yet.
- [Operational runbook](docs/operations/runbook.md) — local startup and failure triage, with current operational limitations stated honestly.
- [Evidence-driven roadmap](docs/roadmap.md) — acceptance criteria for health checks, observability, performance testing, and a manufacturing-domain case study.

These documents separate implemented behavior from planned work. There is no claim of a production deployment, measured scalability, or monitoring stack until those are implemented and verified.
