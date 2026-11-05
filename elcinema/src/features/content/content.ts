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
  HomeViewData,
  HomePromo,
  HomeWatchOnlineItem,
  HomeTvGuide,
  HomeMovieCard,
  HomeListRow,
  HomeBoxofficeCard,
  HomeTvLine,
  HomeTvSlot,
} from "@/types/home";
import type { ManagedContent } from "@/features/content/content.functions";
import { makeT } from "@/i18n";

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
import { toArtworkUrl } from "@/types/media";

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
  // Managed rows lead so an operator-corrected entry overrides catalogue data.
  return dedupeByTitle([...extra, ...staticBoxoffice], (b) => b.title.en);
}

/** TV guide: built-in grid + one line per managed channel with its programs. */
export function mergedTvGuide(m: ManagedContent | null): TvGuide {
  const builtInNames = new Set(tvGuide.lines.map((l) => normTitle(l.channel.name.en)));
  const seenNames = new Set<string>();
  const channels = managedChannels(m).filter((ch) => {
    const k = normTitle(ch.name_en || ch.name_ar);
    if (!k || builtInNames.has(k) || seenNames.has(k)) return false;
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

/** Dashboard videos addressed by their stable local public reference. */
export function managedVideoById(m: ManagedContent | null): Map<string, ManagedVideoRow> {
  return new Map(managedVideos(m).map((row) => [managedRef(row), row]));
}

/** Homepage view model built only from the bundled catalogue and managed rows. */
export function mergedHomeData(m: ManagedContent | null, lang: Lang): HomeViewData {
  const t = (en: string, ar: string) => (lang === "ar" ? ar || en : en);
  const copy = makeT(lang);
  const movies: HomeMovieCard[] = mergedNowPlaying(m).map((movie) => ({
    href: `/${lang}/work/${movie.id}`,
    img: movieArt(movie),
    title: t(movie.title.en, movie.title.ar),
    bookingHref: movie.showtimes.length ? `/${lang}/booking/${movie.id}` : null,
  }));
  const promos: HomePromo[] = movies.slice(0, 5).map((movie) => ({
    href: movie.href,
    img: movie.img,
    title: movie.title,
    button: "",
  }));
  const watchOnline: HomeWatchOnlineItem[] = allMovies(m)
    .filter((movie) => movie.vod.length > 0)
    .map((movie) => ({
      href: `/${lang}/work/${movie.id}`,
      img: movieArt(movie),
      title: t(movie.title.en, movie.title.ar),
      meta: movie.year,
      vod: movie.vod[0] ? { href: movie.vod[0].href, img: null, label: movie.vod[0].label } : null,
    }));
  const guide = mergedTvGuide(m);
  const formatTime = (minutes: number) =>
    `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const tvGuideData: HomeTvGuide = {
    times: guide.times.map(formatTime),
    lines: guide.lines.map((line) => ({
      channelImg: line.channel.img,
      channelName: t(line.channel.name.en, line.channel.name.ar),
      channelHref: `/${lang}/tvguide`,
      slots: line.slots.map((slot) => {
        const span = Math.max(guide.to - guide.from, 1);
        return {
          title: t(slot.title.en, slot.title.ar),
          titleHref: slot.href ? `/${lang}/work/${slot.href}` : null,
          meta: slot.meta,
          time: `${formatTime(slot.start)} - ${formatTime(slot.end)}`,
          width: ((slot.end - slot.start) / span) * 100,
          left: ((slot.start - guide.from) / span) * 100,
          unclickable: !slot.href,
          category: null,
        };
      }),
    })),
  };
  const boxoffice: HomeBoxofficeCard[] = mergedBoxoffice(m).map((row) => {
    const movie = allMovies(m).find(
      (item) =>
        item.id === row.slug ||
        normTitle(item.title.en) === normTitle(row.title.en) ||
        normTitle(item.title.ar) === normTitle(row.title.ar),
    );
    const weekly = row.weeklyEgp;
    return {
      href: movie ? `/${lang}/work/${movie.id}` : `/${lang}/boxoffice`,
      title: t(row.title.en, row.title.ar),
      img: movie ? movieArt(movie) : null,
      revenue: weekly >= 1_000_000 ? `${(weekly / 1_000_000).toFixed(1)}M EGP` : `${weekly} EGP`,
    };
  });
  const lists: HomeListRow[] = [
    { href: `/${lang}/lineup/local-now`, title: copy("now.title") },
    { href: `/${lang}/lineup/local-soon`, title: copy("soon.title") },
    ...managedLists(m).map((list) => ({
      href: `/${lang}/lineup/${managedRef(list)}`,
      title: t(list.title_en, list.title_ar),
    })),
  ];
  return {
    promos,
    movies,
    watchOnline,
    tvSummary: [],
    tvGuide: tvGuideData,
    videos: managedVideos(m).map((video) => ({
      href: `/${lang}/video/m-${video.id}`,
      img: video.thumb_url,
      title: t(video.title_en, video.title_ar),
      duration: video.duration || null,
    })),
    bornToday: { date: "", dateKey: "", href: `/${lang}/person`, people: [] },
    lists,
    boxofficeDate: "",
    boxoffice,
  };
}

/** Direct URL for a movie's artwork (absolute poster URLs pass through). */
export function movieArt(movie: Movie): string {
  return movie.poster && /^https?:\/\//.test(movie.poster)
    ? (toArtworkUrl(movie.poster, "") ?? posterUrl(movie))
    : posterUrl(movie);
}
