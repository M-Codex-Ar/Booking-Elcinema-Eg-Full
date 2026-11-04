import { describe, expect, it } from "vitest";

import {
  computeProgress,
  EXIT_MS,
  EXIT_MS_REDUCED,
  INTRO_MAX_MS,
  PROGRESS_RAMP_MS,
} from "@/components/cinematic/loader-logic";

describe("computeProgress", () => {
  it("starts at zero", () => {
    expect(computeProgress(0, false)).toBe(0);
  });

  it("never reaches 100% while the app is not ready", () => {
    expect(computeProgress(PROGRESS_RAMP_MS, false)).toBeCloseTo(0.92);
    expect(computeProgress(60000, false)).toBeLessThan(1);
    expect(computeProgress(600000, false)).toBeLessThan(0.99);
  });

  it("exits as soon as the page is ready without imposing an intro floor", () => {
    expect(computeProgress(0, true)).toBe(1);
    expect(computeProgress(150, true)).toBe(1);
  });

  it("eases toward the loading plateau without faking completion", () => {
    const mid = computeProgress(PROGRESS_RAMP_MS / 2, false);
    expect(mid).toBeGreaterThan(0.5);
    expect(mid).toBeLessThan(0.92);
  });
});

describe("loader pacing caps", () => {
  it("hard-caps the intro so slow loads can never trap the user", () => {
    expect(INTRO_MAX_MS).toBeLessThanOrEqual(4000);
    expect(PROGRESS_RAMP_MS).toBeLessThan(INTRO_MAX_MS);
  });

  it("keeps the exit shorter than the old full-screen hold", () => {
    expect(EXIT_MS).toBeLessThanOrEqual(300);
    expect(EXIT_MS_REDUCED).toBeLessThanOrEqual(300);
  });
});
