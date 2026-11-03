/**
 * TV guide renderer shared by the home page and the full TV guide page:
 * a day timeline with a sticky channel column, responsive at every screen
 * size and horizontally scrollable inside its rounded card.
 */
import { fmtAirtime, fmtClock, layoutSlots } from "@/lib/build";
import { artworkSrc, LogoImage } from "@/components/shared/primitives";
import { cardLink } from "@/lib/links";
import { Na } from "@/components/shared/ui";
import type { TvGuide as TvGuideData, TvLine, Lang } from "@/features/home/home.shared";

export function TvGuideView({
  guide,
  lang,
  lines,
}: {
  guide: TvGuideData;
  lang: Lang;
  lines: TvLine[];
}) {
  return (
    <div>
      {/* Day timeline with a sticky channel column, responsive at every
          screen size: narrower column and min-width on phones, and the
          rounded card clips the inner scroll area. */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain">
          <div className="min-w-[560px] sm:min-w-[720px] lg:min-w-[960px]">
            <div className="sticky top-0 z-10 flex border-b border-border bg-card/95 text-xs text-muted-foreground backdrop-blur-sm">
              <div className="w-28 shrink-0 sm:w-40" />
              <div className="flex flex-1">
                {guide.times.map((tt, i) => (
                  <div key={i} className="min-w-0 flex-1 truncate px-2 py-3 text-center sm:px-3">
                    {fmtClock(tt)}
                  </div>
                ))}
              </div>
            </div>
            {lines.map((line, i) => (
              <div key={i} className="flex border-b border-border/60 last:border-0">
                <div className="sticky start-0 z-[1] flex w-28 shrink-0 items-center gap-2 border-e border-border/60 bg-card/95 p-2 backdrop-blur-sm transition-colors hover:bg-secondary sm:w-40">
                  <LogoImage
                    src={line.channel.img}
                    text={line.channel.name[lang]}
                    imgClassName="max-h-7 max-w-20 object-contain"
                  />
                  {/* The name is the label on phones where a 20px logo is not
                      identifiable — but only when there *is* a logo, because
                      `LogoImage` already prints the name as its own fallback. */}
                  {artworkSrc(line.channel.img) ? (
                    <span className="truncate text-xs font-semibold sm:hidden">
                      {line.channel.name[lang]}
                    </span>
                  ) : null}
                </div>
                <div className="relative h-14 flex-1">
                  {layoutSlots(line.slots, guide).map(({ index, left, width }) => {
                    const s = line.slots[index]!;
                    const link = s.href ? cardLink(lang, s.href, s.title[lang]) : null;
                    const inner = (
                      <>
                        <div className="truncate font-semibold">{s.title[lang]}</div>
                        <div className="truncate text-muted-foreground">
                          {fmtAirtime(s.start, lang)}
                        </div>
                      </>
                    );
                    if (link && !link.external) {
                      return (
                        <Na
                          key={index}
                          href={link.href}
                          style={{ left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)` }}
                          className="absolute inset-y-1.5 overflow-hidden rounded-md border border-border bg-secondary px-2.5 py-1 text-xs transition-colors hover:border-primary"
                        >
                          {inner}
                        </Na>
                      );
                    }
                    return (
                      <div
                        key={index}
                        style={{ left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)` }}
                        className="absolute inset-y-1.5 overflow-hidden rounded-md border border-border bg-secondary px-2.5 py-1 text-xs"
                        title={s.title[lang]}
                      >
                        {inner}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
