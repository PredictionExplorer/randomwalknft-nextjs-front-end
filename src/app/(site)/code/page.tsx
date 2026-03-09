import type { Metadata } from "next";
import Link from "next/link";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { generationCode } from "@/lib/content/generation-code";

export const metadata: Metadata = {
  title: "Generation Code"
};

export default function CodePage() {
  return (
    <PageShell className="space-y-10 py-16">
      <PageHeading
        title={[
          { text: "GENERATION" },
          { text: "CODE", tone: "secondary" }
        ]}
        description="A representative excerpt of the Python process that turns an on-chain seed into still images and videos."
      />

      <Card>
        <CardContent className="space-y-6 p-6">
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            The full source is also pinned on IPFS:
            {" "}
            <Link
              href="https://cloudflare-ipfs.com/ipfs/QmP7Z8VbQLpytzXnceeAAc4D5tX39XVzoEeUZwEK8aPk8W"
              target="_blank"
              className="text-secondary underline underline-offset-4"
            >
              ipfs://QmP7Z8VbQLpytzXnceeAAc4D5tX39XVzoEeUZwEK8aPk8W
            </Link>
          </p>
          <pre className="overflow-x-auto rounded-[1.25rem] border border-border/60 bg-[#09090c] p-5 text-sm leading-6 text-slate-200">
            <code>{generationCode}</code>
          </pre>
        </CardContent>
      </Card>
    </PageShell>
  );
}
