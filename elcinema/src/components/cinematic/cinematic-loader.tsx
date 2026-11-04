import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CinematicBackground } from "./cinematic-background";
import { AnimatedLogo } from "./animated-logo";
import { FilmStrip } from "./film-strip";
import { LoadingProgress, type LoadingProgressHandle } from "./loading-progress";
import { computeProgress, EXIT_MS, EXIT_MS_REDUCED } from "./loader-logic";
import { useAppReady } from "@/hooks/use-app-ready";
import { asLang, makeT } from "@/i18n";
import type { Lang } from "@/types/home";

type Phase = "intro" | "exiting" | "done";

/**
 * Full-screen cinematic introduction. Mounted at the application root so it
 * can cover slow hydration on an initial document load. It never adds a fixed
 * presentation delay, and client-side navigation never replays it.
 */
export function CinematicLoader() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [reduced, setReduced] = useState(false);
  const ready = useAppReady(phase !== "done");
  const progress = useRef<LoadingProgressHandle>(null);
  const phaseRef = useRef<Phase>("intro");
  const readyRef = useRef(false);
  const reducedRef = useRef(false);

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
    const apply = (isReduced: boolean) => {
      reducedRef.current = isReduced;
      setReduced(isReduced);
    };
    apply(motion.matches);
    const onChange = () => apply(motion.matches);
    motion.addEventListener("change", onChange);
    return () => motion.removeEventListener("change", onChange);
  }, []);

  const beginExit = () => {
    if (phaseRef.current !== "intro") return;
    setPhase("exiting");
    window.setTimeout(() => setPhase("done"), reducedRef.current ? EXIT_MS_REDUCED : EXIT_MS);
  };

  useEffect(() => {
    if (phase !== "intro") return;
    const start = performance.now();
    const tick = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const value = computeProgress(elapsed, readyRef.current);
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
