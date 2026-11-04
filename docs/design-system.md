# Design system

Two languages and two themes over one codebase is only cheap if the visual
vocabulary is spelled in exactly one place per concern. That is the whole point of
this layer.

```
value            →  src/theme/tokens.css            (colour, radius, shadow, size, motion)
repeated effect  →  src/theme/utilities.css         (@utility recipes: glass-card, hover-lift, …)
document default →  src/theme/base.css              (focus ring, scrollbar, reduced motion)
class pattern    →  elcinema/components/variants.ts (cva recipes)
markup           →  elcinema/components/primitives.tsx
words            →  elcinema/i18n/                 (COPY, makeT(lang))
```

`src/styles.css` is only the ordered entry point:

```css
@import "tailwindcss" source(none);
@import "tw-animate-css";
@source "../src";
@import "./theme/tokens.css";
@import "./theme/utilities.css";
@import "./theme/base.css";
```

`source(none)` plus an explicit `@source` means Tailwind scans the app and nothing
else — no stray scanning of `node_modules`, which is both faster and the reason a
class used only inside `src/theme/` still survives.

## Tokens

`tokens.css` is the only file in the repository where a literal colour, radius,
shadow or size is allowed to appear. Two palettes, one set of names:

- `:root` — matinee (light)
- `.dark` — cinema night

Everything a component consumes is a Tailwind theme variable mapped in
`@theme inline`, so `bg-primary`, `text-micro`, `shadow-glow-md`, `max-w-site` all
resolve to tokens rather than literals. Effects derived from a brand colour are
computed with `color-mix(in oklab, …)` so both palettes share one definition:

```css
--spotlight-brand: color-mix(in oklab, var(--primary) 18%, transparent);
--pulse-core: color-mix(in oklab, var(--primary) 55%, transparent);
```

Changing `--primary` therefore re-derives the glow, the spotlight and the pulse
animation instead of requiring four edits in four files.

Cinema night is the shipped palette: deep navy surfaces on hue 245, a bright sky
blue brand (`oklch(0.695 0.133 232)`) and gold accents. Daylight is the same hue
family read at high lightness, with `--primary` darkened to keep white CTA text
legible. Two rules make that survivable:

- **`--brand-ink` is the text colour on a brand fill, never white.** A sky blue at
  `L 0.695` is too light to carry near-white text (2.50:1 — under AA even for large
  text), so `--primary-foreground` and `--accent-foreground` point at a navy ink
  that measures 6.95:1 and 9.42:1. In the light theme the same variable name means
  the opposite colour (near-white on a darkened blue, 5.35:1), which is why
  components say `text-primary-foreground` and never pick a white.
- **Semantic colours are tuned per role, not copied between themes.** `--gold` and
  `--success` are bright in the dark theme because they sit _on_ navy (10.54:1,
  8.61:1); as text on a white card the identical values fall to 1.89:1 and 2.31:1,
  so the light theme carries deeper versions (4.71:1, 4.93:1).

Type and shape come from the same place: `--font-display` (`Exo`, falling back to
`Cairo` per glyph so an Arabic title inside an English page never shows tofu) is
applied to `h1`–`h3` in `base.css`, where a `:lang(ar)` rule then wins on
specificity and gives the Arabic edition Cairo throughout. The radius scale is
anchored on a single `--radius: 0.75rem` with `±4/8/12/16px` steps up to
`rounded-4xl`.

Custom utilities the tokens add:

| Token family                                                                      | Utilities it enables                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `--text-micro`, `--text-meta`                                                     | `text-micro`, `text-meta` (no more `text-[10px]`)             |
| `--font-sans`, `--font-display`                                                   | `font-sans`, `font-display` (headings inherit `font-display`) |
| `--radius` + `--radius-sm…4xl`                                                    | `rounded-sm…4xl`, all derived from one number                 |
| `--shadow-glass`, `-card-hover`, `-glow-sm/md/lg`, `-focus`                       | `shadow-*`                                                    |
| `--container-site`                                                                | `max-w-site`                                                  |
| `--container-guide-compact/medium/wide/channel`                                   | TV-guide widths                                               |
| `--color-scrim`                                                                   | `bg-scrim`                                                    |
| `--glass-blur`, `--header-height`, `--scrollbar-size`, `--ease-*`, `--duration-*` | consumed by utilities and `base.css` via `var()`              |

## Utilities

`utilities.css` declares effects with `@utility`, not `@layer components`. The
difference matters: `@utility` definitions participate in Tailwind's variant
system, so `hover:glass-card` and `dark:glass-card` compose, and unused ones are
dropped from the build.

