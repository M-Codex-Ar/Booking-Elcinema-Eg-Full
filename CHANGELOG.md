# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Repository scaffold for the full-stack layout: root `README`, `AGENTS`, `CONTRIBUTING`,
  `SECURITY`, `CHANGELOG`, `.editorconfig`, root ignore rules, root `package.json` task runner.
- `.github/`: frontend CI workflow, backend CI template (disabled until code exists), issue and
  pull-request templates, `CODEOWNERS`, Dependabot for npm / NuGet / GitHub Actions.
- `docs/`: architecture, frontend, backend blueprint, API contract, design system, database,
  testing, operations and ADR-0001…0005.
- `scripts/`: `setup`, `dev`, `check` in both bash and PowerShell.
- Frontend design-token layer: `src/theme/tokens.css`, `src/theme/utilities.css`,
  `src/theme/base.css`, with `src/styles.css` reduced to an ordered entry point
  (`source(none)` plus an explicit `@source`).
- UI primitive layer: `src/elcinema/components/variants.ts` (cva recipes) and
  `src/elcinema/components/primitives.tsx` (layout, links, panels, pills, CTAs, artwork).
- Central bilingual copy: `src/elcinema/i18n/` with typed keys and `{placeholder}` interpolation.
- Token layer extended to match the supplied theme: `--radius` anchored at `0.75rem` with a
  `rounded-4xl` step, `--font-display` (`Exo` → `Cairo`), `--color-success` / `--color-gold`
  utilities and the `--sidebar-*` mappings.
