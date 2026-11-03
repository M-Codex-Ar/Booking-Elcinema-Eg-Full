/**
 * Live elcinema.com scrapers for the pages beyond the homepage (server-only):
 * work/person details, video gallery + video page, VOD platform guide,
 * featured lists and booking showtimes, plus the static content pages
 * (About, Contact, Advertise, Privacy, Terms). Mirrors the approach of
 * home.server.ts: fetch with a browser UA, parse with cheerio, cache in
 * memory for 10 minutes. All returned values are plain, SSR-serializable
 * DTOs declared in live.shared.ts.
 */
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { Lang } from "@/types/home";
import type {
  LiveLineupDetail,
  LiveLineupIndex,
  LiveLineupList,
  LivePerson,
  LiveRef,
  LiveStaticBlock,
  LiveStaticPage,
  LiveStaticSection,
  LiveVideo,
  LiveVideoCard,
  LiveVideoGallery,
  LiveVodGuide,
  LiveWork,
} from "@/types/live";
import { pickArtwork, toArtworkUrl } from "@/types/media";

const BASE = "https://elcinema.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map<string, { data: unknown; expires: number }>();

async function fetchPage(path: string): Promise<string> {
  const key = `live:${path}`;
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

type $Html = cheerio.CheerioAPI;
type $El = cheerio.Cheerio<Element>;

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Plain URL references (og:image, absolute hrefs already resolved) go through
 * the shared rule; lazy `<img>` tags use `pickArtwork`, which also reads
 * `data-src`/`srcset` — elcinema renders `src=""` for anything lazy.
 */
function absUrl(src: string | undefined | null): string | null {
  return toArtworkUrl(src, BASE);
}

/** Numeric elcinema id from an href segment, e.g. "/en/work/2099119/" -> "2099119". */
function idFromHref(href: string | undefined | null, kind: string): string | null {
  if (!href) return null;
  const m = href.match(new RegExp(`/${kind}/(\\d+)`));
  return m ? m[1]! : null;
}

/**
 * The content column that follows a section heading. elcinema lays sections
 * out as `<div class="columns large-2"><h3 class="section-title">X</h3></div>
 * <div class="columns large-10">content</div>`.
 */
function sectionContent($: $Html, heading: RegExp): $El | null {
  let found: $El | null = null;
  $("h2.section-title, h3.section-title").each((_, el) => {
    if (found) return;
    if (heading.test(clean($(el).text()))) {
      const next = $(el).parent().next(".columns");
      if (next.length) found = next;
    }
  });
  return found;
}

/** Video cards (`a.video-wrapper`) inside a scope. */
function parseVideoCards($: $Html, scope: $El): LiveVideoCard[] {
  const cards: LiveVideoCard[] = [];
  scope.find("a.video-wrapper").each((_, el) => {
    const $a = $(el);
    const id = idFromHref($a.attr("href"), "video");
    if (!id) return;
    cards.push({
      id,
      title:
        clean($a.find("span.title").first().text()) ||
        $a.attr("title")?.split("\n")[0]?.trim() ||
        "",
      duration: clean($a.find("span.duration").first().text()).match(/\d{1,2}:\d{2}/)?.[0] ?? null,
      img: pickArtwork($a.find("img"), BASE),
    });
  });
  return cards;
}

/** Watch-online play buttons (`cta-vod-icon`) inside a scope. */
function parseVodButtons($: $Html, scope: $El): LiveWork["vod"] {
  const out: LiveWork["vod"] = [];
  scope.find(".cta-vod-icon a").each((_, el) => {
    const $a = $(el);
    const href = $a.attr("href");
    if (!href) return;
    const title = $a.attr("title") || "";
    // "Watch X Movie Online on youtube" -> platform label after " on "
    const label = / on (.+)$/i.exec(title)?.[1] ?? "stream";
    out.push({
      label,
      note: clean($a.find("div").first().text()),
      href: href.startsWith("http") ? href : `${BASE}${href}`,
      img: pickArtwork($a.find("img"), BASE),
    });
  });
  return out;
}

/** Photo links (`/gallery/<id>/`) inside a scope. */
function parsePhotos($: $Html, scope: $El): { href: string; img: string | null }[] {
  const out: { href: string; img: string | null }[] = [];
  scope.find("a[href*='/gallery/']").each((_, el) => {
    const $a = $(el);
    const img = pickArtwork($a.find("img"), BASE);
    const href = $a.attr("href");
    if (img && href) out.push({ href: href.startsWith("http") ? href : `${BASE}${href}`, img });
  });
  return out;
}

/** Title spans carry dir="ltr"/"rtl"; the edition's own title matches its script. */
function titlesFromH1($: $Html, lang: Lang): { title: string; alt: string | null } {
  const ltr = clean($("h1 span[dir='ltr']").first().text());
  const rtl = clean($("h1 span[dir='rtl']").first().text());
  if (ltr || rtl) {
    if (lang === "ar") return { title: rtl || ltr, alt: ltr || null };
    return { title: ltr || rtl, alt: rtl || null };
  }
  // Person h1s have no dir attributes: the edition's title comes first,
  // the other edition's title second (the year span is ignored).
  const spans = $("h1 span")
    .map((_, el) => clean($(el).text()))
    .get()
    .filter((s) => s && !/^\(\d{4}\)$/.test(s));
  return { title: spans[0] ?? "", alt: spans[1] ?? null };
}

function yearFromH1($: $Html): string | null {
  return clean($("h1").text()).match(/\((\d{4})\)/)?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Work detail
// ---------------------------------------------------------------------------

export function parseWorkPage(html: string, lang: Lang, id: string): LiveWork {
  const $ = cheerio.load(html);
  const { title, alt } = titlesFromH1($, lang);
  const poster = pickArtwork($(".button-group-vertical img").first(), BASE);

  // Rating box: number in the stars widget, votes in the stats link title.
  const ratingText = clean($("div[class*='stars-orange'] div").first().text());
  const rating = ratingText ? Number(ratingText) || null : null;
  const statsTitle = $("a[href*='/stats']").first().attr("title") || "";
  const votesMatch =
    statsTitle.match(/عدد\s*([\d,]+)/) ?? statsTitle.match(/([\d,]+)\s*(?:votes|صوت)/i);
  const votes = votesMatch ? Number(votesMatch[1]!.replace(/,/g, "")) || null : null;

  // Intro meta list: category, country, runtime, censorship, release, genres.
  let category: string | null = null;
  let country: string | null = null;
  let runtimeMinutes: number | null = null;
  const censorship: string[] = [];
  let releaseDate: string | null = null;
  const genres: string[] = [];
  $("ul.list-separator").each((_, ul) => {
    const $ul = $(ul);
    const $items = $ul.children("li");
    if ($items.length === 0) return;
    const firstText = clean($items.first().text());
    const firstLink = $items.first().find("a").first();
    if (
      !category &&
      firstLink.length &&
      /^(movie|film|series|program|مسلسل|فيلم|برنامج)$/i.test(firstLink.text().trim())
    ) {
      category = firstLink.text().trim();
    }
    if (/^(movie|film|series|program|مسلسل|فيلم|برنامج)$/i.test(firstText) && !category) {
      category = firstText;
    }
    if (!country && $ul.find("a[href*='/country/']").length) {
      country = clean($ul.find("a[href*='/country/']").first().text());
    }
    if (runtimeMinutes === null) {
      for (const li of $items.toArray()) {
        const liText = clean($(li).text());
        const m = liText.match(/(\d+)\s*minutes?\s*(دقيقة)?/i) ?? liText.match(/(\d+)\s*دقيقة/);
        if (m) {
          runtimeMinutes = Number(m[1]);
          break;
        }
      }
    }
    $ul.find("ul.censorship").each((__, cul) => {
      // Each censorship widget is a mini two-cell list: body ("MPAA", "تقييمنا")
      // then value ("+18", "None"). Join the pair; never push bare fragments.
      const parts = $(cul)
        .children("li")
        .map((___, li) => clean($(li).text()))
        .get()
        .filter(Boolean);
      if (parts.length === 0) return;
      const entry = `${parts[0]}: ${parts.slice(1).join(" ") || "None"}`;
      if (!censorship.includes(entry)) censorship.push(entry);
    });
    const label = clean($items.first().clone().children().remove().end().text());
    // The release date lives in the first li, after its label; "(more)" is a
    // link we don't render.
    if (/^(release date|تاريخ العرض)/i.test(label)) {
      releaseDate = clean(
        firstText.replace(/^\s*(release date|تاريخ العرض):?\s*/i, "").replace(/\(more\)/gi, ""),
      ).slice(0, 60);
    }
    if (
      /^(genre|النوع)/i.test(label) ||
      ($items.length > 1 && $items.find("a[href*='/genre/']").length)
    ) {
      $items
        .slice(1)
        .find("a[href*='/genre/']")
        .each((__, a) => {
          const g = clean($(a).text());
          if (g && !genres.includes(g)) genres.push(g);
        });
    }
  });

  // Synopsis: first paragraph with a read-more expander, including hidden text.
  let synopsis: string | null = null;
  $("p").each((_, p) => {
    if (synopsis) return;
    const $p = $(p);
    if ($p.find("#read-more").length) {
      synopsis = clean($p.text()).replace(/\.{3}\s*(Read more|اقرأ المزيد)\s*/i, "");
    }
  });
  if (!synopsis)
    synopsis = clean($("strong:contains('Synopses')").nextAll("p").first().text()) || null;

  // Director / Writer / Cast lists in the intro block.
  const director: LiveRef[] = [];
  const writers: LiveRef[] = [];
  const cast: LiveRef[] = [];
  const takeList = ($ul: $El, target: LiveRef[]) => {
    $ul
      .children("li")
      .slice(1)
      .each((__, li) => {
        $(li)
          .find("a[href*='/person/']")
          .each((___, a) => {
            const pid = idFromHref($(a).attr("href"), "person");
            const name = clean($(a).text());
            if (pid && name && !target.some((r) => r.id === pid)) {
              target.push({ id: pid, title: name, img: null, href: `/person/${pid}/` });
            }
          });
      });
  };
  $("ul.list-separator.list-title").each((_, ul) => {
    const $ul = $(ul);
    const label = clean($ul.children("li").first().text());
    if (/^(director|المخرج)/i.test(label)) takeList($ul, director);
    else if (/^(writer|الكاتب)/i.test(label)) takeList($ul, writers);
    else if (/^(cast|طاقم التمثيل|بطولة)/i.test(label)) takeList($ul, cast);
  });

  const imdbUrl = $("a[href*='imdb.com/title']").first().attr("href") || null;

  // Showtimes: day tabs + content blocks.
  const showtimes: LiveWork["showtimes"] = [];
  const dayLabels = $("ul.tabs li.tab-title a")
    .map((_, el) => clean($(el).text()))
    .get();
  const dayBlocks = $(".tabs-content > div.content");
  dayBlocks.each((i, block) => {
    const cinemas: LiveWork["showtimes"][number]["cinemas"] = [];
    $(block)
      .find(".row")
      .each((__, row) => {
        const $row = $(row);
        const $cinemaA = $row.find("a[href*='/theater/']").first();
        if (!$cinemaA.length) return;
        const times = $row
          .find("ul.list-separator li")
          .map((___, li) => clean($(li).clone().children("a").remove().end().text()))
          .get()
          .filter((tm) => tm && !/more|المزيد/i.test(tm));
        const bookingHref = $row.find("a.button.orange").first().attr("href") || null;
        cinemas.push({
          id: idFromHref($cinemaA.attr("href"), "theater") || "",
          name: clean($cinemaA.text()),
          times,
          bookingHref: bookingHref
            ? bookingHref.startsWith("http")
              ? bookingHref
              : `${BASE}${bookingHref}`
            : null,
        });
      });
    if (cinemas.length) showtimes.push({ day: dayLabels[i] ?? "", cinemas });
  });

  // Cast cards section.
  const castCards: LiveRef[] = [];
  const castSection = sectionContent($, /^(cast|طاقم التمثيل|بطولة)$/i);
  if (castSection) {
    castSection.find("div.thumbnail-wrapper").each((_, el) => {
      const $tw = $(el);
      const $a = $tw.find("a[href*='/person/']").first();
      const pid = idFromHref($a.attr("href"), "person");
      if (!pid) return;
      castCards.push({
        id: pid,
        title: clean($tw.find("ul.description a").first().text()) || clean($a.text()),
        img: pickArtwork($a.find("img"), BASE),
        href: `/person/${pid}/`,
      });
    });
  }

  // elCinema TV videos + photos + related strip.
  const videos = parseVideoCards($, sectionContent($, /elcinema tv/i) ?? $("body"));
  const photos = (() => {
    const s = sectionContent($, /^photos$/i);
    return s ? parsePhotos($, s) : [];
  })();
  const related: LiveRef[] = [];
  $("h2.section-title")
    .filter((_, el) => /now playing|السينمات الآن/i.test(clean($(el).text())))
    .each((_, el) => {
      const next = $(el).nextAll(".columns").first();
      next.find("a[href*='/work/']").each((__, a) => {
        const wid = idFromHref($(a).attr("href"), "work");
        if (!wid) return;
        const $card = $(a).closest("li");
        const img = pickArtwork($card.find("img"), BASE);
        const t =
          clean($card.find("ul.description a").first().text()) ||
          clean($(a).find("ul.description a").first().text()) ||
          clean($(a).text());
        if (t && !related.some((r) => r.id === wid))
          related.push({ id: wid, title: t, img, href: `/work/${wid}/` });
      });
    });

  return {
    id,
    lang,
    title,
    altTitle: alt,
    year: yearFromH1($),
    poster,
    rating,
    votes,
    category,
    country,
    runtimeMinutes,
    censorship,
    releaseDate,
    genres,
    synopsis,
    director,
    writers,
    cast: [...cast, ...castCards.filter((c) => !cast.some((x) => x.id === c.id))],
    vod: parseVodButtons($, $("body")),
    showtimes,
    photos,
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title,
      img: v.img,
      href: `/${lang}/video/${v.id}`,
    })),
    related,
    imdbUrl,
  };
}

