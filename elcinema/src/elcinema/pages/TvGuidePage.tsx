/** TV Guide — full evening grid across all channels, filterable by
 * category and by channel name (URL-driven). */
import { Tv } from "lucide-react";
import { TvGuideView } from "../TvGuide";
import type { ChannelCategory, Lang, TvGuide } from "../home.shared";
import { FilterInput, ListToolbar, type SetSearch } from "../controls";

const CATS: { id: ChannelCategory | "all"; en: string; ar: string }[] = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "general", en: "General", ar: "عام" },
  { id: "movies", en: "Movies", ar: "أفلام" },
  { id: "series", en: "Series", ar: "مسلسلات" },
  { id: "news", en: "News", ar: "أخبار" },
  { id: "sports", en: "Sports", ar: "رياضة" },
  { id: "kids", en: "Kids", ar: "أطفال" },
  { id: "music", en: "Music", ar: "موسيقى" },
  { id: "documentary", en: "Documentary", ar: "وثائقي" },
  { id: "religion", en: "Religion", ar: "ديني" },
];

const L = {
  en: {
    title: "TV Guide",
    sub: "Tonight across Arab satellite channels",
    channels: "channels",
    filter: "Filter channels…",
  },
  ar: {
    title: "جدول القنوات",
    sub: "الليلة على القنوات الفضائية العربية",
    channels: "قناة",
    filter: "ابحث في القنوات…",
  },
} as const;

export function TvGuidePage({
  lang,
  guide,
  cat = "all",
  q = "",
  setSearch,
}: {
  lang: Lang;
  guide: TvGuide;
  cat?: string | undefined;
  q?: string | undefined;
  setSearch: SetSearch;
}) {
  const Lx = L[lang];
  const activeCat = (CATS.find((c) => c.id === cat)?.id ?? "all") as ChannelCategory | "all";
  const needle = q.trim().toLowerCase();
  const lines = guide.lines.filter(
    (l) =>
      (activeCat === "all" || l.channel.category === activeCat) &&
      (!needle || l.channel.name[lang].toLowerCase().includes(needle)),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-black md:text-3xl">
        <Tv className="h-6 w-6 text-primary" /> {Lx.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{Lx.sub}</p>

      <ListToolbar>
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSearch({ cat: c.id, q: undefined })}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeCat === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            }`}
          >
            {lang === "en" ? c.en : c.ar}
          </button>
        ))}
        <span className="grow" />
        <FilterInput
          lang={lang}
          value={q}
          onChange={(v) => setSearch({ q: v || undefined })}
          placeholder={Lx.filter}
        />
      </ListToolbar>

      <p className="mt-4 text-xs text-muted-foreground">
        {lines.length} {Lx.channels}
      </p>

      <div className="mt-4">
        <TvGuideView guide={guide} lang={lang} lines={lines} />
      </div>
    </div>
  );
}
