/**
 * elCinema TV — the managed video gallery and local video detail pages.
 * Supported providers play through privacy-enhanced embeds.
 */
import { ArrowLeft, Play } from "lucide-react";
import { ImgWithFallback } from "@/components/shared/primitives";
import type { Lang } from "@/types/home";
import { useState } from "react";
import type {
  ContentVideoDetail,
  ContentVideoCard,
  ContentVideoGallery,
} from "@/types/content-view";
import type { ManagedVideoRow } from "@/features/content/content";
import {
  ActiveFilters,
  Chip,
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
import { Na } from "@/components/shared/ui";
import { makeT, rowTitle } from "@/i18n";
import { LiveImg, LiveError, videoPath } from "@/features/live/live-ui";
import { isRetiredSourceUrl } from "@/types/media";

function VideoCard({ v, lang, row }: { v: ContentVideoCard; lang: Lang; row?: boolean }) {
  const t = makeT(lang);
  return (
    <Na
      href={videoPath(lang, v.id)}
      className={row ? "glass-card hover-lift group flex items-center gap-4 p-3" : "group w-full"}
    >
      <div
        className={`hover-lift relative aspect-video overflow-hidden rounded-xl bg-secondary ${row ? "w-40 shrink-0" : ""}`}
      >
        <LiveImg src={v.img} alt={v.title} className="h-full w-full" wide />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            {t("video.play")} ▶
          </span>
        </div>
        {v.duration && (
          <span className="absolute bottom-2 end-2 rounded-md bg-background/80 px-2 py-0.5 text-micro font-bold">
            {v.duration}
          </span>
        )}
      </div>
      <h3
        className={`line-clamp-2 font-bold transition-colors group-hover:text-primary ${row ? "min-w-0 text-sm" : "mt-2 text-xs"}`}
      >
        {v.title}
      </h3>
    </Na>
  );
}

export function VideoGalleryPage({
  data,
  extra,
  lang,
}: {
  data: ContentVideoGallery;
  extra?: ManagedVideoRow[] | undefined;
  lang: Lang;
}) {
  const t = makeT(lang);
  const tx = listText(lang);
  const st = useListState();
  const [section, setSection] = useState<string>("all");
  const seen = new Set<string>();
  const pool = data.sections
    .filter((s) => section === "all" || s.title === section)
    .flatMap((s) => s.videos)
    .filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)));
  const filtered = sortByText(
    pool.filter((v) => matches(v.title, st.q)),
    st.sort,
    (v) => v.title,
    lang,
  );
  const { page, pages, shown } = paginate(filtered, st.page, 12);
  const localManagedVideoPath = (id: string, url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" || isRetiredSourceUrl(url))
        return videoPath(lang, `m-${id}`);
      return parsed.href;
    } catch {
      return videoPath(lang, `m-${id}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-black md:text-3xl">
        <Play className="h-6 w-6 text-primary" /> {t("video.gallery")}
      </h1>

      <ListToolbar>
        <Chip
          active={section === "all"}
          onClick={() => {
            setSection("all");
            st.setPage(1);
          }}
        >
          {tx.all}
        </Chip>
        {data.sections.map((s) => (
          <Chip
            key={s.title}
            active={section === s.title}
            onClick={() => {
              setSection(s.title);
              st.setQ(st.q);
            }}
          >
            {s.title}
          </Chip>
        ))}
        <ActiveFilters
          count={Number(section !== "all") + Number(Boolean(st.q.trim()))}
          lang={lang}
          onClear={() => {
            setSection("all");
            st.setQ("");
            st.setPage(1);
          }}
        />
        <span className="grow" />
        <FilterInput lang={lang} value={st.q} onChange={st.setQ} />
        <SortSelect
          lang={lang}
          value={st.sort}
          onChange={st.setSort}
          options={textSortOptions(lang)}
        />
        <ViewToggle lang={lang} view={st.view} onChange={st.setView} />
      </ListToolbar>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} {t("video.latest")}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">{tx.none}</p>
      ) : st.view === "grid" ? (
        <div className="video-grid mt-8">
          {shown.map((v) => (
            <VideoCard key={v.id} v={v} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="row-grid mt-8">
          {shown.map((v) => (
            <VideoCard key={v.id} v={v} lang={lang} row />
          ))}
        </div>
      )}

      {extra && extra.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-black">{t("common.addedByEditors")}</h2>
          <div className="video-grid">
            {extra.map((v) => (
              <a
                key={v.id}
                href={localManagedVideoPath(v.id, v.url)}
                target={isRetiredSourceUrl(v.url) ? undefined : "_blank"}
                rel={isRetiredSourceUrl(v.url) ? undefined : "noreferrer"}
                className="group w-full"
              >
                <div className="hover-lift relative aspect-video overflow-hidden rounded-xl bg-secondary">
                  <ImgWithFallback
                    src={v.thumb_url}
                    alt=""
                    className="h-full w-full"
                    fallback={
                      <div className="flex h-full w-full items-center justify-center">
                        <Play className="h-8 w-8 text-muted-foreground" />
                      </div>
                    }
                  />
                  {v.duration && (
                    <span className="absolute bottom-2 end-2 rounded-md bg-background/80 px-2 py-0.5 text-micro font-bold">
                      {v.duration}
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      {t("video.play")} ▶
                    </span>
                  </div>
                </div>
                <h3 className="mt-2 line-clamp-2 text-xs font-bold transition-colors group-hover:text-primary">
                  {rowTitle(v, lang)}
                </h3>
              </a>
            ))}
          </div>
        </section>
      )}

      <Pagination lang={lang} page={page} pages={pages} onChange={st.setPage} />
    </div>
  );
}

export function VideoDetailPage({ data, lang }: { data: ContentVideoDetail; lang: Lang }) {
  const t = makeT(lang);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="mb-4 text-xl font-black md:text-2xl">{data.title}</h1>
      {data.embedUrl ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="aspect-video">
            <iframe
              src={data.embedUrl}
              title={data.title}
              allowFullScreen
              className="h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      ) : data.img ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="aspect-video">
            <LiveImg src={data.img} alt={data.title} className="h-full w-full" wide />
          </div>
        </div>
      ) : null}

      {data.related.length > 0 && (
        <section className="py-10">
          <h2 className="mb-4 text-xl font-black">{t("video.related")}</h2>
          <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
            {data.related.map((v) => (
              <Na key={v.id} href={videoPath(lang, v.id)} className="group w-56 shrink-0">
                <div className="hover-lift relative aspect-video overflow-hidden rounded-xl bg-secondary">
                  <LiveImg src={v.img} alt={v.title} className="h-full w-full" wide />
                </div>
                <h3 className="mt-2 line-clamp-2 text-xs font-bold transition-colors group-hover:text-primary">
                  {v.title}
                </h3>
              </Na>
            ))}
          </div>
        </section>
      )}

      <div className="pb-10">
        <Na
          href={`/${lang}/video`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("video.galleryTitle")}
        </Na>
      </div>
    </div>
  );
}

/** Route-level wrapper: renders the gallery or the error panel. */
export function VideoGalleryRoute({
  result,
  lang,
  extra,
}: {
  result: { data: ContentVideoGallery | null; error: string | null };
  lang: Lang;
  extra?: ManagedVideoRow[];
}) {
  if (result.error || !result.data) return <LiveError message={result.error ?? ""} lang={lang} />;
  return <VideoGalleryPage data={result.data} lang={lang} extra={extra} />;
}
