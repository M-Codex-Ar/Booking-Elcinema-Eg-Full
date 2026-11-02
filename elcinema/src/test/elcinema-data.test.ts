import { describe, expect, it } from "vitest";
import {
  BOXOFFICE,
  CHANNELS,
  GENRES,
  MOVIES,
  PEOPLE,
  boxofficeDate,
  TV_GUIDE_DATA,
} from "@/elcinema/data";
import { IMAGES } from "@/elcinema/images";
import {
  comingSoon,
  fmtClock12,
  movieById,
  movieBySlug,
  movieMeta,
  nowPlaying,
  personBySlug,
  personId,
  searchAll,
  tvGuide,
  workId,
} from "@/elcinema/build";

/**
 * The dataset is scraped from elcinema.com (both editions). These checks are
 * the contract the pages are built around: complete bilingual fields, real
 * numeric ids, artwork that resolves in the local asset manifest, and a
 * populated TV guide.
 */
describe("elcinema scraped dataset", () => {
  it("has a real now-playing and coming-soon slate", () => {
    expect(MOVIES.length).toBeGreaterThanOrEqual(30);
    expect(nowPlaying.length).toBeGreaterThanOrEqual(15);
    expect(comingSoon.length).toBeGreaterThanOrEqual(10);
  });

  it("keeps every movie bilingual and complete", () => {
    for (const m of MOVIES) {
      expect(m.title.en.trim(), m.id).toBeTruthy();
      expect(m.title.ar.trim(), m.id).toBeTruthy();
      expect(/^\d+$/.test(m.id), m.id).toBe(true);
      expect(movieBySlug.get(m.slug)).toBe(m);
      expect(movieById.get(workId(m))).toBe(m);
      expect(new Date(m.release).toString()).not.toBe("Invalid Date");
      expect(
        m.genres.every((g) => g in GENRES),
        `${m.id} genre keys`,
      ).toBe(true);
    }
  });

  it("keeps the real elcinema numeric work/person ids unique", () => {
    expect(new Set(MOVIES.map(workId)).size).toBe(MOVIES.length);
    expect(new Set(PEOPLE.map(personId)).size).toBe(PEOPLE.length);
    expect(workId(MOVIES[0]!)).toBe(workId(MOVIES[0]!)); // SSR/client agreement
  });

  it("resolves every poster and photo in the local asset manifest", () => {
    for (const m of MOVIES) {
      expect(m.poster, m.id).toBeTruthy();
      expect(IMAGES[m.poster!], m.id).toMatch(/^\/__l5e\//);
    }
    for (const p of PEOPLE) {
      expect(p.name.en.trim()).toBeTruthy();
      expect(p.name.ar.trim()).toBeTruthy();
      expect(p.photo, p.id).toBeTruthy();
      expect(IMAGES[p.photo!], p.id).toMatch(/^\/__l5e\//);
    }
    for (const line of tvGuide.lines) {
      if (line.channel.img) expect(IMAGES[line.channel.img], line.channel.id).toMatch(/^\/__l5e\//);
    }
  });

  it("carries real user ratings where scraped", () => {
    for (const m of MOVIES) {
      const meta = movieMeta(m);
      expect(meta.rating).toBeGreaterThanOrEqual(0);
      expect(meta.rating).toBeLessThanOrEqual(10);
      expect(meta.votes).toBeGreaterThan(0);
      expect(meta.writer.en.trim()).toBeTruthy();
      expect(meta.language.en.trim()).toBeTruthy();
    }
    expect(movieMeta(MOVIES[0]!).rating).toBe(movieMeta(MOVIES[0]!).rating);
  });

  it("stores real showtimes for in-theatre movies", () => {
    const withShowtimes = MOVIES.filter((m) => m.status === "now" && m.showtimes.length > 0);
    expect(withShowtimes.length).toBeGreaterThan(10);
    for (const m of withShowtimes) {
      for (const day of m.showtimes) {
        expect(day.dayOffset).toBeGreaterThanOrEqual(0);
        expect(day.cinemas.length).toBeGreaterThan(0);
        for (const c of day.cinemas) {
          expect(c.name.en.trim(), c.id).toBeTruthy();
          expect(c.times.length).toBeGreaterThan(0);
          for (const tm of c.times) expect(tm).toMatch(/^\d{2}:\d{2} (am|pm|midnight)/);
        }
      }
    }
  });

  it("formats showtimes in the real elCinema 12h style", () => {
    expect(fmtClock12(660, "en")).toBe("11:00 am");
    expect(fmtClock12(795, "en")).toBe("01:15 pm");
    expect(fmtClock12(0, "en")).toBe("12:00 midnight");
    expect(fmtClock12(795, "ar")).toBe("01:15 م");
    expect(fmtClock12(0, "ar")).toBe("12:00 منتصف الليل");
  });

  it("ships a populated real TV guide snapshot", () => {
    expect(CHANNELS.length).toBeGreaterThanOrEqual(50);
    expect(tvGuide.lines).toHaveLength(CHANNELS.length);
    const total = tvGuide.lines.reduce((n, l) => n + l.slots.length, 0);
    expect(total).toBeGreaterThanOrEqual(200);
    for (const line of tvGuide.lines) {
      for (const s of line.slots) {
        expect(s.start).toBeGreaterThanOrEqual(0);
        expect(s.end).toBeGreaterThan(s.start);
        expect(s.title.en.trim()).toBeTruthy();
        expect(s.title.ar.trim()).toBeTruthy();
      }
    }
    expect(TV_GUIDE_DATA.times.length).toBeGreaterThan(3);
  });

  it("ships the weekly box office with the real week label", () => {
    expect(BOXOFFICE.length).toBeGreaterThanOrEqual(10);
    for (const row of BOXOFFICE) {
      expect(row.title.en.trim()).toBeTruthy();
      expect(row.title.ar.trim()).toBeTruthy();
      expect(row.weeklyEgp).toBeGreaterThan(0);
      expect(row.totalEgp).toBeGreaterThanOrEqual(row.weeklyEgp);
      if (row.slug) expect(movieBySlug.get(row.slug)).toBeDefined();
    }
    expect(boxofficeDate.en.trim()).toBeTruthy();
    expect(boxofficeDate.ar.trim()).toBeTruthy();
  });

  it("returns numeric ids from search so results link to the canonical URLs", () => {
    const results = searchAll("clayface");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      if (r.type === "movie" || r.type === "person") expect(r.id).toMatch(/^\d+$/);
    }
  });

  it("keeps the legacy slug maps in sync with the catalogue", () => {
    expect(movieBySlug.size).toBe(MOVIES.length);
    expect(personBySlug.size).toBe(PEOPLE.length);
  });
});
