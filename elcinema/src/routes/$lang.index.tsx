import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getElcinemaHomeFn } from "@/features/home/home.functions";
import { HomePage } from "@/pages/HomePage";
import type { EcHomeData } from "@/types/home";
import { managedContentOptions } from "@/features/content/content.options";
import { mergedHomeData } from "@/features/content/content";
import { asLang } from "@/i18n";

const homeQueryOptions = queryOptions({
  queryKey: ["elcinema-home"],
  queryFn: () => getElcinemaHomeFn(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/$lang/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(homeQueryOptions),
      // Managed content is additive: if it fails, the scraped homepage still renders.
      context.queryClient.ensureQueryData(managedContentOptions).catch(() => null),
    ]),
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
  head: ({ params }) => {
    const en = params.lang !== "ar";
    const title = en
      ? "elCinema — Movies, TV Guide & Box Office"
      : "إل سينما — أفلام، جدول القنوات وبوكس أوفيس";
    const description = en
      ? "Egypt's cinema and TV guide: what's playing now, coming soon, tonight's TV schedule and the weekly box office."
      : "دليل السينما والتلفاز في مصر: ما يُعرض الآن، القادم قريبًا، جدول القنوات الليلة، وبوكس أوفيس الأسبوع.";
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

function HomeRoute() {
  const { lang } = Route.useParams();
  const result = useSuspenseQuery(homeQueryOptions).data;
  // Hooks first, always: an early return above this call would make the second
  // query conditional and break the hook order whenever the scrape fails.
  const managed = useSuspenseQuery(managedContentOptions).data ?? null;
  if (result.error || !result.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-lg font-bold">Could not load the cinema guide right now.</p>
        <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }
  const data: EcHomeData = result.data;
  return <HomePage data={mergedHomeData(data, managed, asLang(lang))} lang={asLang(lang)} />;
}

// Keep notFound referenced for the $lang guard's thrown errors to resolve to
// this route's not-found UI when the language prefix itself is invalid.
void notFound;
