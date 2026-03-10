"use client";

import { FaSync } from "react-icons/fa";
import { SlHome } from "react-icons/sl";

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const removeCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=/`;
};

const translations = {
  vi: {
    home: "Trang chủ",
    region: "Khu vực",
  },
  en: {
    home: "Home",
    region: "Region",
  },
} as const;

const countryFlags: Record<string, { emoji: string; label: string }> = {
  en: { emoji: "🇺🇸", label: "United States" },
  vi: { emoji: "🇻🇳", label: "Vietnam" },
};

const NavDown = () => {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const displayHostname = hostname.includes("tecom.pro") ? "hust.media" : hostname;
  const lang = readCookie("national_market") === "en" ? "en" : "vi";
  const currentFlag = countryFlags[readCookie("national_market") || "vi"];

  const changeNational = async () => {
    removeCookie("national_market");

    try {
      const apikey = readCookie("apikey");
      if (!apikey) {
        setTimeout(() => {
          window.location.href = "/next/convert_national_market";
        }, 1000);
        return;
      }

      const url = `https://hust.media/api/profile/national_market.php?apikey=${apikey}&service_national=change&national_market=delete`;
      const response = await fetch(url);
      const data = (await response.json()) as { status?: string | number; message?: string };

      if (String(data?.status) === "1") {
        setTimeout(() => {
          window.location.href = "/next/convert_national_market";
        }, 150);
      } else if (data?.message) {
        window.alert(data.message);
      }
    } catch {
      window.alert("Error changing national market");
    }
  };

  return (
    <details className="relative inline-block [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:hidden">
      <summary className="cursor-pointer list-none rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-3.5 py-1 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/70 hover:shadow hover:ring-slate-300">
        {displayHostname}
      </summary>

      <div className="absolute right-2 mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
        <a
          href="/reactapp/"
          className="flex items-center gap-2 px-4 py-2 text-sm text-black no-underline hover:bg-gray-100"
        >
          <span className="leading-none">{translations[lang].home}</span>
          <SlHome className="text-sm leading-none" />
        </a>
        <button
          type="button"
          onClick={changeNational}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-black no-underline hover:bg-gray-100"
        >
          <span className="leading-none">{translations[lang].region}</span>
          {currentFlag ? (
            <span
              role="img"
              aria-label={currentFlag.label}
              className="inline-flex items-center justify-center text-lg leading-none"
            >
              {currentFlag.emoji}
            </span>
          ) : null}
          <FaSync className="text-sm leading-none" />
        </button>
      </div>
    </details>
  );
};

export default NavDown;
