import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getLiveWorkFn } from "@/features/live/live.functions";
import { movieById } from "@/lib/build";
import type { Lang } from "@/types/home";
import { asLang } from "@/i18n";
import { BookingMovieRoute } from "@/pages/Booking";

const liveWorkOptions = (lang: Lang, id: string) =>
  queryOptions({
    queryKey: ["elcinema-live-work", lang, id],
    queryFn: () => getLiveWorkFn({ data: { lang, id } }),
    staleTime: 10 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/booking/$id")({
  // Sample-catalogue movies render generated showtimes; live movies are
  // fetched from the real work page.
  loader: ({ context, params }) => {
    if (movieById.has(Number(params.id))) return null;
    const lang = asLang(params.lang);
    return context.queryClient.ensureQueryData(liveWorkOptions(lang, params.id));
  },
  component: BookingMovieRouteComponent,
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
    const sample = movieById.get(Number(params.id));
    const live = sample ? null : (loaderData?.data ?? null);
    const title = sample
      ? `${sample.title[en ? "en" : "ar"]} — Book tickets | elCinema`
      : live
        ? `${live.title} — ${en ? "Book tickets" : "احجز تذاكر"} | elCinema`
        : en
          ? "Book tickets | elCinema"
          : "احجز تذاكر | إل سينما";
    const description = en
      ? `Cinemas and showtimes for ${live?.title ?? "this movie"} in Egypt.`
      : `السينمات ومواعيد عرض ${live?.title ?? "هذا الفيلم"} في مصر.`;
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

function BookingMovieRouteComponent() {
  const { lang, id } = Route.useParams();
  const l = asLang(lang);
  if (movieById.has(Number(id))) {
    return <BookingMovieRoute result={{ data: null, error: null }} lang={l} id={id} />;
  }
  return <LiveBookingMovie lang={l} id={id} />;
}

function LiveBookingMovie({ lang, id }: { lang: Lang; id: string }) {
  const result = useSuspenseQuery(liveWorkOptions(lang, id)).data;
  return <BookingMovieRoute result={result} lang={lang} id={id} />;
}
