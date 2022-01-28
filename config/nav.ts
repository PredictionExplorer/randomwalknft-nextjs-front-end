type NavItem = {
  title: string;
  route: string;
  children?: Array<NavItem>;
};

const NAVS: NavItem[] = [
  { title: "Home", route: "/" },
  { title: "Mint", route: "/mint" },
  {
    title: "NFT",
    route: "",
    children: [
      { title: "Gallery", route: "/gallery" },
      { title: "Marketplace", route: "/marketplace" },
      { title: "Trading History", route: "/trading" },
    ],
  },
  { title: "Redeem", route: "/redeem" },
  { title: "FAQ", route: "/faq" },
  { title: "Generation Code", route: "/code" },
  {
    title: "Random",
    route: "",
    children: [
      { title: "Random Image", route: "/random" },
      { title: "Random Video", route: "/random-video" },
    ],
  },
  { title: "Beauty Contest", route: "/compare" },
];

export default NAVS;
