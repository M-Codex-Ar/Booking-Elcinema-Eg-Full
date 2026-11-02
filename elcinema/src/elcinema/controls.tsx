/**
 * Shared list controls for every catalogue page: sort select, grid/list view
 * toggle and pagination. State lives in the URL (validateSearch per route);
 * pages receive the current values plus a `setSearch` patch callback, so
 * SSR and the client always render the same list.
 */
import { ChevronLeft, ChevronRight, LayoutGrid, List, ArrowUpDown, Search } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lang } from "./home.shared";

export type ViewMode = "grid" | "list";

export interface ListParams {
  sort?: string;
  view?: ViewMode;
  page?: number;
  genre?: string;
  q?: string;
  section?: string;
}

export type SetSearch = (patch: Record<string, string | number | undefined>) => void;

const T = {
  en: {
    sort: "Sort",
    grid: "Grid view",
    list: "List view",
    prev: "Previous",
    next: "Next",
    page: "Page",
  },
  ar: { sort: "ترتيب", grid: "شبكة", list: "قائمة", prev: "السابق", next: "التالي", page: "صفحة" },
} as const;

/** Toolbar row that wraps cleanly on every screen size. */
export function ListToolbar({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-wrap items-center gap-2">{children}</div>;
}

export function SortSelect({
  value,
  options,
  onChange,
  lang,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  lang: Lang;
}) {
  return (
    <Select value={value} onValueChange={onChange} dir={lang === "ar" ? "rtl" : "ltr"}>
      <SelectTrigger
        aria-label={T[lang].sort}
        className="h-9 w-auto min-w-36 gap-2 rounded-full border-border bg-secondary px-3 text-sm font-semibold"
      >
        <ArrowUpDown className="h-4 w-4 shrink-0 text-primary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border bg-popover">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-sm font-semibold">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ViewToggle({
  view,
  onChange,
  lang,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
  lang: Lang;
}) {
  const btn = (mode: ViewMode, Icon: typeof LayoutGrid, label: string) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={view === mode}
      onClick={() => onChange(mode)}
      className={`rounded-full px-2.5 py-1.5 transition-colors ${
        view === mode
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
  return (
    <div className="flex items-center rounded-full border border-border bg-secondary p-1">
      {btn("grid", LayoutGrid, T[lang].grid)}
      {btn("list", List, T[lang].list)}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  onChange,
  lang,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
  lang: Lang;
}) {
  if (pages <= 1) return null;
  const nums: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-2 text-sm font-bold transition-colors hover:border-primary";
  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label={T[lang].page}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${btn} disabled:pointer-events-none disabled:opacity-40`}
        aria-label={T[lang].prev}
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
      </button>
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${btn} ${n === page ? "border-primary bg-primary text-primary-foreground" : ""}`}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className={`${btn} disabled:pointer-events-none disabled:opacity-40`}
        aria-label={T[lang].next}
      >
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </nav>
  );
}

/** Slice a list for the current page (1-based). */
export function pageSlice<T>(items: T[], page: number, size: number): T[] {
  const start = (Math.max(1, page) - 1) * size;
  return items.slice(start, start + size);
}

export function pageCount(items: number, size: number): number {
  return Math.max(1, Math.ceil(items / size));
}

/** Clamp the page when the list shrinks (filters/sort changed). */
export function clampPage(page: number | undefined, items: number, size: number): number {
  const p = page ?? 1;
  return Math.min(Math.max(1, p), pageCount(items, size));
}

const T2 = {
  en: {
    filter: "Filter…",
    all: "All",
    az: "A to Z",
    za: "Z to A",
    def: "Default",
    none: "No matches.",
  },
  ar: {
    filter: "فلترة…",
    all: "الكل",
    az: "أبجديًا",
    za: "عكسي",
    def: "الافتراضي",
    none: "لا نتائج.",
  },
} as const;

export const listText = (lang: Lang) => T2[lang];

/** Text filter pill used inside a ListToolbar. */
export function FilterInput({
  value,
  onChange,
  lang,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  lang: Lang;
  placeholder?: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? T2[lang].filter}
        className="w-36 bg-transparent text-sm outline-none placeholder:text-muted-foreground md:w-52"
      />
    </label>
  );
}

/** Filter chip (toggle button). */
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

/** Generic sort by a text key: "default" keeps source order. */
export function sortByText<T>(items: T[], sort: string, key: (x: T) => string, lang: Lang): T[] {
  if (sort !== "az" && sort !== "za") return items;
  const out = [...items].sort((a, b) => key(a).localeCompare(key(b), lang === "ar" ? "ar" : "en"));
  return sort === "za" ? out.reverse() : out;
}

export function textSortOptions(lang: Lang) {
  const x = T2[lang];
  return [
    { value: "default", label: x.def },
    { value: "az", label: x.az },
    { value: "za", label: x.za },
  ];
}

/** Local list state (filter text, sort, view, page) for live-scraped pages. */
export function useListState(defaults: { sort?: string; view?: ViewMode } = {}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(defaults.sort ?? "default");
  const [view, setView] = useState<ViewMode>(defaults.view ?? "grid");
  const [page, setPage] = useState(1);
  return {
    q,
    sort,
    view,
    page,
    setQ: (v: string) => {
      setQ(v);
      setPage(1);
    },
    setSort: (v: string) => {
      setSort(v);
      setPage(1);
    },
    setView,
    setPage: (p: number) => {
      setPage(p);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };
}

/** Filter → sort → paginate in one step. */
export function paginate<T>(items: T[], page: number, size: number) {
  const p = clampPage(page, items.length, size);
  return { page: p, pages: pageCount(items.length, size), shown: pageSlice(items, p, size) };
}

export const matches = (text: string, q: string) =>
  !q.trim() || text.toLowerCase().includes(q.trim().toLowerCase());
