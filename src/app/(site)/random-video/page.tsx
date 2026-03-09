import type { Metadata } from "next";

import { RandomVideoExperience } from "@/components/feature/random-video-experience";

export const metadata: Metadata = {
  title: "Random Video"
};

export default function RandomVideoPage() {
  return <RandomVideoExperience />;
}