// ---------------------------------------------------------------------------
// Person detail
// ---------------------------------------------------------------------------

export function parsePersonPage(html: string, lang: Lang, id: string): LivePerson {
  const $ = cheerio.load(html);
  const { title: name, alt: altName } = titlesFromH1($, lang);
  const photo = pickArtwork($(".button-group-vertical img").first(), BASE);

  const bioHeading = $("h3")
    .filter((_, el) => /^biography|السيرة الذاتية$/i.test(clean($(el).text())))
    .first();
  let bio: string | null = null;
  if (bioHeading.length) {
    bio = clean(bioHeading.nextAll("p").first().text()) || null;
  }
  if (!bio)
    bio = clean($("strong:contains('Biographies')").nextAll("ul li p").first().text()) || null;

  let nationality: string | null = null;
  $("ul.list-separator.list-title").each((_, ul) => {
    const label = clean($(ul).children("li").first().text());
    if (/^(nationality|الجنسية)/i.test(label)) {
      nationality =
        clean($(ul).find("a").first().text()) || clean($(ul).children("li").last().text());
    }
  });

  // Filmography accordion: "Actor (4)" -> work cards.
  const filmography: LivePerson["filmography"] = [];
  $("ul.accordion li.accordion-navigation").each((_, li) => {
    const $li = $(li);
    const sectionLabel = clean(
      $li.children("a").first().clone().children("i").remove().end().text(),
    );
    const items: LiveRef[] = [];
    // Each credit is a nested small-block-grid-2 (poster cell + text cell);
    // selecting those directly avoids double-parsing the outer grid li.
    $li.find("ul[class*='small-block-grid-2']").each((__, grid) => {
      const $grid = $(grid);
      const $a = $grid.find("a[href*='/work/']").first();
      const wid = idFromHref($a.attr("href"), "work");
      if (!wid) return;
      const $meta = $grid.find("ul.unstyled");
      const item: LiveRef = {
        id: wid,
        title: clean($meta.find("li a").first().text()) || clean($a.text()),
        img: pickArtwork($grid.find("img"), BASE),
        href: `/work/${wid}/`,
      };
      if (!items.some((x) => x.id === wid)) items.push(item);
    });
    if (sectionLabel && items.length) filmography.push({ section: sectionLabel, items });
  });

  const photos = (() => {
    const s = sectionContent($, /^photos$/i);
    return s ? parsePhotos($, s) : [];
  })();
  const vod = parseVodButtons($, $("body"));

  const crewWith: LiveRef[] = [];
  const crewSection = sectionContent($, /crew worked with|عمل مع/i);
  if (crewSection) {
    crewSection.find("a[href*='/person/']").each((_, a) => {
      const pid = idFromHref($(a).attr("href"), "person");
      if (!pid) return;
      const $card = $(a).closest("li");
      const img = pickArtwork($card.find("img"), BASE);
      const title = clean($(a).text());
      if (title && !crewWith.some((r) => r.id === pid))
        crewWith.push({ id: pid, title, img, href: `/person/${pid}/` });
    });
  }

  return { id, lang, name, altName, photo, bio, nationality, filmography, vod, photos, crewWith };
}

