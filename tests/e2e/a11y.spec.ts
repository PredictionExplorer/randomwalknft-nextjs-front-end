import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { installMockWallet } from "./fixtures/mock-wallet";
import { goto } from "./fixtures/navigation";

const ROUTES = [
  "/",
  "/gallery",
  "/gallery?sortBy=beauty",
  "/detail/12",
  "/vault",
  "/mint",
  "/atelier",
  "/compare",
  "/faq",
  "/how-it-works",
  "/code"
];

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    // Third-party toast region is injected by sonner and has no content at rest.
    .exclude("[data-sonner-toaster]")
    .analyze();
  expect(
    results.violations.map(
      (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`
    )
  ).toEqual([]);
}

for (const wing of ["dark", "light"] as const) {
  test.describe(`${wing} wing`, () => {
    test.use({ storageState: undefined });

    for (const route of ROUTES) {
      test(`${route} has no WCAG AA violations`, async ({ page, context }) => {
        await context.addCookies([{ name: "rw-wing", value: wing, url: "http://127.0.0.1:3100" }]);
        await goto(page, route);
        await expect(page.locator("html")).toHaveAttribute("data-wing", wing);
        await expectNoViolations(page);
      });
    }
  });
}

test("the connect dialog is accessible and traps focus", async ({ page }) => {
  await installMockWallet(page, { chainId: "0xa4b1" });
  // Skip the open animation so axe measures settled colours.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await goto(page, "/");
  await page
    .getByRole("button", { name: /connect wallet/i })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expectNoViolations(page);

  // Focus stays inside the dialog while tabbing.
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => Boolean(document.activeElement?.closest("[role=dialog]")));
    expect(inside).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("keyboard visitors can skip to content and reach every primary control", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "WebKit does not move focus to links with Tab unless the OS setting is on");
  await goto(page, "/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to content/i });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  // Every header control is reachable and labelled.
  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: /collection/i })).toBeVisible();
  await expect(header.getByRole("switch", { name: /switch to the light wing/i })).toBeVisible();
  await expect(header.getByRole("button", { name: /connect wallet/i })).toBeVisible();
  await expect(header.getByRole("link", { name: /vault:/i })).toBeVisible();
});

test("the homepage story is readable without motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await goto(page, "/");
  const story = page.getByTestId("walk-story");
  await expect(story.getByRole("heading", { name: /every walk begins with a seed/i })).toBeVisible();
  // With motion reduced the stage shows the finished work at once.
  await expect(story.getByText(/untitled walk · not minted/i)).toBeVisible();
});

test("images and media carry meaningful alternative text", async ({ page }) => {
  await goto(page, "/gallery");
  const alts = await page
    .locator("main img[alt]")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("alt")));
  expect(alts.length).toBeGreaterThan(0);
  for (const alt of alts) {
    expect(alt).toMatch(/Random Walk NFT #\d{6}/);
  }
});
