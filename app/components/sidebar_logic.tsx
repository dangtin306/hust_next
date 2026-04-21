"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { SlHome } from "react-icons/sl";
import { FaClock } from "react-icons/fa";

type MenuLabel = string | Record<string, string>;

export type MenuItem = {
  label?: MenuLabel;
  url_redirect?: string;
  url_mode?: string;
  iconType?: string;
  icon_src?: string;
  latest_version?: Array<number | string>;
  data?: MenuItem[];
};

type SidebarLogicProps = {
  items: MenuItem[];
  lang: string;
  setIsOpen: (value: boolean) => void;
};

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const pickLabel = (label: MenuLabel | undefined, lang: string) => {
  if (!label) return "";
  if (typeof label === "string") return label;
  const safeLang = lang === "vi" || lang === "en" ? lang : "en";
  return label[safeLang] || label.en || label.vi || "";
};

const normalizeNextHref = (href: string) => {
  return href.startsWith("/next/") ? href.slice("/next".length) : href;
};

const SidebarLogic = ({ items, lang, setIsOpen }: SidebarLogicProps) => {
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const latestVersionRaw = readCookie("latest_version");
  const latestVersionNumber = Number(latestVersionRaw);
  const hasLatestVersion = latestVersionRaw !== "";

  const toggleKey = (key: string) => {
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

  const matchesLatestVersion = (item: MenuItem) => {
    if (!Array.isArray(item.latest_version)) return true;
    if (!hasLatestVersion) return false;
    return item.latest_version.some((version) => {
      if (String(version) === latestVersionRaw) return true;
      if (Number.isNaN(latestVersionNumber)) return false;
      return Number(version) === latestVersionNumber;
    });
  };

  const renderItems = (list: MenuItem[], parentKey = "") => {
    const visibleItems = list.filter(matchesLatestVersion);

    return visibleItems.map((item, idx) => {
      const key = parentKey === "" ? `${idx}` : `${parentKey}-${idx}`;
      const childItems = Array.isArray(item.data) ? item.data.filter(matchesLatestVersion) : [];
      const hasChildren = childItems.length > 0;
      const isOpen = openKeys.has(key);
      const isSelected = selectedKey === key;

      const rowClassName =
        `w-full flex items-center justify-between py-1.5 px-4 text-slate-900 visited:text-slate-900 no-underline ` +
        `${isOpen || isSelected ? "bg-pink-100/50 border-l-2 border-pink-400 " : "bg-gray-100/50 "}` +
        `hover:bg-pink-100/60 ` +
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
            <span className="h-5 w-5 mr-2 flex items-center justify-center">{item.icon_src}</span>
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
              {isOpen ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
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

          {hasChildren && isOpen ? <div className="pl-2">{renderItems(childItems, key)}</div> : null}
        </div>
      );
    });
  };

  return <div className="flex flex-col">{renderItems(items)}</div>;
};

export default SidebarLogic;
