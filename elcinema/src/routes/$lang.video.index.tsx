import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getVideoGalleryFn } from "@/features/live/live.functions";
import { managedContentOptions, managedVideos } from "@/features/content/content";
import type { Lang } from "@/features/home/home.shared";
import { asLang } from "@/i18n";
import { VideoGalleryRoute } from "@/pages/Videos";

const galleryOptions = (lang: Lang) =>
  queryOptions({
    queryKey: ["elcinema-video-gallery", lang],
    queryFn: () => getVideoGalleryFn({ data: { lang } }),
    staleTime: 10 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/video/")({
  loader: ({ context, params }) => {
    const lang = asLang(params.lang);
    return Promise.all([
      context.queryClient.ensureQueryData(galleryOptions(lang)),
      context.queryClient.ensureQueryData(managedContentOptions),
    ]);
  },
  component: VideoGalleryRouteComponent,
  head: () => ({
    meta: [
      { title: "elCinema TV — Video Gallery | elCinema" },
      {
        name: "description",
        content: "Trailers, series episodes, songs and behind-the-scenes videos, updated daily.",
      },
      { property: "og:title", content: "elCinema TV — Video Gallery | elCinema" },
      {
        property: "og:description",
        content: "Trailers, series episodes, songs and behind-the-scenes videos, updated daily.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function VideoGalleryRouteComponent() {
  const { lang } = Route.useParams();
  const l = asLang(lang);
  const result = useSuspenseQuery(galleryOptions(l)).data;
  const managed = useSuspenseQuery(managedContentOptions).data;
  return <VideoGalleryRoute result={result} lang={l} extra={managedVideos(managed)} />;
}
