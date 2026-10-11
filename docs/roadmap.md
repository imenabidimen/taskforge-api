# Engineering roadmap

This roadmap prioritizes verifiable behavior over adding features for appearance. Items below are planned unless they are already present in the code and tests.

## 1. Operational baseline

- [x] Add liveness and readiness endpoints; readiness checks database connectivity without exposing secrets.
- [x] Add structured request logs and a request/correlation ID.
- [x] Add graceful shutdown and document deployment environment variables.
- [ ] Add security headers, explicit production CORS configuration, and rate limiting for authentication endpoints.
- [ ] Define a deployment target and deploy a demo with no real personal data.

**Acceptance evidence:** automated tests for health behavior, a redacted example log, deployment instructions, and a public CI/deployment status.

## 2. Data correctness

- [x] Add bounded offset pagination and deterministic ordering to task listing.
- [ ] Add tests for authorization across users at the HTTP/API boundary.
- [ ] Decide whether concurrent updates need optimistic concurrency control; add a version field only if the behavior is required.
- [ ] Document migration forward-fix and recovery expectations.

**Acceptance evidence:** API contract, integration tests against PostgreSQL, and a documented concurrency test.

## 3. Performance evidence

- [ ] Create a repeatable load-test script with fixed data volume and concurrency.
- [ ] Capture baseline latency percentiles, throughput, and error rate.
- [ ] Inspect PostgreSQL query plans before adding indexes.
- [ ] Record machine/runtime/database settings so results can be reproduced.

**Acceptance evidence:** a checked-in test procedure and measured results. Do not publish performance numbers until the test has actually run.

## 4. Manufacturing-domain case study

Build a separate, clearly labeled fictional domain slice inspired by common manufacturing execution concepts, not FORVIA's proprietary system.

- [ ] Model production orders, equipment, material definitions, and explicit state transitions.
- [ ] Define invariants and rejected transitions.
- [ ] Make declaration/retry semantics idempotent.
- [ ] Record actor, timestamp, result, and reason for important transitions.
- [ ] Simulate a downstream integration that can fail and be retried.
- [ ] Add concurrency tests for resource reservation.

**Acceptance evidence:** domain model, sequence/state diagrams, tests for business invariants, failure walkthrough, and a statement distinguishing simulation from professional work.

## 5. Architecture evolution

Do not introduce microservices, queues, caches, or Kubernetes as portfolio decoration. Record the observed requirement, alternatives, costs, and operational consequences in an ADR before adopting them.
