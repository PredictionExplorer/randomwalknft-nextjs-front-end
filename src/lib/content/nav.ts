export const navItems = [
  { title: "Collection", href: "/gallery" },
  { title: "Marketplace", href: "/marketplace" },
  { title: "Mint", href: "/mint" },
  { title: "Redeem", href: "/redeem" },
  { title: "How It Works", href: "/#how-it-works" },
  { title: "FAQ", href: "/faq" },
  {
    title: "Discover",
    href: "/random",
    children: [
      { title: "Trading History", href: "/trading" },
      { title: "Random Image", href: "/random" },
      { title: "Random Video", href: "/random-video" },
      { title: "Beauty Contest", href: "/compare" },
      { title: "Generation Code", href: "/code" }
    ]
  }
] as const;
