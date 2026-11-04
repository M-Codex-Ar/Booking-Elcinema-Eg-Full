import { forwardRef, useImperativeHandle, useRef } from "react";

export type LoadingProgressHandle = {
  /** Writes progress straight to the DOM — no React re-render per frame. */
  update: (progress: number) => void;
};

type LoadingProgressProps = {
  /** Bilingual readiness copy announced under the progress line. */
  label: string;
};

/**
 * Thin brand-colour progress line with a percentage readout.
 * The percentage is a live region announced once, not on every tick.
 */
export const LoadingProgress = forwardRef<LoadingProgressHandle, LoadingProgressProps>(
  function LoadingProgress({ label }, ref) {
    const fillRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<HTMLSpanElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        update(progress: number) {
          const clamped = Math.max(0, Math.min(1, progress));
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${clamped})`;
          if (valueRef.current) {
            const text = `${Math.round(clamped * 100)}%`;
            if (valueRef.current.textContent !== text) valueRef.current.textContent = text;
          }
        },
      }),
      [],
    );

    return (
      <div className="loader-progress">
        <span className="loader-progress-label">{label}</span>
        <div className="loader-progress-row">
          <div className="loader-progress-track">
            <div ref={fillRef} className="loader-progress-fill" />
          </div>
          <span ref={valueRef} className="loader-progress-value" aria-hidden="true">
            0%
          </span>
        </div>
      </div>
    );
  },
);
