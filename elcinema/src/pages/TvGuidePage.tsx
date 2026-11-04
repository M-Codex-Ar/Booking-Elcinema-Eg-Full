/** TV Guide â€” full evening grid across all channels, filterable by
 * category and by channel name (URL-driven), paginated. */
import { Tv } from "lucide-react";
import { TvGuideView } from "@/components/shared/TvGuide";
import type { ChannelCategory, Lang, TvGuide } from "@/types/home";
import {
  ActiveFilters,
  Chip,
  FilterInput,
  ListToolbar,
  Pagination,
  clampPage,
  pageCount,
  pageSlice,
  type SetSearch,
} from "@/components/shared/controls";
import { makeT } from "@/i18n";

const PAGE_SIZE = 20;

const CATS = [
  { id: "all", label: "guide.category.all" },
  { id: "general", label: "guide.category.general" },
  { id: "movies", label: "guide.category.movies" },
  { id: "series", label: "guide.category.series" },
  { id: "news", label: "guide.category.news" },
  { id: "sports", label: "guide.category.sports" },
  { id: "kids", label: "guide.category.kids" },
  { id: "music", label: "guide.category.music" },
  { id: "documentary", label: "guide.category.documentary" },
  { id: "religion", label: "guide.category.religion" },
] as const;
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
          <Chip
            key={c.id}
            active={activeCat === c.id}
            onClick={() => setSearch({ cat: c.id, q: undefined, page: undefined })}
          >
            {t(c.label)}
          </Chip>
        ))}
        <ActiveFilters
          count={Number(activeCat !== "all") + Number(Boolean(needle))}
          lang={lang}
          onClear={() => setSearch({ cat: "all", q: undefined, page: undefined })}
        />
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
