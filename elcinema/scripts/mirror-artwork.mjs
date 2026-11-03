#!/usr/bin/env bun
/**
 * Mirror the artwork elCinema depends on into this repository.
 *
 * Why this exists: the offline sample dataset (`src/data/*.json`)
 * references artwork by manifest key (`w-001.jpg`), and `src/lib/images.ts`
 * resolves those keys to `/__l5e/assets-v1/...` URLs. Those are served only by
 * the Lovable preview — on the dev server and in production every one of them is
 * a 404, which is why sample mode shows a wall of broken images.
 *
 * What it does, for each requested kind:
 *   posters  — every `id` in data/movies.json  -> GET /en/work/<id>/  -> og:image
 *   people   — every `id` in data/people.json  -> GET /en/person/<id>/ -> og:image
 *   logos    — the two fixed cdn.elcinema.com wordmarks used in the chrome
 *   born     — today's "Born Today" rail on /en/ (people who are usually not in
 *              the dataset, so no other kind mirrors their headshots)
 *
 * each remote image is downloaded to `public/images/<kind>/<id>.<ext>` and the
 * manifest entry for that record's key is rewritten to the local path, so the
 * site serves its own artwork and no third-party host can break it. Keys we
 * could not mirror are pointed at "" (empty), which the UI already renders as
 * designed fallback artwork instead of a dead URL.
 *
 * Usage (from `elcinema/`):
 *   bun scripts/mirror-artwork.mjs --dry-run --limit=3
 *   bun scripts/mirror-artwork.mjs                 # full mirror + manifest rewrite
 *   bun scripts/mirror-artwork.mjs --kinds=logos --force
 *
 * Requests are sequential with a polite delay: the source is a third-party site
 * and this is a build-time tool, not a crawler.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");
const BASE = "https://elcinema.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const DELAY_MS = 400;
const RETRIES = 2;

const args = process.argv.slice(2);
const has = (flag) => args.includes(`--${flag}`);
const val = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const dryRun = has("dry-run");
const force = has("force");
const limit = Number.parseInt(val("limit", "0"), 10) || 0;
const kinds = val("kinds", "posters,people,logos,born")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET with retry; returns the body, or null when the resource is unavailable. */
async function get(url, kind) {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: kind === "html" ? "text/html" : "image/*" },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) {
        // A 404 will not become 200 on retry.
        if (res.status === 404 || res.status === 410) return null;
        continue;
      }
      return kind === "html"
        ? { text: await res.text(), type: "text/html" }
        : {
            buffer: Buffer.from(await res.arrayBuffer()),
            type: res.headers.get("content-type") || "image/jpeg",
          };
    } catch {
      /* network hiccup: retry */
    }
    await sleep(600 * (attempt + 1));
  }
  return null;
}

/** og:image from a page — the canonical artwork elcinema publishes per record. */
function ogImage(html) {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (m) return m[1];
  const rev = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return rev ? rev[1] : null;
}

const extFor = (type) =>
  type.includes("png")
    ? "png"
    : type.includes("webp")
      ? "webp"
      : type.includes("gif")
        ? "gif"
        : "jpg";

const records = [];
if (kinds.includes("posters")) {
  const movies = JSON.parse(readFileSync(join(appRoot, "src/data/movies.json"), "utf8"));
  for (const m of Array.isArray(movies) ? movies : movies.items) {
    if (m?.id && m?.poster)
      records.push({ key: m.poster, id: m.id, path: `/en/work/${m.id}/`, dir: "posters" });
  }
}
if (kinds.includes("people")) {
  const people = JSON.parse(readFileSync(join(appRoot, "src/data/people.json"), "utf8"));
  for (const p of Array.isArray(people) ? people : people.items) {
    if (p?.id && p?.photo)
      records.push({ key: p.photo, id: p.id, path: `/en/person/${p.id}/`, dir: "people" });
  }
}
if (kinds.includes("logos")) {
  records.push(
    {
      key: null,
      id: "logo",
      path: "/en/",
      dir: "brand",
      fixed:
        "https://cdn.elcinema.com/assets/elCinema_logo-be1ed6273cf8fae2f6f2f9b250964c19ed6d3aebcf87dabf30d040347f7046eb.png",
    },
    {
      key: null,
      id: "footer-logo",
      path: "/en/",
      dir: "brand",
      fixed:
        "https://cdn.elcinema.com/assets/footer/elcinema-fca17c1d54bb1b93eedc0a92818163a4c95ac5fb75bf21157e6a5b4a3f988f65.png",
    },
  );
}
/**
 * Today's "Born Today" (ولد في مثل هذا اليوم) rail on the English homepage.
 * The scraper shows these people with their remote headshot unless a first-party
 * copy exists, so mirroring them is what makes the section local-only.
 */
