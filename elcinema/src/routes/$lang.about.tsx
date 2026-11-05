import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/content/static-page.options";
import { StaticPage } from "@/pages/StaticPage";
import { getFallbackPage } from "@/lib/fallback-content";
import { asLang } from "@/i18n";

export const Route = createFileRoute("/$lang/about")({
  loader: ({ context, params }) => {
    const lang = asLang(params.lang);
    return context.queryClient.ensureQueryData(staticPageOptions(lang, `/${lang}/about_us/`));
  },
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us | elCinema" },
      {
        name: "description",
        content: "Learn more about elCinema — Egypt's premier cinema and TV guide.",
      },
    ],
  }),
});

function AboutPage() {
  const { lang } = Route.useParams();
  const l = asLang(lang);
  const result = useSuspenseQuery(staticPageOptions(l, `/${l}/about_us/`)).data;

  // Use the bundled copy if no complete page data is available.
  const fallback = getFallbackPage(`/${l}/about_us/`, l);

  // Use fallback if:
  // 1. No page data
  // 2. Page data has fewer than two sections
  const page =
    !result.data || result.data.sections?.length < 2
      ? fallback
      : {
          ...result.data,
          ...(fallback?.image ? { image: fallback.image } : {}),
        };

  if (!page) {
    return <LiveError message={result.error ?? ""} lang={l} />;
  }

  return <StaticPage icon={Info} page={page} />;
}
