import { ExternalLink as ExternalLinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ExternalLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  showIcon?: boolean;
};

export function ExternalLink({
  children,
  className,
  showIcon = false,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1", className)}
    >
      {children}
      {showIcon ? <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0" /> : null}
    </a>
  );
}
