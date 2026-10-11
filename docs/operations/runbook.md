# TaskForge operational runbook

This is an initial local/CI troubleshooting guide. It is not a production incident procedure; there is no hosted production deployment or monitoring stack currently claimed by this repository.

## Start locally

1. Copy `.env.example` to `.env`.
2. Set a unique local `JWT_SECRET`; never use the example value outside local development.
3. Start PostgreSQL with `docker compose up -d postgres`.
4. Install dependencies with `npm ci`.
5. Generate the Prisma client and apply migrations: `npm run prisma:generate` then `npx prisma migrate deploy`.
6. Start the API with `npm run start:dev`.
7. Open `http://localhost:3000/docs`.

## API fails to start

- Read the terminal output first; do not assume the database is the cause.
- Confirm `PORT`, `DATABASE_URL`, and `JWT_SECRET` are set.
- Check PostgreSQL readiness with `docker compose ps` and inspect logs with `docker compose logs postgres`.
- Confirm the migration command completed against the same database URL used by the API.

## Database schema or migration failure

- Check the failing migration and the database it targets before retrying.
- Do not edit an already-applied migration in a shared environment. Add a new migration for a corrective change.
- Back up data before any destructive schema or data operation in an environment containing data that matters.
- CI is expected to apply committed migrations to a fresh PostgreSQL service. A CI migration failure should block merging.

## Authentication issue

- Check that the client sends `Authorization: Bearer <token>`.
- Tokens are short-lived; sign in again if a token has expired.
- Do not log or paste access tokens, passwords, JWT secrets, or database credentials into issues.
- Check the API response and test the same flow with a fresh account before changing authorization logic.

## CI failure triage

1. Open the failing job in the GitHub Actions run.
2. Identify whether the failure is dependency installation, Prisma generation/migration, type-check, test, build, API startup, or browser capture.
3. Reproduce the smallest failing command locally if possible.
4. Fix the cause rather than weakening or skipping the check.
5. Confirm a new run passes after the fix.

## Recovery limits

There is no production backup, restore, alerting, or rollback automation configured in this repository. Do not represent this runbook as evidence that those controls exist. Before a public deployment that stores meaningful data, define backup/restore ownership, secret management, migration rollback/forward-fix policy, and an incident contact path.
