/**
 * Watch Online — the live VOD guide scraped from elcinema.com/vod/: the
 * streaming platforms available in the region with their content categories,
 * plus the movies currently offered to watch online (from the homepage
 * scrape), each linking to its internal work detail page.
 */
import { ArrowLeft, MonitorPlay } from "lucide-react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ImgWithFallback } from "@/components/shared/primitives";
import { getElcinemaHomeFn } from "@/features/home/home.functions";
import type { Lang } from "@/features/home/home.shared";
import type { LiveVodGuide } from "@/features/live/live.shared";
import { LiveError, LivePoster, VodBadge } from "@/features/live/live-ui";
import { Na, Row } from "@/components/shared/ui";
import {
  FilterInput,
  ListToolbar,
  Pagination,
  SortSelect,
  ViewToggle,
  matches,
  paginate,
  sortByText,
  textSortOptions,
  useListState,
} from "@/components/shared/controls";
import { makeT } from "@/i18n";

const homeQueryOptions = queryOptions({
  queryKey: ["elcinema-home"],
  queryFn: () => getElcinemaHomeFn(),
  staleTime: 5 * 60 * 1000,
});

export function WatchOnlinePage({ data, lang }: { data: LiveVodGuide; lang: Lang }) {
  const t = makeT(lang);
  const home = useSuspenseQuery(homeQueryOptions).data;
  const watchOnline = home.data?.watchOnline ?? [];
  const st = useListState();
  const plats = sortByText(
    data.platforms.filter((p) =>
      matches(`${p.name} ${p.cats.map((c) => c.label).join(" ")}`, st.q),
    ),
    st.sort,
    (p) => p.name,
    lang,
  );
  const { page, pages, shown } = paginate(plats, st.page, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="text-2xl font-black md:text-3xl">{t("vod.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("vod.subtitle")}</p>

      {watchOnline.length > 0 && (
        <Row title={t("vod.onDemand")} icon={<MonitorPlay className="h-5 w-5" />} lang={lang}>
          {watchOnline.map((w, i) => {
            const m = /\/work\/(\d+)/.exec(w.href);
            return m ? (
              <LivePoster
                key={i}
                lang={lang}
                id={m[1]!}
                title={w.title}
                img={w.img}
                sub={w.meta}
                badge={<VodBadge vod={w.vod} />}
              />
            ) : null;
          })}
        </Row>
      )}

      <section className="py-4">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
          <MonitorPlay className="h-5 w-5 text-primary" /> {t("vod.platforms")}
        </h2>
        <ListToolbar>
          <FilterInput lang={lang} value={st.q} onChange={st.setQ} />
          <span className="grow" />
          <SortSelect
            lang={lang}
            value={st.sort}
            onChange={st.setSort}
            options={textSortOptions(lang)}
          />
          <ViewToggle lang={lang} view={st.view} onChange={st.setView} />
        </ListToolbar>
        <div
          className={`mt-6 grid gap-4 ${st.view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}
        >
          {shown.map((p) => (
            <div key={p.id} className="glass-card flex gap-4 p-4">
              {p.img && (
                <div className="flex h-12 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card p-1">
                  <ImgWithFallback
                    src={p.img}
                    alt={p.name}
                    fit="contain"
                    className="max-h-full max-w-full"
                    fallback={
                      <span className="truncate text-center text-xs font-semibold">{p.name}</span>
                    }
                  />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold">{p.name}</h3>
                {p.cats.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.cats.slice(0, 6).map((c) => (
                      <span
                        key={c.label}
                        className="rounded-md bg-secondary px-2 py-0.5 text-meta font-semibold text-muted-foreground"
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <Pagination lang={lang} page={page} pages={pages} onChange={st.setPage} />
      </section>

      <div className="py-8">
        <Na
          href={`/${lang}/now`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("now.title")}
        </Na>
      </div>
    </div>
  );
}

export function WatchOnlineRoute({
  result,
  lang,
}: {
  result: { data: LiveVodGuide | null; error: string | null };
  lang: Lang;
}) {
  if (result.error || !result.data) return <LiveError message={result.error ?? ""} lang={lang} />;
  return <WatchOnlinePage data={result.data} lang={lang} />;
}
