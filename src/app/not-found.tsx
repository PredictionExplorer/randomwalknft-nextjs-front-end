import Link from "next/link";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <PageShell className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-16 text-center">
      <PageHeading
        eyebrow="404"
        title={[
          { text: "PAGE" },
          { text: "NOT", tone: "primary" },
          { text: "FOUND", tone: "secondary" }
        ]}
        description="The page you are looking for does not exist or has been moved."
      />
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gallery">Browse collection</Link>
        </Button>
      </div>
    </PageShell>
  );
}
