# TaskForge API

A focused task-management API built with NestJS, Prisma, and PostgreSQL. The service is deliberately small so the important backend decisions are easy to review.

## What it demonstrates

- NestJS + TypeScript REST API
- PostgreSQL persistence through Prisma migrations
- JWT authentication and bcrypt password hashing
- DTO validation and server-side task ownership
- Swagger/OpenAPI documentation at `/docs`
- Unit and integration-oriented tests
- Docker Compose for local PostgreSQL
- GitHub Actions for type-checking, tests, migrations, and production build

## Architecture

```
HTTP
  ↓
Controller → Guard → Service → Prisma → PostgreSQL
              ↓
             JWT
```

The API is consumed by the Vue **WorkBoard** and React **ClientHub** portfolio clients.

## Run locally

1. Start PostgreSQL:
   ```bash
   docker compose up -d postgres
   ```
2. Create your environment file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate the Prisma client and apply the migration:
   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   ```
5. Start the API:
   ```bash
   npm run start:dev
   ```

Swagger: `http://localhost:3000/docs`

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tasks`
- `POST /api/tasks`
- `POST /api/tasks/:id/complete`

## Scope

This is intentionally a focused portfolio service rather than a pretend enterprise platform. The important part is that authentication, ownership, validation, persistence, tests, and local infrastructure are real and reviewable.
