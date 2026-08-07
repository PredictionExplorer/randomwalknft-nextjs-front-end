/**
 * Web stub for @metamask/sdk’s optional React Native dependency. The browser bundle still
 * references this module; webpack would otherwise try to resolve the real RN package.
 */
const STORAGE_PREFIX = "randomwalk:metamask:";
const memoryFallback = new Map<string, string>();
const removedFallbackKeys = new Set<string>();

function getWebStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function storageKey(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeRecords(
  current: Record<string, unknown>,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...current };

  for (const [key, value] of Object.entries(incoming)) {
    const currentValue = merged[key];
    merged[key] =
      isRecord(currentValue) && isRecord(value)
        ? mergeRecords(currentValue, value)
        : value;
  }

  return merged;
}

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === "undefined") {
      return null;
    }

    const namespacedKey = storageKey(key);
    if (removedFallbackKeys.has(namespacedKey)) {
      return null;
    }
    const memoryValue = memoryFallback.get(namespacedKey);
    if (memoryValue !== undefined) {
      return memoryValue;
    }
    try {
      return getWebStorage()?.getItem(namespacedKey) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }

    const namespacedKey = storageKey(key);
    removedFallbackKeys.delete(namespacedKey);
    memoryFallback.set(namespacedKey, value);
    try {
      getWebStorage()?.setItem(namespacedKey, value);
    } catch {
      // Private browsing and storage quotas can reject writes. Keep a tab-local fallback.
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }

    const namespacedKey = storageKey(key);
    memoryFallback.delete(namespacedKey);
    removedFallbackKeys.add(namespacedKey);
    try {
      getWebStorage()?.removeItem(namespacedKey);
    } catch {
      // The in-memory copy is already removed.
    }
  },
  mergeItem: async (key: string, value: string): Promise<void> => {
    const currentValue = await AsyncStorage.getItem(key);
    if (!currentValue) {
      await AsyncStorage.setItem(key, value);
      return;
    }

    try {
      const current = JSON.parse(currentValue) as unknown;
      const incoming = JSON.parse(value) as unknown;
      if (isRecord(current) && isRecord(incoming)) {
        await AsyncStorage.setItem(key, JSON.stringify(mergeRecords(current, incoming)));
        return;
      }
    } catch {
      // Match AsyncStorage's useful fallback for non-JSON values.
    }

    await AsyncStorage.setItem(key, value);
  },
  clear: async (): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }

    for (const key of [...memoryFallback.keys()]) {
      if (key.startsWith(STORAGE_PREFIX)) {
        memoryFallback.delete(key);
        removedFallbackKeys.add(key);
      }
    }

    const storage = getWebStorage();
    if (!storage) {
      return;
    }

    try {
      const keysToRemove: string[] = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
          removedFallbackKeys.add(key);
        }
      }
      keysToRemove.forEach((key) => storage.removeItem(key));
    } catch {
      // The in-memory namespace is already clear.
    }
  },
  getAllKeys: async (): Promise<string[]> => {
    if (typeof window === "undefined") {
      return [];
    }

    const keys = new Set<string>();
    for (const key of memoryFallback.keys()) {
      if (key.startsWith(STORAGE_PREFIX) && !removedFallbackKeys.has(key)) {
        keys.add(key.slice(STORAGE_PREFIX.length));
      }
    }

    const storage = getWebStorage();
    if (storage) {
      try {
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);
          if (
            key?.startsWith(STORAGE_PREFIX) &&
            !removedFallbackKeys.has(key)
          ) {
            keys.add(key.slice(STORAGE_PREFIX.length));
          }
        }
      } catch {
        // Return the tab-local keys.
      }
    }

    return [...keys];
  },
  multiGet: async (keys: string[]): Promise<[string, string | null][]> =>
    Promise.all(keys.map(async (key) => [key, await AsyncStorage.getItem(key)])),
  multiSet: async (pairs: [string, string][]): Promise<void> => {
    await Promise.all(pairs.map(([key, value]) => AsyncStorage.setItem(key, value)));
  },
  multiRemove: async (keys: string[]): Promise<void> => {
    await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
  }
};

export default AsyncStorage;
