"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HistoryItem = {
  href: string;
  title: string;
  description: string;
  external?: boolean;
};

const historyItems: HistoryItem[] = [
  {
    href: "/reactapp/nhatkyorders",
    title: "Lịch sử đơn hàng",
    description: "(Tổng hợp lịch sử đơn hàng mua ở {hostname})",
  },
  {
    href: "/shop/accounts/product/accounts_history?app=showadview",
    title: "Lịch sử tài nguyên MMO",
    description: "(Xem lịch sử kiếm tài nguyên MMO)",
  },
  {
    href: "/reactapp/cash_diary?webappmode=showadview",
    title: "Nhật ký duyệt Coins",
    description: "(Xem lịch sử tăng Coins)",
  },
  {
    href: "/ai/history/home",
    title: "Nhật ký dịch vụ ai",
    description: "(Nhật ký sử dụng trí tuệ nhân tạo {hostname})",
  },
  {
    href: "/shop/creative/history_create?app=showadview",
    title: "Lịch sử link sáng tạo",
    description: "(Xem lịch sử tạo link sáng tạo)",
  },
  {
    href: "https://t.me/freefltiktok",
    title: "Thông báo của app",
    description: "(Những thông báo hệ thống và tính năng mới của app)",
    external: true,
  },
  {
    href: "/shop/doithe/history",
    title: "Nhật ký đổi thẻ cào",
    description: "(Xem lịch sử đổi thẻ cào trong {hostname})",
  },
  {
    href: "/shop/transaction?app=showadview",
    title: "Lịch sử chuyển coin",
    description: "(Xem lịch sử số điểm chuyển sang tài khoản khác trong {hostname})",
  },
  {
    href: "/reactapp/checkvar?webappmode=showadview&apikey={apikey}",
    title: "Check Var Phạt nguội",
    description: "(Xem lịch sử phạt nguội do vi phạm)",
  },
  {
    href: "/shop/ads/history",
    title: "Nhật ký quảng cáo",
    description: "(Xem lịch sử quảng cáo shop)",
  },
  {
    href: "/reactapp/historybuylink?app=showadview",
    title: "Nhật ký mua link",
    description: "(Xem lại lịch sử mua link trong {hostname})",
  },
];

const getCookie = (name: string) => {
  if (typeof document === "undefined") return "";

  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return value ? decodeURIComponent(value.split("=").slice(1).join("=")) : "";
};

function HistoryCard({
  item,
  hostname,
  apiKey,
}: {
  item: HistoryItem;
  hostname: string;
  apiKey: string;
}) {
  const description = item.description.replace("{hostname}", hostname);
  const href = item.href.replace("{apikey}", apiKey);

  const card = (
    <div className="group relative min-w-0">
      <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-25 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
      <div className="relative block rounded-2xl bg-gradient-to-r from-blue-100 to-pink-200 px-3 py-1 leading-none ring-1 ring-gray-900/5 transition hover:from-pink-400 hover:to-yellow-300">
        <div className="mb-3 mt-1 space-y-1">
          <div className="text-lg font-bold text-pink-400">{item.title}</div>
          <div className="text-indigo-400 transition group-hover:text-slate-800">
            {description}
          </div>
        </div>
        <span className="absolute inset-x-0 bottom-0 h-2 rounded-2xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600" />
      </div>
    </div>
  );

  return (
    <Link
      href={href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
    >
      {card}
    </Link>
  );
}

export default function HistoryMenuHome() {
  const [hostname, setHostname] = useState("localhost");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHostname(window.location.hostname);
      const currentApiKey = getCookie("apikey");
      setApiKey(currentApiKey);
      setHasApiKey(Boolean(currentApiKey));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="row fixrow min-h-full">
      <div className="h-16" aria-hidden="true" />

      {!hasApiKey && (
        <div
          className="relative mx-1 mb-5 flex items-start gap-3 overflow-hidden rounded-2xl border border-pink-200 bg-pink-100 p-4 text-pink-800 shadow-lg dark:bg-gray-800 dark:text-pink-300 md:mx-auto md:max-w-5xl"
          role="alert"
        >
          <div className="absolute bottom-1 left-2 text-lg animate-bounce">✨</div>
          <div className="absolute bottom-1 right-2 text-lg animate-pulse">🌸</div>
          <div className="mt-1 text-3xl animate-[bounce_1.5s_infinite]">📘</div>
          <div className="leading-snug">
            <div className="text-2xl font-bold">Activity Log Preview</div>
            <div className="mt-1 text-xl">
              This is preview of how your activity history will appear. 💖✨
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-5xl">
        <div className="mt-3 mx-1 grid grid-cols-1">
          <div className="rounded-md bg-green-200/70 p-1 shadow-md">
            <div className="mt-1 flex flex-wrap">
              {historyItems.map((item) => (
                <div
                  key={item.href}
                  className="mb-1 w-1/2 p-1 md:w-1/3"
                >
                  <HistoryCard
                    item={item}
                    hostname={hostname}
                    apiKey={apiKey}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
