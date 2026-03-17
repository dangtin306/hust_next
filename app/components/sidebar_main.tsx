"use client";

import { useEffect, useMemo, useState } from "react";
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
};

const NextSidebar = ({ isOpen, setIsOpen }: NextSidebarProps) => {
  const [displayHostname, setDisplayHostname] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([
    { label: "Loading data ...", url_redirect: "/reactapp?app=showadview", iconType: "SlHome" },
  ]);

  const payload = useMemo(() => {
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const apikey = readCookie("apikey");
    const national_market = readCookie("national_market") || "vi";
    const main_domain =
      host && host !== "localhost"
        ? readCookie("main_domain") || getMainDomainFromHost(host) || "hust"
        : readCookie("main_domain") || "hust";

    return { apikey, main_domain, national_market };
  }, []);

  const lang = payload.national_market || "vi";

  useEffect(() => {
    const hostname = window.location.hostname;
    setDisplayHostname(hostname.includes("tecom.pro") ? "hust.media" : hostname);
  }, []);

  useEffect(() => {
    const cachedLatestVersion = readCookie("latest_version");
    if (cachedLatestVersion) {
      writeCookie("latest_version", cachedLatestVersion, ONE_DAY_SECONDS);
    }
  }, []);

  useEffect(() => {
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocalhost = host === "localhost";

    const cached = readCachedMenu(payload);
    if (cached && !isLocalhost) {
      setMenu(cached);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      try {
        const response = await fetch("https://node_js.hust.media/community/sidebar_menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`sidebar_menu http ${response.status}`);

        const data = (await response.json()) as {
          api_results?: { sidebar_menu?: MenuItem[]; latest_version?: unknown };
        };

        const sidebarMenu = data.api_results?.sidebar_menu;
        const latestVersion = data.api_results?.latest_version;

        if (Array.isArray(sidebarMenu) && sidebarMenu.length > 0) {
          setMenu(sidebarMenu);
          storeCachedMenu(payload, sidebarMenu);
        }

        if (typeof latestVersion === "string" || typeof latestVersion === "number") {
          writeCookie("latest_version", String(latestVersion), ONE_DAY_SECONDS);
        }
      } catch {
        // Keep existing menu state (cache/placeholder) if fetch fails.
      }
    };

    run();
    return () => controller.abort();
  }, [payload]);

  return (
    <>
      <nav
        style={{ zIndex: isOpen ? 1050 : "auto" }}
        className={`
          antialiased text-slate-900
          flex flex-col h-full overflow-y-auto
          bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-200
          px-4 py-4 fixed top-0 left-0
          w-[75vw] min-w-[240px] max-w-[320px] md:w-[280px] md:min-w-[280px] md:max-w-[280px]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="flex justify-between items-center mb-4">
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
          <SidebarLogic items={menu} lang={lang} setIsOpen={setIsOpen} />
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
