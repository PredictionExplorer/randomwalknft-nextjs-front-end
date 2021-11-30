type NavItem = {
  title: string
  route: string
}

const NAVS: NavItem[] = [
  { title: 'Home', route: '/' },
  { title: 'Mint', route: '/mint' },
  { title: 'Gallery', route: '/gallery' },
  { title: 'Marketplace', route: '/marketplace' },
  // { title: "Giveaway", route: "/giveaway" },
  { title: 'Redeem', route: '/redeem' },
  { title: 'FAQ', route: '/faq' },
  { title: 'Generation Code', route: '/code' },
  { title: 'Random', route: '/random' },
  // { title: 'Random Video', route: '/random-video' },
]

export default NAVS
