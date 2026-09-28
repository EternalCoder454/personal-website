"use client";

import { m, useReducedMotion } from "motion/react";

/**
 * The kit's icon and wordmark, arriving once on load.
 *
 * The icon settles into place, then the wordmark slides in beside it. It
 * takes under a second and happens once, the one moment in the header that
 * moves. Both are the kit's own SVGs in the dark version, because the Muster
 * pages this header sits on are dark.
 */
export function AnimatedWordmark() {
  const reduced = useReducedMotion();
  /* Instant, never skipped. A branch that renders a different tree would
     leave the server-rendered hidden styles in place forever. */
  const step = reduced
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const };

  return (
    <m.span
      className="flex items-center gap-2.5"
      initial="hidden"
      animate="shown"
      variants={{
        hidden: {},
        shown: {
          transition: {
            staggerChildren: reduced ? 0 : 0.12,
            delayChildren: reduced ? 0 : 0.1,
          },
        },
      }}
    >
      <m.img
        src="/brand/eterneon-icon-dark.svg"
        alt=""
        width={30}
        height={30}
        className="block"
        variants={{ hidden: { opacity: 0, scale: 0.85 }, shown: { opacity: 1, scale: 1 } }}
        transition={step}
      />
      <m.img
        src="/brand/eterneon-wordmark-dark.svg"
        alt="Eterneon"
        width={107}
        height={14}
        className="block"
        variants={{ hidden: { opacity: 0, x: -6 }, shown: { opacity: 1, x: 0 } }}
        transition={step}
      />
    </m.span>
  );
}
