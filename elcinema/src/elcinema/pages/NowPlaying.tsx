/** Now Playing — movies currently in Egyptian cinemas, with genre filter,
 * sorting, grid/list view toggle and pagination (all URL-driven). */
import { Ticket, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENRES } from "../data";
import { movieMeta, workId } from "../build";
import { locale } from "../i18n";
import { fmtDate, Na, t, workPath } from "../ui";
import { PosterArt } from "../ui";
import { Section, SectionHeader, Subtitle } from "../components/primitives";
import { artFrame, cardMeta, cardTitle, chip, pill, railItem } from "../components/variants";
import type { Lang, Movie } from "../home.shared";
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
} from "../controls";

const L = {
  en: {
    title: "Now Playing",
    sub: "Movies in Egyptian cinemas this week",
    all: "All",
    empty: "No movies in this genre right now.",
    sort: { featured: "Featured", rating: "Top rated", title: "A to Z", newest: "Newest" },
  },
  ar: {
    title: "السينمات الآن",
    sub: "أفلام في السينمات المصرية هذا الأسبوع",
    all: "الكل",
    empty: "لا توجد أفلام في هذا النوع حاليًا.",
    sort: { featured: "المميز", rating: "الأعلى تقييمًا", title: "أبجديًا", newest: "الأحدث" },
  },
} as const;

type SortKey = "featured" | "rating" | "title" | "newest";

/** Managed rows may carry a genre code the built-in catalogue never defined;
 *  an unlabelled one would render as an empty chip, so it is filtered out. */
const hasGenreLabel = (g: string): boolean => Boolean(GENRES[g]);

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
          {movie.genres
            .slice(0, 3)
            .filter(hasGenreLabel)
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
  const Lx = L[lang];
  const genres = Array.from(new Set(list.flatMap((m) => m.genres)));
  const filtered = genre ? list.filter((m) => m.genres.includes(genre)) : list;
  const sorted = sortMovies(
    filtered,
    (sort as SortKey) in Lx.sort ? (sort as SortKey) : "featured",
    lang,
  );
  const page = clampPage(pageParam, sorted.length, 10);
  const shown = pageSlice(sorted, page, 10);
  const pages = pageCount(sorted.length, 10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-black md:text-3xl">
        <Ticket className="h-6 w-6 text-primary" /> {Lx.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{Lx.sub}</p>

      <ListToolbar>
        <Na
          href={`/${lang}/now`}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
            !genre
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary"
          }`}
        >
          {Lx.all}
        </Na>
        {genres.map((g) => (
          <Na
            key={g}
            href={`/${lang}/now`}
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
          options={(Object.keys(Lx.sort) as SortKey[]).map((k) => ({
            value: k,
            label: Lx.sort[k],
          }))}
        />
        <ViewToggle lang={lang} view={view} onChange={(v) => setSearch({ view: v })} />
      </ListToolbar>

      {view === "grid" ? (
        <div className="mt-8 grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {shown.map((m) => (
            <div key={m.slug} className="w-full max-w-44">
              <div className="group w-full">
                <Na href={workPath(lang, workId(m))} className="block">
                  <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
                    <PosterArt hue={m.hue} title={m.title[lang]} img={m.poster} />
                  </div>
                  <h3 className="mt-3 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary">
                    {m.title[lang]}
                  </h3>
                </Na>
                <div className="mt-1 text-xs text-muted-foreground">
                  {fmtDate(m.release, lang)} · {m.cert}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {shown.map((m) => (
            <Row key={m.slug} movie={m} lang={lang} />
          ))}
        </div>
      )}

      {sorted.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          {lang === "en"
            ? "No movies in this genre right now."
            : "لا توجد أفلام في هذا النوع حاليًا."}
        </p>
      )}

      <Pagination lang={lang} page={page} pages={pages} onChange={(p) => setSearch({ page: p })} />
    </div>
  );
}