// ---------------------------------------------------------------------------
// Video gallery + video page
// ---------------------------------------------------------------------------

const MAX_VIDEO_SECTIONS = 12;
const MAX_VIDEOS_PER_SECTION = 8;

export function parseVideoGallery(html: string): LiveVideoGallery {
  const $ = cheerio.load(html);
  const title =
    clean($("h1").first().clone().children().remove().end().text()) ||
    clean($("h1").first().text());
  const sections: LiveVideoGallery["sections"] = [];
  $("h3.section-title.inline").each((_, el) => {
    if (sections.length >= MAX_VIDEO_SECTIONS) return;
    const $h = $(el);
    const heading = clean($h.clone().children().remove().end().text());
    if (!heading) return;
    // An <h6> count chip inside the <h3> is auto-closed by the HTML parser,
    // so it appears as the heading's sibling.
    const count =
      clean(
        ($h.find("h6").first().text() || $h.next("h6").first().text() || "").match(/[\d,]+/)?.[0] ??
          "",
      ) || null;
    const $grid = $h.closest(".columns").nextAll(".columns").first();
    const scope = $grid.length ? $grid : $h.parent();
    const videos = parseVideoCards($, scope).slice(0, MAX_VIDEOS_PER_SECTION);
    if (videos.length) sections.push({ title: heading, count, videos });
  });
  return { title, sections };
}

