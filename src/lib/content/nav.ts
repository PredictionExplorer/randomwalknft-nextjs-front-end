export const navItems = [
  { title: "Collection", href: "/gallery" },
  { title: "Marketplace", href: "/marketplace" },
  { title: "Mint", href: "/mint" },
  { title: "How it Works", href: "/#how-it-works" },
  { title: "FAQ", href: "/faq" },
  { title: "Blog", href: "/blog" },
  {
    title: "Discover",
    href: "/random",
    children: [
      { title: "Trading History", href: "/trading" },
      { title: "Redeem", href: "/redeem" },
      { title: "Random Image", href: "/random" },
      { title: "Random Video", href: "/random-video" },
      { title: "Beauty Contest", href: "/compare" },
      { title: "Generation Code", href: "/code" },
      { title: "FAQ", href: "/faq" }
    ]
  }
] as const;
