import Image from "next/image";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-5 rounded-2xl border border-border/50 bg-card/40 px-6 py-16 text-center", className)}>
      <Image src="/images/question.svg" alt="" width={48} height={48} className="opacity-40" aria-hidden />
      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
