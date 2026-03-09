import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page renders primary CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /mint the next work/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /random walk nft/i })).toBeVisible();
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
  await expect(page.getByText(/Collector trust/i)).toBeVisible();
});

test("detail page for token 1 loads core metadata", async ({ page }) => {
  await page.goto("/detail/1");
  await expect(page.getByRole("heading", { name: /#000001/i })).toBeVisible();
  await expect(page.getByText(/^Owner$/)).toBeVisible();
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

test("marketplace supports the buy-offer filter", async ({ page }) => {
  await page.goto("/marketplace");
  await page.getByRole("button", { name: /buy offers/i }).click();
  await expect(page).toHaveURL(/filter=buy/);
});

test("marketplace price filters persist in the URL", async ({ page }) => {
  await page.goto("/marketplace");
  await page.getByLabel(/min eth/i).fill("0.1");
  await page.getByLabel(/max eth/i).fill("1");
  await page.getByRole("button", { name: /apply marketplace filters/i }).click();
  await expect(page).toHaveURL(/min=0.1/);
  await expect(page).toHaveURL(/max=1/);
});

test("marketplace preserves other filters when switching offer type", async ({ page }) => {
  await page.goto("/marketplace?min=0.2&max=2&sort=recent&query=7");
  await page.getByRole("button", { name: /buy offers/i }).click();

  await expect(page).toHaveURL(/filter=buy/);
  await expect(page).toHaveURL(/min=0.2/);
  await expect(page).toHaveURL(/max=2/);
  await expect(page).toHaveURL(/sort=recent/);
  await expect(page).toHaveURL(/query=7/);
});

test("random image page links to an NFT detail page", async ({ page }) => {
  await page.goto("/random");
  await expect(page.locator('a[href^="/detail/"]')).toBeVisible();
});

test("generation code page includes the full reproduction guide", async ({ page }) => {
  await page.goto("/code");
  await expect(page.getByText(/python3 randomWalkGen\.py 3456/i)).toBeVisible();

  await page.getByRole("tab", { name: /requirements/i }).click();
  await expect(page.getByText(/opencv-python==4\.5\.3\.56/i)).toBeVisible();

  await page.getByRole("tab", { name: /full source/i }).click();
  await expect(page.getByText(/def get_seed/i)).toBeVisible();
});

test("invalid NFT detail route returns not found", async ({ page }) => {
  await page.goto("/detail/not-a-number");
  await expect(page.getByText(/does not exist|not found|could not be found/i)).toBeVisible();
});

test("marketplace page renders heading and toolbar", async ({ page }) => {
  await page.goto("/marketplace");
  await expect(page.getByRole("heading", { name: /random walk nfts marketplace/i })).toBeVisible();
  await expect(page.getByText(/marketplace controls/i)).toBeVisible();
});

test("mint page renders heading", async ({ page }) => {
  await page.goto("/mint");
  await expect(page.getByRole("heading", { name: /random walk|sale opens/i })).toBeVisible();
});

test("marketplace page passes an axe smoke check", async ({ page }) => {
  await page.goto("/marketplace");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
