/**
 * Derived data for the elCinema experience: TV guide, showtimes, search
 * index and detail extras. Derived deterministically from the local dataset
 * (src/elcinema/data), so SSR and the client always agree.
 */
import { BOXOFFICE, boxofficeDate, CHANNELS, GENRES, MOVIES, PEOPLE, TV_GUIDE_DATA } from "./data";
import { img } from "./images";
import { toSlug, movieSlug, personSlug } from "./slug";
import type { Bi, BoxofficeEntry, Lang, Movie, Person, TvGuide } from "./home.shared";

export type { Bi, Movie };
export { GENRES, PEOPLE, boxofficeDate, toSlug, movieSlug, personSlug };

// ---------- Centralized Slug & Title Resolution ----------
// Secondary indices mapping normalized name slugs, titles, and IDs to entities.
const movieByTitleSlug = new Map<string, Movie>();
for (const m of MOVIES) {
  const sEn = toSlug(m.title.en);
  if (sEn) movieByTitleSlug.set(sEn, m);
  const sAr = toSlug(m.title.ar);
  if (sAr) movieByTitleSlug.set(sAr, m);
  movieByTitleSlug.set(m.title.en.toLowerCase().trim(), m);
  movieByTitleSlug.set(m.title.ar.toLowerCase().trim(), m);
  if (m.id) movieByTitleSlug.set(String(m.id).trim(), m);
}

class MovieSlugMap extends Map<string, Movie> {
  override get(key: string): Movie | undefined {
    const direct = super.get(key);
    if (direct) return direct;
    const normalized = toSlug(key);
    if (normalized) {
      const match = movieByTitleSlug.get(normalized);
      if (match) return match;
    }
    const lower = key.toLowerCase().trim();
    return movieByTitleSlug.get(lower);
  }

  override has(key: string): boolean {
    return super.has(key) || this.get(key) !== undefined;
  }
}

export const movieBySlug = new MovieSlugMap(MOVIES.map((m) => [m.slug, m]));
export const nowPlaying = MOVIES.filter((m) => m.status === "now");
export const comingSoon = [...MOVIES.filter((m) => m.status === "soon")].sort((a, b) =>
  a.release.localeCompare(b.release),
);

// ---------- elCinema-style numeric IDs ----------
// The dataset carries the real elcinema.com work/person ids, so the public
// URLs are the real site's URLs (/en/work/2098155/).

export function workId(movie: Movie): number | string {
  const n = Number(movie.id);
  return Number.isFinite(n) && movie.id.trim() !== "" ? n : movie.id;
}

export function personId(person: Person): number {
  return Number(person.id);
}

export const movieById = new Map(MOVIES.map((m) => [workId(m), m]));

const personByNameSlug = new Map<string, Person>();
for (const p of PEOPLE) {
  const sEn = toSlug(p.name.en);
  if (sEn) personByNameSlug.set(sEn, p);
  const sAr = toSlug(p.name.ar);
  if (sAr) personByNameSlug.set(sAr, p);
  personByNameSlug.set(p.name.en.toLowerCase().trim(), p);
  personByNameSlug.set(p.name.ar.toLowerCase().trim(), p);
  if (p.id) personByNameSlug.set(String(p.id).trim(), p);
}

class PersonSlugMap extends Map<string, Person> {
  override get(key: string): Person | undefined {
    const direct = super.get(key);
    if (direct) return direct;
    const normalized = toSlug(key);
    if (normalized) {
      const match = personByNameSlug.get(normalized);
      if (match) return match;
    }
    const lower = key.toLowerCase().trim();
    return personByNameSlug.get(lower);
  }

  override has(key: string): boolean {
    return super.has(key) || this.get(key) !== undefined;
  }
}

/** Map of public slugs (both name-based and numeric) for resolution and redirects. */
export const personBySlug = new PersonSlugMap(PEOPLE.map((p) => [p.slug, p]));
export const personById = new Map(PEOPLE.map((p) => [personId(p), p]));

