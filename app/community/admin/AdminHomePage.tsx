"use client";

import { useCallback, useEffect, useState } from "react";

type AdminLink = {
  to?: string;
  text?: string;
  level_manage?: number;
};

type AdminService = {
  service_name?: string;
  service_code?: string;
  to?: string;
  level_manage?: number;
  children?: AdminService[];
};

type AdminCategory = {
  category_name?: string;
  category_code?: string;
  links?: AdminLink[];
  services?: AdminService[];
};

type AdminStats = {
  users_total?: number;
  orders_total?: number;
  total_nap_sum?: number;
  count_orders_today?: number;
};

type AdminMenuResponse = {
  category_name?: string;
  category_code?: string;
  links?: Array<AdminLink | AdminCategory>;
  services?: AdminService[];
  api_results?: {
    category_name?: string;
    category_code?: string;
    links?: Array<AdminLink | AdminCategory>;
    services?: AdminService[];
    mongo_results?: { links?: AdminLink[] };
    categories?: AdminCategory[];
  };
  categories?: AdminCategory[];
};

const MENU_API = "https://node_js.hust.media/main_2/users/admin/data_home";
const STATS_API = "https://hust.media/api/profile/statistic.php";
const HOME_CACHE_KEY = "hust_admin_home_cache";
const HOME_CACHE_TTL = 24 * 60 * 60 * 1000;

type AdminHomeCache = {
  cachedAt: number;
  categories: AdminCategory[];
  stats: AdminStats | null;
};

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const item = document.cookie.split("; ").find((value) => value.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : "";
};

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("en-GB") : "0";

const servicesToLinks = (services: AdminService[] = []): AdminLink[] =>
  services.flatMap((service) => {
    const currentLink = service.to
      ? [{
          to: service.to,
          text: service.service_name || service.service_code,
          level_manage: service.level_manage,
        }]
      : [];
    return [...currentLink, ...servicesToLinks(service.children || [])];
  });

const normalizeCategory = (category: AdminCategory): AdminCategory => ({
  ...category,
  links: Array.isArray(category.links)
    ? category.links
    : servicesToLinks(category.services || []),
});

const isCategory = (item: AdminLink | AdminCategory): item is AdminCategory =>
  "category_name" in item || "category_code" in item || "services" in item;

const normalizeCategoryList = (items?: Array<AdminLink | AdminCategory>) => {
  if (!Array.isArray(items) || !items.length || !items.every(isCategory)) return null;
  return items.map(normalizeCategory);
};

