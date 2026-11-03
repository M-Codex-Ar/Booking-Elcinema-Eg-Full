/**
 * Presentational helpers shared by the live elcinema pages (live work/person
 * details, videos, watch online, lists, booking). All colours come from the
 * design-system tokens in styles.css; links to other elcinema ids are built
 * as internal app routes.
 */
import { ArrowRight, Clapperboard, Star, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { artworkSrc, useArtwork } from "./components/primitives";
import type { Lang } from "./home.shared";
import { Na } from "./ui";

/** Internal path to a live (or sample) work detail page. */
// eslint-disable-next-line react-refresh/only-export-components
export const liveWorkPath = (lang: Lang, id: string) => `/${lang}/work/${id}`;
/** Internal path to a live (or sample) person detail page. */
// eslint-disable-next-line react-refresh/only-export-components
export const livePersonPath = (lang: Lang, id: string) => `/${lang}/person/${id}`;
/** Internal path to a video page. */
// eslint-disable-next-line react-refresh/only-export-components
export const videoPath = (lang: Lang, id?: string) => `/${lang}/video${id ? `/${id}` : ""}`;
/** Internal path to a featured-list page. */
// eslint-disable-next-line react-refresh/only-export-components
export const lineupPath = (lang: Lang, id?: string) => `/${lang}/lineup${id ? `/${id}` : ""}`;
/** Internal path to a booking page. */
// eslint-disable-next-line react-refresh/only-export-components
export const bookingPath = (lang: Lang, id?: string) => `/${lang}/booking${id ? `/${id}` : ""}`;

/**
 * Poster/photo image with a clapperboard placeholder for missing artwork.
 * A URL that is present but dead (a moved CDN asset, a blocked hotlink) takes
 * the same path, so no card can ever show a broken-image icon.
 */
export function LiveImg({
  src,
  alt,
  className = "",
  wide = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  wide?: boolean;
}) {
  const art = useArtwork(artworkSrc(src));
  if (!art.src || art.failed) {
    return (
      <div className={`flex items-center justify-center bg-secondary ${className}`}>
        <Clapperboard className={`${wide ? "h-10 w-10" : "h-8 w-8"} text-muted-foreground`} />
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
      className={`${className} object-cover`}
    />
  );
}

/** Person card with round portrait, used in cast and crew strips. */
export function PersonChip({
  lang,
  id,
  title,
  img,
  size = "md",
}: {
  lang: Lang;
  id: string;
  title: string;
  img: string | null;
  size?: "md" | "lg";
}) {
  const s = size === "lg" ? "w-24 md:w-28" : "w-20 md:w-24";
  return (
    <Na href={livePersonPath(lang, id)} className={`group shrink-0 ${s}`}>
      <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
        <LiveImg src={img} alt={title} className="h-full w-full" />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <UserRound className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h3 className="mt-2 line-clamp-2 text-center text-xs font-bold transition-colors group-hover:text-primary">
        {title}
      </h3>
    </Na>
  );
}

/** Poster card for a live work reference. */
export function LivePoster({
  lang,
  id,
  title,
  img,
  sub,
  badge,
  wide = false,
  fluid = false,
}: {
  lang: Lang;
  id: string;
  title: string;
  img: string | null;
  sub?: ReactNode;
  badge?: ReactNode;
  wide?: boolean;
  /** Fill the grid cell instead of a fixed width, for poster grids. */
  fluid?: boolean;
}) {
  return (
    <div
      className={`group ${fluid ? "w-full max-w-44" : "shrink-0 snap-start"} ${wide ? "w-64 md:w-72" : fluid ? "" : "w-36 md:w-44"}`}
    >
      <Na href={liveWorkPath(lang, id)} className="block">
        <div
          className={`hover-lift relative overflow-hidden rounded-xl bg-secondary ${wide ? "aspect-video" : "aspect-[2/3]"}`}
        >
          <LiveImg src={img} alt={title} className="h-full w-full" wide />
          {badge && <div className="absolute top-2 end-2 max-w-[85%]">{badge}</div>}
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

/** Rating pill in the elCinema style. */
export function RatingPill({ rating, votes }: { rating: number | null; votes: number | null }) {
  if (rating === null) return null;
  return (
    <span className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 shadow-sm">
      <Star className="h-4 w-4 fill-gold text-gold" />
      <b className="text-foreground">{rating.toFixed(1)}</b>
      <span className="text-xs text-muted-foreground">
        {votes !== null ? `· ${votes}` : "/ 10"}
      </span>
    </span>
  );
}

/** Friendly error panel for pages whose live scrape failed. */
export function LiveError({ message, lang }: { message: string; lang: Lang }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
      <h1 className="text-2xl font-black">
        {lang === "ar" ? "تعذّر التحميل" : "Couldn't load this page"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Na
        href={`/${lang}`}
        className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
      >
        {lang === "ar" ? "الصفحة الرئيسية" : "Go home"}
      </Na>
    </div>
  );
}
