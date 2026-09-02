import { describe, expect, it } from "vitest";

import { editionForWing, isWing, oppositeWing, parseWing, wingForEdition } from "@/lib/wing";

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
});
