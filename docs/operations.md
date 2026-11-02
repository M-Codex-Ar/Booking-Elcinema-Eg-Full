# Operations

## What is deployed where

| Piece | Runtime | Notes |
| --- | --- | --- |
| `elcinema/` (SSR + server functions) | Cloudflare via Nitro | `bun run build` → `.output/`; `.wrangler/` holds local deploy state |
| Postgres + auth | Supabase, project `twuzevyzjvmvufoutbny` | `managed_*` tables plus `auth.users`; RLS per [database.md](database.md#authorization-today) |
| Static assets | Same origin, `public/` | `favicon.ico`, `robots.txt` (all crawlers allowed) |
| Artwork | Bundled under `src/assets/img` via the `images.ts` manifest, plus external elcinema URLs | Catalogue posters resolve locally; scraped posters point at elcinema's CDN |
| `server-api/` | — | Not deployed: no code yet ([backend.md](backend.md)) |

The app is built and synced through its connected [Lovable](https://lovable.dev)
project; `.lovable/project.json` records the template revision. Pushes to `main`
under `elcinema/` sync back to it, which is why published history there is never
rewritten ([../CONTRIBUTING.md](../CONTRIBUTING.md)).

## Build and release

```sh
./scripts/check.sh                      # the gate, before anything ships
cd elcinema && bun run build            # .output/
```

Release checklist, in order:

1. `check.sh` green, including the route-tree freshness step.
2. Both editions and both themes checked on `/en`, `/ar`, a narrow viewport, and
   the dashboard ([testing.md](testing.md#how-to-verify-honestly)). For layout
   work, run the scripted pass instead of eyeballing it:
   `node scripts/responsive-audit.mjs`
   ([testing.md](testing.md#responsive-and-rtl-audit)) — it must exit 0.
3. [`/CHANGELOG.md`](../CHANGELOG.md) updated under `[Unreleased]`.
4. Merge to `main` (squash the branch; do not rewrite what is already pushed).
5. After the deploy: load a public page with the database unreachable to confirm
   the catalogue still renders, and check the server logs for parser failures.

## Environment variables

Frontend server side — `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` (service role; never in a `VITE_` variable, never in
the browser bundle; `scripts/seed-admin.mjs` reads it).
Browser — `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (publishable only).
Platform — `LOVABLE_CRON_SECRET` (and `..._PREVIOUS` for overlap during rotation),
consumed by `src/integrations/supabase/cron-auth.ts` for authenticated cron calls.

Local: copy [`.env.example`](../elcinema/.env.example) to `elcinema/.env`. `.env`
is ignored; `.env.example` never holds a real value
([../SECURITY.md](../SECURITY.md#secrets-and-configuration)).

### The build gate

`bun run build` runs `elcinema/scripts/check-env.mjs` first and refuses to emit a
bundle when `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` cannot be
resolved. Vite inlines silently, so an env-free build compiles green and then
throws in the browser on every page ("Missing Supabase environment variable(s)")
— the generated `src/integrations/supabase/client.ts` raises on first property
access, and `src/start.ts` routed that failure into every server function.

- `SKIP_ENV_CHECK=1` builds anyway. `Web CI` sets it because CI holds no Supabase
  values, so its `web-output` artifact is compile-verified only — **not** deployable.
- Deployable builds happen where the real `.env` lives, or on Lovable Cloud, which
  injects its own values.
- On Cloudflare (Nitro `cloudflare-module`) the server-side variables must also be
  set on the Worker (`wrangler secret put SUPABASE_SERVICE_ROLE_KEY`, plus
  `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`); build-time inlining covers the
  browser alone.
- Missing values degrade instead of crashing: the auth subscription in `__root.tsx`
  and the header session checks skip Supabase via `src/lib/supabase-env.ts`, the
  sign-in forms report `auth.notEnabled`, and `getManagedContent` returns empty
  lists so the built-in catalogue still renders.

Rotating a leaked or stale value: issue the new one, deploy, then revoke the old —
`LOVABLE_CRON_SECRET_PREVIOUS` exists so cron calls keep working across the swap.
If a value was ever committed, treat it as public: revoke first, then remove it
from history's reach by rotation, not by amending a published branch.

## Monitoring

There is no metrics pipeline yet, so "monitoring" today means these signals:

- **CI** is the only automated regression net; a red `Web CI` blocks merge.
- **Error reporting**: `src/lib/lovable-error-reporting.ts` receives what
  `__root.tsx`'s error component catches; `src/server.ts` converts h3's swallowed
  500 JSON body (`{"unhandled":true,"message":"HTTPError"}`) into a real HTML error
  page and logs the underlying error — **a 500 that renders JSON means that wrapper
  regressed.**
- **Parser drift** is the most likely incident: a live page goes empty or missing
  while the build stays green. The fixture tests in
  [testing.md](testing.md#what-is-covered) catch it only after the fixture is
  refreshed, so treat "the now-playing rail is suddenly short" as a scraping signal.
- Supabase dashboard: auth attempts, connection count, and slow queries on
  `managed_*`.

Worth adding, in order: request logging with a correlation id, an uptime check on
`/en` and `/ar`, a scrape-failure counter per source, and a health endpoint once
`server-api/` exists.

## Common incidents

| Symptom | First look | Likely fix |
| --- | --- | --- |
| A rail is empty but the page renders | Server logs for a parser warning; compare a stored fixture with the live page | Fix the selector in `*.server.ts`, refresh the fixture, keep the test |
| 404 on a route that exists in dev | `src/routeTree.gen.ts` vs `src/routes/` | `bun run build`, commit the regenerated tree |
| Arabic page laid out like English | `dir` on the wrapper and `<html>`; grep for `ml-`/`left-` in the changed component | Logical properties, then `rtl:` where logic cannot reach ([design-system.md](design-system.md#direction)) |
| Sign-in works, dashboard is blank | Token/RLS mismatch; `requireSupabaseAuth` in the server function | Check the session claim, not the query |
| Site renders unstyled after deploy | Tailwind `@source` scan; `styles.css` import order | Restore the explicit `@source "../src"` |
| Image 404 | `images.ts` key vs `src/assets/img` | Add the asset or the manifest entry; the fallback poster must still show |
| Missing/broken key in a deploy | Which environment, which variable | Rotate, redeploy, record in [../SECURITY.md](../SECURITY.md) |
| Console says "Missing Supabase environment variable(s)", pages blank | Was the bundle built where `elcinema/.env` exists? Compare the asset hash in the deployed HTML with a local `bun run build` | Rebuild with the values present and redeploy; [The build gate](#the-build-gate) now blocks the env-free bundle |

## Backup and restore

The catalogue is git, so it is backed up by definition. Operator content is not:
`managed_*` holds only what operators typed, and it lives solely in Supabase.
Until the API phase, take a scheduled export of those seven tables (Supabase
daily backup plus a periodic `pg_dump` of `managed_%` kept somewhere outside the
project) and rehearse restoring into a scratch database once — an untested backup
is a rumour. Artwork uploaded through the dashboard needs the same treatment;
today it is URLs in rows, so the export covers it and the external host does not.

## Read next

[architecture.md](architecture.md) for what talks to what ·
[database.md](database.md) for the migration workflow and its hazard ·
[../SECURITY.md](../SECURITY.md) for disclosure and the hardening backlog.
