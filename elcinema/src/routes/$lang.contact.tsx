import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/live/live.options";
import { StaticPage } from "@/pages/StaticPage";
import { asLang } from "@/i18n";

export const Route = createFileRoute("/$lang/contact")({
  loader: ({ context, params }) => {
    const lang = asLang(params.lang);
    return context.queryClient.ensureQueryData(staticPageOptions(lang, `/${lang}/contact/`));
  },
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
  const l = asLang(lang);
  const result = useSuspenseQuery(staticPageOptions(l, `/${l}/contact/`)).data;
  if (result.error || !result.data) {
    return <LiveError message={result.error ?? ""} lang={l} />;
  }
  const page = result.data;
  return (
    <StaticPage
      icon={Mail}
      page={page}
      extra={
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
      }
    />
  );
}
