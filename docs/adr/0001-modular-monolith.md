# ADR 0001: Keep TaskForge as a modular monolith

- **Status:** Accepted
- **Date:** 2026-10-11

## Context

TaskForge currently exposes a small task API used by two frontends. The business domain is small, and the application has one relational database and one deployment unit. Splitting it into services would add network failure modes, deployment coordination, distributed tracing needs, and data ownership questions before there is a demonstrated need.

## Decision

Keep the API as one NestJS application with explicit authentication, task, and persistence boundaries. Keep PostgreSQL as the source of truth. Add modules only when they express a stable responsibility, not merely to increase the number of folders.

## Consequences

### Positive

- Local development and CI remain straightforward.
- Database transactions can cover operations within one application boundary.
- One API contract can serve both frontend implementations.
- Tests can exercise HTTP, application, and persistence behavior without a distributed test environment.

### Trade-offs

- The application is deployed and scaled as one unit.
- Module boundaries require code review discipline because they are not enforced by separate deployments.
- A future workload that needs independent scaling or separate release cadence may justify extracting a service.

## Revisit when

Revisit this decision if a module needs a different scaling profile, isolation boundary, or release cadence and measurements show the cost of keeping it in-process exceeds the operational cost of distribution.
