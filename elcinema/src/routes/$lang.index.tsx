import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { HomePage } from "@/pages/HomePage";
import { managedContentOptions } from "@/features/content/content.options";
import { mergedHomeData } from "@/features/content/content";
import { asLang } from "@/i18n";

const homeQueryOptions = (lang: "en" | "ar") =>
  queryOptions({
    queryKey: ["local-home", lang],
    queryFn: () => ({ data: mergedHomeData(null, lang), error: null }),
    staleTime: 5 * 60 * 1000,
  });

export const Route = createFileRoute("/$lang/")({
  // Only wait for the bounded, first-party homepage result during SSR.
  // Managed content is additive and loads in the background in HomeRoute.
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(homeQueryOptions(asLang(params.lang))),
  component: HomeRoute,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center">
      <p className="text-lg font-bold">Could not load the cinema guide right now.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center">
      <p className="text-lg font-bold">Page not found</p>
    </div>
  ),
  head: ({ params, loaderData }) => {
    const en = params.lang !== "ar";
    const heroImage = loaderData?.data?.promos?.[0]?.img;
    const title = en
      ? "elCinema — Movies, TV Guide & Box Office"
      : "إل سينما — أفلام، جدول القنوات وبوكس أوفيس";
    const description = en
      ? "Egypt's cinema and TV guide: what's playing now, coming soon, tonight's TV schedule and the weekly box office."
      : "دليل السينما والتلفاز في مصر: ما يُعرض الآن، القادم قريبًا، جدول القنوات الليلة، وبوكس أوفيس الأسبوع.";
    return {
      links: heroImage
        ? [
            {
              rel: "preload",
              as: "image",
              href: heroImage,
              fetchPriority: "high",
              referrerPolicy: "no-referrer",
            },
          ]
        : [],
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

function HomeRoute() {
  const { lang } = Route.useParams();
  const result = useSuspenseQuery(homeQueryOptions(asLang(lang))).data;
  // Managed content is optional: keep its network request off the SSR critical
  // path and merge it in when the query resolves in the background.
  const managed = useQuery(managedContentOptions).data ?? null;
  if (result.error || !result.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-lg font-bold">Could not load the cinema guide right now.</p>
        <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }
  return <HomePage data={mergedHomeData(managed, asLang(lang))} lang={asLang(lang)} />;
}

// Keep notFound referenced for the $lang guard's thrown errors to resolve to
// this route's not-found UI when the language prefix itself is invalid.
void notFound;
