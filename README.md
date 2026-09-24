# TaskForge API — NestJS

A realistic team task-management API built as a portfolio project for a full-stack engineer.

**Stack:** NestJS, TypeScript, JWT, bcrypt, class-validator, Jest, Docker-ready configuration.

### Features
- Register/login with bcrypt password hashing
- JWT access-token authentication
- User roles (USER/ADMIN) in the auth model
- Protected task workflow with ownership checks
- Validation and consistent HTTP errors
- Health-ready application structure
- Unit tests
- Environment configuration

### Run
```bash
npm install
cp .env.example .env
npm run start:dev
npm test
```

The persistence layer is intentionally kept small so the domain is easy to review; the service boundaries are ready to be swapped for PostgreSQL/Prisma without changing controllers.
