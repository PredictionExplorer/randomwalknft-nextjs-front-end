"use client";

import { useEffect } from "react";

/**
 * Flags `<html data-hydrated>` once React is interactive. Nothing in the UI reads
 * it; end-to-end tests use it to know when keyboard shortcuts and client state exist.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}
