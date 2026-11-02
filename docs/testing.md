# Testing

Vitest 4 with `jsdom`, Testing Library, globals enabled, setup in
[`src/test/setup.ts`](../elcinema/src/test/setup.ts), `@` aliased to `src`
([`vitest.config.ts`](../elcinema/vitest.config.ts)).

```sh
cd elcinema
bun run test          # once
bun run test:watch    # loop
bunx vitest run src/test/managed-content.test.ts   # one file
bunx vitest run -t "box office"                    # one case
bunx vitest run --coverage                          # when a coverage config exists
```

The acceptance gate is `bun run check` (format check → lint → typecheck → tests →
build), locally via
[`/scripts/check.sh`](../scripts/check.sh) and in CI as `Web CI`.

## What is covered

| Suite | Protects |
| --- | --- |
| [`elcinema-data.test.ts`](../elcinema/src/test/elcinema-data.test.ts) | The shipped catalogue: a real now/soon slate, every movie bilingual and complete, unique numeric work/person ids, **every poster and photo resolves in the local asset manifest**, real ratings and showtimes, 12-hour showtime formatting, the TV guide snapshot, the weekly box-office label, search returning numeric ids, legacy slug maps staying in sync. |
| [`managed-content.test.ts`](../elcinema/src/test/managed-content.test.ts) | The merge and duplicate rules in `content.ts` — precedence per collection, `m-` refs and field fallbacks, managed channels entering the grid, a managed box-office row overriding the scraped one, a duplicate channel name being skipped, search never listing a title twice, the homepage leading with managed content, and the built-in duplicate warnings the dashboard shows. |
| [`live-parser.test.ts`](../elcinema/src/test/live-parser.test.ts) | The cheerio parsers against stored fixtures: work page title/edition/year, poster, rating, votes, hidden synopsis continuation, credits as person refs, both showtime days, cast cards, videos, filmography without duplicate credits; video page embed + related, gallery sections. |
| [`home-parser.test.ts`](../elcinema/src/test/home-parser.test.ts) | Homepage parse: promo carousel, cinema movies with booking link, box-office table, lists table. |
| [`live-links.test.ts`](../elcinema/src/test/live-links.test.ts) | `cardLink()` keeps every elcinema path inside the app — works, people, booking, videos, watch-online, lineups, unknown paths — and only other-host links go external, in a new tab. |
| [`app-routing.test.tsx`](../elcinema/src/test/app-routing.test.tsx) | Route matching: `/` resolves, both language editions resolve for every public page, numeric-id detail routes match, legacy slug URLs still match. |

Parser tests are the reason scraping survives: each one feeds stored HTML and
asserts the typed result, so an elcinema.com markup change is a failing test rather
than a broken page in production.

## What is not covered

Stated plainly so nobody reads a green suite as full assurance.

- **Rendering.** No component renders to the DOM except the route-matching test. A
  layout regression, an RTL flip, or a theme-token mistake passes CI today.
- **Server functions and Supabase.** No test touches a real or mocked database;
  `getManagedContent`'s error handling and `saveManagedRow`'s validation are
  untested — exactly the areas in the security backlog.
- **Interaction.** Rails, the carousel, the guide's scroll behaviour, the theme
  toggle and the booking flow have no tests.
- **Styling contract.** Nothing asserts that a component avoided a literal colour
  or a physical direction property; it is a review rule
  ([design-system.md](design-system.md#adding-something-new)).
- **API.** `server-api/` has no code and no tests yet;
  `API CI (planned)` is a guard that passes until a project exists.

## What to test when you change something

| You changed | Add/adjust |
| --- | --- |
| A merge rule in `content.ts` | A case per precedence direction, and the duplicate case, in `managed-content.test.ts` |
| A parser in `*.server.ts` | A fixture-based assertion in the matching `*-parser.test.ts` — assert the field, not that the call returned |
| A scraped link's destination | `live-links.test.ts` |
| A route | `app-routing.test.tsx`, including the *other* language edition |
| A primitive or recipe | A render test with Testing Library; assert role/name/label, not class strings |
| An `i18n.ts` key | The type system catches a missing key; assert both languages are non-empty in a cheap table test |
| A server function | Unit-test validation and error mapping with an injected client; do not hit Supabase from CI |

## How to verify honestly

A passing build proves compilation, not correctness. Before saying "done":

1. `bun run check` green.
2. Run the app and look at **both** `/en` and `/ar`, in both themes, at a narrow
   width, with the keyboard — focus must be visible and nothing may scroll sideways.
3. Break something deliberately once (wrong precedence, missing label) and confirm
   a test or your own eyes catch it. If nothing does, the change is unverified.
4. For parsing changes, re-run against a live page once, out of band, so fixtures
   are not quietly diverging from reality.

Report failures and untested areas as they are. "Tests pass, rendering was not
checked" is a valid and useful statement; "it works" without looking is not.
