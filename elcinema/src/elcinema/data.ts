/**
 * The built-in bilingual dataset, scraped from elcinema.com (both editions)
 * by scripts/scrape-data.ts and transformed by scripts/build-dataset.ts.
 *
 * Everything here is static, client-safe real content: the movies now
 * playing and coming soon in Egypt, the weekly box office, the industry
 * people behind them and a snapshot of the live TV guide grid. Posters,
 * headshots and channel logos resolve through the local asset manifest
 * (src/elcinema/images.ts). To refresh the dataset, re-run the two scripts
 * and re-upload the artwork.
 */
import moviesData from "./data/movies.json";
import peopleData from "./data/people.json";
import boxofficeData from "./data/boxoffice.json";
import genresData from "./data/genres.json";
import tvguideData from "./data/tvguide.json";
import type {
  Bi,
  BoxofficeEntry,
  Channel,
  ChannelCategory,
  Movie,
  Person,
  TvLine,
} from "./home.shared";

export const GENRES = genresData as Record<string, Bi>;

export const MOVIES: Movie[] = moviesData as unknown as Movie[];

export const PEOPLE: Person[] = peopleData as unknown as Person[];

/** Weekly Egypt box office table with its bilingual week label. */
export const BOXOFFICE: BoxofficeEntry[] = (boxofficeData as unknown as { rows: BoxofficeEntry[] })
  .rows;
export const boxofficeDate: Bi = (boxofficeData as { date: Bi }).date;

/** TV guide snapshot: channels + program slots from the live grid. */
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
