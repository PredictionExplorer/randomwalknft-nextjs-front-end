/**
 * Hourly round-robin over redundant backend servers with failover.
 * (Ported from the CosmicGame frontend — same algorithm and semantics.)
 *
 * The API and RPC base URLs may be configured as comma-separated lists
 * (`NEXT_PUBLIC_API_URLS`, `NEXT_PUBLIC_RPC_URLS`). Selection is sticky per
 * clock hour: every client uses `floor(now / 1h) % N`, so traffic alternates
 * between servers each hour without any coordination. When a request to the
 * selected server fails at the transport level (or with a 5xx), the caller
 * marks it down via {@link markServerDown}; the rotation then skips it for
 * {@link FAILURE_COOLDOWN_MS} and serves from the next server in the list.
 * When every server is marked down the hourly pick is returned anyway so the
 * request fails through the normal error path, rather than dying inside this
 * module.
 *
 * Singular `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_RPC_URL` remain supported
 * as one-element lists, so deployments that don't need redundancy configure
 * nothing new.
 */

/** How long a rotation slot lasts: servers alternate once per hour. */
export const ROTATION_PERIOD_MS = 60 * 60 * 1000;

/** How long a failed server is skipped before it gets probed again. */
export const FAILURE_COOLDOWN_MS = 5 * 60 * 1000;

const trimmedList = (raw: string | undefined): string[] =>
  (raw ?? "")
    .split(",")
    .map((u) => u.trim().replace(/\/+$/, ""))
    .filter(Boolean);

/** Parses a plural env list with a singular fallback. Exported for tests. */
export const parseUrlList = (plural: string | undefined, singular: string | undefined): string[] => {
  const list = trimmedList(plural);
  if (list.length > 0) {
    return list;
  }
  return trimmedList(singular);
};

let apiListCache: string[] | null = null;
let rpcListCache: string[] | null = null;

/**
 * Go webserv origins, in rotation order (no trailing slash). Static
 * `process.env.NEXT_PUBLIC_*` reads — required for client bundle inlining.
 * Resolved lazily (and re-tried while empty) so test env stubs are honored.
 */
export function getApiBaseUrls(): string[] {
  if (!apiListCache || apiListCache.length === 0) {
    apiListCache = parseUrlList(process.env.NEXT_PUBLIC_API_URLS, process.env.NEXT_PUBLIC_API_BASE_URL);
  }
  return apiListCache;
}

/** JSON-RPC endpoints, in rotation order (no trailing slash). */
function getRpcBaseUrls(): string[] {
  if (!rpcListCache || rpcListCache.length === 0) {
    rpcListCache = parseUrlList(process.env.NEXT_PUBLIC_RPC_URLS, process.env.NEXT_PUBLIC_RPC_URL);
  }
  return rpcListCache;
}

/** url -> epoch ms until which the server is considered down. */
const downUntil = new Map<string, number>();

/** label -> last selection logged, so the console only shows changes. */
const lastLoggedSelection = new Map<string, string>();

const logSelection = (label: string, url: string): void => {
  if (lastLoggedSelection.get(label) === url) {
    return;
  }
  lastLoggedSelection.set(label, url);
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console -- deliberate operational visibility of the active server in dev.
    console.log(`[serverRotation] using ${label} = ${url}`);
  }
};

const hourlySlot = (count: number, now: number): number =>
  count > 0 ? Math.floor(now / ROTATION_PERIOD_MS) % count : 0;

/**
 * Picks the server for this hour, skipping servers inside their failure
 * cooldown. Falls back to the hourly pick (and logs) when all are down.
 * When `label` is given (e.g. "API", "RPC"), every change of the selected
 * server is announced once on the console.
 */
export function pickServer(urls: string[], now: number = Date.now(), label?: string): string {
  const picked = pickServerInternal(urls, now);
  if (label && picked) {
    logSelection(label, picked);
  }
  return picked;
}

function pickServerInternal(urls: string[], now: number): string {
  if (urls.length === 0) {
    return "";
  }
  const start = hourlySlot(urls.length, now);
  for (let i = 0; i < urls.length; i++) {
    const candidate = urls[(start + i) % urls.length] ?? "";
    if (candidate && (downUntil.get(candidate) ?? 0) <= now) {
      return candidate;
    }
  }
  console.error("[serverRotation] all servers are marked down, using hourly pick anyway:", urls.join(", "));
  return urls[start] ?? "";
}

/** Marks a server as failed so the rotation skips it for the cooldown window. */
export function markServerDown(url: string, now: number = Date.now()): void {
  const base = url.replace(/\/+$/, "");
  if (!base) {
    return;
  }
  downUntil.set(base, now + FAILURE_COOLDOWN_MS);
  console.warn(`[serverRotation] marking server down for ${Math.round(FAILURE_COOLDOWN_MS / 1000)}s:`, base);
}

/** The API origin to use right now (hourly rotation + failover). "" when unconfigured. */
export const getApiBase = (): string => pickServer(getApiBaseUrls(), Date.now(), "API");

/** The RPC endpoint to use right now (hourly rotation + failover). "" when unconfigured. */
export const getRotatedRpcUrl = (): string => pickServer(getRpcBaseUrls(), Date.now(), "RPC");

/**
 * All RPC endpoints with the current hourly pick first — the order for a viem
 * `fallback()` transport, so requests prefer the rotation pick and fail over
 * to the remaining servers automatically.
 */
export function getRpcUrlsInRotationOrder(now: number | null = Date.now()): string[] {
  const urls = getRpcBaseUrls();
  if (urls.length === 0) {
    return [];
  }
  // `null` asks for the configured order without consulting the clock (prerendering).
  const start = now === null ? 0 : hourlySlot(urls.length, now);
  return urls.map((_, i) => urls[(start + i) % urls.length] ?? "").filter(Boolean);
}

/**
 * Given a URL built against one API base, rebuilds it against the current
 * pick. Returns null when the URL doesn't match any configured base or no
 * alternative is available.
 */
export function rebaseUrl(url: string, urls: string[], now: number = Date.now()): string | null {
  const matched = urls.find((base) => url === base || url.startsWith(`${base}/`));
  if (!matched) {
    return null;
  }
  const replacement = pickServer(urls, now);
  if (!replacement || replacement === matched) {
    return null;
  }
  return `${replacement}${url.slice(matched.length)}`;
}

/** Clears failure state and cached env lists (test helper). */
export function __resetServerRotation(): void {
  downUntil.clear();
  lastLoggedSelection.clear();
  apiListCache = null;
  rpcListCache = null;
}
