"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, animate, motion } from "motion/react";
import useMeasure from "react-use-measure";

export type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  label?: string;
  href?: string;
};

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  pauseOnInteraction?: boolean;
  draggable?: boolean;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export const InfiniteSlider = memo(function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  pauseOnInteraction = false,
  draggable = false,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const visibilityRef = useRef<HTMLDivElement>(null);
  const isPaused =
    reducedMotion ||
    !isVisible ||
    (pauseOnInteraction && (isHovering || isFocused)) ||
    (draggable && isDragging);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = visibilityRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
      { threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const size = direction === "horizontal" ? width : height;
    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    let controls: { stop: () => void } | undefined;

    if (isPaused) return;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prev) => prev + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: currentDuration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => translation.set(from),
      });
    }

    return () => controls?.stop();
  }, [
    key,
    translation,
    currentDuration,
    width,
    height,
    gap,
    isPaused,
    isTransitioning,
    direction,
    reverse,
  ]);

  const pauseForInteraction = () => setIsTransitioning(true);
  const resumeAfterInteraction = () => {
    setCurrentDuration(duration);
  };

  const hoverProps =
    durationOnHover || pauseOnInteraction
      ? {
          onHoverStart: () => {
            if (pauseOnInteraction) {
              setIsHovering(true);
              pauseForInteraction();
            } else {
              setIsTransitioning(true);
              setCurrentDuration(durationOnHover ?? duration);
            }
          },
          onHoverEnd: () => {
            if (pauseOnInteraction) {
              setIsHovering(false);
              resumeAfterInteraction();
            } else {
              setIsTransitioning(true);
              setCurrentDuration(duration);
            }
          },
        }
      : {};

  const focusProps = pauseOnInteraction
    ? {
        onFocusCapture: () => {
          setIsFocused(true);
          pauseForInteraction();
        },
        onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsFocused(false);
            resumeAfterInteraction();
          }
        },
      }
    : {};

  const dragProps = draggable
    ? {
        drag: direction === "horizontal" ? ("x" as const) : ("y" as const),
        dragConstraints:
          direction === "horizontal"
            ? { left: -width / 2, right: 0 }
            : { top: -height / 2, bottom: 0 },
        dragElastic: 0,
        onDragStart: () => {
          setIsDragging(true);
          pauseForInteraction();
        },
        onDragEnd: () => {
          setIsDragging(false);
          resumeAfterInteraction();
        },
      }
    : {};

  return (
    <div ref={visibilityRef} className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className={cn("flex w-max", draggable && "cursor-grab touch-pan-y active:cursor-grabbing")}
        style={{
          ...(direction === "horizontal" ? { x: translation } : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        {...hoverProps}
        {...focusProps}
        {...dragProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
});

export const LogoImage = memo(function LogoImage({ logo }: { logo: Logo }) {
  return (
    <img
      alt={logo.alt}
      src={logo.src}
      width={logo.width ?? "auto"}
      height={logo.height ?? "auto"}
      loading="lazy"
      className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
    />
  );
});

export const LogoMarquee = memo(function LogoMarquee({
  logos,
  className,
}: {
  logos: Logo[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto overflow-hidden py-4 mask-[linear-gradient(to_right,transparent,black_25%,black_75%,transparent)]",
        className,
      )}
    >
      <InfiniteSlider gap={42} reverse duration={80} durationOnHover={25}>
        {[...logos, ...logos].map((logo, i) => (
          <LogoImage key={`${logo.alt}-${i}`} logo={logo} />
        ))}
      </InfiniteSlider>
    </div>
  );
});

LogoMarquee.displayName = "LogoMarquee";
export default LogoMarquee;
