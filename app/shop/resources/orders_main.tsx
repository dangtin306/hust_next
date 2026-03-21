"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import { alert_error, alert_success, copy_native } from "@/app/AppContext";
import OrdersVip from "@/app/shop/resources/orders_vip";
import AccountsProduct from "@/app/shop/resources/accounts_product";
import { createOrderTranslator, resolveOrderLang } from "@/app/shop/resources/orders_i18n";

type ServiceInfo = {
  id: string | number;
  accounts_caption: string;
  accounts_description: string;
  accounts_amount: string | number;
  accounts_sold: string | number;
  accounts_price: string | number;
  accounts_seller_id?: string | number;
  shop_caption?: string;
  shop_description?: string;
  shop_phone?: string;
};

type ApiResponse = {
  services?: ServiceInfo;
};

type PurchasedPayload = {
  status?: string | null;
  msg?: string | null;
  trans_id?: string | number | null;
  data?: string[];
  [key: string]: unknown;
};

type OrdersMainProps = {
  slug: string;
  initialServiceInfo?: ServiceInfo | null;
  initialErrorText?: string;
  initialMarket?: string;
};

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const extractServiceId = (value: string) => {
  const decoded = safeDecode(String(value || "").trim());
  const match = decoded.match(/_(\d{3,})$/);
  return match ? match[1] : "";
};

const extractServiceIdFromPathname = (pathname: string) => {
  const parts = String(pathname || "")
    .split("/")
    .filter(Boolean);

  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const candidateId = extractServiceId(parts[i]);
    if (candidateId) return candidateId;
  }

  return "";
};

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const fetchServiceInfo = async (serviceId: string) => {
  const encodedId = encodeURIComponent(serviceId);
  const proxyUrl = `/next/api/resources/services-info?id=${encodedId}`;
  const directUrl = `https://hust.media/api/orders/account/sellers/services/services_info.php?id=${encodedId}`;

  try {
    const proxyRes = await fetch(proxyUrl, { cache: "no-store" });
    if (proxyRes.ok) {
      const proxyData = (await proxyRes.json()) as ApiResponse;
      if (proxyData?.services) return proxyData;
    }
  } catch {
    // Fallback to direct fetch below.
  }

  const directRes = await fetch(directUrl, { cache: "no-store" });
  if (!directRes.ok) throw new Error(`HTTP ${directRes.status}`);
  return (await directRes.json()) as ApiResponse;
};

