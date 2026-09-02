import type { Page } from "@playwright/test";

/**
 * Waits until the page is interactive and React's streaming has finished. Late
 * Suspense content arrives in hidden `<div>`s at the end of <body> before being
 * swapped into place (strict locators would briefly see it twice), and errored
 * boundaries leave behind containers holding only `<template>` markers.
 */
export async function settled(page: Page) {
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.hydrated === "true" &&
      Array.from(document.querySelectorAll("body > div[hidden]")).every((node) =>
        Array.from(node.children).every((child) => child.tagName === "TEMPLATE")
      )
  );
}

export async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await settled(page);
}
