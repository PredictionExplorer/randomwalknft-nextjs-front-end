/**
 * Web stub for @metamask/sdk’s optional React Native dependency. The browser bundle still
 * references this module; webpack would otherwise try to resolve the real RN package.
 */
const AsyncStorage = {
  getItem: async (_key: string): Promise<string | null> => null,
  setItem: async (_key: string, _value: string): Promise<void> => {},
  removeItem: async (_key: string): Promise<void> => {},
  mergeItem: async (_key: string, _value: string): Promise<void> => {},
  clear: async (): Promise<void> => {},
  getAllKeys: async (): Promise<string[]> => [],
  multiGet: async (keys: string[]): Promise<[string, string | null][]> =>
    keys.map((k) => [k, null]),
  multiSet: async (_pairs: [string, string][]): Promise<void> => {},
  multiRemove: async (_keys: string[]): Promise<void> => {}
};

export default AsyncStorage;
