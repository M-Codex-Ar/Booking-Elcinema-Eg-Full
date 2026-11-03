import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/elcinema/pages/SearchPage";
import { managedContentOptions, mergedSearch } from "@/elcinema/content";
import { asLang } from "@/elcinema/i18n";

export const Route = createFileRoute("/$lang/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managedContentOptions),
  component: SearchRoute,
  head: ({ params }) => {
    const en = params.lang !== "ar";
    const title = en ? "Search | elCinema" : "بحث | إل سينما";
    const description = en
      ? "Search movies, industry people and TV channels across the full elCinema catalogue."
      : "ابحث في الأفلام والأشخاص والقنوات عبر كامل كتالوج إل سينما.";
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
