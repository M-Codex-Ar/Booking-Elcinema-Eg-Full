import { queryOptions } from "@tanstack/react-query";
import { getStaticPageFn } from "@/features/live/live.functions";
import type { Lang } from "@/types/home";

/** Cached query for one scraped static content page (About, Contact, …). */
export const staticPageOptions = (lang: Lang, path: string) =>
  queryOptions({
    queryKey: ["elcinema-static", lang, path],
    queryFn: () => getStaticPageFn({ data: { lang, path } }),
    staleTime: 10 * 60 * 1000,
  });
