# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/compare/unified-control-center-0.1.0...unified-control-center-0.2.0) (2026-11-04)


### Features

* Add FAQ page, static page layouts, contact form, and internal routing ([725b3e8](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/725b3e8cbc20aad01fea0b50615425ffca00e5e7))
* Add FAQ page, static page layouts, contact form, and internal routing ([fadc7f5](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/fadc7f587c2418e4c3bb303ccf7774186d127d0c))
* **assets:** mirror TV guide channel logos, recover local artwork ([2b544c9](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/2b544c9df414ad9c24eac11e5a50a3df19dcad48))
* **auth:** add Supabase role-based auth, admin seed, slug system and responsive layout ([4d48904](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/4d489047ab30807912fc93befc7dda160b51d57d))
* **chrome:** related account menu + open-state menu icons ([96af055](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/96af055f1a95faed4f892fc9db1c226a6b094cdd))
* **content:** prefer managed (DB) entries in allMovies; drop invalid @supabase/cli dep ([37a982b](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/37a982b1209e22e52de3b7742d97b1b30ed353e3))
* **home:** autoplay the Cinemas of the Region carousel ([7d1db04](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/7d1db04bf89a181a1fc003c170dde18bb3c836db))
* **home:** Cinemas of the Region flag coverflow under Now in Cinemas ([ee64116](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/ee6411681da266616668a54ac08d819004cbf95b))
* **live:** open the real cinema ticket service from work-page CTAs ([b0c02a8](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/b0c02a8d1560a3dc07d99bdd926d2770a082f93d))
* modular bilingual i18n and Cinemas of Region marquee slider ([7cec7d0](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/7cec7d082b3f4b6a77dbc1bb305b0ff369ace524))
* **static:** scrape real elcinema.com content pages into the generic StaticPage ([4d149fc](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/4d149fcc278e20409f24eab1b8c3e7b0647d393b))
* Supabase role-based auth, admin seed account, centralized slugs, and responsive layout ([89c61a1](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/89c61a145cf6c1c175e16a7130db169795dd387c))
* **theme:** one grid system for every page — unified spacing, no dead space ([9994639](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/999463972e16d5895012c37224a831ad3128c5a8))
* **tvguide:** add URL-driven pagination and remove inline copy ([3114fe4](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/3114fe40975b1920364a097b850a19acb9bcac8c))


### Bug Fixes

* **auth:** bilingual error mapping for the sign-in 400s ([bd2c3f5](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/bd2c3f5415d69b722f2c1075e0976be1a0119577))
* **auth:** email-confirmation redirect to the live origin + expired-link toast ([a8f23ff](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/a8f23ffa413eca2bed774a31dc2c37464fde7ee6))
* **auth:** remove email-based admin backdoor and tighten claim checks ([7b6e7e6](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/7b6e7e614a50dfad1636fcb381fcd6b02d1e210b))
* **auth:** repair auth forms and dialog scrolling ([5d63397](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/5d63397b8c8991581911b469b77dff6f57faba5b))
* **auth:** require configured Supabase for deploys ([5fe59b0](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/5fe59b01f686ed01bd9bdc1d5a9c8b52e64f161e))
* **booking:** render the movie poster at every screen size on the booking page ([2df4b2e](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/2df4b2e9e127608e8b60362c37981e932010f5eb))
* **boxoffice:** top 5 on home, full list on the page ([de11224](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/de1122465694c507aee963a70adf5a9855d45a17))
* clean up merged genre imports ([c8fd8c0](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/c8fd8c0551ff609fff076ed831e20a44cd8fc21f))
* **deploy:** allow Vercel production build to warn when Supabase env vars are pending ([3237933](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/3237933c10ebeb78196a8c92d0b155b1bf0b150f))
* **elcinema:** drop the demo-replica sentence from the footer ([9af4353](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/9af4353a3755dc0eec66af53f206414b754f43d6))
* grant release please issue permissions ([64efd89](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/64efd89dbe2424f390db22a3c16d22f24553b1f4))
* import VodBadge in HomePage to fix reference error ([6ffe04f](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/6ffe04fede7146f73842a0cad50dcf6a694e2f3a))
* **loader:** order animation shorthand duration before the keyframe name ([bda3063](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/bda3063b3d7386d850fd72acf447fa538d57dace))
* reject inherited genre keys ([41d4830](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/41d4830941170cf4004a3d616bdde20252a2d258))
* **release:** grant Release Please required permissions ([5b7cc35](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/5b7cc353e95244050a867a93db393657cc8b755f))
* resolve navigation and catalogue audit issues ([30f81fc](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/30f81fc55240c7507b7db9c91988b30589c1b24e))
* **responsive:** refine mobile layout, RTL alignments, and environment check fallback ([15a38aa](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/15a38aad2381b1d244908b27141739945a60c623))
* **supabase:** stop an env-free build from blanking every page ([44e5bc9](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/44e5bc9b75071cddbeb7d76bc4b2f5d882a05691))
* **ui:** keep dialog scrollbars inside ([26b1f7a](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/26b1f7acfc9279ff4e9a44655bbe905b68bfa778))
* **ui:** make live cast rail navigable ([62ed678](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/62ed678b668ed8f96b6a2dead01065ff20dd8d04))
* **ui:** recoverable live errors, honest contact form, RTL static pages ([8fe67a1](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/8fe67a125ecea97a6cd4b96ae68465148c78f5e7))
* **ui:** scroll arrows render only for directions holding more content ([da31086](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/da3108686fb52a38159bb23cababf9139b30d473))
* **web:** reduce loading delays and align page backgrounds ([5eb3dc8](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/5eb3dc8a1397965d3a6704d24ca5cdf9623b2c02))
* **web:** reduce loading delays and align page backgrounds ([af521bb](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/af521bba82bb8652c95e239eb9cfa4fc35217301))


