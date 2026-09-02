"use client";

import Link from "next/link";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { isRandomWalkBackendUnavailableMessage } from "@/lib/api/backend-errors";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const backendDown = isRandomWalkBackendUnavailableMessage(error.message);

  return (
    <PageShell className="flex min-h-[60vh] flex-col items-center justify-center gap-8 py-16 text-center">
      <PageHeading
        align="center"
        eyebrow={backendDown ? "Backend unreachable" : "Something went wrong"}
        title={backendDown ? "The gallery cannot reach its archive." : "This room failed to load."}
        description={
          backendDown
            ? error.message
            : "An error occurred while loading this page. You can try again or walk to another room."
        }
      />
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to the entrance</Link>
        </Button>
      </div>
      {error.digest ? <p className="eyebrow">Reference {error.digest}</p> : null}
    </PageShell>
  );
}
