/**
 * Shared presentational pieces for the elCinema experience: a type-loose
 * internal link, real poster artwork with a generated gradient fallback,
 * the scrolling poster row and bilingual helpers.
 */
import { Clapperboard, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { img as resolveImg } from "./images";
import type { Bi, Lang } from "./home.shared";

export const t = (v: Bi | undefined, lang: Lang): string => (v ? v[lang] : "");

/**
 * Internal link for dynamically built paths. Route paths are parameterised
 * by language, so hrefs are composed at runtime; `to` is cast to satisfy
 * the generated route-tree typing while keeping client-side navigation.
 */
export function Na({
  href,
  children,
  className,
  style,
  search,
}: {
  href: string;
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  search?: Record<string, string | undefined>;
}) {
  return (
    <Link to={href as never} search={search as never} className={className} style={style}>
      {children}
    </Link>
  );
}

/** Public work URL, addressed by the elCinema-style numeric ID. */
export const workPath = (lang: Lang, id: number | string) => `/${lang}/work/${id}`;

/** Public person URL, addressed by the elCinema-style numeric ID. */
export const personPath = (lang: Lang, id: number | string) => `/${lang}/person/${id}`;

/** Highlights the active language-prefixed section in nav chrome. */
export function useIsActive(href: string): boolean {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === href || pathname.startsWith(href + "/");
}

/** Real artwork when available, deterministic gradient poster otherwise. */
export function PosterArt({
  hue,
  title,
  icon,
  img: imgKey,
  className = "",
  large = false,
}: {
  hue: number;
  title: string;
  icon?: LucideIcon;
  img?: string | null | undefined;
  className?: string;
  large?: boolean;
}) {
  const src = imgKey
    ? imgKey.startsWith("/") || /^https?:\/\//.test(imgKey)
      ? imgKey
      : resolveImg(imgKey)
    : "";
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const Icon = icon ?? Clapperboard;
  const h2 = (hue + 40) % 360;
  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(160deg, hsl(${hue} 55% 26%), hsl(${h2} 60% 12%))`,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 70% 20%, hsl(${hue} 90% 65% / 0.35), transparent 55%)`,
        }}
      />
      <Icon className={`${large ? "h-16 w-16" : "h-10 w-10"} text-white/80`} />
      <span
        className={`${large ? "text-3xl" : "text-base"} mt-4 px-6 text-center font-black leading-snug text-white drop-shadow-lg`}
      >
        {title}
      </span>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

/** Scrolling poster row with section title, arrows and "See all" link. */
export function Row({
  title,
  icon,
  more,
  children,
}: {
  title: string;
  icon: ReactNode;
  more?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) =>
    ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl md:text-2xl">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {more && (
            <Na href={more} className="me-2 text-sm font-semibold text-primary hover:underline">
              See all
            </Na>
          )}
          <button
            aria-label="Previous"
            onClick={() => scroll(-1)}
            className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Next"
            onClick={() => scroll(1)}
            className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}

/** Movie poster card used across home and listing pages. */
export function Poster({
  lang,
  id,
  hue,
  img,
  title,
  sub,
  badge,
}: {
  lang: Lang;
  id: number | string;
  hue: number;
  img?: string | null;
  title: string;
  sub?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="group w-36 shrink-0 snap-start md:w-44">
      <Na href={workPath(lang, id)} className="block">
        <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
          <PosterArt hue={hue} title={title} img={img} />
          {badge && <div className="absolute end-2 top-2">{badge}</div>}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              More info →
            </span>
          </div>
        </div>
        <h3 className="mt-3 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary">
          {title}
        </h3>
      </Na>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

const MONTHS: Bi[] = [
  { en: "January", ar: "يناير" },
  { en: "February", ar: "فبراير" },
  { en: "March", ar: "مارس" },
  { en: "April", ar: "أبريل" },
  { en: "May", ar: "مايو" },
  { en: "June", ar: "يونيو" },
  { en: "July", ar: "يوليو" },
  { en: "August", ar: "أغسطس" },
  { en: "September", ar: "سبتمبر" },
  { en: "October", ar: "أكتوبر" },
  { en: "November", ar: "نوفمبر" },
  { en: "December", ar: "ديسمبر" },
];

/** Static bilingual date formatting, stable across SSR and client. */
export function fmtDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split("-").map(Number);
  const month = MONTHS[((m ?? 1) - 1) % 12] ?? { en: "", ar: "" };
  return `${d} ${month[lang]} ${y}`;
}
