import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import TechHome from "./content/tech_home";
import { getTechnicalInsight } from "./tech_api_data";
import { isLocalHostHeader } from "@/src/host_utils";

type PageProps = {
  searchParams: Promise<{ uri?: string | string[] }>;
};

const normalizeLang = (value: string) => (String(value || "").toLowerCase() === "vi" ? "vi" : "en");
const normalizeUri = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : value || "";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const uri = normalizeUri(query.uri);
  if (!uri) return {};
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "";
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
  const post = await getTechnicalInsight(uri, { useCache: !isLocalHostHeader(host) });

  if (!post) notFound();

  return <TechHome initialPost={post} initialLang={lang} />;
}
