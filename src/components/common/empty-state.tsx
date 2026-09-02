import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-border-strong px-6 py-16 text-center",
        className
      )}
    >
      <span className="font-display text-4xl text-muted-foreground" aria-hidden>
        ∅
      </span>
      <div className="space-y-2">
        <p className="text-lg font-medium text-foreground">{title}</p>
        <p className="max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
