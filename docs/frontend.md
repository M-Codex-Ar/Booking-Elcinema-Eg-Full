# Frontend — `elcinema/`

TanStack Start 1.168 (SSR + server functions) · TanStack Router 1.170 + Query ·
React 19 · Tailwind CSS v4 · Supabase JS · Vite 8 + Nitro (Cloudflare target) ·
Vitest 4 · ESLint 9 + Prettier · TypeScript strict.

## Commands

Run from `elcinema/` (or `npm run <script>:web` from the repository root):

| Command                            | What it does                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm install`                     | Install dependencies (`pnpm-lock.yaml`; `pnpm-workspace.yaml` enforces a 24-hour supply-chain age guard). |
| `pnpm run dev`                     | Vite dev server; it prints its own URL (the Lovable plugin sets host/port/strictPort).                    |
| `pnpm run build`                   | Type-free production build through Nitro, output in `.output/`.                                           |
| `pnpm run preview`                 | Serve the built output locally.                                                                           |
| `pnpm run lint`                    | ESLint over the whole project.                                                                            |
| `pnpm run format` / `format:check` | Prettier write / verify.                                                                                  |
| `pnpm run typecheck`               | `tsc -p tsconfig.json --noEmit`.                                                                          |
| `pnpm run test`                    | Vitest once; `test:watch` for the loop.                                                                   |
| `pnpm run check`                   | The gate: format check, lint, typecheck, tests, build.                                                    |

[`/scripts/check.sh`](../scripts/check.sh) wraps the same gate and adds the
committed route-tree freshness check that CI enforces.

## Module map

```
src/
├── app/                    TanStack Start entry points (server, start, router)
├── theme/                  tokens.css, utilities.css, base.css (the design system)
├── routes/                 file-based routes; thin wiring only
│   ├── __root.tsx          <html>, document head, theme flash guard, QueryClientProvider
│   ├── index.tsx           / → /en
│   ├── $lang.tsx           language shell: dir/lang, header, footer
│   ├── $lang.*.tsx         public pages (now, soon, boxoffice, tvguide, search, video, vod, lineup, booking, person, work)
│   ├── auth.tsx            operator sign-in (self sign-up is disabled on purpose)
│   ├── reset-password.tsx
│   └── _authenticated/    dashboard, guarded by the auth route
├── components/
│   ├── ui/                shadcn primitives consumed by the app shell + dashboard
│   ├── shared/            primitives.tsx (markup) + variants.ts (class recipes) + controls, ui facade, TvGuide
│   ├── cinematic/         Legacy first-load overlay components; not mounted by the public app
│   └── layout/            SiteChrome, SiteMenu, ThemeToggle
├── features/
│   ├── auth/              auth.ts helpers + AuthDialog
│   ├── content/           content.ts merge rules + content.functions.ts
│   ├── home/              local catalogue view-model function
│   ├── live/              shared media/UI helpers for catalogue-backed pages
│   └── dashboard/         DataTable, Sections, editor
├── pages/                 one file per screen
├── i18n/                  every UI string, both languages (index.ts + en/ + ar/)
├── data/*.json            built-in catalogue
├── lib/                   build.ts, data.ts, images.ts, links.ts, media.shared.ts, cn(), error capture/reporting, supabase-env
├── utils/                 slug.ts (and other small helpers)
├── services/clients/supabase/  client, auth-attacher, auth-middleware, generated types
├── hooks/                 use-mobile.tsx; use-app-ready.ts remains for the legacy loader
├── test/                  Vitest suites + setup
├── assets/                bundled images
└── router.tsx is now under app/; routeTree.gen.ts stays at src root
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
deleting a route file means regenerating it (`pnpm run build` does) and committing
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

Managed rows are optional additions to the built-in catalogue. On the homepage,
they load after the initial SSR response. The seven public table reads run
concurrently under one 5s total deadline; a timeout aborts outstanding reads
and returns empty additions. The server caches populated results for 30 seconds
per runtime instance and serves stale data while refreshing; empty results are
cached for 5 seconds. Managed-content writes invalidate the local cache. The
shared query does not retry because every public page already has a built-in
fallback, so a database slowdown cannot hold the page open for repeated attempts.

## First load

The public page renders immediately; no splash overlay waits for hydration. The
header mark has a small CSS-only reveal on the first load in a tab session. An
inline, storage-guarded script sets the initial state before styles are applied;
the page content and hero image stay visible and are never animated behind the
reveal. Reduced-motion users see the final brand state immediately. Repeating
marquees pause outside the viewport and when reduced motion is requested.

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
- Public pages now use committed catalogue JSON and managed rows only. Unknown
  detail IDs render a local not-found state; no page loader fetches upstream HTML.
- `dashboard/editor.tsx` (713 lines) is one component doing form state, validation
  and writes; writes currently bypass the guarded server function.
- `ui.tsx` remains the page-facing shorthand layer (`Na` delegates to
  `AppLink`, `PosterArt` to `Artwork`, plus rail/poster/date helpers); the
  second implementations are gone — only the aliasing remains.
- Local string dictionaries are gone from `controls.tsx`, `live-ui.tsx`,
  `SiteChrome.tsx` and the `auth`/lineup routes; route-level language
  coercion now funnels through `asLang()` / `rowTitle()`. The dashboard's
  local copy helper (`pages/Dashboard.tsx` `L()`) and a handful of chrome
  ternaries remain; `i18n/` exists and they have not all moved to it.
- The `search` route ignores `q` when merging results (correctness bug).

See [../CHANGELOG.md](../CHANGELOG.md) for what changed most recently.

# Navigation and catalogue filters

`SiteMenu` and the desktop section menus use the same translated `NAV_GROUPS`
route map. The compact menu is hidden at the desktop navigation breakpoint,
while search and authentication each have a single header entry point per
viewport. Search form submissions navigate through TanStack Router so route
data and transitions remain client-side.

Catalogue filters expose their active count and a clear action through the
shared `ActiveFilters` control. Genre chips are limited to keys with bilingual
labels in the genre catalogue, and TV guide category copy lives in `i18n/`.
