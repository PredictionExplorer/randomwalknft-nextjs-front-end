import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { PageShell } from "@/components/common/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

const RandomVideoExperience = dynamic(
  () => import("@/components/feature/random-video-experience").then((mod) => mod.RandomVideoExperience),
  {
    loading: () => (
      <PageShell className="py-16">
        <Skeleton className="aspect-video w-full" />
      </PageShell>
    )
  }
);

export const metadata: Metadata = {
  title: "Random Video"
};

export default function RandomVideoPage() {
  return <RandomVideoExperience />;
}
