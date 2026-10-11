# TaskForge API

![CI](https://github.com/imenabidimen/taskforge-api/actions/workflows/ci.yml/badge.svg)

TaskForge is the backend project in my full-stack portfolio. It exposes authenticated task endpoints consumed by two separate frontends: [WorkBoard (Vue)](https://github.com/imenabidimen/workboard-vue) and [ClientHub (React)](https://github.com/imenabidimen/clienthub-react). This makes it possible to compare two frontend implementations against one API contract.

**Portfolio projects**
- [WorkBoard — Vue 3 + TypeScript](https://github.com/imenabidimen/workboard-vue)
- [ClientHub — React + TypeScript](https://github.com/imenabidimen/clienthub-react)
- [Foody — earlier Angular/FastAPI university project](https://github.com/imenabidimen/Abid_Araari_Trabelsi_lglsi2c)


TaskForge is a small task API built with NestJS, Prisma and PostgreSQL. WorkBoard (Vue) and ClientHub (React) use it for account access and task persistence.

## Stack

- NestJS and TypeScript
- PostgreSQL with Prisma
- JWT bearer authentication and bcrypt password hashing
- class-validator / class-transformer request validation
- Swagger/OpenAPI
- Jest and GitHub Actions

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
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
npm install
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
  main.ts             app setup, validation, CORS and Swagger
  auth.controller.ts  registration and login routes
  auth.service.ts     password verification and token creation
  auth.guard.ts       bearer-token verification
  tasks.controller.ts task routes and request validation
  tasks.service.ts    task queries and ownership checks
  prisma.module.ts    Prisma dependency registration
  prisma.service.ts   database client
prisma/
  schema.prisma       User and Task models
  migrations/         database migrations
test/                 unit and integration tests
```

CI runs type-checking, tests, the Prisma migration and a production build. It also captures the Swagger page in a browser and uploads the image as a workflow artifact.

![TaskForge Swagger API](docs/screenshots/swagger-api.png)