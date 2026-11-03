import { useEffect, useMemo, useRef, useState } from "react";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlasUrl from "world-atlas/countries-110m.json?url";

interface WorldTopology {
  type: "Topology";
  arcs: number[][][];
  objects: {
    countries: {
      type: "GeometryCollection";
      geometries: unknown[];
    };
  };
}

export function ContactGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<GeoPermissibleObjects[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch(worldAtlasUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load the local globe map.");
        return response.json() as Promise<WorldTopology>;
      })
      .then((world) => {
        if (cancelled) return;
        const countryFeatures = feature(world as Parameters<typeof feature>[0], "countries");
        if ("features" in countryFeatures) {
          setCountries(countryFeatures.features as GeoPermissibleObjects[]);
        }
      })
      .catch(() => {
        // Keep the graticule visible if the bundled map asset cannot be read.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
      { threshold: 0.1 },
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;

    let frame = 0;
    let lastFrame = 0;
    const rotate = (time: number) => {
      if (time - lastFrame >= 40) {
        setRotation((current) => (current + 0.24) % 360);
        lastFrame = time;
      }
      frame = requestAnimationFrame(rotate);
    };

    frame = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(frame);
  }, [isVisible, prefersReducedMotion]);

  const projection = useMemo(
    () =>
      geoOrthographic()
        .clipAngle(90)
        .precision(0.35)
        .scale(350)
        .translate([360, 370])
        .rotate([rotation, -18, 0]),
    [rotation],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const spherePath = path({ type: "Sphere" });
  const graticulePath = path(geoGraticule10());

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative mx-auto mt-6 w-full max-w-2xl overflow-hidden text-primary/75"
    >
      <svg className="block h-auto w-full" viewBox="0 0 720 390" fill="none">
        <path d={spherePath ?? undefined} stroke="currentColor" strokeWidth="1.6" />
        <path
          d={graticulePath ?? undefined}
          stroke="currentColor"
          strokeOpacity=".3"
          strokeWidth=".8"
        />
        {countries.map((country, index) => (
          <path
            key={index}
            d={path(country) ?? undefined}
            stroke="currentColor"
            strokeOpacity=".78"
            strokeWidth=".72"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
