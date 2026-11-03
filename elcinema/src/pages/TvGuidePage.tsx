/** TV Guide â€” full evening grid across all channels, filterable by
 * category and by channel name (URL-driven), paginated. */
import { Tv } from "lucide-react";
import { TvGuideView } from "@/components/shared/TvGuide";
import type { ChannelCategory, Lang, TvGuide } from "@/types/home";
import {
  FilterInput,
  ListToolbar,
  Pagination,
  clampPage,
  pageCount,
  pageSlice,
  type SetSearch,
} from "@/components/shared/controls";
import { bi, makeT } from "@/i18n";

const PAGE_SIZE = 20;

const CATS: { id: ChannelCategory | "all"; en: string; ar: string }[] = [
  { id: "all", en: "All", ar: "Ø§Ù„ÙƒÙ„" },
  { id: "general", en: "General", ar: "Ø¹Ø§Ù…" },
  { id: "movies", en: "Movies", ar: "Ø£ÙÙ„Ø§Ù…" },
  { id: "series", en: "Series", ar: "Ù…Ø³Ù„Ø³Ù„Ø§Øª" },
  { id: "news", en: "News", ar: "Ø£Ø®Ø¨Ø§Ø±" },
  { id: "sports", en: "Sports", ar: "Ø±ÙŠØ§Ø¶Ø©" },
  { id: "kids", en: "Kids", ar: "Ø£Ø·ÙØ§Ù„" },
  { id: "music", en: "Music", ar: "Ù…ÙˆØ³ÙŠÙ‚Ù‰" },
  { id: "documentary", en: "Documentary", ar: "ÙˆØ«Ø§Ø¦Ù‚ÙŠ" },
  { id: "religion", en: "Religion", ar: "Ø¯ÙŠÙ†ÙŠ" },
];
export function TvGuidePage({
  lang,
  guide,
  cat = "all",
  q = "",
  page: pageParam,
  setSearch,
}: {
  lang: Lang;
  guide: TvGuide;
  cat?: string | undefined;
  q?: string | undefined;
  page?: number | undefined;
  setSearch: SetSearch;
}) {
  const t = makeT(lang);
  const activeCat = (CATS.find((c) => c.id === cat)?.id ?? "all") as ChannelCategory | "all";
  const needle = q.trim().toLowerCase();
  const lines = guide.lines.filter(
    (l) =>
      (activeCat === "all" || l.channel.category === activeCat) &&
      (!needle || l.channel.name[lang].toLowerCase().includes(needle)),
  );
  const page = clampPage(pageParam, lines.length, PAGE_SIZE);
  const shown = pageSlice(lines, page, PAGE_SIZE);
  const pages = pageCount(lines.length, PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-black md:text-3xl">
        <Tv className="h-6 w-6 text-primary" /> {t("guide.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("guide.sub")}</p>

      <ListToolbar>
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSearch({ cat: c.id, q: undefined, page: undefined })}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeCat === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            }`}
          >
            {bi(c, lang)}
          </button>
        ))}
        <span className="grow" />
        <FilterInput
          lang={lang}
          value={q}
          onChange={(v) => setSearch({ q: v || undefined, page: undefined })}
          placeholder={t("guide.filterChannels")}
        />
      </ListToolbar>

      <p className="mt-4 text-xs text-muted-foreground">
        {lines.length} {t("guide.channels")}
      </p>

      <div className="mt-4">
        <TvGuideView guide={guide} lang={lang} lines={shown} />
      </div>

      <Pagination lang={lang} page={page} pages={pages} onChange={(p) => setSearch({ page: p })} />
    </div>
  );
}
