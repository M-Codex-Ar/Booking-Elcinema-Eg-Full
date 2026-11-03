/**
 * Merging dashboard-managed content with the built-in catalogue.
 * Pure, client-safe helpers: both SSR and the browser call these with the
 * same inputs, so hydrated pages always match the server render.
 */
import { MOVIES, PEOPLE } from "@/lib/data";
import {
  tvGuide,
  boxoffice as staticBoxoffice,
  nowPlaying as staticNowPlaying,
  comingSoon as staticComingSoon,
  posterUrl,
  type SearchResult,
} from "@/lib/build";
import type {
  Movie,
  Person,
  BoxofficeEntry,
  TvGuide,
  ChannelCategory,
  Lang,
  EcHomeData,
  EcMovie,
  EcVideo,
  EcListRow,
  EcBoxofficeRow,
  EcTvLine,
  EcTvSlot,
} from "@/types/home";
import type { ManagedContent } from "@/features/content/content.functions";

export type ManagedMovieRow = Record<string, unknown> & {
  id: string;
  title_en: string;
  title_ar: string;
  genre: string;
  year: number | null;
  release_date: string | null;
  status: string;
  rating: number | null;
  runtime: number;
  cert: string;
  director_en: string;
  director_ar: string;
  synopsis_en: string;
  synopsis_ar: string;
  poster_url: string | null;
};

export type ManagedPersonRow = Record<string, unknown> & {
  id: string;
  name_en: string;
  name_ar: string;
  role_en: string;
  role_ar: string;
  bio: string;
  photo_url: string | null;
};

export type ManagedBoxofficeRow = Record<string, unknown> & {
  id: string;
  title_en: string;
  title_ar: string;
  weekly_egp: number;
  total_egp: number;
};

export type ManagedChannelRow = Record<string, unknown> & {
  id: string;
  name_en: string;
  name_ar: string;
  category: string;
  logo_url: string | null;
};

export type ManagedProgramRow = Record<string, unknown> & {
  id: string;
  channel_id: string;
  title_en: string;
  title_ar: string;
  start_min: number;
  end_min: number;
  meta: string;
};

export type ManagedVideoRow = Record<string, unknown> & {
  id: string;
  title_en: string;
  title_ar: string;
  url: string;
  thumb_url: string | null;
  duration: string;
};

export type ManagedListRow = Record<string, unknown> & {
  id: string;
  title_en: string;
  title_ar: string;
  items: { ref: string; title_en: string; title_ar: string }[];
};

/** Managed rows keep the stable public ref "m-<uuid>" (work/person/list ids). */
export const managedRef = (row: { id: string }) => `m-${row.id}`;

const CATEGORIES: ChannelCategory[] = [
  "general",
  "movies",
  "series",
  "news",
  "sports",
  "kids",
  "music",
  "documentary",
  "religion",
];

function hueFor(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}

/** Dashboard movie row -> catalogue Movie, so every public page can render it. */
export function managedMovieToMovie(row: ManagedMovieRow): Movie {
  const release =
    row.release_date ?? (row.year ? `${row.year}-01-01` : new Date().toISOString().slice(0, 10));
  return {
    id: managedRef(row),
    slug: managedRef(row),
    title: { en: row.title_en, ar: row.title_ar || row.title_en },
    synopsis: { en: row.synopsis_en, ar: row.synopsis_ar || row.synopsis_en },
    genres: row.genre ? [row.genre] : [],
    director: { en: row.director_en, ar: row.director_ar || row.director_en },
    writers: [],
    cast: [],
    castIds: [],
    runtime: row.runtime ?? 0,
    cert: row.cert ?? "",
    release,
    status: row.status === "soon" ? "soon" : "now",
    year: row.year ? String(row.year) : "",
    country: { en: "", ar: "" },
    hue: hueFor(managedRef(row)),
    poster: row.poster_url,
    rating: row.rating != null ? Number(row.rating) : null,
    votes: null,
    vod: [],
    showtimes: [],
  };
}

/** Dashboard person row -> catalogue Person. */
export function managedPersonToPerson(row: ManagedPersonRow): Person {
  return {
    id: managedRef(row),
    slug: managedRef(row),
    name: { en: row.name_en, ar: row.name_ar || row.name_en },
    role: { en: row.role_en || "Actor", ar: row.role_ar || "ممثل" },
    knownFor: [],
    photo: row.photo_url,
  };
}

import { normalizeTitleForComparison } from "@/lib/normalize";

