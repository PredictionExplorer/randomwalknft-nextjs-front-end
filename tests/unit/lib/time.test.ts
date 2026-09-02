import { describe, expect, it } from "vitest";

import { describeDuration, formatClock, formatRelativeTime, splitDuration } from "@/lib/time";

describe("splitDuration", () => {
  it("splits seconds into calendar parts and clamps negatives", () => {
    expect(splitDuration(90_061)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
    expect(splitDuration(-5)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(splitDuration(59.9)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 59 });
  });
});

describe("describeDuration", () => {
  it("speaks in the coarsest useful unit", () => {
    expect(describeDuration(2 * 86_400 + 3 * 3_600)).toBe("About 2 days and 3 hours");
    expect(describeDuration(86_400 + 3_600)).toBe("About 1 day and 1 hour");
    expect(describeDuration(3 * 3_600 + 15 * 60)).toBe("About 3 hours and 15 minutes");
    expect(describeDuration(5 * 60)).toBe("About 5 minutes");
    expect(describeDuration(20)).toBe("About 1 minute");
  });
});

describe("formatClock", () => {
  it("shows days only when there are any", () => {
    expect(formatClock(27 * 86_400 + 15 * 3_600 + 36 * 60 + 8)).toBe("27d 15:36:08");
    expect(formatClock(3_661)).toBe("01:01:01");
    expect(formatClock(0)).toBe("00:00:00");
  });
});

describe("formatRelativeTime", () => {
  const now = Date.UTC(2026, 8, 2, 12, 0, 0);

  it("rounds to a friendly unit", () => {
    expect(formatRelativeTime(now - 10_000, now)).toBe("just now");
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe("5 minutes ago");
    expect(formatRelativeTime(now - 60 * 60_000, now)).toBe("1 hour ago");
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe("2 days ago");
    expect(formatRelativeTime(now - 45 * 86_400_000, now)).toBe("1 month ago");
    expect(formatRelativeTime(now - 800 * 86_400_000, now)).toBe("2 years ago");
    expect(formatRelativeTime(now + 5_000, now)).toBe("just now");
  });
});
