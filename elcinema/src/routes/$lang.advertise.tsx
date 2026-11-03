import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/live/live.options";
import { StaticPage } from "@/pages/StaticPage";
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
  if (result.error || !result.data) {
    return <LiveError message={result.error ?? ""} lang={l} />;
  }
  return <StaticPage icon={Megaphone} page={result.data} />;
}
