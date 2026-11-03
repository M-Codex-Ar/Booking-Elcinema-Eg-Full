import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { getElcinemaHomeFn } from "@/elcinema/home.functions";
import { BookingIndexRoute } from "@/elcinema/pages/Booking";
import { asLang } from "@/elcinema/i18n";

const homeOptions = queryOptions({
  queryKey: ["elcinema-home"],
  queryFn: () => getElcinemaHomeFn(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/$lang/booking/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeOptions).then(() => null),
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
