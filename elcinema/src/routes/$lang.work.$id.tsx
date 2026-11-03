import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getLiveWorkFn } from "@/features/live/live.functions";
import { LiveError } from "@/features/live/live-ui";
import { LiveWorkPage } from "@/pages/LiveWork";
import { WorkPage } from "@/pages/Work";
import { ManagedWorkPage } from "@/pages/Managed";
import { managedContentOptions, managedMovieById } from "@/features/content/content";
import type { ManagedContent } from "@/features/content/content.functions";
import { movieById, movieBySlug, workId } from "@/lib/build";
import { asLang } from "@/i18n";
import type { Lang } from "@/features/home/home.shared";

const liveWorkOptions = (lang: Lang, id: string) =>
  queryOptions({
    queryKey: ["elcinema-live-work", lang, id],
    queryFn: () => getLiveWorkFn({ data: { lang, id } }),
    staleTime: 10 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/work/$id")({
  // Legacy text slugs (/en/work/the-giza-job) redirect to the canonical
  // elCinema-style numeric URL (/en/work/2099231).
  beforeLoad: ({ params }) => {
    if (!/^\d+$/.test(params.id)) {
      const legacy = movieBySlug.get(params.id);
      if (legacy) {
        throw redirect({
          to: "/$lang/work/$id",
          params: { lang: params.lang, id: String(workId(legacy)) },
          replace: true,
        });
      }
    }
  },
  // Built-in sample movies render from the catalogue, dashboard-added movies
  // ("m-…") from the managed content, and every other numeric work id is
  // fetched live from elcinema.com (English or Arabic edition).
  loader: ({ context, params }) => {
    if (params.id.startsWith("m-"))
      return context.queryClient.ensureQueryData(managedContentOptions);
    if (!/^\d+$/.test(params.id) || movieById.has(Number(params.id)) || movieBySlug.has(params.id))
      return null;
    const lang = asLang(params.lang);
    return context.queryClient.ensureQueryData(liveWorkOptions(lang, params.id));
  },
  component: WorkRoute,
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
      <p className="text-lg font-bold">Movie not found</p>
    </div>
  ),
  head: ({ params, loaderData }) => {
    const en = params.lang !== "ar";
    const managedMovie = params.id.startsWith("m-")
      ? managedMovieById((loaderData ?? null) as ManagedContent | null).get(params.id)
      : undefined;
    const sample =
      !managedMovie && /^\d+$/.test(params.id)
        ? (movieById.get(Number(params.id)) ?? movieBySlug.get(params.id))
        : !managedMovie
          ? movieBySlug.get(params.id)
          : undefined;
    const live =
      sample || managedMovie
        ? null
        : ((
            loaderData as
              | { data?: { title: string; year?: string | null; synopsis?: string | null } | null }
              | null
              | undefined
          )?.data ?? null);
    const title = managedMovie
      ? `${managedMovie.title[en ? "en" : "ar"]} | elCinema`
      : sample
        ? `${sample.title[en ? "en" : "ar"]} (${sample.release.slice(0, 4)}) | elCinema`
        : live
          ? `${live.title}${live.year ? ` (${live.year})` : ""} | elCinema`
          : en
            ? "Movie | elCinema"
            : "فيلم | إل سينما";
    const description = managedMovie
      ? managedMovie.synopsis[en ? "en" : "ar"].slice(0, 160)
      : sample
        ? sample.synopsis[en ? "en" : "ar"]
        : live?.synopsis
          ? live.synopsis.slice(0, 160)
          : en
            ? "Movie details, showtimes and cast from Egypt's cinema guide."
            : "تفاصيل الفيلم ومواعيد العرض وطاقمه من دليل السينما المصري.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "video.movie" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function WorkRoute() {
  const { lang, id } = Route.useParams();
  const l = asLang(lang);
  // Dashboard-managed movie ("m-…" ids).
  if (id.startsWith("m-")) return <ManagedWorkLoader lang={l} id={id} />;
  // Sample catalogue page (also serves text name slugs via redirect above).
  if (!/^\d+$/.test(id) || movieById.has(Number(id)) || movieBySlug.has(id)) {
    return <WorkPage lang={l} id={id} />;
  }
  return <LiveWorkLoader lang={l} id={id} />;
}

function ManagedWorkLoader({ lang, id }: { lang: Lang; id: string }) {
  const managed = useSuspenseQuery(managedContentOptions).data;
  const movie = managedMovieById(managed).get(id);
  if (!movie) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-bold">Movie not found</p>
      </div>
    );
  }
  return <ManagedWorkPage movie={movie} lang={lang} />;
}

function LiveWorkLoader({ lang, id }: { lang: Lang; id: string }) {
  const result = useSuspenseQuery(liveWorkOptions(lang, id)).data;
  if (result.error || !result.data) {
    return <LiveError message={result.error ?? ""} lang={lang} />;
  }
  return <LiveWorkPage data={result.data} lang={lang} />;
}
