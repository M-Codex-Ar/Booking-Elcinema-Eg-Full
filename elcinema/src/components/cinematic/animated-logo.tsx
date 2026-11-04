import type { CSSProperties } from "react";

const LETTERS = ["E", "L", "C", "I", "N", "E", "M", "A"];

export function FilmReelMark(props: { className?: string }) {
  const holes = [0, 60, 120, 180, 240, 300].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { cx: 32 + 16 * Math.cos(rad), cy: 32 + 16 * Math.sin(rad) };
  });
  return (
    <svg viewBox="0 0 64 64" fill="none" className={props.className} aria-hidden="true">
      <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="5.5" fill="currentColor" />
      {holes.map((h, i) => (
        <circle key={i} cx={h.cx} cy={h.cy} r="5.5" fill="currentColor" opacity="0.85" />
      ))}
    </svg>
  );
}

/** ElCinema brand reveal: film-reel mark, staggered wordmark, light sweep, tagline. */
export function AnimatedLogo({ tagline }: { tagline: string }) {
  return (
    <div className="loader-logo">
      <FilmReelMark className="loader-mark" />
      <div className="loader-wordmark" role="img" aria-label="ElCinema">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="loader-letter"
            style={{ "--i": i } as CSSProperties}
          >
            {letter}
          </span>
        ))}
        <span className="loader-sweep" aria-hidden="true" />
      </div>
      <div className="loader-tagline-line" aria-hidden="true" />
      <p className="loader-tagline">{tagline}</p>
    </div>
  );
}
