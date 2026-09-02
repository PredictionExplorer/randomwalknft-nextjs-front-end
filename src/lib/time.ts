/** Duration helpers shared by every countdown on the site (vault clock, sale timer, header chip). */

export type DurationParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function splitDuration(totalSeconds: number): DurationParts {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  return {
    days: Math.floor(clamped / 86_400),
    hours: Math.floor((clamped % 86_400) / 3_600),
    minutes: Math.floor((clamped % 3_600) / 60),
    seconds: clamped % 60
  };
}

function plural(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** Coarse, stable phrasing for assistive technology; never changes every second. */
export function describeDuration(totalSeconds: number): string {
  const { days, hours, minutes } = splitDuration(totalSeconds);
  if (days > 0) {
    return `About ${plural(days, "day")} and ${plural(hours, "hour")}`;
  }
  if (hours > 0) {
    return `About ${plural(hours, "hour")} and ${plural(minutes, "minute")}`;
  }
  return `About ${plural(Math.max(minutes, 1), "minute")}`;
}

/** Compact clock label such as `27d 15:36:08` or `15:36:08`. */
export function formatClock(totalSeconds: number): string {
  const { days, hours, minutes, seconds } = splitDuration(totalSeconds);
  const hms = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  return days > 0 ? `${days}d ${hms}` : hms;
}

/** "3 minutes ago", "2 days ago", "just now" — coarse, for feeds and plaques. */
export function formatRelativeTime(thenMs: number, nowMs: number = Date.now()): string {
  const elapsed = Math.max(0, Math.floor((nowMs - thenMs) / 1000));
  if (elapsed < 45) return "just now";
  const minutes = Math.floor(elapsed / 60);
  if (minutes < 60) return `${plural(minutes, "minute")} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${plural(hours, "hour")} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${plural(days, "day")} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${plural(months, "month")} ago`;
  return `${plural(Math.floor(days / 365), "year")} ago`;
}

/** Whole years since the collection launched (October 2021), from a known timestamp rather than the clock. */
export function yearsSinceLaunch(nowMs: number): number {
  return Math.max(0, new Date(nowMs).getUTCFullYear() - 2021);
}
