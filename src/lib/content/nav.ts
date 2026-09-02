import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";

export const navItems = [
  { title: "Collection", href: "/gallery" },
  { title: "Atelier", href: "/atelier" },
  { title: "Vault", href: "/vault" },
  { title: "Mint", href: "/mint" },
  {
    title: "Discover",
    href: "/how-it-works",
    children: [
      { title: "How It Works", href: "/how-it-works" },
      { title: "Beauty Contest", href: "/compare" },
      { title: "Random Work", href: "/random" },
      { title: "Random Film", href: "/random-video" },
      { title: "Open Source", href: "/code" },
      { title: "FAQ", href: "/faq" },
      { title: "Marketplace", href: AXIOM_ZERO_MARKETPLACE_URL }
    ]
  }
] as const;
