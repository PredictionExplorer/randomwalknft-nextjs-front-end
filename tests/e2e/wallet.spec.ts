import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { installMockWallet } from "./fixtures/mock-wallet";

async function gotoWalletPage(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
}

async function openWalletModal(page: Page) {
  await page.getByRole("button", { name: /connect wallet/i }).click();
  await expect(page.getByText("MetaMask", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/walletconnect/i)).toHaveCount(0);
}

async function connectBrowserWallet(page: Page) {
  await openWalletModal(page);
  await page.getByText("Browser Wallet", { exact: true }).click();
}

test("connect wallet works with a browser wallet provider", async ({ page }) => {
  await installMockWallet(page, { chainId: "0xa4b1" });
  await gotoWalletPage(page);
  await connectBrowserWallet(page);

  await expect(page.getByRole("button", { name: /0x12/i })).toBeVisible();
});

test("MetaMask SDK connects an installed extension provider", async ({ page }) => {
  await installMockWallet(page, {
    announceEip6963: true,
    chainId: "0xa4b1"
  });
  await gotoWalletPage(page);
  await openWalletModal(page);
  await page.getByText("MetaMask", { exact: true }).first().click();

  await expect(page.getByRole("button", { name: /0x12/i })).toBeVisible();
});

test("an installed EIP-6963 wallet is discovered without WalletConnect", async ({ page }) => {
  await installMockWallet(page, {
    announceEip6963: true,
    chainId: "0xa4b1",
    isMetaMask: false,
    walletName: "Example Wallet",
    walletRdns: "com.example.wallet"
  });
  await gotoWalletPage(page);
  await openWalletModal(page);

  await expect(page.getByText("Example Wallet", { exact: true })).toBeVisible();
});

test("wrong-network wallet shows the switch-network action", async ({ page }) => {
  await installMockWallet(page, { chainId: "0x1" });
  await gotoWalletPage(page);
  await connectBrowserWallet(page);
  await page.evaluate(() => {
    window.__mockWallet.setChainId("0x1");
  });

  await expect(page.getByRole("button", { name: /switch network/i })).toBeVisible();
});

test("a first-time wallet can add and switch to the configured chain", async ({ page }) => {
  await installMockWallet(page, {
    chainId: "0x1",
    missingChainUntilAdded: true
  });
  await gotoWalletPage(page);
  await connectBrowserWallet(page);

  await expect(page.getByRole("button", { name: /0x12/i })).toBeVisible();
  const requestedMethods = await page.evaluate(() => window.__mockWallet.requests.map((request) => request.method));
  expect(requestedMethods).toEqual(expect.arrayContaining(["wallet_switchEthereumChain", "wallet_addEthereumChain"]));
});

test("wallet state reconnects across SSR hydration and refresh", async ({ page }) => {
  await installMockWallet(page, {
    announceEip6963: true,
    chainId: "0xa4b1"
  });
  await gotoWalletPage(page);
  await openWalletModal(page);
  await page.getByText("MetaMask", { exact: true }).first().click();
  await expect(page.getByRole("button", { name: /0x12/i })).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: /0x12/i })).toBeVisible();
});

test("wallet UI reacts to account and chain events without a reload", async ({ page }) => {
  await installMockWallet(page, { chainId: "0xa4b1" });
  await gotoWalletPage(page);
  await connectBrowserWallet(page);

  await page.evaluate(() => {
    window.__mockWallet.setChainId("0x1");
  });
  await expect(page.getByRole("button", { name: /switch network/i })).toBeVisible();

  await page.evaluate(() => {
    window.__mockWallet.setAccounts([]);
  });
  await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
});
