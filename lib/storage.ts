import { memoryStorage, type AppStorage } from "@estoreclub/app";

/**
 * Where the bag's id and the customer's session are kept: the browser's storage in the
 * preview, so a reload keeps them. On a phone they last until the app closes - the build has no
 * native storage module to offer yet (`@react-native-async-storage/async-storage` slots in here).
 */
export function appStorage(): AppStorage {
  const web = (globalThis as { localStorage?: AppStorage }).localStorage;
  const memory = memoryStorage();

  if (!web) return memory;

  return {
    getItem: (key) => {
      try {
        return web.getItem(key);
      } catch {
        return memory.getItem(key);
      }
    },
    setItem: (key, value) => {
      try {
        web.setItem(key, value);
      } catch {
        memory.setItem(key, value);
      }
    },
    removeItem: (key) => {
      try {
        web.removeItem(key);
      } catch {
        memory.removeItem(key);
      }
    },
  };
}
