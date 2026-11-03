import { ArrowRight, Mail } from "lucide-react";
import type { Lang } from "@/types/home";
import { makeT } from "@/i18n";
import { Na } from "@/components/shared/ui";
import { FaqDrawer } from "@/features/faq/FaqDrawer";

export function FaqPage({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const items = [
    { category: t("faq.categoryBooking"), question: t("faq.q1"), answer: t("faq.a1") },
    { category: t("faq.categoryBooking"), question: t("faq.q2"), answer: t("faq.a2") },
    { category: t("faq.categoryBooking"), question: t("faq.q3"), answer: t("faq.a3") },
    { category: t("faq.categoryGuide"), question: t("faq.q4"), answer: t("faq.a4") },
    { category: t("faq.categoryGuide"), question: t("faq.q5"), answer: t("faq.a5") },
    { category: t("faq.categoryAccount"), question: t("faq.q6"), answer: t("faq.a6") },
    { category: t("faq.categoryAccount"), question: t("faq.q7"), answer: t("faq.a7") },
  ];

  return (
    <>
      <FaqDrawer
        label={t("faq.label")}
        title={t("faq.title")}
        lead={t("faq.lead")}
        drawerLabel={t("faq.drawer")}
        countLabel={t("faq.cardCount", { count: items.length })}
        items={items}
      />
      <div className="mx-auto w-full max-w-site px-4 pb-12 sm:px-6 md:px-8">
        <div className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-bold">{t("faq.contactTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("faq.contactLead")}</p>
          </div>
          <Na
            href={`/${lang}/contact`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail aria-hidden="true" className="h-4 w-4" />
            {t("faq.contactAction")}
            <ArrowRight aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
          </Na>
        </div>
      </div>
    </>
  );
}
