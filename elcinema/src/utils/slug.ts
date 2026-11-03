/**
 * Centralized slug utilities for elCinema:
 * - Generates clean, SEO-friendly, bilingual URL slugs from titles and names.
 * - Resolves movies and people deterministically by ID, slug, or title/name.
 */
import type { Bi, Movie, Person } from "@/types/home";

/**
 * Convert any string (English, Arabic, numbers) into a normalized, URL-safe slug.
 * e.g. "Sense and Sensibility" -> "sense-and-sensibility"
 *      "Deadpool & Wolverine" -> "deadpool-and-wolverine"
 *      "العقل والعاطفة" -> "العقل-والعاطفة"
 */
export function toSlug(text: string | null | undefined): string {
  if (!text) return "";
  return (
    text
      .toString()
      .trim()
      .toLowerCase()
      // Replace ampersand with 'and'
      .replace(/&+/g, "and")
      // Replace plus with 'plus'
      .replace(/\++/g, "plus")
      // Replace quotes, apostrophes
      .replace(/['"’`]/g, "")
      // Replace whitespace and common separators with a single hyphen
      .replace(/[\s/\\_.:;,!?()[\]{}#*^~<>|]+/g, "-")
      // Strip diacritics / combining marks for Latin characters while preserving base letters
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Keep Unicode letters, numbers, and hyphens (supports Arabic letters & Latin)
      .replace(/[^\p{Letter}\p{Number}-]+/gu, "")
      // Collapse consecutive hyphens
      .replace(/-+/g, "-")
      // Trim leading and trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Get the canonical, readable slug for a movie based on its English title (or Arabic title / ID).
 */
export function movieSlug(movie: { id?: string | number; title?: Bi; slug?: string }): string {
  const enSlug = toSlug(movie.title?.en);
  if (enSlug) return enSlug;
  const arSlug = toSlug(movie.title?.ar);
  if (arSlug) return arSlug;
  return String(movie.slug || movie.id || "");
}

/**
 * Get the canonical, readable slug for a person based on their English name (or Arabic name / ID).
 */
export function personSlug(person: { id?: string | number; name?: Bi; slug?: string }): string {
  const enSlug = toSlug(person.name?.en);
  if (enSlug) return enSlug;
  const arSlug = toSlug(person.name?.ar);
  if (arSlug) return arSlug;
  return String(person.slug || person.id || "");
}