`glass-card`, `glass-card-brand`, `cinema-gradient`, `page-background`, `hover-lift`, `poster-shade`,
`poster-shade-deep`, `scrim-start`, `poster-fallback`, `poster-spot`, `animate-theme-icon`,
`animate-pulse-neon`, `scrollbar-hide`, `page-flow`, `dialog-scroll`.

`page-background` is the shared app canvas for public pages, account screens,
error states, and the dashboard. Its brand and gold washes are derived from the
active palette in `tokens.css`, so light and dark mode keep the same subtle
cinematic depth without hard-coded page colours. The body also uses the same
background image as a fallback beneath route shells. The shared `Page` primitive
stays transparent so it does not paint an opaque surface over this canvas; cards
and other intentional panels opt into `bg-card`, `glass-card`, or another surface.
The first-load overlay uses this same background image and the active `--primary`
token for its animated highlights, keeping its canvas and accent colours aligned
with the selected theme.

Three of them exist because of a measured breakage, not a preference:

- `page-flow` pins every direct child of the page shell to `max-inline-size: 100%`.
  `$lang.tsx` stacks pages inside a _column_ flex container, and a flex item in a column
  has an indefinite cross size, so a centred `mx-auto max-w-*` section resolves to
  `max-content` instead of the viewport. At 360px that turned every section into a
  desktop-width page whose tail was clipped by `overflow-x-clip`, and in Arabic the whole
  section landed off-screen. With the pin, rails scroll inside their own box again.
- `dialog-scroll` caps a dialog at `85vh` and scrolls its body. A phone in landscape, and
  the register form with its confirm fields, were taller than the viewport; the dialog
  layer is fixed and the page behind it cannot scroll, so the submit button was
  unreachable. Used by `AuthDialog` and the dashboard row dialog.
- `scrim-start` is the horizontal sibling of `poster-shade`. A directional gradient has no
  logical axis, so the reading-direction flip lives in CSS instead of as a
  `bg-gradient-to-r rtl:bg-gradient-to-l` pair in a component.

`poster-fallback`/`poster-spot` read a `--poster-hue` custom property instead of
computing a colour inline, so a placeholder poster is tinted by setting one
variable:

```tsx
<Artwork hue={movie.hue} … />   // sets { "--poster-hue": … }, styles live in utilities.css
```

## Base

`base.css` holds document defaults and the few unavoidable third-party overrides:
the global focus-visible ring, the `h1`–`h3` display-face assignment, scrollbar
sizing, the View Transitions
`theme-reveal` animation with a `.theme-fade` fallback, a complete
`prefers-reduced-motion` reset, the Radix scroll-lock fix
(`body[data-scroll-locked].select-scroll-free`), and the light-theme logo invert.

The focus ring is global and non-negotiable:

