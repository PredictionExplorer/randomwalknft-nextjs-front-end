import { PageShell } from "@/components/common/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DetailLoading() {
  return (
    <PageShell className="space-y-8 py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <Skeleton className="aspect-[1.6/1] w-full rounded-[1.75rem]" />
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-[1.75rem]" />
          <Skeleton className="h-72 w-full rounded-[1.75rem]" />
        </div>
      </div>
    </PageShell>
  );
}
