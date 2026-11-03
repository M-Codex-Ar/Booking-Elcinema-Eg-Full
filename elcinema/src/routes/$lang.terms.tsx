import { createFileRoute } from "@tanstack/react-router";
import { makeT } from "@/i18n";
import type { Lang } from "@/features/home/home.shared";
import { FileText } from "lucide-react";

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
  const l = lang as Lang;
  const t = makeT(l);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <div className="mb-6 flex items-center gap-3">
        <FileText className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-black">{t("footer.termsPage.title")}</h1>
      </div>
      <p className="leading-relaxed text-muted-foreground">{t("footer.termsPage.body")}</p>
    </div>
  );
}
