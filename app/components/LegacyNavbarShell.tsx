"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { FaArrowCircleLeft } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LegacyNavbarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  apikeyExists: boolean;
  switch_router: (path: string) => void;
  type_user: string;
  idExist: null;
  set_open_button_support: () => void;
};

type MenuItem = {
  label?: string | Record<string, string>;
  url_redirect?: string;
  url_mode?: string;
  icon_src?: string;
  data?: MenuItem[];
};

const getLabelText = (item: MenuItem) => {
  if (typeof item.label === "string") return item.label;
  if (item.label && typeof item.label === "object") {
    const lang =
      typeof document !== "undefined"
        ? document.documentElement.lang || "vi"
        : "vi";
    return (
      item.label[lang] ||
      item.label.vi ||
      item.label.en ||
      Object.values(item.label)[0] ||
      ""
    );
  }
  return "";
};

const CachedNavbar = ({
  isOpen,
  setIsOpen,
  onWarmup,
}: Pick<LegacyNavbarProps, "isOpen" | "setIsOpen"> & {
  onWarmup?: () => void;
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { label: "Loading menu..." },
  ]);
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [displayHostname, setDisplayHostname] = useState("");

  useLayoutEffect(() => {
    const hostname = window.location.hostname;
    setDisplayHostname(hostname === "tecom.pro" ? "hust.media" : hostname);
    try {
      const raw = localStorage.getItem("sidebar_menu_test");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.menu) && parsed.menu.length > 0) {
        setMenuItems(parsed.menu);
      }
    } catch (error) {
      console.warn("cached menu parse error:", error);
    }
  }, []);

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderItems = (items: MenuItem[], parentKey = "") =>
    items.map((item, index) => {
      const key = parentKey ? `${parentKey}-${index}` : `${index}`;
      const hasChildren = Array.isArray(item.data) && item.data.length > 0;
      const isOpenItem = openKeys.has(key);
      const isSelected = selectedKey === key;
      const href = item.url_redirect || "#";
      const isExternal =
        item.url_mode === "redirect" || /^https?:\/\//.test(href);
      const isNextRoute =
        !isExternal &&
        (href === "/" || href.startsWith("/docs") || href.startsWith("/support"));
      const linkClassName =
        "w-full flex items-center justify-between py-1.5 px-3 text-slate-900 no-underline " +
        `${isOpenItem || isSelected ? "bg-pink-100" : "bg-gray-100"} ` +
        "bg-opacity-50 hover:bg-opacity-75 " +
        `${isOpenItem || isSelected ? "border-l-2 border-pink-400 " : ""}`;

      const content = (
        <div className="flex items-center">
          {item.icon_src && (
            item.icon_src.includes("/") ? (
              <img
                src={item.icon_src}
                alt=""
                className="h-5 w-5 mr-2"
              />
            ) : (
              <span className="h-5 w-5 mr-2 flex items-center justify-center">
                {item.icon_src}
              </span>
            )
          )}
          <div
            className={`flex-1 text-[15px] whitespace-normal break-words text-left ${
              isSelected ? "font-[600]" : ""
            }`}
          >
            {getLabelText(item)}
          </div>
        </div>
      );

      return (
        <div key={key} className="border-t border-gray-300 last:border-b">
          {hasChildren ? (
            <button
              className={linkClassName}
              onClick={() => {
                onWarmup?.();
                setSelectedKey(key);
                toggle(key);
              }}
            >
              {content}
            </button>
          ) : isExternal ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
              onClick={() => {
                onWarmup?.();
                setSelectedKey(key);
                setIsOpen(false);
              }}
            >
              {content}
            </a>
          ) : isNextRoute ? (
            <Link
              href={href}
              className={linkClassName}
              onClick={() => {
                onWarmup?.();
                setSelectedKey(key);
                setIsOpen(false);
              }}
            >
              {content}
            </Link>
          ) : (
            <a
              href={href}
              className={linkClassName}
              onClick={() => {
                onWarmup?.();
                setSelectedKey(key);
                setIsOpen(false);
              }}
            >
              {content}
            </a>
          )}

          {hasChildren && isOpenItem && (
            <div className="pl-2">{renderItems(item.data || [], key)}</div>
          )}
        </div>
      );
    });

  return (
    <>
      <nav
        style={{ zIndex: isOpen ? 1050 : "auto" }}
        className={`
          antialiased
          text-slate-900
          flex flex-col
          h-full
          overflow-y-auto
          bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-200
          px-4 py-4 fixed top-0 left-0
          w-80 md:w-[280px]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-purple-400 text-[20px] font-bold">
              {displayHostname}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white"
            >
              <FaArrowCircleLeft size={24} />
            </button>
          </div>

          <div className="flex flex-col border-t-2 border-b-2 border-pink-400">
            <div className="flex flex-col">{renderItems(menuItems)}</div>
          </div>
        </>
      </nav>
      {isOpen && (
        <div
          className="fixed inset-0 bg-indigo-600 bg-opacity-20 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const menuCacheMaxAgeMs = 24 * 60 * 60 * 1000;

const LegacyNavbarShell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldLoadLegacy, setShouldLoadLegacy] = useState(false);
  const [hasFreshCache, setHasFreshCache] = useState<boolean | null>(null);
  const [NavbarComponent, setNavbarComponent] =
    useState<React.ComponentType<LegacyNavbarProps> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("sidebar_menu_test");
      if (!raw) {
        setHasFreshCache(false);
        return;
      }
      const parsed = JSON.parse(raw);
      const age = Date.now() - (parsed.timestamp || 0);
      const isFresh =
        age < menuCacheMaxAgeMs &&
        Array.isArray(parsed.menu) &&
        parsed.menu.length > 0;
      setHasFreshCache(isFresh);
    } catch {
      setHasFreshCache(false);
    }
  }, []);

  useEffect(() => {
    if (shouldLoadLegacy || hasFreshCache) return;
    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const requestIdle = (window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }).requestIdleCallback;

    if (requestIdle) {
      idleId = requestIdle(() => setShouldLoadLegacy(true), { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(() => setShouldLoadLegacy(true), 1000);
    }

    return () => {
      const cancelIdle = (window as unknown as {
        cancelIdleCallback?: (id: number) => void;
      }).cancelIdleCallback;
      if (idleId !== null && cancelIdle) cancelIdle(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [shouldLoadLegacy]);

  useEffect(() => {
    if (!shouldLoadLegacy) return;
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
  }, [shouldLoadLegacy]);

  const switchRouter = (path: string) => {
    if (!path) return;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      window.location.href = path;
      return;
    }
    if (path.startsWith("/docs") || path.startsWith("/support") || path === "/") {
      router.push(path);
      return;
    }
    window.location.href = path;
  };
  const warmupLegacy = () => {
    if (!shouldLoadLegacy) {
      setShouldLoadLegacy(true);
    }
  };

  const showLegacyNavbar = NavbarComponent && hasFreshCache === false;

  return (
    <div
      className="legacy-navbar-theme"
      onMouseEnter={warmupLegacy}
      onTouchStart={warmupLegacy}
    >
      {showLegacyNavbar ? (
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
        <CachedNavbar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onWarmup={warmupLegacy}
        />
      )}
    </div>
  );
};

export default LegacyNavbarShell;
