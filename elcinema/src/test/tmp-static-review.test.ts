import { describe, expect, it } from "vitest";
import { parseStaticPage } from "@/features/live/live.server";
import { writeFileSync } from "node:fs";

describe("tmp live static content review", () => {
  it("reviews the live static pages", async () => {
    const out: string[] = [];
    for (const [path, file] of [
      ["/en/advertise/", "ad.html"],
      ["/en/privacy_policy/", "privacy.html"],
    ] as const) {
      const res = await fetch(`https://elcinema.com${path}`);
      const html = await res.text();
      const page = parseStaticPage(html, "en");
      out.push(`===== ${path} -> ${res.status} =====\n${JSON.stringify(page, null, 2)}`);
      writeFileSync(`C:\\Users\\mosta\\AppData\\Local\\Temp\\opencode\\${file}`, html);
    }
    writeFileSync("C:\\Users\\mosta\\AppData\\Local\\Temp\\opencode\\static-pages.json", out.join("\n"));
    expect(true).toBe(true);
  });
});
