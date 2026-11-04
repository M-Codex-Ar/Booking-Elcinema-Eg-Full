import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/pages/SearchPage";
import { managedContentOptions } from "@/features/content/content.options";
import { mergedSearch } from "@/features/content/content";
import { asLang, text } from "@/i18n";

export const Route = createFileRoute("/$lang/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managedContentOptions),
  component: SearchRoute,
  head: ({ params }) => {
    const lang = asLang(params.lang);
    const title = `${text(lang, "search.title")} | elCinema`;
    const description = text(lang, "search.metaDescription");
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

function SearchRoute() {
  const { lang } = Route.useParams();
  const { q } = Route.useSearch();
  const managed = Route.useLoaderData();
  return <SearchPage lang={asLang(lang)} q={q} extra={mergedSearch(q ?? "", managed)} />;
}
