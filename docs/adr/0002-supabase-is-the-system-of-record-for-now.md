# ADR 0002 — Supabase is the system of record for now; ASP.NET Core is planned, not started

Status: accepted (2026-11-02)

## Context

The repository is intended to be a full-stack project with an ASP.NET Core backend.
Today the frontend already has a backend: Supabase provides auth, Postgres with
RLS, and a typed client, and the dashboard works against it. Building the API now
would duplicate a working path, and its shape depends on decisions that are still
open (hosted vs. owned Postgres, who issues tokens, where artwork lives).

## Decision

Keep Supabase as the running system of record. Specify `server-api/` completely —
[backend.md](../backend.md) for the design, [api-contract.md](../api-contract.md)
for the interface, [database.md](../database.md) for the data — and commit an empty
skeleton with CI guards, without creating a buildable project. No backend code is
added until the owner gives the go-ahead.

## Consequences

- The contract is written while the requirements are fresh, so Phase 1 can be
  implemented and reviewed as one unit instead of discovered mid-build.
- Frontend ports (`home.shared.ts`, `live.shared.ts`) become the client side of the
  contract, so migration is per endpoint rather than a rewrite.
- Nothing in the docs is provable by a compiler yet. The guard step in
  `Api CI` and the "specification only" status in [`/README.md`](../../README.md)
  exist precisely so nobody mistakes the plan for deployed behaviour.
- The known authorization weakness — any authenticated user can write `managed_*` —
  is not deferred to the API. It is fixed in RLS and the server function now, and
  tracked in [SECURITY.md](../../SECURITY.md#known-hardening-backlog); an unbuilt
  backend is not a reason to leave a live hole open.
- Cost of the gap: two ways to describe the same data (TypeScript ports and the
  API DTOs) must be kept in step by hand until the API supersedes the ports.
