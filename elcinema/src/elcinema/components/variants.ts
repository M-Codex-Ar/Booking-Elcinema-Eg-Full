/**
 * The styling contract for the elCinema experience.
 *
 * One place defines every repeated Tailwind recipe as a `cva` variant, so a
 * component asks for a *role* (`cta({ tone: "primary" })`) instead of spelling
 * out a class string. Change the look of every call site by editing this file;
 * the values it uses are tokens from src/theme/tokens.css, never literals.
 *
 * Composition rule: `cn()` (clsx + tailwind-merge) merges these recipes with
 * caller overrides, so a one-off `className` can extend but not fight a recipe.
 */
import { cva } from "class-variance-authority";

/** Page width + gutter. Used by every section, header and footer. */
export const container = cva("mx-auto w-full max-w-site px-4 md:px-8");

/** Vertical rhythm for a page section. */
export const section = cva("py-8");

/** Section heading row (title + controls). */
export const sectionHeader = cva("mb-4 flex flex-wrap items-center justify-between gap-3");

/** Headings: h1 opens a page, h2 opens a rail/panel, h3 labels a card.
 *  `font-display` is Exo with a per-glyph Cairo fallback, so Latin titles get
 *  the display face and Arabic ones stay in Cairo automatically. */
export const heading = cva("flex items-center gap-2 font-display font-black text-balance", {
  variants: {
    level: {
      h1: "text-2xl md:text-3xl",
      h2: "text-xl md:text-2xl",
      h3: "text-sm font-bold md:text-base",
    },
  },
  defaultVariants: { level: "h2" },
});

/** Supporting line under a heading. */
export const subheading = cva("mt-1 text-sm text-muted-foreground");

/** Primary call to action, secondary outline action, quiet link and danger. */
export const cta = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all hover:shadow-glow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:border-primary hover:text-primary",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "font-semibold text-primary underline-offset-4 hover:underline hover:shadow-none",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: { tone: "primary", size: "md" },
  },
);

/** Circular icon-only control (social links, row arrows, sign-out). */
export const iconAction = cva(
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
  {
    variants: {
      tone: { default: "", destructive: "hover:border-destructive hover:text-destructive" },
    },
    defaultVariants: { tone: "default" },
  },
);

/** Toggle chip in a filter row (channel categories, booking day tabs). */
export const chip = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
  {
    variants: {
      active: {
        true: "border-primary bg-primary text-primary-foreground",
        false: "border-border text-foreground hover:border-primary hover:text-primary",
      },
    },
    defaultVariants: { active: false },
  },
);

/** Small metadata pill on cards and headers (date, runtime, genre, rating). */
export const pill = cva(
  "inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-meta font-semibold text-secondary-foreground",
  {
    variants: {
      tone: {
        default: "",
        gold: "text-gold",
        primary: "text-primary",
        /** Operator-facing caution (e.g. a built-in duplicate). Gold is the
         *  brand caution colour; never a raw `amber-500` literal. */
        warning: "border border-gold/40 bg-gold/10 text-gold",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

/** Label overlaid on artwork (duration, VOD platform, live status). */
export const artBadge = cva(
  "inline-flex items-center gap-1 rounded-md bg-scrim px-2 py-1 text-micro font-bold backdrop-blur-sm",
);

/** Frosted panel: the default card surface for every page. */
export const panel = cva("glass-card", {
  variants: {
    padded: { none: "", sm: "p-4", md: "p-6" },
    spotlight: { true: "cinema-gradient", false: "" },
  },
  defaultVariants: { padded: "none", spotlight: false },
});

/** The media box of a card: fixed ratio, clipped, lifts on hover. */
export const artFrame = cva("relative overflow-hidden rounded-xl bg-secondary hover-lift", {
  variants: {
    ratio: { portrait: "aspect-[2/3]", wide: "aspect-video", square: "aspect-square" },
  },
  defaultVariants: { ratio: "portrait" },
});

/** Rail item width. `fluid` fills a grid cell instead of a rail slot. */
export const railItem = cva("snap-start", {
  variants: {
    size: { sm: "w-36 md:w-44", md: "w-40 md:w-48", lg: "w-64 md:w-72", fluid: "w-full max-w-44" },
  },
  defaultVariants: { size: "sm" },
});

/** Card title under artwork. */
export const cardTitle = cva(
  "mt-3 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary",
);

/** Secondary line under a card title (date, channel, booking link). */
export const cardMeta = cva("mt-1 text-xs text-muted-foreground");

/** Reveal-on-hover scrim that turns the whole card into an affordance. */
export const revealOverlay = cva(
  "poster-shade absolute inset-0 flex items-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
);

/** The horizontal scroller inside a rail. */
export const railTrack = cva(
  "scrollbar-hide flex snap-x gap-4 overflow-x-auto overscroll-x-contain pb-2",
);

/** Timeline slot block inside the TV guide. */
export const guideSlot = cva(
  "absolute inset-y-1.5 overflow-hidden rounded-md border border-border bg-secondary px-2.5 py-1 text-xs transition-colors hover:border-primary",
);

/** Sticky channel column of the TV guide. */
export const guideChannel = cva(
  "sticky start-0 z-1 flex w-28 shrink-0 items-center gap-2 border-e border-border bg-card/95 p-2 backdrop-blur-sm transition-colors hover:bg-secondary sm:w-40",
);

/** Table/list row separators and the guide header row. */
export const guideHeader = cva(
  "sticky top-0 z-10 flex border-b border-border bg-card/95 text-xs text-muted-foreground backdrop-blur-sm",
);

/** Full-page empty/error state block. */
export const stateBlock = cva("mx-auto max-w-3xl px-4 py-20 text-center md:px-8");
