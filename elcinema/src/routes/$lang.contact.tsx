import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/content/static-page.options";
import { ContactForm } from "@/components/forms/ContactForm";
import { ContactGlobe } from "@/components/shared/ContactGlobe";
import { asLang, makeT } from "@/i18n";

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
  const t = makeT(l);
  const result = useSuspenseQuery(staticPageOptions(l, `/${l}/contact/`)).data;

  // The local page copy is optional; keep the form available either way.
  const sidebarForm = (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{t("contact.formTitle")}</h2>
      <div aria-hidden="true" className="border-t border-dotted border-border" />
      <ContactForm lang={l} />
    </div>
  );

  // Existing social channels accompany the left-side contact information.
  const socialIcons = (
    <div className="flex justify-center gap-3">
      <a
        href="https://www.facebook.com/elCinemaEgypt/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
        title="Facebook"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a
        href="https://x.com/elCinema"
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
        title="X / Twitter"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      </a>
      <a
        href="https://www.instagram.com/elcinemaegypt/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
        title="Instagram"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5"
            ry="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
        </svg>
      </a>
    </div>
  );

  if (result.error && !result.data) {
    return <LiveError message={result.error} lang={l} />;
  }

  const page = result.data ?? {
    title: t("footer.contact"),
    sections: [
      {
        heading: t("contact.getInTouch"),
        blocks: [{ type: "p" as const, text: t("contact.intro") }],
      },
    ],
  };

  return (
    <main className="page-background min-h-screen">
      <div className="mx-auto w-full max-w-site px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="mb-3 inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            {t("footer.contact")}
          </p>
          <h1 className="font-display text-3xl font-black text-balance sm:text-4xl md:text-5xl">
            {page.title}
          </h1>
        </header>

        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <section className="min-w-0 space-y-6" aria-labelledby="contact-details-title">
            <div>
              <h2 id="contact-details-title" className="text-xl font-bold sm:text-2xl">
                {t("contact.getInTouch")}
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                {page.sections.length === 0 ? t("contact.intro") : null}
              </p>
            </div>

            {page.sections.map((section, index) => (
              <article key={`${section.heading}-${index}`} className="space-y-3">
                {section.heading !== t("contact.getInTouch") && (
                  <h3 className="font-bold">{section.heading}</h3>
                )}
                <div className="space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {section.blocks.map((block, blockIndex) =>
                    block.type === "p" ? (
                      <p key={blockIndex}>{block.text}</p>
                    ) : (
                      <ul key={blockIndex} className="space-y-2">
                        {block.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex gap-2">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </article>
            ))}

            <nav aria-label={t("footer.contact")} className="flex gap-3">
              {socialIcons}
            </nav>
            <ContactGlobe />
          </section>

          <section
            className="glass-card min-w-0 p-5 sm:p-7 lg:p-8"
            aria-label={t("contact.formTitle")}
          >
            {sidebarForm}
          </section>
        </div>
      </div>
    </main>
  );
}
