"use client";

import { useEffect, useMemo, useState } from "react";

type MarketItem = {
  id: number;
  market: "en" | "vi";
  name: string;
  description: string;
  confirmText: string;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const marketData: MarketItem[] = [
  {
    id: 1,
    market: "en",
    name: "Choice for international",
    description: "Global user friendly interface",
    confirmText: "✔️ Click to Confirm",
  },
  {
    id: 2,
    market: "vi",
    name: "Thị trường Việt Nam",
    description: "Xây dựng phù hợp cho người dùng Việt Nam",
    confirmText: "✔️ Xác nhận",
  },
];

const countryFlags: Record<"en" | "vi", { emoji: string; label: string }> = {
  en: { emoji: "🇺🇸", label: "United States" },
  vi: { emoji: "🇻🇳", label: "Vietnam" },
};

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

type MarketOptionProps = {
  item: MarketItem;
  selectedChoice: string | null;
  onSelect: (value: "en" | "vi") => void;
};

function MarketOption({ item, selectedChoice, onSelect }: MarketOptionProps) {
  const flag = countryFlags[item.market];
  const selected = selectedChoice === item.market;

  return (
    <div className="flex-1 flex flex-col items-start">
      <button
        type="button"
        onClick={() => onSelect(item.market)}
        className={`w-full flex items-center gap-2 px-4 py-2 rounded border-2 font-bold transition-colors duration-200 ${
          selected
            ? "border-black text-black bg-green-200"
            : "border-black text-black bg-white hover:bg-gray-100"
        }`}
      >
        {selected ? <span className="text-2xl leading-none">✓</span> : null}
        <span>{item.name}</span>
        <span role="img" aria-label={flag.label} className="text-lg leading-none">
          {flag.emoji}
        </span>
      </button>
      <p className="mt-1 text-sm text-gray-700">{item.description}</p>
    </div>
  );
}

export default function ConvertNationalMarketPage() {
  const [selectedChoice, setSelectedChoice] = useState<"en" | "vi" | null>(null);
  const [loading, setLoading] = useState(false);

  const processPage = () => {
    window.location.href = "/reactapp/";
  };

  useEffect(() => {
    const saved = readCookie("national_market");
    const apikey = readCookie("apikey");

    if (saved === "en" || saved === "vi") {
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

        if (String(data?.status) === "1" && (data.national_market === "en" || data.national_market === "vi")) {
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

  const selectedConfig = useMemo(
    () => marketData.find((item) => item.market === selectedChoice),
    [selectedChoice]
  );

  return (
    <div className="flex items-center justify-center py-8 px-3">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Select region (Chọn thị trường)</h2>

        <div className="flex flex-col sm:flex-row w-full sm:space-x-6 space-y-4 sm:space-y-0">
          {marketData.map((item) => (
            <MarketOption
              key={item.id}
              item={item}
              selectedChoice={selectedChoice}
              onSelect={setSelectedChoice}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={confirmChoice}
          disabled={!selectedChoice || loading}
          className={`mt-3 flex w-full bg-purple-400 hover:bg-purple-300 rounded-3xl px-8 py-2 mb-3 transition-colors duration-200 ${
            !selectedChoice || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex items-center justify-between flex-1">
            {loading ? <div className="spinner-border" role="status" /> : null}
            <span className="text-lg font-medium text-white">
              {selectedConfig?.confirmText || "Confirm"}
            </span>
            <div className="text-xl">{"\u27A4"}</div>
          </div>
        </button>
      </div>
    </div>
  );
}
