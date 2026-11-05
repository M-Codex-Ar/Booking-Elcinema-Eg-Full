import { createFileRoute } from "@tanstack/react-router";
import { movieById } from "@/lib/build";
import { asLang, makeT } from "@/i18n";
import { BookingMoviePage } from "@/pages/Booking";

export const Route = createFileRoute("/$lang/booking/$id")({
  loader: () => null,
  component: BookingMovieRouteComponent,
  head: ({ params }) => {
    const lang = asLang(params.lang);
    const movie = movieById.get(Number(params.id));
    const title = movie
      ? `${movie.title[lang]} — ${lang === "ar" ? "احجز تذاكر" : "Book tickets"} | elCinema`
      : lang === "ar"
        ? "احجز تذاكر | إل سينما"
        : "Book tickets | elCinema";
    return { meta: [{ title }] };
  },
});

function BookingMovieRouteComponent() {
  const { lang, id } = Route.useParams();
  const l = asLang(lang);
  const t = makeT(l);
  if (!movieById.has(Number(id)))
    return <p className="mx-auto max-w-3xl px-4 py-20 text-center">{t("booking.noTimes")}</p>;
  return <BookingMoviePage lang={l} id={id} />;
}
