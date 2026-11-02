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
- Central bilingual copy: `src/elcinema/i18n.ts` with typed keys and `{placeholder}` interpolation.
- Token layer extended to match the supplied theme: `--radius` anchored at `0.75rem` with a
  `rounded-4xl` step, `--font-display` (`Exo` → `Cairo`), `--color-success` / `--color-gold`
  utilities and the `--sidebar-*` mappings.

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
- `elcinema/scripts/check-env.mjs`, wired into `bun run build`: a build that cannot resolve
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` now fails with the variable names instead
  of emitting a bundle that throws in the browser. `SKIP_ENV_CHECK=1` opts out (used by `Web CI`,
  which holds no Supabase values, so its artifact is compile-verified only).
- `elcinema/src/lib/supabase-env.ts`: `isSupabaseConfigured()` probes the same keys the generated
  client reads, so feature code can degrade instead of crashing; covered by
  `src/test/supabase-env.test.ts`.

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
  variable is `SUPABASE_SERVICE_ROLE_KEY` (`scripts/seed-admin.mjs`, `client.server.ts`).

### Known issues

See the hardening backlog in [SECURITY.md](SECURITY.md) and the page-by-page migration plan in
[docs/design-system.md](docs/design-system.md#migration-status).

## [0.1.0]

### Added

- `elcinema/`: bilingual public site (now playing, coming soon, TV guide, box office, booking,
  videos, watch-online, featured lists, search), operator dashboard with managed-content CRUD,
  Supabase auth, Drizzle migrations for the `managed_*` tables, and scraper/parsers with
  fixture-based tests.
