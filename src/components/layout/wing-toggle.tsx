"use client";

import { Moon, Sun } from "lucide-react";

import { useWing } from "@/components/providers/wing-provider";
import { cn } from "@/lib/utils";

/**
 * Switches between the dark and light wings. Every artwork on the page follows,
 * swapping to its black or white edition.
 */
export function WingToggle({ className }: { className?: string }) {
  const { wing, toggleWing } = useWing();
  const light = wing === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label={light ? "Switch to the dark wing" : "Switch to the light wing"}
      title={light ? "Dark wing" : "Light wing"}
      onClick={toggleWing}
      data-testid="wing-toggle"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {light ? <Sun className="h-3.5 w-3.5" aria-hidden /> : <Moon className="h-3.5 w-3.5" aria-hidden />}
      <span className="hidden sm:inline">{light ? "Light wing" : "Dark wing"}</span>
    </button>
  );
}
