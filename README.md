# TaskForge API

A small but realistic task-management API built with NestJS, Prisma, and PostgreSQL. The domain stays intentionally focused so the engineering decisions are easy to inspect.

## What it demonstrates

- NestJS + TypeScript REST API
- PostgreSQL persistence through Prisma
- JWT authentication and bcrypt password hashing
- DTO validation and per-user task ownership
- Unit tests around authentication and authorization boundaries
- Docker Compose for local PostgreSQL
- CI type-checking, testing, and production build

## Architecture

HTTP request -> Controller -> Guard -> Service -> Prisma -> PostgreSQL

Authentication and task services own business rules; Prisma is the persistence boundary. The frontend projects consume the API through its `/api` contract. Swagger is available at `/docs` while the API is running.

## Run locally

1. Start PostgreSQL: docker compose up -d postgres
2. Copy environment file: cp .env.example .env
3. Install dependencies: npm install
4. Generate Prisma client: npm run prisma:generate
5. Apply migration: npx prisma migrate deploy
6. Start API: npm run start:dev

Checks: npm run typecheck, npm test, npm run build

## API

- POST /api/auth/register
- POST /api/auth/login
- GET /api/tasks
- POST /api/tasks
- POST /api/tasks/:id/complete

## A note on scope

This is intentionally a focused portfolio service, not a pretend enterprise platform. The database is real, ownership is enforced on the server, and the code is small enough to review without a tour guide.