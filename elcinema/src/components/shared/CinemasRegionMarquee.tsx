"use client";

import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Lang } from "@/types/home";
import { makeT, type CopyKey } from "@/i18n";
import { cardLink } from "@/lib/links";
import { InfiniteSlider } from "@/components/ui/logo-marquee";

export interface CinemaCountryData {
  code: string;
  theaterId: number;
}

export const CINEMA_COUNTRIES: readonly CinemaCountryData[] = [
  { code: "eg", theaterId: 1 },
  { code: "ae", theaterId: 2 },
  { code: "sa", theaterId: 8 },
  { code: "kw", theaterId: 3 },
  { code: "qa", theaterId: 7 },
  { code: "bh", theaterId: 6 },
  { code: "jo", theaterId: 10 },
  { code: "lb", theaterId: 4 },
  { code: "om", theaterId: 9 },
  { code: "iq", theaterId: 11 },
] as const;

export const CinemasRegionMarquee = memo(function CinemasRegionMarquee({
  lang,
  className,
}: {
  lang: Lang;
  className?: string;
}) {
  const t = makeT(lang);
  const isRtl = lang === "ar";

  return (
    <div className={`w-full overflow-hidden py-3 ${className ?? ""}`}>
      <InfiniteSlider
        gap={20}
        reverse={!isRtl}
        duration={55}
        durationOnHover={20}
        className="w-full mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        {CINEMA_COUNTRIES.map((c) => {
          const countryTitle = t(`cinemasCountry.${c.code}` as CopyKey);
          const chains = t(`cinemasCountry.${c.code}.chains` as CopyKey);
          const tag = t(`cinemasCountry.${c.code}.tag` as CopyKey);
          const link = cardLink(
            lang,
            `https://elcinema.com/${lang}/theater/${c.theaterId}/`,
            countryTitle,
          );

          return (
            <a
              key={c.code}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="group flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/60 px-4 py-3 text-start backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:bg-card hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative shrink-0 overflow-hidden rounded-md border border-border/50 shadow-sm">
                <img
                  src={`https://flagcdn.com/w80/${c.code}.png`}
                  alt={`${countryTitle} flag`}
                  width={36}
                  height={24}
                  loading="lazy"
                  className="h-6 w-9 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground transition-colors group-hover:text-primary whitespace-nowrap">
                    {countryTitle}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary rtl:rotate-90 rtl:group-hover:-translate-x-0.5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <span className="text-primary/80 font-medium">{tag}</span>
                  <span>•</span>
                  <span className="text-muted-foreground/90">{chains}</span>
                </div>
              </div>
            </a>
          );
        })}
      </InfiniteSlider>
    </div>
  );
});

export default CinemasRegionMarquee;
