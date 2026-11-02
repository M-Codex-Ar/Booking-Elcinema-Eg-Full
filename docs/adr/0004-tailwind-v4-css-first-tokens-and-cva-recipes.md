# ADR 0004 — Tailwind v4 CSS-first tokens, `@utility` effects, `cva` recipes

Status: accepted (2026-11-02)

## Context

The app has two themes and two writing directions. Class strings had accumulated
across pages — literal `oklch()` values, duplicated shadows, `text-[10px]`,
`shadow-[0_0_15px_rgba(…)]`, and the same card treatment re-typed per rail. Restyling
meant finding every copy, and a theme switch left effects that only matched one
palette.

## Decision

One spelling layer per concern, in Tailwind CSS v4's CSS-first configuration — no
`tailwind.config.js`, no second stylesheet, no component CSS files:

1. `src/theme/tokens.css` — the only file with literal values. Palettes as raw
   custom properties in `:root`/`.dark`, mapped to Tailwind through `@theme inline`.
   Brand-derived effects are computed with `color-mix(in oklab, var(--primary) …)`
   so one token change re-derives glow, spotlight and pulse for both palettes.
2. `src/theme/utilities.css` — repeated effects declared with `@utility`, not
   `@layer components`, so variants compose (`hover:glass-card`) and unused
   utilities drop out of the build.
3. `src/theme/base.css` — document defaults: global `:focus-visible` ring,
   scrollbar sizing, view-transition theme reveal, the full
   `prefers-reduced-motion` reset, and the few third-party overrides.
4. `src/elcinema/components/variants.ts` — every repeated class *pattern* as a
   `class-variance-authority` recipe. Pure data, no JSX.
5. `src/elcinema/components/primitives.tsx` — markup that composes recipes with
   `cn()`.
   `src/styles.css` stays a five-line ordered entry point with
   `source(none)` + explicit `@source "../src"`.

## Consequences

- A palette change is a token edit; adding a third theme means another block of raw
  variables, not a hunt through components.
- Deriving effects with `color-mix` removed the duplicated `oklch` literals the
  animations used to carry.
- `@utility` costs a build-verification habit: `@source` must stay explicit or a
  class used only inside `theme/` can vanish from the emitted stylesheet. Verified by
  grepping the built CSS after a token change.
- Two file-name constraints were kept deliberately: `hover-lift` stayed
  `hover-lift` rather than a tidier new name, because eleven call sites use it and a
  silent rename would drop the treatment without failing anything.
- `cn()` is required for composition — plain interpolation reintroduces the class
  conflicts that tailwind-merge exists to resolve.
- Recipes make "add one-off CSS in a feature folder" visibly wrong in review, which
  is the enforcement mechanism until a lint rule exists.
