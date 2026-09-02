import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const axiomZeroMarketplaceUrl = "https://www.axiomzero.market/random-walk";
const expectedCanonicalOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://randomwalknft.com").replace(/\/+$/, "");

/**
 * Navigate and wait for React's streaming to finish: late Suspense content arrives in
 * hidden `<div>`s at the end of <body> before being swapped into place, and strict
 * locators would briefly see it twice.
 */
async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.hydrated === "true" &&
      Array.from(document.querySelectorAll("body > div[hidden]")).every((node) => node.childElementCount === 0)
  );
}

test("home page opens with the masthead, live facts, and the first chapter", async ({ page }) => {
  await goto(page, "/");
  await expect(page.getByRole("heading", { level: 1, name: /random walk nft/i })).toBeInViewport();
  await expect(page.getByTestId("masthead-facts")).toContainText(/works/i);
  await expect(page.getByRole("heading", { name: /every walk begins with a seed/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /mint the next work/i })).toHaveAttribute("href", "/mint");
});

test("home page emits the configured canonical URL", async ({ page }) => {
  await goto(page, "/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", expectedCanonicalOrigin);
});

test("the walk story draws the work as the visitor scrolls", async ({ page }) => {
  await goto(page, "/");
  const story = page.getByTestId("walk-story");
  await expect(story.locator("canvas")).toHaveCount(1);

  // Scroll through the four chapters in steps so the scroll-linked drawing runs.
  await story.getByRole("heading", { name: /until it fills the frame/i }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const paintedPixels = await story.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");
    if (!context) return 0;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let painted = 0;
    for (let index = 0; index < data.length; index += 4) {
      const luminance = data[index]! + data[index + 1]! + data[index + 2]!;
      if (luminance > 60 && luminance < 705) painted += 1;
    }
    return painted;
  });
  expect(paintedPixels).toBeGreaterThan(500);

  await expect(story.getByTestId("story-redraw")).toBeVisible();
  await expect(story.getByRole("link", { name: /open the atelier/i })).toHaveAttribute("href", "/atelier");
});

test("home page explains the art and the vault game", async ({ page }) => {
  await goto(page, "/");
  await expect(page.getByRole("heading", { name: /sha3-256 turns the seed into steps/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /three colours drift alongside/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /every mint pays into a vault/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /a collection that runs itself/i })).toBeVisible();
});

test("home page renders the collection wall and the constellation", async ({ page }) => {
  await goto(page, "/");
  const wall = page.getByTestId("homepage-wall");

  await expect(wall.getByRole("heading", { name: /newest acquisitions/i })).toBeVisible();
  expect(await wall.locator('a[href^="/detail/"]').count()).toBeGreaterThanOrEqual(8);

  const constellation = page.getByTestId("constellation");
  await expect(constellation.getByRole("img")).toBeVisible();
  await constellation.getByRole("button", { name: /by beauty/i }).click();
  await expect(constellation.getByRole("button", { name: /by beauty/i })).toHaveAttribute("aria-pressed", "true");
});

test("home page shows the live vault state", async ({ page }) => {
  await goto(page, "/");

  const chapter = page.getByTestId("vault-chapter");
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter.getByTestId("vault-chapter-prize")).toBeVisible();
  await expect(chapter.getByRole("link", { name: /enter the vault/i })).toHaveAttribute("href", "/vault");
  await expect(chapter.getByTestId("recent-mints").locator("a")).toHaveCount(6);
});