const normalizeCategories = (body: AdminMenuResponse): AdminCategory[] => {
  if (Array.isArray(body.categories)) return body.categories.map(normalizeCategory);
  const topLevelCategories = normalizeCategoryList(body.links);
  if (topLevelCategories) return topLevelCategories;
  if (body.category_name || body.category_code || Array.isArray(body.services)) {
    return [normalizeCategory({
      category_name: body.category_name,
      category_code: body.category_code,
      links: body.links as AdminLink[] | undefined,
      services: body.services,
    })];
  }

  const apiResults = body.api_results;
  if (Array.isArray(apiResults?.categories)) return apiResults.categories.map(normalizeCategory);
  if (apiResults?.category_name || apiResults?.category_code) {
    const linkedCategories = normalizeCategoryList(apiResults.links);
    if (linkedCategories) return linkedCategories;
    return [normalizeCategory({
      category_name: apiResults.category_name,
      category_code: apiResults.category_code,
      links: apiResults.links as AdminLink[] | undefined,
      services: apiResults.services,
    })];
  }
  const legacyLinks = apiResults?.links || apiResults?.mongo_results?.links || [];
  const linkedCategories = normalizeCategoryList(legacyLinks);
  if (linkedCategories) return linkedCategories;
  if (legacyLinks.length && legacyLinks.every((item) => "links" in item && !("text" in item) && !("to" in item))) {
    return legacyLinks as unknown as AdminCategory[];
  }
  return legacyLinks.length
    ? [{
        category_name: "Quản trị hệ thống",
        category_code: "admin",
        links: legacyLinks as AdminLink[],
      }]
    : [];
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
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (force = false) => {
    const cacheKey = `${HOME_CACHE_KEY}_${readCookie("apikey") || "guest"}`;

    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || "null") as AdminHomeCache | null;
        if (
          cached &&
          Date.now() - cached.cachedAt < HOME_CACHE_TTL &&
          Array.isArray(cached.categories)
        ) {
          setCategories(cached.categories);
          setStats(cached.stats || null);
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    setLoading(true);
    setError("");
    if (force) setReloading(true);

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
      const nextCategories = normalizeCategories(menuBody);
      const nextStats = statsResponse.ok ? ((await statsResponse.json()) as AdminStats) : null;
      setCategories(nextCategories);
      setStats(nextStats);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          cachedAt: Date.now(),
          categories: nextCategories,
          stats: nextStats,
        } satisfies AdminHomeCache));
      } catch {
        // Ignore storage quota/private mode errors; the page still works from the API response.
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không tải được dữ liệu quản trị");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="min-h-[calc(100vh-5rem)] px-3 py-2 text-slate-800 sm:px-5">
      <section className="mx-auto max-w-6xl">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md sm:p-6">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={loading || reloading}
              className="rounded-lg bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {reloading ? "Reloading..." : "Reload"}
            </button>
          </div>
          {loading ? (
            <p className="text-center text-lg">Please wait a moment 😊 ...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : categories.length ? (
            <div className="space-y-6">
              {categories.map((category, categoryIndex) => (
                <section key={`${category.category_code || "category"}-${categoryIndex}`}>
                  <button
                    type="button"
                    onClick={() => setOpenCategory((current) => current === categoryIndex ? null : categoryIndex)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    aria-expanded={openCategory === categoryIndex}
                  >
                    <span className="h-7 w-1 rounded-full bg-blue-500" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                        {category.category_name || "Quản trị hệ thống"}
                      </h2>
                      {category.category_code && (
                        <p className="text-xs text-slate-400">{category.category_code}</p>
                      )}
                    </div>
                    <span className={`text-xl text-slate-400 transition-transform ${openCategory === categoryIndex ? "rotate-180" : ""}`} aria-hidden="true">
                     ⌄
                    </span>
                  </button>
                  {openCategory === categoryIndex && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {category.services?.length ? (
                        <ServiceList services={category.services} />
                      ) : (
                        (category.links || []).map((link, linkIndex) => (
                          <a
                            key={`${link.to || "admin-link"}-${linkIndex}`}
                            href={resolveHref(link.to || "#")}
                            className="group flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                          >
                            <span className="text-left text-sm font-medium leading-5 sm:text-base">
                              {link.text || "Untitled"}
                            </span>
                            <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400 transition group-hover:text-blue-500">
                              {typeof link.level_manage === "number" && `L${link.level_manage}`}
                              <span className="text-lg" aria-hidden="true">→</span>
                            </span>
                          </a>
                        ))
                      )}
                    </div>
                  )}
                </section>
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

function ServiceList({ services }: { services: AdminService[] }) {
  const [openServices, setOpenServices] = useState<Record<number, boolean>>({});

  return (
    <>
      {services.map((service, serviceIndex) => {
        const children = service.children || [];
        const hasChildren = children.length > 0;
        const isOpen = openServices[serviceIndex] === true;
        const label = service.service_name || service.service_code || "Untitled";

        return (
          <div key={`${service.service_code || label}-${serviceIndex}`} className="space-y-3">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setOpenServices((current) => ({ ...current, [serviceIndex]: !isOpen }))}
                className="group flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium leading-5 sm:text-base">{label}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400 transition group-hover:text-blue-500">
                  {typeof service.level_manage === "number" && `L${service.level_manage}`}
                  <span className={`text-lg transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
                </span>
              </button>
            ) : (
              <a
                href={resolveHref(service.to || "#")}
                className="group flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <span className="text-left text-sm font-medium leading-5 sm:text-base">{label}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400 transition group-hover:text-blue-500">
                  {typeof service.level_manage === "number" && `L${service.level_manage}`}
                  <span className="text-lg" aria-hidden="true">→</span>
                </span>
              </a>
            )}
            {hasChildren && isOpen && (
              <div className="ml-4 grid grid-cols-1 gap-3 border-l-2 border-blue-100 pl-3 sm:ml-6 sm:grid-cols-2">
                <ServiceList services={children} />
              </div>
            )}
          </div>
        );
      })}
    </>
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
