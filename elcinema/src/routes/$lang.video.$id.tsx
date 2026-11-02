import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getVideoDetailFn } from "@/elcinema/live.functions";
import { LiveError } from "@/elcinema/live-ui";
import { VideoDetailPage } from "@/elcinema/pages/Videos";
import type { Lang } from "@/elcinema/home.shared";

const videoOptions = (lang: Lang, id: string) =>
  queryOptions({
    queryKey: ["elcinema-video", lang, id],
    queryFn: () => getVideoDetailFn({ data: { lang, id } }),
    staleTime: 10 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/video/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      videoOptions(params.lang === "ar" ? "ar" : "en", params.id),
    ),
  component: VideoDetailRouteComponent,
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
      <p className="text-lg font-bold">Video not found</p>
    </div>
  ),
  head: ({ loaderData }) => {
    const live = loaderData?.data ?? null;
    const en = true;
    const title = live
      ? `${live.title} | elCinema TV`
      : en
        ? "Video | elCinema TV"
        : "فيديو | إل سينما TV";
    const description =
      live?.title ??
      (en
        ? "Watch the latest trailers and clips on elCinema TV."
        : "شاهد أحدث الإعلانات والمقاطع على إل سينما TV.");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "video.other" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function VideoDetailRouteComponent() {
  const { lang, id } = Route.useParams();
  const l: Lang = lang === "ar" ? "ar" : "en";
  const result = useSuspenseQuery(videoOptions(l, id)).data;
  if (result.error || !result.data) {
    return <LiveError message={result.error ?? ""} lang={l} />;
  }
  return <VideoDetailPage data={result.data} lang={l} />;
}
