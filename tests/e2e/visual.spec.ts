import { expect, test, type Page } from "@playwright/test";

import { isLiveUpstream } from "./fixtures/mock-upstream";

/**
 * Pixel baselines for every room in both wings, taken against the deterministic mock
 * upstream. Baselines are Linux-only (see scripts/visual-baselines.sh) so they match the
 * pinned Playwright image CI runs in; the chromium project is the only one that snapshots.
 */
test.skip(isLiveUpstream, "visual baselines need the deterministic mock upstream");

const WINGS = ["dark", "light"] as const;

/** Pages whose full height is stable enough to snapshot end to end. */
const FULL_PAGES: Array<{ path: string; name: string }> = [
  { path: "/gallery", name: "gallery" },
  { path: "/gallery?sortBy=beauty&view=compact", name: "gallery-beauty-study" },
  { path: "/detail/12", name: "detail" },
  { path: "/vault", name: "vault" },
  { path: "/mint", name: "mint" },
  { path: "/atelier", name: "atelier" },
  { path: "/compare", name: "salon" },
  { path: "/faq", name: "faq" },
  { path: "/how-it-works", name: "how-it-works" },
  { path: "/code", name: "code" }
];

async function settle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.hydrated === "true" &&
      Array.from(document.querySelectorAll("body > div[hidden]")).every((node) => node.childElementCount === 0)
  );
  await page.evaluate(() => document.fonts.ready);
  // Let hover-video posters and lazily drawn canvases finish their first paint.
  await page.waitForTimeout(400);
}

/** Time- and chance-dependent surfaces: the header clock, countdown digits and rings, per-visit rails. */
const timeMasks = (page: Page) => [
  page.getByTestId("vault-ticker"),
  page.locator("[data-testid=vault-room] svg"),
  page.locator("[data-testid=vault-room] [aria-hidden]"),
  page.locator("[data-testid=vault-chapter] [aria-hidden]"),
  page.getByTestId("mint-featured-rail")
];

for (const wing of WINGS) {
  test.describe(`${wing} wing`, () => {
    test.beforeEach(async ({ page, context }) => {
      await context.addCookies([{ name: "rw-wing", value: wing, url: "http://127.0.0.1:3100" }]);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addStyleTag({
        content: `
          *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
          video { visibility: hidden !important; }
        `
      });
    });

    test(`homepage opening matches (${wing})`, async ({ page }) => {
      await settle(page, "/");
      await expect(page).toHaveScreenshot(`home-opening-${wing}.png`, {
        animations: "disabled",
        mask: [...timeMasks(page), page.locator("canvas")],
        maxDiffPixelRatio: 0.02
      });
    });

    test(`homepage collection and vault chapters match (${wing})`, async ({ page }) => {
      await settle(page, "/");
      await page.getByTestId("homepage-wall").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await expect(page.getByTestId("homepage-wall")).toHaveScreenshot(`home-collection-${wing}.png`, {
        animations: "disabled",
        // The exhibition row is resampled per visit by design; the sticky header's clock ticks.
        mask: [page.locator("canvas"), page.getByTestId("wall-row-exhibition"), page.getByTestId("vault-ticker")],
        maxDiffPixelRatio: 0.02
      });
      await page.getByTestId("vault-chapter").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await expect(page.getByTestId("vault-chapter")).toHaveScreenshot(`home-vault-${wing}.png`, {
        animations: "disabled",
        mask: [page.locator("[data-testid=vault-chapter] [aria-hidden]"), page.getByTestId("vault-ticker")],
        maxDiffPixelRatio: 0.02
      });
    });

    for (const { path, name } of FULL_PAGES) {
      test(`${name} matches (${wing})`, async ({ page }) => {
        await settle(page, path);
        await expect(page).toHaveScreenshot(`${name}-${wing}.png`, {
          animations: "disabled",
          fullPage: true,
          mask: [...timeMasks(page), page.locator("canvas")],
          maxDiffPixelRatio: 0.02
        });
      });
    }
  });
}
