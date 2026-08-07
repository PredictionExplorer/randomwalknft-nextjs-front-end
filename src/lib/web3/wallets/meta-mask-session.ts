const METAMASK_SESSION_MARKER = "randomwalk:metamask-sdk-session";

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function hasMetaMaskSessionMarker(): boolean {
  try {
    return getStorage()?.getItem(METAMASK_SESSION_MARKER) === "authorized";
  } catch {
    return false;
  }
}

export function markMetaMaskSessionAuthorized(): void {
  try {
    getStorage()?.setItem(METAMASK_SESSION_MARKER, "authorized");
  } catch {
    // The active connection still works when persistent storage is unavailable.
  }
}

export function clearMetaMaskSessionMarker(): void {
  try {
    getStorage()?.removeItem(METAMASK_SESSION_MARKER);
  } catch {
    // A stale marker causes only one failed authorization probe on a later load.
  }
}
