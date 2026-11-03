import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/live/live.options";
import { StaticPage } from "@/pages/StaticPage";
import { getFallbackPage } from "@/lib/fallback-content";
import { asLang } from "@/i18n";

export const Route = createFileRoute("/$lang/privacy")({
  loader: ({ context, params }) => {
    const lang = asLang(params.lang);
    return context.queryClient.ensureQueryData(staticPageOptions(lang, `/${lang}/privacy_policy/`));
  },
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | elCinema" },
      { name: "description", content: "elCinema privacy policy — how we handle your data." },
    ],
  }),
});

function PrivacyPage() {
  const { lang } = Route.useParams();
  const l = asLang(lang);
  const result = useSuspenseQuery(staticPageOptions(l, `/${l}/privacy_policy/`)).data;

  // Use fallback if scraping fails or returns incomplete data
  const fallback = getFallbackPage(`/${l}/privacy_policy/`, l);

  // Use fallback if:
  // 1. No scraped data
  // 2. Scraped data has less than 2 sections (incomplete)
  const page =
    !result.data || result.data.sections?.length < 2
      ? fallback
      : { ...result.data, ...(fallback?.image ? { image: fallback.image } : {}) };

  if (!page) {
    return <LiveError message={result.error ?? ""} lang={l} />;
  }

  return <StaticPage icon={ShieldCheck} page={page} />;
}