export function parseVideoPage(html: string, id: string): LiveVideo {
  const $ = cheerio.load(html);
  const embedUrl = $("iframe[src*='youtube.com/embed']").first().attr("src") || null;
  const img = absUrl($("meta[property='og:image']").attr("content"));
  const related: LiveVideoCard[] = parseVideoCards(
    $,
    sectionContent($, /other playing|إعلانات|الأكثر/i) ?? $("body"),
  )
    .filter((v) => v.id !== id)
    .slice(0, 8);
  const title =
    clean($("h1").first().clone().children().remove().end().text()) ||
    clean($("h1").first().text());
  return { id, title, embedUrl, img, related };
}

// ---------------------------------------------------------------------------
// VOD platform guide
// ---------------------------------------------------------------------------

export function parseVodGuide(html: string): LiveVodGuide {
  const $ = cheerio.load(html);
  const title =
    clean($("h1").first().clone().children().remove().end().text()) ||
    clean($("h1").first().text());
  const platforms: LiveVodGuide["platforms"] = [];
  $("h2.section-title").each((_, el) => {
    const $h = $(el);
    const name = clean($h.find("a").first().text() || $h.text()).replace(/\s*Shows Guide\s*$/i, "");
    if (!name) return;
    const id = idFromHref($h.find("a[href*='/vod/']").first().attr("href"), "vod");
    if (!id) return;
    const $col = $h.closest(".columns").nextAll(".columns").first();
    const img = pickArtwork($col.find("img[src*='vod_platforms']").first(), BASE);
    const cats: LiveVodGuide["platforms"][number]["cats"] = [];
    $col.find("a[href*='/vod/'][href*='vcategory=']").each((__, a) => {
      const vcat = new URL($(a).attr("href") || "", BASE).searchParams.get("vcategory");
      const label = clean($(a).text());
      if (label && !cats.some((c) => c.label === label)) cats.push({ label, vcategory: vcat });
    });
    if (!platforms.some((p) => p.id === id)) platforms.push({ id, name, img, cats });
  });
  return { title, platforms };
}

