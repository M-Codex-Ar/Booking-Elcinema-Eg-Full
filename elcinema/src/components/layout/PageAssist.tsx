import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { Na } from "@/components/shared/ui";
import { makeT } from "@/i18n";
import type { Lang } from "@/types/home";

/** Floating page actions: support on one side, a contextual back-to-top on the other. */
export function PageAssist({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const visible = window.scrollY > window.innerHeight * 0.65;
        setShowTop((current) => (current === visible ? current : visible));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex items-end justify-between px-4 sm:bottom-6 sm:px-6">
      <button
        type="button"
        aria-label={t("chrome.backToTop")}
        title={t("chrome.backToTop")}
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        disabled={!showTop}
        onClick={scrollToTop}
        className={`pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-lg backdrop-blur-md transition-[opacity,transform,color,border-color] duration-300 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
          showTop ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
      <Na
        href={`/${lang}/contact`}
        label={t("footer.contact")}
        className="pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:shadow-glow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">{t("footer.contact")}</span>
      </Na>
    </div>
  );
}
