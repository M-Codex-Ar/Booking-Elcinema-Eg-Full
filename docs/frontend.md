# Frontend — `elcinema/`

TanStack Start 1.168 (SSR + server functions) · TanStack Router 1.170 + Query ·
React 19 · Tailwind CSS v4 · Supabase JS · Vite 8 + Nitro (Cloudflare target) ·
Vitest 4 · ESLint 9 + Prettier · TypeScript strict.

## Commands

Run from `elcinema/` (or `npm run <script>:web` from the repository root):

| Command | What it does |
| --- | --- |
| `bun install` | Install dependencies (`bun.lock`; `bunfig.toml` enforces a 24-hour supply-chain age guard). |
| `bun run dev` | Vite dev server; it prints its own URL (the Lovable plugin sets host/port/strictPort). |
| `bun run build` | Type-free production build through Nitro, output in `.output/`. |
| `bun run preview` | Serve the built output locally. |
| `bun run lint` | ESLint over the whole project. |
| `bun run format` / `format:check` | Prettier write / verify. |
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit`. |
| `bun run test` | Vitest once; `test:watch` for the loop. |
| `bun run check` | The gate: format check, lint, typecheck, tests, build. |

[`/scripts/check.sh`](../scripts/check.sh) wraps the same gate and adds the
committed route-tree freshness check that CI enforces.

## Module map

```
src/
├── theme/                  tokens.css, utilities.css, base.css (the design system)
├── routes/                 file-based routes; thin wiring only
│   ├── __root.tsx          <html>, document head, theme flash guard, QueryClientProvider
│   ├── index.tsx           / → /en
│   ├── $lang.tsx           language shell: dir/lang, header, footer
│   ├── $lang.*.tsx         public pages (now, soon, boxoffice, tvguide, search, video, vod, lineup, booking, person, work)
│   ├── auth.tsx            operator sign-in (self sign-up is disabled on purpose)
│   ├── reset-password.tsx
│   └── _authenticated/    dashboard, guarded by the auth route
├── elcinema/
│   ├── pages/              one file per screen
│   ├── components/         primitives.tsx + variants.ts
│   ├── dashboard/          DataTable, Sections, editor
│   ├── data/*.json         built-in catalogue
│   ├── i18n.ts             every UI string, both languages
│   ├── content.ts          merge rules for operator + built-in content
│   ├── build.ts            catalogue indexes + formatters
│   ├── data.ts             typed access to data/*.json
│   ├── links.ts            cardLink(): the only sanctioned scraped href
│   ├── images.ts           local asset registry (img())
│   ├── SiteChrome.tsx      header, footer, nav
│   ├── *.shared.ts         types crossing a server boundary
│   ├── *.server.ts         cheerio parsers + fetch, server only
│   └── *.functions.ts      createServerFn wrappers
├── components/ui/          shadcn-generated primitives (app shell only)
├── integrations/supabase/  client, client.server, auth-middleware, generated types
├── lib/                    cn(), error capture/reporting
├── test/                   Vitest suites + setup
└── router.tsx, server.ts, start.ts, routeTree.gen.ts
```

## Route conventions

`$lang` is the only top-level page prefix: `beforeLoad` throws `notFound()` unless
the segment is exactly `en` or `ar`, sets `dir` on a wrapper element and mirrors it
onto `<html>` after hydration, and renders `SiteHeader`/`SiteFooter` (skipped for
the dashboard, which supplies its own chrome).

A route file should do four things and stop: read params, read search params, call
a query or server function, render a page component. Anything that looks like a
filter, a sort, a merge, or a class string belongs one layer down.

`src/routeTree.gen.ts` is committed and imported directly. Adding, renaming or
deleting a route file means regenerating it (`bun run build` does) and committing
the result, otherwise production breaks while dev looks fine — that is exactly the
drift `Web CI` fails on.

## Data fetching

Public data comes from three places, described in
[architecture.md](architecture.md#data-flow). Components never call Supabase or
`fetch` themselves; they read TanStack Query options (`managedContentOptions`) or
a server function that a route/loader started. Server functions are declared in
`*.functions.ts` with an explicit method (`GET` for reads, `POST` for writes) and
a zod validator on write inputs.

Identity changes drive cache correctness: `__root.tsx` subscribes to
`onAuthStateChange` and calls `router.invalidate()` on `SIGNED_IN`, `SIGNED_OUT`
and `USER_UPDATED`, plus `queryClient.invalidateQueries()` for anything that is
not a sign-out.

## Styling and copy

Do not read this file for styling rules — read
[design-system.md](design-system.md). The one-line version: colours, radii,
shadows and sizes come from `src/theme/`, repeated class strings come from
`components/variants.ts`, markup comes from `components/primitives.tsx`, strings
come from `i18n.ts`, and layout uses logical properties because Arabic is a
first-class edition, not a translation bolted on.

## Environment

`elcinema/.env` is git-ignored; [`.env.example`](../elcinema/.env.example) is the
documented shape. Only publishable/anon values may appear in a `VITE_` variable —
anything prefixed `VITE_` is in the browser bundle. `SUPABASE_URL` and
`SUPABASE_SECRET_KEY` are read server-side only. See
[SECURITY.md](../SECURITY.md) for the rotation rule if a value was ever committed.

## Current debt

Honest list of places where the code does not yet match the layering above; each
is tracked as a task, not a rumour.

- `content.ts` (460 lines) mixes row types, mappings, merge rules and query
  options. Split along the port/adapter lines in [architecture.md](architecture.md#layers).
- `live.server.ts` (602 lines) holds seven parsers plus the fetch/cache layer in
  one module.
- `dashboard/editor.tsx` (713 lines) is one component doing form state, validation
  and writes; writes currently bypass the guarded server function.
- `ui.tsx` duplicates primitives that now live in `components/primitives.tsx` and
  should be deleted once call sites migrate.
- Roughly eighteen local string dictionaries and ~44 inline `lang === "ar"`
  ternaries remain; `i18n.ts` exists and they have not all moved to it.
- The `search` route ignores `q` when merging results (correctness bug).

See [../CHANGELOG.md](../CHANGELOG.md) for what changed most recently.
