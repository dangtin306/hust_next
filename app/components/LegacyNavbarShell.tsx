"use client";

import { useEffect, useState } from "react";

type LegacyNavbarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  apikeyExists: boolean;
  switch_router: (path: string) => void;
  type_user: string;
  idExist: null;
  set_open_button_support: () => void;
};

type LegacyMenuItem = {
  label?: string | Record<string, string>;
  url_redirect?: string;
  url_mode?: string;
  data?: LegacyMenuItem[];
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SIDEBAR_MENU_CACHE_KEY = "sidebar_menu_test";

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const pickLabel = (label: LegacyMenuItem["label"]) => {
  if (typeof label === "string") return label;
  if (label && typeof label === "object") return label.vi || label.en || "";
  return "";
};

const readCachedSidebarMenu = (): LegacyMenuItem[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_MENU_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      timestamp?: unknown;
      menu?: unknown;
      payload?: unknown;
    };

    if (typeof parsed.timestamp !== "number") return null;
    if (Date.now() - parsed.timestamp > ONE_DAY_MS) return null;
    if (!Array.isArray(parsed.menu) || parsed.menu.length === 0) return null;

    const payload = parsed.payload as
      | { apikey?: unknown; main_domain?: unknown; national_market?: unknown }
      | undefined;
    if (payload && typeof payload === "object") {
      const apikey = readCookie("apikey");
      const mainDomain = readCookie("main_domain");
      const nationalMarket = readCookie("national_market");

      if (
        typeof payload.apikey === "string" &&
        apikey &&
        payload.apikey !== apikey
      )
        return null;
      if (
        typeof payload.main_domain === "string" &&
        mainDomain &&
        payload.main_domain !== mainDomain
      )
        return null;
      if (
        typeof payload.national_market === "string" &&
        nationalMarket &&
        payload.national_market !== nationalMarket
      )
        return null;
    }

    return parsed.menu as LegacyMenuItem[];
  } catch {
    return null;
  }
};

const LegacyNavbarShell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [NavbarComponent, setNavbarComponent] =
    useState<React.ComponentType<LegacyNavbarProps> | null>(null);
  const [cachedMenu, setCachedMenu] = useState<LegacyMenuItem[] | null>(null);
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setCachedMenu(readCachedSidebarMenu());
  }, []);

  useEffect(() => {
    let isMounted = true;
    import("../../../react_app/src/shared/next_navbar.jsx")
      .then((mod) => {
        if (isMounted) {
          setNavbarComponent(() => mod.default);
        }
      })
      .catch((error) => {
        console.error("legacy navbar load error:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener("legacy-menu-toggle", handleToggle);
    return () => {
      window.removeEventListener("legacy-menu-toggle", handleToggle);
    };
  }, []);

  const switchRouter = (path: string) => {
    if (!path) return;
    window.location.href = path;
  };

  const toggleKey = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const renderCachedMenu = (items: LegacyMenuItem[], parentKey = "") => {
    return items.map((item, idx) => {
      const key = parentKey === "" ? `${idx}` : `${parentKey}-${idx}`;
      const hasChildren = Array.isArray(item.data) && item.data.length > 0;
      const isOpenKey = openKeys.has(key);
      const label = pickLabel(item.label);
      const href = typeof item.url_redirect === "string" ? item.url_redirect : "";
      const isExternal = item.url_mode === "redirect";

      const rowClassName =
        `w-full flex items-center justify-between py-1.5 px-3 text-slate-900 visited:text-slate-900 no-underline ` +
        `${isOpenKey ? "bg-pink-100 border-l-2 border-pink-400 " : "bg-gray-100 "} ` +
        `bg-opacity-50 hover:bg-opacity-75`;

      return (
        <div key={key} className="border-t border-gray-300 last:border-b">
          {hasChildren ? (
            <button
              type="button"
              className={rowClassName}
              onClick={() => toggleKey(key)}
            >
              <span className="flex-1 text-[15px] whitespace-normal break-words text-left">
                {label}
              </span>
              <span className="ml-2 text-xs">{isOpenKey ? "▲" : "▼"}</span>
            </button>
          ) : href ? (
            <a
              href={href}
              className={rowClassName}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex-1 text-[15px] whitespace-normal break-words text-left">
                {label || href}
              </span>
            </a>
          ) : (
            <div className={`${rowClassName} opacity-70`}>
              <span className="flex-1 text-[15px] whitespace-normal break-words text-left">
                {label}
              </span>
            </div>
          )}

          {hasChildren && isOpenKey ? (
            <div className="pl-2">{renderCachedMenu(item.data!, key)}</div>
          ) : null}
        </div>
      );
    });
  };

  return (
    <div className="legacy-navbar-theme">
      {NavbarComponent ? (
        <NavbarComponent
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          apikeyExists={false}
          switch_router={switchRouter}
          type_user=""
          idExist={null}
          set_open_button_support={() => {}}
        />
      ) : (
        <nav
          aria-hidden="true"
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
            <div className="h-6 w-32 rounded bg-white/60" />
            <div className="h-6 w-6 rounded-full bg-white/60 md:hidden" />
          </div>
          <div className="flex flex-col border-t-2 border-b-2 border-pink-400 py-0">
            {cachedMenu ? (
              renderCachedMenu(cachedMenu)
            ) : (
              <div className="flex flex-col gap-2 py-3">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-8 rounded bg-white/50 shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="mt-auto pt-2 mb-0 flex justify-around">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-5 w-5 rounded bg-white/60" />
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default LegacyNavbarShell;