export default function OrdersMain({
  slug,
  initialServiceInfo = null,
  initialErrorText = "",
  initialMarket = "",
}: OrdersMainProps) {
  const market = useMemo(
    () => resolveOrderLang(initialMarket || readCookie("national_market")),
    [initialMarket]
  );
  const t = useMemo(() => createOrderTranslator(market), [market]);

  const [servicesInfo, setServicesInfo] = useState<ServiceInfo | null>(initialServiceInfo);
  const [accountsProduct, setAccountsProduct] = useState<PurchasedPayload | null>(null);
  const [showVip, setShowVip] = useState(false);
  const [loading, setLoading] = useState(!initialServiceInfo && !initialErrorText);
  const [errorText, setErrorText] = useState(initialErrorText);

  const serviceIdFromSlug = useMemo(() => extractServiceId(slug), [slug]);
  const [serviceId, setServiceId] = useState(serviceIdFromSlug);
  const hasInitialDataForCurrentService = Boolean(
    initialServiceInfo?.id &&
      serviceId &&
      String(initialServiceInfo.id) === String(serviceId)
  );

  useEffect(() => {
    if (serviceIdFromSlug) {
      setServiceId(serviceIdFromSlug);
      return;
    }

    if (typeof window !== "undefined") {
      setServiceId(extractServiceIdFromPathname(window.location.pathname));
    }
  }, [serviceIdFromSlug]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!serviceId) {
        setServicesInfo(null);
        setLoading(false);
        setErrorText(t("msg_product_id_not_found"));
        return;
      }

      if (hasInitialDataForCurrentService) {
        setServicesInfo(initialServiceInfo);
        setErrorText("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorText("");
      setServicesInfo(null);

      try {
        const data = await fetchServiceInfo(serviceId);
        if (!cancelled) {
          if (data?.services) {
            setServicesInfo(data.services);
          } else {
            setErrorText(t("msg_no_product_data", { id: serviceId }));
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(t("msg_failed_fetch_product"));
          alert_error(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [serviceId, hasInitialDataForCurrentService, initialServiceInfo, t]);

  useEffect(() => {
    if (servicesInfo?.accounts_caption) {
      document.title = servicesInfo.accounts_caption;
    }
  }, [servicesInfo]);

  const switchRouter = (link: string) => {
    window.location.assign(link);
  };

  const showOrdersVip = () => {
    const apikey = readCookie("apikey");
    if (!apikey) {
      alert_success(t("msg_login_first"));
      setTimeout(() => {
        switchRouter("/reactapp/");
      }, 1000);
      return;
    }
    setShowVip((prev) => !prev);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center" }} className="mt-4 justify-center items-center">
        <ClipLoader color="#fff" size={150} />
      </div>
    );
  }

  if (!servicesInfo) {
    return (
      <div className="mt-4 text-center text-base font-semibold text-slate-700">
        {errorText || t("msg_unable_load_product")}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 mt-2 sm:p-6">
      <div className="max-w-6xl mx-auto bg-gradient-to-tr from-sky-50 to-white rounded-2xl shadow-md overflow-hidden border border-dashed border-gray-300">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 p-2 sm:p-5">
          <section className="mt-1 col-span-2 order-1 lg:order-none">
            <div className="px-2 sm:px-6 lg:px-8">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                {servicesInfo.accounts_caption}
              </h1>

              <div className="mt-1 sm:mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-purple-400 text-white text-xs sm:text-sm font-semibold">
                  {t("label_stock")}: {servicesInfo.accounts_amount}
                </span>
                <span className="px-2 py-1 rounded-md bg-teal-400 text-white text-xs sm:text-sm font-semibold">
                  {t("label_sold")}: {servicesInfo.accounts_sold}
                </span>
                <span
                  onClick={() => copy_native(String(servicesInfo.id))}
                  className="px-2 py-1 rounded-md bg-orange-400 text-white text-xs sm:text-sm font-semibold cursor-pointer select-none"
                >
                  ID: {servicesInfo.id}
                </span>
              </div>

              <div className="mt-2 sm:mt-3 flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-teal-700">
                    {servicesInfo.accounts_price} coins
                  </div>
                  <div className="mt-1 sm:mt-2 text-gray-600 max-w-2xl text-base sm:text-base">
                    {servicesInfo.accounts_description}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto px-3 py-2 sm:px-5 sm:py-3 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm sm:text-base"
                  >
                    ↩️ Back
                  </button>
                  <button
                    onClick={showOrdersVip}
                    className="w-full sm:w-auto px-3 py-2 sm:px-5 sm:py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold shadow-md text-sm sm:text-base"
                  >
                    🛒 {t("label_receive_now")}
                  </button>
                </div>
              </div>

              {showVip ? (
                <OrdersVip
                  servicesInfo={servicesInfo}
                  market={market}
                  onPurchased={(payload) => setAccountsProduct(payload)}
                />
              ) : null}
              {accountsProduct ? (
                <AccountsProduct accountsProduct={accountsProduct} />
              ) : null}
            </div>
          </section>

          <aside className="col-span-1 flex flex-col items-center order-2 lg:order-none">
            <div className="w-full bg-purple-50 rounded-lg border shadow-sm p-2 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-sm font-bold">
                Hust
              </div>

              <div className="text-sm font-semibold text-gray-800">
                {servicesInfo.shop_caption}
              </div>
              <div className="text-xs mb-1 text-gray-500">
                {servicesInfo.shop_description}
              </div>

              <div className="flex items-center gap-1">
                <div className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold">
                  ⭐ 4.9
                </div>
                <div className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-semibold">
                  {t("label_sold")}: 2.2k
                </div>
              </div>

              <div className="mt-2 w-full flex gap-2">
                <a
                  href={`https://t.me/${servicesInfo.shop_phone || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <button className="w-full py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow text-sm active:scale-95 transition">
                    📩 Chat
                  </button>
                </a>
                <a
                  href={`/shop/accounts/product/play/shop/${servicesInfo.accounts_seller_id || ""}`}
                  className="no-underline text-inherit flex-1 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold shadow text-sm active:scale-95 transition text-center"
                >
                  ℹ️ Info
                </a>
              </div>
            </div>

            {!accountsProduct ? (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-sky-50 rounded-lg px-2 py-0.5 sm:rounded-xl sm:px-5 sm:py-2 border shadow-sm">
                  <h4 className="mt-1 font-semibold text-gray-800 text-sm">
                    {t("label_detail_description")}
                  </h4>
                  <p className="mt-1 text-gray-600 text-xs">
                    {t("text_detail_description")}
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-lg px-2 py-0 sm:rounded-xl sm:px-5 border shadow-sm">
                  <h4 className="mt-1 font-semibold text-gray-800 text-sm">
                    {t("label_shop_info")}
                  </h4>
                  <ul className="mt-1 space-y-1 sm:space-y-2 text-gray-600 text-xs">
                    <li>📍 Vietnam</li>
                    <li>⏱️ 24h</li>
                    <li>🔒 Auto transaction</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
