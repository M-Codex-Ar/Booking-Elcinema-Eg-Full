import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LineupDetailRoute } from "@/pages/Lineup";
import { allMovies, managedLists, movieArt } from "@/features/content/content";
import { managedContentOptions } from "@/features/content/content.options";
import type { FeaturedListDetail } from "@/types/content-view";
import { asLang, makeT, rowTitle } from "@/i18n";

export const Route = createFileRoute("/$lang/lineup/$id")({
  loader: ({ context, params }) =>
    params.id.startsWith("m-") ? context.queryClient.ensureQueryData(managedContentOptions) : null,
  component: LineupDetailRouteComponent,
  head: ({ params }) => {
    const lang = asLang(params.lang);
    const t = makeT(lang);
    const title =
      params.id === "local-now"
        ? t("now.title")
        : params.id === "local-soon"
          ? t("soon.title")
          : lang === "ar"
            ? "قائمة مختارة | إل سينما"
            : "Featured List | elCinema";
    return { meta: [{ title }, { name: "description", content: title }] };
  },
});

function LineupDetailRouteComponent() {
  const { lang, id } = Route.useParams();
  const l = asLang(lang);
  const t = makeT(l);
  const managed = useQuery(managedContentOptions).data ?? null;
  const byRef = new Map(allMovies(managed).map((movie) => [movie.id, movie]));

  if (id === "local-now" || id === "local-soon") {
    const isSoon = id === "local-soon";
    const movies = allMovies(managed).filter((movie) => movie.status === (isSoon ? "soon" : "now"));
    const data: FeaturedListDetail = {
      id,
      title: isSoon ? t("soon.title") : t("now.title"),
      items: movies.map((movie) => ({
        id: movie.id,
        title: movie.title[l],
        img: movieArt(movie),
        meta: movie.year,
        cast: [],
      })),
    };
    return <LineupDetailRoute result={{ data, error: null }} lang={l} />;
  }

  if (!id.startsWith("m-"))
    return <p className="mx-auto max-w-3xl px-4 py-20 text-center">{t("common.notFoundList")}</p>;
  const row = managedLists(managed).find((item) => `m-${item.id}` === id);
  if (!row)
    return <p className="mx-auto max-w-3xl px-4 py-20 text-center">{t("common.notFoundList")}</p>;

  const data: FeaturedListDetail = {
    id,
    title: rowTitle(row, l),
    items: row.items.map((item) => {
      const movie = byRef.get(item.ref);
      return {
        id: item.ref,
        title: movie ? movie.title[l] : rowTitle(item, l),
        img: movie ? movieArt(movie) : null,
        meta: movie?.year ?? "",
        cast: [],
      };
    }),
  };
  return <LineupDetailRoute result={{ data, error: null }} lang={l} />;
}
