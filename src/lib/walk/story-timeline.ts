/**
 * Maps homepage scroll progress (0..1 across the story section) onto what the
 * stage shows. Pure so it can be unit-tested and reasoned about without a browser.
 *
 * Four chapters of equal scroll height; the sticky stage pins for all of them.
 *   0 Seed    — the first pixel appears and the seed types itself in
 *   1 Steps   — the walker draws a monochrome trail
 *   2 Colour  — the trail finishes while colour floods along it
 *   3 Frame   — camera at rest, the finished work is framed and labelled
 */

export type StoryFrame = {
  chapter: 0 | 1 | 2 | 3;
  /** Fraction of the walk's points that are painted. */
  draw: number;
  /** Fraction of the walk's points painted in colour. */
  color: number;
  /** Fraction of the seed characters revealed. */
  seed: number;
  /** Camera zoom on the stage: >1 follows the walker, 1 shows the whole work. */
  zoom: number;
  /** Opacity of the museum plate that frames the finished work. */
  plate: number;
};

const SEED_END = 0.12;
const STEPS_START = 1 / 6;
const STEPS_END = 0.5;
const COLOR_START = 0.5;
const COLOR_END = 5 / 6;
const PLATE_START = 0.8;
const PLATE_END = 0.92;

/** Fraction drawn while the seed is typing: a few hundred hesitant first steps. */
const FIRST_STEPS_FRACTION = 0.02;
/** Fraction drawn by the end of the steps chapter; colour finishes the rest. */
const STEPS_FRACTION = 0.55;
const MAX_ZOOM = 2.6;

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

function range(value: number, start: number, end: number): number {
  return clamp01((value - start) / (end - start));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function chapterAt(progress: number): StoryFrame["chapter"] {
  const p = clamp01(progress);
  if (p < STEPS_START) return 0;
  if (p < STEPS_END) return 1;
  if (p < COLOR_END) return 2;
  return 3;
}

export function storyFrameAt(progress: number): StoryFrame {
  const p = clamp01(progress);
  const chapter = chapterAt(p);

  const seed = easeOutCubic(range(p, 0, SEED_END));

  let draw: number;
  if (p < STEPS_START) {
    draw = FIRST_STEPS_FRACTION * range(p, SEED_END * 0.5, STEPS_START);
  } else if (p < STEPS_END) {
    draw =
      FIRST_STEPS_FRACTION + (STEPS_FRACTION - FIRST_STEPS_FRACTION) * easeInOutSine(range(p, STEPS_START, STEPS_END));
  } else {
    draw = STEPS_FRACTION + (1 - STEPS_FRACTION) * easeInOutSine(range(p, COLOR_START, COLOR_END));
  }

  const color = p < COLOR_START ? 0 : easeInOutSine(range(p, COLOR_START, COLOR_END));

  // Zoom eases out from a close-up on the walker to the full frame as colour completes.
  const zoom = 1 + (MAX_ZOOM - 1) * (1 - easeInOutSine(range(p, STEPS_START, COLOR_END)));

  const plate = easeOutCubic(range(p, PLATE_START, PLATE_END));

  return { chapter, draw, color, seed, zoom, plate };
}

/** The frame shown when motion is reduced or JavaScript never ran: the finished work. */
export const STORY_FINAL_FRAME: StoryFrame = { chapter: 3, draw: 1, color: 1, seed: 1, zoom: 1, plate: 1 };
