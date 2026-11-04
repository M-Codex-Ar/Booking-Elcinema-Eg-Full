/**
 * Pure pacing math for the cinematic first-load.
 * Kept framework-free so it can be unit tested directly.
 *
 * The timeline is tuned so a first visit spends at most ~1.2s in the intro and
 * ~0.78s in the exit — a premium reveal, not a wait. The loader still never
 * claims readiness before the app is actually ready.
 */

/** Minimum time the intro stays on screen (presentation floor, not a fake wait). */
export const INTRO_MIN_MS = 1150;

/** Returning visitors already saw the reveal this session — keep it brief. */
export const RETURN_MIN_MS = 550;

/** Reduced-motion floor: a short, calm fade. */
export const REDUCED_MIN_MS = 400;

/** Hard cap: the loader never stays up longer than this, whatever happens. */
export const INTRO_MAX_MS = 8000;

/** How long we keep probing the hero image before deciding the app is ready anyway. */
export const HERO_READY_TIMEOUT_MS = 4000;

/** Exit transition length — must cover the longest exit animation in styles. */
export const EXIT_MS = 780;
export const EXIT_MS_REDUCED = 350;

/**
 * Progress for a given elapsed time.
 * - Eases toward 92% over the minimum presentation window.
 * - If the app is not ready yet, creeps slowly toward 98% (never fakes completion).
 * - Reaches 100% only when the app is actually ready AND the minimum elapsed.
 */
export function computeProgress(
  elapsedMs: number,
  ready: boolean,
  minMs: number = INTRO_MIN_MS,
): number {
  if (ready && elapsedMs >= minMs) return 1;
  if (elapsedMs <= 0) return 0;

  if (elapsedMs < minMs) {
    const t = Math.min(1, elapsedMs / minMs);
    const eased = 1 - Math.pow(1 - t, 2.2);
    return 0.92 * eased;
  }

  // Waiting on the app past the presentation floor: slow honest creep.
  return Math.min(0.98, 0.92 + (elapsedMs - minMs) / 30000);
}
