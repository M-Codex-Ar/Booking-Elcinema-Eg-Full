/**
 * Book tickets — internal pages for the booking flow: the list of movies now
 * playing (from the homepage scrape) and, per movie, the cinemas and
 * showtimes for the next days. For sample-catalogue movies the built-in
 * showtime generator is used; for live movies the showtimes are scraped from
 * the real work page. The final "tickets" action opens the real ticket
 * service in a new tab — browsing stays inside the app.
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CalendarClock, Ticket } from "lucide-react";
import { useState } from "react";
import { getElcinemaHomeFn } from "@/features/home/home.functions";
import { dayLabel, movieById } from "@/lib/build";
import { getLiveWorkFn } from "@/features/live/live.functions";
import { cardLink } from "@/lib/links";
import type { Lang } from "@/features/home/home.shared";
import type { LiveWork } from "@/features/live/live.shared";
import { LiveImg, LiveError, liveWorkPath } from "@/features/live/live-ui";
import { Na } from "@/components/shared/ui";
import {
  FilterInput,
  ListToolbar,
  Pagination,
  SortSelect,
  ViewToggle,
  listText,
  matches,
  paginate,
  sortByText,
  textSortOptions,
  useListState,
} from "@/components/shared/controls";
import { makeT } from "@/i18n";

const homeQueryOptions = queryOptions({
  queryKey: ["elcinema-home"],
  queryFn: () => getElcinemaHomeFn(),
  staleTime: 5 * 60 * 1000,
});

const liveWorkQueryOptions = (lang: Lang, id: string) =>
  queryOptions({
    queryKey: ["elcinema-live-work", lang, id],
    queryFn: () => getLiveWorkFn({ data: { lang, id } }),
    staleTime: 10 * 60 * 1000,
  });

// ---------------------------------------------------------------------------
// Booking index: every movie now playing
// ---------------------------------------------------------------------------

export function BookingIndexPage({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const home = useSuspenseQuery(homeQueryOptions).data;
  const tx = listText(lang);
  const st = useListState();
  const all = (home.data?.movies ?? [])
    .map((m) => ({
      ...m,
      id: /\/booking\/(\d+)/.exec(m.bookingHref ?? "")?.[1] ?? /\/work\/(\d+)/.exec(m.href)?.[1],
    }))
    .filter((m): m is typeof m & { id: string } => !!m.id);
  const filtered = sortByText(
    all.filter((m) => matches(m.title, st.q)),
    st.sort,
    (m) => m.title,
    lang,
  );
  const { page, pages, shown } = paginate(filtered, st.page, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-black md:text-3xl">
        <Ticket className="h-6 w-6 text-primary" /> {t("booking.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("booking.subtitle")}</p>

      <ListToolbar>
        <FilterInput lang={lang} value={st.q} onChange={st.setQ} />
        <span className="grow" />
        <SortSelect
          lang={lang}
          value={st.sort}
          onChange={st.setSort}
          options={textSortOptions(lang)}
        />
        <ViewToggle lang={lang} view={st.view} onChange={st.setView} />
      </ListToolbar>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{tx.none}</p>
      )}

      {st.view === "grid" ? (
        <div className="mt-8 grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {shown.map((m) => (
            <Na key={m.id} href={`/${lang}/booking/${m.id}`} className="group w-full max-w-44">
              <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
                <LiveImg src={m.img} alt={m.title} className="h-full w-full" />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {t("common.getTickets")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </span>
                </div>
              </div>
              <h3 className="mt-3 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary">
                {m.title}
              </h3>
            </Na>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {shown.map((m) => (
            <Na
              key={m.id}
              href={`/${lang}/booking/${m.id}`}
              className="glass-card hover-lift group flex items-center gap-4 p-3"
            >
              <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                <div className="aspect-[2/3]">
                  <LiveImg src={m.img} alt={m.title} className="h-full w-full" />
                </div>
              </div>
              <h3 className="min-w-0 flex-1 truncate font-bold group-hover:text-primary">
                {m.title}
              </h3>
              <span className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                <Ticket className="inline h-3.5 w-3.5" /> {t("common.getTickets")}
              </span>
            </Na>
          ))}
        </div>
      )}

      <Pagination lang={lang} page={page} pages={pages} onChange={st.setPage} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Booking for one movie: day tabs + cinemas
// ---------------------------------------------------------------------------

export function BookingMoviePage({
  lang,
  id,
  data,
}: {
  lang: Lang;
  id: string;
  data: LiveWork | null;
}) {
  const t = makeT(lang);
  const [day, setDay] = useState(0);

  // Built-in dataset movie: its real scraped showtimes.
  const sampleMovie = movieById.get(Number(id));
  const days = sampleMovie
    ? sampleMovie.showtimes.map((d) => ({
        day: dayLabel(d.dayOffset, lang)[lang],
        cinemas: d.cinemas.map((c) => ({
          id: c.id,
          name: c.name[lang],
          times: c.times,
          bookingHref: c.bookingHref,
        })),
      }))
    : (data?.showtimes.slice(0, 5) ?? []);

  const dayIndex = Math.min(day, Math.max(days.length - 1, 0));
  const current = days[dayIndex];
  const title = sampleMovie ? sampleMovie.title[lang] : (data?.title ?? "");
  const poster = sampleMovie ? null : (data?.poster ?? null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Na
        href={`/${lang}/booking`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("booking.back")}
      </Na>

      <div className="mt-4 flex items-start gap-4">
        <div className="hidden w-28 shrink-0 overflow-hidden rounded-xl border border-border sm:block">
          <div className="aspect-[2/3]">
            <LiveImg src={poster} alt={title} className="h-full w-full" />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-black md:text-3xl">{title}</h1>
          <h2 className="mt-1 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <CalendarClock className="h-4 w-4 text-primary" /> {t("booking.cinemas")}
          </h2>
          {!sampleMovie && (
            <Na
              href={liveWorkPath(lang, id)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {t("booking.moviePage")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Na>
          )}
        </div>
      </div>

      {sampleMovie && (
        <p className="mt-4 text-xs text-muted-foreground">{t("booking.sampleNote")}</p>
      )}

      {days.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {days.map((d, i) => (
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
      )}

      {current && current.cinemas.length > 0 ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {current.cinemas.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold">{c.name}</div>
                {c.bookingHref &&
                  (() => {
                    const cl = cardLink(lang, c.bookingHref);
                    return cl.external ? (
                      <a
                        href={cl.href}
                        target="_blank"
                        rel="noreferrer"
                        className="animate-pulse-neon inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        <Ticket className="h-3.5 w-3.5" /> {t("common.getTickets")}
                      </a>
                    ) : (
                      <Na
                        href={cl.href}
                        className="animate-pulse-neon inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        <Ticket className="h-3.5 w-3.5" /> {t("common.getTickets")}
                      </Na>
                    );
                  })()}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.times.map((tm, j) => (
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
          {!sampleMovie && (
            <p className="text-meta text-muted-foreground md:col-span-2">
              {t("booking.ticketNote")}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">{t("booking.noTimes")}</p>
      )}
    </div>
  );
}

export function BookingIndexRoute({ lang }: { lang: Lang }) {
  const home = useSuspenseQuery(homeQueryOptions).data;
  if (home.error || !home.data) {
    return <LiveError message={home.error ?? ""} lang={lang} />;
  }
  return <BookingIndexPage lang={lang} />;
}

export function BookingMovieRoute({
  result,
  lang,
  id,
}: {
  result: { data: LiveWork | null; error: string | null };
  lang: Lang;
  id: string;
}) {
  const isSample = movieById.has(Number(id));
  if (result.error && !isSample) return <LiveError message={result.error ?? ""} lang={lang} />;
  return <BookingMoviePage lang={lang} id={id} data={result.data} />;
}
