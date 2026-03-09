import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ExternalLink } from "@/components/common/external-link";
import { JsonLd } from "@/components/common/json-ld";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { homepageTrustCards } from "@/lib/content/homepage";
import { faqItems } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Random Walk NFT — minting, trading, the zero-fee marketplace, beauty scores, CC0 licensing, and the mint pool incentive on Arbitrum.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | Random Walk NFT",
    description:
      "Frequently asked questions about Random Walk NFT — minting, trading, the zero-fee marketplace, beauty scores, CC0 licensing, and the mint pool incentive on Arbitrum."
  }
};

export default function FaqPage() {
  return (
    <PageShell className="space-y-10 py-16">
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
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "FAQ" }
        ]}
      />
      <PageHeading
        eyebrow="Frequently asked questions"
        title={[{ text: "FAQ", tone: "secondary" }]}
        description="Everything you need to know about minting, collecting, trading, and the economics behind Random Walk NFT."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item) => (
            <AccordionItem value={item.summary} key={item.summary}>
              <AccordionTrigger>{item.summary}</AccordionTrigger>
              <AccordionContent>{item.detail}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>Join the community — we are happy to help.</p>
            <p>
              <ExternalLink href="https://twitter.com/RandomWalkNFT" className="text-secondary underline underline-offset-4">
                Twitter
              </ExternalLink>
              {" · "}
              <ExternalLink href="https://discord.gg/bGnPn96Qwt" className="text-secondary underline underline-offset-4">
                Discord
              </ExternalLink>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {homepageTrustCards.map((item) => (
          <Card key={item.title}>
            <CardContent className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-secondary">{item.eyebrow}</p>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
