/** Box Office — weekly Egypt cinema revenue table. */
import { TrendingUp } from "lucide-react";
import { boxofficeDate, fmtRevenue, movieBySlug, workId } from "../build";
import { Na, workPath } from "../ui";
import type { BoxofficeEntry, Lang } from "../home.shared";
import { useState } from "react";
import { FilterInput, ListToolbar, SortSelect, matches } from "../controls";

const L = {
  en: {
    title: "Cinema Revenue",
    sub: "Weekly Egypt box office, top 20",
    rank: "#",
    movie: "Movie",
    revenue: "Weekly revenue",
    total: "Total revenue",
  },
  ar: {
    title: "إيرادات السينما",
    sub: "بوكس أوفيس مصر الأسبوعي، أفضل 20",
    rank: "#",
    movie: "الفيلم",
    revenue: "إيراد الأسبوع",
    total: "إجمالي الإيراد",
  },
} as const;

const SORTS = {
  en: { rank: "Rank", weekly: "Weekly revenue", total: "Total revenue", title: "A to Z" },
  ar: { rank: "الترتيب", weekly: "إيراد الأسبوع", total: "إجمالي الإيراد", title: "أبجديًا" },
} as const;

export function BoxOfficePage({ lang, entries }: { lang: Lang; entries: BoxofficeEntry[] }) {
  const Lx = L[lang];
  const [sort, setSort] = useState<keyof (typeof SORTS)["en"]>("rank");
  const [q, setQ] = useState("");
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
        <TrendingUp className="h-6 w-6 text-primary" /> {Lx.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {boxofficeDate[lang]} · {Lx.sub}
      </p>

      <ListToolbar>
        <FilterInput lang={lang} value={q} onChange={setQ} />
        <span className="grow" />
        <SortSelect
          lang={lang}
          value={sort}
          onChange={(v) => setSort(v as typeof sort)}
          options={(Object.keys(SORTS[lang]) as (typeof sort)[]).map((k) => ({
            value: k,
            label: SORTS[lang][k],
          }))}
        />
      </ListToolbar>

      <div className="glass-card cinema-gradient mt-6 overflow-hidden">
        <div className="overflow-x-auto p-2 md:p-6">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="w-12 py-3 text-start">{Lx.rank}</th>
                <th className="py-3 text-start">{Lx.movie}</th>
                <th className="w-36 py-3 text-end">{Lx.revenue}</th>
                <th className="w-36 py-3 text-end">{Lx.total}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ row, rank }, i) => {
                const movie = row.slug ? movieBySlug.get(row.slug) : undefined;
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
