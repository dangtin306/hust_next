import OrdersHome from "@/app/shop/ai/orders_home";
import { getOrdersPostMeta } from "@/app/shop/ai/orders_api_data";
import { headers } from "next/headers";

const isLocalDevHost = (rawHost: string) => {
  const host = String(rawHost || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  return (
    /^localhost(?::\d+)?$/.test(host) ||
    /^127(?:\.\d{1,3}){3}(?::\d+)?$/.test(host) ||
    /^\[?::1\]?(?::\d+)?$/.test(host)
  );
};

export default async function TranslateViEnPage() {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "";
  const shouldUseCache = !isLocalDevHost(host);
  const initialPostsApiData = await getOrdersPostMeta("translate_vi_en", {
    useCache: shouldUseCache,
  });
  return (
    <OrdersHome
      slug_1="orders_once"
      slug_2="translate_vi_en"
      initialPostsApiData={initialPostsApiData}
    />
  );
}
