import type { CSSProperties } from "react";

/** Deterministic particle layout — stable across server and client renders. */
const DUST: Array<{
  left: string;
  top: string;
  size: number;
}> = [
  { left: "16%", top: "36%", size: 2 },
  { left: "39%", top: "72%", size: 3 },
  { left: "67%", top: "27%", size: 2 },
  { left: "87%", top: "64%", size: 2 },
];

/**
 * Lightweight atmospheric background: a static spotlight and sparse dust with
 * a single animated projector beam.
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
            } as CSSProperties
          }
        />
      ))}
      <div className="loader-gate" />
    </div>
  );
}
