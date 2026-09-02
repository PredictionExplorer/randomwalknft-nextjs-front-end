import Link from "next/link";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <PageShell className="flex min-h-[60vh] flex-col items-center justify-center gap-8 py-16 text-center">
      <PageHeading
        align="center"
        eyebrow="404 · no such room"
        title="This walk leads nowhere."
        description="The page you are looking for does not exist or has been moved. Every real work has a number; try the collection."
      />
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/gallery">Browse the collection</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to the entrance</Link>
        </Button>
      </div>
    </PageShell>
  );
}
