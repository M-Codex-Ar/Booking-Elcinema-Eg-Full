/**
 * Live person detail — mirrors the real elcinema.com /person/<id>/ page with
 * the app's dark cinema design system. Data is scraped server-side from the
 * English or Arabic edition; filmography works link to internal work pages.
 */
import { Film, UserRound } from "lucide-react";
import type { Lang } from "../home.shared";
import type { LivePerson } from "../live.shared";
import { Na } from "../ui";
import { LiveImg, LivePoster, bookingPath } from "../live-ui";
import { makeT } from "../i18n";

export function LivePersonPage({ data, lang }: { data: LivePerson; lang: Lang }) {
  const t = makeT(lang);
  return (
    <div>
      {/* Header */}
      <div className="glass-card cinema-gradient mx-auto mt-8 max-w-5xl">
        <div className="flex flex-col items-center gap-6 p-6 text-center md:flex-row md:p-10 md:text-start">
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
            <LiveImg src={data.photo} alt={data.name} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-black md:text-4xl">{data.name}</h1>
            {data.altName && data.altName !== data.name && (
              <p className="mt-1 text-sm text-muted-foreground">{data.altName}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm md:justify-start">
              {data.nationality && (
                <span className="rounded-full bg-secondary px-3 py-1 font-semibold">
                  {data.nationality}
                </span>
              )}
              {data.filmography.length > 0 && (
                <span className="rounded-full border border-border px-3 py-1 font-bold text-muted-foreground">
                  {data.filmography.reduce((n, s) => n + s.items.length, 0)} {t("person.works")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        {data.bio && (
          <p className="mb-8 text-base leading-relaxed text-foreground/90">{data.bio}</p>
        )}

        {data.filmography.map((section) => (
          <section key={section.section} className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
              <Film className="h-5 w-5 text-primary" /> {section.section}
            </h2>
            <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-6">
              {section.items.map((w) => (
                <LivePoster key={w.id} lang={lang} id={w.id} title={w.title} img={w.img} fluid />
              ))}
            </div>
          </section>
        ))}

        {data.photos.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-black">{t("common.photos")}</h2>
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
              {data.photos.map((p, i) => (
                <div
                  key={i}
                  className="w-40 shrink-0 overflow-hidden rounded-lg border border-border"
                >
                  <div className="aspect-[3/4]">
                    <LiveImg src={p.img} alt={data.name} className="h-full w-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.vod.length > 0 && (
          <section className="glass-card mb-10 p-5">
            <h2 className="text-lg font-black">{t("vod.title")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.vod.map((v, i) => (
                <a
                  key={i}
                  href={v.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-bold hover:border-primary"
                >
                  {t("vod.watchOn")} {v.label}
                  {v.note && <span className="ms-1 text-xs text-muted-foreground">({v.note})</span>}
                </a>
              ))}
            </div>
            <p className="mt-3 text-meta text-muted-foreground">{t("vod.playbackNote")}</p>
          </section>
        )}

        {data.crewWith.length > 0 && (
          <section className="pb-4">
            <h2 className="mb-4 text-xl font-black">{t("person.crew")}</h2>
            <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-6">
              {data.crewWith.slice(0, 12).map((p) => (
                <Na key={p.id} href={`/${lang}/person/${p.id}`} className="group w-full max-w-40">
                  <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
                    <LiveImg src={p.img} alt={p.title} className="h-full w-full" />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-center text-xs font-bold transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                </Na>
              ))}
            </div>
          </section>
        )}

        <div className="pb-10 text-center">
          <Na
            href={bookingPath(lang)}
            className="inline-flex rounded-lg border border-border px-6 py-3 font-bold hover:border-primary hover:text-primary"
          >
            {t("booking.ticketCinema")}
          </Na>
        </div>
      </div>
    </div>
  );
}

export function LivePersonNotFound({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
      <UserRound className="mx-auto h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-black">{t("person.notFound")}</h1>
      <Na
        href={`/${lang}/now`}
        className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
      >
        {t("now.title")}
      </Na>
    </div>
  );
}
