import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { CodeArtifactCard } from "@/components/code/code-artifact-card";
import { IpfsLink } from "@/components/code/ipfs-link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generatorFiles } from "@/lib/content/generation-code";

export const metadata: Metadata = {
  title: "Open Source",
  description:
    "Every Random Walk NFT can be independently verified. View the complete source code, dependencies, and reproduction steps — nothing is hidden.",
  alternates: { canonical: "/code" },
  openGraph: {
    title: "Open Source | Random Walk NFT",
    description:
      "Every Random Walk NFT can be independently verified. View the complete source code, dependencies, and reproduction steps — nothing is hidden."
  }
};

export default function CodePage() {
  return (
    <PageShell className="space-y-10 py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "Open Source" }
        ]}
      />
      <PageHeading
        eyebrow="Fully verifiable"
        title={[
          { text: "OPEN" },
          { text: "SOURCE", tone: "secondary" }
        ]}
        description="Every Random Walk NFT can be independently verified. The complete source code, dependencies, and reproduction steps are published here — nothing is hidden."
      />

      <Card className="bg-card/70">
        <CardContent className="grid gap-5 p-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">1. Set up your environment</p>
            <p className="text-sm leading-7 text-muted-foreground">
              The generator requires a system-level image library. The Guide tab below walks you through installing it on Ubuntu or any compatible system.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">2. Install dependencies</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Install the pinned library versions listed in the Dependencies tab to ensure your output matches exactly.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">3. Generate your artwork</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Run the generator with any token number. It fetches the seed from Arbitrum and renders both the black and white image and video variants.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70">
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Permanent IPFS backup</p>
            <p className="text-sm leading-7 text-muted-foreground">
              All generation code and files shown on this page are also stored on IPFS.
              If this website ever becomes unavailable, you can retrieve everything
              from IPFS and recreate the artwork from scratch.
            </p>
          </div>
          <IpfsLink
            uri="ipfs://QmP7Z8VbQLpytzXnceeAAc4D5tX39XVzoEeUZwEK8aPk8W"
            gatewayUrl="https://ipfs.io/ipfs/QmP7Z8VbQLpytzXnceeAAc4D5tX39XVzoEeUZwEK8aPk8W"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="guide">
        <TabsList>
          <TabsTrigger value="guide">How to reproduce</TabsTrigger>
          <TabsTrigger value="requirements">Dependencies</TabsTrigger>
          <TabsTrigger value="source">Source code</TabsTrigger>
        </TabsList>
        <TabsContent value="guide">
          <CodeArtifactCard
            title="Reproduction guide"
            description="Step-by-step instructions to generate any Random Walk NFT artwork on your own computer."
            content={generatorFiles.readme}
            fileName={generatorFiles.readmeFileName}
          />
        </TabsContent>
        <TabsContent value="requirements">
          <CodeArtifactCard
            title="Pinned dependencies"
            description="The exact library versions used by the generator — install these before running."
            content={generatorFiles.requirements}
            fileName={generatorFiles.requirementsFileName}
          />
        </TabsContent>
        <TabsContent value="source">
          <CodeArtifactCard
            title="Generator source code"
            description="The complete code that turns an on-chain seed into images and videos."
            content={generatorFiles.source}
            fileName={generatorFiles.sourceFileName}
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
