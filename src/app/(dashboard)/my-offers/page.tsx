import type { Metadata } from "next";

import { MyOffersView } from "@/components/feature/my-offers-view";

export const metadata: Metadata = {
  title: "My Offers"
};

export default function MyOffersPage() {
  return <MyOffersView />;
}
