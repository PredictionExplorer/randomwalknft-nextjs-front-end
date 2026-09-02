import Link from "next/link";

import { ExternalLink } from "@/components/common/external-link";
import { PageShell } from "@/components/common/page-shell";
import { AXIOM_ZERO_MARKETPLACE_URL, COSMIC_SIGNATURE_URL } from "@/lib/config";

const socialLinks = [
  { href: "https://twitter.com/RandomWalkNFT", label: "Twitter" },
  { href: "https://discord.gg/bGnPn96Qwt", label: "Discord" }
];

const linkClass = "block transition-colors hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <PageShell className="grid gap-10 py-14 text-sm text-muted-foreground lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:gap-16">
        <div className="space-y-4">
          <p className="font-display text-2xl text-foreground">Random Walk NFT</p>
          <p className="max-w-md leading-7">
            A generative art collection on Arbitrum, running since 2021. Every work is drawn by chance from an on-chain
            seed, released CC0, and backed by an immutable contract whose vault rewards the last minter.
          </p>
          <p className="eyebrow">© 2021–{new Date().getUTCFullYear()} · CC0 artworks · verified contract</p>
        </div>
        <div className="space-y-3">
          <p className="eyebrow text-foreground">Navigate</p>
          <div className="space-y-2">
            <Link href="/gallery" className={linkClass}>
              Collection
            </Link>
            <Link href="/mint" className={linkClass}>
              Mint
            </Link>
            <Link href="/vault" className={linkClass}>
              The Vault
            </Link>
            <Link href="/how-it-works" className={linkClass}>
              How It Works
            </Link>
            <Link href="/faq" className={linkClass}>
              FAQ
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="eyebrow text-foreground">Related</p>
          <div className="space-y-2">
            <ExternalLink href={COSMIC_SIGNATURE_URL} className={linkClass}>
              Use your NFT in Cosmic Signature
            </ExternalLink>
            <ExternalLink href={AXIOM_ZERO_MARKETPLACE_URL} className={linkClass}>
              Marketplace on Axiom Zero
            </ExternalLink>
            <ExternalLink href="https://github.com/PredictionExplorer/RandomWalkNftContracts" className={linkClass}>
              Contracts on GitHub
            </ExternalLink>
          </div>
        </div>
        <div className="space-y-3">
          <p className="eyebrow text-foreground">Community</p>
          <div className="space-y-2">
            {socialLinks.map((item) => (
              <ExternalLink key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </ExternalLink>
            ))}
          </div>
        </div>
      </PageShell>
    </footer>
  );
}
