/**
 * Text normalization utilities for consistent string comparison across the app.
 * Different patterns for different use cases to avoid confusion.
 */

/**
 * Normalize title for deduplication: exact match across database and static data.
 * Removes extra whitespace and converts to lowercase for comparison.
 *
 * Example: "Movie" === "movie" === "  movie  "
 */
export function normalizeTitleForComparison(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Normalize link title for URL parsing: removes trailing parenthetical metadata.
 * Used when parsing scraped hrefs where titles may have year or edition info.
 *
 * Example: "Movie (2023) (Director's Cut)" → "Movie"
 */
export function normalizeLinkTitle(s: string): string {
  return s
    .replace(/\s*\([^)]*\)\s*$/g, "") // Remove trailing parentheses
    .trim()
    .toLowerCase();
}

/**
 * Alias for normalizeTitleForComparison. Use this name when the intent is
 * to search or compare terms rather than parse links.
 */
export const normalizeSearchTerm = normalizeTitleForComparison;
