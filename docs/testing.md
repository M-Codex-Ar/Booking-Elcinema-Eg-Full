# Testing

Vitest 4 with `jsdom`, Testing Library, globals enabled, setup in
[`src/test/setup.ts`](../elcinema/src/test/setup.ts), `@` aliased to `src`
([`vitest.config.ts`](../elcinema/vitest.config.ts)).

```sh
cd elcinema
pnpm run test          # once
pnpm run test:watch    # loop
pnpm exec vitest run src/test/managed-content.test.ts   # one file
pnpm exec vitest run -t "box office"                    # one case
pnpm exec vitest run --coverage                          # when a coverage config exists
```

The acceptance gate is `pnpm run check` (format check → lint → typecheck → tests →
build), locally via
[`/scripts/check.sh`](../scripts/check.sh) and in CI as `Web CI`.

## Production browser smoke tests

`elcinema/tests/production/public-pages.test.ts` contains short, read-only
TestDriver checks against the public production English homepage and Arabic FAQ.
They do not sign in or submit forms. The SDK and its lockfile are isolated in
`elcinema/tests/production/` so the app's normal install does not depend on the
hosted browser toolchain. These tests are separate from the normal CI gate.

Run the following from Linux, macOS, or WSL. The SDK archive currently contains
a colon-named path that Windows cannot extract.

```sh
cd elcinema
pnpm --dir tests/production --ignore-workspace install --frozen-lockfile
TD_API_KEY="your-testdriver-api-key" pnpm run test:e2e
```

The command fails early with setup guidance when `TD_API_KEY` is missing. These
hosted browser runs may consume TestDriver account usage; run them intentionally
and never commit the key.

## What is covered

| Suite                                                                                           | Protects                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`elcinema-data.test.ts`](../elcinema/src/test/elcinema-data.test.ts)                           | The shipped catalogue: a real now/soon slate, every movie bilingual and complete, unique numeric work/person ids, **every poster and photo resolves in the local asset manifest**, real ratings and showtimes, 12-hour showtime formatting, the TV guide snapshot, the weekly box-office label, search returning numeric ids, legacy slug maps staying in sync.                    |
| [`managed-content.test.ts`](../elcinema/src/test/managed-content.test.ts)                       | The merge and duplicate rules in `content.ts` — precedence per collection, `m-` refs and field fallbacks, managed channels entering the grid, a managed box-office row overriding the scraped one, a duplicate channel name being skipped, search never listing a title twice, the homepage leading with managed content, and the built-in duplicate warnings the dashboard shows. |
| [`managed-content-validation.test.ts`](../elcinema/src/test/managed-content-validation.test.ts) | Strict managed-row validation: unknown-column rejection, valid movie payloads, and invalid ranges, status values, URLs, schedule windows, IDs and table names.                                                                                                                                                                                                                     |
| [`auth.test.ts`](../elcinema/src/test/auth.test.ts)                                             | Trusted-role checks: editable user metadata cannot grant dashboard or content access; admin/editor/viewer capabilities stay distinct.                                                                                                                                                                                                                                              |
| [`live-parser.test.ts`](../elcinema/src/test/live-parser.test.ts)                               | The cheerio parsers against stored fixtures: work page title/edition/year, poster, rating, votes, hidden synopsis continuation, credits as person refs, both showtime days, cast cards, videos, filmography without duplicate credits; video page embed + related, gallery sections.                                                                                               |
| [`home-parser.test.ts`](../elcinema/src/test/home-parser.test.ts)                               | Homepage parse: promo carousel, cinema movies with booking link, box-office table, lists table.                                                                                                                                                                                                                                                                                    |
| [`live-links.test.ts`](../elcinema/src/test/live-links.test.ts)                                 | `cardLink()` keeps every elcinema path inside the app — works, people, booking, videos, watch-online, lineups, unknown paths — and only other-host links go external, in a new tab.                                                                                                                                                                                                |
| [`app-routing.test.tsx`](../elcinema/src/test/app-routing.test.tsx)                             | Route matching: `/` resolves, both language editions resolve for every public page, numeric-id detail routes match, legacy slug URLs still match.                                                                                                                                                                                                                                  |

Parser tests are the reason scraping survives: each one feeds stored HTML and
asserts the typed result, so an elcinema.com markup change is a failing test rather
than a broken page in production.

