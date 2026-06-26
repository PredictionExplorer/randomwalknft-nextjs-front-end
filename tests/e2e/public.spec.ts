import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const axiomZeroMarketplaceUrl = "https://www.axiomzero.market/random-walk";
const expectedCanonicalOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://randomwalknft.com").replace(/\/+$/, "");

test("home page renders primary CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /mint the next work/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /collect on axiom zero/i })).toHaveAttribute(
    "href",
    axiomZeroMarketplaceUrl
  );
  await expect(page.getByRole("link", { name: /random walk nft/i })).toBeVisible();
});

test("home page emits the configured canonical URL", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    expectedCanonicalOrigin
  );
});

test("home hero sits near the top fold without a dead spacer", async ({ page }) => {
  await page.goto("/");
  const heroHeading = page.getByRole("heading", { name: /random walk nft/i });
  await expect(heroHeading).toBeVisible();

  const top = await heroHeading.evaluate((node) => node.getBoundingClientRect().top);
  expect(top).toBeLessThan(260);
});

test("home page explains how the collection works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Mint your NFT/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /on-chain provenance clearly/i })).toBeVisible();
});

test("home page renders a featured NFT panel", async ({ page }) => {
  await page.goto("/");
  const featuredPanel = page.getByTestId("homepage-featured-panel");

  await expect(featuredPanel.getByText(/featured now/i)).toBeVisible();
  await expect(featuredPanel.locator('a[href^="/detail/"]')).toHaveCount(4);
  await expect(featuredPanel.getByRole("img", { name: /preview image for nft #\d{6}/i })).toHaveCount(3);
});

test("home page links Random Walk NFT to Cosmic Signature", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /random walk meets cosmic signature/i })).toBeVisible();
  await expect(page.getByText(/50% ETH Gesture Cost reduction/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Anchored-NFT Stellar Selection/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /explore cosmic signature/i })).toHaveAttribute(
    "href",
    "https://cosmicsignature.com/"
  );
});

test("detail page for token 1 loads core metadata", async ({ page }) => {
  await page.goto("/detail/1");
  await expect(page.getByRole("heading", { name: /#000001/i })).toBeVisible();
  await expect(page.getByText(/^Owner$/)).toBeVisible();
  await expect(page.getByText(/order book/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^bid$/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^list$/i })).toHaveCount(0);
});

test("home page passes an axe smoke check", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("gallery renders a single page of NFTs and supports page navigation", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByText(/Page 1 of/i)).toBeVisible();
  await expect(page.locator('a[href^="/detail/"]')).toHaveCount(24);

  await page.getByLabel("Go to page 2").click();
  await expect(page).toHaveURL(/\/gallery\?page=2/);
  await expect(page.getByText(/Page 2 of/i)).toBeVisible();
  await expect(page.locator('a[href^="/detail/"]')).toHaveCount(24);
});

test("gallery beauty filter persists in the URL", async ({ page }) => {
  await page.goto("/gallery");
  await page.getByLabel(/sort/i).selectOption("beauty");
  await page.getByRole("button", { name: /apply/i }).click();
  await expect(page).toHaveURL(/sortBy=beauty/);
  await expect(page.getByText(/Page 1 of/i)).toBeVisible();
});

test("gallery token search applies a query filter", async ({ page }) => {
  await page.goto("/gallery");
  await page.getByLabel(/search token id/i).fill("1");
  await page.getByRole("button", { name: /apply/i }).click();
  await expect(page).toHaveURL(/query=1/);
  await expect(page.getByText(/Token #000001/i)).toBeVisible();
});

test("marketplace route redirects to Axiom Zero", async ({ request }) => {
  const response = await request.get("/marketplace", { maxRedirects: 0 });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(axiomZeroMarketplaceUrl);
});

test("random image page links to an NFT detail page", async ({ page }) => {
  await page.goto("/random");
  await expect(page.locator('a[href^="/detail/"]')).toBeVisible();
});

test("open source page includes the full reproduction guide", async ({ page }) => {
  await page.goto("/code");
  await expect(page.getByText(/python3 randomWalkGen\.py 3456/i)).toBeVisible();

  await page.getByRole("tab", { name: /dependencies/i }).click();
  await expect(page.getByText(/opencv-python==4\.5\.3\.56/i)).toBeVisible();

  await page.getByRole("tab", { name: /source code/i }).click();
  await expect(page.getByText(/def get_seed/i)).toBeVisible();
});

test("invalid NFT detail route returns not found", async ({ page }) => {
  await page.goto("/detail/not-a-number");
  await expect(page.getByText(/does not exist|not found|could not be found/i)).toBeVisible();
});

test("mint page renders heading", async ({ page }) => {
  await page.goto("/mint");
  await expect(page.getByRole("heading", { name: /random walk|sale opens/i })).toBeVisible();
});
