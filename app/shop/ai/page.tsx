import type { Metadata } from "next";
import OrdersHome from "@/app/shop/ai/orders_home";
import { getOrdersPostMeta } from "@/app/shop/ai/orders_api_data";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { seoByTool } from "./orders_data";

type PageProps = {
  searchParams: Promise<{ slug_2?: string | string[] }>;
};

const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text", "translate_vi_en"]);

const normalizeSlug2 = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

const normalizeLang = (value: string) =>
  String(value || "").toLowerCase() === "vi" ? "vi" : "en";

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

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const slug_2 = normalizeSlug2(query.slug_2);

  if (!ALLOWED_TOOLS.has(slug_2)) {
    return {};
  }

  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("national_market")?.value || "en");
  const seo = seoByTool[slug_2 as keyof typeof seoByTool][lang];

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: "https://hust.media",
      images: ["https://hust.media/reactapp/hustmedia.ico"],
    },
  };
}

export default async function ShopAiPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const slug_2 = normalizeSlug2(query.slug_2);

  if (!ALLOWED_TOOLS.has(slug_2)) {
    notFound();
  }

  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "";
  const shouldUseCache = !isLocalDevHost(host);

  const initialPostsApiData = await getOrdersPostMeta(slug_2, {
    useCache: shouldUseCache,
  });

  return (
    <OrdersHome
      slug_1="orders_once"
      slug_2={slug_2}
      initialPostsApiData={initialPostsApiData}
    />
  );
}
