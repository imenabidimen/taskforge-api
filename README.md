# TaskForge API

A small but realistic task-management API built with NestJS. I kept the domain deliberately simple so the engineering choices are easy to inspect: authentication, ownership, validation, testing, and a clean API boundary.

## What it demonstrates

- NestJS + TypeScript REST API
- JWT authentication and bcrypt password hashing
- DTO validation with class-validator
- Per-user task ownership checks
- Unit tests for authentication and authorization boundaries
- CI that type-checks, tests, and builds on Node 22
- Prisma/PostgreSQL schema prepared for the next persistence step

## Architecture

HTTP request -> Controller -> Guard -> Service -> domain state

The current app uses in-memory state on purpose. That keeps the repository runnable without external services, while prisma/schema.prisma documents the intended PostgreSQL model. I would wire Prisma into the services when persistence is required rather than pretending the current demo is already production-ready.

## Run locally

npm install
cp .env.example .env
npm run start:dev

Useful checks: npm run typecheck, npm test, npm run build.

## API

- POST /api/auth/register
- POST /api/auth/login
- GET /api/tasks
- POST /api/tasks
- POST /api/tasks/:id/complete

## Notes

The goal is not to hide complexity behind a huge framework setup. The project is intentionally small enough to review in one sitting, while still showing the boundaries I would keep when growing it into a real service.