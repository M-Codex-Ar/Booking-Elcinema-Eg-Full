/** Generic searchable, sortable, paginated table used by the dashboard sections. */
import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lang } from "../home.shared";

export interface Col<T> {
  key: string;
  label: string;
  value: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  className?: string;
}

const PAGE = 10;

export function DataTable<T>({
  rows,
  cols,
  lang,
  toolbar,
}: {
  rows: T[];
  cols: Col<T>[];
  lang: Lang;
  toolbar?: ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let r = ql
      ? rows.filter((row) => cols.some((c) => String(c.value(row)).toLowerCase().includes(ql)))
      : rows;
    if (sort) {
      const col = cols.find((c) => c.key === sort.key)!;
      r = [...r].sort((a, b) => {
        const x = col.value(a),
          y = col.value(b);
        return (
          (typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y))) * sort.dir
        );
      });
    }
    return r;
  }, [rows, cols, q, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const p = Math.min(page, pages - 1);
  const view = filtered.slice(p * PAGE, p * PAGE + PAGE);
  const ar = lang === "ar";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder={ar ? "بحث…" : "Search…"}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          className="w-full sm:max-w-xs"
        />
        <span className="text-sm text-muted-foreground">
          {filtered.length} {ar ? "نتيجة" : "results"}
        </span>
        {toolbar && <div className="sm:ms-auto">{toolbar}</div>}
      </div>
      <div className="glass-card overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-primary"
                    onClick={() =>
                      setSort((s) =>
                        s?.key === c.key
                          ? { key: c.key, dir: s.dir === 1 ? -1 : 1 }
                          : { key: c.key, dir: 1 },
                      )
                    }
                  >
                    {c.label} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.length === 0 && (
              <TableRow>
                <TableCell colSpan={cols.length} className="text-center text-muted-foreground">
                  {ar ? "لا توجد نتائج" : "No results"}
                </TableCell>
              </TableRow>
            )}
            {view.map((row, i) => (
              <TableRow key={i}>
                {cols.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.render ? c.render(row) : c.value(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 text-sm">
        <Button variant="outline" size="sm" disabled={p === 0} onClick={() => setPage(p - 1)}>
          {ar ? "السابق" : "Prev"}
        </Button>
        <span className="text-muted-foreground">
          {p + 1} / {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={p >= pages - 1}
          onClick={() => setPage(p + 1)}
        >
          {ar ? "التالي" : "Next"}
        </Button>
      </div>
    </div>
  );
}
