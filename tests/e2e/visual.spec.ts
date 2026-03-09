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
      fullPage: true,
      animations: "disabled"
    });
  });

  test("login page matches desktop snapshot", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveScreenshot("login-desktop.png", {
      fullPage: true,
      animations: "disabled"
    });
  });

  test("detail page matches desktop snapshot", async ({ page }) => {
    await page.goto("/detail/1");
    await expect(page).toHaveScreenshot("detail-desktop.png", {
      fullPage: true,
      animations: "disabled"
    });
  });
});
