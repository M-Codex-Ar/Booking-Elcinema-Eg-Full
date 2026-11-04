import type { CSSProperties } from "react";

/** Deterministic particle layout — stable across server and client renders. */
const DUST: Array<{
  left: string;
  top: string;
  size: number;
  dur: number;
  delay: number;
  x: number;
}> = [
  { left: "10%", top: "34%", size: 2, dur: 9, delay: 0.2, x: 18 },
  { left: "18%", top: "62%", size: 3, dur: 12, delay: 1.1, x: -14 },
  { left: "26%", top: "22%", size: 2, dur: 10, delay: 0.6, x: 12 },
  { left: "35%", top: "74%", size: 2, dur: 14, delay: 0, x: -20 },
  { left: "44%", top: "18%", size: 3, dur: 11, delay: 1.6, x: 16 },
  { left: "55%", top: "68%", size: 2, dur: 9.5, delay: 0.9, x: -12 },
  { left: "63%", top: "28%", size: 3, dur: 13, delay: 0.3, x: 22 },
  { left: "72%", top: "58%", size: 2, dur: 10.5, delay: 1.4, x: -18 },
  { left: "80%", top: "24%", size: 2, dur: 12.5, delay: 0.7, x: 14 },
  { left: "88%", top: "48%", size: 3, dur: 9.8, delay: 0, x: -10 },
  { left: "94%", top: "70%", size: 2, dur: 13.5, delay: 1.8, x: 16 },
  { left: "48%", top: "84%", size: 2, dur: 11.8, delay: 0.5, x: -16 },
];

/**
 * Atmospheric background: deep gradients, film grain, drifting spotlight,
 * projector beam and sparse floating dust. Pure CSS animation only.
 */
export function CinematicBackground() {
  return (
    <div aria-hidden="true" className="loader-bg-stack">
      <div className="loader-bg-layer loader-spot" />
      <div className="loader-bg-layer loader-beam" />
      {DUST.map((d, i) => (
        <span
          key={i}
          className="loader-dust"
          style={
            {
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              "--dust-dur": `${d.dur}s`,
              "--dust-delay": `${d.delay}s`,
              "--dust-x": `${d.x}px`,
            } as CSSProperties
          }
        />
      ))}
      <div className="loader-bg-layer loader-grain" />
      <div className="loader-bg-layer loader-vignette" />
      <div className="loader-gate" />
    </div>
  );
}
