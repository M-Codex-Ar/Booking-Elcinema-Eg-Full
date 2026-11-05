import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/content/static-page.options";
import { StaticPage } from "@/pages/StaticPage";
import { getFallbackPage } from "@/lib/fallback-content";
import { asLang } from "@/i18n";

export const Route = createFileRoute("/$lang/advertise")({
  loader: ({ context, params }) => {
    const lang = asLang(params.lang);
    return context.queryClient.ensureQueryData(staticPageOptions(lang, `/${lang}/advertise/`));
  },
  component: AdvertisePage,
  head: () => ({
    meta: [
      { title: "Advertise | elCinema" },
      {
        name: "description",
        content: "Reach Egypt's most engaged movie audience. Advertise with elCinema.",
      },
    ],
  }),
});

function AdvertisePage() {
  const { lang } = Route.useParams();
  const l = asLang(lang);
  const result = useSuspenseQuery(staticPageOptions(l, `/${l}/advertise/`)).data;

  // Use the bundled copy if no complete page data is available.
  const fallback = getFallbackPage(`/${l}/advertise/`, l);

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

  return <StaticPage icon={Megaphone} page={page} />;
}
