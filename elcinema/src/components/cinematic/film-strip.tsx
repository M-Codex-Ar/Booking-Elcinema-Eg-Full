export type FilmStripFrame = {
  src: string;
};

/**
 * Cinematic frames riding the bottom of the first load. The default set is the
 * app's own mirrored catalogue artwork (see `src/lib/images.ts`); callers can
 * pass their own sequence when a page owns the experience.
 */
const DEFAULT_FRAMES: FilmStripFrame[] = [
  { src: "/images/posters/2090950.jpg" },
  { src: "/images/posters/2093435.jpg" },
  { src: "/images/posters/2095519.jpg" },
  { src: "/images/posters/2097360.jpg" },
];

/** How many times the frame sequence repeats per film strip group. */
const REPEATS = 1;

/** Slow horizontal film strip riding along the bottom of the intro. */
export function FilmStrip({ frames }: { frames?: FilmStripFrame[] }) {
  const source = frames && frames.length > 0 ? frames : DEFAULT_FRAMES;

  const groups = [0, 1].map((group) => (
    <div key={group} className="film-strip-group">
      <div className="film-perf" />
      <div className="film-frames">
        {Array.from({ length: source.length * REPEATS }, (_, i) => (
          <div key={i} className="film-frame">
            <img
              src={source[i % source.length]!.src}
              alt=""
              suppressHydrationWarning
              width={132}
              height={88}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
      <div className="film-perf" />
    </div>
  ));

  return (
    <div className="film-strip-scene" aria-hidden="true">
      <div className="film-strip">
        <div className="film-strip-track">{groups}</div>
      </div>
    </div>
  );
}
