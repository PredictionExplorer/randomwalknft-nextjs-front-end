import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const ACCOUNT = "0x1234567890abcdef1234567890abcdef12345678";

async function installMockWallet(page: Page, chainId: string) {
  await page.addInitScript(
    ({ account, initialChainId }: { account: string; initialChainId: string }) => {
      const listeners = {
        accountsChanged: new Set<(accounts: string[]) => void>(),
        chainChanged: new Set<(chainId: string) => void>(),
        connect: new Set<(payload: { chainId: string }) => void>(),
        disconnect: new Set<() => void>()
      };
      let connectedAccounts: string[] = [];
      let currentChainId = initialChainId;

      const provider = {
        isMetaMask: true,
        on(event: keyof typeof listeners, listener: (...args: never[]) => void) {
          listeners[event]?.add(listener as never);
        },
        removeListener(event: keyof typeof listeners, listener: (...args: never[]) => void) {
          listeners[event]?.delete(listener as never);
        },
        async request({ method, params }: { method: string; params?: Array<Record<string, string>> }) {
          if (method === "eth_requestAccounts") {
            connectedAccounts = [account];
            listeners.accountsChanged.forEach((listener) => listener(connectedAccounts));
            listeners.connect.forEach((listener) => listener({ chainId: currentChainId }));
            return connectedAccounts;
          }

          if (method === "eth_accounts") {
            return connectedAccounts;
          }

          if (method === "eth_chainId") {
            return currentChainId;
          }

          if (method === "wallet_switchEthereumChain") {
            currentChainId = (params?.[0]?.chainId ?? currentChainId).toLowerCase();
            listeners.chainChanged.forEach((listener) => listener(currentChainId));
            return null;
          }

          return null;
        }
      };

      Object.defineProperty(window, "ethereum", {
        configurable: true,
        value: provider
      });
    },
    {
      account: ACCOUNT,
      initialChainId: chainId
    }
  );
}

test("connect wallet works with a browser wallet provider", async ({ page }) => {
  await installMockWallet(page, "0xa4b1");
  await page.goto("/");
  await page.getByRole("button", { name: /connect wallet/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();

  await expect(page.getByRole("button", { name: /0x1234/i })).toBeVisible();
});

test("wrong-network wallet shows the switch-network action", async ({ page }) => {
  await installMockWallet(page, "0x1");
  await page.goto("/");
  await page.getByRole("button", { name: /connect wallet/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();

  await expect(page.getByRole("button", { name: /switch network/i })).toBeVisible();
});
