import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/Dashboard";
import { asLang } from "@/i18n";

export const Route = createFileRoute("/_authenticated/$lang/dashboard")({
  component: DashboardRoute,
  head: ({ params }) => {
    const en = params.lang !== "ar";
    const title = en ? "Dashboard | elCinema" : "لوحة التحكم | إل سينما";
    const description = en
      ? "Catalogue stats, box office charts and movie management."
      : "إحصائيات المحتوى ورسوم الإيرادات وإدارة الأفلام.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function DashboardRoute() {
  const { lang } = Route.useParams();
  return <DashboardPage lang={asLang(lang)} />;
}
