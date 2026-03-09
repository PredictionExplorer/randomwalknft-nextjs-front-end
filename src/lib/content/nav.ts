export const navItems = [
  { title: "Home", href: "/" },
  { title: "Mint", href: "/mint" },
  {
    title: "NFT",
    href: "/gallery",
    children: [
      { title: "Gallery", href: "/gallery" },
      { title: "Marketplace", href: "/marketplace" },
      { title: "Trading History", href: "/trading" }
    ]
  },
  { title: "Redeem", href: "/redeem" },
  {
    title: "Random",
    href: "/random",
    children: [
      { title: "Random Image", href: "/random" },
      { title: "Random Video", href: "/random-video" }
    ]
  },
  { title: "Beauty Contest", href: "/compare" },
  {
    title: "About",
    href: "/faq",
    children: [
      { title: "Generation Code", href: "/code" },
      { title: "FAQ", href: "/faq" },
      { title: "Blog", href: "/blog" }
    ]
  }
] as const;
