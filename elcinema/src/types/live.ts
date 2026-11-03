/**
 * Client-safe shapes for pages that render live elcinema.com data
 * (work/person details, videos, VOD guide, featured lists, booking, static
 * legal/help pages such as About, Contact, Advertise, Privacy, Terms).
 * All scrapers live in live.server.ts and every field is a plain,
 * SSR-serializable value.
 */
import type { Lang } from "@/types/home";

/** A linked title/person card with its elcinema numeric id. */
export interface LiveRef {
  id: string;
  title: string;
  img: string | null;
  href: string;
}

/** One cinema's times for one day. */
export interface LiveDayShowtimes {
  day: string;
  cinemas: {
    id: string;
    name: string;
    times: string[];
    bookingHref: string | null;
  }[];
}

export interface LiveWork {
  id: string;
  lang: Lang;
  title: string;
  altTitle: string | null;
  year: string | null;
  poster: string | null;
  rating: number | null;
  votes: number | null;
  category: string | null;
  country: string | null;
  runtimeMinutes: number | null;
  censorship: string[];
  releaseDate: string | null;
  genres: string[];
  synopsis: string | null;
  director: LiveRef[];
  writers: LiveRef[];
  cast: LiveRef[];
  /** Watch-online buttons: platform label + the play link. */
  vod: { label: string; note: string; href: string; img: string | null }[];
  showtimes: LiveDayShowtimes[];
  photos: { href: string; img: string | null }[];
  videos: LiveRef[];
  related: LiveRef[];
  imdbUrl: string | null;
}

export interface LivePerson {
  id: string;
  lang: Lang;
  name: string;
  altName: string | null;
  photo: string | null;
  bio: string | null;
  nationality: string | null;
  filmography: { section: string; items: LiveRef[] }[];
  vod: { label: string; note: string; href: string; img: string | null }[];
  photos: { href: string; img: string | null }[];
  crewWith: LiveRef[];
}

export interface LiveVideoCard {
  id: string;
  title: string;
  duration: string | null;
  img: string | null;
}

export interface LiveVideoSection {
  title: string;
  count: string | null;
  videos: LiveVideoCard[];
}

export interface LiveVideoGallery {
  title: string;
  sections: LiveVideoSection[];
}

export interface LiveVideo {
  id: string;
  title: string;
  embedUrl: string | null;
  img: string | null;
  related: LiveVideoCard[];
}

export interface LiveVodPlatform {
  id: string;
  name: string;
  img: string | null;
  cats: { label: string; vcategory: string | null }[];
}

export interface LiveVodGuide {
  title: string;
  platforms: LiveVodPlatform[];
}

export interface LiveVodWorks {
  platformId: string;
  vcategory: string | null;
  works: LiveRef[];
}

export interface LiveLineupList {
  id: string;
  title: string;
  cover: string | null;
}

export interface LiveLineupIndex {
  title: string;
  lists: LiveLineupList[];
}

export interface LiveLineupItem {
  id: string;
  title: string;
  img: string | null;
  meta: string;
  cast: LiveRef[];
}

export interface LiveLineupDetail {
  id: string;
  title: string;
  items: LiveLineupItem[];
}

/** One content block of a scraped static page section. */
export interface LiveStaticParagraphBlock {
  type: "p";
  text: string;
}

/** A bullet/numbered list inside a scraped static page section. */
export interface LiveStaticListBlock {
  type: "list";
  items: string[];
}

export type LiveStaticBlock = LiveStaticParagraphBlock | LiveStaticListBlock;

/** A titled content section of a scraped static page (About, Contact, …). */
export interface LiveStaticSection {
  heading: string;
  blocks: LiveStaticBlock[];
}

/** A scraped static content page from elcinema.com (About, Contact, Advertise, …). */
export interface LiveStaticPage {
  title: string;
  sections: LiveStaticSection[];
}
