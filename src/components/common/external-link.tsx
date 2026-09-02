import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type ExternalLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Show the outbound arrow; the screen-reader hint is always present. */
  showIcon?: boolean;
};

export function ExternalLink({ children, className, showIcon = false, ...props }: ExternalLinkProps) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-1", className)}>
      {children}
      {showIcon ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