if (kinds.includes("born")) {
  const home = await get(`${BASE}/en/`, "html");
  if (home) {
    const $ = cheerio.load(home.text);
    const $title = $("h2.section-title a")
      .filter((_, a) => ($(a).attr("href") || "").includes("/index/person/birth_day/"))
      .first();
    const dayHref = $title.attr("href") || "/en/";
    $title
      .closest("h2")
      .closest(".columns")
      .find("li")
      .filter((_, li) => $(li).find(".thumbnail-wrapper").length > 0)
      .each((_, el) => {
        const $li = $(el);
        const link = $li.find(".thumbnail-wrapper a").first().attr("href") || "";
        const id = /\/person\/(\d+)/.exec(link)?.[1];
        const image = $li.find(".thumbnail-wrapper img");
        const remote = image.attr("data-src") || image.attr("src") || "";
        if (!id || !remote || /blank_photos/i.test(remote)) return;
        records.push({ key: null, id, path: dayHref, dir: "people", fixed: remote });
      });
    console.log(`born: ${records.length} rail headshots queued`);
  } else {
    console.log("born: homepage unavailable, skipped");
  }
}

if (limit) records.length = Math.min(records.length, limit);
const manifestPath = join(appRoot, "src/lib/images.ts");
let manifest = readFileSync(manifestPath, "utf8");
const updates = new Map();
let mirrored = 0;
let skipped = 0;
const failures = [];

for (const rec of records) {
  let remote = rec.fixed;
  if (!remote) {
    const page = await get(`${BASE}${rec.path}`, "html");
    remote = page ? ogImage(page.text) : null;
    await sleep(DELAY_MS);
  }
  if (!remote || /blank_photos/i.test(remote)) {
    failures.push(`${rec.dir}/${rec.id}: no publishable og:image`);
    continue;
  }
  const head = await get(remote, "image");
  if (!head?.buffer) {
    failures.push(`${rec.dir}/${rec.id}: download failed for ${remote}`);
    continue;
  }
  const file = `${rec.id}.${extFor(head.type)}`;
  const outDir = join(appRoot, "public/images", rec.dir);
  const outFile = join(outDir, file);
  const localPath = `/images/${rec.dir}/${file}`;
  if (existsSync(outFile) && !force) {
    skipped++;
  } else if (dryRun) {
    console.log(`would save ${localPath}  <-  ${remote}  (${head.buffer.length} bytes)`);
  } else {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outFile, head.buffer);
    mirrored++;
  }
  if (rec.key) updates.set(rec.key, localPath);
  if (!dryRun) console.log(`ok ${rec.dir}/${rec.id} -> ${localPath}`);
}

/**
 * Rewrite the manifest: mirrored keys become first-party paths, everything still
 * pointing at the preview-only `/__l5e/` prefix becomes "" so components fall
 * back to designed artwork instead of a guaranteed 404.
 */
function rewrite(text) {
  return text.replace(/"([^"]+)":\s*"([^"]*)"/g, (whole, key, url) => {
    if (updates.has(key)) return `"${key}": "${updates.get(key)}"`;
    if (url.startsWith("/__l5e/") && !dryRun) return `"${key}": ""`;
    return whole;
  });
}

const next = rewrite(manifest);
if (!dryRun && next !== manifest) {
  writeFileSync(`${manifestPath}.tmp`, next, "utf8");
  renameSync(`${manifestPath}.tmp`, manifestPath);
}

const blanked =
  (manifest.match(/"([^"]+)":\s*"\/__l5e\/[^"]*"/g) || []).length -
  (next.match(/"([^"]+)":\s*"\/__l5e\/[^"]*"/g) || []).length;

/**
 * Rebuild `src/data/artwork.json` from the files actually on disk: the
 * scraper's map from elcinema record id to first-party URL, so the homepage rails
 * can serve `/images/people/<id>.jpg` instead of hotlinking the CDN. Rebuilt
 * rather than appended so a deleted file never leaves a stale entry pointing at
 * a 404.
 */
function writeArtworkRegistry() {
  const registry = {};
  for (const dirName of ["people", "posters", "brand"]) {
    const folder = join(appRoot, "public/images", dirName);
    const byId = {};
    if (existsSync(folder)) {
      for (const file of readdirSync(folder).sort()) {
        if (!/\.(jpe?g|png|webp|gif)$/i.test(file)) continue;
        byId[file.replace(/\.[a-z0-9]+$/i, "")] = `/images/${dirName}/${file}`;
      }
    }
    registry[dirName] = byId;
  }
  const out = join(appRoot, "src/data/artwork.json");
  const body = `${JSON.stringify(registry, null, 2)}\n`;
  const current = existsSync(out) ? readFileSync(out, "utf8") : "";
  if (dryRun) {
    console.log(
      `would refresh artwork.json (${Object.values(registry)
        .map((r) => Object.keys(r).length)
        .join("/")})`,
    );
    return;
  }
  if (body !== current) writeFileSync(out, body, "utf8");
  console.log(
    `artwork.json: people=${Object.keys(registry.people).length} posters=${Object.keys(registry.posters).length} brand=${Object.keys(registry.brand).length}`,
  );
}
writeArtworkRegistry();

console.log(
  `\nmirrored=${mirrored} reused=${skipped} manifestKeysRewritten=${updates.size} previewUrlsBlanked=${dryRun ? 0 : blanked} failures=${failures.length}`,
);
for (const f of failures.slice(0, 12)) console.log(`  - ${f}`);
if (dryRun) console.log("dry run: nothing was written.");
