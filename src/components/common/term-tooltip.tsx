import { cn } from "@/lib/utils";

type TermTooltipProps = {
  id: string;
  term: string;
  definition: string;
  className?: string;
};

export function TermTooltip({ id, term, definition, className }: TermTooltipProps) {
  const tooltipId = `${id}-definition`;

  return (
    <span className={cn("group relative inline-flex align-baseline", className)}>
      <button
        type="button"
        aria-describedby={tooltipId}
        className="cursor-help rounded-sm border-b border-dotted border-border-strong text-foreground outline-none transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {term}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-64 -translate-x-1/2 rounded-md border border-border bg-popover px-4 py-3 text-left text-xs leading-6 text-muted-foreground opacity-0 shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {definition}
      </span>
    </span>
  );
}
