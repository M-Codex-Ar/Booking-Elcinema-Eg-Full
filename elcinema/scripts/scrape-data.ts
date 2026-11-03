/**
 * Rebuild the built-in dataset from live elcinema.com pages (both editions).
 *
 * Run manually with `bun run scripts/scrape-data.ts`. Fetches the now-playing
 * and coming-soon lists, every listed work detail page (en + ar), the TV
 * guide grid (en + ar) and the box-office table, then writes staged JSON
 * files and downloads the poster/photo artwork to /tmp/scrape/imgs.
 *
 * The staged output is turned into src/data/*.json plus the images
 * manifest by scripts/build-dataset.ts after the artwork has been uploaded
 * as local assets.
 */
import * as cheerio from "cheerio";
import { mkdir, writeFile, access } from "node:fs/promises";
import { parseHomePage, parseTvGuide } from "../src/home.server";
import { parseWorkPage } from "../src/live.server";
import type { Element } from "domhandler";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const BASE = "https://elcinema.com";
const OUT = "/tmp/scrape/out";
const IMGS = "/tmp/scrape/imgs";

type Lang = "en" | "ar";

async function fetchPage(path: string, attempt = 1): Promise<string> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(30000),
  }).catch((e) => {
    throw new Error(`fetch error ${path}: ${String(e)}`);
  });
  if (res.status === 429 && attempt <= 4) {
    const wait = 15000 * attempt;
    console.log(`429 on ${path} — waiting ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
    return fetchPage(path, attempt + 1);
  }
  if (!res.ok) throw new Error(`fetch failed [${res.status}] ${path}`);
  const html = await res.text();
  await new Promise((r) => setTimeout(r, 700)); // polite pacing
  return html;
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function idFromHref(href: string | undefined | null, kind: string): string | null {
  if (!href) return null;
  const m = href.match(new RegExp(`/${kind}/(\\d+)`));
  return m ? m[1]! : null;
}

function absImg(src: string | undefined | null): string | null {
  if (!src) return null;
  const s = src.trim();
  if (!s || s.includes("blank_photos/")) return null;
  return s.startsWith("http") ? s : `${BASE}${s}`;
}

/** Listing panel: poster + link (+ optional extra li text, e.g. a date). */
function parseListPanel(
  $: cheerio.CheerioAPI,
): { id: string; title: string; poster: string | null; extra: string }[] {
  const rows: { id: string; title: string; poster: string | null; extra: string }[] = [];
  const push = (id: string | null, title: string, poster: string | null, extra: string) => {
    if (!id || !title) return;
    if (rows.some((r) => r.id === id)) return;
    rows.push({ id, title, poster, extra });
  };
  // Homepage style: swiper slides with a title link li.
  $(".boxed-purple .swiper-slide").each((_, el) => {
    const $s = $(el);
    const img = absImg(
      $s.find(".thumbnail-wrapper img").attr("data-src") ||
        $s.find(".thumbnail-wrapper img").attr("src"),
    );
    const $title = $s.find("li.title-height a").first();
    if (!$title.length) return;
    const extra =
      $s
        .find("ul.unstyled li")
        .toArray()
        .map((li) => clean($(li).text()))
        .find((t) => /\b(19|20)\d{2}\b/.test(t) && !/rate|تقييم/i.test(t)) ?? "";
    push(idFromHref($title.attr("href"), "work"), clean($title.text()), img, extra);
  });
  // Now/soon page style: one .row[id^="w"] per movie with an h3 title link.
  $("div[id^='w']").each((_, el) => {
    const $row = $(el);
    const $title = $row.find("h3 a[href*='/work/'], h2 a[href*='/work/']").first();
    if (!$title.length) return;
    const img = absImg(
      $row.find(".thumbnail-wrapper img").attr("data-src") ||
        $row.find(".thumbnail-wrapper img").attr("src"),
    );
    const extra =
      $row
        .find("ul.unstyled li")
        .toArray()
        .map((li) => clean($(li).text()))
        .find((t) => /\b(19|20)\d{2}\b/.test(t) && !/rate|تقييم/i.test(t)) ?? "";
    push(idFromHref($title.attr("href"), "work"), clean($title.text()), img, extra);
  });
  return rows;
}

/** Minutes from "09:30 AM" / "11:00 pm" / "04:15 م" / "12:00 منتصف الليل". */
function minutesFromTime(raw: string): number | null {
  const t = clean(raw);
  const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM|ص|م|منتصف الليل|midnight)?/i);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const suffix = (m[3] ?? "").toLowerCase();
  let h24 = h % 12;
  if (/^(pm|م)$/.test(suffix)) h24 += 12;
  if (/^(midnight|منتصف الليل)$/.test(suffix) && h === 12) h24 = 0;
  if (/^midnight$/.test(suffix) && h === 0) h24 = 0;
  return (h24 % 24) * 60 + min;
}

/** "release_day/11-20/" + "release_year/2026/" -> "2026-11-20". */
function isoFromReleaseLinks(html: string): string {
  const dates: { iso: string; egypt: boolean }[] = [];
  const re = /release_day\/(\d{2})-(\d{2})\/[\s\S]{0,200}?release_year\/(\d{4})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const egyptOffset =
      html.lastIndexOf("(EG)", m.index) > m.index - 400 && html.lastIndexOf("(EG)", m.index) !== -1;
    dates.push({ iso: `${m[3]}-${m[1]}-${m[2]}`, egypt: egyptOffset });
  }
  return (dates.find((d) => d.egypt) ?? dates[0])?.iso ?? "";
}

function parseCert(values: string[]): string {
  for (const v of values) {
    const s = clean(v);
    if (/^\+\d{1,2}$/.test(s)) return s;
    if (/^(G|PG|PG-13|R|NC-17|TV-14|TV-MA|TV-G|TV-PG)$/i.test(s)) return s.toUpperCase();
  }
  return "";
}

function parseRevenue(text: string): { egp: number; text: string } {
  const t = clean(text);
  const digits = t.replace(/[^\d]/g, "");
  return { egp: digits ? Number(digits) : 0, text: t };
}

interface StageMovie {
  id: string;
  status: "now" | "soon";
  listingTitle: string;
  listingPoster: string | null;
  releaseHint: string;
}
interface StageWork {
  id: string;
  en: ReturnType<typeof parseWorkPage> | null;
  ar: ReturnType<typeof parseWorkPage> | null;
  arPersonNames: Record<string, string>;
  arGenres: string[];
  poster: string | null;
  status: "now" | "soon";
  listingExtra: string;
  releaseIso: string;
}
interface StagePerson {
  id: string;
  roles: Set<"actor" | "director" | "writer">;
  movies: Set<string>;
  photo: string | null;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(IMGS, { recursive: true });

  // ------------------------------------------------------------------ lists
  console.log("fetching list pages…");
  const listPaths = [
    "/en/",
    "/en/now/",
    "/en/soon/",
    "/en/boxoffice/",
    "/en/tvguide/",
    "/ar/tvguide/",
    "/ar/",
    "/ar/now/",
    "/ar/soon/",
  ];
  const pages: (string | null)[] = [];
  for (const p of listPaths) {
    try {
      pages.push(await fetchPage(p));
    } catch (e) {
      console.warn(`skipping ${p}: ${String(e)}`);
      pages.push(null);
    }
  }
  const [homeEn, nowEn, soonEn, boEn, tvEn, tvAr, homeAr, nowAr, soonAr] = pages;
  const homeParsed = parseHomePage(homeEn);
  const boxoffice: {
    id: string | null;
    title: string;
    weekly: { egp: number; text: string };
    total: { egp: number; text: string };
    poster: string | null;
  }[] = [];
  {
    const $bo = cheerio.load(boEn ?? homeEn);
    $bo("div[id^='w']").each((_, el) => {
      const $row = $bo(el);
      const $title = $row.find("h3 a[href*='/work/']:not([href*='stats'])").first();
      if (!$title.length) return;
      const revs: string[] = [];
      $row.find("ul.list-separator").each((__, ul) => {
        const $lis = $bo(ul).children("li");
        if (/revenue/i.test(clean($lis.first().text()))) revs.push(clean($lis.eq(1).text()));
      });
      if (!revs.length) return;
      boxoffice.push({
        id: idFromHref($title.attr("href"), "work"),
        title: clean($title.text()),
        weekly: parseRevenue(revs[0] ?? ""),
        total: parseRevenue(revs[1] ?? revs[0] ?? ""),
        poster: absImg(
          $row.find(".thumbnail-wrapper img").attr("data-src") ||
            $row.find(".thumbnail-wrapper img").attr("src"),
        ),
      });
    });
  }
  const boxofficeDate = homeParsed.boxofficeDate;

  const nowList = parseListPanel(cheerio.load(nowEn ?? ""));
  const soonList = parseListPanel(cheerio.load(soonEn ?? ""));
  console.log(`now: ${nowList.length}, soon: ${soonList.length}, boxoffice: ${boxoffice.length}`);

  const arHomeCheerio = cheerio.load(homeAr ?? "");
  const arNow = parseListPanel(arHomeCheerio);
  const arSoon = parseListPanel(cheerio.load(soonAr ?? ""));
  const arTitleByWork = new Map<string, string>();
  for (const row of [...arNow, ...arSoon]) if (row.title) arTitleByWork.set(row.id, row.title);

  // ------------------------------------------------------------- work pages
  const order: StageMovie[] = [
    ...nowList.map((r) => ({
      id: r.id,
      status: "now" as const,
      listingTitle: r.title,
      listingPoster: r.poster,
      releaseHint: r.extra,
    })),
    ...soonList.map((r) => ({
      id: r.id,
      status: "soon" as const,
      listingTitle: r.title,
      listingPoster: r.poster,
      releaseHint: r.extra,
    })),
  ];
  for (const row of boxoffice) {
    if (row.id && !order.some((m) => m.id === row.id)) {
      order.push({
        id: row.id,
        status: "now",
        listingTitle: row.title,
        listingPoster: row.poster,
        releaseHint: "",
      });
    }
  }
  const boPosterById = new Map(boxoffice.map((b) => [b.id ?? "", b.poster]));
  const uniqueMovies = order.filter((m, i) => order.findIndex((x) => x.id === m.id) === i);
  console.log(`fetching ${uniqueMovies.length * 2} work pages…`);

  const people = new Map<string, StagePerson>();
  const ensurePerson = (
    id: string,
    role: "actor" | "director" | "writer",
    movieId: string,
  ): StagePerson => {
    let p = people.get(id);
    if (!p) {
      p = { id, roles: new Set(), movies: new Set(), photo: null };
      people.set(id, p);
    }
    p.roles.add(role);
    p.movies.add(movieId);
    return p;
  };

  const works: StageWork[] = [];
  for (const movie of uniqueMovies) {
    const enHtml = await fetchPage(`/en/work/${movie.id}/`);
    const en = parseWorkPage(enHtml, "en", movie.id);
    const arHtml = await fetchPage(`/ar/work/${movie.id}/`);
    const ar = parseWorkPage(arHtml, "ar", movie.id);

    // Arabic names for every person linked on the ar page (heading-agnostic).
    const $ar = cheerio.load(arHtml);
    const arPersonNames: Record<string, string> = {};
    $ar("a[href*='/person/']").each((_, a) => {
      const pid = idFromHref($ar(a).attr("href"), "person");
      const name = clean($ar(a).text());
      if (pid && name && !arPersonNames[pid]) arPersonNames[pid] = name;
    });
    const arGenres: string[] = [];
    $ar("a[href*='/genre/']").each((_, a) => {
      const g = clean($ar(a).text());
      if (g && !arGenres.includes(g)) arGenres.push(g);
    });

    for (const d of en.director) ensurePerson(d.id, "director", movie.id);
    for (const w of en.writers) ensurePerson(w.id, "writer", movie.id);
    en.cast.slice(0, 6).forEach((c) => {
      const p = ensurePerson(c.id, "actor", movie.id);
      if (c.img && c.img.includes("/uploads/")) p.photo = c.img;
    });

    works.push({
      id: movie.id,
      en,
      ar,
      arPersonNames,
      arGenres,
      poster: en.poster ?? movie.listingPoster,
      status: movie.status,
      listingExtra: movie.releaseHint,
      releaseIso: isoFromReleaseLinks(enHtml),
    });
    if (ar.title) arTitleByWork.set(movie.id, ar.title);
  }

  // ------------------------------------------------------------------ guide
  console.log("parsing TV guide…");
  const guideEn = parseTvGuide(cheerio.load(tvEn ?? ""));
  const guideAr = parseTvGuide(cheerio.load(tvAr ?? ""));
  const arChannelName = new Map<string, string>();
  guideAr.lines.forEach((l) => {
    const id = idFromHref(l.channelHref, "tvguide") ?? l.channelHref;
    if (l.channelName) arChannelName.set(id, l.channelName);
  });

  // ------------------------------------------------------------------ people details
  // Cap people: directors/writers first, then most-frequent actors.
  const all = [...people.values()];
  const keep = new Set<string>();
  for (const p of all) if (p.roles.has("director") || p.roles.has("writer")) keep.add(p.id);
  const actors = all.filter((p) => !keep.has(p.id)).sort((a, b) => b.movies.size - a.movies.size);
  for (const p of actors.slice(0, Math.max(0, 60 - keep.size))) keep.add(p.id);
  for (const p of all) if (!keep.has(p.id)) people.delete(p.id);

  // Directors and writers usually carry no photo on the work page — fetch
  // their person pages for a headshot.
  const needPhoto = [...people.values()].filter((p) => !p.photo);
  console.log(`fetching ${needPhoto.length} person pages for photos…`);
  for (const p of needPhoto) {
    try {
      const html = await fetchPage(`/en/person/${p.id}/`);
      const $ = cheerio.load(html);
      const img =
        absImg($(".button-group-vertical img").first().attr("src")) ??
        absImg($(".thumbnail-wrapper img").first().attr("src"));
      if (img) p.photo = img;
    } catch (e) {
      console.warn(`person page failed ${p.id}: ${String(e)}`);
    }
  }

  // ------------------------------------------------------------------ images
  console.log("collecting image downloads…");
  const images = new Map<string, string>(); // url -> filename
  let imgCounter = 0;
  const imgKey = (url: string | null): string | null => {
    if (!url) return null;
    const existing = images.get(url);
    if (existing) return existing;
    const ext = /\.png(\?|$)/.test(url) ? ".png" : ".jpg";
    const kind = url.includes("/vod_platforms/")
      ? "vod"
      : url.includes("/tvguide/")
        ? "ch"
        : url.includes("150x200")
          ? "p"
          : "w";
    const name = `${kind}-${String(++imgCounter).padStart(3, "0")}${ext}`;
    images.set(url, name);
    return name;
  };
  for (const w of works) imgKey(w.poster);
  for (const p of people.values()) imgKey(p.photo);
  for (const line of guideEn.lines) imgKey(line.channelImg);

  const urls = [...images.keys()];
  console.log(`downloading ${urls.length} images…`);
  for (const url of urls) {
    const name = images.get(url)!;
    let ok = false;
    for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
      try {
        await access(`${IMGS}/${name}`);
        ok = true;
      } catch {
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": UA },
            signal: AbortSignal.timeout(30000),
          });
          if (res.status === 429) throw new Error("429");
          if (!res.ok) throw new Error(String(res.status));
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length < 500) throw new Error(`too small: ${buf.length}`);
          await writeFile(`${IMGS}/${name}`, buf);
          ok = true;
        } catch (e) {
          if (attempt < 4) await new Promise((r) => setTimeout(r, 6000 * attempt));
          else console.error("image failed", url, String(e));
        }
      }
    }
    if (!ok) images.delete(url);
    await new Promise((r) => setTimeout(r, 300));
  }

  // ------------------------------------------------------------------ staged JSON
  const stage = {
    scrapedAt: new Date().toISOString(),
    boxofficeDate,
    boxoffice: boxoffice.map((b) => ({
      id: b.id,
      titleEn: b.title,
      titleAr: b.id ? (arTitleByWork.get(b.id) ?? null) : null,
      weeklyEgp: b.weekly.egp,
      totalEgp: b.total.egp,
    })),
    homeBoxofficeCount: homeParsed.boxoffice.length,
    works: works.map((w) => ({
      id: w.id,
      status: w.status,
      releaseIso: w.releaseIso,
      poster: w.poster ? (images.get(w.poster) ?? null) : null,
      en: w.en,
      arTitle: w.ar?.title ?? null,
      arAlt: w.en?.altTitle ?? null,
      arSynopsis: w.ar?.synopsis ?? null,
      arGenres: w.arGenres,
      arPersonNames: w.arPersonNames,
      arShowtimes: w.ar?.showtimes ?? [],
      arCountry: w.ar?.country ?? null,
    })),
    people: [...people.values()].map((p) => ({
      id: p.id,
      roles: [...p.roles],
      movies: [...p.movies],
      photo: p.photo ? (images.get(p.photo) ?? null) : null,
    })),
    guide: {
      times: guideEn.times,
      lines: guideEn.lines.map((l) => {
        const cid = idFromHref(l.channelHref, "tvguide") ?? l.channelHref;
        return {
          channelHref: l.channelHref,
          channelId: cid,
          channelNameEn: l.channelName,
          channelNameAr: arChannelName.get(cid) ?? null,
          channelImg: l.channelImg ? (images.get(l.channelImg) ?? null) : null,
          slots: l.slots,
        };
      }),
      arLines: guideAr.lines.map((l) => ({ channelHref: l.channelHref, slots: l.slots })),
    },
    images: [...images.entries()].map(([url, name]) => ({ url, name })),
  };
  await writeFile(`${OUT}/stage.json`, JSON.stringify(stage, null, 1));
  console.log(
    `wrote ${OUT}/stage.json — works: ${works.length}, people: ${people.size}, images: ${images.size}, guide lines: ${guideEn.lines.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
