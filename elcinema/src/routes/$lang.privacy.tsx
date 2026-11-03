import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/live/live.options";
import { StaticPage } from "@/pages/StaticPage";
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
  if (result.error || !result.data) {
    return <LiveError message={result.error ?? ""} lang={l} />;
  }
  return <StaticPage icon={ShieldCheck} page={result.data} />;
}
