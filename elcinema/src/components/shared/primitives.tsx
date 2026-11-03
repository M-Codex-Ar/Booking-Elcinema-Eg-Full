/**
 * Presentational primitives for the elCinema experience.
 *
 * These are the only components allowed to spell out visual intent, and even
 * they delegate the class strings to ./variants.ts. Feature code (pages, rails,
 * dashboard) composes these instead of re-typing Tailwind.
 *
 * Direction rule: nothing here uses a physical axis class (`left-`, `ml-`,
 * `bg-gradient-to-r`). Logical properties (`start-`, `ms-`, `rtl:`) keep the
 * Arabic edition correct without a second stylesheet.
 */
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { img as resolveImg } from "@/lib/images";
import { isUsableArtwork, PLACEHOLDER, type PlaceholderKind } from "@/types/media";
import {
  container,
  heading,
  panel,
  pill,
  section,
  sectionHeader,
  subheading,
} from "@/components/shared/variants";

/* ------------------------------------------------------------------ layout */

/**
 * Page wrapper: fills the shell's `<main>` so the footer stays at the bottom on
 * short pages (`min-h-screen` here would overshoot the header + footer and push
 * the footer below the fold). `page-flow` keeps the centred sections inside it at
 * the viewport width — a column flex container alone would size them to their
 * content and overflow every phone.
 */
export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("page-flow flex flex-1 flex-col bg-background", className)}>{children}</div>
  );
}

/** A centred block of content at the site width. */
export function Section({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string | undefined;
  as?: "section" | "div" | "footer";
}) {
  return <Tag className={cn(container(), section(), className)}>{children}</Tag>;
}

/** Heading row with the icon, title and the controls that belong to it. */
export function SectionHeader({
  title,
  icon,
  level = "h2",
  as = "h2",
  action,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  level?: VariantProps<typeof heading>["level"];
  as?: "h1" | "h2" | "h3";
  action?: ReactNode;
  className?: string | undefined;
}) {
  const Tag = as;
  return (
    <div className={cn(action !== undefined && sectionHeader(), className)}>
      <Tag className={heading({ level })}>
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </Tag>
      {action}
    </div>
  );
}

/** Supporting line under a heading. */
export function Subtitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return <p className={cn(subheading(), className)}>{children}</p>;
}

/* ------------------------------------------------------------------- links */

/**
 * Route casting lives here and nowhere else. TanStack Router wants literal
 * route strings while elCinema paths are composed at runtime from a language
 * and an id; one narrow cast keeps that out of every call site.
 */
const asRoute = (href: string) => href as never;
const asSearch = (search: Record<string, string | number | undefined> | undefined) =>
  search as never;

/** Internal client-side link. `search` patches query params. */
export function AppLink({
  href,
  children,
  className,
  style,
  search,
  ariaLabel,
  title,
}: {
  href: string;
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  search?: Record<string, string | number | undefined> | undefined;
  ariaLabel?: string | undefined;
  title?: string | undefined;
}) {
  return (
    <Link
      to={asRoute(href)}
      search={asSearch(search)}
      className={className}
      style={style}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </Link>
  );
}

/** True when the current pathname is `href` or one of its children. */
// eslint-disable-next-line react-refresh/only-export-components
export function useIsActive(href: string): boolean {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === href || pathname.startsWith(href + "/");
}

/* ------------------------------------------------------------------ pieces */

/** Frosted surface: guides, hero panels, stat cards. */
export function Panel({
  children,
  className,
  padded,
  spotlight,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string | undefined;
  padded?: VariantProps<typeof panel>["padded"];
  spotlight?: boolean;
  as?: "div" | "aside" | "section";
}) {
  return (
    <Tag className={cn(panel({ padded, spotlight: Boolean(spotlight) }), className)}>
      {children}
    </Tag>
  );
}

