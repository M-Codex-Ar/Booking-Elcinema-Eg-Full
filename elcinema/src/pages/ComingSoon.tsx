/** Coming Soon — upcoming releases with genre filter, sorting, grid/list
 * view toggle and pagination (all URL-driven). */
import { CalendarClock, Star } from "lucide-react";
import { GENRES } from "@/lib/data";
import { movieMeta, workId } from "@/lib/build";
import { Na, PosterArt, fmtDate, t, workPath } from "@/components/shared/ui";
import type { Lang, Movie } from "@/features/home/home.shared";
import {
  ListToolbar,
  Pagination,
  SortSelect,
  ViewToggle,
  clampPage,
  pageCount,
  pageSlice,
  type SetSearch,
  type ViewMode,
} from "@/components/shared/controls";
import { makeT } from "@/i18n";

type SortKey = "soon" | "title" | "runtime";

function SoonCard({ movie, lang }: { movie: Movie; lang: Lang }) {
  const copy = makeT(lang);
  return (
    <Na href={workPath(lang, workId(movie))} className="glass-card hover-lift flex gap-4 p-4">
      <div className="w-24 shrink-0 overflow-hidden rounded-lg md:w-28">
        <div className="aspect-[2/3]">
          <PosterArt hue={movie.hue} title={movie.title[lang]} img={movie.poster} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-black md:text-lg">{movie.title[lang]}</h3>
        <p className="mt-1 text-xs font-semibold text-primary">
          {copy("soon.release")} {fmtDate(movie.release, lang)}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{movie.synopsis[lang]}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {movie.genres.map((g) => (
            <span key={g} className="rounded-md bg-secondary px-2 py-0.5">
              {t(GENRES[g], lang)}
            </span>
          ))}
          <span>
            {copy("common.director")}: {movie.director[lang]}
          </span>
          <span>
            {movie.runtime} {copy("common.runtimeMin")}
          </span>
        </div>
      </div>
    </Na>
  );
}

export function ComingSoonPage({
  lang,
  list,
  genre,
  sort = "soon",
  view = "list",
  page: pageParam,
  setSearch,
}: {
  lang: Lang;
  list: Movie[];
  genre?: string | undefined;
  sort?: string | undefined;
  view?: ViewMode | undefined;
  page?: number | undefined;
  setSearch: SetSearch;
}) {
  const copy = makeT(lang);
  const genres = Array.from(new Set(list.flatMap((m) => m.genres)));
  const filtered = genre ? list.filter((m) => m.genres.includes(genre)) : list;
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "title")
      return a.title[lang].localeCompare(b.title[lang], lang === "ar" ? "ar" : "en");
    if (sort === "runtime") return b.runtime - a.runtime;
    return a.release.localeCompare(b.release);
  });
  const page = clampPage(pageParam, sorted.length, 8);
  const shown = pageSlice(sorted, page, 8);
  const pages = pageCount(sorted.length, 8);

  const sortOptions = [
    { value: "soon", label: copy("soon.sortSoonest") },
    { value: "title", label: copy("controls.az") },
    { value: "runtime", label: copy("soon.sortLongest") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-black md:text-3xl">
        <CalendarClock className="h-6 w-6 text-primary" /> {copy("soon.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{copy("soon.sub")}</p>

      <ListToolbar>
        <Na
          href={`/${lang}/soon`}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
            !genre
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary"
          }`}
        >
          {copy("controls.all")}
        </Na>
        {genres.map((g) => (
          <Na
            key={g}
            href={`/${lang}/soon`}
            search={{ genre: g }}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              genre === g
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            }`}
          >
            {t(GENRES[g], lang)}
          </Na>
        ))}
        <span className="grow" />
        <SortSelect
          lang={lang}
          value={sort}
          onChange={(v) => setSearch({ sort: v, page: undefined })}
          options={sortOptions}
        />
        <ViewToggle lang={lang} view={view} onChange={(v) => setSearch({ view: v })} />
      </ListToolbar>

      {view === "list" ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {shown.map((m) => (
            <SoonCard key={m.slug} movie={m} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {shown.map((m) => (
            <div key={m.slug} className="w-full max-w-44">
              <Na href={workPath(lang, workId(m))} className="block">
                <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
                  <PosterArt hue={m.hue} title={m.title[lang]} img={m.poster} />
                </div>
                <h3 className="mt-3 line-clamp-1 text-sm font-bold">{m.title[lang]}</h3>
              </Na>
              <div className="mt-1 text-xs text-muted-foreground">
                {copy("soon.release")} {fmtDate(m.release, lang)}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-gold text-gold" /> {movieMeta(m).rating.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      )}

      {sorted.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{copy("soon.empty")}</p>
      )}

      <Pagination lang={lang} page={page} pages={pages} onChange={(p) => setSearch({ page: p })} />
    </div>
  );
}
