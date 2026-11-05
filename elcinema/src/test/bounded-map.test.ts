import { describe, expect, it } from "vitest";
import { setBounded } from "@/lib/bounded-map";

describe("setBounded", () => {
  it("evicts the oldest entry and refreshes an updated key's recency", () => {
    const cache = new Map<string, number>();
    setBounded(cache, "a", 1, 2);
    setBounded(cache, "b", 2, 2);
    setBounded(cache, "a", 3, 2);
    setBounded(cache, "c", 4, 2);
    expect([...cache]).toEqual([
      ["a", 3],
      ["c", 4],
    ]);
    expect(cache.size).toBeLessThanOrEqual(2);
  });
});
