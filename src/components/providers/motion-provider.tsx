"use client";

import { LazyMotion, MotionConfig } from "motion/react";

// Only the DOM animation feature set is shipped (no drag/layout), loaded on demand.
const loadFeatures = () => import("motion/react").then((mod) => mod.domAnimation);

/** Motion is opt-in per component through `m.*`; `reducedMotion="user"` honours the OS setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
