/**
 * Live movie detail — mirrors the real elcinema.com /work/<id>/ page with the
 * app's dark cinema design system. Data is scraped server-side (live.server.ts)
 * from the English or Arabic edition. Every elCinema link stays inside the
 * app; only true playback actions open their streaming destination.
 */
import {
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Film,
  Images,
  MonitorPlay,
  Star,
  Ticket,
  Tv,
} from "lucide-react";
import { useRef, useState } from "react";
import { ImgWithFallback } from "@/components/shared/primitives";
import type { Lang } from "@/types/home";
import type { LiveWork } from "@/types/live";
import { Na, Row, useScrollEdges } from "@/components/shared/ui";
import {
  LiveImg,
  LivePoster,
  PersonChip,
  RatingPill,
  bookingPath,
  videoPath,
} from "@/features/live/live-ui";
import { makeT } from "@/i18n";

const DAY_COUNT = 5;

export function LiveWorkPage({ data, lang }: { data: LiveWork; lang: Lang }) {
  const t = makeT(lang);
  const castRailRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";
  // Scroll arrows render only for the directions that hold more cast cards.
  const castEdges = useScrollEdges(castRailRef);
  const [day, setDay] = useState(0);
  const showtimes = data.showtimes.slice(0, DAY_COUNT);
  const dayIndex = Math.min(day, Math.max(showtimes.length - 1, 0));
  const current = showtimes[dayIndex];
  const scrollCast = (direction: number) => {
    const rail = castRailRef.current;
    if (!rail) return;
    const factor = isRtl ? -direction : direction;
    rail.scrollBy({ left: factor * rail.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div>
      {/* Backdrop + poster header, elCinema style */}
      <div className="relative h-[38vh] w-full overflow-hidden md:h-[46vh]">
        <ImgWithFallback
          src={data.poster}
          alt={data.title}
          className="h-full w-full object-center"
          fallback={
            <div className="flex h-full items-center justify-center bg-secondary">
              <Film className="h-16 w-16 text-muted-foreground" />
            </div>
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative z-10 -mt-32 flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
          <div className="flex items-end gap-4 md:contents">
            <div className="w-28 shrink-0 overflow-hidden rounded-2xl border border-border shadow-2xl sm:w-36 md:w-52">
              <div className="aspect-[2/3]">
                <LiveImg src={data.poster} alt={data.title} className="h-full w-full" />
              </div>
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <h1 className="text-3xl font-black md:text-4xl">
                {data.title}{" "}
                {data.year && (
                  <span className="font-bold text-muted-foreground">({data.year})</span>
                )}
              </h1>
              {data.altTitle && data.altTitle !== data.title && (
                <p className="mt-1 text-sm text-muted-foreground">{data.altTitle}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {data.category && (
                  <span className="rounded-full bg-secondary px-3 py-1 font-semibold">
                    {data.category}
                  </span>
                )}
                {data.genres.map((g) => (
                  <span key={g} className="rounded-full bg-secondary px-3 py-1 font-semibold">
                    {g}
                  </span>
                ))}
                {data.censorship.length > 0 && (
                  <span className="rounded-full border border-border px-3 py-1 font-bold text-muted-foreground">
                    {data.censorship.join(" · ")}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <RatingPill rating={data.rating} votes={data.votes} />
                {data.releaseDate && (
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-4 w-4 text-primary" /> {data.releaseDate}
                  </span>
                )}
                {data.runtimeMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" /> {data.runtimeMinutes}{" "}
                    {t("common.runtimeMinutes")}
                  </span>
                )}
                {data.country && <span>{data.country}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pb-2">
            <Na
              href={bookingPath(lang, data.id)}
              className="animate-pulse-neon inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Ticket className="h-4 w-4" /> {t("booking.title")}
            </Na>
            {data.rating !== null && (
              <div className="text-center text-xs text-muted-foreground">
                {t("work.rating")}
                {data.votes !== null ? `: ${data.votes}` : ""}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            {data.synopsis && (
              <>
                <h2 className="text-lg font-black">{t("common.story")}</h2>
                <p className="mt-2 text-base leading-relaxed text-foreground/90">{data.synopsis}</p>
              </>
            )}

            {/* Details list, elCinema style */}
            <dl className="glass-card mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 p-5 text-sm">
              {data.director.length > 0 && (
                <>
                  <dt className="font-bold text-muted-foreground">{t("common.directorColon")}</dt>
                  <dd className="flex flex-wrap gap-x-3 gap-y-1">
                    {data.director.map((p) => (
                      <Na
                        key={p.id}
                        href={`/${lang}/person/${p.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {p.title}
                      </Na>
                    ))}
                  </dd>
                </>
              )}
              {data.writers.length > 0 && (
                <>
                  <dt className="font-bold text-muted-foreground">{t("common.writerColon")}</dt>
                  <dd className="flex flex-wrap gap-x-3 gap-y-1">
                    {data.writers.map((p) => (
                      <Na
                        key={p.id}
                        href={`/${lang}/person/${p.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {p.title}
                      </Na>
                    ))}
                  </dd>
                </>
              )}
              {data.cast.length > 0 && (
                <>
                  <dt className="font-bold text-muted-foreground">{t("common.castColon")}</dt>
                  <dd>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {data.cast.map((p) => (
                        <Na
                          key={p.id}
                          href={`/${lang}/person/${p.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {p.title}
                        </Na>
                      ))}
                    </div>
                  </dd>
                </>
              )}
              {data.country && (
                <>
                  <dt className="font-bold text-muted-foreground">{t("common.countryColon")}</dt>
                  <dd>{data.country}</dd>
                </>
              )}
            </dl>

            {/* Cast cards */}
            {data.cast.length > 0 && (
              <section className="mt-8 min-w-0">
                <div className="mb-3 flex min-w-0 items-center justify-between gap-2 sm:gap-3">
                  <h2 className="min-w-0 truncate text-lg font-black">{t("common.castColon")}</h2>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    {castEdges.start && (
                      <button
                        type="button"
                        aria-label={t("home.previous")}
                        onClick={() => scrollCast(-1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
                      >
                        {isRtl ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    {castEdges.end && (
                      <button
                        type="button"
                        aria-label={t("home.next")}
                        onClick={() => scrollCast(1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
                      >
                        {isRtl ? (
                          <ChevronLeft className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div
                  ref={castRailRef}
                  className="scrollbar-hide flex min-w-0 snap-x gap-4 overflow-x-auto overscroll-x-contain pb-2"
                >
                  {data.cast.map((p) => (
                    <PersonChip key={p.id} lang={lang} id={p.id} title={p.title} img={p.img} />
                  ))}
                </div>
              </section>
            )}

            {/* Photos */}
            {data.photos.length > 0 && (
              <section className="mt-8">
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <Images className="h-5 w-5 text-primary" /> {t("common.photos")}
                </h2>
                <div className="scrollbar-hide mt-3 flex gap-3 overflow-x-auto pb-2">
                  {data.photos.map((p, i) => (
                    <div
                      key={i}
                      className="w-44 shrink-0 overflow-hidden rounded-lg border border-border"
                    >
                      <div className="aspect-video">
                        <LiveImg src={p.img} alt={data.title} className="h-full w-full" wide />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: watch-online play links (true playback actions) */}
          {data.vod.length > 0 && (
            <div className="space-y-6">
              <div className="glass-card h-fit p-5">
                <h2 className="text-lg font-black">{t("vod.title")}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.vod.map((v, i) => (
                    <a
                      key={i}
                      href={v.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-bold hover:border-primary"
                    >
                      <MonitorPlay className="me-1 inline h-4 w-4 text-primary" />
                      {t("vod.watchOn")} {v.label}
                      {v.note && (
                        <span className="ms-1 text-xs text-muted-foreground">({v.note})</span>
                      )}
                    </a>
                  ))}
                </div>
                <p className="mt-3 text-meta text-muted-foreground">{t("vod.playbackNote")}</p>
              </div>
              {data.imdbUrl && (
                <div className="glass-card p-5 text-sm">
                  <a
                    href={data.imdbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    IMDB Page <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Showtimes preview with day tabs (full booking on the booking page) */}
        {current && (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Ticket className="h-5 w-5 text-primary" /> {t("work.showtimes")}
              </h2>
              <Na
                href={bookingPath(lang, data.id)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t("booking.title")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Na>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {showtimes.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDay(i)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                    dayIndex === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {d.day}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {current.cinemas.slice(0, 6).map((c) => (
                <div key={c.id} className="glass-card p-4">
                  <div className="font-bold">{c.name}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.times.slice(0, 8).map((tm, j) => (
                      <span
                        key={j}
                        className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-bold"
                      >
                        {tm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* elCinema TV videos */}
        {data.videos.length > 0 && (
          <section className="py-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
              <Tv className="h-5 w-5 text-primary" /> {t("video.brand")}
            </h2>
            <div className="grid grid-cols-2 justify-items-center gap-4 md:grid-cols-4">
              {data.videos.slice(0, 4).map((v) => (
                <Na key={v.id} href={videoPath(lang, v.id)} className="group w-full">
                  <div className="hover-lift relative aspect-video overflow-hidden rounded-xl bg-secondary">
                    <LiveImg src={v.img} alt={v.title} className="h-full w-full" wide />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                        Play ▶
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-bold transition-colors group-hover:text-primary">
                    {v.title}
                  </h3>
                </Na>
              ))}
            </div>
          </section>
        )}

        {/* Related strip */}
        {data.related.length > 0 && (
          <Row
            title={t("work.related")}
            icon={<Film className="h-5 w-5" />}
            more={`/${lang}/now`}
            lang={lang}
          >
            {data.related.slice(0, 12).map((r) => (
              <LivePoster key={r.id} lang={lang} id={r.id} title={r.title} img={r.img} />
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

/** Used by the route to build the not-found panel. */
export function LiveWorkNotFound({ lang }: { lang: Lang }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
      <Star className="mx-auto h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-black">{makeT(lang)("work.notFound")}</h1>
      <Na
        href={`/${lang}/now`}
        className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
      >
        {makeT(lang)("now.title")}
      </Na>
    </div>
  );
}
