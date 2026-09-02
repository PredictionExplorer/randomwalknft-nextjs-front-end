import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { isLiveUpstream, resetMockState, setMockState, waitForVault } from "./fixtures/mock-upstream";
import { installMockWallet, TEST_ACCOUNT } from "./fixtures/mock-wallet";

/** The mock wallet answers every eth_sendTransaction with this hash. */
const WALLET_TX_HASH = `0x${"22".repeat(32)}`;
const ARBITRUM_ONE = "0xa4b1";

// These flows mutate the shared mock world; run them one at a time and restore it.
test.describe.configure({ mode: "serial" });
test.skip(isLiveUpstream, "transaction flows need the deterministic mock upstream");

async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.hydrated === "true" &&
      Array.from(document.querySelectorAll("body > div[hidden]")).every((node) => node.childElementCount === 0)
  );
}

async function connectWallet(page: Page) {
  await page
    .getByRole("button", { name: /connect wallet/i })
    .first()
    .click();
  await page.getByText("Browser Wallet", { exact: true }).click();
  await expect(page.getByRole("button", { name: /0x12/i })).toBeVisible();
}

test.afterEach(async ({ request }) => {
  await resetMockState(request);
});

test("minting draws a fresh seed, reveals the work live, and lands on its page", async ({ page, request }) => {
  await installMockWallet(page, { chainId: ARBITRUM_ONE });
  await setMockState(request, { pendingMintHashes: [WALLET_TX_HASH] });
  await page.emulateMedia({ reducedMotion: "reduce" });

  await goto(page, "/mint");
  await connectWallet(page);

  const mintButton = page.getByTestId("mint-button");
  await expect(mintButton).toBeEnabled();
  await expect(mintButton).toHaveText(/0\.0905 ETH/);
  await mintButton.click();

  const reveal = page.getByTestId("mint-reveal-theater");
  await expect(reveal).toBeVisible({ timeout: 15_000 });
  await expect(reveal).toContainText("#004097");
  await expect(reveal).toContainText(/drawn live from your on-chain seed/i);

  const requests = await page.evaluate(() => window.__mockWallet.requests.map((entry) => entry.method));
  expect(requests).toContain("eth_sendTransaction");

  await reveal.getByTestId("mint-reveal-view").click();
  await expect(page).toHaveURL(/\/detail\/4097/);
  await expect(page.getByRole("heading", { level: 1, name: /#004097/ })).toBeVisible();
  await expect(page.getByText(/freshly minted/i)).toBeVisible();
});

test("the keyholder can open the vault once the clock reaches zero", async ({ page, request }) => {
  await installMockWallet(page, { chainId: ARBITRUM_ONE });
  await setMockState(request, { secondsUntilWithdrawal: 0 });
  await waitForVault(request, (vault) => vault.secondsUntilWithdrawal === 0);

  await goto(page, "/vault");
  await connectWallet(page);

  await expect(page.getByTestId("vault-room")).toContainText(/the vault is open/i, { timeout: 15_000 });
  await expect(page.getByText(/that is you/i)).toBeVisible();
  const withdraw = page.getByTestId("vault-withdraw");
  await expect(withdraw).toBeEnabled();
  await withdraw.click();

  await expect(page.getByText(/the vault has been opened/i)).toBeVisible({ timeout: 15_000 });
  const requests = await page.evaluate(() => window.__mockWallet.requests.map((entry) => entry.method));
  expect(requests).toContain("eth_sendTransaction");
});

test("a visitor who is not the keyholder cannot open the vault", async ({ page, request }) => {
  await installMockWallet(page, { chainId: ARBITRUM_ONE, account: "0x9999999999999999999999999999999999999999" });
  await setMockState(request, { secondsUntilWithdrawal: 0 });
  await waitForVault(request, (vault) => vault.secondsUntilWithdrawal === 0);

  await goto(page, "/vault");
  await page
    .getByRole("button", { name: /connect wallet/i })
    .first()
    .click();
  await page.getByText("Browser Wallet", { exact: true }).click();
  await expect(page.getByRole("button", { name: /0x99/i })).toBeVisible();

  await expect(page.getByTestId("vault-room")).toContainText(/only the keyholder/i, { timeout: 15_000 });
  await expect(page.getByTestId("vault-withdraw")).toBeEnabled();
});

test("a signed salon vote is recorded and the next pair arrives", async ({ page }) => {
  await installMockWallet(page, { chainId: ARBITRUM_ONE });
  await goto(page, "/compare");
  await connectWallet(page);

  const pair = page.getByTestId("salon-pair");
  await expect(pair).toBeVisible();
  const firstPairText = await pair.locator("a").first().getAttribute("href");

  await page.getByTestId("pick-left").click();
  await expect(page.getByText(/vote recorded/i)).toBeVisible();
  await expect(page.getByTestId("salon-tally")).toContainText("1");

  const requests = await page.evaluate(() => window.__mockWallet.requests.map((entry) => entry.method));
  expect(requests).toContain("personal_sign");

  await expect
    .poll(async () => page.getByTestId("salon-pair").locator("a").first().getAttribute("href"))
    .not.toBe(firstPairText);
});

test("My NFTs lists the connected wallet's works newest first", async ({ page }) => {
  await installMockWallet(page, { chainId: ARBITRUM_ONE });
  await goto(page, "/my-nfts");
  await connectWallet(page);

  await expect(page.getByText("3 works")).toBeVisible();
  const links = page.locator('a[href^="/detail/"]');
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAttribute("href", "/detail/4096");
  await expect(links.nth(2)).toHaveAttribute("href", "/detail/12");
  // wagmi checksums the address; the wall link should still point at the same wallet.
  await expect(page.getByRole("link", { name: /public wall/i })).toHaveAttribute(
    "href",
    new RegExp(`/gallery\\?address=${TEST_ACCOUNT}$`, "i")
  );
});

test("an owner can rename their work from its page", async ({ page }) => {
  await installMockWallet(page, { chainId: ARBITRUM_ONE });
  await goto(page, "/detail/12");
  await connectWallet(page);

  const tools = page.getByTestId("collector-tools");
  await expect(tools).toContainText(/you own this work/i);
  const name = tools.getByLabel(/^name$/i);
  await name.fill("Drift, renamed");
  await tools.getByRole("button", { name: /save/i }).click();

  await expect(page.getByText(/name updated on-chain/i)).toBeVisible({ timeout: 15_000 });
  const requests = await page.evaluate(() => window.__mockWallet.requests.map((entry) => entry.method));
  expect(requests).toContain("eth_sendTransaction");
});

test("a visitor who does not own the work sees collecting options instead of tools", async ({ page }) => {
  await installMockWallet(page, { chainId: ARBITRUM_ONE });
  await goto(page, "/detail/7");
  await connectWallet(page);

  const tools = page.getByTestId("collector-tools");
  await expect(tools.getByRole("link", { name: /open on axiom zero/i })).toBeVisible();
  await expect(tools.getByLabel(/^name$/i)).toHaveCount(0);
});

test("the atelier draws from typed text, shares the seed in the URL, and shows both editions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await goto(page, "/atelier");

  await page.getByLabel(/seed or text/i).fill("a name, a date, a sentence");
  await page.getByTestId("atelier-draw").click();
  await expect(page).toHaveURL(/\/atelier\?seed=0x[0-9a-f]{64}$/);
  await expect(page.getByText(/walk complete/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /download png/i })).toBeEnabled();

  await page.getByRole("button", { name: /both editions/i }).click();
  await expect(page.locator("canvas")).toHaveCount(2);

  // A shared link reproduces the same seed.
  const url = page.url();
  await goto(page, new URL(url).pathname + new URL(url).search);
  await expect(page.getByLabel(/seed or text/i)).toHaveValue(/^0x[0-9a-f]{64}$/);
});

test("the wing toggle switches editions and survives a reload", async ({ page }) => {
  await goto(page, "/gallery");
  await expect(page.locator('img[src*="_black_thumb"]').first()).toBeVisible();

  await page.getByRole("switch", { name: /switch to the light wing/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-wing", "light");
  await expect(page.locator('img[src*="_white_thumb"]').first()).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-wing", "light");
  await expect(page.getByRole("switch", { name: /switch to the dark wing/i })).toBeVisible();
});

test("a just-minted token page shows the rendering notice until its files exist", async ({ page, request }) => {
  await setMockState(request, { pendingTokens: [4096] });
  await goto(page, "/detail/4096?message=success");

  await expect(page.getByText(/freshly minted/i)).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/rendering/i);
  await expect(page.getByTestId("media-singleVideo")).toBeDisabled();
  await expect(page).toHaveURL(/\/detail\/4096$/);
});