/** Metadata pill with an optional leading icon (date, runtime, genre). */
export function Pill({
  children,
  icon,
  tone,
  title,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  tone?: VariantProps<typeof pill>["tone"];
  /** Explanatory tooltip for operator-facing cautions. */
  title?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <span title={title} className={cn(pill({ tone }), className)}>
      {icon}
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- artwork */

/** Custom-property bag for the deterministic fallback poster. */
const hueVars = (hue: number) => ({ "--poster-hue": String(hue) }) as unknown as CSSProperties;

/**
 * Resolve a manifest key, or pass through an absolute/protocol URL.
 * Returns "" when the reference cannot be honoured — including the
 * preview-only `/__l5e/` asset URLs, which 404 everywhere outside Lovable.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function artworkSrc(key: string | null | undefined): string {
  if (!key) return "";
  const direct = key.startsWith("/") || /^https?:\/\//.test(key) ? key : resolveImg(key);
  return isUsableArtwork(direct) ? direct : "";
}

/**
 * The ordered URLs worth trying for a set of references — first-party mirror
 * first, then the source CDN — with unusable and duplicate entries removed.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function artworkSources(...refs: (string | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const ref of refs) {
    const resolved = artworkSrc(ref);
    if (resolved && !out.includes(resolved)) out.push(resolved);
  }
  return out;
}

/**
 * Load state for an artwork reference chain: the URL to try now, whether the
 * chain is exhausted, and the handler that advances it. The state is keyed by
 * the first source, so a rail cell that gets a new poster (or a `key`-less list
 * re-render) does not stay blacked out by the previous image's failure.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useArtwork(
  src: string | null | undefined,
  fallback?: string | null | undefined,
): { src: string | undefined; failed: boolean; onError: () => void } {
  const sources = artworkSources(src, fallback);
  const first = sources[0];
  const [state, setState] = useState<{ first: string | undefined; index: number }>({
    first,
    index: 0,
  });
  if (state.first !== first) setState({ first, index: 0 });
  const exhausted = state.index >= sources.length;
  return {
    src: exhausted ? undefined : sources[state.index],
    failed: exhausted,
    onError: () => setState((s) => ({ ...s, index: s.index + 1 })),
  };
}

/**
 * The only `<img>` the app needs when a designed fallback is not available:
 * never an empty `src`, never a dead hotlink. Sources are tried in order —
 * typically the local mirror, then the scraped URL — and an exhausted chain
 * renders the shipped placeholder for that aspect, so a missing poster reads as
 * intentional artwork instead of a browser broken-image icon.
 */
export function SmartImg({
  src,
  fallbackSrc,
  alt,
  kind = "poster",
  fit = "cover",
  eager = false,
  className,
}: {
  src?: string | null | undefined;
  fallbackSrc?: string | null | undefined;
  alt: string;
  kind?: PlaceholderKind;
  fit?: "cover" | "contain";
  eager?: boolean;
  className?: string | undefined;
}) {
  const art = useArtwork(src, fallbackSrc);
  const live = !!art.src && !art.failed;
  return (
    <img
      src={live ? art.src : PLACEHOLDER[kind]}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      referrerPolicy="no-referrer"
      onError={live ? art.onError : undefined}
      data-artwork={live ? "live" : "placeholder"}
      className={cn(fit === "cover" ? "object-cover" : "object-contain", className)}
    />
  );
}

/**
 * Real artwork when available; a deterministic gradient poster when not — or
 * when the URL is present but fails to load. The gradient lives in the
 * `poster-fallback`/`poster-spot` utilities, so no colour math reaches markup.
 */
export function Artwork({
  src,
  hue,
  alt,
  icon: Icon = Clapperboard,
  overlay,
  large = false,
  className,
}: {
  src?: string | null | undefined;
  hue: number;
  alt: string;
  icon?: ComponentType<{ className?: string }> | undefined;
  overlay?: ReactNode;
  large?: boolean;
  className?: string | undefined;
}) {
  const resolved = artworkSrc(src);
  const art = useArtwork(resolved);
  if (art.src && !art.failed) {
    return (
      <img
        src={art.src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={art.onError}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "poster-fallback relative flex h-full w-full flex-col items-center justify-center overflow-hidden",
        className,
      )}
      style={hueVars(hue)}
      aria-hidden="true"
    >
      <div className="poster-spot absolute inset-0 opacity-40" style={hueVars(hue)} />
      <Icon className={cn(large ? "h-16 w-16" : "h-10 w-10", "text-white/80")} />
      <span
        className={cn(
          large ? "text-3xl" : "text-base",
          "mt-4 px-6 text-center font-black leading-snug text-white drop-shadow-lg",
        )}
      >
        {alt}
      </span>
      <div className="poster-shade-deep absolute inset-x-0 bottom-0 h-1/2" />
      {overlay}
    </div>
  );
}

/**
 * Small logo (TV channel, streaming provider) that degrades to its name text
 * when there is no usable image — a badge with a broken icon inside is worse
 * than the name, and neither should depend on a third-party host being up.
 */
export function LogoImage({
  src,
  text,
  imgClassName,
  textClassName,
}: {
  src?: string | null | undefined;
  text: string;
  imgClassName: string;
  textClassName?: string;
}) {
  const art = useArtwork(artworkSrc(src));
  if (!art.src || art.failed) {
    return <span className={cn("truncate", textClassName ?? "text-xs font-semibold")}>{text}</span>;
  }
  return (
    <img
      src={art.src}
      alt={text}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={art.onError}
      className={cn("w-auto shrink-0 object-contain", imgClassName)}
    />
  );
}

/**
 * An image that keeps its caller's designed fallback markup: used where a
 * feature already drew a better "no artwork" state than a generic placeholder
 * (a person silhouette, a film icon, the provider's name). Same contract as
 * every other renderer here — an unusable reference and a failed load both show
 * `fallback`, never a broken icon.
 */
export function ImgWithFallback({
  src,
  alt,
  className,
  fallback,
  fit = "cover",
}: {
  src?: string | null | undefined;
  alt: string;
  className?: string;
  fallback: ReactNode;
  fit?: "cover" | "contain";
}) {
  const art = useArtwork(artworkSrc(src));
  if (!art.src || art.failed) return <>{fallback}</>;
  return (
    <img
      src={art.src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={art.onError}
      className={cn(fit === "cover" ? "object-cover" : "object-contain", className)}
    />
  );
}

/** Plain image with a clapperboard placeholder, for rails and grids. */
export function Photo({
  src,
  alt,
  className,
  iconClass = "h-8 w-8",
}: {
  src?: string | null | undefined;
  alt: string;
  className?: string | undefined;
  iconClass?: string;
}) {
  const art = useArtwork(artworkSrc(src));
  if (!art.src || art.failed) {
    return (
      <div className={cn("flex items-center justify-center bg-secondary", className)}>
        <Clapperboard className={cn(iconClass, "text-muted-foreground")} />
      </div>
    );
  }
  return (
    <img
      src={art.src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={art.onError}
      className={cn("object-cover", className)}
    />
  );
}
