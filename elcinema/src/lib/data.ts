/**
 * The built-in bilingual catalogue is committed and client-safe: movies,
 * people, genres, box office, artwork keys, and a TV guide snapshot. Artwork
 * resolves through the first-party asset manifest (src/images.ts). Catalogue
 * changes are reviewed as ordinary source data updates.
 */
import moviesData from "@/data/movies.json";
import peopleData from "@/data/people.json";
import boxofficeData from "@/data/boxoffice.json";
import genresData from "@/data/genres.json";
import tvguideData from "@/data/tvguide.json";
import type {
  Bi,
  BoxofficeEntry,
  Channel,
  ChannelCategory,
  Movie,
  Person,
  TvLine,
} from "@/types/home";

export const GENRES = genresData as Record<string, Bi>;

export const MOVIES: Movie[] = moviesData as unknown as Movie[];

export const PEOPLE: Person[] = peopleData as unknown as Person[];

/** Weekly Egypt box office table with its bilingual week label. */
export const BOXOFFICE: BoxofficeEntry[] = (boxofficeData as unknown as { rows: BoxofficeEntry[] })
  .rows;
export const boxofficeDate: Bi = (boxofficeData as { date: Bi }).date;

/** Bundled TV guide snapshot: channels + program slots. */
export const TV_GUIDE_DATA = tvguideData as unknown as {
  from: number;
  to: number;
  times: number[];
  lines: TvLine[];
};

export const CHANNELS: Channel[] = TV_GUIDE_DATA.lines.map((l) => ({
  id: l.channel.id,
  name: l.channel.name,
  category: l.channel.category as ChannelCategory,
  img: l.channel.img,
}));
