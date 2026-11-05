import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MOVIES } from "@/lib/data";
import type { Lang } from "@/types/home";
import { asLang } from "@/i18n";
import { WatchOnlineRoute } from "@/pages/WatchOnline";

const vodOptions = (lang: Lang) =>
  queryOptions({
    queryKey: ["local-vod-guide", lang],
    queryFn: () => {
      const names = new Set(MOVIES.flatMap((movie) => movie.vod.map((vod) => vod.label)));
      return {
        data: {
          title: lang === "ar" ? "دليل المشاهدة أونلاين" : "Watch online guide",
          platforms: [...names].map((name) => ({
            id: name,
            name,
            img: null,
            cats: [],
          })),
        },
        error: null,
      };
    },
  });

export const Route = createFileRoute("/$lang/vod")({
  loader: ({ context, params }) => {
    const lang = asLang(params.lang);
    return context.queryClient.ensureQueryData(vodOptions(lang));
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
  const l = asLang(lang);
  const result = useSuspenseQuery(vodOptions(l)).data;
  return <WatchOnlineRoute result={result} lang={l} />;
}
