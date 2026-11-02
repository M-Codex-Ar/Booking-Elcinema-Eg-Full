# ADR 0003 — Live elCinema content is read server-side through parsers behind typed ports

Status: accepted (2026-11-02)

## Context

Much of the site's freshness — tonight's schedule, a film's showtimes, trailer
galleries — only exists on elcinema.com, which offers no API. The content is
bilingual, and the app must not leak the scraping mechanics, the upstream HTML, or
the fragility of that markup into its components.

## Decision

Scrape server-side only. Each source has three files:

- `*.shared.ts` — the port: the typed shape both sides agree on (`LiveWork`,
  `LiveVideoGallery`, `EcHomeData`, …).
- `*.server.ts` — the adapter: `fetch` plus cheerio parsers (`parseWorkPage`,
  `parseTvGuide`, …), never imported by a component.
- `*.functions.ts` — the boundary: `createServerFn({ method: "GET" })` wrappers
  (`getElcinemaHomeFn`, `getLiveWorkFn`, …) that routes and pages call.

Parsers are pure functions of `(html, lang, id)` so they can be tested against
stored fixtures without a network. Every href that comes out of a parser is
resolved by `cardLink()` — the only sanctioned way to navigate to an elcinema URL —
which maps known paths onto internal routes and allows only foreign hosts to leave
the app, in a new tab.

## Consequences

- The browser never receives upstream HTML, and a markup change cannot inject
  markup into a page.
- A parser fix touches one file and one fixture; components are untouched because
  they depend on the port, not the HTML.
- Tests are meaningful and offline
  ([testing.md](../testing.md#what-is-covered)).
- Real cost: scraping is on the request path, so upstream latency and outages are
  user-visible, and an undetected markup change means an empty rail rather than a
  failing build. This is the main thing
  [backend.md](../backend.md#what-it-takes-over-and-in-what-order) Phase 2 removes
  by turning scraping into a scheduled ingestion job.
- `cardLink()`'s allow-list must be extended when elcinema.com adds a path type;
  forgetting it degrades to an external link, which is safe but wrong. The link
  tests cover the known shapes.
- Scraped content is third-party data. It is displayed and linked, not republished
  as our own, and titles/synopses stay attributed as they arrive.
