import { darkTheme } from "@rainbow-me/rainbowkit";

import { getBaseConfig } from "@/lib/config";

export const rainbowKitTheme = darkTheme({
  accentColor: "#c676d7",
  accentColorForeground: "#140a1f",
  borderRadius: "large",
  overlayBlur: "small"
});

export function getRainbowKitAppInfo() {
  const { SITE_NAME, SITE_URL } = getBaseConfig();
  return {
    appName: SITE_NAME,
    learnMoreUrl: SITE_URL
  };
}
