import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/live/live.options";
import { StaticPage } from "@/pages/StaticPage";
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
  if (result.error || !result.data) {
    return <LiveError message={result.error ?? ""} lang={l} />;
  }
  return <StaticPage icon={Info} page={result.data} />;
}
