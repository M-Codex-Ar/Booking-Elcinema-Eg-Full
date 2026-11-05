import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { mergedHomeData } from "@/features/content/content";
import { BookingIndexRoute } from "@/pages/Booking";
import { asLang } from "@/i18n";

const homeOptions = (lang: "en" | "ar") =>
  queryOptions({
    queryKey: ["local-home", lang],
    queryFn: () => ({ data: mergedHomeData(null, lang), error: null }),
    staleTime: 5 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/booking/")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(homeOptions(asLang(params.lang))).then(() => null),
  component: BookingRouteComponent,
  head: () => ({
    meta: [
      { title: "Book tickets | elCinema" },
      {
        name: "description",
        content: "Cinemas and showtimes for every movie now playing in Egypt.",
      },
      { property: "og:title", content: "Book tickets | elCinema" },
      {
        property: "og:description",
        content: "Cinemas and showtimes for every movie now playing in Egypt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function BookingRouteComponent() {
  const { lang } = Route.useParams();
  return <BookingIndexRoute lang={asLang(lang)} />;
}
