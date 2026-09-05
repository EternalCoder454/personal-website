"use client";

import { m, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * How far down the page you are, drawn along the bottom edge of the bar.
 *
 * It sits on top of the border rather than replacing it, so the bar
 * keeps its edge when the line is short. Two pixels: one covers the
 * existing hairline, the other is the only new weight this adds to a
 * page that is otherwise very quiet.
 *
 * The raw scroll value tracks the wheel exactly, which reads as
 * mechanical. A stiff spring lets the line arrive a beat after you stop,
 * which is the "oh?" the rest of the page is going for. Stiff enough
 * that it never feels like lag: at 260 it has settled before you have
 * finished reading the line you scrolled to.
 *
 * Under reduced motion the spring is dropped and the value is bound
 * straight through. The line still shows the position, because that is
 * information rather than decoration, and it simply stops easing.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const eased = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <m.div
      /* Native scrollbars already tell assistive technology where the
         page is. This is the same fact drawn again for sighted people. */
      aria-hidden="true"
      style={{ scaleX: reduced ? scrollYProgress : eased }}
      className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-primary"
    />
  );
}
