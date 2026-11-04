/** Now Playing — movies currently in Egyptian cinemas, with genre filter,
 * sorting, grid/list view toggle and pagination (all URL-driven). */
import { Ticket, Star } from "lucide-react";
import { GENRES } from "@/lib/data";
import { knownGenreKeys } from "@/lib/genres";
import { movieMeta, workId } from "@/lib/build";
import { locale, makeT } from "@/i18n";
import { fmtDate, Na, t, workPath } from "@/components/shared/ui";
import { PosterArt } from "@/components/shared/ui";
import { chip, pill } from "@/components/shared/variants";
import type { Lang, Movie } from "@/types/home";
import {
  ActiveFilters,
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

type SortKey = "featured" | "rating" | "title" | "newest";

function sortMovies(movies: Movie[], sort: SortKey, lang: Lang): Movie[] {
  const list = [...movies];
  switch (sort) {
    case "rating":
      return list.sort((a, b) => movieMeta(b).rating - movieMeta(a).rating);
    case "title":
      return list.sort((a, b) => a.title[lang].localeCompare(b.title[lang], locale(lang)));
    case "newest":
      return list.sort((a, b) => b.release.localeCompare(a.release));
    default:
      return list;
  }
}

/** One row in list view. */
function Row({ movie, lang }: { movie: Movie; lang: Lang }) {
  const meta = movieMeta(movie);
  return (
    <Na
      href={workPath(lang, workId(movie))}
      className="glass-card hover-lift flex items-center gap-4 p-4"
    >
      <div className="w-14 shrink-0 overflow-hidden rounded-lg">
        <div className="aspect-[2/3]">
          <PosterArt hue={movie.hue} title={movie.title[lang]} img={movie.poster} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-black">{movie.title[lang]}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{fmtDate(movie.release, lang)}</span>
          <span>· {movie.cert}</span>
          {knownGenreKeys(movie.genres)
            .slice(0, 3)
            .map((g) => (
              <span key={g} className={pill()}>
                {t(GENRES[g], lang)}
              </span>
            ))}
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-bold">
        <Star className="h-4 w-4 fill-gold text-gold" /> {meta.rating.toFixed(1)}
      </span>
    </Na>
  );
}

export function NowPlayingPage({
  lang,
  list,
  genre,
  sort = "featured",
  view = "grid",
  page: pageParam,
  setSearch,
}: {
  lang: Lang;
  list: Movie[];
  genre: string | undefined;
  sort?: string | undefined;
  view?: ViewMode | undefined;
  page?: number | undefined;
  setSearch: SetSearch;
}) {
  const copy = makeT(lang);
  const genres = knownGenreKeys(list.flatMap((m) => m.genres));
  const filtered = genre ? list.filter((m) => m.genres.includes(genre)) : list;
  const validSorts: SortKey[] = ["featured", "rating", "title", "newest"];
  const currentSort: SortKey = validSorts.includes(sort as SortKey)
    ? (sort as SortKey)
    : "featured";
  const sorted = sortMovies(filtered, currentSort, lang);
  const page = clampPage(pageParam, sorted.length, 10);
  const shown = pageSlice(sorted, page, 10);
  const pages = pageCount(sorted.length, 10);

  const sortOptions = [
    { value: "featured", label: copy("now.sortFeatured") },
    { value: "rating", label: copy("now.sortRating") },
    { value: "title", label: copy("controls.az") },
    { value: "newest", label: copy("now.sortNewest") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-black md:text-3xl">
        <Ticket className="h-6 w-6 text-primary" /> {copy("now.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{copy("now.sub")}</p>

      <ListToolbar>
        <Na href={`/${lang}/now`} className={chip({ active: !genre })}>
          {copy("controls.all")}
        </Na>
        {genres.map((g) => (
          <Na
            key={g}
            href={`/${lang}/now`}
            search={{ genre: g }}
            className={chip({ active: genre === g })}
          >
            {t(GENRES[g], lang)}
          </Na>
        ))}
        <ActiveFilters
          count={genre ? 1 : 0}
          lang={lang}
          onClear={() => setSearch({ genre: undefined, page: undefined })}
        />
        <span className="grow" />
        <SortSelect
          lang={lang}
          value={sort}
          onChange={(v) => setSearch({ sort: v, page: undefined })}
          options={sortOptions}
        />
        <ViewToggle lang={lang} view={view} onChange={(v) => setSearch({ view: v })} />
      </ListToolbar>

      {view === "grid" ? (
        <div className="poster-grid mt-8">
          {shown.map((m) => (
            <div key={m.slug} className="w-full">
              <div className="group w-full">
                <Na href={workPath(lang, workId(m))} className="block">
                  <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
                    <PosterArt hue={m.hue} title={m.title[lang]} img={m.poster} />
                  </div>
                  <h3 className="mt-3 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary">
                    {m.title[lang]}
                  </h3>
                </Na>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{fmtDate(m.release, lang)}</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-3 w-3 fill-gold text-gold" />{" "}
                    {movieMeta(m).rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row-grid mt-8">
          {shown.map((m) => (
            <Row key={m.slug} movie={m} lang={lang} />
          ))}
        </div>
      )}

      {sorted.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{copy("now.empty")}</p>
      )}

      <Pagination lang={lang} page={page} pages={pages} onChange={(p) => setSearch({ page: p })} />
    </div>
  );
}
