/** Read-only dashboard sections covering every part of the main site. */
import { ExternalLink } from "lucide-react";
import { BOXOFFICE, CHANNELS, GENRES, MOVIES, PEOPLE, TV_GUIDE_DATA } from "@/lib/data";
import { fmtAirtime, fmtRevenue, personId, posterUrl, photoUrl, workId } from "@/lib/build";
import { ImgWithFallback } from "@/components/shared/primitives";
import { Na, personPath, workPath } from "@/components/shared/ui";
import type { Lang, Movie } from "@/types/home";
import { pair as L } from "@/i18n";
import { DataTable, type Col } from "./DataTable";

/**
 * Tiny artwork cell for dashboard tables: a dead or missing reference shows the
 * empty muted box instead of a browser broken-image icon (the inline `onError`
 * visibility hack this replaces did not survive every browser). Table cells are
 * too small for the poster placeholder artwork, so no `kind` swap here.
 */
function Thumb({ src }: { src: string }) {
  return (
    <ImgWithFallback
      src={src}
      alt=""
      className="h-10 w-7 shrink-0 rounded bg-muted"
      fallback={<div className="h-10 w-7 shrink-0 rounded bg-muted" />}
    />
  );
}

function ViewLink({ href, lang }: { href: string; lang: Lang }) {
  return (
    <Na href={href} className="inline-flex items-center gap-1 text-primary hover:underline">
      {L(lang, "View", "عرض")} <ExternalLink className="h-3 w-3" />
    </Na>
  );
}

function movieCols(lang: Lang): Col<Movie>[] {
  return [
    {
      key: "title",
      label: L(lang, "Title", "العنوان"),
      value: (m) => m.title[lang],
      render: (m) => (
        <div className="flex min-w-48 items-center gap-2">
          <Thumb src={posterUrl(m)} />
          <span className="font-semibold">{m.title[lang]}</span>
        </div>
      ),
    },
    {
      key: "genre",
      label: L(lang, "Genres", "النوع"),
      value: (m) => m.genres.map((g) => GENRES[g]?.[lang] ?? g).join(", "),
    },
    { key: "director", label: L(lang, "Director", "المخرج"), value: (m) => m.director[lang] },
    { key: "release", label: L(lang, "Release", "العرض"), value: (m) => m.release },
    {
      key: "rating",
      label: L(lang, "Rating", "التقييم"),
      value: (m) => m.rating ?? 0,
      render: (m) => m.rating ?? "—",
    },
    {
      key: "runtime",
      label: L(lang, "Minutes", "الدقائق"),
      value: (m) => m.runtime,
      render: (m) => m.runtime || "—",
    },
    {
      key: "link",
      label: "",
      value: () => "",
      render: (m) => <ViewLink lang={lang} href={workPath(lang, workId(m))} />,
    },
  ];
}

export function MoviesSection({ lang, status }: { lang: Lang; status?: "now" | "soon" }) {
  const rows = status ? MOVIES.filter((m) => m.status === status) : MOVIES;
  return <DataTable lang={lang} rows={rows} cols={movieCols(lang)} />;
}

export function PeopleSection({ lang }: { lang: Lang }) {
  return (
    <DataTable
      lang={lang}
      rows={PEOPLE}
      cols={[
        {
          key: "name",
          label: L(lang, "Name", "الاسم"),
          value: (p) => p.name[lang],
          render: (p) => (
            <div className="flex min-w-40 items-center gap-2">
              <Thumb src={photoUrl(p)} />
              <span className="font-semibold">{p.name[lang]}</span>
            </div>
          ),
        },
        { key: "role", label: L(lang, "Role", "الدور"), value: (p) => p.role[lang] },
        { key: "works", label: L(lang, "Works", "الأعمال"), value: (p) => p.knownFor.length },
        {
          key: "link",
          label: "",
          value: () => "",
          render: (p) => <ViewLink lang={lang} href={personPath(lang, personId(p))} />,
        },
      ]}
    />
  );
}

export function BoxOfficeSection({ lang }: { lang: Lang }) {
  const rows = BOXOFFICE.map((b, i) => ({ ...b, rank: i + 1 }));
  return (
    <DataTable
      lang={lang}
      rows={rows}
      cols={[
        { key: "rank", label: "#", value: (b) => b.rank },
        {
          key: "title",
          label: L(lang, "Title", "العنوان"),
          value: (b) => b.title[lang],
          render: (b) => <span className="font-semibold">{b.title[lang]}</span>,
        },
        {
          key: "weekly",
          label: L(lang, "Weekly", "الأسبوع"),
          value: (b) => b.weeklyEgp,
          render: (b) => fmtRevenue(b.weeklyEgp, lang),
        },
        {
          key: "total",
          label: L(lang, "Total", "الإجمالي"),
          value: (b) => b.totalEgp,
          render: (b) => fmtRevenue(b.totalEgp, lang),
        },
      ]}
    />
  );
}

export function ChannelsSection({ lang }: { lang: Lang }) {
  const rows = CHANNELS.map((c) => {
    const line = TV_GUIDE_DATA.lines.find((l) => l.channel.id === c.id);
    return { ...c, slots: line?.slots ?? [] };
  });
  return (
    <DataTable
      lang={lang}
      rows={rows}
      cols={[
        {
          key: "name",
          label: L(lang, "Channel", "القناة"),
          value: (c) => c.name[lang],
          render: (c) => (
            <div className="flex min-w-40 items-center gap-2">
              <ImgWithFallback
                src={c.img}
                alt=""
                fit="contain"
                className="h-8 w-8 shrink-0 rounded bg-muted"
                fallback={<div className="h-8 w-8 shrink-0 rounded bg-muted" />}
              />
              <span className="font-semibold">{c.name[lang]}</span>
            </div>
          ),
        },
        { key: "cat", label: L(lang, "Category", "الفئة"), value: (c) => c.category },
        { key: "count", label: L(lang, "Programs", "البرامج"), value: (c) => c.slots.length },
        {
          key: "next",
          label: L(lang, "First program", "أول برنامج"),
          value: (c) => c.slots[0]?.title[lang] ?? "",
          render: (c) =>
            c.slots[0] ? `${fmtAirtime(c.slots[0].start, lang)} · ${c.slots[0].title[lang]}` : "—",
        },
      ]}
    />
  );
}

/** Sections that show live data from elcinema.com: link out to the site pages. */
export function LiveSection({
  lang,
  seg,
  title,
  text,
}: {
  lang: Lang;
  seg: string;
  title: string;
  text: string;
}) {
  return (
    <div className="glass-card max-w-xl rounded-2xl border border-border p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      <Na
        href={`/${lang}/${seg}`}
        className="mt-4 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
      >
        {L(lang, "Open page", "فتح الصفحة")} <ExternalLink className="h-4 w-4" />
      </Na>
    </div>
  );
}
