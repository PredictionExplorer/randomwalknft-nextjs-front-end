"use client";

import { createContext, use, useState, useSyncExternalStore } from "react";

import { trackEvent } from "@/lib/analytics";
import type { AssetTheme } from "@/lib/types";
import {
  DEFAULT_WING,
  editionForWing,
  oppositeWing,
  parseWing,
  type Wing,
  WING_COOKIE,
  WING_COOKIE_MAX_AGE
} from "@/lib/wing";

type WingContextValue = {
  wing: Wing;
  /** Artwork edition that matches the wing. */
  edition: AssetTheme;
  setWing: (wing: Wing) => void;
  toggleWing: () => void;
};

const WingContext = createContext<WingContextValue | null>(null);

function persistWing(wing: Wing) {
  document.documentElement.dataset.wing = wing;
  document.cookie = `${WING_COOKIE}=${wing}; Path=/; Max-Age=${WING_COOKIE_MAX_AGE}; SameSite=Lax`;
}

const subscribeToNothing = () => () => undefined;

/**
 * The document shell is prerendered in the default wing and an inline script in
 * <head> applies the visitor's cookie to `<html data-wing>` before first paint, so
 * the colour tokens never flash. This provider picks that attribute up as soon as
 * React hydrates (server snapshot = default, so hydration stays consistent) and
 * keeps the attribute, the cookie, and React state in step afterwards.
 */
export function WingProvider({
  initialWing = DEFAULT_WING,
  children
}: {
  initialWing?: Wing | undefined;
  children: React.ReactNode;
}) {
  // The attribute is always present in the real document; `initialWing` covers renders without one.
  const bootstrapWing = useSyncExternalStore(
    subscribeToNothing,
    () => parseWing(document.documentElement.dataset.wing ?? initialWing),
    () => initialWing
  );
  const [chosenWing, setChosenWing] = useState<Wing | null>(null);
  const wing = chosenWing ?? bootstrapWing;

  const setWing = (next: Wing) => {
    setChosenWing(next);
    persistWing(next);
    trackEvent("wing_changed", { wing: next });
  };

  const value: WingContextValue = {
    wing,
    edition: editionForWing(wing),
    setWing,
    toggleWing: () => setWing(oppositeWing(wing))
  };

  return <WingContext value={value}>{children}</WingContext>;
}

export function useWing(): WingContextValue {
  const context = use(WingContext);
  if (!context) {
    throw new Error("useWing must be used within WingProvider");
  }
  return context;
}

/** Artwork edition for read-only consumers; falls back to the dark wing outside the provider. */
export function useWingEdition(): AssetTheme {
  return use(WingContext)?.edition ?? editionForWing(DEFAULT_WING);
}
