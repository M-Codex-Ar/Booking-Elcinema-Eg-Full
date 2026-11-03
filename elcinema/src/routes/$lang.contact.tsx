import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { LiveError } from "@/features/live/live-ui";
import { staticPageOptions } from "@/features/live/live.options";
import { StaticPage } from "@/pages/StaticPage";
import { ContactForm } from "@/components/forms/ContactForm";
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

  // Show form even if scraping fails
  const sidebarForm = (
    <div className="space-y-2">
      <h3 className="text-base font-bold">Send us a Message</h3>
      <ContactForm lang={l} />
    </div>
  );

  // Social icons below form
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
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
        </svg>
      </a>
    </div>
  );

  // Show error message only if scraping failed AND has error content
  if (result.error && !result.data) {
    return <LiveError message={result.error} lang={l} />;
  }

  // Fallback static content if scraping fails
  if (!result.data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="border-b border-border bg-background/50 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="rounded-lg bg-primary/10 p-3 sm:p-4">
                <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-black sm:text-4xl md:text-5xl">Get in Touch</h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <p className="mb-6 text-lg text-foreground/80">
                Have a question or suggestion? We'd love to hear from you!
              </p>
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-6">
                <div className="rounded-xl border border-border bg-muted/50 p-6 sm:p-8">
                  {sidebarForm}
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  {socialIcons}
                </div>
              </div>
            </aside>
            <div className="lg:hidden space-y-6">
              <div className="rounded-xl border border-border bg-muted/50 p-6 sm:p-8">
                {sidebarForm}
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                {socialIcons}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const page = result.data;
  return <StaticPage icon={Mail} page={page} sidebarForm={sidebarForm} socialIcons={socialIcons} />;
}
