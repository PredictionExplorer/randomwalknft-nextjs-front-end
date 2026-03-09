import Link from "next/link";

import { ExternalLink } from "@/components/common/external-link";
import { PageShell } from "@/components/common/page-shell";

const socialLinks = [
  { href: "https://twitter.com/RandomWalkNFT", label: "Twitter" },
  { href: "https://discord.gg/bGnPn96Qwt", label: "Discord" }
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-background/40">
      <PageShell className="grid gap-8 py-10 text-sm text-muted-foreground lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-foreground">Random Walk NFT</p>
          <p className="max-w-xl leading-7">
            Generative art on Arbitrum. Verified contracts, zero-fee marketplace, and an incentive model that returns ETH to collectors.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-secondary">Navigate</p>
          <div className="space-y-2">
            <Link href="/gallery" className="block transition hover:text-secondary">Collection</Link>
            <Link href="/marketplace" className="block transition hover:text-secondary">Marketplace</Link>
            <Link href="/mint" className="block transition hover:text-secondary">Mint</Link>
            <Link href="/faq" className="block transition hover:text-secondary">FAQ</Link>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-secondary">Community</p>
          {socialLinks.map((item) => (
            <ExternalLink key={item.href} href={item.href} className="block transition hover:text-secondary">
              {item.label}
            </ExternalLink>
          ))}
        </div>
      </PageShell>
    </footer>
  );
}
