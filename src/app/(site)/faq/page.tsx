import type { Metadata } from "next";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { faqItems } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: "FAQ"
};

export default function FaqPage() {
  return (
    <PageShell className="space-y-10 py-16">
      <PageHeading
        title={[{ text: "FAQ", tone: "secondary" }]}
        description="Answers to the most common questions about minting, trading, and how Random Walk NFT works."
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
    </PageShell>
  );
}
