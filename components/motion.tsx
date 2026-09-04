"use client";

import {
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
  type Variants,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * The motion vocabulary for the whole site. Four primitives, used
 * everywhere, so the page moves in one voice rather than six.
 *
 * The brief was "curiosity, not full blast": something should make you
 * look twice without announcing itself. In practice that means small
 * distances (10px, not 60), short durations, no bounce on entrances, and
 * every reveal firing once and never again. A page that re-animates
 * every time you scroll past is a page that is showing off.
 *
 * READ THIS BEFORE CHANGING ANY OF IT
 *
 * Reduced motion makes the animation instant. It does not skip it.
 *
 * That distinction is the difference between a working page and a blank
 * one. The server renders the hidden state into the HTML, because that
 * is what `initial` means. If the client then decides not to animate,
 * nothing ever clears those inline styles and the text stays at
 * opacity 0 forever. That happened here: useReducedMotion resolves
 * differently on the server and on the client, the components swapped to
 * a do-nothing variant after hydration, and the entire hero rendered
 * invisible.
 *
 * So every component below always animates to the shown state. The only
 * thing reduced motion changes is the duration, to zero.
 */

/* Slightly eased-out, no overshoot. Entrances should arrive, not land. */
const ease = [0.22, 0.61, 0.36, 1] as const;

const enter: Variants = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0 },
};

const move = (reduced: boolean | null, delay = 0): Transition =>
  reduced ? { duration: 0, delay: 0 } : { duration: 0.5, ease, delay };

/**
 * Reveals its children once, when they come into view.
 *
 * The margin fires it slightly before the element reaches the viewport,
 * so by the time you have actually looked at it the movement is
 * finishing rather than starting. Reveals you consciously watch are the
 * ones that feel slow.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={className}
      variants={enter}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={move(reduced, delay)}
    >
      {children}
    </m.div>
  );
}

/**
 * A list whose items arrive one after another.
 *
 * The stagger is deliberately short. Long staggers on an eight-item grid
 * mean the last card lands a second after the first, and the reader has
 * already moved on.
 */
export function Stagger({
  children,
  className = "",
  step = 0.06,
  delay = 0,
  /* "view" for anything down the page, "mount" for the hero, which is
     already on screen when the page loads and has nothing to scroll to. */
  trigger = "view",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  delay?: number;
  trigger?: "view" | "mount";
  as?: "div" | "ul" | "ol" | "dl";
}) {
  const reduced = useReducedMotion();
  const Component = m[Tag];

  const variants: Variants = {
    hidden: {},
    shown: {
      transition: {
        staggerChildren: reduced ? 0 : step,
        delayChildren: reduced ? 0 : delay,
      },
    },
  };

  if (trigger === "mount") {
    return (
      <Component className={className} initial="hidden" animate="shown" variants={variants}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={variants}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const Component = m[Tag];

  return (
    <Component className={className} variants={enter} transition={move(reduced)}>
      {children}
    </Component>
  );
}

/**
 * A number that counts up the first time you see it.
 *
 * This is the one moment on the page allowed to be a little pleased with
 * itself, and it earns it: the three prices are the whole offer, and
 * watching $9.99 arrive makes you read it rather than skim it.
 *
 * The rendered text starts at the final value, so if the animation never
 * runs the correct number is already on screen.
 */
export function CountUp({
  value,
  prefix = "",
  decimals = 2,
  className = "",
}: {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  const count = useMotionValue(value);
  const text = useTransform(count, (n) => `${prefix}${n.toFixed(decimals)}`);

  useEffect(() => {
    if (!inView || reduced) return;
    count.set(0);
    const controls = animate(count, value, { duration: 1.1, ease });
    return () => controls.stop();
  }, [inView, reduced, count, value]);

  return (
    <span ref={ref} className={className}>
      {/* aria-hidden on the animating text, with the real value beside it
          for anything reading the page rather than watching it. */}
      <m.span aria-hidden="true">{text}</m.span>
      <span className="sr-only">{`${prefix}${value.toFixed(decimals)}`}</span>
    </span>
  );
}
