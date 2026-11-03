import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { StaticPage } from "@/pages/StaticPage";
import { makeT, asLang } from "@/i18n";
import type { LiveStaticPage } from "@/types/live";

export const Route = createFileRoute("/$lang/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Use | elCinema" },
      { name: "description", content: "elCinema terms of use — rules for using the service." },
    ],
  }),
});

function TermsPage() {
  const { lang } = Route.useParams();
  const l = asLang(lang);
  const t = makeT(l);
  // The real elcinema.com has no standalone Terms page to scrape, so the
  // generic static structure carries the edition's own terms copy.
  const page: LiveStaticPage = {
    title: t("footer.termsPage.title"),
    sections: [
      {
        heading: t("footer.termsPage.title"),
        blocks: [{ type: "p", text: t("footer.termsPage.body") }],
      },
    ],
  };
  return <StaticPage icon={FileText} page={page} />;
}
