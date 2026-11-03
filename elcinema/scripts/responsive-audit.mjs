// Responsive + RTL audit for the public site. Drives a Chrome over the DevTools
// Protocol with nothing but Node's global `fetch` and `WebSocket`, so it adds no
// dependency to the project.
//
//   1. start Chrome with a debugging port (headless is fine):
//        chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp>
//   2. start the app (the Nitro output cannot be previewed, so use the dev server):
//        bun run dev:web
//   3. audit:
//        node scripts/responsive-audit.mjs --base http://localhost:4360 \
//          --widths 360,768,1440 --theme dark,light \
//          --routes /en,/ar,/en/tvguide,/en/boxoffice --shots
//
// For every route × width × theme it navigates, lets the page settle, then reads
// the DOM and reports four things:
//
//   doc/vw   document scroll width against the viewport — the sideways scroll
//   off      elements poking out of the viewport with no scroller to reach them
//            (fixed overlays and children of `overflow-x: auto|scroll` boxes are
//            excluded, because those are reachable by design)
//   clip     content clipped by a non-visible `overflow-x` — a real bug for a
//            heading, expected for a `truncate` span or a rail, so read it
//   tiny     interactive targets under 40×32 CSS px
//
// Screenshots land in `--out` (default `./audit`), named
// `<theme>-<width>-<route>.png`, and the JSON report next to them. The script
// exits 1 when anything overflows the document or sits off-screen, so it can gate
// a release.
//
// `dir` comes from `$lang.tsx`, which mirrors it onto `<html>` after hydration;
// the `theme` is forced through `localStorage` before the page script runs.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const arg = (name, fallback = "") => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const BASE = arg("base", "http://localhost:4360").replace(/\/$/, "");
const OUT = arg("out", "./audit");
const PORT = Number(arg("port", "9333"));
// Bare widths get a phone-like height; an explicit `WxH` pair is taken as-is, which
// is how a phone held sideways (844x390) is measured — the case where a dialog
// taller than the viewport stops being reachable at all.
const VIEWPORTS = arg("widths", "360,768,1440")
  .split(",")
  .map((spec) => {
    const [w, h] = spec.split("x").map(Number);
    return { width: w, height: h || (w < 500 ? 844 : 900) };
  });
const THEMES = arg("theme", "dark,light").split(",");
const ROUTES = arg(
  "routes",
  [
    "/en",
    "/ar",
    "/en/now",
    "/en/soon",
    "/en/video",
    "/en/search",
    "/en/boxoffice",
    "/en/lineup",
    "/en/tvguide",
    "/en/vod",
    "/en/booking",
    "/en/about",
    "/en/contact",
    "/en/advertise",
    "/en/privacy",
    "/en/terms",
    "/ar/now",
    "/ar/tvguide",
    "/ar/boxoffice",
    "/ar/vod",
    "/auth",
  ].join(","),
).split(",");
const REPORT_LIMIT = Number(arg("limit", "6"));
const SETTLE = Number(arg("settle", "1800"));

mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch {
      await sleep(250);
    }
  }
  throw new Error(
    `no page target on http://127.0.0.1:${PORT} — is Chrome running with --remote-debugging-port?`,
  );
}

const target = await withRetry(async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const list = await res.json();
  const page = list.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");
  return page;
});

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

let msgId = 0;
const pending = new Map();
let events = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    events.push(msg);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) {
    const where = r.exceptionDetails.exception?.description || r.exceptionDetails.text;
    throw new Error(`page probe threw: ${String(where).split("\n")[0]}`);
  }
  return r.result.value;
}

const norm = (p) => p.replace(/\/+$/, "") || "/";

// Waits for the document that was asked for, not for "some load event". The dev
// server can take ten seconds to render a cold route, so a bare load check exits
// while the tab is still finishing the *previous* page — and then every read
// after it is reported under the wrong route and the wrong width.
async function waitForNavigation(want, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const navAt = events.findIndex(
      (e) =>
        e.method === "Page.frameNavigated" &&
        e.params?.frame?.url &&
        norm(new URL(e.params.frame.url).pathname) === want,
    );
    if (navAt !== -1 && events.slice(navAt).some((e) => e.method === "Page.loadEventFired"))
      return true;
    await sleep(100);
  }
  return false;
}

