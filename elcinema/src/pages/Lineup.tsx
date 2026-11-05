/**
 * Featured Lists — operator-managed collections of local catalogue works.
 */
import { ArrowLeft, ListVideo } from "lucide-react";
import type { Lang } from "@/types/home";
import type { FeaturedListDetail, FeaturedListIndex } from "@/types/content-view";
import { Na } from "@/components/shared/ui";
import {
  ActiveFilters,
  FilterInput,
  ListToolbar,
  Pagination,
  SortSelect,
  ViewToggle,
  listText,
  matches,
  paginate,
  sortByText,
  textSortOptions,
  useListState,
} from "@/components/shared/controls";
import { LiveImg, LiveError, LivePoster, lineupPath, liveWorkPath } from "@/features/live/live-ui";
import { makeT } from "@/i18n";

export function LineupIndexPage({ data, lang }: { data: FeaturedListIndex; lang: Lang }) {
  const t = makeT(lang);
  const tx = listText(lang);
  const st = useListState();
  const filtered = sortByText(
    data.lists.filter((l) => matches(l.title, st.q)),
    st.sort,
    (l) => l.title,
    lang,
  );
  const { page, pages, shown } = paginate(filtered, st.page, 15);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-black md:text-3xl">
        <ListVideo className="h-6 w-6 text-primary" /> {t("lineup.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("lineup.subtitle")}</p>

      <ListToolbar>
        <FilterInput lang={lang} value={st.q} onChange={st.setQ} />
        <ActiveFilters
          count={Number(Boolean(st.q.trim()))}
          lang={lang}
          onClear={() => st.setQ("")}
        />
        <span className="grow" />
        <SortSelect
          lang={lang}
          value={st.sort}
          onChange={st.setSort}
          options={textSortOptions(lang)}
        />
        <ViewToggle lang={lang} view={st.view} onChange={st.setView} />
      </ListToolbar>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{tx.none}</p>
      )}

      {st.view === "list" ? (
        <div className="row-grid mt-8">
          {shown.map((l) => (
            <Na
              key={l.id}
              href={lineupPath(lang, l.id)}
              className="glass-card hover-lift group flex items-center gap-4 p-3"
            >
              <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                <div className="aspect-[2/3]">
                  <LiveImg src={l.cover} alt={l.title} className="h-full w-full" />
                </div>
              </div>
              <h3 className="min-w-0 flex-1 line-clamp-2 font-bold group-hover:text-primary">
                {l.title}
              </h3>
            </Na>
          ))}
        </div>
      ) : (
        <div className="poster-grid mt-8">
          {shown.map((l) => (
            <Na key={l.id} href={lineupPath(lang, l.id)} className="group w-full">
              <div className="hover-lift relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
                <LiveImg src={l.cover} alt={l.title} className="h-full w-full" />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background via-background/40 to-transparent p-3">
                  <h3 className="line-clamp-3 text-sm font-bold transition-colors group-hover:text-primary">
                    {l.title}
                  </h3>
                </div>
              </div>
            </Na>
          ))}
        </div>
      )}

      <Pagination lang={lang} page={page} pages={pages} onChange={st.setPage} />
    </div>
  );
}

export function LineupDetailPage({ data, lang }: { data: FeaturedListDetail; lang: Lang }) {
  const t = makeT(lang);
  const tx = listText(lang);
  const st = useListState();
  const filtered = sortByText(
    data.items.filter((it) => matches(`${it.title} ${it.meta}`, st.q)),
    st.sort,
    (it) => it.title,
    lang,
  );
  const { page, pages, shown } = paginate(filtered, st.page, 24);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Na
        href={lineupPath(lang)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("lineup.back")}
      </Na>
      <h1 className="mt-3 text-2xl font-black md:text-3xl">{data.title}</h1>

      {data.items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">{t("lineup.empty")}</p>
      ) : (
        <>
          <ListToolbar>
            <FilterInput lang={lang} value={st.q} onChange={st.setQ} />
            <ActiveFilters
              count={Number(Boolean(st.q.trim()))}
              lang={lang}
              onClear={() => st.setQ("")}
            />
            <span className="grow" />
            <SortSelect
              lang={lang}
              value={st.sort}
              onChange={st.setSort}
              options={textSortOptions(lang)}
            />
            <ViewToggle lang={lang} view={st.view} onChange={st.setView} />
          </ListToolbar>
          {filtered.length === 0 && (
            <p className="mt-12 text-center text-muted-foreground">{tx.none}</p>
          )}
          {st.view === "grid" ? (
            <div className="poster-grid mt-8">
              {shown.map((it) => (
                <LivePoster
                  key={it.id}
                  lang={lang}
                  id={it.id}
                  title={it.title}
                  img={it.img}
                  fluid
                />
              ))}
            </div>
          ) : (
            <div className="row-grid mt-8">
              {shown.map((it) => (
                <Na
                  key={it.id}
                  href={liveWorkPath(lang, it.id)}
                  className="glass-card hover-lift group flex items-center gap-4 p-3"
                >
                  <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                    <div className="aspect-[2/3]">
                      <LiveImg src={it.img} alt={it.title} className="h-full w-full" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold group-hover:text-primary">{it.title}</h3>
                    {it.meta && <p className="truncate text-xs text-muted-foreground">{it.meta}</p>}
                  </div>
                </Na>
              ))}
            </div>
          )}
          <Pagination lang={lang} page={page} pages={pages} onChange={st.setPage} />
        </>
      )}
    </div>
  );
}

export function LineupIndexRoute({
  result,
  lang,
}: {
  result: { data: FeaturedListIndex | null; error: string | null };
  lang: Lang;
}) {
  if (result.error || !result.data) return <LiveError message={result.error ?? ""} lang={lang} />;
  return <LineupIndexPage data={result.data} lang={lang} />;
}

export function LineupDetailRoute({
  result,
  lang,
}: {
  result: { data: FeaturedListDetail | null; error: string | null };
  lang: Lang;
}) {
  if (result.error || !result.data) return <LiveError message={result.error ?? ""} lang={lang} />;
  return <LineupDetailPage data={result.data} lang={lang} />;
}
