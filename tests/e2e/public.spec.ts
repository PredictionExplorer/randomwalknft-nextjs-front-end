import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const axiomZeroMarketplaceUrl = "https://www.axiomzero.market/random-walk";
const expectedCanonicalOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://randomwalknft.com").replace(/\/+$/, "");

async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

test("home page renders primary CTAs in the entry hall", async ({ page }) => {
  await goto(page, "/");
  await expect(page.getByRole("link", { name: /mint a new work/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /enter the gallery/i })).toHaveAttribute(
    "href",
    "/gallery"
  );
  await expect(page.getByRole("heading", { level: 1, name: /random walk nft/i })).toBeVisible();
});

test("home page emits the configured canonical URL", async ({ page }) => {
  await goto(page, "/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    expectedCanonicalOrigin
  );
});

test("home hero fills the first viewport with the heading visible", async ({ page }) => {
  await goto(page, "/");
  const heroHeading = page.getByRole("heading", { level: 1, name: /random walk nft/i });
  await expect(heroHeading).toBeInViewport();
});

test("home page explains the art and the vault game", async ({ page }) => {
  await goto(page, "/");
  await expect(page.getByRole("heading", { name: /what is a random walk\?/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /how does the vault game work\?/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /a museum that runs itself/i })).toBeVisible();
});

test("home page renders the museum wall with live artworks", async ({ page }) => {
  await goto(page, "/");
  const wall = page.getByTestId("homepage-wall");

  await expect(wall.getByRole("heading", { name: /newest acquisitions/i })).toBeVisible();
  expect(await wall.locator('a[href^="/detail/"]').count()).toBeGreaterThanOrEqual(8);
});

test("home page shows the live vault state", async ({ page }) => {
  await goto(page, "/");

  await expect(page.getByTestId("vault-room-prize")).toBeVisible();
  await expect(page.getByRole("link", { name: /visit the vault/i }).first()).toHaveAttribute(
    "href",
    "/vault"
  );
});

test("home page links Random Walk NFT to Cosmic Signature", async ({ page }) => {
  await goto(page, "/");

  await expect(
    page.getByRole("heading", { name: /what can you do with a random walk nft\?/i })
  ).toBeVisible();
  await expect(page.getByText(/1,000 CST/i).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /use your random walk nft in cosmic signature/i })
  ).toHaveAttribute("href", "https://cosmicsignature.com/");
});

test("vault page shows the prize, clock, and rules", async ({ page }) => {
  await goto(page, "/vault");

  await expect(page.getByRole("heading", { level: 1, name: /the vault/i })).toBeVisible();
  await expect(page.getByTestId("vault-prize")).toBeVisible();
  await expect(page.getByRole("heading", { name: /how does the vault game work\?/i })).toBeVisible();
  await expect(page.getByTestId("vault-withdraw")).toBeDisabled();
});

test("redeem route permanently redirects to the vault", async ({ request }) => {
  const response = await request.get("/redeem", { maxRedirects: 0 });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/vault");
});

test("how-it-works page renders the full explainer", async ({ page }) => {
  await goto(page, "/how-it-works");

  await expect(page.getByRole("heading", { level: 1, name: /how random walk nft works/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /how does a seed become art\?/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /why can.t the rules change\?/i })).toBeVisible();
});

test("detail page for token 1 loads core metadata", async ({ page }) => {
  await goto(page, "/detail/1");
  await expect(page.getByRole("heading", { name: /#000001/i })).toBeVisible();
  await expect(page.getByText(/^Owner$/)).toBeVisible();
  await expect(page.getByText(/order book/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^bid$/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^list$/i })).toHaveCount(0);
});

test("home page passes an axe smoke check", async ({ page }) => {
  await goto(page, "/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("gallery renders a single page of NFTs and supports page navigation", async ({ page }) => {
  await goto(page, "/gallery");
  await expect(page.getByText(/Page 1 of/i)).toBeVisible();
  await expect(page.locator('a[href^="/detail/"]')).toHaveCount(24);

  await page.getByLabel("Go to page 2").click();
  await expect(page).toHaveURL(/\/gallery\?page=2/);
  await expect(page.getByText(/Page 2 of/i)).toBeVisible();
  await expect(page.locator('a[href^="/detail/"]')).toHaveCount(24);
});

test("gallery beauty filter persists in the URL", async ({ page }) => {
  await goto(page, "/gallery");
  await page.getByLabel(/sort/i).selectOption("beauty");
  await page.getByRole("button", { name: /apply/i }).click();
  await expect(page).toHaveURL(/sortBy=beauty/);
  await expect(page.getByText(/Page 1 of/i)).toBeVisible();
});

test("gallery token search applies a query filter", async ({ page }) => {
  await goto(page, "/gallery");
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
  await goto(page, "/random");
  await expect(page.locator('a[href^="/detail/"]')).toBeVisible();
});

test("open source page includes the full reproduction guide", async ({ page }) => {
  await goto(page, "/code");
  await expect(page.getByText(/python3 randomWalkGen\.py 3456/i)).toBeVisible();

  await page.getByRole("tab", { name: /dependencies/i }).click();
  await expect(page.getByText(/opencv-python==4\.5\.3\.56/i)).toBeVisible();

  await page.getByRole("tab", { name: /source code/i }).click();
  await expect(page.getByText(/def get_seed/i)).toBeVisible();
});

test("invalid NFT detail route returns not found", async ({ page }) => {
  await goto(page, "/detail/not-a-number");
  await expect(page.getByText(/does not exist|not found|could not be found/i)).toBeVisible();
});

test("mint page renders heading", async ({ page }) => {
  await goto(page, "/mint");
  await expect(page.getByRole("heading", { name: /random walk|sale opens/i })).toBeVisible();
});
