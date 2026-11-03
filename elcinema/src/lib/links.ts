/**
 * Client-safe link resolution for the live home-page replica.
 *
 * Every elcinema.com href scraped from the live site is resolved to an
 * internal app page — nothing ever navigates the app (or a new tab) to
 * elcinema.com. Work/person ids open the live detail pages, the site
 * sections map to the app's internal pages (now, soon, boxoffice, tvguide,
 * search, video, vod, lineup, booking), and any other path falls back to the
 * app's home for the edition. Only links to other hosts (social profiles,
 * YouTube play links) stay external, and only as new-tab playback/profile
 * actions.
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

const EC = "https://elcinema.com";

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

/** Resolve a scraped href (+ its card title) to the link the app should render. */
export function cardLink(lang: Lang, rawHref: string | null | undefined, title = ""): CardLink {
  let path = "";
  try {
    const url = new URL(rawHref ?? "", EC);
    // Links to other sites (social profiles, YouTube play pages) stay
    // external — the rule covers elcinema.com itself, which must never be
    // opened by a card click.
    if (!/(^|\.)elcinema\.com$/.test(url.hostname)) {
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
