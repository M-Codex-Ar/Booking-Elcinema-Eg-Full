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
import type { ButtonHTMLAttributes, ComponentType, CSSProperties, ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lang } from "../home.shared";
import { cardLink } from "../links";
import { img as resolveImg } from "../images";
import {
  artBadge,
  chip,
  container,
  cta,
  heading,
  iconAction,
  panel,
  pill,
  section,
  sectionHeader,
  stateBlock,
  subheading,
} from "./variants";

/* ------------------------------------------------------------------ layout */

/** Page wrapper: full-bleed background with the shared vertical rhythm. */
export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return <div className={cn("min-h-screen bg-background", className)}>{children}</div>;
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
  search?: Record<string, string | number | undefined>;
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

/** External link: always a new tab with `noreferrer`, never a redirect surprise. */
export function OutboundLink({
  href,
  children,
  className,
  style,
  ariaLabel,
  title,
}: {
  href: string;
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ariaLabel?: string | undefined;
  title?: string | undefined;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
      style={style}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </a>
  );
}

/**
 * A link built from a *scraped* elcinema.com href: resolved through `cardLink`
 * so it lands on an app page when one exists and on a genuine external host
 * (YouTube, social) otherwise. This is the only sanctioned way to render
 * scraped hrefs — see the contract in links.ts.
 */
export function ScrapedLink({
  lang,
  href,
  title = "",
  children,
  className,
  style,
  ariaLabel,
}: {
  lang: Lang;
  href: string | null | undefined;
  title?: string;
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ariaLabel?: string | undefined;
}) {
  const link = cardLink(lang, href, title);
  const shared = { className, style, ariaLabel };
  return link.external ? (
    <OutboundLink href={link.href} {...shared}>
      {children}
    </OutboundLink>
  ) : (
    <AppLink href={link.href} {...shared}>
      {children}
    </AppLink>
  );
}

/** True when the current pathname is `href` or one of its children. */
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

/** Label overlaid on artwork: duration, platform logo, live flag. */
export function ArtBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return <span className={cn(artBadge(), className)}>{children}</span>;
}

/** Toggle chip for filter rows (channel categories, booking day tabs). */
export function ToggleChip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  className?: string | undefined;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(chip({ active }), className)}
    >
      {children}
    </button>
  );
}

/** CTA button. For navigation use `CtaLink` so the router stays in charge. */
export function Cta({
  children,
  className,
  tone,
  size,
  icon,
  ...buttonProps
}: {
  children?: ReactNode;
  className?: string | undefined;
  tone?: VariantProps<typeof cta>["tone"];
  size?: VariantProps<typeof cta>["size"];
  icon?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  return (
    <button type="button" className={cn(cta({ tone, size }), className)} {...buttonProps}>
      {icon}
      {children}
    </button>
  );
}

/** A CTA that navigates: the same visual language as `Cta`, as a route link. */
export function CtaLink({
  href,
  children,
  tone,
  size,
  className,
  external,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  tone?: VariantProps<typeof cta>["tone"];
  size?: VariantProps<typeof cta>["size"];
  className?: string | undefined;
  external?: boolean;
  ariaLabel?: string | undefined;
}) {
  const classes = cta({ tone, size });
  return external ? (
    <OutboundLink href={href} className={classes} ariaLabel={ariaLabel}>
      {children}
    </OutboundLink>
  ) : (
    <AppLink href={href} className={classes} ariaLabel={ariaLabel}>
      {children}
    </AppLink>
  );
}

/** Icon-only control; the accessible name is mandatory, not optional. */
export function IconButton({
  label,
  icon,
  className,
  tone,
  ...buttonProps
}: {
  label: string;
  icon: ReactNode;
  className?: string | undefined;
  tone?: VariantProps<typeof iconAction>["tone"];
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "aria-label">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(iconAction({ tone }), className)}
      {...buttonProps}
    >
      {icon}
    </button>
  );
}

/** Empty or error state: heading, why it happened, and the way back. */
export function StatePanel({
  title,
  message,
  action,
  icon,
  className,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn(stateBlock(), className)}>
      {icon && <div className="mx-auto text-primary [&>svg]:h-10 [&>svg]:w-10">{icon}</div>}
      <h1 className={cn(heading({ level: "h1" }), "justify-center", icon && "mt-4")}>{title}</h1>
      {message && <p className={cn(subheading())}>{message}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------- artwork */

/** Custom-property bag for the deterministic fallback poster. */
const hueVars = (hue: number) => ({ "--poster-hue": String(hue) }) as unknown as CSSProperties;

/** Resolve a manifest key, or pass through an absolute/protocol URL. */
export function artworkSrc(key: string | null | undefined): string {
  if (!key) return "";
  return key.startsWith("/") || /^https?:\/\//.test(key) ? key : resolveImg(key);
}

/**
 * Real artwork when available; a deterministic gradient poster when not. The
 * gradient lives in the `poster-fallback`/`poster-spot` utilities, so no colour
 * math reaches the markup.
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
  src?: string | null;
  hue: number;
  alt: string;
  icon?: ComponentType<{ className?: string }>;
  overlay?: ReactNode;
  large?: boolean;
  className?: string | undefined;
}) {
  const resolved = artworkSrc(src);
  if (resolved) {
    return (
      <img
        src={resolved}
        alt={alt}
        loading="lazy"
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

/** Plain image with a clapperboard placeholder, for rails and grids. */
export function Photo({
  src,
  alt,
  className,
  iconClass = "h-8 w-8",
}: {
  src?: string | null;
  alt: string;
  className?: string | undefined;
  iconClass?: string;
}) {
  const resolved = artworkSrc(src);
  if (!resolved) {
    return (
      <div className={cn("flex items-center justify-center bg-secondary", className)}>
        <Clapperboard className={cn(iconClass, "text-muted-foreground")} />
      </div>
    );
  }
  return <img src={resolved} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}
