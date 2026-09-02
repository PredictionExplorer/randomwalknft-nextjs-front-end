"use client";

import { createContext, use, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import type { AssetTheme } from "@/lib/types";
import { DEFAULT_WING, editionForWing, oppositeWing, type Wing, WING_COOKIE, WING_COOKIE_MAX_AGE } from "@/lib/wing";

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

/**
 * The server renders `<html data-wing>` from the cookie, so there is no flash; this
 * provider only has to keep the attribute, the cookie, and React state in step.
 */
export function WingProvider({ initialWing, children }: { initialWing: Wing; children: React.ReactNode }) {
  const [wing, setWingState] = useState<Wing>(initialWing);

  const setWing = (next: Wing) => {
    setWingState(next);
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
