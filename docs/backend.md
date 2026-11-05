# Backend plan — `server-api/`

> **Status: specification only.** `server-api/` contains no buildable project yet,
> and adding one requires the owner's go-ahead ([AGENTS.md](../AGENTS.md#non-negotiables)).
> Everything below is the target, written so the implementation phase can start by
> reading one document. The executable checklist lives in
> [`server-api/README.md`](../server-api/README.md).

> **Current-source note:** ADR 0006 retired all public on-demand scraping. Older
> migration notes below that describe scrape ingestion are historical and are
> not an approved implementation target. Preserve the local catalogue and
> managed-content source boundary in any future API design.

## Why an API at all

Today the frontend uses TanStack server functions for Supabase access and serves
public pages from the local catalogue plus managed rows. Potential API work should
focus on backend concerns that the frontend should not own:

1. **The public catalogue is checked in.** Catalogue changes use reviewed
   repository updates; operator changes use managed tables.
2. **Authorization is coarse.** The `managed_*` row-level policies grant insert,
   update and delete to *any* authenticated user. There is no role, no per-table
   permission, no audit of who changed what.
3. **No contract.** Content shapes are TypeScript interfaces shared by convention
   with the database. A second consumer — a mobile app, a partner embed — has
   nothing stable to build against.
4. **Validation lives in the UI.** Dashboard writes currently post row payloads
   straight through; malformed data can reach the table.

Public reads of the seven optional managed-content tables run concurrently with
a 1.2-second abort budget. A failed table is treated as an empty additive
collection so Supabase availability cannot blank the built-in catalogue pages.

The API closes all four by owning ingestion, authorization and validation, and by
exposing a versioned contract.

## What it is

ASP.NET Core on **.NET 9**, minimal API style, EF Core for data, deployed as one
container behind the same domain the frontend calls.

| Concern | Choice | Why |
| --- | --- | --- |
| Hosting | `Microsoft.AspNetCore.App` minimal API | Small surface, fast startup, no MVC ceremony for a JSON API. |
| Data access | EF Core 9 (`Npgsql.EntityFrameworkCore.PostgreSQL`) | Code-first against the existing Postgres, migrations under source control. |
| Validation | `FluentValidation` (or DataAnnotations for the first slice) | Explicit rules at the boundary, before persistence. |
| AuthN | JWT bearer access tokens, short-lived, with refresh | The frontend already has a session concept; keep it, move the decision server-side. |
| AuthZ | Policy-based, role + permission claims | Replaces the "any authenticated user is staff" policy honestly. |
| Docs | `Swashbuckle.AspNetCore` for OpenAPI 3 in Development/Staging | The contract in [api-contract.md](api-contract.md) becomes inspectable and testable. |
| Caching | Response caching + `ETag`/`Cache-Control` for managed content | Keeps managed reads bounded and efficient. |
| Health | `AddHealthChecks()` with `/health` (liveness) and `/health/ready` (DB) | Required by any container orchestrator. |
| Logging | Built-in `ILogger`, JSON to the platform collector | No bespoke logging layer. |
| Resilience | Bounded Supabase/database reads | Managed-content failures do not blank the local catalogue. |
| Rate limiting | `Microsoft.AspNetCore.RateLimiting` per client/IP | Public content endpoints. |
| Tests | xUnit + `WebApplicationFactory` integration tests | Contract tests run against the real pipeline. |
| Container | Multi-stage Dockerfile, non-root, `aspnet:9.0` | Fits the existing deploy story. |

## What it takes over, and in what order

| Frontend today | After the API |
| --- | --- |
| `content.functions.ts` → `getManagedContent` reads all seven tables at once | `GET /api/v1/content` returns the same aggregate, or per-collection endpoints when a page needs one |
| Local JSON catalogue plus `managed_*` rows | Versioned API may serve those same approved sources |
| `dashboard/editor.tsx` → direct Supabase writes | `PUT/POST/DELETE /api/v1/admin/*` with validation + role checks + audit |
| Supabase RLS decides "authenticated ⇒ staff" | API policies decide per permission; RLS stays as defence in depth |
| Supabase auth for the dashboard | Unchanged in Phase 1–2; token issuance moves in Phase 4 if it earns its cost |

Phases: **0** scaffold · **1** read-only content endpoints mirroring today's reads ·
**2** managed-content endpoints · **3** admin writes with
validation, roles and audit · **4** auth consolidation, artwork storage, rate limits.
Milestones and acceptance criteria are in
[`server-api/README.md`](../server-api/README.md#milestones).

## Project layout (when created)

```
server-api/
├── UnifiedControlCenter.sln
├── Dockerfile
├── README.md                      # the start-here brief
├── src/UnifiedControlCenter.Api/
│   ├── Program.cs                 # composition root only
│   ├── Endpoints/                 # one file per vertical slice, Minimal API groups
│   ├── Domain/                    # entities, value objects (BilingualText, SlotRange)
│   ├── Application/               # services, ports (interfaces)
│   ├── Infrastructure/            # EF Core DbContext, migrations, cache
│   ├── Contracts/                 # request/response DTOs + validators
│   ├── Auth/                      # token issuance, policies, claim mapping
│   └── appsettings[.Development|.Production].json
└── tests/UnifiedControlCenter.Api.Tests/
    ├── Endpoints/                 # WebApplicationFactory integration tests
    └── Application/               # unit tests for merge + parse logic
```

`Domain` depends on nothing. `Application` depends on `Domain`. `Infrastructure`
implements `Application` ports. `Endpoints` and `Auth` are composition-only —
exactly the layering the frontend already aims at
([architecture.md](architecture.md#layers)).

## Decisions still open

Recorded as ADRs once made ([adr/](adr/)). Before Phase 1 starts:

- Postgres stays Supabase-hosted or moves to a managed instance the API owns.
- Whether the API re-issues Supabase-issued tokens or becomes the identity provider.
- Artwork: object storage with signed URLs, or the current external CDN.
- Whether `/api/v1/content` (aggregate, mirrors today) or per-collection endpoints ships first.

## Read next

[api-contract.md](api-contract.md) for the exact interface the frontend will call ·
[database.md](database.md) for what is stored today and how the schema evolves ·
[operations.md](operations.md) for deployment, secrets and health.