const rows = <T>(list: Record<string, unknown>[] | undefined) => (list ?? []) as unknown as T[];

/** Normalized title key used for duplicate checks across sources. */
const normTitle = normalizeTitleForComparison;

/** Keep the first entry for every normalized title: earlier items win, so
 * callers put the source that should override (usually managed) first. */
export function dedupeByTitle<T>(items: T[], title: (t: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    const k = normTitle(title(it));
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Search results: one hit per (type, title) so a managed entry never
 * duplicates the built-in one in the same result list. */
export function dedupeSearchResults(items: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return items.filter((r) => {
    const k = `${r.type}:${normTitle(r.title.en || r.title.ar)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function managedMovies(m: ManagedContent | null): ManagedMovieRow[] {
  return rows<ManagedMovieRow>(m?.movies);
}
export function managedPeople(m: ManagedContent | null): ManagedPersonRow[] {
  return rows<ManagedPersonRow>(m?.people);
}
export function managedChannels(m: ManagedContent | null): ManagedChannelRow[] {
  return rows<ManagedChannelRow>(m?.channels);
}
export function managedPrograms(m: ManagedContent | null): ManagedProgramRow[] {
  return rows<ManagedProgramRow>(m?.programs);
}
export function managedVideos(m: ManagedContent | null): ManagedVideoRow[] {
  return rows<ManagedVideoRow>(m?.videos);
}
export function managedLists(m: ManagedContent | null): ManagedListRow[] {
  return rows<ManagedListRow>(m?.lists);
}
export function managedBoxofficeRows(m: ManagedContent | null): ManagedBoxofficeRow[] {
  return rows<ManagedBoxofficeRow>(m?.boxoffice);
}

/** True when the title matches a built-in catalogue movie — used by the
 * dashboard to warn about entries that would duplicate the built-in one. */
export function matchesBuiltinMovie(title: string): boolean {
  const t = normTitle(title);
  return t !== "" && MOVIES.some((m) => normTitle(m.title.en) === t || normTitle(m.title.ar) === t);
}

/** Same check for a person name. */
export function matchesBuiltinPerson(name: string): boolean {
  const t = normTitle(name);
  return (
    t !== "" && PEOPLE.some((pr) => normTitle(pr.name.en) === t || normTitle(pr.name.ar) === t)
  );
}

/** Managed (DB) movies lead, then the built-in catalogue. A managed movie whose
 * title matches a built-in one wins here: the operator/DB entry becomes the
 * single entry for that film. The bundled JSON remains the offline floor when
 * the database is unreachable. */
export function allMovies(m: ManagedContent | null): Movie[] {
  return dedupeByTitle(
    [...managedMovies(m).map(managedMovieToMovie), ...MOVIES],
    (mv) => mv.title.en,
  );
}

/** Now playing: managed "now" entries lead (operators see additions immediately),
 * then built-in movies. Duplicates collapse to the first (managed) entry. */
export function mergedNowPlaying(m: ManagedContent | null): Movie[] {
  return dedupeByTitle(
    [
      ...managedMovies(m)
        .filter((r) => r.status !== "soon")
        .map(managedMovieToMovie),
      ...staticNowPlaying,
    ],
    (mv) => mv.title.en,
  );
}

/** Coming soon: managed "soon" first for duplicate precedence, then built-in,
 * sorted by release date. */
export function mergedComingSoon(m: ManagedContent | null): Movie[] {
  return dedupeByTitle(
    [
      ...managedMovies(m)
        .filter((r) => r.status === "soon")
        .map(managedMovieToMovie),
      ...staticComingSoon,
    ],
    (mv) => mv.title.en,
  ).sort((a, b) => a.release.localeCompare(b.release));
}

/** Weekly box office: built-in table, then managed rows appended. */
export function mergedBoxoffice(m: ManagedContent | null): BoxofficeEntry[] {
  const extra = managedBoxofficeRows(m).map((r) => ({
    slug: null as string | null,
    title: { en: r.title_en, ar: r.title_ar || r.title_en },
    weeklyEgp: Number(r.weekly_egp) || 0,
    totalEgp: Number(r.total_egp) || 0,
  }));
  // Managed rows lead so an operator-corrected entry overrides the scraped one.
  return dedupeByTitle([...extra, ...staticBoxoffice], (b) => b.title.en);
}

/** TV guide: built-in grid + one line per managed channel with its programs. */
export function mergedTvGuide(m: ManagedContent | null): TvGuide {
  const scrapedNames = new Set(tvGuide.lines.map((l) => normTitle(l.channel.name.en)));
  const seenNames = new Set<string>();
  const channels = managedChannels(m).filter((ch) => {
    const k = normTitle(ch.name_en || ch.name_ar);
    if (!k || scrapedNames.has(k) || seenNames.has(k)) return false;
    seenNames.add(k);
    return true;
  });
  const programs = managedPrograms(m);
  if (channels.length === 0) return tvGuide;
  const lines = [
    ...tvGuide.lines,
    ...channels
      .map((ch) => ({
        channel: {
          id: managedRef(ch),
          name: { en: ch.name_en, ar: ch.name_ar || ch.name_en },
          category: (CATEGORIES.includes(ch.category as ChannelCategory)
            ? ch.category
            : "general") as ChannelCategory,
          img: ch.logo_url,
        },
        slots: programs
          .filter((p) => p.channel_id === ch.id)
          .sort((a, b) => a.start_min - b.start_min)
          .map((p) => ({
            title: { en: p.title_en, ar: p.title_ar || p.title_en },
            href: null as string | null,
            meta: p.meta ?? "",
            start: p.start_min,
            end: p.end_min,
          })),
      }))
      .filter((l) => l.slots.length > 0),
  ];
  const managedSlots = lines.slice(tvGuide.lines.length).flatMap((l) => l.slots);
  const from = Math.min(tvGuide.from, ...managedSlots.map((s) => s.start));
  const to = Math.max(tvGuide.to, ...managedSlots.map((s) => s.end));
  const times: number[] = [];
  for (let t = Math.ceil(from / 30) * 30; t < to; t += 60) times.push(t);
  return { from, to, times: times.length > 0 ? times : tvGuide.times, lines };
}

/** Full-catalogue search including managed movies, people and channels. */
export function mergedSearch(q: string, m: ManagedContent | null): SearchResult[] {
  const results = managedMovies(m).map((r) => {
    const movie = managedMovieToMovie(r);
    return {
      type: "movie" as const,
      id: managedRef(r),
      title: movie.title,
      sub: { en: movie.genres.join(", "), ar: movie.genres.join("، ") },
      hue: movie.hue,
      img: movie.poster ?? undefined,
    };
  });
  const people = managedPeople(m).map((r) => ({
    type: "person" as const,
    id: managedRef(r),
    title: { en: r.name_en, ar: r.name_ar || r.name_en },
    sub: { en: r.role_en || "Actor", ar: r.role_ar || "ممثل" },
    img: r.photo_url ?? undefined,
  }));
  const channels = managedChannels(m).map((r) => ({
    type: "channel" as const,
    id: managedRef(r),
    title: { en: r.name_en, ar: r.name_ar || r.name_en },
    sub: { en: r.category, ar: r.category },
  }));
  return [...people, ...results, ...channels];
}

/** Managed movies by public ref, for the work detail route. */
export function managedMovieById(m: ManagedContent | null): Map<string, Movie> {
  return new Map(managedMovies(m).map((r) => [managedRef(r), managedMovieToMovie(r)]));
}

/** Managed people by public ref, for the person detail route. */
export function managedPersonById(m: ManagedContent | null): Map<string, Person> {
  return new Map(managedPeople(m).map((r) => [managedRef(r), managedPersonToPerson(r)]));
}

/** Homepage: weave managed content into the scraped home data.
 * Managed entries lead their rows and duplicate scraped cards are dropped,
 * so anything the operator adds is visible immediately and never shown twice. */
export function mergedHomeData(data: EcHomeData, m: ManagedContent | null, lang: Lang): EcHomeData {
  const t = (en: string, ar: string) => (lang === "ar" ? ar || en : en);
  const pickMovie = (title: string) =>
    managedMovies(m).find(
      (mm) =>
        normTitle(mm.title_en) === normTitle(title) || normTitle(mm.title_ar) === normTitle(title),
    );

  const movies: EcMovie[] = dedupeByTitle(
    [
      ...managedMovies(m)
        .filter((r) => r.status !== "soon")
        .map(managedMovieToMovie)
        .map((mv): EcMovie => ({
          href: `/${lang}/work/${mv.id}`,
          img: movieArt(mv),
          title: t(mv.title.en, mv.title.ar),
          bookingHref: null,
        })),
      ...data.movies,
    ],
    (x) => x.title,
  );

  const videos: EcVideo[] = dedupeByTitle(
    [
      ...managedVideos(m).map((v): EcVideo => ({
        href: v.url,
        img: v.thumb_url,
        title: t(v.title_en, v.title_ar),
        duration: v.duration || null,
      })),
      ...data.videos,
    ],
    (x) => x.title,
  );

  const boxoffice: EcBoxofficeRow[] = dedupeByTitle(
    [
      ...managedBoxofficeRows(m).map((r): EcBoxofficeRow => {
        const movie = pickMovie(r.title_en) ?? pickMovie(r.title_ar);
        const weekly = Number(r.weekly_egp) || 0;
        return {
          href: movie ? `/${lang}/work/${managedRef(movie)}` : `/${lang}/boxoffice`,
          title: t(r.title_en, r.title_ar),
          img: movie?.poster_url ?? null,
          revenue:
            weekly >= 1_000_000 ? `${(weekly / 1_000_000).toFixed(1)}M EGP` : `${weekly} EGP`,
        };
      }),
      ...data.boxoffice,
    ],
    (x) => x.title,
  );

  const lists: EcListRow[] = dedupeByTitle(
    [
      ...managedLists(m).map((l): EcListRow => ({
        href: `/${lang}/lineup/m-${l.id}`,
        title: t(l.title_en, l.title_ar),
      })),
      ...data.lists,
    ],
    (x) => x.title,
  );

  // Managed channels join the home TV-guide timeline. Slot positions are
  // percentages of the scraped hour window (first label = window start).
  let tvGuideData = data.tvGuide;
  const channels = managedChannels(m);
  const firstLabel = data.tvGuide.times[0];
  const windowStart = firstLabel ? parseHourLabel(firstLabel) : null;
  if (channels.length > 0 && windowStart !== null) {
    // Label spacing varies by source (hourly or half-hour); infer it.
    const second = parseHourLabel(data.tvGuide.times[1] ?? "");
    const step = second !== null && second > windowStart ? second - windowStart : 60;
    const span = Math.max(data.tvGuide.times.length, 1) * step;
    const scraped = new Set(data.tvGuide.lines.map((l) => normTitle(l.channelName)));
    const seen = new Set<string>();
    const fmt = (mins: number) =>
      `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(Math.round(mins % 60)).padStart(2, "0")}`;
    const lines: EcTvLine[] = channels
      .filter((ch) => {
        const k = normTitle(t(ch.name_en, ch.name_ar));
        if (!k || scraped.has(k) || seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .map((ch) => ({
        channelImg: ch.logo_url,
        channelName: t(ch.name_en, ch.name_ar),
        channelHref: "/tvguide",
        slots: managedPrograms(m)
          .filter((prog) => prog.channel_id === ch.id)
          .sort((a, b) => a.start_min - b.start_min)
          .flatMap((prog): EcTvSlot[] => {
            const left = ((prog.start_min - windowStart) / span) * 100;
            const right = ((prog.end_min - windowStart) / span) * 100;
            if (right <= 0 || left >= 100) return [];
            const clipL = Math.max(0, left);
            const clipR = Math.min(100, right);
            if (clipR - clipL < 2) return [];
            return [
              {
                title: t(prog.title_en, prog.title_ar),
                titleHref: null,
                meta: "",
                time: `${fmt(prog.start_min)} - ${fmt(prog.end_min)}`,
                width: clipR - clipL,
                left: clipL,
                unclickable: true,
                category: null,
              },
            ];
          }),
      }))
      .filter((l) => l.slots.length > 0);
    if (lines.length > 0)
      tvGuideData = { ...data.tvGuide, lines: [...data.tvGuide.lines, ...lines] };
  }

  return { ...data, movies, videos, boxoffice, lists, tvGuide: tvGuideData };
}

/** "20:00" or "11:30 AM" -> minutes since midnight, or null when unparsable. */
function parseHourLabel(label: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(label.trim());
  if (!match) return null;
  let h = Number(match[1]);
  const ap = match[3]?.toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + Number(match[2]);
}

/** Shared query for the managed-content payload (public read). */
import { queryOptions } from "@tanstack/react-query";
import { getManagedContent } from "@/features/content/content.functions";

export const managedContentOptions = queryOptions({
  queryKey: ["managed-content"],
  queryFn: () => getManagedContent(),
  staleTime: 60 * 1000,
});

/** Direct URL for a movie's artwork (absolute poster URLs pass through). */
export function movieArt(movie: Movie): string {
  return movie.poster && /^https?:\/\//.test(movie.poster) ? movie.poster : posterUrl(movie);
}
