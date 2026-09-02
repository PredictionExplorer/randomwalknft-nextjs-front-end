"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;
const FALLBACK_YEAR = 2026;

/**
 * The current year for the copyright line. Rendered on the client so the static
 * shell never has to consult the clock; the server prints a stable fallback.
 */
export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getUTCFullYear(),
    () => FALLBACK_YEAR
  );
  return <>{year}</>;
}
