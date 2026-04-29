import "server-only";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const SIDEBAR_ENDPOINT = "https://node_js.hust.media/community/sidebar_menu";
const SUCCESS_TTL_MS = 6 * 60 * 60 * 1000;
const ERROR_TTL_MS = 5 * 1000;
const REQUEST_TIMEOUT_MS = 8000;

export type SidebarMenuItem = {
  label?: string | Record<string, string>;
  url_redirect?: string;
  url_mode?: string;
  iconType?: string;
  icon_src?: string;
  latest_version?: Array<number | string>;
  data?: SidebarMenuItem[];
};

export type SidebarPayload = {
  apikey: string;
  main_domain: string;
  national_market: string;
};

export type SidebarApiResponse = {
  api_status: string;
  api_results: {
    latest_version: number | string;
    sidebar_menu: SidebarMenuItem[];
  };
};

type CacheEntry = {
  expiresAt: number;
  response: SidebarApiResponse;
};

type SidebarCache = {
  success: Map<string, CacheEntry>;
  error: Map<string, CacheEntry>;
};

type SidebarCacheFile = {
  success: Record<string, CacheEntry>;
  error: Record<string, CacheEntry>;
};

const CACHE_FILE_PATH = path.join(os.tmpdir(), "hust_next_sidebar_cache_v1.json");

declare global {
  var __sidebarServerCache__: SidebarCache | undefined;
}

const getCacheStore = (): SidebarCache => {
  if (!globalThis.__sidebarServerCache__) {
    globalThis.__sidebarServerCache__ = {
      success: new Map<string, CacheEntry>(),
      error: new Map<string, CacheEntry>(),
    };
  }
  return globalThis.__sidebarServerCache__;
};

const readFileCache = async (): Promise<SidebarCacheFile> => {
  try {
    const raw = await fs.readFile(CACHE_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SidebarCacheFile>;
    return {
      success: parsed.success && typeof parsed.success === "object" ? parsed.success : {},
      error: parsed.error && typeof parsed.error === "object" ? parsed.error : {},
    };
  } catch {
    return { success: {}, error: {} };
  }
};

const writeFileCache = async (cache: SidebarCacheFile) => {
  try {
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache), "utf8");
  } catch {
    // best effort
  }
};

export const clearSidebarMenuServerCache = async () => {
  const cache = getCacheStore();
  cache.success.clear();
  cache.error.clear();
  try {
    await fs.unlink(CACHE_FILE_PATH);
  } catch {
    // ignore if cache file does not exist
  }
};

const cacheKeyFromPayload = (payload: SidebarPayload) => {
  return JSON.stringify({
    apikey: String(payload.apikey || ""),
    main_domain: String(payload.main_domain || "hust"),
    national_market:
      payload.national_market === "vi" || payload.national_market === "en"
        ? payload.national_market
        : "vi",
  });
};

const getCached = (store: Map<string, CacheEntry>, key: string) => {
  const cached = store.get(key);
  if (!cached) return null;
  if (Date.now() >= cached.expiresAt) {
    store.delete(key);
    return null;
  }
  return cached.response;
};

const setCached = (store: Map<string, CacheEntry>, key: string, response: SidebarApiResponse, ttlMs: number) => {
  store.set(key, {
    expiresAt: Date.now() + ttlMs,
    response,
  });
};

const toErrorSchema = (
  message: string,
  previousSuccess: SidebarApiResponse | null
): SidebarApiResponse => {
  const latestVersion = previousSuccess?.api_results.latest_version ?? "";
  const sidebarMenu = previousSuccess?.api_results.sidebar_menu ?? [];
  return {
    api_status: `api_error:${message}`,
    api_results: {
      latest_version: latestVersion,
      sidebar_menu: sidebarMenu,
    },
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isSidebarApiResponse = (value: unknown): value is SidebarApiResponse => {
  if (!isRecord(value)) return false;
  if (typeof value.api_status !== "string") return false;
  if (!isRecord(value.api_results)) return false;
  const latestVersion = value.api_results.latest_version;
  if (typeof latestVersion !== "string" && typeof latestVersion !== "number") return false;
  if (!Array.isArray(value.api_results.sidebar_menu)) return false;
  return true;
};

const isSuccessResponse = (value: SidebarApiResponse) => value.api_status === "success";

export const getSidebarMenuServer = async (payload: SidebarPayload): Promise<SidebarApiResponse> => {
  const cache = getCacheStore();
  const key = cacheKeyFromPayload(payload);

  const successCached = getCached(cache.success, key);
  if (successCached) return successCached;

  const fileCache = await readFileCache();
  const fileSuccess = fileCache.success[key];
  if (fileSuccess && Date.now() < fileSuccess.expiresAt) {
    cache.success.set(key, fileSuccess);
    return fileSuccess.response;
  }

  const errorCached = getCached(cache.error, key);
  if (errorCached) return errorCached;

  const fileError = fileCache.error[key];
  if (fileError && Date.now() < fileError.expiresAt) {
    cache.error.set(key, fileError);
    return fileError.response;
  }

  const latestSuccessForPayload = cache.success.get(key)?.response ?? null;

  try {
    const response = await fetch(SIDEBAR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorSchema = toErrorSchema(`http_${response.status}`, latestSuccessForPayload);
      setCached(cache.error, key, errorSchema, ERROR_TTL_MS);
      fileCache.error[key] = {
        expiresAt: Date.now() + ERROR_TTL_MS,
        response: errorSchema,
      };
      await writeFileCache(fileCache);
      return errorSchema;
    }

    const data: unknown = await response.json();
    if (!isSidebarApiResponse(data) || !isSuccessResponse(data)) {
      const errorSchema = toErrorSchema("invalid_schema", latestSuccessForPayload);
      setCached(cache.error, key, errorSchema, ERROR_TTL_MS);
      fileCache.error[key] = {
        expiresAt: Date.now() + ERROR_TTL_MS,
        response: errorSchema,
      };
      await writeFileCache(fileCache);
      return errorSchema;
    }

    setCached(cache.success, key, data, SUCCESS_TTL_MS);
    cache.error.delete(key);
    fileCache.success[key] = {
      expiresAt: Date.now() + SUCCESS_TTL_MS,
      response: data,
    };
    delete fileCache.error[key];
    await writeFileCache(fileCache);
    return data;
  } catch {
    const errorSchema = toErrorSchema("fetch_failed", latestSuccessForPayload);
    setCached(cache.error, key, errorSchema, ERROR_TTL_MS);
    fileCache.error[key] = {
      expiresAt: Date.now() + ERROR_TTL_MS,
      response: errorSchema,
    };
    await writeFileCache(fileCache);
    return errorSchema;
  }
};
