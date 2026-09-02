import { cn } from "@/lib/utils";

/**
 * The site mark: a short lattice walk drawn as a single stroke, ending in the
 * walker's head. It inherits `currentColor`, so it reads in either wing.
 */
export function WalkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-foreground", className)} aria-hidden fill="none">
      <path
        d="M4 20h4v-8h4v12h4v-6h4V8h4v10h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="26" y="16" width="4" height="4" fill="var(--accent)" />
    </svg>
  );
}
