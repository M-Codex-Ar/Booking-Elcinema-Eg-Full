import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getLineupDetailFn } from "@/live.functions";
import { LiveError } from "@/live-ui";
import { LineupDetailRoute } from "@/pages/Lineup";
import { managedContentOptions, allMovies, managedLists, movieArt } from "@/content";
import type { ManagedContent } from "@/content.functions";
import type { LiveLineupDetail } from "@/live.shared";
import type { Lang } from "@/home.shared";
import { makeT, rowTitle, asLang } from "@/i18n";

const lineupDetailOptions = (lang: Lang, id: string) =>
  queryOptions({
    queryKey: ["elcinema-lineup", lang, id],
    queryFn: () => getLineupDetailFn({ data: { lang, id } }),
    staleTime: 10 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/lineup/$id")({
  loader: ({ context, params }) => {
    if (params.id.startsWith("m-"))
      return context.queryClient.ensureQueryData(managedContentOptions);
    return context.queryClient.ensureQueryData(lineupDetailOptions(asLang(params.lang), params.id));
  },
  component: LineupDetailRouteComponent,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-lg font-bold">This page didn't load.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-lg font-bold">List not found</p>
    </div>
  ),
  head: ({ params, loaderData }) => {
    const en = params.lang !== "ar";
    const managedRow = params.id.startsWith("m-")
      ? managedLists((loaderData ?? null) as ManagedContent | null).find(
          (r) => `m-${r.id}` === params.id,
        )
      : undefined;
    const live = managedRow
      ? null
      : ((loaderData as { data?: { title: string } | null } | null | undefined)?.data ?? null);
    const managedTitle = managedRow
      ? en
        ? managedRow.title_en
        : managedRow.title_ar || managedRow.title_en
      : "";
    const title = managedTitle
      ? `${managedTitle} | elCinema`
      : live
        ? `${live.title} | elCinema`
        : "Featured List | elCinema";
    const description = managedTitle
      ? `${managedTitle} — a curated list from elCinema's editors.`
      : live?.title
        ? `${live.title} — a curated list from elCinema's editors.`
        : "A curated list of movies and series from elCinema's editors.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function LineupDetailRouteComponent() {
  const { lang, id } = Route.useParams();
  const l = asLang(lang);
  // Two loader components instead of one with a conditional hook: each calls its
  // own query unconditionally, which is what the rules of hooks require. `m-`
  // prefixed ids are dashboard lists (see content.ts managedRef).
  return id.startsWith("m-") ? (
    <ManagedLineupLoader lang={l} id={id} />
  ) : (
    <ScrapedLineupLoader lang={l} id={id} />
  );
}

/** Scraped elCinema lineup. */
function ScrapedLineupLoader({ lang, id }: { lang: Lang; id: string }) {
  const result = useSuspenseQuery(lineupDetailOptions(lang, id)).data;
  if (result.error || !result.data) {
    return <LiveError message={result.error ?? ""} lang={lang} />;
  }
  return <LineupDetailRoute result={result} lang={lang} />;
}

/** Dashboard-curated list: items resolve against the merged catalogue. */
function ManagedLineupLoader({ lang, id }: { lang: Lang; id: string }) {
  const t = makeT(lang);
  const managed = useSuspenseQuery(managedContentOptions).data;
  const row = managedLists(managed).find((r) => `m-${r.id}` === id);
  if (!row) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-bold">{t("common.notFoundList")}</p>
      </div>
    );
  }
  const byRef = new Map(allMovies(managed).map((m) => [m.id, m]));
  const data: LiveLineupDetail = {
    id,
    title: rowTitle(row, lang),
    items: row.items.map((it) => {
      const movie = byRef.get(it.ref);
      return {
        id: it.ref,
        title: movie ? movie.title[lang] : rowTitle(it, lang),
        img: movie ? movieArt(movie) : null,
        meta: movie ? movie.year : "",
        cast: [],
      };
    }),
  };
  return <LineupDetailRoute result={{ data, error: null }} lang={lang} />;
}
