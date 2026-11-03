import { createFileRoute } from "@tanstack/react-router";
import { TvGuidePage } from "@/pages/TvGuidePage";
import { managedContentOptions, mergedTvGuide } from "@/content";
import { asLang } from "@/i18n";

export const Route = createFileRoute("/$lang/tvguide")({
  validateSearch: (search: Record<string, unknown>) => ({
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managedContentOptions),
  component: TvGuideRoute,
  head: ({ params }) => {
    const en = params.lang !== "ar";
    const title = en ? "TV Guide | elCinema" : "جدول القنوات | إل سينما";
    const description = en
      ? "Tonight's schedule across 108 Arab satellite channels, with a day timeline per channel."
      : "جدول الليلة على 108 قناة فضائية عربية، مع خط زمني لكل قناة.";
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

function TvGuideRoute() {
  const { lang } = Route.useParams();
  const { cat, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setSearch = (patch: Record<string, string | number | undefined>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  const managed = Route.useLoaderData();
  return (
    <TvGuidePage
      lang={asLang(lang)}
      guide={mergedTvGuide(managed)}
      cat={cat}
      q={q}
      setSearch={setSearch}
    />
  );
}
