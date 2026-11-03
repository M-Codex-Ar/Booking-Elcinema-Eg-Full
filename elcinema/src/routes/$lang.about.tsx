import { createFileRoute } from "@tanstack/react-router";
import { makeT } from "@/i18n";
import type { Lang } from "@/features/home/home.shared";
import { Info } from "lucide-react";

export const Route = createFileRoute("/$lang/about")({
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
  const l = lang as Lang;
  const t = makeT(l);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Info className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-black">{t("footer.aboutPage.title")}</h1>
      </div>
      <p className="leading-relaxed text-muted-foreground">{t("footer.aboutPage.body")}</p>
    </div>
  );
}
