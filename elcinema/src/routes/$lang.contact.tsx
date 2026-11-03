import { createFileRoute } from "@tanstack/react-router";
import { makeT } from "@/i18n";
import type { Lang } from "@/home.shared";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/$lang/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us | elCinema" },
      { name: "description", content: "Get in touch with the elCinema team." },
    ],
  }),
});

function ContactPage() {
  const { lang } = Route.useParams();
  const l = lang as Lang;
  const t = makeT(l);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Mail className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-black">{t("footer.contactPage.title")}</h1>
      </div>
      <p className="leading-relaxed text-muted-foreground">{t("footer.contactPage.body")}</p>
      <div className="mt-8 flex gap-3">
        <a
          href="https://www.facebook.com/elCinemaEgypt/"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          Facebook
        </a>
        <a
          href="https://x.com/elCinema"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          X / Twitter
        </a>
      </div>
    </div>
  );
}