// ---------------------------------------------------------------------------
// Featured lists (lineup)
// ---------------------------------------------------------------------------

export function parseLineupIndex(html: string): LiveLineupIndex {
  const $ = cheerio.load(html);
  const title =
    clean($("h1").first().clone().children().remove().end().text()) ||
    clean($("h1").first().text());
  const lists: LiveLineupList[] = [];
  $("a[href*='/lineup/']").each((_, a) => {
    const $a = $(a);
    const id = idFromHref($a.attr("href"), "lineup");
    if (!id) return;
    const $card = $a.closest("div.thumbnail-wrapper, li");
    const img = pickArtwork($card.find("img"), BASE);
    const t =
      clean($card.find("ul.description a").first().text()) ||
      clean($a.find("ul.description a").first().text()) ||
      clean($a.attr("title") || "") ||
      clean($a.text());
    if (t && !lists.some((l) => l.id === id)) lists.push({ id, title: t, cover: img });
  });
  return { title, lists };
}

export function parseLineupDetail(html: string, id: string): LiveLineupDetail {
  const $ = cheerio.load(html);
  const title = clean($(".jumbo-theater").first().text()) || clean($("h1").first().text());
  const items: LiveLineupDetail["items"] = [];
  $("div.row").each((_, row) => {
    const $row = $(row);
    const $titleA = $row
      .find("a[href*='/work/']")
      .filter((__, a) => clean($(a).text()).length > 0)
      .first();
    const wid = idFromHref($titleA.attr("href"), "work");
    if (!wid) return;
    const img = pickArtwork($row.find("div.thumbnail-wrapper img"), BASE);
    const cast: LiveRef[] = [];
    $row.find("a[href*='/person/']").each((__, a) => {
      const pid = idFromHref($(a).attr("href"), "person");
      const t = clean($(a).text());
      if (pid && t && !cast.some((r) => r.id === pid))
        cast.push({ id: pid, title: t, img: null, href: `/person/${pid}/` });
    });
    if (!items.some((it) => it.id === wid)) {
      items.push({
        id: wid,
        title: clean($titleA.text()),
        img,
        meta: "",
        cast,
      });
    }
  });
  return { id, title, items };
}

