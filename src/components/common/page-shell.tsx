import type * as React from "react";

import { cn } from "@/lib/utils";

type PageShellProps = React.HTMLAttributes<HTMLDivElement> & {
  /** `wide` is the standard gallery measure; `narrow` suits long-form reading. */
  width?: "wide" | "narrow";
};

export function PageShell({ className, children, width = "wide", ...props }: PageShellProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", width === "wide" ? "max-w-7xl" : "max-w-3xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}
