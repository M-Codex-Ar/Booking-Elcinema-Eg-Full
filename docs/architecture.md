# Architecture

## What the system is

A bilingual (English/Arabic) cinema guide with an operator dashboard. The public
application is one TanStack Start deployment; its content comes only from the
committed catalogue and optional Supabase `managed_*` rows.

```text
Browser (EN / AR)
       │
       ▼
elcinema/ — TanStack Start (SSR)
       ├── committed JSON catalogue and local artwork
       └── server functions ── Supabase auth + managed_* tables
```

There is no runtime request, scraper, or content edge to the source website.
User-supplied managed media URLs are rejected if they point to that retired host.

## Layers

| Layer | Lives in | Owns | Must not know |
| --- | --- | --- | --- |
| Route | `elcinema/src/routes/` | URL params and data loading | Formatting, filtering, merge rules |
| Page | `elcinema/src/pages/` | Screen composition | Direct table access |
| Primitive | `elcinema/src/components/` | Reusable markup and variants | Data source |
| Recipe | `elcinema/src/elcinema/components/variants.ts` | Shared component styling | JSX |
| Token | `elcinema/src/theme/` | Colour, radius, shadow, size, motion | Feature markup |
| Copy | `elcinema/src/i18n/` | English and Arabic UI copy | Domain data |
| Merge | `elcinema/src/features/content/content.ts` | Catalogue + managed precedence and IDs | Rendering |
| Data access | `*.functions.ts`, `content.functions.ts` | Supabase and local view-model functions | Page markup |

Public pages never query `managed_*` directly. `content.ts` owns precedence,
deduplication, and `m-` IDs for operator rows. Catalogue pages remain usable when
Supabase is unavailable.

## Content sources

1. **Built-in catalogue:** `elcinema/src/data/*.json`, imported through
   `lib/data.ts` and indexed by `lib/build.ts`. This is the offline floor.
2. **Operator content:** Supabase `managed_*` tables, read through
   `getManagedContent` and merged in `features/content/content.ts`.

Public navigation resolves to local routes. External links are limited to
operator-approved providers and social destinations; the retired content host is
not an artwork, page, or navigation source.

## Rendering and boundaries

TanStack Start renders pages on the server and hydrates browser interactions.
Language is part of the URL (`/en/now`, `/ar/now`). The frontend never receives a
service-role key; operator writes use auth-guarded server functions. See
[database.md](database.md), [design-system.md](design-system.md), and
[ADR 0006](adr/0006-local-catalogue-only-no-runtime-scraping.md).

The ASP.NET Core project remains documentation-only until the owner approves an
implementation phase. Its future scope must preserve this local catalogue floor;
it does not imply a return to on-demand scraping.
