import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CinematicBackground } from "./cinematic-background";
import { AnimatedLogo } from "./animated-logo";
import { FilmStrip } from "./film-strip";
import { LoadingProgress, type LoadingProgressHandle } from "./loading-progress";
import {
  computeProgress,
  EXIT_MS,
  EXIT_MS_REDUCED,
  INTRO_MIN_MS,
  REDUCED_MIN_MS,
  RETURN_MIN_MS,
} from "./loader-logic";
import { useAppReady } from "@/hooks/use-app-ready";
import { asLang, makeT } from "@/i18n";
import type { Lang } from "@/types/home";

type Phase = "intro" | "exiting" | "done";

const SEEN_KEY = "elc-intro-seen";

/**
 * Full-screen cinematic introduction. Mounted once at the application root so
 * it plays on the initial document load only — client-side navigation never
 * re-plays it, and refreshes get the shortened returning-visitor floor. The
 * overlay never intercepts input, so it cannot trap focus.
 */
export function CinematicLoader() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [reduced, setReduced] = useState(false);
  const ready = useAppReady(phase !== "done");
  const progress = useRef<LoadingProgressHandle>(null);
  const phaseRef = useRef<Phase>("intro");
  const readyRef = useRef(false);
  const reducedRef = useRef(false);
  const minMs = useRef(INTRO_MIN_MS);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang: Lang = asLang(pathname.split("/")[1] ?? "en");
  const t = makeT(lang);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = sessionStorage.getItem(SEEN_KEY) === "1";
    const apply = (isReduced: boolean) => {
      reducedRef.current = isReduced;
      setReduced(isReduced);
      minMs.current = isReduced ? REDUCED_MIN_MS : seen ? RETURN_MIN_MS : INTRO_MIN_MS;
    };
    apply(motion.matches);
    const onChange = () => apply(motion.matches);
    motion.addEventListener("change", onChange);
    return () => motion.removeEventListener("change", onChange);
  }, []);

  const beginExit = () => {
    if (phaseRef.current !== "intro") return;
    setPhase("exiting");
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode: the intro simply plays on every load */
    }
    window.setTimeout(() => setPhase("done"), reducedRef.current ? EXIT_MS_REDUCED : EXIT_MS);
  };

  useEffect(() => {
    if (phase !== "intro") return;
    const start = performance.now();
    const tick = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const value = computeProgress(elapsed, readyRef.current, minMs.current);
      progress.current?.update(value);
      if (value >= 1) {
        window.clearInterval(tick);
        beginExit();
      }
    }, 90);
    return () => window.clearInterval(tick);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className="cinematic-loader"
      data-phase={phase}
      data-motion={reduced ? "reduced" : "full"}
      role="status"
      aria-live="polite"
    >
      <CinematicBackground />
      <FilmStrip />
      <div className="loader-center">
        <AnimatedLogo tagline={t("loader.tagline")} />
        <LoadingProgress ref={progress} label={t("loader.preparing")} />
      </div>
      <span className="sr-only">Loading ElCinema — {t("loader.preparing")}</span>
    </div>
  );
}
