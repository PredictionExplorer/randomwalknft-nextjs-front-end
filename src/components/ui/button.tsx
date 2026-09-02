import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium tracking-tight transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Bone fill: the main action on a page. */
        default: "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        /** Brass: reserved for the Vault, the key, minting. */
        accent:
          "border-accent bg-accent text-accent-foreground shadow-[0_0_0_1px_var(--accent-soft),0_8px_30px_-12px_var(--accent)] hover:brightness-110",
        outline: "border-border-strong bg-transparent text-foreground hover:border-foreground/60 hover:bg-foreground/5",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-foreground/6",
        secondary: "border-border bg-foreground/6 text-foreground hover:bg-foreground/10",
        destructive: "border-danger/40 bg-danger/10 text-danger hover:bg-danger/20"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-[0.8125rem]",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "h-10 w-10"
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
