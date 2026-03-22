"use client";

import { useEffect, useState } from "react";
import NationalMarketUI from "../../../../react_app/src/community/process/national_ui.jsx";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const writeCookie = (name: string, value: string, maxAgeSeconds = ONE_YEAR_SECONDS) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/`;
};

export default function ConvertNationalMarketPage() {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processPage = () => {
    const redirectUri = readCookie("national_uri_change") || "/reactapp/";
    window.location.href = redirectUri;
  };

  useEffect(() => {
    const saved = readCookie("national_market");
    const apikey = readCookie("apikey");

    if (saved) {
      setSelectedChoice(saved);
      return;
    }

    if (!apikey) return;

    const fetchMarket = async () => {
      try {
        const url = `https://hust.media/api/profile/national_market.php?apikey=${apikey}&service_national=get`;
        const response = await fetch(url);
        const data = (await response.json()) as {
          status?: string | number;
          national_market?: string;
          message?: string;
        };

        if (String(data?.status) === "1" && data.national_market) {
          writeCookie("national_market", data.national_market);
          processPage();
        } else if (data?.message) {
          window.alert(data.message);
        }
      } catch {
        window.alert("Error fetching national market");
      }
    };

    fetchMarket();
  }, []);

  const confirmChoice = async () => {
    if (!selectedChoice) return;
    setLoading(true);

    try {
      const apikey = readCookie("apikey");

      if (!apikey) {
        writeCookie("national_market", selectedChoice);
        processPage();
        return;
      }

      const url = `https://hust.media/api/profile/national_market.php?apikey=${apikey}&service_national=change&national_market=${selectedChoice}`;
      const response = await fetch(url);
      const data = (await response.json()) as { status?: string | number; message?: string };

      if (String(data?.status) === "1") {
        writeCookie("national_market", selectedChoice);
        processPage();
      } else if (data?.message) {
        window.alert(data.message);
      }
    } catch {
      window.alert("Error changing national market");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NationalMarketUI
      selected={selectedChoice}
      loading={loading}
      onSelect={setSelectedChoice}
      onConfirm={confirmChoice}
    />
  );
}
