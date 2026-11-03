import { GENRES } from "@/lib/data";

/** Keep filters and chips limited to genres with bilingual catalogue labels. */
export function knownGenreKeys(genreKeys: Iterable<string>): string[] {
  return [...new Set(genreKeys)].filter((key) => Boolean(GENRES[key]));
}
