import type { Connector } from "wagmi";
import { describe, expect, it } from "vitest";

import { buildWalletOptions, isMobileUserAgent, metaMaskDappLink } from "@/lib/web3/wallet-options";

function connector(partial: Partial<Connector> & { id: string; name: string }): Connector {
  return { type: "injected", ...partial } as Connector;
}

const sdk = connector({ id: "metaMaskSDK", name: "MetaMask", type: "metaMask" });
const generic = connector({ id: "injected", name: "Injected" });
const extension = connector({
  id: "io.metamask",
  name: "MetaMask",
  rdns: "io.metamask",
  icon: "data:image/png;base64,mm"
});
const rabby = connector({ id: "io.rabby", name: "Rabby Wallet", rdns: "io.rabby", icon: "data:image/svg+xml,x" });

describe("buildWalletOptions", () => {
  it("offers the MetaMask mobile SDK when no extension is announced", () => {
    const options = buildWalletOptions([sdk, generic], false);

    expect(options.map((option) => [option.label, option.connector.id])).toEqual([["MetaMask", "metaMaskSDK"]]);
    expect(options[0]?.iconUrl).toBe("/images/metamask-fox.svg");
  });

  it("routes MetaMask through the announced extension instead of the SDK", () => {
    const options = buildWalletOptions([sdk, extension, generic], true);

    expect(options.map((option) => [option.label, option.connector.id])).toEqual([["MetaMask", "io.metamask"]]);
    expect(options[0]?.iconUrl).toBe("data:image/png;base64,mm");
  });

  it("adds the generic Browser Wallet only for legacy browsers without EIP-6963 announcements", () => {
    expect(buildWalletOptions([sdk, generic], true).map((option) => option.label)).toEqual([
      "MetaMask",
      "Browser Wallet"
    ]);
    expect(buildWalletOptions([sdk, rabby, generic], true).map((option) => option.label)).toEqual([
      "MetaMask",
      "Rabby Wallet"
    ]);
  });

  it("lists other EIP-6963 wallets by their announced name and icon", () => {
    const options = buildWalletOptions([sdk, rabby, extension, generic], true);

    expect(options.map((option) => option.label)).toEqual(["MetaMask", "Rabby Wallet"]);
    expect(options[1]?.iconUrl).toBe("data:image/svg+xml,x");
  });

  it("never surfaces a WalletConnect connector", () => {
    const walletConnect = connector({ id: "walletConnect", name: "WalletConnect", type: "walletConnect" });

    const options = buildWalletOptions([sdk, walletConnect, generic], true);

    expect(options.some((option) => /walletconnect/i.test(option.label))).toBe(false);
  });
});

describe("metaMaskDappLink", () => {
  it("builds the universal link for the current page", () => {
    expect(metaMaskDappLink({ host: "randomwalknft.com", pathname: "/mint" })).toBe(
      "https://metamask.app.link/dapp/randomwalknft.com/mint"
    );
  });
});

describe("isMobileUserAgent", () => {
  it("detects phones, tablets, and iPadOS pretending to be a Mac", () => {
    expect(isMobileUserAgent({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" })).toBe(true);
    expect(isMobileUserAgent({ userAgent: "Mozilla/5.0 (Linux; Android 14)" })).toBe(true);
    expect(isMobileUserAgent({ userAgent: "Mozilla/5.0 (Macintosh)", platform: "MacIntel", maxTouchPoints: 5 })).toBe(
      true
    );
    expect(isMobileUserAgent({ userAgent: "Mozilla/5.0 (Macintosh)", platform: "MacIntel", maxTouchPoints: 0 })).toBe(
      false
    );
  });
});
