/**
 * elCinema homepage, rendered with the dark cinema design system.
 * Data comes from the parsed elcinema.com/en/ homepage (EcHomeData).
 * Rendered inside the bilingual shell, which supplies the site header/footer.
 *
 * Every card link goes through `cardLink`: internal pages when the app has
 * one (sample-matched work/person detail, now/soon/boxoffice/tvguide/search),
 * otherwise the real elcinema.com page in a new tab — a raw elcinema.com
 * navigation inside the app produced "refused to connect".
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Ticket,
  Tv,
  TrendingUp,
  ListVideo,
  MonitorPlay,
  Cake,
} from "lucide-react";
import type {
  Bi,
  EcBornPerson,
  EcHomeData,
  EcPromo,
  EcTvSlot,
  EcVod,
} from "@/features/home/home.shared";
import { cardLink } from "@/lib/links";
import { LogoImage, SmartImg } from "@/components/shared/primitives";
import { Na, fmtMonthDay } from "@/components/shared/ui";
import { bi, makeT } from "@/i18n";
import { VodBadge } from "@/features/live/live-ui";
import type { PlaceholderKind } from "@/lib/media.shared";
import type { Lang } from "@/features/home/home.shared";

/** Anchor that never navigates the app to elcinema.com (see links.ts). */
function CardA({
  href,
  title,
  lang,
  className,
  style,
  children,
}: {
  href: string;
  title?: string;
  lang: Lang;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const link = cardLink(lang, href, title);
  return link.external ? (
    <a href={link.href} target="_blank" rel="noreferrer" className={className} style={style}>
      {children}
    </a>
  ) : (
    <Na href={link.href} className={className} style={style}>
      {children}
    </Na>
  );
}

function Hero({ promos, lang }: { promos: EcPromo[]; lang: Lang }) {
  const t = makeT(lang);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (promos.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % promos.length), 6000);
    return () => clearInterval(t);
  }, [promos.length]);
  if (!promos.length) return null;
  const p = promos[Math.min(i, promos.length - 1)];
  if (!p) return null;
  return (
    <section className="relative h-[50vh] w-full overflow-hidden md:h-[65vh]">
      {promos.map((promo, idx) => (
        <SmartImg
          key={idx}
          src={promo.img}
          alt={promo.title}
          kind="wide"
          eager={idx === 0}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      {/* The scrim is heavier on the side the title sits, so it mirrors with the
          reading direction — that direction swap is what `scrim-start` owns. */}
      <div className="scrim-start absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-7xl p-6 md:p-12">
        <h1 className="max-w-2xl text-3xl font-black md:text-5xl">{p.title}</h1>
        <CardA
          href={p.href}
          title={p.title}
          lang={lang}
          className="animate-pulse-neon mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Play className="h-4 w-4 fill-current" /> {p.button || t("home.moreInfo")}
        </CardA>
        {/*
          Ten 40px targets cannot share one line on a 360px phone, and the hero
          clips what it cannot show, so the last slides used to be unreachable.
          Wrapping keeps every slide one tap away; from `sm` the strip is wide
          enough to sit on one line again.
        */}
        <div className="mt-6 -m-2 flex flex-wrap justify-center gap-1 p-2 sm:justify-start">
          {promos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={t("home.slide", { n: idx + 1 })}
              aria-current={idx === i}
              onClick={() => setI(idx)}
              className="flex h-9 min-w-10 items-center justify-center rounded-full"
            >
              {/* The pill is the picture; the button around it is the target, so
                  a thumb has 32px to hit instead of a 6px-tall dash. */}
              <span
                aria-hidden
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-primary" : "w-3 bg-muted-foreground/40"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({
  title,
  icon,
  more,
  lang,
  children,
}: {
  title: string;
  icon: ReactNode;
  more?: string;
  lang: Lang;
  children: ReactNode;
}) {
  const t = makeT(lang);
  const ref = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";
  const scroll = (d: number) => {
    // In RTL, scroll direction behavior depends on browser, but clientWidth offset sign is opposite
    const factor = isRtl ? -d : d;
    ref.current?.scrollBy({ left: factor * ref.current.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-4 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold md:text-2xl">
            <span className="shrink-0 text-primary">{icon}</span>
            <span className="truncate">{title}</span>
          </h2>
          {more && (
            <CardA
              href={more}
              lang={lang}
              className="inline-flex h-8 shrink-0 items-center rounded-full bg-secondary/80 px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3"
            >
              {t("home.seeAll")}
            </CardA>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label={t("home.previous")}
            onClick={() => scroll(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
          >
            {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label={t("home.next")}
            onClick={() => scroll(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
          >
            {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div ref={ref} className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}

function Poster({
  href,
  img,
  fallbackImg,
  title,
  sub,
  badge,
  wide,
  kind,
  lang,
}: {
  href: string;
  img: string | null;
  fallbackImg?: string | null;
  title: string;
  sub?: ReactNode;
  badge?: ReactNode;
  wide?: boolean;
  kind?: PlaceholderKind;
  lang: Lang;
}) {
  const placeholder = kind ?? (wide ? "wide" : "poster");
  const t = makeT(lang);
  return (
    <div className={`group shrink-0 snap-start ${wide ? "w-64 md:w-72" : "w-36 md:w-44"}`}>
      <CardA href={href} title={title} lang={lang} className="block">
        <div
          className={`hover-lift relative overflow-hidden rounded-xl bg-secondary ${wide ? "aspect-video" : "aspect-[2/3]"}`}
        >
          <SmartImg
            src={img}
            fallbackSrc={fallbackImg}
            alt={title}
            kind={placeholder}
            className="h-full w-full transition-transform duration-500 group-hover:scale-110"
          />
          {badge && <div className="absolute end-2 top-2">{badge}</div>}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {t("home.moreInfo")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </span>
          </div>
        </div>
        <h3 className="mt-3 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary">
          {title}
        </h3>
      </CardA>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

/**
 * Timeline slots from the source can overlap (a short program nested inside a
 * longer one). Re-lay them out so every slot owns a clean, non-overlapping
 * stretch of the row: sort by start, clip each slot against its neighbours,
 * and drop anything left with no visible room.
 */
function layoutSlots(slots: EcTvSlot[]): { s: EcTvSlot; left: number; width: number }[] {
  const sorted = [...slots].sort((a, b) => a.left - b.left);
  const placed: { s: EcTvSlot; left: number; width: number }[] = [];
  let prevEnd = 0;
  sorted.forEach((s, i) => {
    const start = Math.max(s.left, prevEnd);
    const nextStart = i + 1 < sorted.length ? (sorted[i + 1]?.left ?? 100) : 100;
    const width = Math.min(s.left + s.width, nextStart) - start;
    if (width > 1) {
      placed.push({ s, left: start, width });
      prevEnd = start + width;
    }
  });
  return placed;
}

/**
 * The caption under a "Born Today" card: what the person is known for, where
 * they are from, their birth year and, when they have died, the date. Each part
 * is only there when the day's listing page published it, so the line shrinks
 * to the name alone rather than showing gaps.
 */
function BornMeta({ person, lang }: { person: EcBornPerson; lang: Lang }) {
  const t = makeT(lang);
  const say = (value: Bi | null) => bi(value ?? undefined, lang);
  const facts = [
    say(person.category),
    say(person.nationality),
    person.birthYear ?? "",
    person.deathDate ? t("home.diedOn", { date: say(person.deathDate) }) : "",
  ].filter(Boolean);
  if (!facts.length) return null;
  return <span className="line-clamp-1">{facts.join(" · ")}</span>;
}

export function HomePage({ data, lang }: { data: EcHomeData; lang: Lang }) {
  const t = makeT(lang);
  const guide = data.tvGuide;
  const guideRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";
  const scrollGuide = (d: number) => {
    const factor = isRtl ? -d : d;
    guideRef.current?.scrollBy({
      left: factor * guideRef.current.clientWidth * 0.7,
      behavior: "smooth",
    });
  };
  return (
    <div className="page-flow flex flex-1 flex-col">
      <Hero promos={data.promos} lang={lang} />

      {data.movies.length > 0 && (
        <Row
          title={t("home.nowInCinemas")}
          icon={<Ticket className="h-5 w-5" />}
          more={`/${lang}/now/`}
          lang={lang}
        >
          {data.movies.map((m, i) => (
            <Poster
              key={i}
              href={m.href}
              img={m.img}
              title={m.title}
              lang={lang}
              sub={
                m.bookingHref && (
                  <CardA
                    href={m.bookingHref}
                    title={m.title}
                    lang={lang}
                    className="font-semibold text-primary hover:underline"
                  >
                    {t("home.bookTickets")}
                  </CardA>
                )
              }
            />
          ))}
        </Row>
      )}

      {data.watchOnline.length > 0 && (
        <Row
          title={t("home.watchOnline")}
          icon={<MonitorPlay className="h-5 w-5" />}
          more={`/${lang}/vod/`}
          lang={lang}
        >
          {data.watchOnline.map((w, i) => (
            <Poster
              key={i}
              href={w.href}
              img={w.img}
              title={w.title}
              lang={lang}
              sub={w.meta}
              badge={<VodBadge vod={w.vod} />}
            />
          ))}
        </Row>
      )}

      {data.tvSummary.length > 0 && (
        <Row
          title={t("home.onTvNow")}
          icon={<Tv className="h-5 w-5" />}
          more={`/${lang}/tvguide/`}
          lang={lang}
        >
          {data.tvSummary.map((t, i) => (
            <Poster
              key={i}
              href={t.href}
              img={t.img}
              title={t.title}
              lang={lang}
              badge={<VodBadge vod={t.vod} />}
              sub={
                <span className="flex items-center gap-1">
                  <LogoImage
                    src={t.channelImg}
                    text={t.channelName}
                    imgClassName="h-4 rounded"
                    textClassName="text-micro"
                  />
                  {t.airtime}
                </span>
              }
            />
          ))}
        </Row>
      )}

      {guide.lines.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="mb-4 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold md:text-2xl">
                <Tv className="h-5 w-5 shrink-0 text-primary" />
                <span className="truncate">{t("home.tvGuide")}</span>
              </h2>
              <CardA
                href={`/${lang}/tvguide/`}
                lang={lang}
                className="inline-flex h-8 shrink-0 items-center rounded-full bg-secondary/80 px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3"
              >
                {t("home.seeAll")}
              </CardA>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                aria-label={t("home.previous")}
                onClick={() => scrollGuide(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                aria-label={t("home.next")}
                onClick={() => scrollGuide(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Day timeline with sticky channel column, visible and scrollable
              at every screen size; the rounded card clips the inner scroll
              area so the scrollbar stays inside the table. */}
          <div className="glass-card overflow-hidden">
            <div ref={guideRef} className="overflow-x-auto overscroll-x-contain">
              <div className="min-w-[560px] sm:min-w-[720px] lg:min-w-[960px]">
                <div className="sticky top-0 z-10 flex border-b border-border bg-card/95 text-xs text-muted-foreground backdrop-blur-sm">
                  <div className="w-32 shrink-0" />
                  <div className="flex flex-1">
                    {guide.times.map((t, i) => (
                      <div
                        key={i}
                        className="min-w-0 flex-1 truncate px-2 py-3 text-center sm:px-3"
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                {guide.lines.map((line, i) => (
                  <div key={i} className="flex border-b border-border/60 last:border-0">
                    <CardA
                      href={line.channelHref}
                      title={line.channelName}
                      lang={lang}
                      className="sticky start-0 z-[1] flex w-32 shrink-0 items-center justify-center gap-2 border-e border-border/60 bg-card/95 p-2 backdrop-blur-sm transition-colors hover:bg-secondary"
                    >
                      <LogoImage
                        src={line.channelImg}
                        text={line.channelName}
                        imgClassName="max-h-8 max-w-24 object-contain"
                      />
                    </CardA>
                    <div className="relative h-14 flex-1">
                      {layoutSlots(line.slots).map(({ s, left, width }, j) =>
                        s.titleHref && !s.unclickable ? (
                          <CardA
                            key={j}
                            href={s.titleHref}
                            title={s.title}
                            lang={lang}
                            style={{ left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)` }}
                            className="absolute inset-y-1.5 overflow-hidden rounded-md border border-border bg-secondary px-2.5 py-1 text-xs transition-colors hover:border-primary"
                          >
                            <div className="truncate font-semibold">{s.title}</div>
                            <div className="truncate text-muted-foreground">{s.time}</div>
                          </CardA>
                        ) : (
                          <div
                            key={j}
                            style={{ left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)` }}
                            className="absolute inset-y-1.5 overflow-hidden rounded-md border border-border bg-secondary px-2.5 py-1 text-xs"
                          >
                            <div className="truncate font-semibold">{s.title}</div>
                            <div className="truncate text-muted-foreground">{s.time}</div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {data.videos.length > 0 && (
        <Row
          title={t("home.videos")}
          icon={<Play className="h-5 w-5" />}
          more={`/${lang}/video/`}
          lang={lang}
        >
          {data.videos.map((v, i) => (
            <Poster
              key={i}
              wide
              href={v.href}
              img={v.img}
              title={v.title}
              lang={lang}
              badge={
                v.duration && (
                  <span className="rounded-md bg-background/80 px-2 py-1 text-micro font-bold">
                    {v.duration}
                  </span>
                )
              }
            />
          ))}
        </Row>
      )}

      {/* "Born Today" sits where the source page puts it: after the elCinema TV
          videos and before the lists / box office columns. */}
      {data.bornToday.people.length > 0 && (
        <Row
          title={
            data.bornToday.dateKey
              ? `${t("home.bornToday")} · ${fmtMonthDay(data.bornToday.dateKey, lang)}`
              : t("home.bornToday")
          }
          icon={<Cake className="h-5 w-5" />}
          more={data.bornToday.href}
          lang={lang}
        >
          {data.bornToday.people.map((p) => (
            <Poster
              key={p.id}
              href={p.href}
              img={p.localImg ?? p.img}
              fallbackImg={p.localImg ? p.img : null}
              title={bi(p.name, lang)}
              kind="person"
              lang={lang}
              sub={<BornMeta person={p} lang={lang} />}
            />
          ))}
        </Row>
      )}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2 md:px-8">
        {data.boxoffice.length > 0 && (
          <div className="glass-card cinema-gradient p-6">
            <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
              <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold">
                <TrendingUp className="h-5 w-5 shrink-0 text-primary" />
                <span className="truncate">{t("home.boxOffice")}</span>
              </h2>
              <CardA
                href={`/${lang}/boxoffice/`}
                lang={lang}
                className="inline-flex h-8 shrink-0 items-center rounded-full bg-secondary/80 px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3"
              >
                {t("home.seeAll")}
              </CardA>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">{data.boxofficeDate}</p>
            <ol className="space-y-3">
              {data.boxoffice.map((b, i) => (
                <li key={i}>
                  <CardA
                    href={b.href}
                    title={b.title}
                    lang={lang}
                    className="group flex items-center gap-3"
                  >
                    <span className="w-6 text-lg font-black text-primary">{i + 1}</span>
                    <SmartImg
                      src={b.img}
                      alt={b.title}
                      kind="poster"
                      className="h-14 w-10 rounded-md"
                    />
                    <span className="flex-1 font-semibold group-hover:text-primary">{b.title}</span>
                    <span className="text-sm font-bold text-gold">{b.revenue}</span>
                  </CardA>
                </li>
              ))}
            </ol>
          </div>
        )}
        {data.lists.length > 0 && (
          <div className="glass-card p-6">
            <div className="mb-4 flex items-center justify-between gap-2 sm:gap-3">
              <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold">
                <ListVideo className="h-5 w-5 shrink-0 text-primary" />
                <span className="truncate">{t("home.lists")}</span>
              </h2>
              <CardA
                href={`/${lang}/lineup/`}
                lang={lang}
                className="inline-flex h-8 shrink-0 items-center rounded-full bg-secondary/80 px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3"
              >
                {t("home.seeAll")}
              </CardA>
            </div>
            <ul className="divide-y divide-border">
              {data.lists.map((l, i) => (
                <li key={i}>
                  <CardA
                    href={l.href}
                    title={l.title}
                    lang={lang}
                    className="block py-3 text-sm font-semibold transition-colors hover:text-primary"
                  >
                    {l.title}
                  </CardA>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
