/** Turns /tmp/scrape/out/stage.json into the local dataset JSON files. */
import { readFile, writeFile, mkdir } from "node:fs/promises";

const stage = JSON.parse(await readFile("/tmp/scrape/out/stage.json", "utf8"));

// --------------------------------------------------------------- helpers
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const KNOWN_GENRE_KEYS: Record<string, string> = {
  "science-fiction": "scifi",
};
function hueFor(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}
function minutesFromTime(raw: string): number | null {
  const t = String(raw).replace(/\s+/g, " ").trim();
  const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM|ص|م|منتصف الليل|midnight)?/i);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const suffix = (m[3] ?? "").toLowerCase();
  let h24 = h % 12;
  if (/^(pm|م)$/.test(suffix)) h24 += 12;
  return (h24 % 24) * 60 + min;
}
function parseCert(values: string[]): string {
  for (const v of values) {
    const s = String(v).trim();
    // Censorship entries are "Body: value" (e.g. "MPAA: +18"); test the value.
    const val = s.includes(":") ? s.slice(s.indexOf(":") + 1).trim() : s;
    if (/^\+\d{1,2}$/.test(val)) return val;
    if (/^(G|PG|PG-13|R|NC-17|TV-14|TV-MA|TV-G|TV-PG)$/i.test(val)) return val.toUpperCase();
  }
  return "";
}
const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
const scrapedDate = new Date(stage.scrapedAt);
/** "Monday 02" -> day offset from the scrape date (0 = today). */
function dayOffset(label: string): number | null {
  const m = label.match(/^([A-Za-z]+)\s+(\d{1,2})/);
  if (!m || !(m[1]!.toLowerCase() in WEEKDAYS)) return null;
  const d = new Date(scrapedDate);
  d.setDate(
    scrapedDate.getDate() + ((WEEKDAYS[m[1]!.toLowerCase()]! - scrapedDate.getDay() + 7) % 7),
  );
  if (Number(m[2]) !== d.getDate()) return null;
  return Math.round(
    (d.getTime() -
      new Date(
        scrapedDate.getFullYear(),
        scrapedDate.getMonth(),
        scrapedDate.getDate(),
      ).getTime()) /
      86400000,
  );
}

// --------------------------------------------------------------- genres
interface Bi {
  en: string;
  ar: string;
}
const genres: Record<string, Bi> = {};
const genreKeyOf = new Map<string, string>(); // en label -> key
for (const w of stage.works) {
  const enGenres: string[] = w.en?.genres ?? [];
  const arGenres: string[] = w.arGenres ?? [];
  enGenres.forEach((en, i) => {
    const key = KNOWN_GENRE_KEYS[slugify(en)] ?? slugify(en);
    genreKeyOf.set(en, key);
    const ar = arGenres[i] ?? genres[key]?.ar ?? en;
    if (!genres[key] || (genres[key]!.ar === genres[key]!.en && ar !== en))
      genres[key] = { en, ar };
  });
}
// Seed the rest of the previous genre dictionary so filters stay stable.
const SEED_GENRES: Record<string, Bi> = {
  action: { en: "Action", ar: "أكشن" },
  adventure: { en: "Adventure", ar: "مغامرات" },
  animation: { en: "Animation", ar: "رسوم متحركة" },
  comedy: { en: "Comedy", ar: "كوميدي" },
  crime: { en: "Crime", ar: "جريمة" },
  documentary: { en: "Documentary", ar: "وثائقي" },
  drama: { en: "Drama", ar: "دراما" },
  family: { en: "Family", ar: "عائلي" },
  fantasy: { en: "Fantasy", ar: "فانتازيا" },
  horror: { en: "Horror", ar: "رعب" },
  musical: { en: "Musical", ar: "غنائي" },
  mystery: { en: "Mystery", ar: "غموض" },
  romance: { en: "Romance", ar: "رومانسي" },
  scifi: { en: "Science Fiction", ar: "خيال علمي" },
  sports: { en: "Sports", ar: "رياضي" },
  thriller: { en: "Thriller", ar: "تشويق وإثارة" },
};
for (const [k, v] of Object.entries(SEED_GENRES)) if (!genres[k]) genres[k] = v;
await writeFile("src/elcinema/data/genres.json", JSON.stringify(genres, null, 1) + "\n");

