import { expect, test } from "@playwright/test";

test.describe("visual regressions", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
        video {
          visibility: hidden !important;
        }
      `
    });
  });

  test("faq page matches desktop snapshot", async ({ page }) => {
    await page.goto("/faq");
    await expect(page).toHaveScreenshot("faq-desktop.png", {
      animations: "disabled"
    });
  });

  test("code page matches desktop snapshot", async ({ page }) => {
    await page.goto("/code");
    await expect(page).toHaveScreenshot("code-desktop.png", {
      animations: "disabled"
    });
  });

  test("detail page matches desktop snapshot", async ({ page }) => {
    await page.goto("/detail/1");
    await expect(page).toHaveScreenshot("detail-desktop.png", {
      animations: "disabled"
    });
  });

  test("homepage matches desktop snapshot", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("homepage-desktop.png", {
      animations: "disabled",
      fullPage: true,
      maxDiffPixelRatio: 0.02
    });
  });

  test("gallery matches desktop snapshot", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page).toHaveScreenshot("gallery-desktop.png", {
      animations: "disabled",
      fullPage: true,
      maxDiffPixelRatio: 0.02
    });
  });

  test("marketplace matches desktop snapshot", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(page).toHaveScreenshot("marketplace-desktop.png", {
      animations: "disabled",
      fullPage: true,
      maxDiffPixelRatio: 0.02
    });
  });

  test("mint matches desktop snapshot", async ({ page }) => {
    await page.goto("/mint");
    await expect(page).toHaveScreenshot("mint-desktop.png", {
      animations: "disabled",
      fullPage: true,
      maxDiffPixelRatio: 0.02
    });
  });
});
