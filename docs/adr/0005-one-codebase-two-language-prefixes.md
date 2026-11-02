# ADR 0005 — One codebase, two editions addressed by a URL language prefix

Status: accepted (2026-11-02)

## Context

Arabic is a first-class edition, not a runtime translation of an English site: it
reverses layout, uses its own type face, and the upstream source exposes
`/ar/`-specific titles and dates. Options were a duplicated app, a single app with
a language cookie, or one app with the language in the path.

## Decision

One codebase; the language lives in the URL as `/$lang` (`/en/now`, `/ar/now`),
validated in `$lang.tsx`'s `beforeLoad` (anything but `en`/`ar` is `notFound`).
That layout route sets `dir` on a wrapper element, mirrors it onto `<html>` after
hydration, and renders the shared header and footer.

Consequences for code:

- Layout uses CSS **logical properties** (`ms-`, `me-`, `start-`, `end-`,
  `text-start`) so one stylesheet serves both directions, with `rtl:` variants for
  the cases logic cannot express.
- Domain text travels as a `Bi` value (`{ en, ar }`) inside the data and the ports;
  UI text travels as a key in `COPY` and is resolved by `makeT(lang)`
  ([design-system.md](../design-system.md#copy)).
- Scraped requests ask the source for the matching edition, and `cardLink()` keeps
  the language prefix on internal navigation.

## Consequences

- Both editions are separately cacheable, indexable and linkable, and a language
  switch is a plain navigation — no re-auth, no hydration mismatch from a cookie
  read on the server.
- `routeTree.gen.ts` carries `$lang`, so every route exists twice by construction;
  forgetting the prefix in a hand-written link is a 404, which `app-routing.test.tsx`
  checks for both editions.
- Inline `lang === "ar" ? … : …` in JSX would let one edition drift unnoticed, so it
  is banned in favour of `COPY`; the remaining inline ternaries are listed as debt in
  [frontend.md](../frontend.md#current-debt).
- Physical direction properties (`ml-`, `left-`) compile and look right in English,
  then misplace elements only in Arabic — which is why the rule is a review blocker
  rather than a style preference, and why the global focus ring is defined once in
  `base.css` instead of per component.
- No machine translation is implied: an empty `*_ar` column falls back to the
  English value rather than shipping a guess.
