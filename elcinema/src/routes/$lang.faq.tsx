import { createFileRoute } from "@tanstack/react-router";
import { asLang, text } from "@/i18n";
import { FaqPage } from "@/pages/FaqPage";

export const Route = createFileRoute("/$lang/faq")({
  component: FAQPage,
  head: ({ params }) => {
    const lang = asLang(params.lang);
    const title = text(lang, "faq.metaTitle");
    const description = text(lang, "faq.metaDescription");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
});

function FAQPage() {
  const { lang } = Route.useParams();
  return <FaqPage lang={asLang(lang)} />;
}
