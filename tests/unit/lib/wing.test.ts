import { describe, expect, it } from "vitest";

import { editionForWing, isWing, oppositeWing, parseWing, wingForEdition, wingFromCookieHeader } from "@/lib/wing";

describe("wing helpers", () => {
  it("recognises only the two wings", () => {
    expect(isWing("dark")).toBe(true);
    expect(isWing("light")).toBe(true);
    expect(isWing("purple")).toBe(false);
    expect(parseWing("light")).toBe("light");
    expect(parseWing(undefined)).toBe("dark");
    expect(parseWing("nonsense")).toBe("dark");
  });

  it("maps wings to artwork editions and back", () => {
    expect(editionForWing("dark")).toBe("black");
    expect(editionForWing("light")).toBe("white");
    expect(wingForEdition("white")).toBe("light");
    expect(wingForEdition("black")).toBe("dark");
    expect(oppositeWing("dark")).toBe("light");
  });

  it("reads the wing cookie out of a raw Cookie header", () => {
    expect(wingFromCookieHeader("a=1; rw-wing=light; wagmi.store=%7B%7D")).toBe("light");
    expect(wingFromCookieHeader("rw-wing=dark")).toBe("dark");
    expect(wingFromCookieHeader("rw-wing=%22evil%22")).toBe("dark");
    expect(wingFromCookieHeader("other=light")).toBe("dark");
    expect(wingFromCookieHeader(null)).toBe("dark");
  });
});
