"use client";

import { useEffect, useState } from "react";

type AdminLink = {
  to?: string;
  text?: string;
};

type AdminStats = {
  users_total?: number;
  orders_total?: number;
  total_nap_sum?: number;
  count_orders_today?: number;
};

type AdminMenuResponse = {
  api_results?: {
    links?: AdminLink[];
    mongo_results?: { links?: AdminLink[] };
  };
};

const MENU_API = "https://node_js.hust.media/main_2/users/admin/data_home";
const STATS_API = "https://hust.media/api/profile/statistic.php";

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const item = document.cookie.split("; ").find((value) => value.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : "";
};

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("en-GB") : "0";

const normalizeLinks = (body: AdminMenuResponse): AdminLink[] => {
  const result = body.api_results?.links || body.api_results?.mongo_results?.links || [];
  return Array.isArray(result) ? result : [];
};

const resolveHref = (value: string) => {
  if (!value.includes("/next/")) return value;
  if (typeof window === "undefined" || !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return value;
  }
  const url = new URL(value, window.location.origin);
  url.protocol = window.location.protocol;
  url.hostname = window.location.hostname;
  url.port = "3003";
  return `${url.pathname}${url.search}${url.hash}`;
};

export default function AdminHomePage() {
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [menuResponse, statsResponse] = await Promise.all([
          fetch(MENU_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apikey: readCookie("apikey") }),
          }),
          fetch(STATS_API),
        ]);
        if (!menuResponse.ok) throw new Error(`Không tải được danh sách quản trị (${menuResponse.status})`);
        const menuBody = (await menuResponse.json()) as AdminMenuResponse;
        setLinks(normalizeLinks(menuBody));
        if (statsResponse.ok) setStats((await statsResponse.json()) as AdminStats);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Không tải được dữ liệu quản trị");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <main className="min-h-[calc(100vh-5rem)] px-3 py-2 text-slate-800 sm:px-5">
      <section className="mx-auto max-w-4xl">
        {stats && (
          <div className="mb-3 rounded-md bg-purple-100/60 p-2 shadow-md">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2">
              <Stat label="👪 Total family members ❤️" value={formatNumber(stats.users_total)} color="purple" />
              <Stat label="👑 Total completed orders 💌" value={`${formatNumber(stats.orders_total)} orders`} color="pink" />
              <Stat label="🎁 Healing coins gifted to users ✨" value={`${formatNumber(stats.total_nap_sum)} coins`} color="purple" />
              <Stat label="🥤 Total orders today ✨" value={`${formatNumber(stats.count_orders_today)} orders`} color="pink" />
            </div>
            <div className="text-center text-xs">updates every 10 minutes</div>
          </div>
        )}

        <div className="rounded-md bg-white p-3 shadow-md">
          {loading ? (
            <p className="text-center text-lg">Please wait a moment 😊 ...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : links.length ? (
            <div className="flex flex-wrap justify-center gap-0.5 text-center">
              {links.map((link, index) => (
                <a
                  key={`${link.to || "admin-link"}-${index}`}
                  href={resolveHref(link.to || "#")}
                  className="flex break-inside bg-white px-4 py-3 text-black no-underline transition hover:bg-slate-50"
                  style={{ border: "2px solid #000", borderRadius: "2rem" }}
                >
                  <span className="m-auto px-1 text-lg">{link.text || "Untitled"}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-red-500">Bạn không phải quản lý app</p>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: "purple" | "pink" }) {
  return (
    <div className="rounded-md border border-purple-300 bg-green-100/50 shadow-md">
      <div className="text-base">
        <div className="ml-2">{label}</div>
        <div className={`ml-2 text-center text-sm ${color === "pink" ? "text-pink-700" : "text-purple-700"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
