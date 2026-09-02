import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/json-ld";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { AtelierStudio } from "@/components/feature/atelier-studio";
import { Button } from "@/components/ui/button";
import { getBaseConfig } from "@/lib/config";
import { isSeedHex } from "@/lib/walk/walk-engine";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_TITLE = "The Atelier — draw a Random Walk from any seed";
const PAGE_DESCRIPTION =
  "Run the real Random Walk NFT generator in your browser. Paste an on-chain seed, type any text, or roll a random seed and watch a walk draw itself point by point in the black and white editions.";

export const metadata: Metadata = {
  title: { absolute: `${PAGE_TITLE} | Random Walk NFT` },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/atelier" },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION }
};

const notes = [
  {
    title: "It is the real algorithm",
    body: "The same SHA3-256 bit stream, the same four-direction lattice walk, the same drifting colour channels as the published Python generator — only drawn at a miniature resolution so your browser can do it in seconds."
  },
  {
    title: "A real seed reproduces a real work",
    body: "Paste the seed from any token's page and the Atelier redraws that token's shape and palette. That is the proof that the art is derived from the chain, not stored on a server."
  },
  {
    title: "Anything else becomes a walk too",
    body: "Type a name or a sentence and it is hashed into a 32-byte seed. These walks are not minted and never will be, unless the chain happens to produce the same seed."
  }
];

export default async function AtelierPage({ searchParams }: { searchParams: SearchParams }) {
  const { SITE_NAME, SITE_URL } = getBaseConfig();
  const params = await searchParams;
  const rawSeed = typeof params.seed === "string" ? params.seed : undefined;
  const initialSeed = rawSeed && isSeedHex(rawSeed) ? rawSeed : undefined;

  return (
    <PageShell className="space-y-12 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: PAGE_TITLE,
          url: `${SITE_URL}/atelier`,
          description: PAGE_DESCRIPTION,
          applicationCategory: "DesignApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL }
        }}
      />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Atelier" }]} />
      <PageHeading
        eyebrow="The Atelier"
        title="Draw a walk from any seed."
        description="The generator that made every work in the collection, running live in your browser. Paste a seed, type anything, or roll the dice."
      />

      <AtelierStudio initialSeed={initialSeed} />

      <section className="grid gap-6 border-t border-border pt-10 md:grid-cols-3" aria-label="About the Atelier">
        {notes.map((note) => (
          <div key={note.title} className="space-y-2">
            <h2 className="font-display text-2xl">{note.title}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{note.body}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-10">
        <div>
          <p className="eyebrow">Want one that lasts?</p>
          <p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">
            Minting draws a seed nobody has ever seen, renders six works from it, and hands you the key to the Vault.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="accent">
            <Link href="/mint">Mint a real one</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/code">Read the generator source</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
