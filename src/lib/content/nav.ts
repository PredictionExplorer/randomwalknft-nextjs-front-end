export const navItems = [
  { title: "Collection", href: "/gallery" },
  { title: "Marketplace", href: "/marketplace" },
  { title: "Mint", href: "/mint" },
  { title: "Redeem", href: "/redeem" },
  { title: "FAQ", href: "/faq" },
  {
    title: "Discover",
    href: "/random",
    children: [
      { title: "How It Works", href: "/#how-it-works" },
      { title: "Trading History", href: "/trading" },
      { title: "Random Image", href: "/random" },
      { title: "Random Video", href: "/random-video" },
      { title: "Beauty Contest", href: "/compare" },
      { title: "Open Source", href: "/code" }
    ]
  }
] as const;