// ---------------------------------------------------------------------------
// Static pages (About, Contact, Advertise, Privacy, Terms, …)
// ---------------------------------------------------------------------------

/** Heading levels that open a new content section after the page title. */
const STATIC_HEADING_SELECTOR = "h2, h3, h4, h5, h6";

/** Heading text without its own markup (nested <em>/<strong> go away with it). */
function staticHeadingText($heading: $El): string {
  const clone = $heading.clone();
  clone.children().remove();
  const text = clean(clone.text()) || clean($heading.text());
  return text;
}

/** Content blocks of the section that starts at a heading, up to the next one. */
function staticBlocks($: $Html, $heading: $El): LiveStaticBlock[] {
  const blocks: LiveStaticBlock[] = [];
  const $content = $heading.nextUntil(STATIC_HEADING_SELECTOR);
  const walk = ($scope: $El) => {
    $scope.each((_, el) => {
      const $el = $(el);
      const tag = String((el as { tagName?: string }).tagName ?? "").toLowerCase();
      if (/^h[1-6]$/.test(tag)) return;
      if (tag === "p") {
        const text = clean($el.text());
        if (text) blocks.push({ type: "p", text });
      } else if (tag === "ul" || tag === "ol") {
        const items: string[] = [];
        $el.find("li").each((___, li) => {
          const text = clean($(li).text());
          if (text && !items.includes(text)) items.push(text);
        });
        if (items.length) blocks.push({ type: "list", items });
      } else {
        walk($el.children());
      }
    });
  };
  walk($content);
  return blocks;
}

