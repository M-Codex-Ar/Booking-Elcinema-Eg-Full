import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getLineupIndexFn } from "@/live.functions";
import { managedContentOptions, managedLists, managedRef } from "@/content";
import type { Lang } from "@/home.shared";
import { asLang } from "@/i18n";
import { LineupIndexRoute } from "@/pages/Lineup";

const lineupOptions = (lang: Lang) =>
  queryOptions({
    queryKey: ["elcinema-lineup", lang],
    queryFn: () => getLineupIndexFn({ data: { lang } }),
    staleTime: 10 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/lineup/")({
  loader: ({ context, params }) => {
    const lang = asLang(params.lang);
    return Promise.all([
      context.queryClient.ensureQueryData(lineupOptions(lang)),
      context.queryClient.ensureQueryData(managedContentOptions),
    ]);
  },
  component: LineupRouteComponent,
  head: () => ({
    meta: [
      { title: "Featured Lists | elCinema" },
      { name: "description", content: "Curated movies and series lists by the elCinema editors." },
      { property: "og:title", content: "Featured Lists | elCinema" },
      {
        property: "og:description",
        content: "Curated movies and series lists by the elCinema editors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function LineupRouteComponent() {
  const { lang } = Route.useParams();
  const l = asLang(lang);
  const result = useSuspenseQuery(lineupOptions(l)).data;
  const managed = useSuspenseQuery(managedContentOptions).data;
  const extra = managedLists(managed).map((r) => ({
    id: managedRef(r),
    title: l === "ar" ? r.title_ar || r.title_en : r.title_en,
    cover: null as string | null,
  }));
  if (result.error || !result.data) {
    return <LineupIndexRoute result={result} lang={l} />;
  }
  return (
    <LineupIndexRoute
      result={{ data: { ...result.data, lists: [...result.data.lists, ...extra] }, error: null }}
      lang={l}
    />
  );
}
