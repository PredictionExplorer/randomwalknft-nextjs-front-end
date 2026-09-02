import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[0_0_18px_rgba(198,118,215,0.28)] hover:bg-primary/90",
        outline: "border-border bg-transparent text-foreground hover:border-primary hover:bg-primary/10",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-accent",
        secondary: "border-secondary bg-secondary/12 text-secondary hover:bg-secondary/20",
        destructive: "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6",
        icon: "h-10 w-10 rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the styles onto the child element (e.g. a `Link`) instead of a `<button>`. */
    asChild?: boolean;
  };

/** React 19: `ref` is a regular prop, so no `forwardRef` wrapper is needed. */
function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
