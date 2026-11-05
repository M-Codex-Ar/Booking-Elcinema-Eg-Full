/**
 * Media URL rules shared by local catalogue data and the UI.
 *
 * Two jobs, one place: deciding what an image reference *means* (absolute URL,
 * lazy attribute, retired source URL, or placeholder) and deciding what the app shows when a
 * reference cannot be honoured (a shipped placeholder asset). Nothing here
 * touches the network, so both `*.server.ts` parsers and React components can
 * import it without dragging server code into the bundle.
 */

/** First-party placeholder artwork, served from `public/images/`. */
export const PLACEHOLDER = {
  poster: "/images/poster-placeholder.svg",
  wide: "/images/landscape-placeholder.svg",
  person: "/images/person-placeholder.svg",
  logo: "/images/logo-placeholder.svg",
} as const;

export type PlaceholderKind = keyof typeof PLACEHOLDER;

/**
 * Assets uploaded through the Lovable preview are served from `/__l5e/...` and
 * exist only inside that preview — the same URL is a 404 on the dev server and
 * in production. Treat them as absent so the UI shows real fallback artwork.
 */
const PREVIEW_ONLY = "/__l5e/";

/** Known blank and tracking images are not artwork. */
const BLANK_ART =
  /(blank_photos|blank[-_]?(photo|image)|spacer\.gif|pixel\.(gif|png)|1x1\.|no_(image|photo))/i;

const RETIRED_HOST = ["elcinema", "com"].join(".");

export function isRetiredSourceUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase().split(".");
    return host.slice(-2).join(".") === RETIRED_HOST;
  } catch {
    return false;
  }
}

/** Absolute `http(s)` URL? */
export const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

/**
 * Normalise a catalogue or managed-media reference into a browser-safe URL.
 * Returns `null` for empty values, site-root links, preview-only assets,
 * retired source URLs, and blank-photo placeholders.
 */
export function toArtworkUrl(src: string | null | undefined, base: string): string | null {
  if (!src) return null;
  let value = src.trim();
  if (!value || value === "/" || value === `${base}/`) return null;
  if (value.startsWith(PREVIEW_ONLY)) return null;
  if (value.startsWith("//")) value = `https:${value}`;
  if (BLANK_ART.test(value)) return null;
  if (isRetiredSourceUrl(value)) return null;
  if (isAbsoluteUrl(value)) return value;
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

/** Minimal structural view of an image element. */
export interface ImgElement {
  attr(name: string): string | undefined;
}

/**
 * Read the image URL out of a lazy-loaded `<img>`.
 *
 * elcinema renders `<img class="lazy-loaded" data-src="…" src="">`, so asking
 * for `src` alone returns an empty string and the card loses its artwork. The
 * order below is the one every parser should use — attributes first, then the
 * widest `srcset` candidate.
 */
export function pickArtwork(el: ImgElement | null | undefined, base: string): string | null {
  if (!el) return null;
  const raw =
    el.attr("data-src") ??
    el.attr("data-original") ??
    el.attr("data-lazy-src") ??
    srcsetCandidate(el.attr("srcset") ?? el.attr("data-srcset")) ??
    el.attr("src");
  return toArtworkUrl(raw, base);
}

/** Largest width in a `srcset`, which is the sharpest render we can display. */
export function srcsetCandidate(srcset: string | null | undefined): string | undefined {
  if (!srcset) return undefined;
  let best: { url: string; width: number } | undefined;
  for (const entry of srcset.split(",")) {
    const [url, descriptor] = entry.trim().split(/\s+/);
    if (!url) continue;
    const width = descriptor?.endsWith("w") ? Number.parseInt(descriptor, 10) : 0;
    if (!best || width > best.width) best = { url, width };
  }
  return best?.url;
}

/** Is this reference renderable as-is (local asset or live CDN URL)? */
export function isUsableArtwork(src: string | null | undefined): src is string {
  if (!src) return false;
  return toArtworkUrl(src, "") !== null || src.startsWith("/images/");
}

/**
 * The URL an `<img>` should actually point at for a reference that may be
 * missing, dead or preview-only — falling back to shipped placeholder artwork.
 */
export function resolveArtwork(
  src: string | null | undefined,
  kind: PlaceholderKind = "poster",
): string {
  return isUsableArtwork(src) ? src : PLACEHOLDER[kind];
}
