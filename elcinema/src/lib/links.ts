/**
 * Client-safe link resolution for the live home-page replica.
 *
 * Resolve catalogue paths into this application's local routes. External
 * provider and social links may remain external, but the retired source host
 * is always mapped to a local destination.
 */
import { MOVIES, PEOPLE } from "@/lib/data";
import { movieBySlug, personBySlug, personId, workId } from "@/lib/build";
import type { Lang } from "@/types/home";
import { normalizeLinkTitle } from "@/lib/normalize";

export interface CardLink {
  href: string;
  /** Open on an external (non-elcinema) site in a new tab. */
  external: boolean;
}

const LOCAL_ORIGIN = "https://local.invalid";
const RETIRED_HOST = ["elcinema", "com"].join(".");

const SECTION_ROUTES = new Set([
  "now",
  "soon",
  "boxoffice",
  "tvguide",
  "search",
  "video",
  "vod",
  "lineup",
  "booking",
  "faq",
  "about",
  "contact",
  "advertise",
  "privacy",
  "terms",
]);

const normalize = normalizeLinkTitle;

function movieForTitle(title: string) {
  const t = normalize(title);
  if (!t) return undefined;
  return (
    movieBySlug.get(t) ??
    MOVIES.find((m) => normalize(m.title.en) === t || normalize(m.title.ar) === t)
  );
}

function personForTitle(title: string) {
  const t = normalize(title);
  if (!t) return undefined;
  return (
    personBySlug.get(t) ??
    PEOPLE.find((p) => normalize(p.name.en) === t || normalize(p.name.ar) === t)
  );
}

const numeric = (s: string | undefined) => (s && /^\d+$/.test(s) ? s : null);

/** Resolve a catalogue href and title to the local app destination. */
export function cardLink(lang: Lang, rawHref: string | null | undefined, title = ""): CardLink {
  let path = "";
  try {
    const url = new URL(rawHref ?? "", LOCAL_ORIGIN);
    // Links to other sites (social profiles, YouTube play pages) stay
    // external destinations are limited to third-party providers/social links.
    const hostParts = url.hostname.toLowerCase().split(".");
    const rootHost = hostParts.slice(-2).join(".");
    if (url.hostname !== "local.invalid" && rootHost !== RETIRED_HOST) {
      return { href: url.href, external: true };
    }
    path = decodeURIComponent(url.pathname);
  } catch {
    return { href: `/${lang}`, external: false };
  }

  const segs = path.split("/").filter(Boolean);
  const edition = segs[0] === "en" || segs[0] === "ar" ? segs[0] : null;
  const rest = edition ? segs.slice(1) : segs;
  if (rest.length === 0) {
    // Site root or a promo → the app's home for this edition.
    return { href: `/${lang}`, external: false };
  }

  const [headRaw, second] = rest;
  const head = headRaw ?? "";

  // Work detail: the built-in sample movie when the title matches, else the
  // live detail page for the real work id.
  if (head === "work") {
    const movie = movieForTitle(title);
    if (movie) return { href: `/${lang}/work/${workId(movie)}`, external: false };
    const id = numeric(second);
    return id
      ? { href: `/${lang}/work/${id}`, external: false }
      : { href: `/${lang}/now`, external: false };
  }

  // Person detail: same rule.
  if (head === "person") {
    const person = personForTitle(title);
    if (person) return { href: `/${lang}/person/${personId(person)}`, external: false };
    const id = numeric(second);
    return id
      ? { href: `/${lang}/person/${id}`, external: false }
      : { href: `/${lang}/search`, external: false };
  }

  // Booking: per-movie booking page, or the booking index.
  if (head === "booking") {
    const id = numeric(second);
    return id
      ? { href: `/${lang}/booking/${id}`, external: false }
      : { href: `/${lang}/booking`, external: false };
  }

  // Featured lists (the real site's Lists section, /lineup/).
  if (head === "lineup") {
    const id = numeric(second);
    return id
      ? { href: `/${lang}/lineup/${id}`, external: false }
      : { href: `/${lang}/lineup`, external: false };
  }

  // Videos (the real site's video gallery, /video/).
  if (head === "video") {
    const id = numeric(second);
    return id
      ? { href: `/${lang}/video/${id}`, external: false }
      : { href: `/${lang}/video`, external: false };
  }

  // Watch online (the real site's VOD guide, /vod/).
  if (head === "vod") {
    return { href: `/${lang}/vod`, external: false };
  }

  // Cinema-theater pages → the app's booking index (cinemas & showtimes).
  if (head === "theater") {
    return { href: `/${lang}/booking`, external: false };
  }

  // Search index links → the app's search.
  if (head === "index") {
    return { href: `/${lang}/search`, external: false };
  }

  // Sections this app ships.
  if (SECTION_ROUTES.has(head)) {
    return { href: `/${lang}/${head}`, external: false };
  }

  // Everything else (seasonals, ramadan, press, faq, login, …) stays inside
  // the app: fall back to the edition's home page.
  return { href: `/${lang}`, external: false };
}

/** Resolve any ticket CTA to this app's showtimes page, including provider URLs. */
export function bookingLink(
  lang: Lang,
  bookingHref: string | null | undefined,
  workHref: string | null | undefined,
  title = "",
): string {
  const booking = cardLink(lang, bookingHref, title);
  if (!booking.external && /\/booking\/\d+$/.test(booking.href)) return booking.href;

  const work = cardLink(lang, workHref, title);
  const id = /\/work\/(\d+)$/.exec(work.href)?.[1];
  return id ? `/${lang}/booking/${id}` : `/${lang}/booking`;
}
