import { PageShell } from "@/components/common/page-shell";

const socialLinks = [
  { href: "https://twitter.com/RandomWalkNFT", label: "Twitter" },
  { href: "https://discord.gg/bGnPn96Qwt", label: "Discord" }
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-background/40">
      <PageShell className="flex flex-col gap-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Random Walk NFT</p>
        <div className="flex items-center gap-4">
          {socialLinks.map((item) => (
            <a key={item.href} href={item.href} target="_blank" className="transition hover:text-secondary">
              {item.label}
            </a>
          ))}
        </div>
      </PageShell>
    </footer>
  );
}
