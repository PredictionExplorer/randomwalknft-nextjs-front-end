import { darkTheme } from "@rainbow-me/rainbowkit";

import { getConfig } from "@/lib/config";

export const rainbowKitTheme = darkTheme({
  accentColor: "#c676d7",
  accentColorForeground: "#140a1f",
  borderRadius: "large",
  overlayBlur: "small"
});

export function getRainbowKitAppInfo() {
  const { SITE_NAME, SITE_URL } = getConfig();
  return {
    appName: SITE_NAME,
    learnMoreUrl: SITE_URL
  };
}
