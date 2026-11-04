/**
 * Shared presentational pieces for the elCinema experience: a type-loose
 * internal link, real poster artwork with a generated gradient fallback,
 * the scrolling poster row and bilingual helpers.
 */
import { ArrowRight, ChevronLeft, ChevronRight, LoaderCircle, type LucideIcon } from "lucide-react";
import {
  useRef,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { AppLink, Artwork } from "@/components/shared/primitives";
import { makeT } from "@/i18n";
import type { Bi, Lang } from "@/types/home";

// eslint-disable-next-line react-refresh/only-export-components
export const t = (v: Bi | undefined, lang: Lang): string => (v ? v[lang] : "");

/** Branded full-page pending state for route transitions (spinner, no copy). */
export function RoutePending() {
  return (
    <div
      className="page-background flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-busy="true"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
    </div>
  );
}

/**
 * Internal link for dynamically built paths. Route paths are parameterised by
 * language, so hrefs are composed at runtime. `AppLink` owns the single route
 * cast (see components/primitives.tsx); this stays as the site-wide shorthand.
 */
export function Na({
  href,
  children,
  className,
  style,
  search,
  label,
}: {
  href: string;
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  search?: Record<string, string | number | undefined>;
  /** Accessible name for icon-only links, which have no text to read. */
  label?: string | undefined;
}) {
  return (
    <AppLink
      href={href}
      className={className}
      style={style}
      search={search}
      ariaLabel={label}
      title={label}
    >
      {children}
    </AppLink>
  );
}

/** Public work URL, addressed by the elCinema-style numeric ID. */
// eslint-disable-next-line react-refresh/only-export-components
export const workPath = (lang: Lang, id: number | string) => `/${lang}/work/${id}`;

/** Public person URL, addressed by the elCinema-style numeric ID. */
// eslint-disable-next-line react-refresh/only-export-components
export const personPath = (lang: Lang, id: number | string) => `/${lang}/person/${id}`;

/**
 * Real artwork when available, deterministic gradient poster otherwise.
 *
 * Thin alias over the `Artwork` primitive — the one fallback design, one set
 * of tokens and one error path (a dead URL degrades to the gradient, never to
 * a broken-image icon). Colour lives in `src/theme/`.
 */
export function PosterArt({
  hue,
  title,
  icon,
  img: imgKey,
  className,
  large = false,
}: {
  hue: number;
  title: string;
  icon?: LucideIcon;
  img?: string | null | undefined;
  className?: string;
  large?: boolean;
}) {
  return (
    <Artwork
      hue={hue}
      alt={title}
      src={imgKey}
      icon={icon}
      large={large}
      className={className ?? ""}
    />
  );
}

/**
 * Scroll-edge visibility for horizontal rails and tables: `start`/`end` are
 * true only while more content actually sits in that direction, so prev/next
 * buttons can render only when they do something instead of always showing.
 * RTL-safe — Chrome/Firefox expose negative `scrollLeft` in RTL, and
 * `Math.abs(scrollLeft)` is the visual distance scrolled from the start edge
 * in both directions, matching the scroll buttons' sign convention.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useScrollEdges(ref: RefObject<HTMLElement | null>): {
  start: boolean;
  end: boolean;
} {
  const [edges, setEdges] = useState({ start: false, end: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      const pos = Math.abs(el.scrollLeft);
      // Small thresholds absorb sub-pixel rounding from snap scrolling.
      setEdges({
        start: max > 2 && pos > 2,
        end: max > 2 && max - pos > 2,
      });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    // Content-driven width changes (the min-width wrapper of the guide table,
    // poster cards in a rail) also flip the edges even without user scrolling.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [ref]);
  return edges;
}

/** Scrolling poster row with section title, arrows and "See all" link. */
export function Row({
  title,
  icon,
  more,
  lang = "en",
  children,
}: {
  title: string;
  icon: ReactNode;
  more?: string;
  lang?: Lang;
  children: ReactNode;
}) {
  const t = makeT(lang);
  const ref = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";
  // Arrows render only for the directions that hold more content; a row or
  // table that fits its container (wide screens) shows none at all.
  const edges = useScrollEdges(ref);
  const scroll = (d: number) => {
    const factor = isRtl ? -d : d;
    ref.current?.scrollBy({ left: factor * ref.current.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-4 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold md:text-2xl">
            <span className="shrink-0 text-primary">{icon}</span>
            <span className="truncate">{title}</span>
          </h2>
          {more && (
            <Na
              href={more}
              className="inline-flex h-8 shrink-0 items-center rounded-full bg-secondary/80 px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3"
            >
              {t("home.seeAll")}
            </Na>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {edges.start && (
            <button
              type="button"
              aria-label={t("home.previous")}
              onClick={() => scroll(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
            >
              {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
          {edges.end && (
            <button
              type="button"
              aria-label={t("home.next")}
              onClick={() => scroll(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
            >
              {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
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
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
              More info <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
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
// eslint-disable-next-line react-refresh/only-export-components
export function fmtDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split("-").map(Number);
  const month = MONTHS[((m ?? 1) - 1) % 12] ?? { en: "", ar: "" };
  return `${d} ${month[lang]} ${y}`;
}

/** "11-02" -> "2 November" / "2 نوفمبر" — the same table, without the year. */
// eslint-disable-next-line react-refresh/only-export-components
export function fmtMonthDay(dateKey: string, lang: Lang): string {
  const [m, d] = dateKey.split("-").map(Number);
  if (!m || !d) return "";
  const month = MONTHS[(m - 1) % 12] ?? { en: "", ar: "" };
  return `${d} ${month[lang]}`;
}
