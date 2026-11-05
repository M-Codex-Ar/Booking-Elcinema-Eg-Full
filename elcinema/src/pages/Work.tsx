/**
 * Movie detail — rendered from the local catalogue:
 * poster and rating header, bilingual details block, story, director/writer/
 * cast with person links, Watch Online, per-day showtimes across cinemas,
 * photos, awards and related works. Sample data, bilingual by design.
 */
import { CalendarClock, Clock, Film, Play, Star, Ticket } from "lucide-react";
import { useState } from "react";
import { MOVIES, GENRES } from "@/lib/data";
import {
  dayLabel,
  movieById,
  movieBySlug,
  movieMeta,
  personById,
  showtimesDays,
  showtimesFor,
  watchOnlineFor,
  workId,
} from "@/lib/build";
import { Na, PosterArt, fmtDate, t, workPath } from "@/components/shared/ui";
import type { Lang, Movie } from "@/types/home";
import { makeT } from "@/i18n";
import { bookingPath } from "@/features/live/live-ui";

export function WorkPage({ lang, id }: { lang: Lang; id: string }) {
  const copy = makeT(lang);
  const movie = movieBySlugOrId(id);
  const [day, setDay] = useState(0);

  if (!movie) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <Film className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-black">{copy("work.notFound")}</h1>
        <Na
          href={`/${lang}/now`}
          className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
        >
          {copy("now.title")}
        </Na>
      </div>
    );
  }

  const meta = movieMeta(movie);
  const vod = watchOnlineFor(movie);
  const dayCount = showtimesDays(movie);
  const activeDay = Math.min(day, Math.max(dayCount - 1, 0));
  const showtimes = showtimesFor(movie, activeDay);
  const similar = moviesSimilar(movie);

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-[38vh] w-full overflow-hidden md:h-[46vh]">
        <PosterArt hue={movie.hue} title={movie.title[lang]} img={movie.poster} large />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header: poster + title + actions, like the real work page */}
        <div className="relative z-10 -mt-28 flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
          <div className="flex items-end gap-4 md:contents">
            <div className="w-28 shrink-0 overflow-hidden rounded-2xl border border-border shadow-2xl sm:w-36 md:w-52">
              <div className="aspect-[2/3]">
                <PosterArt hue={movie.hue} title={movie.title[lang]} img={movie.poster} />
              </div>
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <h1 className="text-3xl font-black md:text-4xl">
                {movie.title[lang]}{" "}
                <span className="font-bold text-muted-foreground">
                  ({movie.release.slice(0, 4)})
                </span>
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {movie.genres.map((g) => (
                  <span key={g} className="rounded-full bg-secondary px-3 py-1 font-semibold">
                    {t(GENRES[g], lang)}
                  </span>
                ))}
                <span className="rounded-full border border-border px-3 py-1 font-bold text-muted-foreground">
                  {movie.cert}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 shadow-sm">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <b className="text-foreground">{meta.rating.toFixed(1)}</b>
                  <span className="text-xs">/ 10</span>
                </span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-4 w-4 text-primary" /> {fmtDate(movie.release, lang)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" /> {movie.runtime}{" "}
                  {copy("common.runtimeMinutes")}
                </span>
              </div>
            </div>
          </div>
          <div className="pb-2 md:pb-2">
            <Na
              href={`/${lang}/booking/${workId(movie)}`}
              className="animate-pulse-neon inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Ticket className="h-4 w-4" /> {copy("booking.title")}
            </Na>
            <div className="mt-2 text-center text-xs text-muted-foreground">
              {copy("work.rating")}: {meta.votes}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-10 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            {/* Details list, elCinema-style */}
            <dl className="glass-card grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 p-5 text-sm">
              <dt className="font-bold text-muted-foreground">{copy("common.movieType")}</dt>
              <dd>{movie.country[lang]}</dd>
              <dt className="font-bold text-muted-foreground">{copy("work.releaseDateColon")}</dt>
              <dd>
                {fmtDate(movie.release, lang)} ({movie.country[lang]})
              </dd>
              <dt className="font-bold text-muted-foreground">{copy("common.languageColon")}</dt>
              <dd>{meta.language[lang]}</dd>
              <dt className="font-bold text-muted-foreground">{copy("common.directorColon")}</dt>
              <dd>{movie.director[lang]}</dd>
              <dt className="font-bold text-muted-foreground">{copy("common.writerColon")}</dt>
              <dd>{meta.writer[lang]}</dd>
              <dt className="font-bold text-muted-foreground">{copy("common.castColon")}</dt>
              <dd>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {movie.cast.map((p, i) => {
                    const personIdNum = movie.castIds[i];
                    const person = personIdNum ? personById.get(Number(personIdNum)) : undefined;
                    return person ? (
                      <Na
                        key={i}
                        href={`/${lang}/person/${person.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {p[lang]}
                      </Na>
                    ) : (
                      <span key={i} className="font-semibold">
                        {p[lang]}
                      </span>
                    );
                  })}
                </div>
              </dd>
            </dl>

            {/* Story */}
            <h2 className="mt-8 text-lg font-black">{copy("common.story")}</h2>
            <p className="mt-2 text-base leading-relaxed text-foreground/90">
              {movie.synopsis[lang]}
            </p>
          </div>

          {/* Sidebar: Watch Online */}
          <div className="space-y-6">
            {vod.length > 0 && (
              <div className="glass-card h-fit p-5">
                <h2 className="text-lg font-black">{copy("vod.title")}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {vod
                    .filter(
                      (w, i, arr) =>
                        arr.findIndex((x) => x.label === w.label && x.note.en === w.note.en) === i,
                    )
                    .map((w, i) => (
                      <a
                        key={i}
                        href={w.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-bold transition-colors hover:border-primary hover:text-primary"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {w.label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        <span className="text-xs font-semibold text-muted-foreground">
                          {w.note[lang]}
                        </span>
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Showtimes with day tabs */}
        <section className={dayCount > 0 ? "mt-10" : "mt-10 hidden"}>
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Ticket className="h-5 w-5 text-primary" /> {copy("work.showtimes")}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: dayCount }, (_, i) => {
              const label = dayLabel(i, lang);
              return (
                <button
                  key={i}
                  onClick={() => setDay(i)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                    day === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {label[lang]}
                </button>
              );
            })}
          </div>
          <div className="row-grid mt-4">
            {showtimes.map(({ cinema, times }) => (
              <div key={cinema.id} className="glass-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold">{cinema.name[lang]}</div>
                  <Na
                    href={bookingPath(lang, String(workId(movie)))}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Ticket className="h-3.5 w-3.5" /> {copy("common.getTickets")}
                  </Na>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {times.map((tm) => (
                    <span
                      key={tm}
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

        {/* Similar */}
        {similar.length > 0 && (
          <section className="py-10">
            <h2 className="mb-4 text-xl font-black">{copy("work.similar")}</h2>
            <div className="poster-grid">
              {similar.map((m) => (
                <SimilarCard key={m.slug} movie={m} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SimilarCard({ movie, lang }: { movie: Movie; lang: Lang }) {
  return (
    <Na href={workPath(lang, workId(movie))} className="group w-full">
      <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
        <PosterArt hue={movie.hue} title={movie.title[lang]} img={movie.poster} />
      </div>
      <h3 className="mt-2 line-clamp-1 text-xs font-bold transition-colors group-hover:text-primary">
        {movie.title[lang]}
      </h3>
      <div className="text-meta text-muted-foreground">{fmtDate(movie.release, lang)}</div>
    </Na>
  );
}

/** Resolves either the numeric work ID or a text name slug. */
function movieBySlugOrId(id: string) {
  if (/^\d+$/.test(id)) return movieById.get(Number(id)) ?? movieBySlug.get(id);
  return movieBySlug.get(id);
}

/** Movies sharing at least one genre, self excluded, up to 6. */
function moviesSimilar(movie: Movie) {
  return MOVIES.filter(
    (m) => m.slug !== movie.slug && m.genres.some((g) => movie.genres.includes(g)),
  ).slice(0, 6);
}
