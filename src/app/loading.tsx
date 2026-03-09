import { PageShell } from "@/components/common/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <PageShell className="space-y-8 py-20">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-6 w-[min(100%,42rem)]" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[1.6/1] w-full rounded-[1.75rem]" />
        ))}
      </div>
    </PageShell>
  );
}
