/** Shown in app `error.tsx` when fetch to the Go webserv fails (e.g. ECONNREFUSED). */
const RANDOMWALK_BACKEND_UNAVAILABLE_MESSAGE =
  "RandomWalk backend API is unreachable. Start websrv (Go) or check NEXT_PUBLIC_API_BASE_URL.";

const CONNECTION_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "ECONNRESET",
  "UND_ERR_SOCKET",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_CONNECT_TIMEOUT"
]);

export function isRandomWalkBackendUnavailableMessage(message: string): boolean {
  return message === RANDOMWALK_BACKEND_UNAVAILABLE_MESSAGE;
}

/** `AbortSignal.timeout()` rejects with a DOMException named `TimeoutError`. */
export function isUpstreamTimeoutError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    ((error as { name?: unknown }).name === "TimeoutError" || (error as { name?: unknown }).name === "AbortError")
  );
}

/**
 * True for transport-level failures where the request never produced a response:
 * DNS/connect/socket errors from undici, or our own upstream timeout. These are
 * safe to retry against another server in the rotation.
 */
export function isFetchConnectionError(error: unknown): boolean {
  if (isUpstreamTimeoutError(error)) {
    return true;
  }
  if (!(error instanceof TypeError)) {
    return false;
  }
  // undici (Node) says "fetch failed"; browsers, edge runtimes, and MSW say "Failed to fetch".
  if (error.message !== "fetch failed" && error.message !== "Failed to fetch") {
    return false;
  }
  const cause = (error as { cause?: NodeJS.ErrnoException }).cause;
  if (!cause?.code) {
    return true;
  }
  return CONNECTION_ERROR_CODES.has(cause.code);
}

/** Re-throw as a stable message for error boundaries. */
export function rethrowAsBackendUnavailableIfConnectionFailed(error: unknown): never {
  if (isFetchConnectionError(error)) {
    throw new Error(RANDOMWALK_BACKEND_UNAVAILABLE_MESSAGE, { cause: error });
  }
  throw error;
}