/**
 * Parse a scraped static content page (elcinema.com/<edition>/about_us/,
 * /contact/, /advertise/, /privacy_policy/, …) into a title + ordered sections.
 */
export function parseStaticPage(html: string, lang: Lang): LiveStaticPage {
  const $ = cheerio.load(html);
  const $h1 = $("h1").first();
  const title = clean($h1.clone().children().remove().end().text()) || clean($h1.text());
  const $root = $h1.parent().length ? $h1.parent() : $("body");
  const headings = $root.find("h2, h3, h4, h5, h6");
  const titleHeading = headings.first();
  const resolvedTitle =
    title || clean(titleHeading.clone().children().remove().end().text()) || clean(titleHeading.text());
  
  // Extract first image from the page (sidebar or featured image)
  const $img = $root.find("img").first();
  const image = $img.attr("src") || null;
  
  const sections: LiveStaticSection[] = [];
  headings.each((_, el) => {
    const $heading = $(el);
    const heading = staticHeadingText($heading);
    if (!heading) return;
    sections.push({ heading, blocks: staticBlocks($, $heading) });
  });
  return { title: resolvedTitle, sections, image: image ?? undefined };
}

export async function getStaticPage(lang: Lang, path: string): Promise<LiveStaticPage> {
  const html = await fetchPage(path);
  return parseStaticPage(html, lang);
}

// ---------------------------------------------------------------------------
// Cached entry points
// ---------------------------------------------------------------------------

export async function getWorkDetail(lang: Lang, id: string): Promise<LiveWork> {
  const html = await fetchPage(`/${lang}/work/${id}/`);
  return parseWorkPage(html, lang, id);
}

export async function getPersonDetail(lang: Lang, id: string): Promise<LivePerson> {
  const html = await fetchPage(`/${lang}/person/${id}/`);
  return parsePersonPage(html, lang, id);
}

export async function getVideoGallery(lang: Lang): Promise<LiveVideoGallery> {
  const html = await fetchPage(`/${lang}/video/`);
  return parseVideoGallery(html);
}

export async function getVideoDetail(lang: Lang, id: string): Promise<LiveVideo> {
  const html = await fetchPage(`/${lang}/video/${id}/`);
  return parseVideoPage(html, id);
}

export async function getVodGuide(lang: Lang): Promise<LiveVodGuide> {
  const html = await fetchPage(`/${lang}/vod/`);
  return parseVodGuide(html);
}

export async function getLineupIndex(lang: Lang): Promise<LiveLineupIndex> {
  const html = await fetchPage(`/${lang}/lineup/`);
  return parseLineupIndex(html);
}

export async function getLineupDetail(lang: Lang, id: string): Promise<LiveLineupDetail> {
  const html = await fetchPage(`/${lang}/lineup/${id}/`);
  return parseLineupDetail(html, id);
}
