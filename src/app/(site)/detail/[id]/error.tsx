"use client";

import Link from "next/link";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

export default function DetailErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-16 text-center">
      <PageHeading
        eyebrow="Error loading NFT"
        title={[
          { text: "COULD NOT" },
          { text: "LOAD", tone: "primary" },
          { text: "DETAIL", tone: "secondary" }
        ]}
        description="There was a problem loading this NFT. The token may not exist or the server may be temporarily unavailable."
      />
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/gallery">Back to collection</Link>
        </Button>
      </div>
    </PageShell>
  );
}
