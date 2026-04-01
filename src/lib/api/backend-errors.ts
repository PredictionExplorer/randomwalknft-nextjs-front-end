/** Shown in app `error.tsx` when fetch to the Go webserv fails (e.g. ECONNREFUSED). */
export const RANDOMWALK_BACKEND_UNAVAILABLE_MESSAGE =
  "RandomWalk backend API is unreachable. Start websrv (Go) or check NEXT_PUBLIC_API_BASE_URL.";

export function isRandomWalkBackendUnavailableMessage(message: string): boolean {
  return message === RANDOMWALK_BACKEND_UNAVAILABLE_MESSAGE;
}

export function isFetchConnectionError(error: unknown): boolean {
  if (!(error instanceof TypeError)) {
    return false;
  }
  if (error.message !== "fetch failed") {
    return false;
  }
  const cause = (error as { cause?: NodeJS.ErrnoException }).cause;
  if (!cause?.code) {
    return true;
  }
  const { code } = cause;
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET"
  );
}

/** Re-throw as a stable message for error boundaries. */
export function rethrowAsBackendUnavailableIfConnectionFailed(error: unknown): never {
  if (isFetchConnectionError(error)) {
    throw new Error(RANDOMWALK_BACKEND_UNAVAILABLE_MESSAGE, { cause: error });
  }
  throw error;
}