// Runs in the page. Keeps the noise down by reporting each distinct element path
// once, and by trusting intentional scrollers.
const PROBE = `(() => {
  const vw = window.innerWidth;
  const path = (el) => {
    const parts = [];
    let n = el;
    while (n && n.tagName && n !== document.body && parts.length < 4) {
      let s = n.tagName.toLowerCase();
      if (n.className && typeof n.className === "string") {
        const cls = n.className.trim().split(/\\s+/).slice(0, 4).join(".");
        if (cls) s += "." + cls;
      }
      parts.unshift(s);
      n = n.parentElement;
    }
    return parts.join(" > ");
  };
  const reachable = (el) => {
    let n = el.parentElement;
    while (n && n !== document.body) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
      n = n.parentElement;
    }
    return false;
  };
  const clip = [];
  const offscreen = [];
  const tiny = [];
  let skipped = 0;
  for (const el of document.querySelectorAll("body *")) {
    // One element must not cost us the whole page: React can hand back a node
    // that is mid-detachment, and getComputedStyle on it throws.
    try {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 && r.height < 1) continue;
      if (el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== "visible") {
        clip.push({ sel: path(el), scrollW: el.scrollWidth, clientW: el.clientWidth, ox: cs.overflowX });
      }
      if ((r.right > vw + 1 || r.left < -1) && cs.position !== "fixed" && !reachable(el)) {
        offscreen.push({ sel: path(el), left: Math.round(r.left), right: Math.round(r.right) });
      }
      const interactive = el.matches("a[href], button, input, select, textarea, [role=button], [role=tab]");
      if (interactive && cs.pointerEvents !== "none" && (r.width < 40 || r.height < 32)) {
        tiny.push({ sel: path(el), w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40) });
      }
    } catch {
      skipped++;
    }
  }
  const dedupe = (arr) => {
    const seen = new Map();
    for (const it of arr) if (!seen.has(it.sel)) seen.set(it.sel, it);
    return [...seen.values()];
  };
  return {
    vw,
    docScrollW: document.documentElement.scrollWidth,
    // The shell route puts dir on a wrapper div and mirrors it onto <html>
    // after hydration, so the effective direction is the first one either shows.
    dir: document.documentElement.dir || document.querySelector("[dir]")?.getAttribute("dir") || "(unset)",
    skipped,
    clip: dedupe(clip).slice(0, ${REPORT_LIMIT}),
    offscreen: dedupe(offscreen).slice(0, ${REPORT_LIMIT}),
    tiny: dedupe(tiny).slice(0, ${REPORT_LIMIT}),
  };
})()`;

await send("Page.enable");
await send("Runtime.enable");

const report = [];
try {
  for (const theme of THEMES) {
    // Re-registered per theme: every script added runs on the next document, so the
    // last one added wins and the loop order is the effective theme.
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `try{localStorage.setItem("theme",${JSON.stringify(theme)});}catch(e){}`,
    });
    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        const { width, height } = vp;
        const size = `${width}x${height}`;
        events = [];
        try {
          await send("Emulation.setDeviceMetricsOverride", {
            width,
            height,
            deviceScaleFactor: 1,
            mobile: width < 500 || height < 500,
          });
          await send("Page.navigate", { url: `${BASE}${route}` });
          const want = norm(route);
          if (!(await waitForNavigation(want)))
            throw new Error(`no committed navigation for ${want}`);
          await sleep(SETTLE);
          // Only measure the page that was asked for, at the width that was asked
          // for. Without this, a document that is still swapping in (previous route,
          // previous viewport, or a dev-server reload) is reported under the wrong
          // label, and a stale 1440px read on a "360" line looks like a real bug.
          let m = null;
          let seen = null;
          const readDeadline = Date.now() + 15000;
          while (m === null && Date.now() < readDeadline) {
            try {
              seen = await evaluate(
                "({p: location.pathname, w: window.innerWidth, r: document.readyState})",
              );
              if (seen && norm(seen.p) === want && seen.w === width && seen.r === "complete") {
                m = await evaluate(PROBE);
                break;
              }
            } catch {
              /* document gone mid-read; wait and re-check */
            }
            await sleep(400);
          }
          if (!m)
            throw new Error(
              `never reached ${want} at ${width}px (last read: ${JSON.stringify(seen)})`,
            );
          Object.assign(m, { route, theme, width, height, status: "ok" });
          report.push(m);
          const bad = m.docScrollW > m.vw + 1 || m.offscreen.length > 0;
          console.log(
            `${bad ? "!!" : "  "} ${theme.padEnd(5)} ${size.padStart(9)} ${route.padEnd(24)} ` +
              `doc=${m.docScrollW} vw=${m.vw} dir=${m.dir} off=${m.offscreen.length} clip=${m.clip.length} tiny=${m.tiny.length}`,
          );
          if (has("shots")) {
            const shot = await send("Page.captureScreenshot", { format: "png" });
            const file = join(OUT, `${theme}-${size}-${route.replace(/[^\w]+/g, "_")}.png`);
            writeFileSync(file, Buffer.from(shot.data, "base64"));
          }
        } catch (e) {
          console.log(`ERR ${theme} ${size} ${route}: ${String(e.message).slice(0, 160)}`);
          report.push({ theme, route, width, height, status: "error", message: String(e.message) });
        }
      }
    }
  }
} catch (e) {
  // A dropped socket or a dead page target must still leave the evidence behind.
  console.log("FATAL mid-run: " + String(e && e.message));
}

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));

const failing = report.filter(
  (m) => m.status === "ok" && (m.docScrollW > m.vw + 1 || m.offscreen.length > 0),
);
const errors = report.filter((m) => m.status !== "ok");
console.log(
  `\n${report.length - errors.length} measured, ${failing.length} with overflow or off-screen content, ${errors.length} failed to measure`,
);
if (failing.length) {
  for (const m of failing.slice(0, 12)) {
    console.log(
      ` - ${m.theme} ${m.width}px ${m.route}: off=${m.offscreen.length} doc=${m.docScrollW}/${m.vw}`,
    );
    for (const o of m.offscreen.slice(0, 3)) console.log(`     ${o.sel}  [${o.left}..${o.right}]`);
  }
}
console.log("report: " + join(OUT, "report.json"));

ws.close();
// A page that could not be measured is not a pass.
process.exit(failing.length || errors.length ? 1 : 0);
