# Unified Control Center

Bilingual (EN/AR) cinema information platform — an elCinema-style public site with an
operator dashboard — structured as a full-stack repository: a TypeScript frontend today,
and an ASP.NET Core API as the documented next phase.

| Area | Path | Stack | Status |
| --- | --- | --- | --- |
| Web app | [`elcinema/`](elcinema/) | TanStack Start, React 19, Tailwind CSS v4, Supabase, Drizzle | Active |
| API | [`server-api/`](server-api/) | ASP.NET Core (.NET 9) minimal API + EF Core | Planned — specification only, no code yet |

## Repository layout

```
.
├── elcinema/            # Frontend: public site + operator dashboard
├── server-api/          # Backend: ASP.NET Core API (blueprint + empty skeleton)
├── docs/                # Architecture, API contract, design system, ADRs
├── scripts/             # setup / dev / check helpers (bash + PowerShell)
├── .github/             # CI workflows, issue & PR templates, dependabot
├── AGENTS.md            # Rules for AI agents working in this repo
├── CONTRIBUTING.md      # Branch, commit and pull-request conventions
├── SECURITY.md          # Vulnerability reporting and secret policy
└── CHANGELOG.md         # Release notes (Keep a Changelog)
```

## Prerequisites

- [Bun](https://bun.sh) 1.x or Node.js ≥ 20 (the frontend lockfile is `bun.lock`)
- Git
- .NET 9 SDK — only needed when the `server-api/` phase starts (`dotnet --version` is checked by `scripts/setup.*`)

## Quick start

```sh
git clone <this-repository-url>
cd unified-control-center
./scripts/setup.sh        # installs frontend dependencies
./scripts/dev.sh          # starts the web app on its dev server
./scripts/check.sh        # format check, lint, typecheck, tests, production build
```

Windows (PowerShell): `.\scripts\setup.ps1`, `.\scripts\dev.ps1`, `.\scripts\check.ps1`.

From the repository root, the same steps are available as npm scripts:

```sh
npm run setup:web     # bun|npm install inside elcinema/
npm run dev:web       # vite dev server
npm run check:web     # lint + typecheck + tests + build
```

## Where to read next

| Question | Document |
| --- | --- |
| How is the system put together? | [docs/architecture.md](docs/architecture.md) |
| How do I work on the frontend? | [docs/frontend.md](docs/frontend.md) |
| How is styling centralised (tokens, primitives, i18n)? | [docs/design-system.md](docs/design-system.md) |
| What will the backend look like, and how do I start it? | [docs/backend.md](docs/backend.md) and [server-api/README.md](server-api/README.md) |
| What is the frontend/backend data contract? | [docs/api-contract.md](docs/api-contract.md) |
| How is content stored and merged? | [docs/database.md](docs/database.md) |
| How is anything verified? | [docs/testing.md](docs/testing.md) |
| Why is it this way? | [docs/adr/](docs/adr/) |

## Important project constraints

- `elcinema/` is connected to [Lovable](https://lovable.dev). **Never rewrite published git
  history** in that folder — force-pushing or rebasing pushed commits breaks the sync and can
  lose work. See [`elcinema/AGENTS.md`](elcinema/AGENTS.md).
- Public pages must not query the `managed_*` tables directly; all merging of operator content
  with the built-in catalogue goes through `elcinema/src/elcinema/content.ts`.
- Sign-up is deliberately disabled: operator accounts are provisioned, never self-registered.
- `server-api/` contains no buildable code by design. Start from
  [server-api/README.md](server-api/README.md) when the backend phase is approved.
