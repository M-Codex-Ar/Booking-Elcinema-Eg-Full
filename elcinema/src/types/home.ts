/** Client-safe shapes for the elCinema bilingual experience (local dataset). */

export type Lang = "en" | "ar";

/** A bilingual string. */
export interface Bi {
  en: string;
  ar: string;
}

export type ChannelCategory =
  | "general"
  | "movies"
  | "series"
  | "news"
  | "sports"
  | "kids"
  | "music"
  | "documentary"
  | "religion";

/** Watch-online play button scraped from the work page (both editions). */
export interface MovieVod {
  label: string; // platform key, e.g. "netflix"
  note: Bi; // "Free" / "Subscribe"
  href: string; // external play link
  img: string | null; // platform logo image key
}

/** One day's showtimes across cinemas, scraped from the work page. */
export interface MovieShowtimes {
  /** Day offset from the dataset scrape date; 0 = the scrape day. */
  dayOffset: number;
  label: string; // source label, e.g. "Monday 02"
  cinemas: {
    id: string;
    name: Bi;
    times: string[];
    bookingHref: string | null;
  }[];
}

export interface Movie {
  /** Real elcinema.com work id — the public URL id (/en/work/<id>/). */
  id: string;
  slug: string; // equals id, kept for the legacy slug maps
  title: Bi;
  synopsis: Bi;
  genres: string[]; // keys into GENRES
  director: Bi;
  writers: Bi[];
  cast: Bi[];
  /** Real elcinema person ids parallel to `cast`. */
  castIds: string[];
  runtime: number; // minutes, 0 when unknown
  cert: string; // censorship rating, "" when unrated
  release: string; // ISO date
  status: "now" | "soon";
  year: string;
  country: Bi;
  hue: number; // seed for the generated poster fallback art
  poster: string | null; // image key in the local asset manifest
  rating: number | null; // real user score
  votes: number | null;
  vod: MovieVod[];
  showtimes: MovieShowtimes[];
}

export interface Person {
  id: string; // real elcinema person id
  slug: string; // equals id
  name: Bi;
  role: Bi; // "Actor" / "Director" / "Writer" bilingual
  knownFor: string[]; // movie ids
  photo: string | null; // image key in the local asset manifest
}

export interface Channel {
  id: string;
  name: Bi;
  category: ChannelCategory;
  img: string | null; // channel logo image key
}

export interface TvSlot {
  title: Bi;
  href: string | null; // internal work link on the real site
  meta: string; // "Movie - Normal (2001)"
  start: number; // minutes from midnight
  end: number;
}

export interface TvLine {
  channel: Channel;
  slots: TvSlot[];
}

export interface TvGuide {
  from: number; // guide window, minutes from midnight
  to: number;
  times: number[]; // timebar tick marks
  lines: TvLine[];
}

export interface BoxofficeEntry {
  slug: string | null; // movie id, null when unlinked
  title: Bi;
  weeklyEgp: number; // weekly revenue in EGP
  totalEgp: number; // total revenue in EGP
}

export interface Genre {
  id: string;
  label: Bi;
}

export interface WatchOnlineItem {
  movie: Movie;
  meta: Bi;
  vod: Bi;
}

// ---------------------------------------------------------------------------
// Shapes parsed from the live elcinema.com homepage (see home.server.ts).
// ---------------------------------------------------------------------------

export interface EcPromo {
  href: string;
  img: string | null;
  title: string;
  button: string;
}

export interface EcMovie {
  href: string;
  img: string | null;
  title: string;
  bookingHref: string | null;
}

export interface EcVod {
  href: string;
  img: string | null;
  label: string;
}

export interface EcWatchOnlineItem {
  href: string;
  img: string | null;
  title: string;
  meta: string;
  vod: EcVod | null;
}

export interface EcTvSummaryItem {
  href: string;
  img: string | null;
  title: string;
  channelImg: string | null;
  channelName: string;
  channelHref: string;
  airtime: string;
  vod: EcVod | null;
}

export interface EcTvSlot {
  title: string;
  titleHref: string | null;
  meta: string;
  time: string;
  width: number;
  left: number;
  unclickable: boolean;
  category: number | null;
}

export interface EcTvLine {
  channelImg: string | null;
  channelName: string;
  channelHref: string;
  slots: EcTvSlot[];
}

export interface EcTvGuide {
  times: string[];
  lines: EcTvLine[];
}

export interface EcVideo {
  href: string;
  img: string | null;
  title: string;
  duration: string | null;
}

export interface EcListRow {
  href: string;
  title: string;
}

export interface EcBoxofficeRow {
  href: string;
  title: string;
  img: string | null;
  revenue: string;
}

/**
 * One person in the homepage "Born Today" rail.
 *
 * The home section itself only carries photo + name; the day's listing page
 * (`/en/index/person/birth_day/<MM-DD>`, and its Arabic twin) supplies the
 * rest — category, nationality, birth year and, when the person has died, the
 * death date. Every field is nullable so the rail still renders when only the
 * homepage was reachable.
 */
export interface EcBornPerson {
  /** Real elcinema person id, from the `/en/person/<id>/` link. */
  id: string;
  href: string;
  name: Bi;
  /** Remote artwork as published by the site; null when it is a blank photo. */
  img: string | null;
  /** First-party mirror of `img`, when the asset has been scraped locally. */
  localImg: string | null;
  /** e.g. "Acting" / "تمثيل", "Music Composer" / "موسيقى تصويرية". */
  category: Bi | null;
  nationality: Bi | null;
  /** Four-digit birth year, or null when the source does not publish one. */
  birthYear: string | null;
  /** e.g. "30 June 2018" / "30 يونيو 2018" when the person has died. */
  deathDate: Bi | null;
}

/** The "Born Today" (ولد في مثل هذا اليوم) home section. */
export interface EcBornToday {
  /** Day label as the English site prints it, e.g. "2 November". */
  date: string;
  /** `MM-DD` key of the day — locale-neutral, so the UI formats it per edition. */
  dateKey: string;
  /** Listing page for the day, e.g. `/en/index/person/birth_day/11-02`. */
  href: string;
  people: EcBornPerson[];
}

export interface EcHomeData {
  promos: EcPromo[];
  movies: EcMovie[];
  watchOnline: EcWatchOnlineItem[];
  tvSummary: EcTvSummaryItem[];
  tvGuide: EcTvGuide;
  videos: EcVideo[];
  bornToday: EcBornToday;
  lists: EcListRow[];
  boxofficeDate: string;
  boxoffice: EcBoxofficeRow[];
}