- `elcinema/scripts/check-env.mjs`, wired into `bun run build`: a build that cannot resolve
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` now fails with the variable names instead
  of emitting a bundle that throws in the browser. `SKIP_ENV_CHECK=1` opts out (used by `Web CI`,
  which holds no Supabase values, so its artifact is compile-verified only).
- `elcinema/src/lib/supabase-env.ts`: `isSupabaseConfigured()` probes the same keys the generated
  client reads, so feature code can degrade instead of crashing; covered by
  `src/test/supabase-env.test.ts`.
- `elcinema/scripts/responsive-audit.mjs`: dependency-free Chrome-DevTools audit that measures
  every route × viewport × theme for sideways scroll, off-screen content and tap targets under
  40×32 px, writes screenshots and a JSON report, and exits non-zero on overflow. Driven by
  `bun run dev:web` plus a Chrome started with `--remote-debugging-port=9333`.

### Changed

- Dark and light palettes are now expressed once, and brand effects (glow, spotlight, pulse) are
  derived from `--primary`/`--gold` via `color-mix` instead of duplicated `oklch` literals.
- Re-skinned the cinema-night palette to the supplied sky-blue/gold theme (surfaces on hue 245,
  `--primary: oklch(0.695 0.133 232)`, `--accent: oklch(0.78 0.115 232)`, `--gold`, `--success`),
  and re-derived the matinee palette from the same hue so the two themes are one brand read
  differently. The light theme is not a copy of the dark values: `--primary`, `--gold` and
  `--success` are deepened for text-on-white contrast (see `docs/design-system.md`).
- `h1`–`h3` now use `--font-display`; the poster fallback hue default follows the brand hue, and
  the heading/`pill` recipes consume the new tokens instead of one-off amber literals.
- Global keyboard-focus styling, scroll-margin for the sticky header, and a
  `prefers-reduced-motion` reset moved into the base layer so every component inherits them.
- The footer copyright block now reads `© <year> elCinema` followed by the `footer.builtBy` line
  only; the "Copyright © Damlag S.A.E — sample replica for demo purposes" sentence and its
  now-unused `chrome.copyright` key were removed from both editions.

- Source architecture consolidated under the documented layering (`src/theme/`, `src/routes/`,
  `src/components/ui/`, `src/hooks/`, `src/lib/`, `src/integrations/` at the `src` root with the
  app itself in `src/elcinema/`). The duplicate `src/elcinema/i18n.ts` (shadowing `i18n/`) and the
  unused `src/elcinema/RouteState.tsx` state machine were deleted; `ui.tsx` `Na` now delegates to
  `AppLink` so there is one link implementation, and `PosterArt` delegates to `Artwork`.
- Live code brought in line with the house rules: the inline Arabic/English ternaries in
  `controls.tsx` and `auth.tsx` moved to `i18n/` keys (new `controls.*`, `common.backToSite`),
  the route loaders share one `asLang()` helper instead of repeating `params.lang === "ar" ? … : …`,
  `LiveError` reuses the shared `stateBlock` recipe with `common.couldntLoad` / `common.goHome`,
  and the renamed-but-not-called `.inputValidator(` helpers are now `.validator(` +
  `validator` at every call site. Test imports use the real module paths
  (`@/lib/supabase-env`, `@/elcinema/auth`) instead of integration stubs.
- `src/server.ts`, `src/start.ts` and `__root.tsx` read the Supabase config through
  `@/lib/…` aliases consistently.

### Removed

- 33 unused `src/components/ui/*` primitives (accordion, chart, form, calendar, drawer, …) that
  only re-exported Radix packages nothing imports, plus the `config.server`/ cron-auth helpers in
  `src/integrations/supabase/` that no server entry point referenced.
- Dead exports from `primitives.tsx` (`ArtBadge`, `ToggleChip`, `Cta`, `CtaLink`, `IconButton`,
  `StatePanel`, `OutboundLink`, `ScrapedLink`) and the orphan `cta` / `artBadge` recipes in
  `variants.ts`; `controls.tsx` chips now use the shared `chip` recipe.
- 29 unused dependencies from `elcinema/package.json` (command palette, drawer/datepicker,
  form stack, carousel, resizable panels and ~20 Radix wrappers); `bun.lock` regenerated.

### Fixed

- Text on brand fills: `--primary-foreground` / `--accent-foreground` now resolve to a navy
  `--brand-ink` (6.95:1 and 9.42:1) instead of near-white on bright blue (2.50:1 / 1.85:1, under
  AA even for large text) — this affects every `hover:bg-accent` menu row.
- Two conditional-hook violations in the `$lang.index` and `$lang.lineup.$id` routes: a
  `useSuspenseQuery` that sat behind an early return, and a detail route whose hook order changed
  with the list id. Both loaders now call their hooks unconditionally.
- Dashboard duplicate badges use the shared `pill` recipe (`tone="warning"`) with a real `title`
  instead of hard-coded amber class strings.
- `elcinema/README.md`: stale "Smart Data Explorer" title and a leftover scratch note
  removed; it now documents the actual stack, scripts and layout.
- Placeholder file `server-api/New Text Document.txt` removed; `server-api/` now carries its
  implementation brief.
- An env-free build no longer blanks the site. Previously a bundle built without
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` threw
  "Missing Supabase environment variable(s)" on every page: `src/start.ts` registered
  `attachSupabaseAuth` as a global server-function middleware, so even the homepage loader's
  server functions faulted during SSR, on top of the auth subscription in `__root.tsx`. The
  middleware is now skipped when the client cannot be built, the root and site-chrome session
  listeners no-op, and the sign-in, register and password forms report `auth.notEnabled`. Public
  catalogue pages render in both languages and both themes; only authentication is unavailable.
- `docs/operations.md` named `SUPABASE_SECRET_KEY`, which no code reads; the service-role
  variable is `SUPABASE_SERVICE_ROLE_KEY` (`scripts/seed-admin.mjs`).
- Phone-width pages no longer run off the screen. The bilingual shell stacks pages inside a
  _column_ flex container, where a centred `mx-auto max-w-*` section has an indefinite cross
  size and resolves to `max-content`: at 360px every section became a desktop-width page,
  `overflow-x-clip` hid the tail, rails never scrolled inside their own box, and in Arabic the
  page landed mostly off-screen (measured on `/ar` at 390px: a section spanning −920..360). The
  new `page-flow` utility in `src/theme/utilities.css`, applied to the `$lang.tsx` shell and the
  `Page` primitive, pins those children to `max-inline-size: 100%`.
- Dialogs that are taller than the viewport are now scrollable. `AuthDialog` (register mode with
  its confirm fields, or any dialog on a phone in landscape) and both dashboard dialogs used
  `overflow-hidden` on a fixed layer over a page that cannot scroll, so the submit button was
  unreachable; they now use `dialog-scroll` (`max-block-size: 85vh` with `overflow-y: auto`).
- Touch targets raised to a thumb-sized scale: hero carousel dots were 28×32, rail arrows 32×32,
  header login/search/language/theme buttons 32–36 and the list-editor "remove movie" button was
  a 12×12 icon. Icon controls are now 40×40 under `sm` and 36 from `sm` up, a rule carried by the
  `iconAction` recipe so `IconButton` inherits it; the dashboard channel picker went from a fixed
  `w-64` to full width on a phone, and its list chips truncate instead of pushing the dialog
  sideways.
- The site menu dropdown was two columns at `min(92vw, 26rem)` on a phone — about 150px per
  column, which wrapped Arabic labels mid-phrase. It is one column until `sm`.
- Direction-free arrows now mirror. `← Back`, `More info →`, `IMDB Page →` and the booking CTAs
  were literal glyphs that keep pointing west in the Arabic edition; they are lucide
  `ArrowLeft`/`ArrowRight` with `rtl:rotate-180` now, and the hero scrim moved from a
  `bg-gradient-to-r rtl:bg-gradient-to-l` pair in the component to the `scrim-start` utility.
- Sub-token text sizes replaced: `text-[10px]` / `text-[11px]` literals became the `text-micro`
  and `text-meta` steps on home, videos, watch-online, booking and the live detail pages, and the
  TV guide page's duplicate filter input now uses the shared `FilterInput`.

### Known issues

See the hardening backlog in [SECURITY.md](SECURITY.md) and the page-by-page migration plan in
[docs/design-system.md](docs/design-system.md#migration-status).

## [0.1.0]

### Added

- `elcinema/`: bilingual public site (now playing, coming soon, TV guide, box office, booking,
  videos, watch-online, featured lists, search), operator dashboard with managed-content CRUD,
  Supabase auth, Drizzle migrations for the `managed_*` tables, and scraper/parsers with
  fixture-based tests.
