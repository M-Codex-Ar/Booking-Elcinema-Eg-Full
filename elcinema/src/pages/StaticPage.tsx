/** Generic static content page (About, Contact, Advertise, Privacy, Terms). */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { LiveStaticPage } from "@/types/live";

export function StaticPage({
  icon: Icon,
  page,
  extra,
  sidebarForm,
  socialIcons,
}: {
  icon: LucideIcon;
  page: LiveStaticPage;
  extra?: ReactNode;
  sidebarForm?: ReactNode;
  socialIcons?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
              <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black sm:text-3xl md:text-4xl">{page.title}</h1>
          </div>
        </div>
      </div>

      {/* Content Section with Sticky Sidebar */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
          {/* Main Content (Left - 50%) */}
          <div className="lg:col-span-2 space-y-6">
            {page.sections.map((section, i) => (
              <article key={i} className="space-y-3 scroll-mt-20" id={`section-${i}`}>
                {/* Section Heading */}
                <div className="space-y-1 border-l-4 border-primary ps-3">
                  <h2 className="text-xl font-black sm:text-2xl">{section.heading}</h2>
                  <div className="h-1 w-8 bg-gradient-to-r from-primary to-transparent" />
                </div>

                {/* Section Content */}
                <div className="space-y-2 text-foreground/80">
                  {section.blocks.map((block, j) =>
                    block.type === "p" ? (
                      <p key={j} className="leading-relaxed text-sm sm:text-base">
                        {block.text}
                      </p>
                    ) : (
                      <div key={j} className="space-y-1">
                        <ul className="list-inside space-y-1 ps-2">
                          {block.items.map((item, k) => (
                            <li key={k} className="flex gap-2 text-sm sm:text-base">
                              <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar (Right - 50%): Wider Image or Form */}
          <aside className="hidden lg:block lg:col-span-2">
            <div className={`sticky top-0 flex flex-col ${!sidebarForm && page.image ? "h-screen" : ""} ${!sidebarForm && page.image ? "justify-start gap-4" : "justify-start gap-3"}`}>
              {/* Form (Contact page) */}
              {sidebarForm && (
                <div className="rounded-xl border border-border bg-muted/50 p-6 sm:p-8 flex-shrink-0">
                  {sidebarForm}
                </div>
              )}

              {/* Social Icons - Single row below form */}
              {socialIcons && (
                <div className="rounded-xl border border-border bg-muted/50 p-4 flex-shrink-0">
                  {socialIcons}
                </div>
              )}

              {/* Image (Other static pages) - Fill remaining space */}
              {!sidebarForm && page.image && (
                <div className="overflow-hidden rounded-xl border border-border flex-1 min-h-0">
                  <img
                    src={page.image}
                    alt={page.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Extra Content */}
              {extra && (
                <div className="rounded-xl border border-border bg-muted/50 p-6 sm:p-8 flex-shrink-0">
                  <div className="space-y-4">{extra}</div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile Sidebar Fallback (Below on mobile, full width) */}
          <div className="lg:hidden space-y-6">
            {sidebarForm && (
              <div className="rounded-xl border border-border bg-muted/50 p-6 sm:p-8">
                {sidebarForm}
              </div>
            )}

            {socialIcons && (
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                {socialIcons}
              </div>
            )}

            {!sidebarForm && page.image && (
              <div className="overflow-hidden rounded-xl border border-border h-96">
                <img
                  src={page.image}
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {extra && (
              <div className="rounded-xl border border-border bg-muted/50 p-6 sm:p-8">
                <div className="space-y-4">{extra}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Spacing */}
      <div className="h-6" />
    </div>
  );
}
