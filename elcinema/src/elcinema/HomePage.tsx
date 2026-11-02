/**
 * elCinema homepage, rendered with the dark cinema design system.
 * Data comes from the parsed elcinema.com/en/ homepage (EcHomeData).
 * Rendered inside the bilingual shell, which supplies the site header/footer.
 *
 * Every card link goes through `cardLink`: internal pages when the app has
 * one (sample-matched work/person detail, now/soon/boxoffice/tvguide/search),
 * otherwise the real elcinema.com page in a new tab — a raw elcinema.com
 * navigation inside the app produced "refused to connect".
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Play,
  Ticket,
  Tv,
  TrendingUp,
  ListVideo,
  MonitorPlay,
} from "lucide-react";
import type { EcHomeData, EcPromo, EcTvSlot, EcVod } from "./home.shared";
import { cardLink } from "./links";
import { Na } from "./ui";
import type { Lang } from "./home.shared";

/** Anchor that never navigates the app to elcinema.com (see links.ts). */
function CardA({
  href,
  title,
  lang,
  className,
  style,
  children,
}: {
  href: string;
  title?: string;
  lang: Lang;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const link = cardLink(lang, href, title);
  return link.external ? (
    <a href={link.href} target="_blank" rel="noreferrer" className={className} style={style}>
      {children}
    </a>
  ) : (
    <Na href={link.href} className={className} style={style}>
      {children}
    </Na>
  );
}

function Hero({ promos, lang }: { promos: EcPromo[]; lang: Lang }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (promos.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % promos.length), 6000);
    return () => clearInterval(t);
  }, [promos.length]);
  if (!promos.length) return null;
  const p = promos[Math.min(i, promos.length - 1)];
  if (!p) return null;
  return (
    <section className="relative h-[50vh] w-full overflow-hidden md:h-[65vh]">
      {promos.map((promo, idx) => (
        <img
          key={idx}
          src={promo.img ?? ""}
          alt={promo.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-7xl p-6 md:p-12">
        <h1 className="max-w-2xl text-3xl font-black md:text-5xl">{p.title}</h1>
        <CardA
          href={p.href}
          title={p.title}
          lang={lang}
          className="animate-pulse-neon mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Play className="h-4 w-4 fill-current" /> {p.button || "More info"}
        </CardA>
        <div className="mt-6 flex gap-2">
          {promos.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-4 bg-muted-foreground/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({
  title,
  icon,
  more,
  lang,
  children,
}: {
  title: string;
  icon: ReactNode;
  more?: string;
  lang: Lang;
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
            <CardA
              href={more}
              lang={lang}
              className="me-2 text-sm font-semibold text-primary hover:underline"
            >
              See all
            </CardA>
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

function Poster({
  href,
  img,
  title,
  sub,
  badge,
  wide,
  lang,
}: {
  href: string;
  img: string | null;
  title: string;
  sub?: ReactNode;
  badge?: ReactNode;
  wide?: boolean;
  lang: Lang;
}) {
  return (
    <div className={`group shrink-0 snap-start ${wide ? "w-64 md:w-72" : "w-36 md:w-44"}`}>
      <CardA href={href} title={title} lang={lang} className="block">
        <div
          className={`hover-lift relative overflow-hidden rounded-xl bg-secondary ${wide ? "aspect-video" : "aspect-[2/3]"}`}
        >
          {img ? (
            <img
              src={img}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Clapperboard className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
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
      </CardA>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

/**
 * Timeline slots from the source can overlap (a short program nested inside a
 * longer one). Re-lay them out so every slot owns a clean, non-overlapping
 * stretch of the row: sort by start, clip each slot against its neighbours,
 * and drop anything left with no visible room.
 */
function layoutSlots(slots: EcTvSlot[]): { s: EcTvSlot; left: number; width: number }[] {
  const sorted = [...slots].sort((a, b) => a.left - b.left);
  const placed: { s: EcTvSlot; left: number; width: number }[] = [];
  let prevEnd = 0;
  sorted.forEach((s, i) => {
    const start = Math.max(s.left, prevEnd);
    const nextStart = i + 1 < sorted.length ? (sorted[i + 1]?.left ?? 100) : 100;
    const width = Math.min(s.left + s.width, nextStart) - start;
    if (width > 1) {
      placed.push({ s, left: start, width });
      prevEnd = start + width;
    }
  });
  return placed;
}

function VodBadge({ vod }: { vod: EcVod | null }) {
  if (!vod) return null;
  return (
    <span className="rounded-md bg-background/80 px-2 py-1 text-[10px] font-bold backdrop-blur-sm">
      {vod.img ? <img src={vod.img} alt={vod.label} className="h-4" /> : vod.label}
    </span>
  );
}

export function HomePage({ data, lang }: { data: EcHomeData; lang: Lang }) {
  const guide = data.tvGuide;
  return (
    <div className="min-h-screen bg-background">
      <Hero promos={data.promos} lang={lang} />

      {data.movies.length > 0 && (
        <Row
          title="Now in Cinemas"
          icon={<Ticket className="h-5 w-5" />}
          more="/en/now/"
          lang={lang}
        >
          {data.movies.map((m, i) => (
            <Poster
              key={i}
              href={m.href}
              img={m.img}
              title={m.title}
              lang={lang}
              sub={
                m.bookingHref && (
                  <CardA
                    href={m.bookingHref}
                    title={m.title}
                    lang={lang}
                    className="font-semibold text-primary hover:underline"
                  >
                    Book tickets
                  </CardA>
                )
              }
            />
          ))}
        </Row>
      )}

      {data.watchOnline.length > 0 && (
        <Row
          title="Watch Online"
          icon={<MonitorPlay className="h-5 w-5" />}
          more="/en/vod/"
          lang={lang}
        >
          {data.watchOnline.map((w, i) => (
            <Poster
              key={i}
              href={w.href}
              img={w.img}
              title={w.title}
              lang={lang}
              sub={w.meta}
              badge={<VodBadge vod={w.vod} />}
            />
          ))}
        </Row>
      )}

      {data.tvSummary.length > 0 && (
        <Row title="On TV Now" icon={<Tv className="h-5 w-5" />} more="/en/tvguide/" lang={lang}>
          {data.tvSummary.map((t, i) => (
            <Poster
              key={i}
              href={t.href}
              img={t.img}
              title={t.title}
              lang={lang}
              badge={<VodBadge vod={t.vod} />}
              sub={
                <span className="flex items-center gap-1">
                  {t.channelImg && (
                    <img src={t.channelImg} alt={t.channelName} className="h-4 rounded" />
                  )}
                  {t.airtime}
                </span>
              }
            />
          ))}
        </Row>
      )}

      {guide.lines.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl md:text-2xl">
            <Tv className="h-5 w-5 shrink-0 text-primary" /> TV Guide
          </h2>

          {/* Day timeline with sticky channel column, visible and scrollable
              at every screen size; the rounded card clips the inner scroll
              area so the scrollbar stays inside the table. */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto overscroll-x-contain">
              <div className="min-w-[560px] sm:min-w-[720px] lg:min-w-[960px]">
                <div className="sticky top-0 z-10 flex border-b border-border bg-card/95 text-xs text-muted-foreground backdrop-blur-sm">
                  <div className="w-32 shrink-0" />
                  <div className="flex flex-1">
                    {guide.times.map((t, i) => (
                      <div
                        key={i}
                        className="min-w-0 flex-1 truncate px-2 py-3 text-center sm:px-3"
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                {guide.lines.map((line, i) => (
                  <div key={i} className="flex border-b border-border/60 last:border-0">
                    <CardA
                      href={line.channelHref}
                      title={line.channelName}
                      lang={lang}
                      className="sticky start-0 z-[1] flex w-32 shrink-0 items-center justify-center gap-2 border-e border-border/60 bg-card/95 p-2 backdrop-blur-sm transition-colors hover:bg-secondary"
                    >
                      {line.channelImg ? (
                        <img
                          src={line.channelImg}
                          alt={line.channelName}
                          className="max-h-8 max-w-24 object-contain"
                        />
                      ) : (
                        <span className="truncate text-xs font-semibold">{line.channelName}</span>
                      )}
                    </CardA>
                    <div className="relative h-14 flex-1">
                      {layoutSlots(line.slots).map(({ s, left, width }, j) =>
                        s.titleHref && !s.unclickable ? (
                          <CardA
                            key={j}
                            href={s.titleHref}
                            title={s.title}
                            lang={lang}
                            style={{ left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)` }}
                            className="absolute inset-y-1.5 overflow-hidden rounded-md border border-border bg-secondary px-2.5 py-1 text-xs transition-colors hover:border-primary"
                          >
                            <div className="truncate font-semibold">{s.title}</div>
                            <div className="truncate text-muted-foreground">{s.time}</div>
                          </CardA>
                        ) : (
                          <div
                            key={j}
                            style={{ left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)` }}
                            className="absolute inset-y-1.5 overflow-hidden rounded-md border border-border bg-secondary px-2.5 py-1 text-xs"
                          >
                            <div className="truncate font-semibold">{s.title}</div>
                            <div className="truncate text-muted-foreground">{s.time}</div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {data.videos.length > 0 && (
        <Row title="Videos" icon={<Play className="h-5 w-5" />} more="/en/video/" lang={lang}>
          {data.videos.map((v, i) => (
            <Poster
              key={i}
              wide
              href={v.href}
              img={v.img}
              title={v.title}
              lang={lang}
              badge={
                v.duration && (
                  <span className="rounded-md bg-background/80 px-2 py-1 text-[10px] font-bold">
                    {v.duration}
                  </span>
                )
              }
            />
          ))}
        </Row>
      )}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2 md:px-8">
        {data.boxoffice.length > 0 && (
          <div className="glass-card cinema-gradient p-6">
            <h2 className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-primary" /> Box Office
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">{data.boxofficeDate}</p>
            <ol className="space-y-3">
              {data.boxoffice.map((b, i) => (
                <li key={i}>
                  <CardA
                    href={b.href}
                    title={b.title}
                    lang={lang}
                    className="group flex items-center gap-3"
                  >
                    <span className="w-6 text-lg font-black text-primary">{i + 1}</span>
                    {b.img && (
                      <img
                        src={b.img}
                        alt={b.title}
                        className="h-14 w-10 rounded-md object-cover"
                      />
                    )}
                    <span className="flex-1 font-semibold group-hover:text-primary">{b.title}</span>
                    <span className="text-sm font-bold text-gold">{b.revenue}</span>
                  </CardA>
                </li>
              ))}
            </ol>
          </div>
        )}
        {data.lists.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl">
              <ListVideo className="h-5 w-5 text-primary" /> Lists
            </h2>
            <ul className="divide-y divide-border">
              {data.lists.map((l, i) => (
                <li key={i}>
                  <CardA
                    href={l.href}
                    title={l.title}
                    lang={lang}
                    className="block py-3 text-sm font-semibold transition-colors hover:text-primary"
                  >
                    {l.title}
                  </CardA>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
