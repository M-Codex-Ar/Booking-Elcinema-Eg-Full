# Data and storage

Three kinds of content with three different lifetimes. Confusing them is the main
source of bugs in this codebase, so the distinction is stated first.

| Kind | Where it lives | How it changes | Read by |
| --- | --- | --- | --- |
| **Catalogue** | `elcinema/src/data/*.json`, committed | By pull request, with a release | `data.ts` → `build.ts` indexes; bundled with the app |
| **Operator content** | Supabase Postgres, `managed_*` tables | By an operator in the dashboard | `getManagedContent` server function, once per page tree |
| **Live elCinema content** | Nowhere durable — parsed per request from elcinema.com | Whenever elcinema.com changes | `*.server.ts` behind `*.functions.ts` |

The catalogue is the floor: the site renders fully with the database unreachable
and the scraper broken. That property is worth protecting — do not make a public
page depend on a live fetch to show something it already owns.

## Catalogue JSON

`movies.json`, `people.json`, `genres.json`, `tvguide.json`, `boxoffice.json`.
Bilingual strings appear as `{ "en": …, "ar": … }` and are typed as `Bi` on import
(`data.ts`). `build.ts` builds the lookup maps — `movieBySlug`, `movieById`,
`personBySlug`, `personById`, `personByName`, `nowPlaying`, `comingSoon` — plus the
formatters (`fmtClock`, `fmtClock12`, `fmtAirtime`, `dayLabel`) that are pure and
unit-tested.

## `managed_*` tables

Created by
[`drizzle/migrations/0001_create_managed_content_tables.sql`](../elcinema/drizzle/migrations/0001_create_managed_content_tables.sql);
`MANAGED_TABLES` in
[`content.functions.ts`](../elcinema/src/elcinema/content.functions.ts) is the
authoritative list the read endpoint iterates.

| Table | Columns that matter | Constraints |
| --- | --- | --- |
| `managed_movies` | `title_en`, `title_ar`, `genre`, `year`, `release_date`, `status`, `rating`, `runtime`, `cert`, `director_*`, `synopsis_*`, `poster_url` | `status IN ('now','soon')`; `id uuid` default `gen_random_uuid()` |
| `managed_people` | `name_en/ar`, `role_en/ar`, `bio`, `photo_url` | |
| `managed_boxoffice` | `title_en/ar`, `weekly_egp numeric(12,2)`, `total_egp`, `note` | |
| `managed_channels` | `name_en/ar`, `category` (default `general`), `logo_url` | |
| `managed_programs` | `channel_id → managed_channels(id)`, `title_en/ar`, `start_min`, `end_min`, `meta` | `start_min 0–1439`, `end_min 1–1440`, `end_min > start_min`, `ON DELETE CASCADE`, index `(channel_id, start_min)` |
| `managed_videos` | `title_en/ar`, `url` (not null), `thumb_url`, `duration` | |
| `managed_lists` | `title_en/ar`, `items jsonb` default `[]` | Free-form — the one table with no column-level shape |

Every table carries `created_at` / `updated_at timestamptz` defaults. `updated_at`
is **not** auto-maintained; a write path must set it, or the value lies.

### Row → domain mapping

`managedMovieToMovie()` and `managedPersonToPerson()` in
[`content.ts`](../elcinema/src/elcinema/content.ts) turn a row into a `Movie` /
`Person`. Rules: an empty `*_ar` falls back to the English value; numeric strings
are coerced with a default; `genre` splits into `genres[]`; a poster of `null`
falls back to the deterministic gradient (`hue`), never a broken image;
`slug`/`id` for operator rows comes from `managedRef(row)` = `m-${row.id}` so an
operator id can never shadow a catalogue slug on a detail route.

## Merge rules

The single place operator and catalogue content combine is
[`elcinema/src/elcinema/content.ts`](../elcinema/src/elcinema/content.ts). Pages
must not query `managed_*` themselves.

