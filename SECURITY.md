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

## Authorization model today

| Surface | Guard | Notes |
| --- | --- | --- |
| Public read of `managed_*` | Postgres RLS, `select` granted to `anon` | Read-only, publishable rows |
| Dashboard CRUD | `requireSupabaseAuth` on the server function + `_authenticated/` route gate | Session must exist; no self-serve sign-up |
| Cron/scrape endpoints | `LOVABLE_CRON_SECRET` shared secret | Secret reserved for the backend phase; the frontend carries no cron module |

## Known hardening backlog

Tracked findings from the architecture review, in priority order. Each needs an owner and a PR.

1. **RLS treats every signed-in user as staff.** The `managed_*` policies authorize
   `authenticated` wholesale, so any account provisioned in Supabase can write operator content.
   Needs a role claim (e.g. a `staff` JWT metadata check or a `staff_members` table + policy).
2. **Dashboard writes bypass the guarded server function.** `elcinema/src/elcinema/dashboard/*`
   still calls the Supabase client directly instead of `saveManagedRow`/`deleteManagedRow`, so the
   only barrier is RLS. Route mutations through the server function and delete the client path.
3. **Unvalidated row payloads.** `saveManagedRow` accepts `Record<string, unknown>`; add a Zod
   schema per managed table (Zod is already a dependency) and reject unknown columns.
4. **Silent data loss.** `getManagedContent` maps per-table failures to `[]`; surface the error so
   the dashboard can show it instead of rendering empty sections.
5. **`.env` with Supabase keys is tracked.** Values are publishable-only today, but the file must
   be untracked and the keys rotated once any secret lands there.
6. **Unbounded scrape caches.** Server module caches are `Map`s with no eviction; add a size cap or
   move caching into the backend phase where a real store exists.

## Dependencies

Dependabot is configured for npm, NuGet and GitHub Actions
([`.github/dependabot.yml`](.github/dependabot.yml)). Merge security bumps promptly, keep the
lockfile in sync, and re-run `npm run check:web`.
