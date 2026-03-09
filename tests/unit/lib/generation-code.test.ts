import { describe, expect, it } from "vitest";

import { generatorFiles } from "@/lib/content/generation-code";

describe("generation-code content", () => {
  it("includes the full generator source and reproduction files", () => {
    expect(generatorFiles.source).toContain("def get_seed");
    expect(generatorFiles.source).toContain("def create_media");
    expect(generatorFiles.source).toContain("if __name__ == \"__main__\":");
    expect(generatorFiles.requirements).toContain("opencv-python");
    expect(generatorFiles.readme).toContain("python3 randomWalkGen.py 3456");
  });
});