test("home page links Random Walk NFT to Cosmic Signature", async ({ page }) => {
  await goto(page, "/");

  await expect(page.getByRole("heading", { name: /what can you do with a random walk nft\?/i })).toBeVisible();
  await expect(page.getByText(/1,000 CST/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /use your random walk nft in cosmic signature/i })).toHaveAttribute(
    "href",
    "https://cosmicsignature.com/"
  );
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

test("detail page for token 1 shows the work, its provenance, and the stage controls", async ({ page }) => {
  await goto(page, "/detail/1");
  await expect(page.getByRole("heading", { level: 1, name: /#000001/i })).toBeVisible();

  const stage = page.getByTestId("artwork-stage");
  await expect(stage.getByRole("img", { name: /random walk nft #000001/i })).toBeVisible();
  await expect(stage.getByTestId("media-image")).toHaveAttribute("aria-pressed", "true");
  await stage.getByTestId("media-singleVideo").click();
  await expect(stage.getByTestId("artwork-video")).toBeVisible();
  await stage.getByRole("button", { name: /white edition/i }).click();
  await expect(stage.getByTestId("artwork-video").locator("source")).toHaveAttribute("src", /_white_single\.mp4$/);

  const provenance = page.getByTestId("provenance");
  await expect(provenance.getByText(/^Owner$/)).toBeVisible();
  await expect(provenance.getByText(/on-chain seed/i)).toBeVisible();
  await expect(provenance.getByRole("link", { name: /redraw in the atelier/i })).toHaveAttribute(
    "href",
    /^\/atelier\?seed=(0x)?[0-9a-f]{64}$/
  );
  await expect(provenance.getByTestId("history-timeline").getByText(/^Minted$/)).toBeVisible();

  await expect(page.getByTestId("collector-tools").getByRole("link", { name: /open on axiom zero/i })).toBeVisible();
  await expect(page.getByText(/order book/i)).toHaveCount(0);
});

test("detail page browses neighbours with the keyboard and skips typing targets", async ({ page }) => {
  await goto(page, "/detail/5");
  await expect(page.getByTestId("token-nav").getByRole("link", { name: /next work, #000006/i })).toHaveAttribute(
    "href",
    "/detail/6"
  );

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/detail\/6$/);
  // Wait for the new page to render before the next shortcut, which it owns.
  await expect(page.getByRole("heading", { level: 1, name: /#000006/i })).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/\/detail\/5$/);
  await expect(page.getByRole("heading", { level: 1, name: /#000005/i })).toBeVisible();
});

test("detail page redraws the work live from its seed", async ({ page }) => {
  await goto(page, "/detail/1");
  const stage = page.getByTestId("artwork-stage");
  await stage.getByTestId("proof-toggle").click();
  await expect(stage.locator("canvas")).toBeVisible();
  await expect(stage.getByText(/drawn live from the seed/i)).toBeVisible();
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

test("gallery rooms and hangings are plain links that persist in the URL", async ({ page }) => {
  await goto(page, "/gallery");
  const toolbar = page.getByTestId("collection-toolbar");
  await toolbar.getByRole("link", { name: /most beautiful/i }).click();
  await expect(page).toHaveURL(/sortBy=beauty/);
  await expect(page.getByRole("heading", { level: 1, name: /most beautiful/i })).toBeVisible();
  await expect(page.getByTestId("gallery-count")).toContainText(/page 1 of/i);

  await toolbar.getByRole("link", { name: /study hanging/i }).click();
  await expect(page).toHaveURL(/view=compact/);
  await expect(page).toHaveURL(/sortBy=beauty/);
});

test("gallery jump-to-token applies a query filter", async ({ page }) => {
  await goto(page, "/gallery");
  await page.getByLabel(/jump to token number/i).fill("1");
  await page.getByRole("button", { name: /jump to token/i }).click();
  await expect(page).toHaveURL(/query=1/);
  await expect(page.getByText(/Token #000001/i)).toBeVisible();
  await expect(page.locator('a[href="/detail/1"]')).toHaveCount(1);
});

test("gallery ignores a malformed wallet address instead of failing", async ({ page }) => {
  const response = await page.goto("/gallery?address=not-an-address", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: /every walk, newest first/i })).toBeVisible();
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

test("mint page shows the ticket desk with a live price and a wallet prompt", async ({ page }) => {
  await goto(page, "/mint");
  await expect(page.getByRole("heading", { level: 1, name: /add a walk nobody has seen/i })).toBeVisible();
  await expect(page.getByTestId("mint-price")).toContainText(/ETH/);
  await expect(page.getByTestId("mint-button")).toBeDisabled();
  await expect(page.getByRole("button", { name: /connect wallet/i }).first()).toBeVisible();
  await expect(page.getByTestId("mint-featured-rail").locator('a[href^="/detail/"]')).toHaveCount(8);
});
