"use client";

import { useEffect, useMemo, useState } from "react";
import { alert_error, alert_success } from "@/app/AppContext";
import { createOrderTranslator, resolveOrderLang } from "@/app/shop/resources/orders_i18n";

type ServicesInfo = {
  id: string | number;
  accounts_price: string | number;
};

type PurchasedPayload = {
  status?: string;
  msg?: string;
  trans_id?: string | number;
  data?: string[];
  error?: string;
  redirect?: string;
  [key: string]: unknown;
};

type OrdersVipProps = {
  servicesInfo: ServicesInfo;
  market?: string;
  onPurchased: (payload: PurchasedPayload) => void;
};

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function OrdersVip({ servicesInfo, market = "", onPurchased }: OrdersVipProps) {
  const resolvedLang = useMemo(
    () => resolveOrderLang(market || readCookie("national_market")),
    [market]
  );
  const t = useMemo(() => createOrderTranslator(resolvedLang), [resolvedLang]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState("Get Now");
  const [amountOrders, setAmountOrders] = useState("1");
  const [commentsOrders, setCommentsOrders] = useState("");
  const [discountOrders, setDiscountOrders] = useState(0);

  const moneyOrders = useMemo(() => {
    const amount = Math.max(0, toNumber(amountOrders, 1));
    const rate = Math.max(0, toNumber(servicesInfo.accounts_price));
    const discount = Math.max(0, discountOrders);
    const discounted = rate * amount - (rate * amount * discount) / 100;
    return Math.max(0, Math.round(discounted));
  }, [amountOrders, servicesInfo.accounts_price, discountOrders]);

  useEffect(() => {
    const apikey = readCookie("apikey");
    if (!apikey) return;

    fetch(`https://hust.media/api/wallet/laychietkhau.php?apikey=${encodeURIComponent(apikey)}`)
      .then((response) => response.json())
      .then((discount) => setDiscountOrders(toNumber(discount)))
      .catch(() => {
        setDiscountOrders(0);
      });
  }, []);

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (isSubmitting) return;

    const apikey = readCookie("apikey");
    const nationalMarket = readCookie("national_market");

    if (!apikey) {
      alert_success(t("msg_login_first"));
      setTimeout(() => {
        window.location.assign("/reactapp/");
      }, 1000);
      return;
    }

    if (!servicesInfo?.id) {
      alert_error(t("msg_missing_information"));
      setButtonText("Missing information");
      return;
    }

    setIsSubmitting(true);
    setButtonText("Give us a moment 😊");

    const payload: Record<string, unknown> = {
      action: "buyProduct",
      key: apikey,
      quantity: Math.max(1, Math.floor(toNumber(amountOrders, 1))),
      national_market: nationalMarket,
      service: servicesInfo.id,
    };

    if (commentsOrders.trim()) {
      payload.comments = commentsOrders.trim();
    }

    try {
      const response = await fetch("https://hust.media/api/v3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const info = (await response.json()) as PurchasedPayload;
      const orderId = info?.trans_id;
      const apiError = typeof info?.error === "string" ? info.error : "";

      if (apiError) {
        alert_error(apiError);
        setButtonText("Please try again");
      } else if (orderId) {
        alert_success(t("msg_thank_you_supporter", { id: orderId }));
        onPurchased(info);
        setButtonText("Place another order");
      } else {
        alert_error(t("msg_unknown_error"));
        setButtonText("Please try again");
      }

      if (typeof info?.redirect === "string" && info.redirect) {
        setTimeout(() => {
          window.location.assign(info.redirect as string);
        }, 1700);
      }
    } catch (error) {
      alert_error(error instanceof Error ? error.message : String(error));
      setButtonText("Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="mt-3 flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="flex w-full flex-col gap-1">
          <div className="text-sm font-medium text-gray-700">{t("label_quantity")}</div>
          <div className="w-full">
            <input
              onChange={(e) => setAmountOrders(e.target.value)}
              value={amountOrders}
              type="number"
              min={1}
              inputMode="numeric"
              className="mb-0 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder={t("ph_quantity")}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-1">
          <div className="text-sm font-medium text-gray-700">{t("label_note")}</div>
          <div className="w-full">
            <input
              onChange={(e) => setCommentsOrders(e.target.value)}
              value={commentsOrders}
              type="text"
              className="mb-0 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder={t("ph_note_optional")}
            />
          </div>
        </div>

        <div className="flex w-full">
          <button
            disabled={isSubmitting}
            type="submit"
            className="flex w-full items-center justify-center bg-purple-400 hover:bg-purple-300 rounded-3xl py-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : null}
            <span className="text-base font-medium text-white">{buttonText}</span>
            <div className="text-xl ml-2">➤</div>
          </button>
        </div>
      </form>

      <div className="relative mt-2 p-2 rounded-md border-2 border-pink-500 bg-white">
        <div className="text-xs lg:text-base">🌟 Total: {moneyOrders} coins</div>
        <div className="text-xs lg:text-base">🏷️ Quantity: {amountOrders}</div>
        <div className="text-xs lg:text-base">
          🎁 Discount: {discountOrders}% <span className="ml-1">➔</span>{" "}
          <span className="text-gray-600">You will receive one free offer for your next order.</span>
        </div>
      </div>
    </>
  );
}
