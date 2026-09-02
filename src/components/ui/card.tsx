import type * as React from "react";

import { cn } from "@/lib/utils";

/** A museum plaque: hairline border, flat surface, no glow. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border bg-card text-card-foreground", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Heading level so cards nested under a section `h2` keep a valid outline. */
  as?: "h2" | "h3" | "h4" | "p";
};

export function CardTitle({ as: Tag = "h2", className, children, ...props }: CardTitleProps) {
  return (
    <Tag className={cn("text-lg font-medium tracking-tight", className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />;
}
