import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { homepageTrustCards } from "@/lib/content/homepage";
import { faqItems } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: "FAQ"
};

export default function FaqPage() {
  return (
    <PageShell className="space-y-10 py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "FAQ" }
        ]}
      />
      <PageHeading
        eyebrow="Collector essentials"
        title={[{ text: "FAQ", tone: "secondary" }]}
        description="Answers about minting, CC0 rights, Arbitrum, redemption, and how the collection’s economics are designed."
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
            <CardTitle>Have a question?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>Reach out on social if you need something that is not covered here.</p>
            <p>
              <a href="https://twitter.com/RandomWalkNFT" target="_blank" className="text-secondary underline underline-offset-4">
                Twitter
              </a>
              {" · "}
              <a href="https://discord.gg/bGnPn96Qwt" target="_blank" className="text-secondary underline underline-offset-4">
                Discord
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {homepageTrustCards.map((item) => (
          <Card key={item.title}>
            <CardContent className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-secondary">{item.eyebrow}</p>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
