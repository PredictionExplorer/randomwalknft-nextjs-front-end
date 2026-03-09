import type { Metadata } from "next";

import { RedeemExperience } from "@/components/feature/redeem-experience";

export const metadata: Metadata = {
  title: "Redeem"
};

export default function RedeemPage() {
  return <RedeemExperience />;
}
