/**
 * The single source of truth for UI copy.
 *
 * Modularized bilingual architecture:
 * - English copy lives in `./en/` (chrome, common, pages)
 * - Arabic copy lives in `./ar/` (chrome, common, pages)
 *
 * Every string the interface renders lives here, keyed by `area.thing`, so a
 * translation pass touches split files and a missing key is a compile error
 * rather than an English string leaking into the Arabic edition.
 *
 * Usage:
 *   const t = makeT(lang);
 *   t("home.boxOffice")
 *   t("search.results", { count: 12 })
 */
import type { Bi, Lang } from "../home.shared";
import { enChrome } from "./en/chrome";
import { arChrome } from "./ar/chrome";
import { enCommon } from "./en/common";
import { arCommon } from "./ar/common";
import { enPages } from "./en/pages";
import { arPages } from "./ar/pages";

export const EN_STRINGS = {
  ...enChrome,
  ...enCommon,
  ...enPages,
} as const;

export const AR_STRINGS = {
  ...arChrome,
  ...arCommon,
  ...arPages,
} as const;

export type CopyKey = keyof typeof EN_STRINGS;

/** Build COPY table with bilingual Bi pairs for every key */
const buildCopy = (): Record<CopyKey, Bi> => {
  const result = {} as Record<CopyKey, Bi>;
  const keys = Object.keys(EN_STRINGS) as CopyKey[];
  for (const k of keys) {
    result[k] = {
      en: EN_STRINGS[k],
      ar: (AR_STRINGS as Record<string, string>)[k] ?? EN_STRINGS[k],
    };
  }
  return result;
};

export const COPY = buildCopy();

/** Render a bilingual domain value. */
export const bi = (value: Bi | undefined, lang: Lang): string => (value ? value[lang] : "");

/**
 * Ad-hoc bilingual pair for data-driven labels that are defined next to the
 * field they describe (dashboard field specs). Prefer a `COPY` key when the
 * string is chrome rather than schema.
 */
export const pair = (lang: Lang, en: string, ar: string): string => (lang === "ar" ? ar : en);

/** Interpolate `{name}` placeholders in a rendered string. */
function interpolate(value: string, vars?: Record<string, string | number>): string {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Look up one key for one language. */
export function text(lang: Lang, key: CopyKey, vars?: Record<string, string | number>): string {
  const entry = COPY[key];
  if (!entry) return key;
  return interpolate(entry[lang], vars);
}

/** Bound lookup for a component render: `const t = makeT(lang)`. */
export function makeT(lang: Lang) {
  return (key: CopyKey, vars?: Record<string, string | number>) => text(lang, key, vars);
}

/** `lang === "ar"` in one place, so direction rules are not re-derived. */
export const isRtl = (lang: Lang): boolean => lang === "ar";
export const dir = (lang: Lang): "rtl" | "ltr" => (lang === "ar" ? "rtl" : "ltr");
export const otherLang = (lang: Lang): Lang => (lang === "ar" ? "en" : "ar");

/** `localeCompare` collator for this edition's language. */
export const locale = (lang: Lang): string => (lang === "ar" ? "ar" : "en");

/**
 * Route params arrive as `string`. The edition is the first path segment, so
 * anything that is not `ar` is the English edition — the same rule every route
 * used to re-type by hand.
 */
export const asLang = (value: string | undefined): Lang => (value === "ar" ? "ar" : "en");

/** Language of the current path (`/ar/now` → `ar`), for components with no prop. */
export const langFromPath = (pathname: string): Lang =>
  asLang(pathname.split("/").filter(Boolean)[0]);

/**
 * Managed rows keep `title_en` / `title_ar` columns rather than a `Bi`, because
 * an operator may fill in one language first. Always fall back to English so a
 * half-translated row never renders as an empty chip.
 */
export const rowTitle = (
  row: { title_en?: string | null; title_ar?: string | null },
  lang: Lang,
): string => (lang === "ar" ? row.title_ar || row.title_en || "" : row.title_en || "");