| Function | Precedence | Dedupe key |
| --- | --- | --- |
| `allMovies` | Catalogue first; a managed movie whose title matches a built-in one is **dropped**, keeping one detail page per film | normalised `title.en` |
| `mergedNowPlaying` | **Managed `now` entries lead**, then built-in — an operator addition appears immediately | first wins |
| `mergedComingSoon` | Managed `soon` lead for duplicate precedence, then re-sorted by release date | first wins, then `release` asc |
| `mergedBoxoffice` | **Managed rows lead** so a corrected figure overrides the scraped one | `title.en` |
| `mergedTvGuide` | Built-in lines first; managed channels appended only when the name is new and the channel has at least one program; grid window widens to cover managed slots | normalised channel name |
| `mergedSearch` | Managed people, movies and channels (built-in matches are filtered by the caller) | — |
| `mergedHomeData` | Managed content injected into the scraped home payload | — |

`dedupeByTitle` keeps the **first** occurrence, which is why the array order in
each function *is* the precedence rule. Changing the order silently changes which
source wins — the comments above each function are load-bearing.

`matchesBuiltinMovie()` / `matchesBuiltinPerson()` exist so the dashboard can warn
an operator before they create an entry that the merge will drop.

## Authorization today

`0001` enables row-level security on every `managed_*` table with two shapes:
`SELECT` for `anon` and `authenticated` (`using (true)`), and
`INSERT`/`UPDATE`/`DELETE` for `authenticated` (`with check (true)`).

That means **any signed-in user is staff.** It is not a subtle gap, and the public
read side is intended — the honest fix is a role or permission check, not a
tighter `USING` expression. Tracked as item 1 of the hardening backlog in
[SECURITY.md](../SECURITY.md#known-hardening-backlog); the target design is the
permission model in [api-contract.md](api-contract.md#admin-endpoints).

Until then, the frontend rule stands: dashboard writes go through the auth-guarded
server function, never the browser Supabase client.

## Validation

Write paths must validate before persisting. `saveManagedRow` is the intended
chokepoint; the current dashboard bypasses it, which is item 3 of the same
backlog. Required target rules, expressible in zod now and FluentValidation in the
API later:

- `title_en` non-empty; `title_ar` may be empty (falls back)
- `status` ∈ `now|soon`; `year` 1900–2100; `runtime` 1–600; `rating` 0–10
- `start_min`/`end_min` within range and `end_min > start_min` (the DB already
  enforces this — a rejected insert should surface as a form error, not a toast)
- `url` must parse as `https://`; `poster_url`/`thumb_url`/`logo_url` likewise
- Table name from an allow-list (`MANAGED_TABLES`), never free text

## Migrations

`drizzle/` is the migration source of truth; Supabase's own migration folder is
not used for these tables. `drizzle/schema.ts` is **intentionally empty** ("auto-
generated and intentionally left blank, do not edit") because the tables are
managed by hand-written SQL.

> **Hazard.** With an empty `schema.ts`, `drizzle-kit generate` diffs "no tables"
> against the last snapshot and emits a migration that drops everything it knows
> about. Never run `drizzle-kit generate`/`push` here unless you have read the
> generated SQL. Add migrations by hand, in numbered files, the way `0001` was.

`0000_migration.sql` is fully commented out with a note explaining that `0001`
replaces it — an old `managed_movies` shape that must not be applied. Leave it as
documentation.

## Planned changes

1. `updated_at` trigger, or explicit set on every write.
2. Role/permission column or a separate `staff` table, so RLS can express "is staff".
3. Replace `managed_lists.items jsonb` with a typed child table, or validate the JSON shape at the boundary.
4. Move ingestion output into real tables (`works`, `showtimes`, `videos`) so live content stops being re-scraped per request — see [backend.md](backend.md#what-it-takes-over-and-in-what-order).
5. Artwork in object storage with a recorded key, instead of arbitrary external URLs.
