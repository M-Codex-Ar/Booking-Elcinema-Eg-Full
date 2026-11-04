import { useEffect, useState } from "react";
import { INTRO_MAX_MS } from "@/components/cinematic/loader-logic";

/**
 * Signals that the server-rendered route has hydrated. Artwork loads in its
 * own reserved box and must not hold the whole page behind the full-screen
 * intro. A hard cap still protects against a broken hydration lifecycle.
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

    // Do not wait for third-party artwork. The route is usable as soon as it
    // hydrates; image components already preserve their layout and fall back.
    done();

    return () => {
      cancelled = true;
      window.clearTimeout(cap);
    };
  }, [active]);

  return ready;
}
