/**
 * elcinema.com/en/ homepage scraper (server-only).
 *
 * Parses the live homepage into the sections the replica page renders:
 * promo carousel, cinema movies panel, watch online, TV summary carousel,
 * TV guide grid, elCinema TV videos, lists and box office tables.
 * The page is cached in memory for 10 minutes.
 */
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type {
  EcBoxofficeRow,
  EcHomeData,
  EcListRow,
  EcMovie,
  EcPromo,
  EcTvGuide,
  EcTvLine,
  EcTvSlot,
  EcTvSummaryItem,
  EcVideo,
  EcVod,
  EcWatchOnlineItem,
} from "./home.shared";

const BASE = "https://elcinema.com";
const HOME_PATH = "/en/";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map<string, { data: unknown; expires: number }>();

async function fetchPage(path: string): Promise<string> {
  const key = `page:${path}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data as string;

  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`elcinema request failed [${res.status}] for ${path}`);
  const html = await res.text();
  cache.set(key, { data: html, expires: Date.now() + CACHE_TTL_MS });
  return html;
}

function absUrl(src: string | undefined | null): string | null {
  if (!src) return null;
  const s = src.trim();
  if (!s || s === "https://elcinema.com/en/" || s === `${BASE}/en/`) return null;
  return s.startsWith("http") ? s : `${BASE}${s}`;
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** "Sunday  1 November 04:15  PM" -> "Sunday 1 November 04:15 PM" */
function cleanAirtime(text: string): string {
  return clean(text);
}

function parseVod($el: cheerio.Cheerio<Element>): EcVod | null {
  const $a = $el.find(".cta-vod-icon a").first();
  if (!$a.length) return null;
  return {
    href: $a.attr("href") || "#",
    img: absUrl($a.find("img").attr("src")),
    label: clean($a.find("div").first().text()),
  };
}

function parsePromos($: cheerio.CheerioAPI): EcPromo[] {
  const promos: EcPromo[] = [];
  $(".swiper-default .swiper-slide").each((_, el) => {
    const $s = $(el);
    if ($s.hasClass("swiper-slide-duplicate")) return;
    const $a = $s.find(".slick-caption-wrapper > a").first();
    const img = $s.find(".slick-caption-wrapper img").first();
    promos.push({
      href: $a.attr("href") || `${BASE}/en/`,
      img: absUrl(img.attr("data-src") || img.attr("src")),
      title: clean($s.find("h5.section-title").text()),
      button: clean($s.find("a.button").first().text()) || "More",
    });
  });
  return promos;
}

function parseMovies($: cheerio.CheerioAPI): EcMovie[] {
  const $panel = $(".boxed-purple")
    .filter((_, el) => clean($(el).find("h2.section-title").text()) === "Cinema Movies In Egypt")
    .first();
  const movies: EcMovie[] = [];
  $panel.find(".swiper-slide").each((_, el) => {
    const $s = $(el);
    const img = absUrl(
      $s.find(".thumbnail-wrapper img").attr("data-src") ||
        $s.find(".thumbnail-wrapper img").attr("src"),
    );
    const $title = $s.find("li.title-height a").first();
    if (!$title.length) return;
    movies.push({
      href: $title.attr("href") || "#",
      img,
      title: clean($title.text()),
      bookingHref: $s.find("a.button.orange.minimize").attr("href") || null,
    });
  });
  return movies;
}

function parseWatchOnline($: cheerio.CheerioAPI): EcWatchOnlineItem[] {
  const $h3 = $("h3.section-title")
    .filter((_, el) => clean($(el).text()) === "Watch Online")
    .first();
  if (!$h3.length) return [];
  const $row = $h3.closest(".row");
  const items: EcWatchOnlineItem[] = [];
  $row.find("ul.unstyled").each((_, el) => {
    const $ul = $(el);
    const $grid = $ul.parents("li").eq(1);
    const img = absUrl($grid.find(".thumbnail-wrapper img").attr("src"));
    const $lis = $ul.children("li");
    items.push({
      href: $lis.eq(0).find("a").attr("href") || "#",
      img,
      title: clean($lis.eq(0).find("a").text()),
      meta: clean($lis.eq(1).text()),
      vod: parseVod($lis.eq(2)),
    });
  });
  return items;
}

function parseTvSummary($: cheerio.CheerioAPI): EcTvSummaryItem[] {
  const items: EcTvSummaryItem[] = [];
  $(".boxed-4 .swiper-slide").each((_, el) => {
    const $s = $(el);
    const img = absUrl(
      $s.find(".thumbnail-wrapper img").attr("data-src") ||
        $s.find(".thumbnail-wrapper img").attr("src"),
    );
    const $lis = $s.find("ul.unstyled").first().children("li");
    if (!$lis.length) return;
    const $title = $lis.eq(0).find("a").first();
    const $channel = $lis.filter((__, li) => $(li).find('img[width="35"]').length > 0).first();
    const $channelA = $channel
      .find('a[href*="/tvguide/"]')
      .filter((__, a) => clean($(a).text()).length > 0)
      .first();
    const timeLi = $lis.toArray().find((li) => clean($(li).text()).match(/(AM|PM)/));
    items.push({
      href: $title.attr("href") || "#",
      img,
      title: clean($title.text()),
      channelImg: absUrl(
        $channel.find('img[width="35"]').attr("data-src") ||
          $channel.find('img[width="35"]').attr("src"),
      ),
      channelName: clean($channelA.text()),
      channelHref: $channelA.attr("href") || "#",
      airtime: timeLi ? cleanAirtime($(timeLi).text()) : "",
      vod: parseVod($s.find("ul.unstyled").first()),
    });
  });
  return items;
}

function parseSlot($s: cheerio.Cheerio<Element>): EcTvSlot {
  const cls = ($s.attr("class") || "").split(/\s+/);
  const catMatch = cls.find((c) => /^category-\d+$/.test(c));
  const style = $s.attr("style") || "";
  const width = parseFloat(style.match(/width:\s*([\d.]+)%/)?.[1] || "0");
  const left = parseFloat(style.match(/left:\s*([\d.]+)%/)?.[1] || "0");
  const $lis = $s.find("ul li");
  const $titleA = $lis.eq(0).find("a").first();
  return {
    title: $titleA.length ? clean($titleA.text()) : clean($lis.eq(0).text()),
    titleHref: $titleA.length ? $titleA.attr("href") || null : null,
    meta: clean($lis.eq(1).text()),
    time: clean($lis.eq(2).text()),
    width,
    left,
    unclickable: cls.includes("unclickable"),
    category: catMatch ? parseInt(catMatch.replace("category-", ""), 10) : null,
  };
}

export function parseTvGuide($: cheerio.CheerioAPI): EcTvGuide {
  const $tv = $("#tv-content");
  const times = $(".tv-head .timebar", $tv)
    .map((i, el) =>
      i === 0 ? clean($(el).find(".show-for-medium-up").text()) : clean($(el).text()),
    )
    .get();
  const lines: EcTvLine[] = [];
  $(".tv-line", $tv).each((_, el) => {
    const $line = $(el);
    const $channel = $line.find(".channel").first();
    const $name = $channel.find(".hide-for-small-only a").first();
    lines.push({
      channelImg: absUrl($channel.find("img").attr("data-src") || $channel.find("img").attr("src")),
      channelName: clean($name.text()),
      channelHref: $name.attr("href") || "#",
      slots: $line
        .find(".tv-slot")
        .map((__, s) => parseSlot($(s)))
        .get(),
    });
  });
  return { times, lines };
}

function parseVideos($: cheerio.CheerioAPI): EcVideo[] {
  const videos: EcVideo[] = [];
  $("a.video-wrapper").each((_, el) => {
    const $v = $(el);
    videos.push({
      href: $v.attr("href") || "#",
      img: absUrl($v.find("img").attr("data-src") || $v.find("img").attr("src")),
      title: clean($v.find("span.title").first().text()),
      duration: clean($v.find("span.duration").first().text()).match(/\d{2}:\d{2}/)?.[0] || null,
    });
  });
  return videos;
}

function parseLists($: cheerio.CheerioAPI): EcListRow[] {
  const $h2 = $("h2.section-title")
    .filter((_, el) => clean($(el).find("a").first().text()) === "Lists")
    .first();
  if (!$h2.length) return [];
  const rows: EcListRow[] = [];
  $h2
    .closest(".columns")
    .find("table td a")
    .each((_, a) => {
      rows.push({ href: $(a).attr("href") || "#", title: clean($(a).text()) });
    });
  return rows;
}

function parseBoxoffice($: cheerio.CheerioAPI): { date: string; rows: EcBoxofficeRow[] } {
  const $h2 = $("h2.section-title")
    .filter((_, el) => clean($(el).find("a").first().text()) === "Boxoffice")
    .first();
  if (!$h2.length) return { date: "", rows: [] };
  const $col = $h2.closest(".columns");
  const date = clean($col.find("h6 a").first().text());
  const rows: EcBoxofficeRow[] = [];
  $col.find("table tbody tr").each((_, tr) => {
    const $tds = $(tr).find("td");
    if ($tds.length < 2) return;
    const $title = $tds
      .eq(0)
      .find("a")
      .filter(
        (__, a) => ($(a).attr("href") || "").includes("/work/") && clean($(a).text()).length > 0,
      )
      .first();
    rows.push({
      href: $title.attr("href") || "#",
      title: clean($title.text()),
      img: absUrl($tds.eq(0).find("img").attr("data-src") || $tds.eq(0).find("img").attr("src")),
      revenue: clean($tds.eq(1).text()),
    });
  });
  return { date, rows };
}

export function parseHomePage(html: string): EcHomeData {
  const $ = cheerio.load(html);
  const boxoffice = parseBoxoffice($);
  return {
    promos: parsePromos($),
    movies: parseMovies($),
    watchOnline: parseWatchOnline($),
    tvSummary: parseTvSummary($),
    tvGuide: parseTvGuide($),
    videos: parseVideos($),
    lists: parseLists($),
    boxofficeDate: boxoffice.date,
    boxoffice: boxoffice.rows,
  };
}

export async function getHomePage(): Promise<EcHomeData> {
  const key = `home:${HOME_PATH}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data as EcHomeData;
  const data = parseHomePage(await fetchPage(HOME_PATH));
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
  return data;
}
