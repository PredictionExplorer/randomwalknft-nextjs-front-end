"use client";

import Link from "next/link";

import { isRandomWalkBackendUnavailableMessage } from "@/lib/api/backend-errors";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const backendDown = isRandomWalkBackendUnavailableMessage(error.message);

  return (
    <PageShell className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-16 text-center">
      <PageHeading
        eyebrow={backendDown ? "RandomWalk backend" : "Something went wrong"}
        title={
          backendDown
            ? [{ text: "BACKEND" }, { text: "API DOWN", tone: "primary" }]
            : [{ text: "UNEXPECTED" }, { text: "ERROR", tone: "primary" }]
        }
        description={
          backendDown
            ? error.message
            : "An error occurred while loading this page. You can try again or navigate elsewhere."
        }
      />
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </PageShell>
  );
}
