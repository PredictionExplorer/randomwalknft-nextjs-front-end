import type { MetadataRoute } from "next";

import { getBaseConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  const { SITE_DESCRIPTION, SITE_NAME } = getBaseConfig();
  return {
    name: SITE_NAME,
    short_name: "RWNFT",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/images/logo2.png", type: "image/png" }
    ]
  };
}
