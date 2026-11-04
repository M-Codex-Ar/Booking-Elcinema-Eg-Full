import { describe, expect, it } from "vitest";

import {
  computeProgress,
  EXIT_MS,
  EXIT_MS_REDUCED,
  INTRO_MAX_MS,
  INTRO_MIN_MS,
  REDUCED_MIN_MS,
  RETURN_MIN_MS,
} from "@/components/cinematic/loader-logic";

describe("computeProgress", () => {
  it("starts at zero", () => {
    expect(computeProgress(0, false)).toBe(0);
  });

  it("never reaches 100% while the app is not ready", () => {
    expect(computeProgress(INTRO_MIN_MS, false)).toBeCloseTo(0.92);
    expect(computeProgress(60000, false)).toBeLessThan(1);
    expect(computeProgress(600000, false)).toBeLessThan(0.99);
  });

  it("reaches 100% only when ready and past the presentation floor", () => {
    expect(computeProgress(INTRO_MIN_MS - 1, true)).toBeLessThan(1);
    expect(computeProgress(INTRO_MIN_MS, true)).toBe(1);
  });

  it("respects a custom (reduced-motion / returning-visitor) floor", () => {
    expect(computeProgress(500, true, 700)).toBeLessThan(1);
    expect(computeProgress(700, true, 700)).toBe(1);
  });

  it("eases to the presentation plateau within the minimum window", () => {
    const mid = computeProgress(INTRO_MIN_MS / 2, false);
    expect(mid).toBeGreaterThan(0.5);
    expect(mid).toBeLessThan(0.92);
  });
});

describe("loader pacing caps", () => {
  it("hard-caps the intro so slow loads can never trap the user", () => {
    expect(INTRO_MAX_MS).toBeLessThanOrEqual(8000);
    expect(INTRO_MIN_MS).toBeLessThan(INTRO_MAX_MS);
  });

  it("stays within the first-load speed budget (fast reveal, not a wait)", () => {
    expect(INTRO_MIN_MS).toBeLessThanOrEqual(1700);
    expect(RETURN_MIN_MS).toBeLessThanOrEqual(900);
    expect(REDUCED_MIN_MS).toBeLessThanOrEqual(500);
    expect(EXIT_MS).toBeLessThanOrEqual(1000);
    expect(EXIT_MS_REDUCED).toBeLessThanOrEqual(400);
  });

  it("shows returning visitors and reduced-motion users a shorter intro", () => {
    expect(RETURN_MIN_MS).toBeLessThan(INTRO_MIN_MS);
    expect(REDUCED_MIN_MS).toBeLessThan(RETURN_MIN_MS);
  });
});
