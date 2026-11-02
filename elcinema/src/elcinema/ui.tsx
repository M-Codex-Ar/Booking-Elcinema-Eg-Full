/**
 * Shared presentational pieces for the elCinema experience: a type-loose
 * internal link, real poster artwork with a generated gradient fallback,
 * the scrolling poster row and bilingual helpers.
 */
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { Artwork } from "./components/primitives";
import { makeT } from "./i18n";
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

/**
 * Real artwork when available, deterministic gradient poster otherwise.
 *
 * Thin alias over the `Artwork` primitive, kept so existing pages keep
 * compiling while they migrate: one implementation means one fallback design,
 * one set of tokens and one error path (a dead URL degrades to the gradient,
 * never to a broken-image icon). The inline `hsl()` gradients this function
 * used to compute are gone with it — colour lives in `src/theme/`.
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
              className="shrink-0 rounded-full bg-secondary/80 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3"
            >
              {t("home.seeAll")}
            </Na>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label={t("home.previous")}
            onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
          >
            {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label={t("home.next")}
            onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
          >
            {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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

/** "11-02" -> "2 November" / "2 نوفمبر" — the same table, without the year. */
export function fmtMonthDay(dateKey: string, lang: Lang): string {
  const [m, d] = dateKey.split("-").map(Number);
  if (!m || !d) return "";
  const month = MONTHS[(m - 1) % 12] ?? { en: "", ar: "" };
  return `${d} ${month[lang]}`;
}