// --------------------------------------------------------------- movies
const roleAr: Record<string, string> = {
  director: "مخرج",
  actor: "ممثل",
  writer: "كاتب",
  actor_f: "ممثلة",
};
interface RawWork {
  id: string;
  status: "now" | "soon";
  poster: string | null;
  releaseIso: string;
  en:
    | null
    | (Record<string, unknown> & {
        title: string;
        altTitle: string | null;
        year: string | null;
        rating: number | null;
        votes: number | null;
        category: string | null;
        country: string | null;
        runtimeMinutes: number | null;
        censorship: string[];
        genres: string[];
        synopsis: string | null;
        director: { id: string; title: string }[];
        writers: { id: string; title: string }[];
        cast: { id: string; title: string }[];
        vod: { label: string; note: string; href: string }[];
        showtimes: {
          day: string;
          cinemas: { id: string; name: string; times: string[]; bookingHref: string | null }[];
        }[];
      });
  arTitle: string | null;
  arSynopsis: string | null;
  arPersonNames: Record<string, string>;
  arCountry: string | null;
}
function bi(id: string, names: Record<string, string>): Bi {
  return { en: names.en!, ar: names.ar ?? names.en! };
}
const movies = (stage.works as RawWork[]).map((w) => {
  const en = w.en!;
  const personNames = (id: string, enName: string): Bi => ({
    en: enName,
    ar: w.arPersonNames[id] ?? enName,
  });
  const director = en.director[0]
    ? bi(0, { en: en.director[0].title, ar: w.arPersonNames[en.director[0].id] })
    : { en: "", ar: "" };
  const writers = en.writers.map((x) => personNames(x.id, x.title));
  const cast = en.cast.slice(0, 6).map((c) => personNames(c.id, c.title));
  // Arabic cinema names + Arabic VOD notes, merged from the ar edition.
  const arCinemaName = new Map<string, string>();
  (w.ar?.showtimes ?? []).forEach((day) =>
    day.cinemas.forEach((c) => {
      if (!arCinemaName.has(c.id)) arCinemaName.set(c.id, c.name);
    }),
  );
  const arVodNote = new Map<string, string>();
  (w.ar?.vod ?? []).forEach((v) => {
    if (!arVodNote.has(v.href)) arVodNote.set(v.href, v.note);
  });
  const showtimes = (en.showtimes ?? [])
    .map((day) => ({
      dayOffset: dayOffset(day.day),
      label: day.day,
      cinemas: day.cinemas.map((c) => ({
        id: c.id,
        name: { en: c.name, ar: arCinemaName.get(c.id) ?? c.name },
        times: c.times,
        bookingHref: c.bookingHref,
      })),
    }))
    .filter((d) => d.dayOffset !== null);
  return {
    id: w.id,
    slug: w.id,
    title: { en: en.title, ar: w.arTitle ?? en.title },
    synopsis: { en: en.synopsis ?? "", ar: w.arSynopsis ?? en.synopsis ?? "" },
    genres: (en.genres ?? []).map((g) => genreKeyOf.get(g) ?? slugify(g)),
    director,
    writers,
    cast,
    castIds: en.cast.slice(0, 6).map((c) => c.id),
    runtime: en.runtimeMinutes ?? 0,
    cert: parseCert(en.censorship ?? []),
    release: w.releaseIso || (en.year ? `${en.year}-12-31` : ""),
    status: w.status,
    year: en.year ?? "",
    country: { en: en.country ?? "", ar: w.arCountry ?? en.country ?? "" },
    hue: hueFor(w.id),
    poster: w.poster,
    rating: en.rating ?? null,
    votes: en.votes ?? null,
    vod: (en.vod ?? []).map((v) => ({
      label: v.label,
      note: { en: v.note, ar: arVodNote.get(v.href) ?? v.note },
      href: v.href,
      img: v.img ?? null,
    })),
    showtimes,
  };
});
await writeFile("src/elcinema/data/movies.json", JSON.stringify(movies, null, 1) + "\n");

// --------------------------------------------------------------- people
const people = (
  stage.people as { id: string; roles: string[]; movies: string[]; photo: string | null }[]
).map((p) => {
  const nameEn =
    stage.works.flatMap((w: RawWork) =>
      [...(w.en?.director ?? []), ...(w.en?.writers ?? []), ...(w.en?.cast ?? [])]
        .filter((r: { id: string; title: string }) => r.id === p.id)
        .map((r: { id: string; title: string }) => r.title),
    )[0] ?? p.id;
  const nameAr =
    stage.works.flatMap((w: RawWork) => [w.arPersonNames[p.id]]).find(Boolean) ?? nameEn;
  const role = p.roles.includes("director")
    ? "director"
    : p.roles.includes("writer")
      ? "writer"
      : "actor";
  return {
    id: p.id,
    slug: p.id,
    name: { en: nameEn, ar: nameAr },
    role: {
      en: role === "director" ? "Director" : role === "writer" ? "Writer" : "Actor",
      ar: roleAr[role] ?? "ممثل",
    },
    knownFor: p.movies,
    photo: p.photo,
  };
});
await writeFile("src/elcinema/data/people.json", JSON.stringify(people, null, 1) + "\n");

