import type { Metadata } from "next";
import OrdersHome from "@/app/shop/ai/orders_home";
import { getOrdersPostMeta } from "@/app/shop/ai/orders_api_data";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { seoByTool } from "@/app/shop/ai/orders_data";

type PageProps = {
  params: Promise<{ slug_2: string }>;
};

const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text", "translate_vi_en"]);
const normalizeLang = (value: string) =>
  String(value || "").toLowerCase() === "vi" ? "vi" : "en";
const isLocalHost = (host: string) => {
  const value = String(host || "").toLowerCase();
  return value.includes("localhost") || value.includes("127.0.0.1") || value.includes("::1");
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug_2 } = await params;
  if (!ALLOWED_TOOLS.has(slug_2)) return {};

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

export default async function OrdersOnceToolPage({ params }: PageProps) {
  const { slug_2 } = await params;
  if (!ALLOWED_TOOLS.has(slug_2)) {
    notFound();
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "";
  const cookieStore = await cookies();
  const initialLang = normalizeLang(cookieStore.get("national_market")?.value || "en");
  const initialPostsApiData = await getOrdersPostMeta(slug_2, { useCache: !isLocalHost(host) });

  return (
    <OrdersHome
      slug_1="orders_once"
      slug_2={slug_2}
      initialPostsApiData={initialPostsApiData}
      initialLang={initialLang}
    />
  );
}
