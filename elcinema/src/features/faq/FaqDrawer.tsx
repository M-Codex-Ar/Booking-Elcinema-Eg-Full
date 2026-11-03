import { ChevronDown, HelpCircle } from "lucide-react";
import { faqCard, faqQuestion, faqTray } from "@/components/shared/variants";

export interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export function FaqDrawer({
  label,
  title,
  lead,
  drawerLabel,
  countLabel,
  items,
}: {
  label: string;
  title: string;
  lead: string;
  drawerLabel: string;
  countLabel: string;
  items: FaqItem[];
}) {
  return (
    <section className="relative isolate overflow-x-clip bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 cinema-gradient" />
      <div className="relative mx-auto grid w-full max-w-site items-start gap-8 px-4 py-10 sm:gap-12 sm:px-6 sm:py-14 md:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:py-20">
        <header className="lg:sticky lg:top-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <HelpCircle aria-hidden="true" className="h-4 w-4" />
            <span>{label}</span>
          </div>
          <h1 className="max-w-xl text-3xl font-black leading-tight text-balance sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
            {lead}
          </p>
          <div className="mt-8 flex items-center gap-3 border-s-2 border-primary/40 ps-4 text-sm text-muted-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{countLabel}</span>
          </div>
        </header>

        <div className={faqTray()}>
          <div className="rounded-xl border border-border bg-background/70 p-3 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {drawerLabel}
              </span>
              <span aria-hidden="true" className="h-1.5 w-12 rounded-full bg-border" />
            </div>

            <div className="grid gap-2.5">
              {items.map((item, index) => (
                <details
                  key={item.question}
                  name="elcinema-faq"
                  open={index === 0}
                  className={faqCard()}
                >
                  <summary className={faqQuestion()}>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold leading-snug">
                      {item.question}
                    </span>
                    <span className="hidden shrink-0 rounded-full border border-border bg-secondary px-2.5 py-1 text-meta font-semibold text-muted-foreground sm:inline-flex">
                      {item.category}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>
                  <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
                    <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.answer}
                    </p>
                    <span className="mt-4 inline-flex rounded-full bg-secondary px-2.5 py-1 text-meta font-semibold text-muted-foreground sm:hidden">
                      {item.category}
                    </span>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
