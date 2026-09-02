import { cn } from "@/lib/utils";

/** Loading placeholder; the sheen is disabled automatically under reduced motion (see globals.css). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-foreground/6 before:to-transparent",
        className
      )}
    />
  );
}
