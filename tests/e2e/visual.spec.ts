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
});
