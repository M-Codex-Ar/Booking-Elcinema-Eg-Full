import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { managedContentOptions } from "@/features/content/content.options";
import { managedVideoById, managedVideos, managedRef } from "@/features/content/content";
import type { ManagedContent } from "@/features/content/content.functions";
import type { ContentVideoDetail, ContentVideoCard } from "@/types/content-view";
import { VideoDetailPage } from "@/pages/Videos";
import { asLang, makeT } from "@/i18n";

function allowedEmbed(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const videoId =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)
          ? (url.searchParams.get("v") ?? url.pathname.match(/^\/embed\/([^/]+)/)?.[1])
          : null;
    return videoId && /^[\w-]{6,20}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/$lang/video/$id")({
  loader: ({ context }) => context.queryClient.ensureQueryData(managedContentOptions),
  component: VideoDetailRouteComponent,
  head: ({ params, loaderData }) => {
    const lang = asLang(params.lang);
    const row = managedVideoById((loaderData ?? null) as ManagedContent | null).get(params.id);
    const title = row
      ? lang === "ar"
        ? row.title_ar || row.title_en
        : row.title_en
      : lang === "ar"
        ? "فيديو | إل سينما TV"
        : "Video | elCinema TV";
    return {
      meta: [{ title: `${title} | elCinema TV` }, { name: "description", content: title }],
    };
  },
});

function VideoDetailRouteComponent() {
  const { lang, id } = Route.useParams();
  const l = asLang(lang);
  const t = makeT(l);
  const managed = useSuspenseQuery(managedContentOptions).data;
  const row = managedVideoById(managed).get(id);
  if (!row)
    return <p className="mx-auto max-w-3xl px-4 py-20 text-center">{t("common.notFoundVideo")}</p>;
  const related: ContentVideoCard[] = managedVideos(managed)
    .filter((item) => item.id !== row.id)
    .slice(0, 8)
    .map((item) => ({
      id: managedRef(item),
      title: l === "ar" ? item.title_ar || item.title_en : item.title_en,
      duration: item.duration || null,
      img: item.thumb_url,
    }));
  const data: ContentVideoDetail = {
    id,
    title: l === "ar" ? row.title_ar || row.title_en : row.title_en,
    embedUrl: allowedEmbed(row.url),
    img: row.thumb_url,
    related,
  };
  return <VideoDetailPage data={data} lang={l} />;
}
