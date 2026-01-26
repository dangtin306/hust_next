"use client";

import { useEffect, useState } from "react";

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

const SimpleTopBar = () => {
  const [hostname, setHostname] = useState("");
  const [domain, setDomain] = useState("hust");
  const [showDomainSelect, setShowDomainSelect] = useState(false);
  const [hideNav, setHideNav] = useState(false);
  const [hideNavControls, setHideNavControls] = useState(true);
  const [latestVersion, setLatestVersion] = useState(() => readCookie("latest_version"));

  useEffect(() => {
    const host = window.location.hostname;
    setHostname(host === "tecom.pro" ? "hust.media" : host);
    setShowDomainSelect(host === "localhost");
    setHideNav(window.location.href.includes("shownav=NO"));
    setLatestVersion(readCookie("latest_version"));

    const cookieDomain = readCookie("main_domain");
    if (cookieDomain) setDomain(cookieDomain);

    const cookieLatestVersion = readCookie("latest_version");
    if (cookieLatestVersion === "1") {
      setHideNavControls(false);
    }
  }, []);

  if (hideNav) return null;

  const handleDomainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setDomain(value);
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
        {!hideNavControls && (
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
          </select>
        </div>
      ) : (
        <span className="text-xs text-gray-500" />
      )}

      <a
        href="/"
        className="rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-3.5 py-1 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/70 hover:shadow hover:ring-slate-300"
      >
        {hostname}
      </a>
    </nav>
  );
};

export default SimpleTopBar;
