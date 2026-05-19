"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { FaArrowCircleLeft } from "react-icons/fa";
import SidebarLogic, { type MenuItem } from "./sidebar_logic";

type SidebarMenuCache = {
  timestamp: number;
  menu: MenuItem[];
  payload: {
    apikey: string;
    main_domain: string;
    national_market: string;
  };
};

const TIME_UPDATE_MS = 6 * 60 * 60 * 1000;
const SIDEBAR_MENU_CACHE_KEY = "sidebar_menu_test";
const ONE_DAY_SECONDS = 60 * 60 * 24;

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const writeCookie = (name: string, value: string, maxAgeSeconds = ONE_DAY_SECONDS) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/`;
  if (name === "latest_version" && typeof window !== "undefined") {
    window.dispatchEvent(new Event("latest-version-updated"));
  }
};

const getMainDomainFromHost = (host: string) => {
  const parts = host.split(".").filter(Boolean);
  return parts.length > 2 ? parts[parts.length - 2] : parts[0] || "hust";
};

const isSamePayload = (
  payload: SidebarMenuCache["payload"],
  current: SidebarMenuCache["payload"]
) => {
  return (
    payload.apikey === current.apikey &&
    payload.main_domain === current.main_domain &&
    payload.national_market === current.national_market
  );
};

const withEnglishFallback = (
  labelValue: MenuItem["label"],
  targetLang: string
): MenuItem["label"] => {
  if (!labelValue || typeof labelValue === "string") return labelValue;

  const englishLabel = typeof labelValue.en === "string" ? labelValue.en.trim() : "";
  if (!englishLabel) return labelValue;

  const targetLabel =
    typeof labelValue[targetLang] === "string" ? labelValue[targetLang].trim() : "";
  if (targetLabel) return labelValue;

  return {
    ...labelValue,
    [targetLang]: englishLabel,
  };
};

const normalizeMenuLanguage = (menu: MenuItem[], targetLang: string): MenuItem[] => {
  if (!Array.isArray(menu)) return [];

  return menu.map((item) => {
    const nextItem: MenuItem = {
      ...item,
      label: withEnglishFallback(item.label, targetLang),
    };

    if (Array.isArray(item.data)) {
      nextItem.data = normalizeMenuLanguage(item.data, targetLang);
    }

    return nextItem;
  });
};

const resolveMenuLanguage = (nationalMarket: string) => {
  return nationalMarket === "vi" || nationalMarket === "en" ? nationalMarket : "en";
};

const readCachedMenu = (payload: SidebarMenuCache["payload"]): MenuItem[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_MENU_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SidebarMenuCache>;
    if (typeof parsed.timestamp !== "number") return null;
    if (!Array.isArray(parsed.menu) || parsed.menu.length === 0) return null;
    if (!parsed.payload) return null;
    if (!isSamePayload(parsed.payload as SidebarMenuCache["payload"], payload)) return null;
    const age = Date.now() - parsed.timestamp;
    if (age >= TIME_UPDATE_MS) return null;
    return parsed.menu as MenuItem[];
  } catch {
    return null;
  }
};

const storeCachedMenu = (payload: SidebarMenuCache["payload"], menu: MenuItem[]) => {
  if (typeof window === "undefined") return;
  const store: SidebarMenuCache = {
    timestamp: Date.now(),
    menu,
    payload,
  };
  window.localStorage.setItem(SIDEBAR_MENU_CACHE_KEY, JSON.stringify(store));
};

type NextSidebarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  initialMenu?: MenuItem[];
  initialLatestVersion?: string | number;
  initialMarket?: string;
  initialDisplayHostname?: string;
  initialApiStatus?: string;
};

const NextSidebar = ({
  isOpen,
  setIsOpen,
  initialMenu = [],
  initialLatestVersion,
  initialMarket = "vi",
  initialDisplayHostname = "",
  initialApiStatus = "success",
}: NextSidebarProps) => {
  const buildErrorMenu = (message: string): MenuItem[] => [
    {
      label: message,
      url_redirect: "/next/support",
      icon_src: "⚠️",
    },
  ];
  const isInitialSuccess = initialApiStatus === "success";
  const [displayHostname] = useState(initialDisplayHostname);
  const [menu, setMenu] = useState<MenuItem[]>(() =>
    Array.isArray(initialMenu) && initialMenu.length > 0
      ? initialMenu
      : isInitialSuccess
        ? [{ label: "Home", url_redirect: "/reactapp/", iconType: "SlHome" }]
        : buildErrorMenu("API sidebar error, please ib admin")
  );
  const [apiStatus, setApiStatus] = useState<string>(initialApiStatus);

  const nationalMarket = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => { };
      const handler = () => onStoreChange();
      window.addEventListener("focus", handler);
      window.addEventListener("visibilitychange", handler);
      return () => {
        window.removeEventListener("focus", handler);
        window.removeEventListener("visibilitychange", handler);
      };
    },
    () => readCookie("national_market") || initialMarket,
    () => initialMarket
  );
  const lang = resolveMenuLanguage(nationalMarket || initialMarket);

  const payload = useMemo(() => {
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const apikey = readCookie("apikey");
    const national_market = nationalMarket || readCookie("national_market") || "vi";
    const main_domain =
      host && host !== "localhost"
        ? readCookie("main_domain") || getMainDomainFromHost(host) || "hust"
        : readCookie("main_domain") || "hust";

    return { apikey, main_domain, national_market };
  }, [nationalMarket]);

  useEffect(() => {
    if (Array.isArray(initialMenu) && initialMenu.length > 0) {
      setMenu(normalizeMenuLanguage(initialMenu, lang));
      setApiStatus("success");
      return;
    }
    if (initialApiStatus !== "success") {
      setMenu(buildErrorMenu("API sidebar error, please ib admin"));
      setApiStatus(initialApiStatus);
    }
  }, [initialMenu, lang, initialApiStatus]);

  useEffect(() => {
    if (typeof initialLatestVersion === "string" || typeof initialLatestVersion === "number") {
      const currentLatestVersion = readCookie("latest_version");
      if (!currentLatestVersion) {
        writeCookie("latest_version", String(initialLatestVersion), ONE_DAY_SECONDS);
      }
      return;
    }
    const cachedLatestVersion = readCookie("latest_version");
    if (cachedLatestVersion) {
      writeCookie("latest_version", cachedLatestVersion, ONE_DAY_SECONDS);
    }
  }, [initialLatestVersion]);

  useEffect(() => {
    // Keep cache hot for quick client transitions.
    if (Array.isArray(initialMenu) && initialMenu.length > 0) {
      storeCachedMenu(payload, normalizeMenuLanguage(initialMenu, lang));
    }
    const cached = readCachedMenu(payload);
    if (cached && cached.length > 0) {
      setMenu(normalizeMenuLanguage(cached, lang));
      setApiStatus("success");
    }
  }, [initialMenu, payload, lang]);

  useEffect(() => {
    if (apiStatus === "success") return;
    let stopped = false;

    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === "object" && value !== null;
    const isSidebarApiResponse = (
      value: unknown
    ): value is { api_status: string; api_results: { latest_version: string | number; sidebar_menu: MenuItem[] } } => {
      if (!isRecord(value)) return false;
      if (typeof value.api_status !== "string") return false;
      if (!isRecord(value.api_results)) return false;
      const version = value.api_results.latest_version;
      if (typeof version !== "string" && typeof version !== "number") return false;
      if (!Array.isArray(value.api_results.sidebar_menu)) return false;
      return true;
    };

    const retry = async () => {
      try {
        const response = await fetch("/api/sidebar-menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`http_${response.status}`);
        const data: unknown = await response.json();
        if (!isSidebarApiResponse(data) || data.api_status !== "success") {
          throw new Error("invalid_schema");
        }
        if (stopped) return;
        const normalizedMenu = normalizeMenuLanguage(data.api_results.sidebar_menu, lang);
        setMenu(normalizedMenu.length > 0 ? normalizedMenu : buildErrorMenu("API sidebar error, please ib admin"));
        if (typeof data.api_results.latest_version === "string" || typeof data.api_results.latest_version === "number") {
          writeCookie("latest_version", String(data.api_results.latest_version), ONE_DAY_SECONDS);
        }
        storeCachedMenu(payload, normalizedMenu);
        setApiStatus("success");
      } catch {
        if (stopped) return;
        setMenu(buildErrorMenu("API sidebar error, please ib admin"));
      }
    };

    retry();
    const timer = window.setInterval(retry, 5000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [apiStatus, payload, lang]);

  return (
    <>
      <nav
        style={{ zIndex: isOpen ? 1050 : "auto" }}
        className={`
          antialiased text-slate-900
          flex flex-col h-full overflow-y-auto
          bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-200
          px-6 py-6 fixed top-0 left-0
          w-[75vw] min-w-[240px] max-w-[320px] md:w-[280px] md:min-w-[280px] md:max-w-[280px]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="text-purple-400 text-[20px] font-bold">{displayHostname}</div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
            aria-label="Close menu"
          >
            <FaArrowCircleLeft size={24} />
          </button>
        </div>

        <div className="flex flex-col border-t-2 border-b-2 border-pink-400">
          <SidebarLogic
            items={menu}
            lang={lang}
            setIsOpen={setIsOpen}
            latestVersion={initialLatestVersion}
          />
        </div>
      </nav>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/5 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
};

export default NextSidebar;
