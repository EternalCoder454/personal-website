"use client";

import { m, useReducedMotion } from "motion/react";

/**
 * The mark, drawing itself once on load.
 *
 * The frame appears, then the three bars stand up in sequence, then the
 * baseline runs across. It takes under a second and happens once. This
 * is the "oh?" moment the rest of the page deliberately does not chase:
 * it reads as the product switching on, and it is over before anybody
 * decides whether they were meant to watch it.
 *
 * Bars grow from their own base rather than their centre, which is why
 * each one carries its own transform origin.
 */
const bar = {
  hidden: { scaleY: 0, opacity: 0 },
  shown: { scaleY: 1, opacity: 1 },
};

export function AnimatedWordmark() {
  const reduced = useReducedMotion();
  /* Instant, never skipped. A branch that renders a different tree would
     leave the server-rendered hidden styles in place forever. */
  const step = reduced
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const };

  return (
    <m.span
      className="flex items-center gap-3"
      initial="hidden"
      animate="shown"
      variants={{
        hidden: {},
        shown: {
          transition: {
            staggerChildren: reduced ? 0 : 0.07,
            delayChildren: reduced ? 0 : 0.1,
          },
        },
      }}
    >
      <svg viewBox="0 0 100 100" width="30" height="30" fill="none" aria-hidden="true">
        <m.path
          fill="currentColor"
          fillRule="evenodd"
          d="M0 0H100V100H30L0 70Z M12 12H88V88H35L12 65Z"
          className="text-on-surface"
          variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
          transition={step}
        />
        {[
          { x: 27, fill: "currentColor", className: "text-on-surface" },
          { x: 45, fill: "currentColor", className: "text-primary" },
          { x: 63, fill: "currentColor", className: "text-on-surface" },
        ].map((rect) => (
          <m.rect
            key={rect.x}
            x={rect.x}
            y={25}
            width={10}
            height={36}
            fill={rect.fill}
            className={rect.className}
            style={{ transformOrigin: `${rect.x + 5}px 61px` }}
            variants={bar}
            transition={step}
          />
        ))}
        <m.rect
          x={27}
          y={65}
          width={46}
          height={10}
          fill="currentColor"
          className="text-on-surface"
          style={{ transformOrigin: "27px 70px" }}
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
          transition={step}
        />
      </svg>

      <m.span
        className="font-sans text-[20px] font-black tracking-[-0.02em] text-on-surface uppercase"
        variants={{ hidden: { opacity: 0, x: -6 }, shown: { opacity: 1, x: 0 } }}
        transition={step}
      >
        Eterneon
      </m.span>
    </m.span>
  );
}

