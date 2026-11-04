/** Rules for merging dashboard-managed content into the public pages. */
import { describe, expect, it } from "vitest";
import {
  dedupeSearchResults,
  managedMovieToMovie,
  managedRef,
  mergedBoxoffice,
  mergedNowPlaying,
  mergedSearch,
  mergedTvGuide,
  allMovies,
  mergedHomeData,
  matchesBuiltinMovie,
  matchesBuiltinPerson,
} from "@/features/content/content";
import { tvGuide } from "@/lib/build";
import type { EcHomeData } from "@/types/home";
import type { ManagedContent } from "@/features/content/content.functions";
import { knownGenreKeys } from "@/lib/genres";

const empty: ManagedContent = {
  movies: [],
  people: [],
  boxoffice: [],
  channels: [],
  programs: [],
  videos: [],
  lists: [],
};

describe("knownGenreKeys", () => {
  it("removes duplicates and genres without translated labels", () => {
    expect(knownGenreKeys(["drama", "drama", "unknown"])).toEqual(["drama"]);
  });
});

const movieRow = {
  id: "abc-123",
  title_en: "Test Movie",
  title_ar: "فيلم تجريبي",
  genre: "action",
  year: 2024,
  release_date: null,
  status: "soon",
  rating: 7.5,
  runtime: 90,
  cert: "",
  director_en: "Dir",
  director_ar: "",
  synopsis_en: "Plot.",
  synopsis_ar: "",
  poster_url: null,
};

const channelRow = {
  id: "ch-1",
  name_en: "My Channel",
  name_ar: "",
  category: "movies",
  logo_url: null,
};
const programRow = {
  id: "pr-1",
  channel_id: "ch-1",
  title_en: "Evening Movie",
  title_ar: "",
  start_min: 1200,
  end_min: 1380,
  meta: "",
};

describe("managed content merge", () => {
  it("managed movies keep the m- public ref and fall back missing fields", () => {
    const movie = managedMovieToMovie(movieRow as never);
    expect(managedRef({ id: "abc-123" })).toBe("m-abc-123");
    expect(movie.id).toBe("m-abc-123");
    expect(movie.status).toBe("soon");
    expect(movie.release).toBe("2024-01-01"); // year used when no release date
    expect(movie.title.ar).toBe("فيلم تجريبي");
    expect(movie.director.ar).toBe("Dir"); // Arabic falls back to English
  });

  it("now playing leads with managed 'now' movies, then the built-in list", () => {
    const staticCount = mergedNowPlaying(empty).length;
    expect(staticCount).toBeGreaterThan(0);
    const nowRow = { ...movieRow, status: "now" };
    const merged = mergedNowPlaying({ ...empty, movies: [nowRow] } as unknown as ManagedContent);
    expect(merged.length).toBe(staticCount + 1);
    expect(merged[0]!.id).toBe("m-abc-123");
    expect(merged.at(-1)!.id).not.toBe("m-abc-123");
  });

  it("managed rows are appended to the box office table", () => {
    const row = {
      id: "bo-1",
      title_en: "Indie Hit",
      title_ar: "",
      weekly_egp: 1500000,
      total_egp: 3000000,
    };
    const merged = mergedBoxoffice({ ...empty, boxoffice: [row] } as unknown as ManagedContent);
    expect(merged[0]!.title.en).toBe("Indie Hit"); // managed rows lead
    expect(merged[0]!.weeklyEgp).toBe(1500000);
    expect(merged[0]!.slug).toBeNull();
  });

  it("managed channels with programs appear in the TV guide grid", () => {
    const guide = mergedTvGuide({
      ...empty,
      channels: [channelRow],
      programs: [programRow],
    } as unknown as ManagedContent);
    const line = guide.lines.at(-1)!;
    expect(line.channel.id).toBe("m-ch-1");
    expect(line.channel.name.en).toBe("My Channel");
    expect(line.slots).toHaveLength(1);
    expect(line.slots[0]!.start).toBe(1200);
    expect(guide.to).toBeGreaterThanOrEqual(1380); // window extends to cover the slot
  });

  it("search includes managed movies and people", () => {
    const personRow = {
      id: "p-1",
      name_en: "Nova Star",
      name_ar: "",
      role_en: "Actor",
      role_ar: "",
      bio: "",
      photo_url: null,
    };
    const results = mergedSearch("nova", {
      ...empty,
      movies: [movieRow],
      people: [personRow],
    } as unknown as ManagedContent);
    expect(results.some((r) => r.type === "person" && r.id === "m-p-1")).toBe(true);
    expect(
      mergedSearch("test", { ...empty, movies: [movieRow] } as ManagedContent).some(
        (r) => r.type === "movie" && r.id === "m-abc-123",
      ),
    ).toBe(true);
  });
});

