import { createFileRoute } from "@tanstack/react-router";
import { BoxOfficePage } from "@/elcinema/pages/BoxOffice";
import { managedContentOptions, mergedBoxoffice } from "@/elcinema/content";

export const Route = createFileRoute("/$lang/boxoffice")({
  loader: ({ context }) => context.queryClient.ensureQueryData(managedContentOptions),
  component: BoxOfficeRoute,
  head: ({ params }) => {
    const en = params.lang !== "ar";
    const title = en ? "Cinema Revenue | elCinema" : "إيرادات السينما | إل سينما";
    const description = en
      ? "The weekly Egypt box office: top 20 movies by weekly revenue in EGP."
      : "بوكس أوفيس مصر الأسبوعي: أفضل 20 فيلمًا من حيث إيراد الأسبوع بالجنيه.";
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

function BoxOfficeRoute() {
  const { lang } = Route.useParams();
  const managed = Route.useLoaderData();
  return <BoxOfficePage lang={lang === "ar" ? "ar" : "en"} entries={mergedBoxoffice(managed)} />;
}