// --------------------------------------------------------------- box office
const MONTHS_EN: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};
const bd = String(stage.boxofficeDate).match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
const boxofficeDateBi: Bi = bd
  ? {
      en: stage.boxofficeDate,
      ar: `${bd[1]} ${["", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"][MONTHS_EN[bd[2]!.toLowerCase()] ?? 1]} ${bd[3]}`,
    }
  : { en: stage.boxofficeDate, ar: stage.boxofficeDate };
const boxoffice = {
  date: boxofficeDateBi,
  rows: (
    stage.boxoffice as {
      id: string | null;
      titleEn: string;
      titleAr: string | null;
      weeklyEgp: number;
      totalEgp: number;
    }[]
  ).map((r) => ({
    slug: r.id,
    title: { en: r.titleEn, ar: r.titleAr ?? r.titleEn },
    weeklyEgp: r.weeklyEgp,
    totalEgp: r.totalEgp,
  })),
};
await writeFile("src/elcinema/data/boxoffice.json", JSON.stringify(boxoffice, null, 1) + "\n");

// --------------------------------------------------------------- TV guide
const catOf = (meta: string, category: number | null): string => {
  const m = meta.toLowerCase();
  if (m.startsWith("movie") || m.includes("فيلم")) return "movies";
  if (m.startsWith("series") || m.includes("مسلسل")) return "series";
  if (m.includes("cartoon") || m.includes("كرتون")) return "kids";
  if (m.includes("news") || m.includes("أخبار") || m.includes("نشرة")) return "news";
  if (m.includes("sport") || m.includes("مباراة") || m.includes("رياض")) return "sports";
  if (m.includes("documentary") || m.includes("وثائقي")) return "documentary";
  if (category !== null)
    return (
      ["general", "movies", "series", "news", "sports", "kids", "music", "documentary", "religion"][
        category % 9
      ] ?? "general"
    );
  return "general";
};
const arLineByChannel = new Map<string, { slots: { title: string }[] }>();
for (const l of stage.guide.arLines) {
  const id = String(l.channelHref).match(/(\d+)/)?.[1] ?? l.channelHref;
  arLineByChannel.set(id, l);
}
const guideLines = stage.guide.lines.map(
  (l: {
    channelId: string;
    channelNameEn: string;
    channelNameAr: string | null;
    channelImg: string | null;
    slots: {
      title: string;
      titleHref: string | null;
      meta: string;
      time: string;
      category: number | null;
    }[];
  }) => {
    const arLine = arLineByChannel.get(String(l.channelId).match(/\d+/)?.[0] ?? l.channelId);
    const categories = l.slots.map((s) => catOf(s.meta, s.category));
    const category =
      categories.sort(
        (a, b) =>
          categories.filter((c) => c === b).length - categories.filter((c) => c === a).length,
      )[0] ?? "general";
    const slots = l.slots
      .map((s, i) => {
        const metaM = s.meta.match(/^([^–—-]+)[–—-]([^–—-]+)$/);
        let start = minutesFromTime(metaM?.[1] ?? s.time);
        let end = minutesFromTime(metaM?.[2] ?? "");
        if (start === null) start = minutesFromTime(s.time);
        if (start !== null && end === null) end = start + 60;
        if (start !== null && end !== null && end <= start)
          end += 1440 * Math.ceil((start + 1 - end) / 1440);
        return {
          title: { en: s.title, ar: arLine?.slots?.[i]?.title ?? s.title },
          href: s.titleHref,
          meta: s.meta,
          start,
          end,
        };
      })
      .filter((s) => s.start !== null && s.end !== null);
    return {
      channel: {
        id: l.channelId,
        name: { en: l.channelNameEn, ar: l.channelNameAr ?? l.channelNameEn },
        category,
        img: l.channelImg,
      },
      slots,
    };
  },
);
const allSlots = guideLines.flatMap((l: { slots: { start: number; end: number }[] }) => l.slots);
const from = Math.floor(Math.min(...allSlots.map((s) => s.start)) / 60) * 60;
const to = Math.ceil(Math.max(...allSlots.map((s) => s.end)) / 60) * 60;
const times: number[] = [];
for (let t = from; t < to; t += 30) times.push(t % 1440);
const tvguide = { from, to, times, lines: guideLines };
await mkdir("src/elcinema/data", { recursive: true });
await writeFile("src/elcinema/data/tvguide.json", JSON.stringify(tvguide, null, 1) + "\n");

console.log(
  `dataset written: ${movies.length} movies, ${people.length} people, ${boxoffice.rows.length} boxoffice rows, ${guideLines.length} channels, slots ${allSlots.length}, window ${from}-${to}`,
);