### Performance Improvements

* **bundle:** lazy-load the supabase stack off the first paint ([65981b3](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/65981b35ba3bf0f4ab0ee409f4881cf44d815cdd))
* **router:** intent preloading + pending shell; fix(contact): honest mailto form; fix(ui): recoverable live errors & RTL static pages ([d0a44db](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/d0a44dbb3a545b857d2931ca88d220dd8355f56a))
* **router:** preload routes on intent with branded pending shell ([bb811ee](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/bb811ee35722b07081ab4b62f9cdb1cbc2c0ce7b))
* tune TanStack Query cache defaults (staleTime/gcTime) ([f2a5fdc](https://github.com/M-Codex-Ar/Booking-Elcinema-Eg-Full/commit/f2a5fdc8721e93d11b352d6eb26930c374e3e6ee))

## [Unreleased]

### Changed

- Unified the desktop and compact navigation around one translated route map, removed repeated search/account entry points, and routed search submissions through TanStack Router to avoid full-page reloads.
- Added bilingual active-filter counts and clear actions across catalogue lists; validated genre chips against the translated genre catalogue and corrected TV guide category labels.
- Added pull request path labeling, Conventional Commit title validation, and Release Please automation for versioned changelog releases.

### Added

- Scraped static content pages from the live site: `parseStaticPage` / `getStaticPage` in
  `src/features/live/` (new `LiveStaticPage` / `LiveStaticSection` / `LiveStaticBlock` DTOs in
  `src/types/live.ts`), a cached `staticPageOptions` query and the generic `StaticPage` component
  now render the real About, Contact, Advertise and Privacy Policy copy from elcinema.com
  (About → `/<edition>/about_us/`, Contact → `/<edition>/contact/`, Advertise →
  `/<edition>/advertise/`, Privacy → `/<edition>/privacy_policy/`), with the shared section/list
  structure; the Terms route keeps the edition's own copy (the real site ships no Terms page).
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
- UI primitive layer: `src/components/shared/variants.ts` (cva recipes) and
  `src/components/shared/primitives.tsx` (layout, links, panels, pills, CTAs, artwork).
- Central bilingual copy: `src/i18n/` with typed keys and `{placeholder}` interpolation.
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

- Source architecture consolidated under the documented layering: a single `src/` tree with
  `src/app/` (TanStack Start entry points), `src/components/`, `src/features/`, `src/pages/`,
  `src/i18n/`, `src/lib/`, `src/services/`, `src/utils/` and the existing `src/theme/`,
  `src/routes/`, `src/hooks/`. The duplicate `i18n.ts` (shadowing `i18n/`) and the unused
  `RouteState.tsx` state machine were deleted; `components/shared/ui.tsx` `Na` now delegates to
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
- The live movie detail's "Book tickets" action now opens the real cinema ticket service in a
  new tab (the scraped per-cinema booking href, e.g. `https://elcinema.com/en/booking/<work>/<cinema>/`),
  falling back to the internal booking page when the scrape carries no cinema link. The work
  page's showtimes section reuses the same destination.

### Removed

- 33 unused `src/components/ui/*` primitives (accordion, chart, form, calendar, drawer, …) that
  only re-exported Radix packages nothing imports, plus the `config.server`/ cron-auth helpers in
  `src/integrations/supabase/` that no server entry point referenced.
- Dead exports from `primitives.tsx` (`ArtBadge`, `ToggleChip`, `Cta`, `CtaLink`, `IconButton`,
  `StatePanel`, `OutboundLink`, `ScrapedLink`) and the orphan `cta` / `artBadge` recipes in
  `variants.ts`; `controls.tsx` chips now use the shared `chip` recipe.
- 29 unused dependencies from `elcinema/package.json` (command palette, drawer/datepicker,
  form stack, carousel, resizable panels and ~20 Radix wrappers); `bun.lock` regenerated.
- Dead bilingual page copy for the static content pages (`footer.aboutPage.*`,
  `footer.contactPage.*`, `footer.advertisePage.*`, `footer.privacyPage.*` in both editions) now
  that the About / Contact / Advertise / Privacy pages render the scraped live copy through the
  generic `StaticPage`; the stale `box.sub7` ("top 7") key was replaced by the `box.sub` ("top 20")
  key the box office subtitle now reads.

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
