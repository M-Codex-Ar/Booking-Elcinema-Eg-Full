import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getVodGuideFn } from "@/elcinema/live.functions";
import { getElcinemaHomeFn } from "@/elcinema/home.functions";
import type { Lang } from "@/elcinema/home.shared";
import { WatchOnlineRoute } from "@/elcinema/pages/WatchOnline";

const vodOptions = (lang: Lang) =>
  queryOptions({
    queryKey: ["elcinema-vod-guide", lang],
    queryFn: () => getVodGuideFn({ data: { lang } }),
    staleTime: 10 * 60 * 1000,
  });

const homeOptions = queryOptions({
  queryKey: ["elcinema-home"],
  queryFn: () => getElcinemaHomeFn(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/$lang/vod")({
  loader: ({ context, params }) => {
    const lang: Lang = params.lang === "ar" ? "ar" : "en";
    return Promise.all([
      context.queryClient.ensureQueryData(vodOptions(lang)),
      context.queryClient.ensureQueryData(homeOptions),
    ]);
  },
  component: VodRouteComponent,
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
      <p className="text-lg font-bold">Page not found</p>
    </div>
  ),
  head: ({ params }) => {
    const en = params.lang !== "ar";
    const title = en ? "Watch Online | elCinema" : "شاهد أونلاين | إل سينما";
    const description = en
      ? "Where to stream movies and series: the VOD platform guide and what's available to watch online now."
      : "أين تشاهد الأفلام والمسلسلات: دليل منصات المشاهدة وما هو متاح الآن.";
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

function VodRouteComponent() {
  const { lang } = Route.useParams();
  const l: Lang = lang === "ar" ? "ar" : "en";
  const result = useSuspenseQuery(vodOptions(l)).data;
  return <WatchOnlineRoute result={result} lang={l} />;
}
