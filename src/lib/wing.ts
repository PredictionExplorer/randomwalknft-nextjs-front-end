import type { AssetTheme } from "@/lib/types";

/**
 * The two wings of the gallery. Every artwork exists in a black and a white edition,
 * so the wing decides both the UI palette and which edition previews show.
 */
export type Wing = "dark" | "light";

export const WING_COOKIE = "rw-wing";
export const DEFAULT_WING: Wing = "dark";
/** One year, in seconds. */
export const WING_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isWing(value: unknown): value is Wing {
  return value === "dark" || value === "light";
}

export function parseWing(value: string | null | undefined): Wing {
  return isWing(value) ? value : DEFAULT_WING;
}

/** Artwork edition rendered in a wing: black-background files in the dark wing, white in the light. */
export function editionForWing(wing: Wing): AssetTheme {
  return wing === "light" ? "white" : "black";
}

export function wingForEdition(edition: AssetTheme): Wing {
  return edition === "white" ? "light" : "dark";
}

export function oppositeWing(wing: Wing): Wing {
  return wing === "dark" ? "light" : "dark";
}

/** Reads the wing from a raw `Cookie` header without pulling in a cookie parser. */
export function wingFromCookieHeader(cookieHeader: string | null | undefined): Wing {
  if (!cookieHeader) {
    return DEFAULT_WING;
  }
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.split("=");
    if (rawName?.trim() === WING_COOKIE) {
      return parseWing(decodeURIComponent(rest.join("=").trim()));
    }
  }
  return DEFAULT_WING;
}
