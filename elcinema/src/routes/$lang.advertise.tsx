import { createFileRoute } from "@tanstack/react-router";
import { makeT } from "@/elcinema/i18n";
import type { Lang } from "@/elcinema/home.shared";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/$lang/advertise")({
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
  const l = lang as Lang;
  const t = makeT(l);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Megaphone className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-black">{t("footer.advertisePage.title")}</h1>
      </div>
      <p className="leading-relaxed text-muted-foreground">{t("footer.advertisePage.body")}</p>
    </div>
  );
}
