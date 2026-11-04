/**
 * Pure pacing math for the cinematic first-load.
 * Kept framework-free so it can be unit tested directly.
 *
 * The intro never imposes a presentation delay: it exits as soon as the route
 * hydrates. While hydration is pending, progress eases toward a plateau rather
 * than pretending to know how long the request will take.
 */

/** Hard cap: the loader never stays up longer than this, whatever happens. */
export const INTRO_MAX_MS = 4000;

/** Progress animation ramp while the page is still hydrating. */
export const PROGRESS_RAMP_MS = 900;

/** Exit transition lengths match the CSS so the overlay never lingers. */
export const EXIT_MS = 240;
export const EXIT_MS_REDUCED = 240;

/**
 * Progress for a given elapsed time.
 * - Eases toward 92% over the short hydration ramp.
 * - If the app is not ready yet, creeps slowly toward 98% (never fakes completion).
 * - Reaches 100% as soon as the route is ready.
 */
export function computeProgress(elapsedMs: number, ready: boolean): number {
  if (ready) return 1;
  if (elapsedMs <= 0) return 0;

  const t = Math.min(1, elapsedMs / PROGRESS_RAMP_MS);
  const eased = 1 - Math.pow(1 - t, 2.2);
  return Math.min(0.98, 0.92 * eased + Math.max(0, elapsedMs - PROGRESS_RAMP_MS) / 30000);
}
