import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import TechHome from "./content/tech_home";
import { getTechnicalInsight } from "./tech_api_data";
import OrdersHome from "@/app/shop/ai/content/orders_home";
import { ALLOWED_TOOLS, seoByTool, type ToolKey } from "@/app/shop/ai/orders_data";
import { getOrdersPostMeta } from "@/app/shop/ai/orders_api_data";
import TechMdxArticle, { splitClosingNotes } from "./content/tech_mdx_article";
import { isLocalHostHeader } from "@/src/host_utils";

type PageProps = {
  searchParams: Promise<{ uri?: string | string[] }>;
};

const normalizeLang = (value: string) => (String(value || "").toLowerCase() === "vi" ? "vi" : "en");
const normalizeUri = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : value || "";

const isOrdersTool = (value: string): value is ToolKey => ALLOWED_TOOLS.has(value as ToolKey);

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const uri = normalizeUri(query.uri);
  if (!uri) return {};
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "";
  const categoryProbe = await getOrdersPostMeta(uri, { useCache: !isLocalHostHeader(host) });
  if (categoryProbe.post?.category === "digital_suite" && isOrdersTool(uri)) {
    const cookieStore = await cookies();
    const lang = normalizeLang(cookieStore.get("national_market")?.value || "en");
    const seo = seoByTool[uri][lang];
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      openGraph: { title: seo.title, description: seo.description, type: "website", url: "https://hust.media" },
    };
  }
  const post = await getTechnicalInsight(uri, { useCache: !isLocalHostHeader(host) });

  return {
    title: post?.title || uri,
    description: post?.description || "Technical insights from Hust Media.",
    openGraph: {
      title: post?.title || uri,
      description: post?.description || "Technical insights from Hust Media.",
      type: "article",
      url: "https://hust.media",
    },
  };
}

export default async function TechnicalInsightPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const uri = normalizeUri(query.uri);
  if (!uri) notFound();
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "";
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("national_market")?.value || "en");
  const categoryProbe = await getOrdersPostMeta(uri, { useCache: !isLocalHostHeader(host) });
  if (categoryProbe.post?.category === "digital_suite" && isOrdersTool(uri)) {
    const postsApiData = categoryProbe;
    return (
      <OrdersHome
        slug_1="orders_once"
        slug_2={uri}
        initialPostsApiData={postsApiData}
        initialLang={lang}
        initialToolNote={postsApiData.toolNote}
      />
    );
  }
  const post = await getTechnicalInsight(uri, { useCache: !isLocalHostHeader(host) });

  if (!post) notFound();

  const { mainSource, closingNotes } = splitClosingNotes(post.mdxSource);
  return <TechHome initialPost={post} initialLang={lang} mdxArticle={<TechMdxArticle source={mainSource} />} closingNotes={closingNotes} />;
}
