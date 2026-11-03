/** Box Office — weekly Egypt cinema revenue table. */
import { TrendingUp } from "lucide-react";
import { boxofficeDate, fmtRevenue, movieBySlug, workId } from "@/lib/build";
import { Na, workPath } from "@/components/shared/ui";
import type { BoxofficeEntry, Lang } from "@/types/home";
import { useState } from "react";
import { FilterInput, ListToolbar, SortSelect, matches } from "@/components/shared/controls";
import { makeT } from "@/i18n";

type SortKey = "rank" | "weekly" | "total" | "title";

export function BoxOfficePage({ lang, entries }: { lang: Lang; entries: BoxofficeEntry[] }) {
  const t = makeT(lang);
  const [sort, setSort] = useState<SortKey>("rank");
  const [q, setQ] = useState("");

  const sortOptions = [
    { value: "rank", label: t("box.sortRank") },
    { value: "weekly", label: t("box.weekly") },
    { value: "total", label: t("box.total") },
    { value: "title", label: t("controls.az") },
  ];

  const rows = entries
    .map((row, i) => ({ row, rank: i + 1 }))
    .filter(({ row }) => matches(row.title[lang], q))
    .sort((a, b) =>
      sort === "weekly"
        ? b.row.weeklyEgp - a.row.weeklyEgp
        : sort === "total"
          ? b.row.totalEgp - a.row.totalEgp
          : sort === "title"
            ? a.row.title[lang].localeCompare(b.row.title[lang], lang)
            : a.rank - b.rank,
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-black md:text-3xl">
        <TrendingUp className="h-6 w-6 text-primary" /> {t("box.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {boxofficeDate[lang]} · {t("box.sub")}
      </p>

      <ListToolbar>
        <FilterInput lang={lang} value={q} onChange={setQ} />
        <span className="grow" />
        <SortSelect
          lang={lang}
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={sortOptions}
        />
      </ListToolbar>

      <div className="glass-card cinema-gradient mt-6 overflow-hidden">
        <div className="overflow-x-auto p-2 md:p-6">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="w-12 py-3 text-start">{t("box.rank")}</th>
                <th className="py-3 text-start">{t("box.movie")}</th>
                <th className="w-36 py-3 text-end">{t("box.weekly")}</th>
                <th className="w-36 py-3 text-end">{t("box.total")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ row, rank }, i) => {
                const movie =
                  (row.slug ? movieBySlug.get(row.slug) : undefined) ??
                  movieBySlug.get(row.title.en) ??
                  movieBySlug.get(row.title.ar);
                const title = (
                  <span className="font-semibold transition-colors group-hover:text-primary">
                    {row.title[lang]}
                  </span>
                );
                return (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 text-lg font-black text-primary">{rank}</td>
                    <td className="py-3">
                      {movie ? (
                        <Na
                          href={workPath(lang, workId(movie))}
                          className="group flex items-center gap-2"
                        >
                          {title}
                        </Na>
                      ) : (
                        title
                      )}
                    </td>
                    <td className="py-3 text-end font-bold text-gold">
                      {fmtRevenue(row.weeklyEgp, lang)}
                    </td>
                    <td className="py-3 text-end text-muted-foreground">
                      {fmtRevenue(row.totalEgp, lang)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
