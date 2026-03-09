import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { CodeArtifactCard } from "@/components/code/code-artifact-card";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generatorFiles } from "@/lib/content/generation-code";

export const metadata: Metadata = {
  title: "Generation Code",
  description:
    "View the complete Python generator, pinned dependencies, and step-by-step instructions to reproduce any Random Walk NFT artwork locally.",
  alternates: { canonical: "/code" },
  openGraph: {
    title: "Generation Code | Random Walk NFT",
    description:
      "View the complete Python generator, pinned dependencies, and step-by-step instructions to reproduce any Random Walk NFT artwork locally."
  }
};

export default function CodePage() {
  return (
    <PageShell className="space-y-10 py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "Generation Code" }
        ]}
      />
      <PageHeading
        eyebrow="Full reproducibility"
        title={[
          { text: "GENERATION" },
          { text: "CODE", tone: "secondary" }
        ]}
        description="The complete Python generator, the exact dependencies, and the local reproduction steps needed to regenerate Random Walk NFT media on your own machine."
      />

      <Card className="bg-card/70">
        <CardContent className="grid gap-5 p-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">1. Install system packages</p>
            <p className="text-sm leading-7 text-muted-foreground">
              The original generator expects OpenCV at the system level. On Ubuntu the documented path is `apt-get update && apt-get install -y python3-opencv`.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">2. Install Python deps</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Use the exact requirements file below to install Pillow, NumPy, OpenCV, and requests in a clean Python environment.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">3. Generate from a token</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Run `python3 randomWalkGen.py &lt;NFT number&gt;` and the generator will fetch the seed from Arbitrum, then render both black and white outputs locally.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="guide">
        <TabsList>
          <TabsTrigger value="guide">Guide</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="source">Full source</TabsTrigger>
        </TabsList>
        <TabsContent value="guide">
          <CodeArtifactCard
            title="Reproduction steps"
            description="The exact instructions bundled with the generator so collectors can reproduce the media on their own machine."
            content={generatorFiles.readme}
            fileName={generatorFiles.readmeFileName}
          />
        </TabsContent>
        <TabsContent value="requirements">
          <CodeArtifactCard
            title="Python requirements"
            description="Install these pinned Python dependencies before running the generator."
            content={generatorFiles.requirements}
            fileName={generatorFiles.requirementsFileName}
          />
        </TabsContent>
        <TabsContent value="source">
          <CodeArtifactCard
            title="Complete Python generator"
            description="This is the full generator code, including RPC seed lookup, image rendering, and single/triple video generation."
            content={generatorFiles.source}
            fileName={generatorFiles.sourceFileName}
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
