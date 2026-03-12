"use client";

import { useSyncExternalStore, useState } from "react";
import NavDown from "./nav_down";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const writeCookie = (name: string, value: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; max-age=${ONE_YEAR_SECONDS}; path=/`;
};

type SimpleTopBarProps = {
  initialHost?: string;
};

const normalizeHost = (host: string) =>
  String(host || "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

const SimpleTopBar = ({ initialHost = "" }: SimpleTopBarProps) => {
  const [domainOverride, setDomainOverride] = useState<string | null>(null);
  const cookieDomain = useSyncExternalStore(
    () => () => {},
    () => readCookie("main_domain") || "hust",
    () => "hust"
  );
  const domain = domainOverride ?? cookieDomain;
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const latestVersion = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("latest-version-updated", handler);
      const timer = window.setInterval(handler, 300);
      return () => {
        window.removeEventListener("latest-version-updated", handler);
        window.clearInterval(timer);
      };
    },
    () => readCookie("latest_version"),
    () => ""
  );
  const showDomainSelect =
    hydrated && typeof window !== "undefined" && window.location.hostname === "localhost";
  const hideNav =
    hydrated && typeof window !== "undefined" && window.location.href.includes("shownav=NO");
  const hasLatestVersion = latestVersion !== "";
  const hideNavControls = latestVersion === "3";
  const initialHostLabel = normalizeHost(initialHost);
  const fallbackDomainLabel =
    initialHostLabel ||
    (domain === "tecom" ? "hust.media" : domain === "hust" ? "hust.media" : domain);

  if (hideNav) return null;

  const handleDomainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setDomainOverride(value);
    writeCookie("main_domain", value);
  };

  const handleMenuToggle = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("legacy-menu-toggle"));
  };

  return (
    <nav className="sticky top-0 z-40 flex flex-wrap items-center justify-between w-full gap-2 border-b border-gray-200 bg-white pl-3 pr-2 py-2 text-sm text-gray-700 shadow-sm md:py-0">

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex h-7 w-7 items-center justify-center rounded bg-pink-200 text-gray-800 hover:bg-pink-400 md:hidden"
          onClick={handleMenuToggle}
        >
          <span className="flex flex-col gap-0.5">
            <span className="h-0.5 w-4 bg-purple-500" />
            <span className="h-0.5 w-4 bg-purple-500" />
            <span className="h-0.5 w-4 bg-purple-500" />
          </span>
        </button>
        {hasLatestVersion && !hideNavControls && (
          <>
            <button
              type="button"
              className="rounded-l bg-pink-200 px-2 py-1 text-xs font-bold text-gray-800 hover:bg-pink-400"
              onClick={() => window.history.back()}
            >
              Prev
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <button
              type="button"
              className="rounded-r bg-pink-200 px-2 py-1 text-xs font-bold text-gray-800 hover:bg-pink-400"
              onClick={() => window.history.forward()}
            >
              Next
            </button>
          </>
        )}
      </div>

      {showDomainSelect ? (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <label htmlFor="domain-select">domain:</label>
          <select
            id="domain-select"
            value={domain}
            onChange={handleDomainChange}
            className="rounded border border-gray-300 bg-white px-1 py-0.5 text-xs"
          >
            <option value="hust">HUST</option>
            <option value="tecom">TECOM</option>
            <option value="nofake">NOFAKE</option>
          </select>
        </div>
      ) : (
        <span className="text-xs text-gray-500" />
      )}

      {hydrated ? (
        <NavDown />
      ) : (
        <span className="rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-3.5 py-1 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/70">
          {fallbackDomainLabel}
        </span>
      )}
    </nav>
  );
};

export default SimpleTopBar;