/** Get a movie by its name slug, legacy slug, or numeric ID. */
export function getMovieBySlug(idOrSlug: string | number): Movie | undefined {
  const str = String(idOrSlug).trim();
  if (/^\d+$/.test(str)) {
    const byId = movieById.get(Number(str));
    if (byId) return byId;
  }
  return movieBySlug.get(str);
}

/** Get a person by their name slug, legacy slug, or numeric ID. */
export function getPersonBySlug(idOrSlug: string | number): Person | undefined {
  const str = String(idOrSlug).trim();
  if (/^\d+$/.test(str)) {
    const byId = personById.get(Number(str));
    if (byId) return byId;
  }
  return personBySlug.get(str);
}

/** Cast-name lookup so movie cast entries can link to person pages. */
export const personByName = new Map(PEOPLE.map((p) => [p.name.en, p]));

// ---------- Clock formatting ----------

/** Minutes-from-midnight -> "14:30" (elCinema's 24h timebar). */
export function fmtClock(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** elCinema showtime style: "11:00 am", "01:30 pm", "12:00 midnight". */
export function fmtClock12(min: number, lang: Lang): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const mm = String(m).padStart(2, "0");
  if (h24 === 0) return lang === "en" ? `12:${mm} midnight` : `12:${mm} منتصف الليل`;
  const suffix = h24 < 12 ? (lang === "en" ? "am" : "ص") : lang === "en" ? "pm" : "م";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${mm} ${suffix}`;
}

/** Bilingual weekday names for the showtimes day tabs. */
const WEEKDAYS: Bi[] = [
  { en: "Sunday", ar: "الأحد" },
  { en: "Monday", ar: "الاثنين" },
  { en: "Tuesday", ar: "الثلاثاء" },
  { en: "Wednesday", ar: "الأربعاء" },
  { en: "Thursday", ar: "الخميس" },
  { en: "Friday", ar: "الجمعة" },
  { en: "Saturday", ar: "السبت" },
];

/** "Monday 02" style tab label for offset `days` from today. */
export function dayLabel(offset: number, lang: Lang): Bi {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const wd = WEEKDAYS[d.getDay()] ?? { en: "", ar: "" };
  const day = String(d.getDate()).padStart(2, "0");
  return { en: `${wd.en} ${day}`, ar: `${wd.ar} ${day}` };
}

/** elCinema-style airtime: "02:45 PM" (en) / "02:45 م" (ar). */
export function fmtAirtime(min: number, lang: "en" | "ar"): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const ampm = h24 < 12 ? (lang === "en" ? "AM" : "ص") : lang === "en" ? "PM" : "م";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ---------- TV guide (real snapshot) ----------

export const tvGuide: TvGuide = {
  from: TV_GUIDE_DATA.from,
  to: TV_GUIDE_DATA.to,
  times: TV_GUIDE_DATA.times,
  lines: TV_GUIDE_DATA.lines.map((l) => ({
    channel: { ...l.channel, img: l.channel.img ?? null },
    slots: l.slots.map((s) => ({ ...s, title: s.title, href: s.href ?? null, meta: s.meta ?? "" })),
  })),
};

/** Percent geometry for the timeline renderer. */
export function slotGeometry(
  slotStart: number,
  slotEnd: number,
  guide: TvGuide,
): { left: number; width: number } {
  const span = guide.to - guide.from;
  return {
    left: ((slotStart - guide.from) / span) * 100,
    width: ((slotEnd - slotStart) / span) * 100,
  };
}

/** Slots may abut or overlap; re-lay them into clean, non-overlapping stretches. */
export function layoutSlots(
  slots: { start: number; end: number }[],
  guide: TvGuide,
): { index: number; left: number; width: number }[] {
  const geo = slots.map((s, index) => ({ index, ...slotGeometry(s.start, s.end, guide) }));
  const sorted = [...geo].sort((a, b) => a.left - b.left);
  const placed: { index: number; left: number; width: number }[] = [];
  let prevEnd = 0;
  sorted.forEach((g, i) => {
    const start = Math.max(g.left, prevEnd);
    const nextLeft = i + 1 < sorted.length ? (sorted[i + 1]?.left ?? 100) : 100;
    const width = Math.min(g.left + g.width, nextLeft) - start;
    if (width > 1) {
      placed.push({ index: g.index, left: start, width });
      prevEnd = start + width;
    }
  });
  return placed;
}

// ---------- Showtimes (real, scraped per movie) ----------

/** Showtimes per cinema for a given day tab index (0 = first scraped day). */
export function showtimesFor(
  movie: Movie,
  day = 0,
): { cinema: { id: string; name: Bi }; times: string[]; bookingHref: string | null }[] {
  const dayData = movie.showtimes[day];
  if (!dayData) return [];
  return dayData.cinemas.map((cinema) => ({
    cinema: { id: cinema.id, name: cinema.name },
    times: cinema.times,
    bookingHref: cinema.bookingHref,
  }));
}

/** Number of day tabs a movie has showtimes for. */
export function showtimesDays(movie: Movie): number {
  return movie.showtimes.length;
}

// ---------- Work detail extras ----------

export interface MovieMeta {
  writer: Bi;
  rating: number;
  votes: number;
  language: Bi;
}

/** Real rating/votes where scraped, deterministic fallbacks otherwise. */
export function movieMeta(movie: Movie): MovieMeta {
  const rng = mulberry32(hashString(`meta:${movie.slug}`));
  const isEgyptian = movie.country.en === "Egypt";
  const rating = movie.rating ?? Math.round((5 + rng() * 4) * 10) / 10;
  return {
    writer: movie.writers[0] ?? movie.director,
    rating,
    votes: movie.votes ?? 40 + Math.floor(rng() * 4000),
    language: isEgyptian ? { en: "Arabic", ar: "العربية" } : { en: "English", ar: "الإنجليزية" },
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Watch-online buttons of a movie (real platform links). */
export function watchOnlineFor(movie: Movie) {
  return movie.vod;
}

/** Local URL of a movie poster image ("" when the movie has none). */
export const posterUrl = (movie: Movie): string => img(movie.poster);

/** Local URL of a person photo image ("" when the person has none). */
export const photoUrl = (person: Person): string => img(person.photo);

// ---------- Box office ----------

export function fmtRevenue(revenueEgp: number, lang: "en" | "ar"): string {
  const millions = revenueEgp / 1_000_000;
  const value = millions >= 1 ? `${millions.toFixed(1)}M` : `${Math.round(revenueEgp / 1000)}K`;
  return lang === "en" ? `EGP ${value}` : `${value} ج.م`;
}

export const boxoffice: BoxofficeEntry[] = BOXOFFICE;

// ---------- Search ----------

export interface SearchResult {
  type: "movie" | "person" | "channel";
  id: string; // public numeric ID (work or person) or channel id
  title: Bi;
  sub: Bi;
  hue?: number;
  img?: string | undefined;
}

export function searchAll(q: string): SearchResult[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const results: SearchResult[] = [];
  const match = (...parts: string[]) => parts.some((p) => p.toLowerCase().includes(needle));

  MOVIES.forEach((m) => {
    const genresEn = m.genres.map((g) => GENRES[g]?.en ?? g).join(", ");
    const genresAr = m.genres.map((g) => GENRES[g]?.ar ?? g).join("، ");
    if (
      match(
        m.title.en,
        m.title.ar,
        m.synopsis.en,
        m.synopsis.ar,
        m.director.en,
        m.director.ar,
        genresEn,
        genresAr,
      )
    ) {
      results.push({
        type: "movie",
        id: String(workId(m)),
        title: m.title,
        sub: { en: genresEn, ar: genresAr },
        hue: m.hue,
        img: posterUrl(m) || undefined,
      });
    }
  });
  PEOPLE.forEach((p) => {
    if (match(p.name.en, p.name.ar, p.role.en, p.role.ar)) {
      results.push({
        type: "person",
        id: String(personId(p)),
        title: p.name,
        sub: p.role,
        img: photoUrl(p) || undefined,
      });
    }
  });
  CHANNELS.forEach((c) => {
    if (match(c.name.en, c.name.ar, c.category)) {
      results.push({
        type: "channel",
        id: c.id,
        title: c.name,
        sub: { en: c.category, ar: c.category },
      });
    }
  });
  return results;
}
