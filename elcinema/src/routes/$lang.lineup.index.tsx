import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { managedLists, managedRef } from "@/features/content/content";
import { managedContentOptions } from "@/features/content/content.options";
import type { Lang } from "@/types/home";
import { asLang, makeT, rowTitle } from "@/i18n";
import { LineupIndexRoute } from "@/pages/Lineup";

const lineupOptions = (lang: Lang) =>
  queryOptions({
    queryKey: ["managed-lineup-index", lang],
    queryFn: () => ({ data: { title: "", lists: [] }, error: null }),
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
      {
        name: "description",
        content: "Curated movies and series lists by the elCinema editors.",
      },
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
  const t = makeT(l);
  const result = useSuspenseQuery(lineupOptions(l)).data;
  const managed = useSuspenseQuery(managedContentOptions).data;
  const extra = [
    { id: "local-now", title: t("now.title"), cover: null },
    { id: "local-soon", title: t("soon.title"), cover: null },
    ...managedLists(managed).map((r) => ({
      id: managedRef(r),
      title: rowTitle(r, l),
      cover: null as string | null,
    })),
  ];
  if (result.error || !result.data) {
    return <LineupIndexRoute result={result} lang={l} />;
  }
  return (
    <LineupIndexRoute
      result={{
        data: { ...result.data, lists: [...result.data.lists, ...extra] },
        error: null,
      }}
      lang={l}
    />
  );
}
