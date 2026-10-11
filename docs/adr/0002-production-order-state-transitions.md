# ADR 0002: Explicit production-order state transitions

- Status: Accepted
- Date: 2026-10-11

## Context

The portfolio needs one domain example that demonstrates more than generic CRUD. A manufacturing-inspired order lifecycle is a useful fit, but must remain fictional and separate from any employer's proprietary processes.

## Decision

Represent the lifecycle with a finite status enum and an explicit transition map. Store each accepted transition as an audit event. Perform the state update and event insert in one database transaction. Use a monotonically increasing version and a conditional update on the previously read status/version to detect competing updates.

## Consequences

- Invalid transitions are rejected consistently by the API.
- The event history explains who changed the state, when, from which state, to which state, and why when a reason is supplied.
- Concurrent requests cannot both successfully transition the same observed version.
- This does not provide automatic retries; clients receive a conflict and must reload before retrying.
- Equipment/resource reservations, external integrations, and message delivery remain out of scope until requirements justify them.
- The workflow is a portfolio simulation, not a representation of a production MES or employer implementation.
