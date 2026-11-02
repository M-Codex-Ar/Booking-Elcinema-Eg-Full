#!/usr/bin/env bun
/**
 * Mirror the artwork elCinema depends on into this repository.
 *
 * Why this exists: the offline sample dataset (`src/elcinema/data/*.json`)
 * references artwork by manifest key (`w-001.jpg`), and `src/elcinema/images.ts`
 * resolves those keys to `/__l5e/assets-v1/...` URLs. Those are served only by
 * the Lovable preview — on the dev server and in production every one of them is
 * a 404, which is why sample mode shows a wall of broken images.
 *
 * What it does, for each requested kind:
 *   posters  — every `id` in data/movies.json  -> GET /en/work/<id>/  -> og:image
 *   people   — every `id` in data/people.json  -> GET /en/person/<id>/ -> og:image
 *   logos    — the two fixed cdn.elcinema.com wordmarks used in the chrome
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
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
const kinds = val("kinds", "posters,people,logos")
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
      return kind === "html" ? { text: await res.text(), type: "text/html" } : { buffer: Buffer.from(await res.arrayBuffer()), type: res.headers.get("content-type") || "image/jpeg" };
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
  type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "jpg";

const records = [];
if (kinds.includes("posters")) {
  const movies = JSON.parse(readFileSync(join(appRoot, "src/elcinema/data/movies.json"), "utf8"));
  for (const m of Array.isArray(movies) ? movies : movies.items) {
    if (m?.id && m?.poster) records.push({ key: m.poster, id: m.id, path: `/en/work/${m.id}/`, dir: "posters" });
  }
}
if (kinds.includes("people")) {
  const people = JSON.parse(readFileSync(join(appRoot, "src/elcinema/data/people.json"), "utf8"));
  for (const p of Array.isArray(people) ? people : people.items) {
    if (p?.id && p?.photo) records.push({ key: p.photo, id: p.id, path: `/en/person/${p.id}/`, dir: "people" });
  }
}
if (kinds.includes("logos")) {
  records.push(
    { key: null, id: "logo", path: "/en/", dir: "brand", fixed: "https://cdn.elcinema.com/assets/elCinema_logo-be1ed6273cf8fae2f6f2f9b250964c19ed6d3aebcf87dabf30d040347f7046eb.png" },
    { key: null, id: "footer-logo", path: "/en/", dir: "brand", fixed: "https://cdn.elcinema.com/assets/footer/elcinema-fca17c1d54bb1b93eedc0a92818163a4c95ac5fb75bf21157e6a5b4a3f988f65.png" },
  );
}
if (limit) records.length = Math.min(records.length, limit);

const manifestPath = join(appRoot, "src/elcinema/images.ts");
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
console.log(
  `\nmirrored=${mirrored} reused=${skipped} manifestKeysRewritten=${updates.size} previewUrlsBlanked=${dryRun ? 0 : blanked} failures=${failures.length}`,
);
for (const f of failures.slice(0, 12)) console.log(`  - ${f}`);
if (dryRun) console.log("dry run: nothing was written.");
