import { PageShell } from "@/components/common/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the token page layout so the stage does not jump when data lands. */
export default function DetailLoading() {
  return (
    <PageShell className="space-y-10 py-10" aria-busy>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-12 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-9 w-56" />
      </div>
      <Skeleton className="aspect-[1.6/1] max-h-[78svh] w-full" />
      <div className="grid gap-12 border-t border-border pt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </PageShell>
  );
}
