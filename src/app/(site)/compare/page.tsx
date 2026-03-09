import type { Metadata } from "next";

import { CompareExperience } from "@/components/feature/compare-experience";

export const metadata: Metadata = {
  title: "Beauty Contest"
};

export default function ComparePage() {
  return <CompareExperience />;
}
