import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ExternalLink } from "@/components/common/external-link";
import { JsonLd } from "@/components/common/json-ld";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqItems } from "@/lib/content/faq";
import { homepageCharter } from "@/lib/content/homepage";

export const metadata: Metadata = {
  title: "Visitor's guide — frequently asked questions",
  description:
    "Frequently asked questions about Random Walk NFT — minting, the Vault game that pays the last minter, beauty scores, CC0 licensing, Cosmic Signature utility, and collecting on Axiom Zero.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Visitor's guide | Random Walk NFT",
    description:
      "Frequently asked questions about Random Walk NFT — minting, the Vault game that pays the last minter, beauty scores, CC0 licensing, Cosmic Signature utility, and collecting on Axiom Zero."
  }
};

export default function FaqPage() {
  return (
    <PageShell className="space-y-12 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.summary,
            acceptedAnswer: { "@type": "Answer", text: item.detail }
          }))
        }}
      />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Visitor's guide" }]} />
      <PageHeading
        eyebrow="Visitor's guide"
        title="Questions, answered."
        description="Everything you need to know about minting, collecting, the Vault, the salon, and the economics behind Random Walk NFT."
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Accordion type="single" collapsible className="border-t border-border" data-testid="faq-list">
          {faqItems.map((item) => (
            <AccordionItem value={item.summary} key={item.summary}>
              <AccordionTrigger className="text-left text-base sm:text-lg">{item.summary}</AccordionTrigger>
              <AccordionContent className="max-w-3xl text-sm leading-7 text-muted-foreground">
                {item.detail}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <aside className="h-fit space-y-6 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="space-y-2">
            <p className="eyebrow">Still have questions?</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Join the community — collectors and the team are happy to help.
            </p>
            <p className="flex gap-4 text-sm">
              <ExternalLink
                href="https://twitter.com/RandomWalkNFT"
                className="text-foreground underline decoration-border-strong underline-offset-4"
              >
                Twitter
              </ExternalLink>
              <ExternalLink
                href="https://discord.gg/bGnPn96Qwt"
                className="text-foreground underline decoration-border-strong underline-offset-4"
              >
                Discord
              </ExternalLink>
            </p>
          </div>
          <div className="space-y-2">
            <p className="eyebrow">Go deeper</p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/how-it-works">How it works, in full</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/atelier">Run the generator yourself</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/code">Read the source code</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <section className="space-y-6 border-t border-border pt-10" aria-labelledby="faq-charter-heading">
        <div className="space-y-2">
          <p className="eyebrow text-accent">The charter</p>
          <h2 id="faq-charter-heading" className="font-display text-3xl sm:text-4xl">
            Standing guarantees
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {homepageCharter.map((item) => (
            <article key={item.title} className="space-y-3 bg-background p-5">
              <p className="eyebrow">{item.eyebrow}</p>
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
