import { describe, expect, it } from "vitest";
import { NAV_GROUPS } from "@/components/layout/SiteMenu";
import { AR_STRINGS, EN_STRINGS } from "@/i18n";

describe("shared navigation and filter copy", () => {
  it("has distinct English and Arabic labels for every shared navigation item", () => {
    const keys = NAV_GROUPS.flatMap((group) => [
      group.label,
      ...group.items.map((item) => item.label),
    ]);

    for (const key of keys) {
      expect(EN_STRINGS[key]).toBeTruthy();
      expect(AR_STRINGS[key]).toBeTruthy();
      expect(AR_STRINGS[key]).not.toBe(EN_STRINGS[key]);
    }
  });

  it("keeps search metadata and guide filter labels translated in both editions", () => {
    const keys = [
      "search.metaDescription",
      "guide.category.all",
      "guide.category.general",
      "guide.category.movies",
      "guide.category.series",
      "guide.category.news",
      "guide.category.sports",
      "guide.category.kids",
      "guide.category.music",
      "guide.category.documentary",
      "guide.category.religion",
    ] as const;

    for (const key of keys) {
      expect(EN_STRINGS[key]).toBeTruthy();
      expect(AR_STRINGS[key]).toBeTruthy();
      expect(AR_STRINGS[key]).not.toBe(EN_STRINGS[key]);
    }
  });
});
