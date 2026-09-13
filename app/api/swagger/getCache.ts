type CacheEntry<T> = { data: T; timestamp: number };

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const SESSION_PREFIX = "hust:swagger:get-cache:";

const storage = () => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

export function readGetCache<T>(key: string): CacheEntry<T> | undefined {
  const memory = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memory) return memory;
  const store = storage();
  if (!store) return undefined;
  try {
    const raw = store.getItem(`${SESSION_PREFIX}${key}`);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.timestamp !== "number") return undefined;
    memoryCache.set(key, entry as CacheEntry<unknown>);
    return entry;
  } catch {
    return undefined;
  }
}

export function writeGetCache<T>(key: string, data: T) {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry as CacheEntry<unknown>);
  const store = storage();
  if (!store) return;
  try {
    store.setItem(`${SESSION_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Cache failure must never block the API request or UI.
  }
}

export function fetchGetCache<T>(
  key: string,
  request: () => Promise<T>,
): Promise<T> {
  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const pending = request().finally(() => inFlight.delete(key));
  inFlight.set(key, pending as Promise<unknown>);
  return pending;
}

export function invalidateGetCache(keys: string[]) {
  const store = storage();
  const expandedKeys = keys.flatMap((key) =>
    key.endsWith("*")
      ? [...memoryCache.keys()].filter((cachedKey) =>
          cachedKey.startsWith(key.slice(0, -1)),
        )
      : [key],
  );
  keys
    .filter((key) => key.endsWith("*"))
    .forEach((key) => {
      [...inFlight.keys()]
        .filter((pendingKey) => pendingKey.startsWith(key.slice(0, -1)))
        .forEach((pendingKey) => inFlight.delete(pendingKey));
    });
  expandedKeys.forEach((key) => {
    memoryCache.delete(key);
    inFlight.delete(key);
    try {
      store?.removeItem(`${SESSION_PREFIX}${key}`);
    } catch {
      // Ignore unavailable session storage.
    }
  });
  if (store) {
    try {
      Array.from({ length: store.length }, (_, index) => store.key(index))
        .filter((key): key is string => Boolean(key))
        .filter((key) =>
          keys.some(
            (candidate) =>
              candidate.endsWith("*") &&
              key.startsWith(`${SESSION_PREFIX}${candidate.slice(0, -1)}`),
          ),
        )
        .forEach((key) => store.removeItem(key));
    } catch {
      // Ignore unavailable session storage.
    }
  }
}

export const CACHE_TTL = {
  workflow: 10_000,
  status: 10_000,
  sync: 10_000,
  preflight: 10_000,
  diff: 15_000,
  branches: 30_000,
  history: 30_000,
  giteaDemo: 30_000,
} as const;
