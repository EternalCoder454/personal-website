"use client";

import { m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { heroShots } from "@/lib/site";
import { useLightbox } from "@/components/lightbox";

/**
 * Three real captures that cycle like a slow carousel, lift a little
 * under the cursor, and open full size when clicked.
 *
 * Only transforms are animated. Animating top/left would relayout on
 * every frame; x, y, scale and opacity are composited, so this stays
 * cheap even with three cards moving at once.
 *
 * The cycle stops whenever it should: under prefers-reduced-motion it
 * never starts, it pauses while the cursor is over the stack so nothing
 * slides away from underneath a click, and it stops when the tab is in
 * the background rather than animating to an empty room.
 */

/* Slot geometry, as percentages of each card's own box. */
const slots = [
  { x: "0%", y: "30%", scale: 1, opacity: 1, zIndex: 3 },
  { x: "12%", y: "-4%", scale: 0.88, opacity: 0.7, zIndex: 2 },
  { x: "7%", y: "62%", scale: 0.8, opacity: 0.5, zIndex: 1 },
];

const CYCLE_MS = 2800;

/* The cards glide between slots: a spring damped past the point where it
   would overshoot, so the movement is continuous rather than a series of
   little arrivals. The bounce is reserved for hover, where a person
   caused it and expects a reaction. */
const glide = { type: "spring", stiffness: 140, damping: 24, mass: 0.9 } as const;
const bounce = { type: "spring", stiffness: 420, damping: 13, mass: 0.7 } as const;

export function HeroStack() {
  const reduced = useReducedMotion();
  const { open } = useLightbox();
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      timer ??= setInterval(
        () => setFront((f) => (f + 1) % heroShots.length),
        CYCLE_MS,
      );
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    /* A carousel rotating in a background tab is work nobody sees. */
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, paused]);

  return (
    <div
      className="relative hidden aspect-[5/4] w-full lg:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {heroShots.map((shot, index) => {
        /* How far this card sits behind the current front one. */
        const slot = slots[(index - front + slots.length) % slots.length];

        return (
          <m.button
            key={shot.src}
            type="button"
            onClick={() => open(shot)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-label={`Enlarge: ${shot.alt}`}
            className="absolute top-0 left-0 w-[94%] cursor-zoom-in overflow-hidden rounded-[var(--radius-md)] border border-outline-variant bg-surface-low text-left shadow-2xl shadow-black/60"
            initial={false}
            animate={slot}
            whileHover={
              reduced
                ? undefined
                : { scale: slot.scale * 1.04, opacity: 1, transition: bounce }
            }
            whileTap={reduced ? undefined : { scale: slot.scale * 0.985 }}
            transition={reduced ? { duration: 0 } : glide}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt=""
              width={shot.width}
              height={shot.height}
              /* The front card is what a desktop visitor looks at first.
                 The rest stay lazy, and the whole stack is display:none
                 below lg, which is what keeps a phone from fetching it. */
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              className="h-auto w-full"
            />
          </m.button>
        );
      })}
    </div>
  );
}
