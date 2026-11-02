# Architecture

## What the system is

A bilingual (English/Arabic) cinema information site for the Egyptian market, in
the shape of elCinema: what's showing, coming soon, box office, tonight's TV
guide, trailers, VOD and lineups — plus an operator dashboard for curated
content. It is one deployable web application today and a two-part full-stack
system by design.

```
                         ┌──────────────────────────────────────┐
  Browser (EN / AR) ───▶ │ elcinema/  TanStack Start (SSR)      │
                         │  routes → pages → primitives         │
                         └───────┬───────────────────┬──────────┘
                                 │ server functions  │ static JSON
                                 ▼                   ▼
                     ┌────────────────────┐  ┌───────────────────┐
                     │ Supabase           │  │ elcinema.com      │
                     │ auth + Postgres +  │  │ (scraped, read    │
                     │ managed_* tables   │  │  only, server-side)│
                     └────────────────────┘  └───────────────────┘
                                 ▲
                     (planned)   │  replaces both edges above
                     ┌───────────┴───────────┐
                     │ server-api/ ASP.NET   │  typed endpoints, caching,
                     │ Core + EF Core        │  ingestion instead of scraping
                     └───────────────────────┘
```

## Layers

The frontend is layered so that each layer depends only on the one below it. This
is the target shape the refactor is converging on; a few modules still carry more
than one role and are listed honestly in
[frontend.md](frontend.md#current-debt).

| Layer | Lives in | Owns | Must not know |
| --- | --- | --- | --- |
| Route | `elcinema/src/routes/` | URL ↔ params ↔ which page renders | Formatting, filtering, merging |
| Page | `elcinema/src/elcinema/pages/` | Composing a screen from data + primitives | Fetch strategies, CSS literals |
| Primitive | `elcinema/src/elcinema/components/` | Re-usable markup with `cva` recipes | Where its data comes from |
| Recipe | `elcinema/src/elcinema/components/variants.ts` | Every repeated class string | JSX |
| Token | `elcinema/src/theme/` | Colour, radius, shadow, size, motion, `@utility` | Component names |
| Copy | `elcinema/src/elcinema/i18n.ts` | UI strings, both languages | Domain data |
| Query/merge | `elcinema/src/elcinema/content.ts` | Combining operator content with the catalogue | Rendering |
| Port | `*.shared.ts` | Types both sides of a server boundary agree on | Implementation |
| Adapter | `*.server.ts`, `content.functions.ts` | Supabase, cheerio scraping, caching | The UI |

The dependency rule is one-directional: `routes → pages → components → theme`.
Nothing under `components/` or `theme/` imports Supabase, cheerio, or a page.

## Data flow

Three sources, one merge point.

1. **Built-in catalogue** — `elcinema/src/elcinema/data/*.json` (movies, people,
   genres, TV guide, box office) imported through `data.ts` and shaped by
   `build.ts`. Static, versioned with the app, zero latency, always available.
2. **Operator content** — the `managed_*` tables in Postgres, read by the
   `getManagedContent` server function and shared through TanStack Query
   (`managedContentOptions`). One read, many pages.
3. **Live elCinema pages** — scraped server-side with cheerio and exposed as
   server functions (`getElcinemaHomeFn`, `getLiveWorkFn`, …). The HTML never
   reaches the browser; only parsed, typed objects do.

Public pages must not query `managed_*` directly. `content.ts` is the only place
that decides precedence, dedupe and ID namespacing (`managedRef()` prefixes
operator rows with `m-` so they cannot collide with catalogue slugs). The rules
themselves are documented in [database.md](database.md#merge-rules).

Rendering is server-side: TanStack Start emits HTML on the server, hydration
attaches interactivity, and language lives in the URL (`/en/now`, `/ar/now`) so
both editions are separately cacheable and indexable.

## Boundaries and why they sit here

**Scraping stays server-side and behind a port.** elCinema markup is not a
contract; it changes without notice. Keeping cheerio in `*.server.ts` behind
`*.shared.ts` types means a parser fix cannot leak into components, and replacing
scraping with an ingestion job later changes one adapter, not sixteen call sites.
See [ADR 0003](adr/0003-scraped-content-is-read-through-server-functions.md).

**Supabase is the current system of record, deliberately.** Auth, Postgres and
row-level security already give the dashboard a backend. The ASP.NET Core API is
planned to take over content serving, caching and ingestion — not to re-implement
login on day one. The staged plan is in [backend.md](backend.md).

**Styling has exactly one spelling layer.** `theme/` defines tokens,
`components/variants.ts` defines recipes, `components/primitives.tsx` defines
markup. A feature component may compose and pass `className`, but may not
introduce a raw colour. That is what makes the two themes and both directions
cheap to maintain — see [design-system.md](design-system.md).

## Planned target state

When `server-api/` exists, the shape becomes:

```
elcinema/ ──HTTP──▶ server-api/ ──▶ Postgres (content) + object store (artwork)
                        ▲
                        └── ingestion workers (replace on-demand scraping)
```

The contract is fixed in [api-contract.md](api-contract.md) before any code is
written, so the frontend can be migrated endpoint by endpoint instead of in one
rewrite. Supabase keeps auth until the API issues tokens the frontend accepts.

## Non-negotiables

Repeated here because they are architectural, not stylistic: the frontend never
receives a service-role key; scraped hrefs are only navigated through
`cardLink()`; operator writes go through the auth-guarded server function; and
published git history in `elcinema/` is never rewritten. Details in
[`/AGENTS.md`](../AGENTS.md) and [`/SECURITY.md`](../SECURITY.md).
