import { expect, test } from "@playwright/test";

const HYDRATION_PATTERNS = [
  "Hydration failed",
  "server rendered HTML didn't match",
  "Text content does not match",
  "did not match. Server:",
  "tree hydrated but some attributes",
  "There was an error while hydrating"
];

const pages = [
  "/",
  "/gallery",
  "/marketplace",
  "/mint",
  "/redeem",
  "/compare",
  "/trading",
  "/random",
  "/random-video",
  "/code",
  "/faq",
  "/detail/1",
  "/my-nfts",
  "/my-offers"
];

for (const route of pages) {
  test(`${route} renders without hydration errors`, async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (HYDRATION_PATTERNS.some((pattern) => text.includes(pattern))) {
        hydrationErrors.push(text.slice(0, 300));
      }
    });

    page.on("pageerror", (err) => {
      if (HYDRATION_PATTERNS.some((pattern) => err.message.includes(pattern))) {
        hydrationErrors.push(err.message.slice(0, 300));
      }
    });

    await page.goto(route, { waitUntil: "networkidle" });

    expect(
      hydrationErrors,
      `Hydration errors on ${route}:\n${hydrationErrors.join("\n")}`
    ).toHaveLength(0);
  });
}
