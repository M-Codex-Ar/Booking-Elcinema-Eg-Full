# Documentation

This folder holds the reasoning and the contracts. The README files hold the
commands. If a document here duplicates a README, the README wins and this
document should be fixed.

| Document | Read it when |
| --- | --- |
| [architecture.md](architecture.md) | You want the whole system: layers, data flow, why the boundaries sit where they do. |
| [frontend.md](frontend.md) | You are working in `elcinema/` — routes, server functions, rendering, the module map. |
| [design-system.md](design-system.md) | You are touching styling or copy — tokens, `cva` recipes, primitives, bilingual rules, RTL. |
| [backend.md](backend.md) | You are about to start the ASP.NET Core phase, or you want to know what it will replace. |
| [api-contract.md](api-contract.md) | You need the frontend/backend interface: endpoints, shapes, auth, versioning, error format. |
| [database.md](database.md) | You are changing stored content: `managed_*` tables, RLS, migrations, the merge rules. |
| [testing.md](testing.md) | You want to know what is covered, what is not, and how to verify a change honestly. |
| [operations.md](operations.md) | You are deploying, monitoring, rotating keys, or handling an incident. |
| [adr/](adr/) | You are asking "why is it this way" — one short decision per file. |

Current content-source decision: [ADR 0006](adr/0006-local-catalogue-only-no-runtime-scraping.md)
supersedes the historical scraper decision in ADR 0003.

## How to use these documents

Start with [architecture.md](architecture.md) for orientation, then the document
owning the area you are editing. When you change behaviour or structure, update
the document that owns that topic in the same pull request — CI only checks that
links resolve, so keeping content honest is a human (or agent) responsibility.

## Status of this repository

`elcinema/` is a working, deployed application. `server-api/` is a specification:
its documents describe a build that has not been started, and the code samples in
[backend.md](backend.md) and [api-contract.md](api-contract.md) are targets, not
current behaviour. The split is recorded in
[ADR 0002](adr/0002-supabase-is-the-system-of-record-for-now.md).
