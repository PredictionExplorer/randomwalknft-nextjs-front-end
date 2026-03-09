import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { PageShell } from "@/components/common/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

const CompareExperience = dynamic(
  () => import("@/components/feature/compare-experience").then((mod) => mod.CompareExperience),
  {
    loading: () => (
      <PageShell className="space-y-8 py-16">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </div>
      </PageShell>
    )
  }
);

export const metadata: Metadata = {
  title: "Beauty Contest"
};

export default function ComparePage() {
  return <CompareExperience />;
}
