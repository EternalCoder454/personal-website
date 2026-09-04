"use client";

import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Loads only the part of Motion this site actually uses.
 *
 * The `motion.*` components bundle every feature Motion has, including
 * drag, layout projection and the 3D transforms, none of which appear
 * here. `m.*` plus the `domAnimation` feature set covers what we do use:
 * animations, variants, exit animations, and the hover, tap and focus
 * gestures. Measured saving on the home page is in the tens of KB.
 *
 * `strict` is deliberate. It throws if anybody imports `motion.*`
 * instead of `m.*`, which would silently pull the full bundle back in
 * and quietly undo this. A loud failure in development beats a page that
 * is 30KB heavier for reasons nobody can see.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
