"use client";

import Link from "next/link";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-16 text-center">
      <PageHeading
        eyebrow="Something went wrong"
        title={[
          { text: "UNEXPECTED" },
          { text: "ERROR", tone: "primary" }
        ]}
        description="An error occurred while loading this page. You can try again or navigate elsewhere."
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
