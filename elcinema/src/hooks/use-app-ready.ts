import { useEffect, useState } from "react";
import { HERO_READY_TIMEOUT_MS, INTRO_MAX_MS } from "@/components/cinematic/loader-logic";

/**
 * Signals that the app behind the loader is genuinely ready:
 * React has hydrated AND the hero image finished loading (or failed,
 * in which case the homepage shows its own fallback and we don't wait).
 * A hard cap guarantees the loader can never trap the user.
 */
export function useAppReady(active: boolean): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const done = () => {
      if (!cancelled) setReady(true);
    };

    // Absolute ceiling — initialization errors or slow APIs can't trap the loader.
    const cap = window.setTimeout(done, INTRO_MAX_MS);

    const hero = document.querySelector("img[data-hero]") as HTMLImageElement | null;
    const heroLoaded = hero
      ? new Promise<void>((resolve) => {
          if (hero.complete) {
            resolve();
            return;
          }
          hero.addEventListener("load", () => resolve(), { once: true });
          hero.addEventListener("error", () => resolve(), { once: true });
        })
      : Promise.resolve();

    // Give the hero this long before we stop waiting for it and go ahead anyway.
    const heroCeiling = new Promise<void>((resolve) =>
      window.setTimeout(resolve, HERO_READY_TIMEOUT_MS),
    );

    // Whichever lands first: the hero finishing, or its ceiling.
    Promise.race([heroLoaded.catch(() => undefined), heroCeiling]).then(done);

    return () => {
      cancelled = true;
      window.clearTimeout(cap);
    };
  }, [active]);

  return ready;
}
