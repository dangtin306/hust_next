"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { animated, useSpring } from "@react-spring/web";
import axios from "axios";

const CACHE_KEY = "support_chat";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const readCookie = (name) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const getMainDomainFromHost = () => {
  if (typeof window === "undefined") return "hust";
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  return parts.length > 2 ? parts[parts.length - 2] : parts[0] || "hust";
};

const isCacheValid = (store, payload, nationalMarket, currentDomain) => {
  return (
    store &&
    Date.now() - Number(store.timestamp || 0) < CACHE_TTL_MS &&
    JSON.stringify(store.payload) === JSON.stringify(payload) &&
    currentDomain !== "localhost" &&
    String(nationalMarket || "") === String(store.national_market || "")
  );
};

const getInitialSupportLinks = () => {
  if (typeof window === "undefined") return "";

  const mainDomain =
    window.location.hostname !== "localhost"
      ? readCookie("main_domain") || getMainDomainFromHost() || "hust"
      : readCookie("main_domain") || "hust";
  const nationalMarket = readCookie("national_market") || "en";
  const currentDomain = window.location.hostname;
  const payload = {
    query: `app_structure.app_fontend.support_chat.${mainDomain}`,
  };

  const raw = localStorage.getItem(CACHE_KEY);
  const store = raw ? JSON.parse(raw) : null;

  if (isCacheValid(store, payload, nationalMarket, currentDomain) && Array.isArray(store.data)) {
    return store.data;
  }

  return "";
};

const SupportButton = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [hienDanhSach, setHienDanhSach] = useState(false);
  const [linksSupport, setLinksSupport] = useState(() => getInitialSupportLinks());

  const lang = useSyncExternalStore(
    () => () => {},
    () => (readCookie("national_market") === "en" ? "en" : "vi"),
    () => "en",
  );

  const isShowButton = useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof window === "undefined") return true;
      const hostname = window.location.hostname || "";
      const latestVersion = Number(readCookie("latest_version") || "0");
      const isHustMediaDomain = hostname.includes("hust.media");
      return !((latestVersion === 2 || latestVersion === 3) && isHustMediaDomain);
    },
    () => true,
  );

  const hieuUngNut = useSpring({
    rotate: hienDanhSach ? 50 : 0,
    config: { tension: 180, friction: 16 },
  });

  const hieuUngDanhSach = useSpring({
    opacity: hienDanhSach ? 1 : 0,
    maxHeight: hienDanhSach ? 500 : 0,
    scale: hienDanhSach ? 1 : 0,
    config: { tension: 180, friction: 16 },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const mainDomain =
      window.location.hostname !== "localhost"
        ? readCookie("main_domain") || getMainDomainFromHost() || "hust"
        : readCookie("main_domain") || "hust";

    const currentDomain = window.location.hostname;
    const nationalMarket = readCookie("national_market") || "en";
    const payload = {
      query: `app_structure.app_fontend.support_chat.${mainDomain}`,
    };

    const raw = localStorage.getItem(CACHE_KEY);
    const store = raw ? JSON.parse(raw) : null;

    if (isCacheValid(store, payload, nationalMarket, currentDomain)) {
      return;
    }

    localStorage.removeItem(CACHE_KEY);

    const timer = window.setTimeout(() => {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://node_js.hust.media/main_1/mongo_1/api/mongo_get_query_api",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(payload),
      };

      axios
        .request(config)
        .then((response) => {
          const results = response?.data?.api_results?.mongo_results;
          if (!Array.isArray(results)) return;

          setLinksSupport(results);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              data: results,
              payload,
              national_market: nationalMarket,
            }),
          );
        })
        .catch(() => {});
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  const chuyenDoiDanhSach = () => {
    setHienDanhSach((prev) => !prev);
  };

  const handleClick = (event, link) => {
    if (link?.mode === "switch_router" && link?.router) {
      event.preventDefault();
      window.location.assign(link.router);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {linksSupport && isShowButton && (
        <>
          <div className="fixed right-5 bottom-9 z-10">
            <animated.button
              type="button"
              style={{
                transform: hieuUngNut.rotate.to((r) => `rotate(${r}deg)`),
              }}
              className="bg-pink-500 text-white rounded-full focus:outline-none"
              onClick={chuyenDoiDanhSach}
            >
              <div className="text-center text-2xl mx-[0.75rem] py-2.5">💬</div>
            </animated.button>

            <animated.div
              style={{
                ...hieuUngDanhSach,
                transform: hieuUngDanhSach.scale.to((s) => `scale(${s})`),
              }}
              className="overflow-hidden absolute right-0 bottom-10 space-y-2"
            >
              {Array.isArray(linksSupport) && linksSupport.length > 0 && (
                <>
                  <div>
                    {linksSupport.map((link, index) => {
                      if (link?.status !== "show") return null;
                      const text =
                        typeof link?.text === "object"
                          ? link.text?.[lang] || link.text?.vi || link.text?.en
                          : link?.text;

                      return (
                        <a
                          key={index}
                          href={link?.href || "#"}
                          target={link?.target || ""}
                          onClick={(event) => handleClick(event, link)}
                          style={{ textDecoration: "none" }}
                          rel={link?.target === "_blank" ? "noreferrer" : undefined}
                        >
                          <div className="inline-block mb-2 bg-white border border-gray-300 p-2 rounded">
                            <button
                              type="button"
                              className="inline-block p-1 whitespace-nowrap text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {text}
                            </button>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </>
              )}
            </animated.div>
          </div>
        </>
      )}
    </>
  );
};

export default SupportButton;
