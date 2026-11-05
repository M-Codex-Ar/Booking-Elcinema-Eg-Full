# Security policy

## Reporting a vulnerability

Email the maintainer privately (see the address in `CODEOWNERS`) with a description, a repro and
the affected commit. Do not open a public issue. Expect acknowledgement within three business
days; fixes ship as a patch release with an entry in [CHANGELOG.md](CHANGELOG.md).

## Secrets and configuration

- `.env`, `.env.local` and Cloudflare `.dev.vars` are git-ignored. Only `.env.example` is tracked.
- Anything already committed is considered public: rotate it, then untrack it with
  `git rm --cached <file>` and commit.
- The frontend may only use **publishable/anon** keys (`VITE_SUPABASE_PUBLISHABLE_KEY`). A
  service-role or `SUPABASE_SECRET_KEY` value must never be imported by a module reachable from a
  browser bundle; those belong to the server layer.
- The ASP.NET Core phase keeps secrets in user-secrets locally and in the host's secret store in
  production — never in `appsettings.*.json` ([docs/backend.md](docs/backend.md#secrets)).

## Authorization model

| Surface                    | Guard                                                                                   | Notes                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Public read of `managed_*` | Postgres RLS, `select` granted to `anon`                                                | Read-only, publishable rows                                                |
| Dashboard entry            | Trusted Supabase `app_metadata.role` + `_authenticated/` route gate                     | Admin, Editor, Viewer; ordinary users are redirected                       |
| Managed create/update      | `requireSupabaseAuth`, `requireContentEditorRole`, strict per-table Zod schema, and RLS | Admin and Editor only; the browser never writes managed tables             |
| Managed delete             | `requireSupabaseAuth`, `requireAdminRole`, and RLS                                      | Admin only                                                                 |
| Profile roles              | No client update policy; profile is a non-authoritative mirror                          | `user_metadata`, profile fields, and email are never authorization sources |
| Cron/scrape endpoints      | `LOVABLE_CRON_SECRET` shared secret                                                     | Reserved for the backend phase; the frontend carries no cron module        |

The forward-only migration is
[`0003_harden_staff_authorization.sql`](elcinema/supabase/migrations/0003_harden_staff_authorization.sql).
Apply migrations before deploying the frontend changes. It removes self-service profile updates,
replaces the vulnerable role checks, and keeps public content reads unchanged.

## Remaining product and operations work

- **Request-time scraping.** Scraper caches now have a bounded size, but shared caching and
  ingestion workers remain part of the separately approved backend phase.
- **Ticket purchasing.** Booking pages show cinema and showtime information; real reservations
  require a ticket-provider contract, credentials, and a server-side reservation lifecycle.
- **ASP.NET Core API.** `server-api/` remains specification-only until the owner approves that
  implementation phase, as stated in `AGENTS.md`.
- **Live database integration.** RLS regression tests are in
  `elcinema/supabase/tests/0003_staff_authorization.test.sql` and require local Supabase services.
  Vitest separately covers role guards and payload validation.

## Dependencies

Dependabot is configured for npm, NuGet and GitHub Actions
([`.github/dependabot.yml`](.github/dependabot.yml)). Merge security bumps promptly, keep the
lockfile in sync, and re-run `npm run check:web`.