describe("duplicate rules", () => {
  const scrapedChannel = tvGuide.lines[0]!.channel.name.en;
  const dupeRow = { ...movieRow, title_en: "Clayface", title_ar: "", status: "now" } as never;

  it("a managed movie duplicating a built-in title appears once, as the managed entry", () => {
    const merged = mergedNowPlaying({
      ...empty,
      movies: [{ ...movieRow, status: "now" }, dupeRow],
    } as unknown as ManagedContent);
    const clay = merged.filter((mv) => mv.title.en.toLowerCase() === "clayface");
    expect(clay).toHaveLength(1);
    expect(clay[0]!.id).toBe("m-abc-123");
  });

  it("allMovies keeps the managed (DB) entry when a managed movie copies its title", () => {
    const list = allMovies({ ...empty, movies: [dupeRow] } as unknown as ManagedContent);
    const clay = list.filter((mv) => mv.title.en.toLowerCase() === "clayface");
    expect(clay).toHaveLength(1);
    expect(clay[0]!.id).toBe("m-abc-123");
  });

  it("a managed box-office row overrides a scraped row with the same title", () => {
    const scraped = mergedBoxoffice(empty);
    const scrapedClay = scraped.find((b) => b.title.en.toLowerCase() === "clayface")!;
    const merged = mergedBoxoffice({
      ...empty,
      boxoffice: [
        { id: "bo-x", title_en: "Clayface", title_ar: "", weekly_egp: 999, total_egp: 1000 },
      ],
    } as unknown as ManagedContent);
    const clay = merged.filter((b) => b.title.en.toLowerCase() === "clayface");
    expect(clay).toHaveLength(1);
    expect(clay[0]!.weeklyEgp).toBe(999);
    expect(scrapedClay.weeklyEgp).not.toBe(999);
  });

  it("a managed channel with a scraped channel's name is skipped in the TV guide", () => {
    const dupChannel = { ...channelRow, name_en: scrapedChannel } as never;
    const guide = mergedTvGuide({
      ...empty,
      channels: [dupChannel],
      programs: [programRow],
    } as unknown as ManagedContent);
    const names = guide.lines.map((l) => l.channel.name.en);
    expect(names.filter((n) => n === scrapedChannel)).toHaveLength(1);
    expect(guide.lines.some((l) => l.channel.id === "m-ch-1")).toBe(false);
  });

  it("search never lists the same title twice for one type", () => {
    const results = dedupeSearchResults([
      {
        type: "movie",
        id: "1",
        title: { en: "Clayface", ar: "" },
        sub: { en: "", ar: "" },
        hue: 0,
        img: null,
      },
      {
        type: "movie",
        id: "m-2",
        title: { en: "clayface ", ar: "" },
        sub: { en: "", ar: "" },
        hue: 1,
        img: null,
      },
      {
        type: "person",
        id: "p-1",
        title: { en: "Clayface", ar: "" },
        sub: { en: "", ar: "" },
        hue: 2,
        img: null,
      },
    ] as never);
    expect(results).toHaveLength(2);
  });

  it("the homepage leads rows with managed content and drops duplicate scraped cards", () => {
    const home: EcHomeData = {
      promos: [],
      watchOnline: [],
      tvSummary: [],
      movies: [{ href: "/en/work/1", img: null, title: "Clayface", bookingHref: null }],
      videos: [
        { href: "https://youtu.be/x", img: null, title: "Official Trailer", duration: null },
      ],
      lists: [{ href: "/en/lineup/5", title: "Editor picks this month" }],
      boxoffice: [
        { href: "/en/boxoffice", title: "Desert Horizon", img: null, revenue: "2.0M EGP" },
      ],
      tvGuide: { times: ["11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM"], lines: [] },
      bornToday: { date: "", dateKey: "", href: "", people: [] },
      boxofficeDate: "",
    };
    const merged = mergedHomeData(
      home,
      {
        ...empty,
        movies: [
          { ...movieRow, status: "now" },
          { ...movieRow, id: "dz", title_en: "Desert Horizon", title_ar: "", status: "soon" },
        ] as never,
        boxoffice: [
          {
            id: "bo-1",
            title_en: "Desert Horizon",
            title_ar: "",
            weekly_egp: 1250000,
            total_egp: 0,
          },
        ] as never,
        videos: [
          {
            id: "v-1",
            title_en: "Official Trailer",
            title_ar: "",
            url: "https://youtu.be/y",
            thumb_url: null,
            duration: "2:14",
          },
        ] as never,
        lists: [
          { id: "l-1", title_en: "Editor picks this month", title_ar: "", items: [] },
        ] as never,
        channels: [{ ...channelRow }] as never,
        programs: [{ ...programRow, start_min: 690, end_min: 750 }] as never, // 11:30-12:30 inside the window
      } as unknown as ManagedContent,
      "en",
    );
    expect(merged.movies[0]!.title).toBe("Test Movie"); // managed now-movie leads
    expect(merged.movies.filter((mv) => mv.title === "Clayface")).toHaveLength(1);
    expect(merged.videos[0]!.href).toBe("https://youtu.be/y"); // managed video leads, duplicate scraped dropped
    expect(merged.boxoffice[0]!.href).toContain("/work/m-"); // box-office row links to its managed movie page
    expect(merged.boxoffice[0]!.revenue).toBe("1.3M EGP");
    expect(merged.lists[0]!.href).toContain("/lineup/m-");
    expect(merged.tvGuide.lines).toHaveLength(1); // managed channel line added to the home timeline
    expect(merged.tvGuide.lines[0]!.slots[0]!.left).toBeGreaterThanOrEqual(0);
  });
});

describe("built-in duplicate warnings", () => {
  it("flags titles that exist in the built-in catalogue", () => {
    expect(matchesBuiltinMovie("Clayface")).toBe(true);
    expect(matchesBuiltinMovie("  clayface ")).toBe(true);
    expect(matchesBuiltinMovie("Desert Horizon")).toBe(false);
    expect(matchesBuiltinMovie("")).toBe(false);
  });
  it("flags person names that exist in the built-in people", () => {
    expect(matchesBuiltinPerson("Laila Mansour")).toBe(false);
    expect(matchesBuiltinPerson("")).toBe(false);
  });
});
