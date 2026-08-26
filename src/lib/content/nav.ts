import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";

export const navItems = [
  { title: "Collection", href: "/gallery" },
  { title: "Mint", href: "/mint" },
  { title: "Vault", href: "/vault" },
  { title: "Marketplace", href: AXIOM_ZERO_MARKETPLACE_URL },
  { title: "FAQ", href: "/faq" },
  {
    title: "Discover",
    href: "/how-it-works",
    children: [
      { title: "How It Works", href: "/how-it-works" },
      { title: "Random Image", href: "/random" },
      { title: "Random Video", href: "/random-video" },
      { title: "Beauty Contest", href: "/compare" },
      { title: "Open Source", href: "/code" }
    ]
  }
] as const;
