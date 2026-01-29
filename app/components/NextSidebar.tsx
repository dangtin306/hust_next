"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowCircleLeft, FaDiscord, FaFacebook, FaTelegramPlane, FaTiktok, FaYoutube } from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { SlHome } from "react-icons/sl";
import { FaClock } from "react-icons/fa";

type MenuLabel = string | Record<string, string>;

type MenuItem = {
  label?: MenuLabel;
  url_redirect?: string;
  url_mode?: string;
  iconType?: string;
  icon_src?: string;
  data?: MenuItem[];
};

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
};

const getMainDomainFromHost = (host: string) => {
  const parts = host.split(".").filter(Boolean);
  return parts.length > 2 ? parts[parts.length - 2] : parts[0] || "hust";
};

const pickLabel = (label: MenuLabel | undefined, lang: string) => {
  if (!label) return "";
  if (typeof label === "string") return label;
  return label[lang] || label.vi || label.en || "";
};

const normalizeNextHref = (href: string) => {
  return href.startsWith("/next/") ? href.slice("/next".length) : href;
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

// const socialLinks = [
//   {
//     href: "https://www.youtube.com/@hust_media",
//     Icon: FaYoutube,
//     ariaLabel: "YouTube",
//     colorClass: "text-red-600",
//   },
//   {
//     href: "https://www.tiktok.com/@rangthotv",
//     Icon: FaTiktok,
//     ariaLabel: "TikTok",
//     colorClass: "text-black",
//   },
//   {
//     href: "https://t.me/freefltiktok",
//     Icon: FaTelegramPlane,
//     ariaLabel: "Telegram",
//     colorClass: "text-blue-400",
//   },
//   {
//     href: "https://discord.gg/FQzpwfhqQv",
//     Icon: FaDiscord,
//     ariaLabel: "Discord",
//     colorClass: "text-indigo-600",
//   },
//   {
//     href: "https://www.facebook.com/hustmedia",
//     Icon: FaFacebook,
//     ariaLabel: "Facebook",
//     colorClass: "text-blue-700",
//   },
// ] as const;

type NextSidebarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

const NextSidebar = ({ isOpen, setIsOpen }: NextSidebarProps) => {
  const router = useRouter();
  const [displayHostname, setDisplayHostname] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([
    { label: "Loading data ...", url_redirect: "/reactapp?app=showadview", iconType: "SlHome" },
  ]);
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

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

  const toggleKey = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const renderItems = (items: MenuItem[], parentKey = "") => {
    return items.map((item, idx) => {
      const key = parentKey === "" ? `${idx}` : `${parentKey}-${idx}`;
      const hasChildren = Array.isArray(item.data) && item.data.length > 0;
      const isOpenKey = openKeys.has(key);
      const isSelected = selectedKey === key;

      const rowClassName =
        `w-full flex items-center justify-between py-1.5 px-3 text-slate-900 visited:text-slate-900 no-underline ` +
        `${isOpenKey || isSelected ? "bg-pink-100 border-l-2 border-pink-400 " : "bg-gray-100 "} ` +
        `bg-opacity-50 hover:bg-opacity-75 ` +
        `${isSelected ? "font-[600]" : ""}`;

      const labelText = pickLabel(item.label, lang);

      const iconNode =
        item.iconType === "SlHome" ? (
          <SlHome className="h-5 w-5 mr-2" />
        ) : item.iconType === "FaClock" ? (
          <FaClock className="h-5 w-5 mr-2" />
        ) : item.icon_src ? (
          item.icon_src.includes("/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.icon_src} alt="" className="h-5 w-5 mr-2" />
          ) : (
            <span className="h-5 w-5 mr-2 flex items-center justify-center">
              {item.icon_src}
            </span>
          )
        ) : null;

      return (
        <div key={key} className="border-t border-gray-300 last:border-b">
          {hasChildren ? (
            <button
              type="button"
              className={rowClassName}
              onClick={() => {
                setSelectedKey(key);
                toggleKey(key);
              }}
            >
              <div className="flex items-center">
                {iconNode}
                <div className="flex-1 text-[15px] whitespace-normal break-words text-left">
                  {labelText}
                </div>
              </div>
              {isOpenKey ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
            </button>
          ) : typeof item.url_redirect === "string" &&
            item.url_redirect.startsWith("/next/") &&
            item.url_mode !== "redirect" ? (
            <Link
              href={normalizeNextHref(item.url_redirect)}
              className={rowClassName}
              onClick={() => {
                setSelectedKey(key);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center">
                {iconNode}
                <div className="flex-1 text-[15px] whitespace-normal break-words text-left">
                  {labelText || item.url_redirect}
                </div>
              </div>
            </Link>
          ) : typeof item.url_redirect === "string" && item.url_mode === "redirect" ? (
            <a
              href={item.url_redirect}
              target="_blank"
              rel="noopener noreferrer"
              className={rowClassName}
              onClick={() => {
                setSelectedKey(key);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center">
                {iconNode}
                <div className="flex-1 text-[15px] whitespace-normal break-words text-left">
                  {labelText || item.url_redirect}
                </div>
              </div>
            </a>
          ) : (
            <button
              type="button"
              className={rowClassName}
              onClick={() => {
                setSelectedKey(key);
                setIsOpen(false);

                const href =
                  typeof item.url_redirect === "string" ? item.url_redirect : "";
                if (!href) return;

                window.location.href = href;
              }}
            >
              <div className="flex items-center">
                {iconNode}
                <div className="flex-1 text-[15px] whitespace-normal break-words text-left">
                  {labelText || (typeof item.url_redirect === "string" ? item.url_redirect : "")}
                </div>
              </div>
            </button>
          )}

          {hasChildren && isOpenKey ? <div className="pl-2">{renderItems(item.data!, key)}</div> : null}
        </div>
      );
    });
  };

  return (
    <>
      <nav
        style={{ zIndex: isOpen ? 1050 : "auto" }}
        className={`
          antialiased text-slate-900
          flex flex-col h-full overflow-y-auto
          bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-200
          px-4 py-4 fixed top-0 left-0
          w-80 md:w-[280px]
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
          {renderItems(menu)}
        </div>

        {/* <div className="mt-auto pt-2 mb-0 flex justify-around">
          {socialLinks.map(({ href, Icon, ariaLabel, colorClass }) => (
            <a
              key={ariaLabel}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              className={`hover:opacity-75 transition-opacity ${colorClass}`}
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div> */}
      </nav>

      {isOpen ? (
        <div
          className="fixed inset-0 bg-indigo-600 bg-opacity-20 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
};

export default NextSidebar;
