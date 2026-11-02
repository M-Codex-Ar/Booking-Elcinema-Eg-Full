# elcinema — web app

The public bilingual (EN/AR) elCinema-style site and its operator dashboard. Part of the
[Unified Control Center](../README.md) repository; the planned ASP.NET Core API lives in
[`../server-api/`](../server-api/).

## Stack

TanStack Start (SSR + server functions) · React 19 · TanStack Router & Query · Tailwind CSS v4 ·
Radix UI primitives (shadcn-style) · Supabase (auth + Postgres, RLS) · Drizzle migrations ·
Vitest + Testing Library · Vite 8 with Nitro (Cloudflare target).

## Run it

```sh
bun install          # or npm install
cp .env.example .env # publishable Supabase values only
bun run dev
```

| Script                           | What it does                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `dev` / `preview`                | Vite dev server / serve the last build                                                  |
| `build`                          | Production build (`.output/`, Cloudflare-ready)                                         |
| `lint`, `format`, `format:check` | ESLint, Prettier write, Prettier verify                                                 |
| `typecheck`                      | `tsc --noEmit` under strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| `test`, `test:watch`             | Vitest once / on change                                                                 |
| `check`                          | The acceptance gate: format → lint → typecheck → test → build                           |

## Layout that matters

```
src/
  theme/                 tokens.css · utilities.css · base.css  (all literal design values)
  styles.css             entry point that imports the theme in order
  elcinema/
    components/          variants.ts (cva recipes) · primitives.tsx  ← shared UI
    i18n.ts              every UI string, typed keys
    content.ts           merge rules: operator rows + built-in catalogue
    links.ts             the only sanctioned resolver for scraped hrefs
    pages/ dashboard/    composed from the primitives, no local style recipes
  routes/                thin wiring: params → data → page component
drizzle/                 schema + SQL migrations for the managed_* tables
```

Read [../docs/frontend.md](../docs/frontend.md) for the layer rules and
[../docs/design-system.md](../docs/design-system.md) for how styling and copy are centralised.

## Project rules

This folder is connected to [Lovable](https://lovable.dev/projects/a823436b-5917-469f-a70f-5625ac6fe0ce).
Never rewrite published git history here — force pushes, rebases, amends or squashes of pushed
commits break the sync and can lose work. Keep `main` in a working state; pushed changes appear in
the Lovable editor.

Public pages never query `managed_*` directly; they consume the merge helpers in `content.ts`.
Operator writes go through the auth-guarded server function. Sign-up is disabled by design —
staff accounts are provisioned.

The task log for this app is [roadmap.md](roadmap.md).
