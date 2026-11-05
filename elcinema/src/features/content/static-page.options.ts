import { queryOptions } from "@tanstack/react-query";
import { getFallbackPage } from "@/lib/fallback-content";
import type { Lang } from "@/types/home";

/** Static legal and help content is bundled locally in both languages. */
export const staticPageOptions = (lang: Lang, path: string) =>
  queryOptions({
    queryKey: ["elcinema-static", lang, path],
    queryFn: async () => ({ data: getFallbackPage(path, lang), error: null }),
    staleTime: 10 * 60 * 1000,
  });