```css
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

## Recipes

`variants.ts` is the only place a repeated class string is written. `container`,
`section`, `sectionHeader`, `heading({level})`, `subheading`,
`iconAction`, `chip({active})`, `pill({tone})`,
`panel({padded, spotlight})`, `artFrame({ratio})`, `railItem({size})`,
`cardTitle`, `cardMeta`, `revealOverlay`, `railTrack`, `guideSlot`,
`guideChannel`, `guideHeader`, `stateBlock`.

Recipes are pure data — no JSX — so pages and primitives share them without
importing each other.

## Primitives

`primitives.tsx` turns recipes into markup: `Page`, `Section`, `SectionHeader`,
`Subtitle`, `AppLink`, `useIsActive`, `Panel`,
`Pill`, `Artwork`, `Photo`, `artworkSrc`.

Rules that live here and nowhere else:

- TanStack route typing is strict about `to`/`params`; the casts are centralised
  in `asRoute()` / `asSearch()`. **`as never` may not appear anywhere else in the
  app.**
- Scraped hrefs are resolved only by `cardLink()` in `links.ts`; the components
  that wrapped it were never adopted and were removed — render link data through
  `AppLink` / `Na` after calling `cardLink()`.
- Optional props are declared `?: T | undefined` because `tsconfig.json` turns on
  `exactOptionalPropertyTypes`.
- Every primitive composes as `cn(recipe({ variant }), className)` so a caller can
  always nudge spacing without forking the recipe.

## Copy

`i18n/index.ts` exports `COPY` (about 170 dotted keys grouped by area: `chrome.*`,
`nav.*`, `home.*`, `controls.*`, `common.*`, `now.*`, `soon.*`, `box.*`,
`booking.*`, `guide.*`, `video.*`, `vod.*`, `lineup.*`, `search.*`, `auth.*`,
`theme.*`) and the helpers:

| Helper                                        | Use                                                  |
| --------------------------------------------- | ---------------------------------------------------- |
| `makeT(lang)` → `t(key, vars?)`               | Component-level strings, with `{name}` interpolation |
| `text(lang, key, vars?)`                      | One-off, outside a component                         |
| `bi(value, lang)`                             | A `Bi` **data** value (a movie title)                |
| `pair(lang, en, ar)`                          | Two literals that never earn a key (rare)            |
| `isRtl(lang)`, `dir(lang)`, `otherLang(lang)` | Direction and language switching                     |

The line that matters: **strings are UI copy (`COPY`) or domain data (`Bi`), and
the two never mix.** A film title travels as `{ en, ar }`; a "Book tickets" label
travels as a key.

## Direction

Arabic is the default assumption. Layout uses logical properties — `ms-`, `me-`,
`ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-e` — and `rtl:` variants for
the cases logic cannot cover. `$lang.tsx` sets `dir` on a wrapper and mirrors it
onto `<html>` after hydration, which is what makes the logical utilities flip.

Forbidden for layout: `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`,
`text-left`, `bg-gradient-to-r`. Use their logical or `rtl:` equivalents.
Scroll helpers must respect direction too — `scrollBy({ left: … })` moves the wrong
way in RTL unless the sign comes from the computed direction.

A literal `←` or `→` in copy is not direction-aware either: it stays pointing west in
an Arabic paragraph. Directional affordances are lucide `ArrowLeft`/`ArrowRight` with
`rtl:rotate-180`, and a directional gradient is the `scrim-start` utility rather than a
`bg-gradient-to-r rtl:bg-gradient-to-l` pair.

Hit areas follow the same centralisation rule: `iconAction` sizes an icon-only control
to 40×40 on touch widths and 36 from `sm` up, so a new `IconButton` does not need a
bespoke class string to be thumb-sized.

## Adding something new

1. Need a colour, radius, shadow or size that does not exist? Add a token in
   `tokens.css` to **both** palettes, then map it in `@theme inline`.
2. Repeated effect across components? `@utility` in `utilities.css`.
3. Class pattern used more than once? A `cva` recipe in `variants.ts`.
4. Markup with behaviour? A primitive in `primitives.tsx`.
5. Words? Keys in `i18n/`, both languages, before the component ships.

A feature component that reaches step 1 directly is a review-blocker, not a
shortcut.

## Migration status

The layer exists; the call sites are moving to it page by page, because a
big-bang swap of 384 lines of `HomePage` and 713 lines of `editor.tsx` cannot be
reviewed honestly.

| Layer                                    | Status                                                                                                                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tokens (`theme/tokens.css`)              | **Done.** Both palettes, all derived effects, all custom utilities mapped.                                                                                                                                                           |
| Utilities (`theme/utilities.css`)        | **Done.** `@layer components` converted to `@utility`; `hover-lift` kept its name for the 11 existing call sites.                                                                                                                    |
| Base (`theme/base.css`)                  | **Done.** Focus ring, scrollbar, reduced motion, view transitions, Radix scroll-lock fix.                                                                                                                                            |
| Recipes (`components/variants.ts`)       | **Done** — 20 recipes; not yet used everywhere they could be.                                                                                                                                                                        |
| Primitives (`components/primitives.tsx`) | **Live, adoption partial.** New code must use them; `ui.tsx` is now a delegating shorthand (`Na` → `AppLink`, `PosterArt` → `Artwork`) plus rail/poster helpers, not a second implementation.                                        |
| Copy (`i18n/`)                           | **Live, adoption partial.** ~170 keys migrated into `COPY`; the local dictionaries in `controls.tsx`/`live-ui.tsx`/the auth flow are gone. The dashboard's local `L()` helper and a few chrome ternaries remain in pages and chrome. |

Order of migration, one pull request per line: rails and card chrome → `Section`
headers and CTAs → the search, booking and lineup pages → `SiteChrome` and
controls (the largest remaining copy surface) → the dashboard, last, because it is
also where the write-path fix belongs
([SECURITY.md](../SECURITY.md#known-hardening-backlog)).

A page is "migrated" when it contains no literal colour, no repeated class pattern
that a recipe already expresses, no inline language ternary, and no local string
dictionary.
