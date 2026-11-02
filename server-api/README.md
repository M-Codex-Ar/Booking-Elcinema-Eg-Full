# server-api/ — ASP.NET Core backend

> **No code here yet, on purpose.** This folder is the specification and the
> start-here brief for the backend phase. Creating a project, adding a package, or
> writing a `.cs` file requires the owner's go-ahead
> ([AGENTS.md](../AGENTS.md#non-negotiables)). When that green light comes, this is
> the only document you need to begin.

The design rationale is in [docs/backend.md](../docs/backend.md); the interface is
in [docs/api-contract.md](../docs/api-contract.md); the data model is in
[docs/database.md](../docs/database.md). This README is the executable checklist.

## What it will be

A **.NET 9** minimal API in front of the existing Postgres, replacing the frontend's
on-demand scraping with ingestion, moving authorization from "any signed-in user is
staff" to permissions, and validating every write at the boundary.

| Concern | Package |
| --- | --- |
| Web | `Microsoft.AspNetCore.App` framework reference (no `Microsoft.AspNetCore.*` NuGet packages needed) |
| Data | `Npgsql.EntityFrameworkCore.PostgreSQL` 9.x, `Microsoft.EntityFrameworkCore.Design` 9.x |
| Validation | `FluentValidation` (or DataAnnotations for the first slice) |
| Auth | `Microsoft.AspNetCore.Authentication.JwtBearer` 9.x |
| OpenAPI | `Swashbuckle.AspNetCore` |
| Health | `Microsoft.Extensions.Diagnostics.HealthChecks` (in-box) |
| Resilience | `Microsoft.Extensions.Http.Resilience` |
| Caching | `Microsoft.AspNetCore.ResponseCaching` + `IOutputCache` (in-box) |
| Rate limiting | `Microsoft.AspNetCore.RateLimiting` (in-box) |
| Logging | Built-in `ILogger` + the platform JSON sink |
| Tests | `xunit`, `xunit.runner.visualstudio`, `Microsoft.AspNetCore.Mvc.Testing`, `FluentAssertions`, `Microsoft.NET.Test.Sdk`, `coverlet.collector` |
| Analysis | `StyleCop.Analyzers` (off by default; enable deliberately), .editorconfig already rules C# at 4 spaces |

## Milestones

Each one ships green tests and a real consumer. Do not start N+1 before N is merged.

**0 — Skeleton (this step, once approved).**

```powershell
cd server-api
dotnet new sln -n UnifiedControlCenter
dotnet new webapi -minimal -o src/UnifiedControlCenter.Api -n UnifiedControlCenter.Api
dotnet new xunit   -o tests/UnifiedControlCenter.Api.Tests -n UnifiedControlCenter.Api.Tests
dotnet sln add src/UnifiedControlCenter.Api tests/UnifiedControlCenter.Api.Tests
dotnet add src/UnifiedControlCenter.Api package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add src/UnifiedControlCenter.Api package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add src/UnifiedControlCenter.Api package Swashbuckle.AspNetCore
dotnet add src/UnifiedControlCenter.Api package Microsoft.Extensions.Http.Resilience
dotnet add tests/UnifiedControlCenter.Api.Tests package Microsoft.AspNetCore.Mvc.Testing
dotnet run --project src/UnifiedControlCenter.Api   # -> /health returns 200
```

Accept: `dotnet build` clean, `/health` 200, the `API CI (planned)` guard step
replaced by real steps, `dotnet test` green with one smoke test hitting `/health`.

**1 — Read-only content.** EF Core model over the existing tables (no schema
change), `GET /api/v1/content`, `/movies`, `/box-office`, `/tv-guide`,
`/home` matching the contract shapes, response caching + ETags, ProblemDetails
errors, correlation id, OpenAPI published. Accept: the frontend can render
Now Playing, Box Office and the TV guide from the API behind a flag, with its
existing fallback intact.

**2 — Ingestion.** `IHostedService` workers per source (home, work, person, video,
vod, lineup) ported from `elcinema/src/elcinema/*.server.ts`, resilient HTTP clients,
parsed rows in tables, `degraded` flag instead of empty responses, last-good values
served on failure. Accept: no public read endpoint depends on elcinema.com being
reachable; each ported parser keeps its fixture test.

**3 — Admin writes.** DTO + validator per collection, `PUT/POST/DELETE
/api/v1/admin/*`, JWT bearer with permission policies, audit log of every mutation,
`updated_at` maintained. Accept: the dashboard writes through the API; direct
browser writes to `managed_*` are gone and RLS no longer grants write to every
authenticated user.

**4 — Consolidation.** Token issuance, artwork upload with object storage, rate
limits, load testing, the aggregate endpoint retired in favour of collections.
Accept: [SECURITY.md](../SECURITY.md) backlog items 1–6 closed or explicitly
waived in an ADR.

## Layout

```
server-api/
├── UnifiedControlCenter.sln
├── Dockerfile                       # multi-stage, aspnet:9.0, non-root
├── README.md                        # this file
├── src/UnifiedControlCenter.Api/
│   ├── Program.cs                   # composition root only: no business logic
│   ├── Endpoints/                   # one static class per vertical slice (Minimal API groups)
│   ├── Domain/                      # entities + value objects (BilingualText, SlotRange)
│   ├── Application/                 # services and ports (interfaces)
│   ├── Infrastructure/              # DbContext, migrations, scrape/ingest adapters, cache
│   ├── Contracts/                   # request/response DTOs + validators
│   ├── Auth/                        # token issuance, policies, claim mapping
│   ├── appsettings.json             # no secrets
│   └── appsettings.Development.json # local connection string only
└── tests/UnifiedControlCenter.Api.Tests/
    ├── Endpoints/                   # WebApplicationFactory integration tests
    └── Application/                 # unit tests (merge, parse, validation)
```

Rules that keep the layering honest:

- `Domain` depends on nothing. `Application` depends on `Domain` only.
  `Infrastructure` implements `Application` ports. `Endpoints` does validation,
  authorization and mapping — no data access inline, no `DbContext` in a handler.
- Read models are records, not tracked entities; nothing mutates the database from a
  GET.
- Migrations are code-first and reviewed in the pull request. They must never drop
  a table that exists; the frontend already learned that lesson with an empty Drizzle
  schema ([database.md](../docs/database.md#migrations)).
- Connection strings and keys come from user-secrets in Development and the host's
  secret store in production. Nothing secret is ever committed, and
  `appsettings.Production.json` does not exist in the repository.

## Commands

```powershell
dotnet build
dotnet test
dotnet format --verify-no-changes
dotnet run --project src/UnifiedControlCenter.Api            # Development
dotnet ef migrations add Initial -p src/... -s src/...       # only with a reviewed diff
dotnet dev-certs https --export-path ../artifacts/devcert.pfx  # local TLS for the frontend
```

From the repository root: `npm run setup:api`, `npm run dev:api`, `npm run check:api`
— each is a no-op with a clear message until the projects exist.

## Definition of done for the API phase

Contract implemented as written in [api-contract.md](../docs/api-contract.md) with
no undocumented fields; integration tests per endpoint including 401/403/404/422;
role separation actually enforced (an editor cannot delete a row reserved for
admin); OpenAPI reviewed; Docker image builds and `/health/ready` reports the
database; the frontend migration flag is off and the old path is deleted, not left
haunting the codebase.