## What is not covered

Stated plainly so nobody reads a green suite as full assurance.

- **Rendering.** No component renders to the DOM except the route-matching test. A
  layout regression, an RTL flip, or a theme-token mistake passes CI today.
  `scripts/responsive-audit.mjs` (below) measures real rendering in a real browser, but
  it is run out of band — it needs a Chrome with a debugging port and the dev server, so
  it is not wired into `Web CI`.
- **Server functions and Supabase.** `getManagedContent` network failures are not integration-tested.
  RLS behavior has a pgTAP regression suite at
  `elcinema/supabase/tests/0003_staff_authorization.test.sql` and requires local Supabase services.
- **Interaction.** Rails, the carousel, the guide's scroll behaviour, the theme
  toggle and the booking flow have no tests.
- **Styling contract.** Nothing asserts that a component avoided a literal colour
  or a physical direction property; it is a review rule
  ([design-system.md](design-system.md#adding-something-new)).
- **API.** `server-api/` has no code and no tests yet;
  `API CI (planned)` is a guard that passes until a project exists.

## What to test when you change something

| You changed                                               | Add/adjust                                                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| A merge rule in `content.ts`                              | A case per precedence direction, and the duplicate case, in `managed-content.test.ts`                       |
| A parser in `*.server.ts`                                 | A fixture-based assertion in the matching `*-parser.test.ts` — assert the field, not that the call returned |
| A scraped link's destination                              | `live-links.test.ts`                                                                                        |
| A route                                                   | `app-routing.test.tsx`, including the _other_ language edition                                              |
| A primitive or recipe                                     | A render test with Testing Library; assert role/name/label, not class strings                               |
| A page's sizing, a shared utility or a control's hit area | `elcinema/scripts/responsive-audit.mjs` at 360/768/1440, both editions and both themes (see below)          |
| An `i18n/` key                                            | The type system catches a missing key; assert both languages are non-empty in a cheap table test            |
| A server function                                         | Unit-test validation and error mapping with an injected client; do not hit Supabase from CI                 |

## How to verify honestly

A passing build proves compilation, not correctness. Before saying "done":

1. `pnpm run check` green.
2. Run the app and look at **both** `/en` and `/ar`, in both themes, at a narrow
   width, with the keyboard — focus must be visible and nothing may scroll sideways.
3. Break something deliberately once (wrong precedence, missing label) and confirm
   a test or your own eyes catch it. If nothing does, the change is unverified.
4. For parsing changes, re-run against a live page once, out of band, so fixtures
   are not quietly diverging from reality.

Report failures and untested areas as they are. "Tests pass, rendering was not
checked" is a valid and useful statement; "it works" without looking is not.

## Responsive and RTL audit

Eyeballing one page at one width is how an overflow bug ships.
`elcinema/scripts/responsive-audit.mjs` drives a Chrome over the DevTools Protocol
(Node's own `fetch`/`WebSocket`, so no dependency is added) and, for every route ×
width × theme, measures:

- document scroll width against the viewport — the sideways scroll a thumb has to fight;
- elements outside the viewport with no scroller that reaches them (children of an
  `overflow-x: auto|scroll` box are excluded, because those are reachable on purpose);
- content clipped by a non-visible `overflow-x` — a bug for a heading, expected for a
  `truncate` span or a rail, so this column is read rather than asserted;
- interactive targets under 40×32 CSS px.

```sh
chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp-dir> &
pnpm run dev:web             # the Nitro build cannot be previewed, so measure the dev server
node scripts/responsive-audit.mjs --base http://localhost:4360 \
  --widths 360,768,1440 --theme dark,light --shots
```

Screenshots and `report.json` land in `--out` (`./audit`), and the script exits `1` when
a document scrolls sideways, when something sits off-screen, or when a page could not be
measured at all — a gate, not a suggestion. `--settle` matters: the dev server
occasionally re-optimises dependencies and reloads mid-run, which the script retries
before calling a page broken.

The dashboard is behind Supabase auth and the harness cannot log in, so its layout is
reviewed statically against the same rules (hit areas, `dialog-scroll`, no fixed pixel
widths in a wrapping row). Say that in the review instead of implying it was measured.
