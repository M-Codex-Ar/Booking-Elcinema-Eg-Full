import { createFileRoute } from "@tanstack/react-router";
import { BoxOfficePage } from "@/pages/BoxOffice";
import { managedContentOptions } from "@/features/content/content.options";
import { mergedBoxoffice } from "@/features/content/content";
import { asLang, text } from "@/i18n";

export const Route = createFileRoute("/$lang/boxoffice")({
  loader: ({ context }) => context.queryClient.ensureQueryData(managedContentOptions),
  component: BoxOfficeRoute,
  head: ({ params }) => {
    const lang = asLang(params.lang);
    const title = `${text(lang, "nav.boxoffice")} | elCinema`;
    const description = text(lang, "box.metaDescription");
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
  return <BoxOfficePage lang={asLang(lang)} entries={mergedBoxoffice(managed)} />;
}
