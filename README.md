# QueuePilot API

A small, production-shaped task and job management API built for a four-year software engineer portfolio.

## What it demonstrates
- TypeScript + Fastify REST API
- PostgreSQL persistence with Prisma
- JWT authentication and role-aware authorization
- Idempotent job creation and optimistic status transitions
- Input validation, structured errors, logging and health checks
- Unit and integration tests
- Docker Compose for local development
- GitHub Actions CI

## Local setup

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d db`.
3. Run `npm ci` and `npx prisma migrate dev`.
4. Start with `npm run dev`.
5. Run `npm test` for the test suite.

The API is intentionally straightforward: the code favors boring, readable boundaries over framework magic.
