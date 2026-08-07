import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { installMockWallet } from "./fixtures/mock-wallet";

test.describe.configure({ timeout: 60_000 });

async function openMobileWalletModal(page: Page) {
  await page.getByRole("button", { name: /open navigation/i }).click();
  await page.getByRole("button", { name: /connect wallet/i }).click();
  await expect(page.getByText("MetaMask", { exact: true }).first()).toBeVisible();
}

test("mobile navigation opens a MetaMask SDK option without WalletConnect", async ({
  page
}) => {
  const forbiddenRequests: string[] = [];
  page.on("request", (request) => {
    if (/walletconnect|reown/i.test(request.url())) {
      forbiddenRequests.push(request.url());
    }
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openMobileWalletModal(page);

  await expect(page.getByText(/walletconnect/i)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /navigation menu/i })
  ).not.toBeVisible();
  expect(forbiddenRequests).toEqual([]);
});

test("a mobile in-app provider connects through the production modal", async ({
  page
}) => {
  await installMockWallet(page, {
    announceEip6963: true,
    chainId: "0xa4b1"
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openMobileWalletModal(page);
  await page.getByText("MetaMask", { exact: true }).first().click();

  await page.getByRole("button", { name: /open navigation/i }).click();
  await expect(page.getByRole("button", { name: /0x12/i })).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden"
    });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible"
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await expect(page.getByRole("button", { name: /0x12/i })).toBeVisible();
});
