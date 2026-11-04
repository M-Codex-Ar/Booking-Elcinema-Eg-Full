import { GENRES } from "@/lib/data";

/** Return unique catalogue genres that have a translated display label. */
export function knownGenreKeys(keys: Iterable<string>): string[] {
  return [...new Set(keys)].filter((key) => Boolean(GENRES[key]));
}
