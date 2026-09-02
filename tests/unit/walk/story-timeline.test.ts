import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { chapterAt, STORY_FINAL_FRAME, storyFrameAt } from "@/lib/walk/story-timeline";

describe("storyFrameAt", () => {
  it("starts with nothing drawn, the seed hidden, and the camera close in", () => {
    const frame = storyFrameAt(0);
    expect(frame).toMatchObject({ chapter: 0, draw: 0, color: 0, seed: 0, plate: 0 });
    expect(frame.zoom).toBeGreaterThan(2);
  });

  it("ends on the finished, fully coloured, framed work", () => {
    expect(storyFrameAt(1)).toEqual(STORY_FINAL_FRAME);
    expect(storyFrameAt(2)).toEqual(STORY_FINAL_FRAME);
  });

  it("walks through the four chapters in order", () => {
    expect(chapterAt(0)).toBe(0);
    expect(chapterAt(0.3)).toBe(1);
    expect(chapterAt(0.6)).toBe(2);
    expect(chapterAt(0.95)).toBe(3);
  });

  it("types the seed in before the walker moves and keeps colour for the third chapter", () => {
    const typing = storyFrameAt(0.06);
    expect(typing.seed).toBeGreaterThan(0.3);
    expect(typing.draw).toBeLessThan(0.02);

    const steps = storyFrameAt(0.4);
    expect(steps.draw).toBeGreaterThan(0.1);
    expect(steps.color).toBe(0);

    const colour = storyFrameAt(0.7);
    expect(colour.color).toBeGreaterThan(0.3);
    expect(colour.color).toBeLessThanOrEqual(colour.draw + 1e-9);
  });

  it("is monotonic and bounded for every scroll position", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), (a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const early = storyFrameAt(lo);
        const late = storyFrameAt(hi);
        expect(late.draw).toBeGreaterThanOrEqual(early.draw - 1e-9);
        expect(late.color).toBeGreaterThanOrEqual(early.color - 1e-9);
        expect(late.seed).toBeGreaterThanOrEqual(early.seed - 1e-9);
        expect(late.plate).toBeGreaterThanOrEqual(early.plate - 1e-9);
        expect(late.zoom).toBeLessThanOrEqual(early.zoom + 1e-9);
        for (const frame of [early, late]) {
          expect(frame.draw).toBeGreaterThanOrEqual(0);
          expect(frame.draw).toBeLessThanOrEqual(1);
          expect(frame.color).toBeLessThanOrEqual(frame.draw + 1e-9);
          expect(frame.zoom).toBeGreaterThanOrEqual(1);
        }
      })
    );
  });

  it("treats garbage progress as the start", () => {
    expect(storyFrameAt(Number.NaN)).toEqual(storyFrameAt(0));
    expect(storyFrameAt(-3)).toEqual(storyFrameAt(0));
  });
});
