import { expect, test, type Page } from "@playwright/test";

async function waitForStableDocumentHeight(page: Page) {
  await page.waitForFunction(
    () =>
      new Promise((resolve) => {
        let lastHeight = 0;
        let stableFrames = 0;

        const check = () => {
          const height = document.documentElement.scrollHeight;
          if (height === lastHeight) {
            stableFrames += 1;
          } else {
            lastHeight = height;
            stableFrames = 0;
          }

          if (stableFrames >= 5) {
            resolve(true);
            return;
          }

          requestAnimationFrame(check);
        };

        check();
      }),
    undefined,
    { timeout: 10000 }
  );
}

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

  /** Live header chip (prize + ticking clock) appears on every page. */
  const headerMasks = (page: Page) => [page.getByTestId("vault-ticker")];

  test("faq page matches desktop snapshot", async ({ page }) => {
    await page.goto("/faq");
    await expect(page).toHaveScreenshot("faq-desktop.png", {
      animations: "disabled",
      mask: headerMasks(page)
    });
  });

  test("code page matches desktop snapshot", async ({ page }) => {
    await page.goto("/code");
    await expect(page).toHaveScreenshot("code-desktop.png", {
      animations: "disabled",
      mask: headerMasks(page)
    });
  });

  test("detail page matches desktop snapshot", async ({ page }) => {
    await page.goto("/detail/1");
    await expect(page).toHaveScreenshot("detail-desktop.png", {
      animations: "disabled",
      mask: headerMasks(page)
    });
  });

  test("homepage matches desktop snapshot", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("homepage-desktop.png", {
      animations: "disabled",
      fullPage: true,
      // Live surfaces: the masthead facts, the story stage, the collection wall
      // (daily artworks + constellation), the vault chapter, and the salon pair.
      mask: [
        ...headerMasks(page),
        page.getByTestId("masthead-facts"),
        page.getByTestId("homepage-wall"),
        page.locator("canvas"),
        page.locator("section#vault"),
        page.getByRole("heading", { name: /which is more beautiful/i }).locator("xpath=ancestor::section")
      ],
      maxDiffPixelRatio: 0.02
    });
  });

  test("gallery matches desktop snapshot", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.locator('a[href^="/detail/"]')).toHaveCount(24);
    await waitForStableDocumentHeight(page);
    await expect(page).toHaveScreenshot("gallery-desktop.png", {
      animations: "disabled",
      fullPage: true,
      mask: headerMasks(page),
      maxDiffPixelRatio: 0.05
    });
  });

  test("mint matches desktop snapshot", async ({ page }) => {
    await page.goto("/mint");
    await expect(page).toHaveScreenshot("mint-desktop.png", {
      animations: "disabled",
      fullPage: true,
      mask: [...headerMasks(page), page.getByTestId("mint-featured-rail")],
      maxDiffPixelRatio: 0.02
    });
  });
});
