import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-border-strong bg-foreground/6 text-foreground",
        secondary: "border-border bg-transparent text-secondary",
        muted: "border-border bg-muted text-muted-foreground",
        accent: "border-accent/50 bg-accent-soft text-accent",
        success: "border-success/40 bg-success/10 text-success"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
