"use client";

import NavDownUI from "../../../react_app/src/app_structure/app_fontend/nav_down_ui.jsx";
import CountryFlagsUI from "../../../react_app/src/app_structure/app_fontend/country_flags_ui.jsx";

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

const writeCookie = (name: string, value: string, maxAgeSeconds?: number) => {
  if (typeof document === "undefined") return;
  const maxAgePart = typeof maxAgeSeconds === "number" ? `; max-age=${maxAgeSeconds}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${maxAgePart}`;
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

const NavDown = () => {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const displayHostname = hostname.includes("tecom.pro") ? "hust.media" : hostname;
  const marketCode = String(readCookie("national_market") || "").toLowerCase();
  const lang = marketCode === "en" ? "en" : "vi";
  const setNationalUriChangeCookie = (uri: string) => {
    writeCookie("national_uri_change", uri, 600);
  };

  const changeNational = async () => {
    const currentUri = `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
    setNationalUriChangeCookie(currentUri);
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
    <NavDownUI
      displayHostname={displayHostname}
      homeText={translations[lang].home}
      regionText={translations[lang].region}
      homeHref="/reactapp/"
      onRegionClick={changeNational}
      regionFlag={<CountryFlagsUI marketCode={marketCode} fallbackCode="vi" />}
    />
  );
};

export default NavDown;
