/** Search — filters the built-in dataset across titles, persons and channels. */
import { makeT } from "@/i18n";
import { Search, User, Tv, Film } from "lucide-react";
import { useState, type FormEvent } from "react";
import { searchAll } from "@/lib/build";
import { Na, PosterArt, personPath, workPath } from "@/components/shared/ui";
import type { Lang } from "@/types/home";
import type { SearchResult } from "@/lib/build";
import { dedupeSearchResults } from "@/features/content/content";
import {
  ListToolbar,
  Pagination,
  SortSelect,
  paginate,
  sortByText,
  textSortOptions,
} from "@/components/shared/controls";

const L = {
  en: {
    title: "Search",
    placeholder: "Search movies, people, channels…",
    tabs: { all: "All", movie: "Titles", person: "Persons", channel: "Channels" } as const,
    empty: "Type something to search the full elCinema catalogue.",
    none: "No results for",
    in: "in",
    results: "results",
  },
  ar: {
    title: "بحث",
    placeholder: "ابحث في الأفلام والأشخاص والقنوات…",
    tabs: { all: "الكل", movie: "الأعمال", person: "الأشخاص", channel: "القنوات" } as const,
    empty: "اكتب كلمة للبحث في كامل كتالوج elCinema.",
    none: "لا نتائج عن",
    in: "في",
    results: "نتيجة",
  },
} as const;

type Tab = "all" | "movie" | "person" | "channel";

const TAB_ICON = { all: Search, movie: Film, person: User, channel: Tv } as const;

export function SearchPage({
  lang,
  q,
  extra,
}: {
  lang: Lang;
  q: string | undefined;
  extra: SearchResult[];
}) {
  const t = makeT(lang);
  const tabLabels: Record<Tab, string> = {
    all: t("search.tabAll"),
    movie: t("search.tabMovie"),
    person: t("search.tabPerson"),
    channel: t("search.tabChannel"),
  };
  const tabs: Tab[] = ["all", "movie", "person", "channel"];
  const [tab, setTab] = useState<Tab>("all");
  const [draft, setDraft] = useState(q ?? "");
  const results = dedupeSearchResults([...searchAll(q ?? ""), ...extra]);
  const [sort, setSort] = useState("default");
  const [pg, setPg] = useState(1);
  const byTab = tab === "all" ? results : results.filter((r) => r.type === tab);
  const sorted = sortByText(byTab, sort, (r) => r.title[lang], lang);
  const { page, pages, shown } = paginate(sorted, pg, 10);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    window.location.assign(`/${lang}/search?q=${encodeURIComponent(draft.trim())}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="text-2xl font-black md:text-3xl">{t("search.title")}</h1>

      <form
        onSubmit={submit}
        className="mt-6 flex items-center overflow-hidden rounded-xl border border-input bg-secondary"
      >
        <Search className="ms-4 h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
          autoFocus
        />
        <button
          type="submit"
          className="bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          {t("search.title")}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((k) => {
          const Icon = TAB_ICON[k];
          return (
            <button
              key={k}
              onClick={() => {
                setTab(k);
                setPg(1);
              }}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                tab === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tabLabels[k]}
            </button>
          );
        })}
      </div>

      {!q && <p className="mt-10 text-center text-sm text-muted-foreground">{t("search.empty")}</p>}

      {q && (
        <p className="mt-6 text-sm text-muted-foreground">
          {sorted.length} {t("search.resultsWord")} {t("search.inQuery")} “{q}”
        </p>
      )}

      {q && sorted.length > 1 && (
        <ListToolbar>
          <span className="grow" />
          <SortSelect
            lang={lang}
            value={sort}
            onChange={(v) => {
              setSort(v);
              setPg(1);
            }}
            options={textSortOptions(lang)}
          />
        </ListToolbar>
      )}

      {q && sorted.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {t("search.none")} “{q}”
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {shown.map((r) => {
          const icon = TAB_ICON[r.type];
          const Icon = icon;
          const body = (
            <>
              {r.type === "movie" ? (
                <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                  <div className="aspect-[2/3]">
                    <PosterArt hue={r.hue ?? 280} title={r.title[lang]} img={r.img} />
                  </div>
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{r.title[lang]}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {tabLabels[r.type]} · {r.sub[lang]}
                </div>
              </div>
            </>
          );
          const cls =
            "glass-card flex min-w-0 items-center gap-4 p-4 transition-colors hover:border-primary";
          return r.type === "person" ? (
            <Na key={`${r.type}-${r.id}`} href={personPath(lang, r.id)} className={cls}>
              {body}
            </Na>
          ) : r.type === "movie" ? (
            <Na key={`${r.type}-${r.id}`} href={workPath(lang, r.id)} className={cls}>
              {body}
            </Na>
          ) : (
            <div key={`${r.type}-${r.id}`} className={`${cls} cursor-default`}>
              {body}
            </div>
          );
        })}
      </div>

      <Pagination
        lang={lang}
        page={page}
        pages={pages}
        onChange={(p) => {
          setPg(p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
