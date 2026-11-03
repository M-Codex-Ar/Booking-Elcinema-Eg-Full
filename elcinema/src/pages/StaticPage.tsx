/** Generic static content page (About, Contact, Advertise, Privacy, Terms). */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { LiveStaticPage } from "@/types/live";

export function StaticPage({
  icon: Icon,
  page,
  extra,
}: {
  icon: LucideIcon;
  page: LiveStaticPage;
  extra?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Icon className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-black">{page.title}</h1>
      </div>
      <div className="space-y-8">
        {page.sections.map((section, i) => (
          <section key={i} className="space-y-2">
            <h2 className="text-xl font-black">{section.heading}</h2>
            <div className="space-y-3">
              {section.blocks.map((block, j) =>
                block.type === "p" ? (
                  <p key={j} className="leading-relaxed text-muted-foreground">
                    {block.text}
                  </p>
                ) : (
                  <ul key={j} className="list-disc space-y-1 ps-6 text-muted-foreground">
                    {block.items.map((item, k) => (
                      <li key={k}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
      {extra}
    </div>
  );
}
