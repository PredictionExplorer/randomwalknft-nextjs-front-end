import { darkTheme } from "@rainbow-me/rainbowkit";

import { SITE_NAME, SITE_URL } from "@/lib/config";
import { walletConnectEnabled, walletConnectProjectId } from "@/lib/web3/wagmi";

export const rainbowKitTheme = darkTheme({
  accentColor: "#c676d7",
  accentColorForeground: "#140a1f",
  borderRadius: "large",
  overlayBlur: "small"
});

export const rainbowKitAppInfo = {
  appName: SITE_NAME,
  learnMoreUrl: SITE_URL
};

export const walletConnectSupportNote = walletConnectEnabled
  ? "WalletConnect and mobile wallet support are enabled."
  : "WalletConnect project ID is missing. Browser-extension wallets still work, but QR and mobile wallet flows are disabled in this environment.";

export { walletConnectEnabled, walletConnectProjectId };
